import { html, LitElement } from 'lit';
import { localize } from './localize/localize.js';
import { DEFAULT_BANDS } from './bands.js';
import { DEFAULT_COMFORT_ZONE } from './card.js';

// Visual editor on Home Assistant's <ha-form>. The form data is flat, the
// YAML config nested; configToData / dataToConfig translate between them.
// Only values that differ from the defaults are written, to keep YAML short.

const DEFAULTS = {
    days: 30,
    altitude: 450,       // only a suggestion when the user switches to altitude
    pressure: 101325,    // the card's default when neither pressure nor altitude is set
};

// Keys this form owns. Everything else in the existing config (grid_options,
// visibility, view_layout, card_mod, YAML-only options) is kept as it is.
const OWNED_KEYS = [
    'type', 'temperature_entity', 'humidity_entity', 'header', 'days', 'altitude', 'pressure',
    'comfort_zone', 'warning_bands', 'show_labels', 'show_legend', 'scale',
];

function configToData(c = {}) {
    const cz = { ...DEFAULT_COMFORT_ZONE, ...(c.comfort_zone || {}) };
    const wb = typeof c.warning_bands === 'object' && c.warning_bands ? c.warning_bands : {};
    const band = (k, f, d) => wb[k]?.[f] ?? DEFAULT_BANDS[k][d];
    return {
        header: c.header ?? '',
        temperature_entity: c.temperature_entity ?? '',
        humidity_entity: c.humidity_entity ?? '',
        days: c.days ?? DEFAULTS.days,
        air_mode: c.altitude !== undefined && c.altitude !== null ? 'altitude' : 'pressure',
        altitude: c.altitude ?? DEFAULTS.altitude,
        pressure: c.pressure ?? DEFAULTS.pressure,
        comfort_t_min: cz.temperature[0],
        comfort_t_max: cz.temperature[1],
        comfort_phi_min: cz.humidity[0],
        comfort_phi_max: cz.humidity[1],
        comfort_x_min: cz.absolute_humidity[0],
        comfort_x_max: cz.absolute_humidity[1],
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

function dataToConfig(d, previous = {}) {
    const config = { ...previous };
    for (const k of OWNED_KEYS) delete config[k];
    Object.assign(config, {
        type: 'custom:comfort-compass-card',
        temperature_entity: d.temperature_entity,
        humidity_entity: d.humidity_entity,
    });
    if (d.header) config.header = d.header;
    if (d.days !== DEFAULTS.days) config.days = d.days;
    // Persist either pressure or altitude, never both. Do not write the default
    // pressure unless it was set before, so opening the editor changes nothing.
    if (d.air_mode === 'altitude') config.altitude = d.altitude;
    else if (previous.pressure !== undefined || d.pressure !== DEFAULTS.pressure) config.pressure = d.pressure;

    const cz = {
        temperature: [d.comfort_t_min, d.comfort_t_max],
        humidity: [d.comfort_phi_min, d.comfort_phi_max],
        absolute_humidity: [d.comfort_x_min, d.comfort_x_max],
    };
    if (JSON.stringify(cz) !== JSON.stringify(DEFAULT_COMFORT_ZONE)) config.comfort_zone = cz;

    // Keep YAML-only keys (label, color) the form does not edit.
    const prev = typeof previous.warning_bands === 'object' && previous.warning_bands ? previous.warning_bands : {};
    const bands = {};
    for (const k of ['orange', 'red']) {
        const b = { ...(prev[k] || {}) };
        const vals = { temperature: d[`${k}_dt`], humidity: d[`${k}_dphi`], absolute_humidity: d[`${k}_dx`] };
        const defs = { temperature: DEFAULT_BANDS[k].dt, humidity: DEFAULT_BANDS[k].dphi, absolute_humidity: DEFAULT_BANDS[k].dx };
        for (const f of Object.keys(vals)) {
            if (vals[f] !== defs[f]) b[f] = vals[f];
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
        { name: 'header', selector: { text: {} } },
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
                { name: 'days', selector: num(1, undefined, 1, 365) },
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
