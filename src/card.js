import { html, LitElement, nothing } from 'lit';
import { createMollier } from './vendor/mollierFunctions.js';
import { parseWarningBands } from './bands.js';
import { compassDistribution, renderCompass, hideTips } from './compass.js';
import { localize } from './localize/localize.js';
import {
    daysFromConfig, fetchDailyMeans, missingEntities, pressureFromConfig, REFRESH_MS, RETRY_MS,
} from './statistics.js';
import styles from './card.styles.js';

const DEFAULT_DAYS = 30;
const DEFAULT_PRESSURE = 101325;
// pyedautils' usual indoor comfort zone: 20–26 °C, 30–65 % rH, at most 12 g/kg.
export const DEFAULT_COMFORT_ZONE = { temperature: [20, 26], humidity: [30, 65], absolute_humidity: [0, 12] };
// A comfort zone above this many °C is almost certainly entered in °F.
const FAHRENHEIT_HINT_ABOVE = 45;
const SCALES = ['fit', 'fixed'];

const given = (v) => v !== undefined && v !== null;

function parsePair(cz, key, unit) {
    const v = cz[key];
    const ok = Array.isArray(v) && v.length === 2
        && v.every((n) => n !== null && n !== '' && typeof n !== 'boolean' && Number.isFinite(Number(n)));
    if (!ok) {
        throw new Error(`comfort_zone.${key} must be a pair [min, max] in ${unit} (got ${JSON.stringify(v)})`);
    }
    return v.map(Number).sort((p, q) => p - q);
}

// User units (°C, %, g/kg) → internal units (°C, 0..1, kg/kg). No comfort_zone
// at all → the default zone. A given zone needs temperature and humidity;
// absolute_humidity is optional and, when missing, means no absolute criterion
// (range_x null, like pyedautils' hum_abs_band=None).
export function parseComfortZone(cz) {
    if (!given(cz)) cz = DEFAULT_COMFORT_ZONE;
    if (typeof cz !== 'object' || Array.isArray(cz)) {
        throw new Error('comfort_zone must be an object with temperature: [min, max] and humidity: [min, max]');
    }
    const [t0, t1] = parsePair(cz, 'temperature', '°C');
    const [h0, h1] = parsePair(cz, 'humidity', '%');
    const x = given(cz.absolute_humidity) ? parsePair(cz, 'absolute_humidity', 'g/kg') : null;
    return {
        range_t: [t0, t1],
        range_phi: [h0 / 100, h1 / 100],
        range_x: x ? [x[0] / 1000, x[1] / 1000] : null,
    };
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
            _loading: { state: true },
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
        this._fetchSeq = 0;
        this._retryIndex = 0;
        this._retryTimer = undefined;
        this._retryDue = false;
        this._days = [];
        this._error = undefined;
        this._loading = false;
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
        // Re-attached (e.g. back from another dashboard view), or a load failed
        // before the card was attached: refresh once.
        if (this._wasConnected || this._retryDue) this._maybeFetch(true);
        this._retryDue = false;
        this._wasConnected = true;
        if (!this._resizeObserver && typeof ResizeObserver !== 'undefined') {
            this._resizeObserver = new ResizeObserver(() => this._measure());
        }
        this.updateComplete.then(() => this._observeSize());
    }

    // Watch the content box for size changes. Called after every render, because
    // the box only exists once the card has a config (it may be attached first).
    _observeSize() {
        const el = this.renderRoot?.querySelector('.card-content');
        if (!el || !this._resizeObserver || el === this._observed) return;
        if (this._observed) this._resizeObserver.unobserve(this._observed);
        this._resizeObserver.observe(el);
        this._observed = el;
    }

    updated() {
        this._observeSize();
    }

    disconnectedCallback() {
        super.disconnectedCallback();
        clearInterval(this._refreshTimer);
        this._refreshTimer = undefined;
        this._clearRetry();
        hideTips(this.renderRoot);
        this._resizeObserver?.disconnect();
        this._observed = undefined;
    }

    _clearRetry() {
        clearTimeout(this._retryTimer);
        this._retryTimer = undefined;
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

    // Validates everything first and only then takes the new config, so a
    // rejected config leaves the card as it was.
    setConfig(config) {
        if (!config || typeof config !== 'object') throw new Error('Invalid configuration');
        if (!config.temperature_entity) throw new Error('temperature_entity is required');
        if (!config.humidity_entity) throw new Error('humidity_entity is required');
        const scale = given(config.scale) ? config.scale : 'fit';
        if (!SCALES.includes(scale)) {
            throw new Error(`scale must be one of ${SCALES.join(', ')} (got ${JSON.stringify(config.scale)})`);
        }
        const period = daysFromConfig(config, DEFAULT_DAYS);
        const pressure = pressureFromConfig(config, DEFAULT_PRESSURE);
        const comfort = parseComfortZone(config.comfort_zone);
        // false / null mean the defaults too: the compass always needs stages.
        const bands = parseWarningBands(config.warning_bands || true);

        this._config = config;
        this._scale = scale;
        this._period = period;
        this._pressure = pressure;
        this._comfort = comfort;
        this._bands = bands;
        this._fahrenheitHint = comfort.range_t[1] > FAHRENHEIT_HINT_ABOVE;
        this._mollier ??= createMollier('classical');
        this._updateSizingMode();
        if (this._hass) this._maybeFetch();
    }

    set hass(hass) {
        const first = !this._hass;
        const langChanged = this._hass?.locale?.language !== hass?.locale?.language;
        const darkChanged = this._hass?.themes?.darkMode !== hass?.themes?.darkMode;
        this._hass = hass;
        if (first && this._config) this._maybeFetch();
        // A sensor that was missing has appeared (renamed back, integration loaded).
        else if (this._error?.key === 'card.entity_not_found' && !this._missing().length) this._maybeFetch(true);
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

    _missing() {
        const c = this._config;
        return c ? missingEntities(this._hass, [c.temperature_entity, c.humidity_entity]) : [];
    }

    // Loads the daily means once per entity/period combination; `force` re-fetches
    // (hourly timer, re-attach, retry). A new combination drops the old data and
    // error. A failed load is retried with back-off (RETRY_MS); a failed refresh
    // keeps the last good data. A response that arrives after a newer request
    // was started is dropped, so a slow old request cannot overwrite a newer one.
    async _maybeFetch(force = false) {
        const c = this._config;
        if (!this._hass || !c) return;
        const key = `${c.temperature_entity}|${c.humidity_entity}|${this._period}`;
        if (key === this._fetchKey && !force) return;
        if (key !== this._fetchKey) {
            this._days = [];
            this._error = undefined;
            this._retryIndex = 0;
        }
        this._fetchKey = key;
        this._clearRetry();
        const seq = ++this._fetchSeq;

        const missing = this._missing();
        if (missing.length) {
            this._days = [];
            this._loading = false;
            this._error = { key: 'card.entity_not_found', vars: { entities: missing.join(', ') } };
            return;
        }

        if (!this._days.length) this._loading = true;
        try {
            const days = await fetchDailyMeans(this._hass, c.temperature_entity, c.humidity_entity, this._period);
            if (seq !== this._fetchSeq) return;
            this._days = days;
            this._error = days.length ? undefined : { key: 'card.no_statistics' };
            this._retryIndex = 0;
        } catch (err) {
            if (seq !== this._fetchSeq) return;
            if (!this._days.length) {
                this._error = { key: 'card.fetch_failed', vars: { error: (err && err.message) || err } };
            }
            const delay = RETRY_MS[Math.min(this._retryIndex, RETRY_MS.length - 1)];
            this._retryIndex += 1;
            if (this.isConnected) this._retryTimer = setTimeout(() => this._maybeFetch(true), delay);
            else this._retryDue = true;
        } finally {
            if (seq === this._fetchSeq) this._loading = false;
        }
    }

    // A tap anywhere on the card outside a segment closes an open tooltip.
    _onCardClick(ev) {
        if (!ev.composedPath().some((el) => el.classList?.contains('seg'))) hideTips(this.renderRoot);
    }

    render() {
        if (!this._config) return nothing;
        const c = this._config;
        let body;
        if (this._error) {
            const hint = this._error.key === 'card.no_statistics';
            body = html`<p class="message ${hint ? '' : 'error'}">${this._t(this._error.key, this._error.vars)}</p>`;
        } else if (this._loading || !this._days.length) {
            // First load: an empty body of about the compass's size, no text.
            body = html`<div class="placeholder"></div>`;
        } else {
            const dist = compassDistribution(this._days, this._comfort, this._bands, this._pressure, this._mollier);
            body = renderCompass(dist, (key, vars) => this._t(key, vars), {
                fixedScale: this._scale === 'fixed',
                showLegend: c.show_legend === true,
                showLabels: c.show_labels !== false && !this._compact,
                dark: !!this._hass?.themes?.darkMode,
                boxW: this._box?.w,
                boxH: this._box?.h,
            });
        }
        const title = c.title;
        return html`
            <ha-card .header=${title ? String(title) : undefined} @click=${this._onCardClick}>
                <div class="card-content">
                    ${this._fahrenheitHint ? html`<p class="message hint">${this._t('card.fahrenheit_hint')}</p>` : nothing}
                    ${body}
                </div>
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
            days_to_show: DEFAULT_DAYS,
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
