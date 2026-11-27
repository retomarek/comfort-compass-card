import { html, LitElement } from 'lit';
import { formatNumber, localize } from './localize/localize.js';
import { BREATHING_RANGE, breathingStrength, DEFAULT_BREATHING } from './card.js';
import {
    ALTITUDE_RANGE,
    ALTITUDE_RANGE_FT,
    elevationOf,
    MAX_DAYS,
    pressureAtAltitude,
    PRESSURE_INHG_RANGE,
    PRESSURE_PA_RANGE,
} from './statistics.js';
import {
    convertConfigUnits,
    DEFAULT_BAND_VALUES,
    DEFAULT_ZONES,
    mToFt,
    paToInhg,
    unitSystem,
    UNITS,
    UNITS_OPTIONS,
} from './units.js';
import { DEFAULT_PALETTE, PALETTE_NAMES } from './palettes.js';

// Visual editor on Home Assistant's <ha-form>. The form data is flat, the
// YAML config nested; configToData / dataToConfig translate between them.
// Only values that differ from the defaults are written, to keep YAML short.
// Values are in the units of the card's unit system (src/units.js): metric °C,
// K, g/kg, m, Pa; imperial °F, °F, gr/lb, ft, inHg.

const DEFAULTS = {
    days_to_show: 30,
};
// Only suggestions when the user switches to an own altitude or pressure.
const AIR_DEFAULTS = {
    metric: { altitude: 450, pressure: 101325 },
    imperial: { altitude: 1500, pressure: 29.92 },
};

// Keys this form owns. Everything else in the existing config (grid_options,
// visibility, view_layout, card_mod, YAML-only options) is kept as it is.
const OWNED_KEYS = [
    // `days` is the pre-release name of days_to_show: dropped on save.
    'days',
    'type',
    'temperature_entity',
    'humidity_entity',
    'title',
    'days_to_show',
    'altitude',
    'pressure',
    'comfort_zone',
    'warning_bands',
    'show_labels',
    'show_legend',
    'show_current',
    'show_current_legend',
    'scale',
    'palette',
    'breathing',
    'units',
];

const given = (v) => v !== undefined && v !== null && v !== '';
const isNum = (v) => given(v) && typeof v !== 'boolean' && Number.isFinite(Number(v));
// First argument that is a number, as a number (cleared fields fall back).
const firstNum = (...vals) => {
    const v = vals.find(isNum);
    return v === undefined ? undefined : Number(v);
};
const pairAt = (p, i) => (Array.isArray(p) ? p[i] : undefined);

// Home Assistant's elevation and the pressure there, in the units of `system`.
const homeAltitude = (hass, system) => {
    const e = elevationOf(hass);
    return e === null ? undefined : system === 'imperial' ? Math.round(mToFt(e)) : e;
};
const homePressure = (hass, system) => {
    const e = elevationOf(hass);
    if (e === null) return undefined;
    const pa = pressureAtAltitude(e);
    return system === 'imperial' ? Math.round(paToInhg(pa) * 100) / 100 : Math.round(pa);
};

export function configToData(c = {}, hass = undefined) {
    const system = unitSystem(c, hass);
    const zoneDefaults = DEFAULT_ZONES[system];
    const bandDefaults = DEFAULT_BAND_VALUES[system];
    // No comfort_zone at all → the defaults; a given zone is shown as it is
    // (an absolute_humidity it does not have stays empty: no limit).
    const cz = c.comfort_zone && typeof c.comfort_zone === 'object' ? c.comfort_zone : zoneDefaults;
    const wb = typeof c.warning_bands === 'object' && c.warning_bands ? c.warning_bands : {};
    const band = (k, f) => firstNum(wb[k]?.[f], bandDefaults[k][f]);
    const zone = (key, i) =>
        firstNum(
            pairAt(cz[key], i),
            cz === zoneDefaults || key !== 'absolute_humidity' ? zoneDefaults[key][i] : undefined,
        );
    return {
        units: UNITS_OPTIONS.includes(c.units) ? c.units : 'auto',
        title: c.title ?? '',
        temperature_entity: c.temperature_entity ?? '',
        humidity_entity: c.humidity_entity ?? '',
        days_to_show: firstNum(c.days_to_show, DEFAULTS.days_to_show),
        // Neither altitude nor pressure: the elevation set in Home Assistant.
        air_mode: given(c.altitude) ? 'altitude' : given(c.pressure) ? 'pressure' : 'home',
        // Suggestion when switching to an own altitude: Home Assistant's.
        altitude: firstNum(c.altitude, homeAltitude(hass, system), AIR_DEFAULTS[system].altitude),
        // Suggestion when switching to a pressure: the one at Home Assistant's elevation.
        pressure: firstNum(c.pressure, homePressure(hass, system), AIR_DEFAULTS[system].pressure),
        comfort_t_min: zone('temperature', 0),
        comfort_t_max: zone('temperature', 1),
        comfort_phi_min: zone('humidity', 0),
        comfort_phi_max: zone('humidity', 1),
        comfort_x_min: zone('absolute_humidity', 0),
        comfort_x_max: zone('absolute_humidity', 1),
        orange_dt: band('orange', 'temperature'),
        orange_dphi: band('orange', 'humidity'),
        orange_dx: band('orange', 'absolute_humidity'),
        red_dt: band('red', 'temperature'),
        red_dphi: band('red', 'humidity'),
        red_dx: band('red', 'absolute_humidity'),
        show_labels: c.show_labels !== false,
        show_legend: c.show_legend === true,
        show_current: c.show_current !== false,
        show_current_legend: c.show_current_legend !== false,
        breathing: breathingStrength(c.breathing) ?? DEFAULT_BREATHING,
        fixed_scale: c.scale === 'fixed',
        palette: PALETTE_NAMES.includes(c.palette) ? c.palette : DEFAULT_PALETTE,
    };
}

// A cleared number field (undefined / null / '') falls back to the previous
// config value, else the default: no null or undefined is ever written.
export function dataToConfig(d, previous = {}, hass = undefined) {
    const units = UNITS_OPTIONS.includes(d.units) ? d.units : previous.units;
    const system = unitSystem({ units }, hass);
    const zoneDefaults = DEFAULT_ZONES[system];
    const bandDefaults = DEFAULT_BAND_VALUES[system];
    const config = { ...previous };
    for (const k of OWNED_KEYS) delete config[k];
    config.type = 'custom:comfort-compass-card';
    if (units === 'metric' || units === 'imperial') config.units = units;
    if (given(d.temperature_entity)) config.temperature_entity = d.temperature_entity;
    if (given(d.humidity_entity)) config.humidity_entity = d.humidity_entity;
    if (given(d.title)) config.title = d.title;
    const days = firstNum(d.days_to_show, previous.days_to_show, DEFAULTS.days_to_show);
    if (days !== DEFAULTS.days_to_show) config.days_to_show = days;
    // Persist either pressure or altitude, never both; 'home' (the default)
    // writes neither, so the card takes the elevation set in Home Assistant.
    if (d.air_mode === 'altitude') {
        config.altitude = firstNum(d.altitude, previous.altitude, AIR_DEFAULTS[system].altitude);
    } else if (d.air_mode === 'pressure') {
        config.pressure = firstNum(d.pressure, previous.pressure, AIR_DEFAULTS[system].pressure);
    }

    const prevCz = previous.comfort_zone && typeof previous.comfort_zone === 'object' ? previous.comfort_zone : {};
    const field = (v, key, i) => firstNum(v, pairAt(prevCz[key], i), zoneDefaults[key][i]);
    const cz = {
        temperature: [field(d.comfort_t_min, 'temperature', 0), field(d.comfort_t_max, 'temperature', 1)],
        humidity: [field(d.comfort_phi_min, 'humidity', 0), field(d.comfort_phi_max, 'humidity', 1)],
    };
    // absolute_humidity is optional: both fields empty = no absolute limit.
    if (isNum(d.comfort_x_min) || isNum(d.comfort_x_max)) {
        cz.absolute_humidity = [
            field(d.comfort_x_min, 'absolute_humidity', 0),
            field(d.comfort_x_max, 'absolute_humidity', 1),
        ];
    }
    if (JSON.stringify(cz) !== JSON.stringify(zoneDefaults)) config.comfort_zone = cz;

    // Keep YAML-only keys (label, color) the form does not edit.
    const prev = typeof previous.warning_bands === 'object' && previous.warning_bands ? previous.warning_bands : {};
    const bands = {};
    for (const k of ['orange', 'red']) {
        const b = { ...(prev[k] || {}) };
        const defs = bandDefaults[k];
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
    if (d.show_current === false) config.show_current = false;
    if (d.show_current_legend === false) config.show_current_legend = false;
    // Kept while the marker is off, so switching it back on restores it.
    const breathing = firstNum(d.breathing, previous.breathing, DEFAULT_BREATHING);
    if (breathing !== DEFAULT_BREATHING) config.breathing = breathing;
    if (d.fixed_scale) config.scale = 'fixed';
    if (d.palette && d.palette !== DEFAULT_PALETTE) config.palette = d.palette;
    return config;
}

const num = (step, unit, min, max) => ({ number: { step, mode: 'box', unit_of_measurement: unit, min, max } });

function buildSchema(d, t, hass) {
    const system = unitSystem({ units: d.units }, hass);
    const U = UNITS[system];
    const imperial = system === 'imperial';
    const elevation = elevationOf(hass);
    const pairRow = (a, b, sel) => ({
        type: 'grid',
        schema: [
            { name: a, selector: sel },
            { name: b, selector: sel },
        ],
    });
    const bandRow = (k) => ({
        type: 'grid',
        schema: [
            { name: `${k}_dt`, selector: num(0.5, U.delta.unit, 0) },
            { name: `${k}_dphi`, selector: num(1, '%', 0, 100) },
            { name: `${k}_dx`, selector: num(0.5, U.absHumidity.unit, 0) },
        ],
    });
    return [
        { name: 'title', selector: { text: {} } },
        {
            type: 'grid',
            schema: [
                {
                    name: 'temperature_entity',
                    required: true,
                    selector: { statistic: { device_class: 'temperature' } },
                },
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
                                {
                                    value: 'home',
                                    label:
                                        elevation === null
                                            ? t('editor.options.home_unset')
                                            : imperial
                                              ? t('editor.options.home_ip', {
                                                    ft: formatNumber(hass, mToFt(elevation)),
                                                })
                                              : t('editor.options.home', { m: formatNumber(hass, elevation) }),
                                },
                                {
                                    value: 'altitude',
                                    label: t(imperial ? 'editor.options.altitude_ip' : 'editor.options.altitude'),
                                },
                                {
                                    value: 'pressure',
                                    label: t(imperial ? 'editor.options.pressure_ip' : 'editor.options.pressure'),
                                },
                            ],
                        },
                    },
                },
                ...(d.air_mode === 'pressure'
                    ? [
                          {
                              name: 'pressure',
                              selector: imperial
                                  ? num(0.01, 'inHg', ...PRESSURE_INHG_RANGE)
                                  : num(1, 'Pa', ...PRESSURE_PA_RANGE),
                          },
                      ]
                    : d.air_mode === 'altitude'
                      ? [
                            {
                                name: 'altitude',
                                selector: num(
                                    U.altitude.step,
                                    U.altitude.unit,
                                    ...(imperial ? ALTITUDE_RANGE_FT : ALTITUDE_RANGE),
                                ),
                            },
                        ]
                      : []),
            ],
        },
        {
            type: 'expandable',
            title: t('editor.sections.display'),
            schema: [
                {
                    // auto: Home Assistant's unit system (°F = US customary → imperial).
                    name: 'units',
                    selector: {
                        select: {
                            mode: 'dropdown',
                            options: UNITS_OPTIONS.map((u) => ({ value: u, label: t(`editor.options.units_${u}`) })),
                        },
                    },
                },
                {
                    name: 'palette',
                    selector: {
                        select: {
                            mode: 'dropdown',
                            options: PALETTE_NAMES.map((p) => ({ value: p, label: t(`editor.palettes.${p}`) })),
                        },
                    },
                },
                {
                    type: 'grid',
                    schema: [
                        { name: 'show_labels', selector: { boolean: {} } },
                        { name: 'show_legend', selector: { boolean: {} } },
                        { name: 'fixed_scale', selector: { boolean: {} } },
                    ],
                },
                // The "now" marker with its options right below the switch, full width.
                { name: 'show_current', selector: { boolean: {} } },
                ...(d.show_current
                    ? [
                          {
                              name: 'breathing',
                              selector: {
                                  number: {
                                      min: BREATHING_RANGE[0],
                                      max: BREATHING_RANGE[1],
                                      step: 5,
                                      mode: 'slider',
                                      unit_of_measurement: '%',
                                  },
                              },
                          },
                      ]
                    : []),
                // Independent of the marker: the "Now" line can show on its own.
                { name: 'show_current_legend', selector: { boolean: {} } },
            ],
        },
        {
            type: 'expandable',
            title: t('editor.sections.comfort'),
            schema: [
                pairRow('comfort_t_min', 'comfort_t_max', num(U.temperature.step, U.temperature.unit)),
                pairRow('comfort_phi_min', 'comfort_phi_max', num(1, '%', 0, 100)),
                pairRow('comfort_x_min', 'comfort_x_max', num(U.absHumidity.step, U.absHumidity.unit, 0)),
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
        const t = (key, vars) => localize(this.hass, key, vars);
        const data = configToData(this._config, this.hass);
        return html`
            <ha-form
                .hass=${this.hass}
                .data=${data}
                .schema=${buildSchema(data, t, this.hass)}
                .computeLabel=${(s) => t(`editor.fields.${s.name}`)}
                @value-changed=${this._valueChanged}
            ></ha-form>
        `;
    }

    _valueChanged(ev) {
        const data = ev.detail.value;
        const before = unitSystem(this._config, this.hass);
        const after = unitSystem({ units: data.units }, this.hass);
        let config;
        if (before !== after) {
            // Switched the unit system: convert the zone, the bands and the air
            // pressure so they keep their meaning (68 °F stays 20 °C).
            config = convertConfigUnits({ ...this._config }, before, after);
            if (data.units === 'metric' || data.units === 'imperial') config.units = data.units;
            else delete config.units;
        } else {
            config = dataToConfig(data, this._config, this.hass);
        }
        this.dispatchEvent(new CustomEvent('config-changed', { detail: { config }, bubbles: true, composed: true }));
    }
}
