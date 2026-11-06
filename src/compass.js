// Comfort compass + warning bands.
//
// Port of pyedautils' comfort_compass_distribution() (pyedautils/comfort.py)
// and plot_comfort_compass() (pyedautils/plots/comfort.py) to Lit/SVG. The
// glyph is area-true: the green centre disc's area is the share of days in the
// comfort zone, each of the eight wedges' area is the share of days deviating
// in that direction, split radially into mild / moderate / severe.
//
// The severity stages are the warning bands: "mild" = outside the comfort
// zone but inside the orange band, "moderate" = inside the red band, "severe"
// = outside the red band. The same bands are drawn as dashed outlines in the
// Mollier diagram, so diagram and compass always agree.

import { html, svg, nothing } from 'lit';
import { parseWarningBands } from './bands.js';

// --- classification (pyedautils.comfort.comfort_compass_distribution) ------

const DIRS = ['f', 'wf', 'w', 'wt', 't', 'ct', 'c', 'kf'];   // at 0,45,…,315° (0 = humid/right, CCW)
const STAGES = ['l', 'd', 's'];
const STATE_MAP = {
    '0,0': 'ok', '1,0': 'w', '1,1': 'wf', '0,1': 'f', '-1,1': 'kf',
    '-1,0': 'c', '-1,-1': 'ct', '0,-1': 't', '1,-1': 'wt',
};

function level(exc, l1, l2) {
    if (exc <= 0) return 0;
    if (exc <= l1) return 1;
    if (exc <= l2) return 2;
    return 3;
}

// records: [{t: °C, phi: 0..1}] (daily means) → {ok, f_l, f_d, …} counts.
export function compassDistribution(records, cz, bands, pressure, mollier) {
    const b = bands || parseWarningBands(true);
    const out = { ok: 0 };
    for (const k of DIRS) for (const st of STAGES) out[`${k}_${st}`] = 0;

    const [tLo, tHi] = cz.range_t;
    const hLo = cz.range_phi[0] * 100, hHi = cz.range_phi[1] * 100;
    // range_x null: comfort zone without absolute_humidity → judged by
    // relative humidity only (pyedautils hum_abs_band=None).
    const useAbs = Array.isArray(cz.range_x);
    const [xLo, xHi] = useAbs ? cz.range_x : [0, 0];
    const tl = [b.orange.dt, b.red.dt];
    const hl = [b.orange.dphi, b.red.dphi];
    const xl = [b.orange.dx / 1000, b.red.dx / 1000];

    for (const r of records) {
        const t = r.t, h = r.phi * 100;
        if (!Number.isFinite(t) || !Number.isFinite(h)) continue;
        const ti = t < tLo ? -1 : t > tHi ? 1 : 0;
        const tExc = ti === 1 ? t - tHi : ti === -1 ? tLo - t : 0;
        const tLevel = level(tExc, tl[0], tl[1]);

        let hi, hLevel;
        if (useAbs) {
            // Humidity: relative OR absolute (comfort zone's x cap), like pyedautils with hum_abs_band.
            const xa = mollier.get_x_y(t, r.phi, pressure).x;
            hi = (h > hHi || xa > xHi) ? 1 : (h < hLo || xa < xLo) ? -1 : 0;
            const relExc = hi === 1 ? h - hHi : hi === -1 ? hLo - h : 0;
            const absExc = hi === 1 ? xa - xHi : hi === -1 ? xLo - xa : 0;
            hLevel = Math.max(level(relExc, hl[0], hl[1]), level(absExc, xl[0], xl[1]));
        } else {
            hi = h < hLo ? -1 : h > hHi ? 1 : 0;
            const hExc = hi === 1 ? h - hHi : hi === -1 ? hLo - h : 0;
            hLevel = level(hExc, hl[0], hl[1]);
        }

        const lvl = Math.max(tLevel, hLevel);
        const stage = lvl <= 1 ? 'l' : lvl <= 2 ? 'd' : 's';
        const state = STATE_MAP[`${ti},${hi}`];
        out[state === 'ok' ? 'ok' : `${state}_${stage}`] += 1;
    }
    return out;
}

// --- glyph (pyedautils.plots.comfort.plot_comfort_compass) -------------------

const OK_COLOR = '#22C55E';
const STAGE_COLORS = {
    w: { l: '#e49e93', d: '#cf6e60', s: '#b04336' },
    wf: { l: '#dc9dbb', d: '#c66d9a', s: '#a64278' },
    f: { l: '#baa7e2', d: '#9a7ccf', s: '#7954b3' },
    kf: { l: '#9eb0ea', d: '#7289da', s: '#4e63bf' },
    c: { l: '#82b9e5', d: '#3d96d4', s: '#0072af' },
    ct: { l: '#afb982', d: '#8b955f', s: '#69713d' },
    t: { l: '#d6a977', d: '#bf7f29', s: '#965d00' },
    wt: { l: '#e0a383', d: '#cb7545', s: '#ab4b00' },
};
const STAGE_GREYS = { l: '#b2b2b2', d: '#8e8e8e', s: '#6c6c6c' };
const THETA = [0, 45, 90, 135, 180, 225, 270, 315];
const R0 = 1.0;
const AREA = Math.PI * R0 * R0;
const WID_DEG = 40;
const WID_RAD = (WID_DEG * Math.PI) / 180;
const RMAX = Math.sqrt((2 * AREA) / WID_RAD) * 1.04;
const GLYPH_PX = 90;                 // screen radius of the longest arm (fit) or of RMAX (fixed)
const BASE_FONT = 12;                // label font size in viewBox units when the size is unknown
const TARGET_PX = 12.5;              // wanted on-screen label size when the card knows its size
const CHAR_W = 0.58;                 // rough average glyph width per font size unit

const rad = (deg) => (deg * Math.PI) / 180;
const f2 = (v) => v.toFixed(2);

// Outward text placement per direction (plotly textposition in pyedautils).
const LABEL_POS = [
    { anchor: 'start', v: 'middle' }, { anchor: 'start', v: 'top' }, { anchor: 'middle', v: 'top' },
    { anchor: 'end', v: 'top' }, { anchor: 'end', v: 'middle' }, { anchor: 'end', v: 'bottom' },
    { anchor: 'middle', v: 'bottom' }, { anchor: 'start', v: 'bottom' },
];

// Hover/tap tooltip, positioned inside .compass-body (like the diagram's tooltip).
// Mouse: shown while hovering a segment. Touch / pen: a tap opens it, a second
// tap on the same segment, a tap elsewhere on the card or TIP_MS without
// interaction closes it.
const TIP_MS = 5000;

function hideBox(box) {
    clearTimeout(box._timer);
    box._timer = undefined;
    box._owner = null;
    box.style.display = 'none';
}

// Closes every tooltip under `root` (the card's shadow root) and stops its timer.
export function hideTips(root) {
    root?.querySelectorAll?.('.tip').forEach(hideBox);
}

function showTip(el, tip, autoHide) {
    const body = el.closest('.compass-body');
    const box = body && body.querySelector('.tip');
    if (!box) return;
    const b = body.getBoundingClientRect(), r = el.getBoundingClientRect();
    box.replaceChildren();
    tip.lines.forEach((line, i) => {
        const div = document.createElement('div');
        div.textContent = line;
        if (i === 0) div.className = 'tip-head';
        box.appendChild(div);
    });
    box.style.background = tip.bg;
    box.style.color = tip.fg;
    box.style.left = `${r.left + r.width / 2 - b.left}px`;
    box.style.top = `${r.top - b.top}px`;
    box.style.display = 'block';
    box._owner = el;
    clearTimeout(box._timer);
    box._timer = autoHide ? setTimeout(() => hideBox(box), TIP_MS) : undefined;
}

const tipBoxOf = (el) => el.closest('.compass-body')?.querySelector('.tip');
const isMouse = (ev) => ev.pointerType === 'mouse';

function onEnter(ev, tip) {
    if (isMouse(ev)) showTip(ev.currentTarget, tip, false);
}
function onLeave(ev) {
    const box = isMouse(ev) && tipBoxOf(ev.currentTarget);
    if (box) hideBox(box);
}
// The click event does not reliably carry the pointer type: remember it from pointerdown.
function onDown(ev) {
    ev.currentTarget._pointer = ev.pointerType;
}
function onTap(ev, tip) {
    const el = ev.currentTarget;
    const touch = el._pointer && el._pointer !== 'mouse';
    el._pointer = undefined;
    if (!touch) {
        showTip(el, tip, false);
        return;
    }
    const box = tipBoxOf(el);
    if (box && box._owner === el && box.style.display === 'block') hideBox(box);
    else showTip(el, tip, true);
}

// Readable text on a segment colour: dark ink on the light "mild" plane.
const inkOn = (stageKey) => (stageKey === 'l' ? '#1f2733' : '#ffffff');

// t(key, vars) is the card's localize() bound to hass.
// opts.fixedScale: frame to the worst case (pyedautils fixed_scale=True), so the
//   dashed 100 % circle has the same size in every card and rooms are comparable.
//   Default: zoom to this glyph so it fills the space.
// opts.showLabels (default true), opts.showLegend (default false),
// opts.dark: theme is dark → direction labels use the light shade.
export function renderCompass(dist, t, opts = {}) {
    const showLabels = opts.showLabels !== false;
    const labelShade = opts.dark ? 'l' : 's';
    const g = (k) => Number(dist[k] || 0);
    const total = Object.values(dist).reduce((a, v) => a + Number(v || 0), 0);
    const frac = (k) => (total ? g(k) / total : 0);
    const unit = (cnt) => (Math.round(cnt) === 1 ? t('compass.day') : t('compass.days'));
    const name = (k) => t(`compass.names.${k}`);
    const stage = (st) => t(`compass.stages.${st}`);
    const pct = (cnt) => (total ? ((cnt / total) * 100).toFixed(0) : '0');
    const days = (cnt) => `${Math.round(cnt)} ${unit(cnt)} · ${pct(cnt)}%`;
    const dirTotal = (k) => STAGES.reduce((a, st) => a + g(`${k}_${st}`), 0);

    const ok = frac('ok');
    const rGreen = R0 * Math.sqrt(Math.max(ok, 0));

    // Area-true stacked wedges: cumulative area (WID/2)(r²−rg²) = share·AREA.
    const rings = [];
    const armR = [];                  // outer radius per direction (at least the dashed circle)
    let rMax = Math.max(rGreen, R0);
    DIRS.forEach((k, i) => {
        let cum = 0, rPrev = rGreen;
        for (const st of STAGES) {
            const cnt = g(`${k}_${st}`);
            cum += frac(`${k}_${st}`);
            const rNext = Math.sqrt(rGreen * rGreen + (2 * AREA * cum) / WID_RAD);
            if (rNext > rPrev + 1e-9) {
                const tot = dirTotal(k);
                rings.push({
                    r1: rPrev, r2: rNext, deg: THETA[i], color: STAGE_COLORS[k][st],
                    tip: {
                        bg: STAGE_COLORS[k][st], fg: inkOn(st),
                        lines: [
                            `${name(k)} · ${stage(st)}`,
                            days(cnt),
                            `${name(k)}: ${days(tot)}`,
                            STAGES.map((s2) => `${stage(s2)} ${pct(g(`${k}_${s2}`))}%`).join(' / '),
                        ],
                    },
                });
            }
            rPrev = rNext;
        }
        rMax = Math.max(rMax, rPrev);
        armR.push(Math.max(rPrev, R0));
    });
    const K = GLYPH_PX / (opts.fixedScale ? RMAX : rMax);   // px per glyph unit
    const pt = (r, deg) => [r * K * Math.cos(rad(deg)), -r * K * Math.sin(rad(deg))];

    const sectorPath = (r1, r2, deg) => {
        const a0 = deg - WID_DEG / 2, a1 = deg + WID_DEG / 2;
        const [ox0, oy0] = pt(r2, a0), [ox1, oy1] = pt(r2, a1);
        const R2 = r2 * K;
        const d = `M${f2(ox0)},${f2(oy0)}A${f2(R2)},${f2(R2)} 0 0 0 ${f2(ox1)},${f2(oy1)}`;
        if (r1 < 1e-9) return `${d}L0,0Z`;
        const [ix1, iy1] = pt(r1, a1), [ix0, iy0] = pt(r1, a0);
        const R1 = r1 * K;
        return `${d}L${f2(ix1)},${f2(iy1)}A${f2(R1)},${f2(R1)} 0 0 1 ${f2(ix0)},${f2(iy0)}Z`;
    };

    // Each label sits just beyond its own arm, anchored outward so it never
    // reaches back into the glyph. Returns the label specs and the bounding
    // box of glyph + labels (→ viewBox) for a given font size.
    const layout = (font) => {
        const lh = font * 1.08;
        const box = opts.fixedScale
            ? { x0: -RMAX * K, x1: RMAX * K, y0: -RMAX * K, y1: RMAX * K }
            : { x0: -rMax * K, x1: rMax * K, y0: -rMax * K, y1: rMax * K };
        const specs = !showLabels ? [] : THETA.map((deg, i) => {
            const [x, y] = pt(armR[i], deg);
            const [ux, uy] = [Math.cos(rad(deg)), -Math.sin(rad(deg))];
            const gap = font * 0.58;
            const ax = x + ux * gap, ay = y + uy * gap;
            const lines = t(`compass.labels.${DIRS[i]}`).split('\n');
            const pos = LABEL_POS[i];
            const w = Math.max(...lines.map((l) => l.length)) * CHAR_W * font;
            const h = lines.length * lh;
            const top = pos.v === 'top' ? ay - h : pos.v === 'bottom' ? ay : ay - h / 2;
            const left = pos.anchor === 'start' ? ax : pos.anchor === 'end' ? ax - w : ax - w / 2;
            box.x0 = Math.min(box.x0, left); box.x1 = Math.max(box.x1, left + w);
            box.y0 = Math.min(box.y0, top); box.y1 = Math.max(box.y1, top + h);
            return { ax, baseline: top + font * 0.875, anchor: pos.anchor, lines, color: STAGE_COLORS[DIRS[i]][labelShade] };
        });
        const pad = font / 3;
        return { font, lh, specs, vb: [box.x0 - pad, box.y0 - pad, box.x1 - box.x0 + 2 * pad, box.y1 - box.y0 + 2 * pad] };
    };

    // When the card knows how large the glyph box is on screen (opts.boxW /
    // opts.boxH in px; boxH only when the height is fixed), pick the font so the
    // labels render at about TARGET_PX. A few rounds, since the labels change
    // the viewBox and with it the scale.
    let L = layout(BASE_FONT);
    if (showLabels && opts.boxW > 0) {
        for (let round = 0; round < 3; round++) {
            const [, , vw, vh] = L.vb;
            const scale = opts.boxH > 0 ? Math.min(opts.boxW / vw, opts.boxH / vh) : opts.boxW / vw;
            const font = Math.max(6, Math.min(40, TARGET_PX / scale));
            if (Math.abs(font - L.font) < 0.2) break;
            L = layout(font);
        }
    }
    const labels = L.specs.map((p) => svg`<text x=${f2(p.ax)} y=${f2(p.baseline)} text-anchor=${p.anchor} fill=${p.color} font-size=${f2(L.font)} font-weight="500">
        ${p.lines.map((l, j) => svg`<tspan x=${f2(p.ax)} dy=${j === 0 ? 0 : f2(L.lh)}>${l}</tspan>`)}</text>`);
    const vb = L.vb.map(f2).join(' ');

    // Legend rows: in range first, then deviations by count (largest first).
    // The severity split lives in the hover tooltip.
    const rows = [{ k: 'ok', cnt: g('ok'), color: OK_COLOR }];
    const devs = [];
    for (const k of DIRS) {
        const cnt = dirTotal(k);
        if (cnt > 0) devs.push({ k, cnt, color: STAGE_COLORS[k].d });
    }
    devs.sort((a, b) => b.cnt - a.cnt);
    rows.push(...devs);

    const okPct = (ok * 100).toFixed(0);
    const okFont = Math.max(12, Math.min(22, rGreen * K * 0.45));
    const okTip = { bg: OK_COLOR, fg: '#ffffff', lines: [name('ok'), days(g('ok'))] };

    const legend = !opts.showLegend ? nothing : html`
        <div class="legend">
            ${rows.map((r) => html`
                <div class="row"><span class="dot" style="background:${r.color}"></span>
                    <span class="name">${name(r.k)}</span>
                    <span class="count">${Math.round(r.cnt)} <span class="unit">${unit(r.cnt)}</span></span>
                    <span class="share">${pct(r.cnt)}%</span></div>`)}
            ${devs.length ? html`
                <div class="stage-key">
                    ${STAGES.map((st) => html`<span><span class="dot" style="background:${STAGE_GREYS[st]}"></span>${stage(st)}</span>`)}
                </div>` : nothing}
        </div>`;

    return html`
        <div class="compass-body ${opts.showLegend ? 'with-legend' : ''}">
            <div class="glyph-box">
                <svg class="glyph" viewBox=${vb} role="img" aria-label=${t('compass.title')}>
                    <circle class="ref" r=${f2(R0 * K)}></circle>
                    ${rGreen > 0 ? svg`<circle class="seg ok" r=${f2(rGreen * K)} fill=${OK_COLOR}
                        @pointerenter=${(ev) => onEnter(ev, okTip)} @pointerleave=${onLeave}
                        @pointerdown=${onDown} @click=${(ev) => onTap(ev, okTip)}></circle>` : nothing}
                    ${rings.map((w) => svg`<path class="seg" d=${sectorPath(w.r1, w.r2, w.deg)} fill=${w.color}
                        @pointerenter=${(ev) => onEnter(ev, w.tip)} @pointerleave=${onLeave}
                        @pointerdown=${onDown} @click=${(ev) => onTap(ev, w.tip)}></path>`)}
                    ${ok * 100 >= 15 ? svg`<text class="ok-pct" y=${f2(okFont * 0.36)} text-anchor="middle" font-size=${f2(okFont)}>${okPct}%</text>` : nothing}
                    ${labels}
                </svg>
            </div>
            ${legend}
            <div class="tip" role="tooltip"></div>
        </div>
    `;
}
