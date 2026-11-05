import { html, LitElement, nothing } from 'lit';
import { createMollier } from './vendor/mollierFunctions.js';
import { parseWarningBands } from './bands.js';
import { compassDistribution, renderCompass } from './compass.js';
import { localize } from './localize/localize.js';
import { fetchDailyMeans, REFRESH_MS } from './statistics.js';
import styles from './card.styles.js';

const DEFAULT_DAYS = 30;
const DEFAULT_PRESSURE = 101325;
// pyedautils' usual indoor comfort zone: 20–26 °C, 30–60 % rH, at most 12 g/kg.
export const DEFAULT_COMFORT_ZONE = { temperature: [20, 26], humidity: [30, 60], absolute_humidity: [0, 12] };

// International Standard Atmosphere: altitude [m] → pressure [Pa].
function pressureFromAltitude(altitudeM) {
    return 101325 * Math.pow(1 - 2.25577e-5 * altitudeM, 5.25588);
}

const pair = (v) => Array.isArray(v) && v.length === 2 && v.every((n) => Number.isFinite(Number(n)));

// User units (°C, %, g/kg) → internal units (°C, 0..1, kg/kg). Missing or
// malformed parts fall back to the default zone.
export function parseComfortZone(cz) {
    const src = { ...DEFAULT_COMFORT_ZONE, ...(cz && typeof cz === 'object' ? cz : {}) };
    const t = pair(src.temperature) ? src.temperature : DEFAULT_COMFORT_ZONE.temperature;
    const h = pair(src.humidity) ? src.humidity : DEFAULT_COMFORT_ZONE.humidity;
    const x = pair(src.absolute_humidity) ? src.absolute_humidity : DEFAULT_COMFORT_ZONE.absolute_humidity;
    const sort = (a) => a.map(Number).sort((p, q) => p - q);
    const [t0, t1] = sort(t), [h0, h1] = sort(h), [x0, x1] = sort(x);
    return { range_t: [t0, t1], range_phi: [h0 / 100, h1 / 100], range_x: [x0 / 1000, x1 / 1000] };
}

export class ComfortCompassCard extends LitElement {
    static styles = styles;

    static get properties() {
        return {
            // Set by Home Assistant: "grid" in sections, "panel" in panel view,
            // unset in masonry. Reflected so the styles can switch modes.
            layout: { type: String, reflect: true },
            _fixedHeight: { type: Boolean, reflect: true, attribute: 'fixed-height' },
            _config: { state: true },
            _days: { state: true },
            _error: { state: true },
            _compact: { state: true },
            _box: { state: true },
        };
    }

    // Reactive properties are initialised in the constructor: a class field
    // initializer would shadow Lit's accessor and updates would not render.
    constructor() {
        super();
        this._hass = undefined;
        this._fetchKey = null;
        this._days = [];
        this._compact = false;
        this._box = null;
        this._resizeObserver = undefined;
    }

    // Direction labels need room: below ~200 px for the glyph they become
    // unreadable, so the card drops them automatically (compact mode).
    connectedCallback() {
        super.connectedCallback();
        clearInterval(this._refreshTimer);
        this._refreshTimer = setInterval(() => this._maybeFetch(true), REFRESH_MS);
        // Re-attached (e.g. back from another dashboard view): refresh once.
        if (this._wasConnected) this._maybeFetch(true);
        this._wasConnected = true;
        if (!this._resizeObserver && typeof ResizeObserver !== 'undefined') {
            this._resizeObserver = new ResizeObserver(() => this._measure());
        }
        this.updateComplete.then(() => {
            const el = this.renderRoot?.querySelector('.card-content');
            if (el && this._resizeObserver) this._resizeObserver.observe(el);
        });
    }

    disconnectedCallback() {
        super.disconnectedCallback();
        clearInterval(this._refreshTimer);
        this._refreshTimer = undefined;
        this._resizeObserver?.disconnect();
    }

    _measure() {
        const content = this.renderRoot?.querySelector('.card-content');
        if (!content) return;
        const r = content.getBoundingClientRect();
        if (!r.width) return;
        // Room for the glyph: the content box minus padding and, when stacked
        // below the glyph, the legend. In auto mode only the width limits it.
        const cs = getComputedStyle(content);
        const padX = parseFloat(cs.paddingLeft) + parseFloat(cs.paddingRight);
        const padY = parseFloat(cs.paddingTop) + parseFloat(cs.paddingBottom);
        const legend = this.renderRoot.querySelector('.legend');
        const glyph = this.renderRoot.querySelector('.glyph-box');
        const stacked = legend && glyph && legend.getBoundingClientRect().top >= glyph.getBoundingClientRect().bottom - 1;
        const legendH = stacked ? legend.getBoundingClientRect().height + 8 : 0;
        const legendW = legend && !stacked ? legend.getBoundingClientRect().width + 20 : 0;
        const w = r.width - padX - legendW;
        const h = r.height - padY - legendH;
        const room = this._fixedHeight ? Math.min(w, h) : w;
        const compact = room < 200;
        if (compact !== this._compact) this._compact = compact;
        // On-screen size of the glyph box, so the compass can size its labels
        // to a readable pixel size. Only update on real changes (no loops).
        if (glyph) {
            const g = glyph.getBoundingClientRect();
            const box = { w: Math.round(g.width), h: this._fixedHeight ? Math.round(g.height) : 0 };
            const old = this._box;
            if (!old || Math.abs(old.w - box.w) > 2 || Math.abs(old.h - box.h) > 2) this._box = box;
        }
    }

    setConfig(config) {
        if (!config.temperature_entity) throw new Error('temperature_entity is required');
        if (!config.humidity_entity) throw new Error('humidity_entity is required');
        this._config = config;
        this._period = Math.max(1, Math.round(Number(config.days) || DEFAULT_DAYS));
        this._pressure = Number.isFinite(Number(config.altitude)) && config.altitude !== null && config.altitude !== ''
            ? pressureFromAltitude(Number(config.altitude))
            : Number(config.pressure) || DEFAULT_PRESSURE;
        this._comfort = parseComfortZone(config.comfort_zone);
        this._bands = parseWarningBands(config.warning_bands || true);
        this._mollier = createMollier('classical');
        this._updateSizingMode();
        if (this._hass) this._maybeFetch();
    }

    set hass(hass) {
        const first = !this._hass;
        const langChanged = this._hass?.locale?.language !== hass?.locale?.language;
        const darkChanged = this._hass?.themes?.darkMode !== hass?.themes?.darkMode;
        this._hass = hass;
        if (first && this._config) this._maybeFetch();
        if (langChanged || darkChanged) this.requestUpdate();
    }

    get hass() {
        return this._hass;
    }

    // Two sizing modes, like Home Assistant's own gauge and chart cards:
    // fixed (sections with a row count, or panel view) fills the tile;
    // auto (masonry, stacks, sections with auto rows) takes its own height.
    // In both the glyph is capped in size and centred.
    _updateSizingMode() {
        const rows = this._config?.grid_options?.rows;
        this._fixedHeight = this.layout === 'panel' || (this.layout === 'grid' && typeof rows === 'number');
    }

    willUpdate(changed) {
        if (changed.has('layout')) this._updateSizingMode();
    }

    _t(key, vars) {
        return localize(this._hass, key, vars);
    }

    // Loads the daily means once per entity/period combination; `force` re-fetches
    // (hourly timer, retry after an error). A response that arrives after the
    // config changed is dropped, so a slow old request cannot overwrite a newer one.
    async _maybeFetch(force = false) {
        const c = this._config;
        if (!this._hass || !c) return;
        const key = `${c.temperature_entity}|${c.humidity_entity}|${this._period}`;
        if (key === this._fetchKey && !force) return;
        this._fetchKey = key;
        try {
            const days = await fetchDailyMeans(this._hass, c.temperature_entity, c.humidity_entity, this._period);
            if (this._fetchKey !== key) return;
            this._days = days;
            this._error = days.length ? undefined : { key: 'card.no_statistics' };
        } catch (err) {
            if (this._fetchKey !== key) return;
            this._error = { key: 'card.fetch_failed', vars: { error: (err && err.message) || err } };
            this._fetchKey = null;                  // retry on the next timer tick
        }
    }

    render() {
        if (!this._config) return nothing;
        const c = this._config;
        let body;
        if (this._error) {
            const hint = this._error.key === 'card.no_statistics';
            body = html`<p class="message ${hint ? '' : 'error'}">${this._t(this._error.key, this._error.vars)}</p>`;
        } else if (!this._days.length) {
            body = this._fetchKey ? html`<p class="message">${this._t('card.no_data')}</p>` : nothing;
        } else {
            const dist = compassDistribution(this._days, this._comfort, this._bands, this._pressure, this._mollier);
            body = renderCompass(dist, (key, vars) => this._t(key, vars), {
                fixedScale: c.scale === 'fixed',
                showLegend: c.show_legend === true,
                showLabels: c.show_labels !== false && !this._compact,
                dark: !!this._hass?.themes?.darkMode,
                boxW: this._box?.w,
                boxH: this._box?.h,
            });
        }
        return html`
            <ha-card .header=${c.header || undefined}>
                <div class="card-content">${body}</div>
            </ha-card>
        `;
    }

    static getConfigElement() {
        return document.createElement('comfort-compass-card-editor');
    }

    static getStubConfig(hass) {
        const states = Object.values(hass?.states || {});
        const pick = (dc) => states.find((s) => s.attributes?.device_class === dc
            && s.attributes?.state_class === 'measurement')?.entity_id;
        return {
            temperature_entity: pick('temperature') || 'sensor.living_room_temperature',
            humidity_entity: pick('humidity') || 'sensor.living_room_humidity',
            days: DEFAULT_DAYS,
        };
    }

    // Masonry: 1 unit = 50 px; the auto-height glyph is about 260 px.
    getCardSize() {
        return 5;
    }

    // Sections: half width by default, auto height; never narrower than 3
    // columns or lower than 3 rows (184 px).
    getGridOptions() {
        return {
            columns: 6,
            min_columns: 3,
            min_rows: 3,
        };
    }
}
