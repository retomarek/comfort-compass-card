import { html, LitElement } from 'lit';
import { localize } from './localize/localize.js';
import { DEFAULT_BANDS } from './bands.js';
import { DEFAULT_COMFORT_ZONE } from './card.js';
import { MAX_DAYS } from './statistics.js';

// Visual editor on Home Assistant's <ha-form>. The form data is flat, the
// YAML config nested; configToData / dataToConfig translate between them.
// Only values that differ from the defaults are written, to keep YAML short.

const DEFAULTS = {
    days_to_show: 30,
    altitude: 450,       // only a suggestion when the user switches to altitude
    pressure: 101325,    // the card's default when neither pressure nor altitude is set
};

// Keys this form owns. Everything else in the existing config (grid_options,
// visibility, view_layout, card_mod, YAML-only options) is kept as it is.
// `header` and `days` are the pre-1.0 names of title / days_to_show: read,
// then replaced by the new names.
const OWNED_KEYS = [
    'type', 'temperature_entity', 'humidity_entity', 'title', 'header', 'days_to_show', 'days',
    'altitude', 'pressure', 'comfort_zone', 'warning_bands', 'show_labels', 'show_legend', 'scale',
];

const given = (v) => v !== undefined && v !== null && v !== '';
const isNum = (v) => given(v) && typeof v !== 'boolean' && Number.isFinite(Number(v));
// First argument that is a number, as a number (cleared fields fall back).
const firstNum = (...vals) => {
    const v = vals.find(isNum);
    return v === undefined ? undefined : Number(v);
};
const pairAt = (p, i) => (Array.isArray(p) ? p[i] : undefined);

function configToData(c = {}) {
    // No comfort_zone at all → the defaults; a given zone is shown as it is
    // (an absolute_humidity it does not have stays empty: no limit).
    const cz = c.comfort_zone && typeof c.comfort_zone === 'object' ? c.comfort_zone : DEFAULT_COMFORT_ZONE;
    const wb = typeof c.warning_bands === 'object' && c.warning_bands ? c.warning_bands : {};
    const band = (k, f, d) => firstNum(wb[k]?.[f], DEFAULT_BANDS[k][d]);
    const zone = (key, i) => firstNum(pairAt(cz[key], i), cz === DEFAULT_COMFORT_ZONE || key !== 'absolute_humidity'
        ? DEFAULT_COMFORT_ZONE[key][i] : undefined);
    return {
        title: (given(c.title) ? c.title : c.header) ?? '',
        temperature_entity: c.temperature_entity ?? '',
        humidity_entity: c.humidity_entity ?? '',
        days_to_show: firstNum(c.days_to_show, c.days, DEFAULTS.days_to_show),
        air_mode: given(c.altitude) ? 'altitude' : 'pressure',
        altitude: firstNum(c.altitude, DEFAULTS.altitude),
        pressure: firstNum(c.pressure, DEFAULTS.pressure),
        comfort_t_min: zone('temperature', 0),
        comfort_t_max: zone('temperature', 1),
        comfort_phi_min: zone('humidity', 0),
        comfort_phi_max: zone('humidity', 1),
        comfort_x_min: zone('absolute_humidity', 0),
        comfort_x_max: zone('absolute_humidity', 1),
        orange_dt: band('orange', 'temperature', 'dt'),
        orange_dphi: band('orange', 'humidity', 'dphi'),
        orange_dx: band('orange', 'absolute_humidity', 'dx'),
        red_dt: band('red', 'temperature', 'dt'),
        red_dphi: band('red', 'humidity', 'dphi'),
        red_dx: band('red', 'absolute_humidity', 'dx'),
        show_labels: c.show_labels !== false,
        show_legend: c.show_legend === true,
        fixed_scale: c.scale === 'fixed',
    };
}

// A cleared number field (undefined / null / '') falls back to the previous
// config value, else the default: no null or undefined is ever written.
function dataToConfig(d, previous = {}) {
    const config = { ...previous };
    for (const k of OWNED_KEYS) delete config[k];
    config.type = 'custom:comfort-compass-card';
    if (given(d.temperature_entity)) config.temperature_entity = d.temperature_entity;
    if (given(d.humidity_entity)) config.humidity_entity = d.humidity_entity;
    if (given(d.title)) config.title = d.title;
    const days = firstNum(d.days_to_show, previous.days_to_show, previous.days, DEFAULTS.days_to_show);
    if (days !== DEFAULTS.days_to_show) config.days_to_show = days;
    // Persist either pressure or altitude, never both. Do not write the default
    // pressure unless it was set before, so opening the editor changes nothing.
    if (d.air_mode === 'altitude') {
        config.altitude = firstNum(d.altitude, previous.altitude, DEFAULTS.altitude);
    } else {
        const p = firstNum(d.pressure, previous.pressure, DEFAULTS.pressure);
        if (given(previous.pressure) || p !== DEFAULTS.pressure) config.pressure = p;
    }

    const prevCz = previous.comfort_zone && typeof previous.comfort_zone === 'object' ? previous.comfort_zone : {};
    const field = (v, key, i) => firstNum(v, pairAt(prevCz[key], i), DEFAULT_COMFORT_ZONE[key][i]);
    const cz = {
        temperature: [field(d.comfort_t_min, 'temperature', 0), field(d.comfort_t_max, 'temperature', 1)],
        humidity: [field(d.comfort_phi_min, 'humidity', 0), field(d.comfort_phi_max, 'humidity', 1)],
    };
    // absolute_humidity is optional: both fields empty = no absolute limit.
    if (isNum(d.comfort_x_min) || isNum(d.comfort_x_max)) {
        cz.absolute_humidity = [field(d.comfort_x_min, 'absolute_humidity', 0), field(d.comfort_x_max, 'absolute_humidity', 1)];
    }
    if (JSON.stringify(cz) !== JSON.stringify(DEFAULT_COMFORT_ZONE)) config.comfort_zone = cz;

    // Keep YAML-only keys (label, color) the form does not edit.
    const prev = typeof previous.warning_bands === 'object' && previous.warning_bands ? previous.warning_bands : {};
    const bands = {};
    for (const k of ['orange', 'red']) {
        const b = { ...(prev[k] || {}) };
        const defs = { temperature: DEFAULT_BANDS[k].dt, humidity: DEFAULT_BANDS[k].dphi, absolute_humidity: DEFAULT_BANDS[k].dx };
        const vals = { temperature: d[`${k}_dt`], humidity: d[`${k}_dphi`], absolute_humidity: d[`${k}_dx`] };
        for (const f of Object.keys(vals)) {
            const v = firstNum(vals[f], b[f], defs[f]);
            if (v !== defs[f]) b[f] = v;
            else delete b[f];
        }
        if (Object.keys(b).length) bands[k] = b;
    }
    if (Object.keys(bands).length) config.warning_bands = bands;

    if (!d.show_labels) config.show_labels = false;
    if (d.show_legend) config.show_legend = true;
    if (d.fixed_scale) config.scale = 'fixed';
    return config;
}

const num = (step, unit, min, max) => ({ number: { step, mode: 'box', unit_of_measurement: unit, min, max } });

function buildSchema(d, t) {
    const pairRow = (a, b, sel) => ({ type: 'grid', schema: [{ name: a, selector: sel }, { name: b, selector: sel }] });
    const bandRow = (k) => ({
        type: 'grid',
        schema: [
            { name: `${k}_dt`, selector: num(0.5, 'K', 0) },
            { name: `${k}_dphi`, selector: num(1, '%', 0, 100) },
            { name: `${k}_dx`, selector: num(0.5, 'g/kg', 0) },
        ],
    });
    return [
        { name: 'title', selector: { text: {} } },
        {
            type: 'grid',
            schema: [
                { name: 'temperature_entity', required: true, selector: { statistic: { device_class: 'temperature' } } },
                { name: 'humidity_entity', required: true, selector: { statistic: { device_class: 'humidity' } } },
            ],
        },
        {
            type: 'grid',
            schema: [
                { name: 'days_to_show', selector: num(1, undefined, 1, MAX_DAYS) },
                {
                    name: 'air_mode',
                    selector: {
                        select: {
                            mode: 'dropdown',
                            options: [
                                { value: 'altitude', label: t('editor.options.altitude') },
                                { value: 'pressure', label: t('editor.options.pressure') },
                            ],
                        },
                    },
                },
                d.air_mode === 'pressure'
                    ? { name: 'pressure', selector: num(1, 'Pa', 50000, 110000) }
                    : { name: 'altitude', selector: num(10, 'm', 0, 5000) },
            ],
        },
        {
            type: 'expandable',
            title: t('editor.sections.display'),
            schema: [{
                type: 'grid',
                schema: [
                    { name: 'show_labels', selector: { boolean: {} } },
                    { name: 'show_legend', selector: { boolean: {} } },
                    { name: 'fixed_scale', selector: { boolean: {} } },
                ],
            }],
        },
        {
            type: 'expandable',
            title: t('editor.sections.comfort'),
            schema: [
                pairRow('comfort_t_min', 'comfort_t_max', num(0.5, '°C')),
                pairRow('comfort_phi_min', 'comfort_phi_max', num(1, '%', 0, 100)),
                pairRow('comfort_x_min', 'comfort_x_max', num(0.5, 'g/kg', 0)),
            ],
        },
        {
            type: 'expandable',
            title: t('editor.sections.bands'),
            schema: [bandRow('orange'), bandRow('red')],
        },
    ];
}

export class ComfortCompassCardEditor extends LitElement {
    static get properties() {
        return {
            hass: { attribute: false },
            _config: { state: true },
        };
    }

    setConfig(config) {
        this._config = config;
    }

    render() {
        if (!this._config) return html``;
        const t = (key) => localize(this.hass, key);
        const data = configToData(this._config);
        return html`
            <ha-form
                .hass=${this.hass}
                .data=${data}
                .schema=${buildSchema(data, t)}
                .computeLabel=${(s) => t(`editor.fields.${s.name}`)}
                @value-changed=${this._valueChanged}
            ></ha-form>
        `;
    }

    _valueChanged(ev) {
        const config = dataToConfig(ev.detail.value, this._config);
        this.dispatchEvent(new CustomEvent('config-changed', { detail: { config }, bubbles: true, composed: true }));
    }
}
