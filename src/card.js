import { html, LitElement, nothing } from 'lit';
import { createMollier } from './vendor/mollierFunctions.js';
import { parseWarningBands } from './bands.js';
import { classifyRecord, compassDistribution, renderCompass, hideTips } from './compass.js';
import { formatNumber, localize } from './localize/localize.js';
import {
    daysFromConfig,
    fetchDailyMeans,
    missingEntities,
    airPressure,
    pressureFromConfig,
    REFRESH_MS,
    RETRY_MS,
    SLOW_MS,
    stateCelsius,
    stateHumidity,
} from './statistics.js';
import styles from './card.styles.js';
import { DEFAULT_PALETTE, PALETTE_NAMES } from './palettes.js';

const DEFAULT_DAYS = 30;
// pyedautils' usual indoor comfort zone: 20–26 °C, 30–65 % rH, at most 12 g/kg.
export const DEFAULT_COMFORT_ZONE = { temperature: [20, 26], humidity: [30, 65], absolute_humidity: [0, 12] };
// A comfort zone above this many °C is almost certainly entered in °F.
const FAHRENHEIT_HINT_ABOVE = 45;
const SCALES = ['fit', 'fixed'];
// Breathing strength of the "now" marker in %, 10 (barely) to 90 (almost
// fades out; more would make the arm look like it blinks away). The green disc fades 5/11 as much (55 % → 0.75 as before), so
// its share text stays readable.
export const DEFAULT_BREATHING = 55;
export const BREATHING_RANGE = [10, 90];

// Config value → strength in %, or null if it is not a number in BREATHING_RANGE.
export function breathingStrength(v) {
    if (!given(v)) return DEFAULT_BREATHING;
    if (v === '' || typeof v === 'boolean') return null;
    const n = Number(v);
    return Number.isFinite(n) && n >= BREATHING_RANGE[0] && n <= BREATHING_RANGE[1] ? n : null;
}

const given = (v) => v !== undefined && v !== null;

function parsePair(cz, key, unit) {
    const v = cz[key];
    const ok =
        Array.isArray(v) &&
        v.length === 2 &&
        v.every((n) => n !== null && n !== '' && typeof n !== 'boolean' && Number.isFinite(Number(n)));
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

// getCardSize() for a card of h px: the smallest size n for which Home
// Assistant's row count (ceil((n * 50 + 8) / 64), used when auto height is
// switched off) gives the rows the card needs (ceil((h + 8) / 64)), so the
// tile neither shrinks nor grows by a row.
export function cardSizeForHeight(h) {
    const rows = Math.max(1, Math.ceil((h + 8) / 64));
    return Math.max(1, Math.floor((64 * (rows - 1) - 8) / 50) + 1);
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
            _slow: { state: true },
            _compact: { state: true },
            _box: { state: true },
            _current: { state: true },
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
        this._slow = false;
        this._slowTimer = undefined;
        this._compact = false;
        this._box = null;
        this._current = null;
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
        this._clearSlow();
        hideTips(this.renderRoot);
        this._resizeObserver?.disconnect();
        this._observed = undefined;
    }

    _clearRetry() {
        clearTimeout(this._retryTimer);
        this._retryTimer = undefined;
    }

    _clearSlow() {
        clearTimeout(this._slowTimer);
        this._slowTimer = undefined;
        this._slow = false;
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
        const stacked =
            legend && glyph && legend.getBoundingClientRect().top >= glyph.getBoundingClientRect().bottom - 1;
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
        const palette = given(config.palette) ? config.palette : DEFAULT_PALETTE;
        if (!PALETTE_NAMES.includes(palette)) {
            throw new Error(
                `palette must be one of ${PALETTE_NAMES.join(', ')} (got ${JSON.stringify(config.palette)})`,
            );
        }
        const breathing = breathingStrength(config.breathing);
        if (breathing === null) {
            throw new Error(
                `breathing must be a number from ${BREATHING_RANGE[0]} to ${BREATHING_RANGE[1]} (got ${JSON.stringify(config.breathing)})`,
            );
        }
        for (const key of ['show_current', 'show_current_legend']) {
            if (given(config[key]) && typeof config[key] !== 'boolean') {
                throw new Error(`${key} must be true or false (got ${JSON.stringify(config[key])})`);
            }
        }
        const period = daysFromConfig(config, DEFAULT_DAYS);
        // Validates altitude / pressure; neither set → the elevation set in Home Assistant.
        pressureFromConfig(config, null);
        const comfort = parseComfortZone(config.comfort_zone);
        // false / null mean the defaults too: the compass always needs stages.
        const bands = parseWarningBands(config.warning_bands || true);

        this._config = config;
        this._scale = scale;
        this._palette = palette;
        this._breathing = breathing;
        this._period = period;
        this._comfort = comfort;
        this._bands = bands;
        this._updateAir();
        this._fahrenheitHint = comfort.range_t[1] > FAHRENHEIT_HINT_ABOVE;
        this._mollier ??= createMollier('classical');
        this._updateSizingMode();
        if (this._hass) {
            this._maybeFetch();
            this._updateCurrent();
        }
    }

    // Live reading of the two sensors, classified like the daily means.
    // Only replaced when what is shown changes (state key or the rounded
    // values), because hass changes on every state change in Home Assistant.
    _updateCurrent() {
        const c = this._config;
        let next = null;
        if (c && (c.show_current !== false || c.show_current_legend !== false) && this._hass && this._mollier) {
            const t = stateCelsius(this._hass.states[c.temperature_entity]);
            const phi = stateHumidity(this._hass.states[c.humidity_entity]);
            if (Number.isFinite(t) && Number.isFinite(phi)) {
                const key = classifyRecord({ t, phi }, this._comfort, this._bands, this._pressure, this._mollier);
                const x = this._mollier.get_x_y(t, phi, this._pressure).x;
                if (key) next = { key, t, phi, x };
            }
        }
        const prev = this._current;
        const sig = (p) =>
            p ? `${p.key}|${p.t.toFixed(1)}|${(p.phi * 100).toFixed(0)}|${(p.x * 1000).toFixed(1)}` : '';
        if (sig(prev) !== sig(next)) this._current = next;
    }

    // Air pressure for the absolute humidity: altitude or pressure from the
    // config, else the elevation set in Home Assistant, else sea level.
    _updateAir() {
        this._air = airPressure(this._config, this._hass);
        this._pressure = this._air.pa;
    }

    set hass(hass) {
        const first = !this._hass;
        const langChanged = this._hass?.locale?.language !== hass?.locale?.language;
        const darkChanged = this._hass?.themes?.darkMode !== hass?.themes?.darkMode;
        const elevationChanged = this._hass?.config?.elevation !== hass?.config?.elevation;
        this._hass = hass;
        if (elevationChanged && this._config) this._updateAir();
        this._updateCurrent();
        if (first && this._config) this._maybeFetch();
        // A sensor that was missing has appeared (renamed back, integration loaded).
        else if (this._error?.key === 'card.entity_not_found' && !this._missing().length) this._maybeFetch(true);
        if (langChanged || darkChanged || elevationChanged) this.requestUpdate();
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
        // A first load that takes long says so, instead of an empty card.
        this._clearSlow();
        this._slowTimer = setTimeout(() => {
            this._slow = true;
        }, SLOW_MS);
        try {
            const days = await fetchDailyMeans(this._hass, c.temperature_entity, c.humidity_entity, this._period);
            if (seq !== this._fetchSeq) return;
            this._days = days;
            this._error = days.length ? undefined : { key: 'card.no_statistics' };
            this._retryIndex = 0;
        } catch (err) {
            if (seq !== this._fetchSeq) return;
            const delay = RETRY_MS[Math.min(this._retryIndex, RETRY_MS.length - 1)];
            if (!this._days.length) {
                const error =
                    err?.code === 'timeout'
                        ? this._t('card.fetch_timeout')
                        : String((err && err.message) || err).replace(/[.\s]+$/, '');
                this._error = { key: 'card.fetch_failed', vars: { error, s: Math.round(delay / 1000) } };
            }
            this._retryIndex += 1;
            if (this.isConnected) this._retryTimer = setTimeout(() => this._maybeFetch(true), delay);
            else this._retryDue = true;
        } finally {
            if (seq === this._fetchSeq) {
                this._loading = false;
                this._clearSlow();
            }
        }
    }

    // A tap anywhere on the card outside a segment closes an open tooltip.
    _onCardClick(ev) {
        if (!ev.composedPath().some((el) => el.classList?.contains('seg') || el.classList?.contains('now-dot')))
            hideTips(this.renderRoot);
    }

    render() {
        if (!this._config) return nothing;
        const c = this._config;
        let body;
        if (this._error) {
            const hint = this._error.key === 'card.no_statistics';
            body = html`<p class="message ${hint ? '' : 'error'}">${this._t(this._error.key, this._error.vars)}</p>`;
        } else if (this._loading || !this._days.length) {
            // First load: a box of about the compass's size; a load that takes
            // long (busy Home Assistant) says so.
            body = html`<div class="placeholder">
                ${this._slow ? html`<p class="message">${this._t('card.loading_slow')}</p>` : nothing}
            </div>`;
        } else {
            const dist = compassDistribution(this._days, this._comfort, this._bands, this._pressure, this._mollier);
            body = renderCompass(dist, (key, vars) => this._t(key, vars), {
                fixedScale: this._scale === 'fixed',
                fixedHeight: this._fixedHeight,
                showLegend: c.show_legend === true,
                showLabels: c.show_labels !== false && !this._compact,
                dark: !!this._hass?.themes?.darkMode,
                palette: this._palette,
                boxW: this._box?.w,
                boxH: this._box?.h,
                current: this._current,
                currentMarker: c.show_current !== false,
                currentLegend: c.show_current_legend !== false,
                locale: this._hass?.locale?.language,
                formatNumber: (v, d) => formatNumber(this._hass, v, d),
                // Small tile: only the breathing marker, no "now" line, so the glyph keeps its room.
                compact: this._compact,
            });
        }
        const title = c.title;
        const b = this._breathing;
        return html`
            <ha-card
                .header=${title ? String(title) : undefined}
                @click=${this._onCardClick}
                style=${`--ccc-breathe-min:${(1 - b / 100).toFixed(3)};--ccc-breathe-ok-min:${(1 - (b / 100) * (5 / 11)).toFixed(3)}`}
            >
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
        const pick = (dc) =>
            states.find((s) => s.attributes?.device_class === dc && s.attributes?.state_class === 'measurement')
                ?.entity_id;
        return {
            temperature_entity: pick('temperature') || 'sensor.living_room_temperature',
            humidity_entity: pick('humidity') || 'sensor.living_room_humidity',
            days_to_show: DEFAULT_DAYS,
        };
    }

    // Masonry: 1 unit = 50 px. Home Assistant also uses it as the first row
    // count when the user switches auto height off in the layout editor, so it
    // should match the real height: measured when the card is shown in auto
    // mode, otherwise estimated from the options (title, glyph, Now line, legend).
    getCardSize() {
        const h = this._fixedHeight ? 0 : this.renderRoot?.querySelector('ha-card')?.offsetHeight;
        if (h > 0) return cardSizeForHeight(h);
        const c = this._config || {};
        return (c.title ? 1 : 0) + 5 + (c.show_legend === true ? 3 : 0);
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
