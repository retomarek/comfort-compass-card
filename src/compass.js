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
import { DEFAULT_PALETTE, resolvePalette } from './palettes.js';

// --- classification (pyedautils.comfort.comfort_compass_distribution) ------

const DIRS = ['f', 'wf', 'w', 'wt', 't', 'ct', 'c', 'kf']; // at 0,45,…,315° (0 = humid/right, CCW)
const STAGES = ['l', 'd', 's'];
const STATE_MAP = {
    '0,0': 'ok',
    '1,0': 'w',
    '1,1': 'wf',
    '0,1': 'f',
    '-1,1': 'kf',
    '-1,0': 'c',
    '-1,-1': 'ct',
    '0,-1': 't',
    '1,-1': 'wt',
};

function level(exc, l1, l2) {
    if (exc <= 0) return 0;
    if (exc <= l1) return 1;
    if (exc <= l2) return 2;
    return 3;
}

// Classifies one record {t: °C, phi: 0..1} → 'ok' or '<direction>_<stage>'
// (e.g. 'w_l'), or null for missing values. Used for the daily means and for
// the live sensor values, so the "now" marker always agrees with the glyph.
export function classifyRecord(r, cz, bands, pressure, mollier) {
    const b = bands || parseWarningBands(true);
    const t = r.t,
        h = r.phi * 100;
    if (!Number.isFinite(t) || !Number.isFinite(h)) return null;
    const [tLo, tHi] = cz.range_t;
    const hLo = cz.range_phi[0] * 100,
        hHi = cz.range_phi[1] * 100;
    // range_x null: comfort zone without absolute_humidity → judged by
    // relative humidity only (pyedautils hum_abs_band=None).
    const useAbs = Array.isArray(cz.range_x);
    const [xLo, xHi] = useAbs ? cz.range_x : [0, 0];
    const tl = [b.orange.dt, b.red.dt];
    const hl = [b.orange.dphi, b.red.dphi];
    const xl = [b.orange.dx / 1000, b.red.dx / 1000];

    const ti = t < tLo ? -1 : t > tHi ? 1 : 0;
    const tExc = ti === 1 ? t - tHi : ti === -1 ? tLo - t : 0;
    const tLevel = level(tExc, tl[0], tl[1]);

    let hi, hLevel;
    if (useAbs) {
        // Humidity: relative OR absolute (comfort zone's x cap), like pyedautils with hum_abs_band.
        const xa = mollier.get_x_y(t, r.phi, pressure).x;
        hi = h > hHi || xa > xHi ? 1 : h < hLo || xa < xLo ? -1 : 0;
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
    return state === 'ok' ? 'ok' : `${state}_${stage}`;
}

// records: [{t: °C, phi: 0..1}] (daily means) → {ok, f_l, f_d, …} counts.
export function compassDistribution(records, cz, bands, pressure, mollier) {
    const out = { ok: 0 };
    for (const k of DIRS) for (const st of STAGES) out[`${k}_${st}`] = 0;
    for (const r of records) {
        const key = classifyRecord(r, cz, bands, pressure, mollier);
        if (key) out[key] += 1;
    }
    return out;
}

// --- glyph (pyedautils.plots.comfort.plot_comfort_compass) -------------------

const THETA = [0, 45, 90, 135, 180, 225, 270, 315];
const R0 = 1.0;
const AREA = Math.PI * R0 * R0;
const WID_DEG = 40;
const WID_RAD = (WID_DEG * Math.PI) / 180;
const RMAX = Math.sqrt((2 * AREA) / WID_RAD) * 1.04;
const GLYPH_PX = 90; // screen radius of the longest arm (fit) or of RMAX (fixed)
const BASE_FONT = 12; // label font size in viewBox units when the size is unknown
const TARGET_PX = 12.5; // wanted on-screen label size when the card knows its size
const CHAR_W = 0.58; // rough average glyph width per font size unit
const MIN_LABEL_PX = 9; // fixed scale: smaller direction labels are left out

const rad = (deg) => (deg * Math.PI) / 180;
const f2 = (v) => v.toFixed(2);

// Outward text placement per direction (plotly textposition in pyedautils).
const LABEL_POS = [
    { anchor: 'start', v: 'middle' },
    { anchor: 'start', v: 'top' },
    { anchor: 'middle', v: 'top' },
    { anchor: 'end', v: 'top' },
    { anchor: 'end', v: 'middle' },
    { anchor: 'end', v: 'bottom' },
    { anchor: 'middle', v: 'bottom' },
    { anchor: 'start', v: 'bottom' },
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
    const b = body.getBoundingClientRect(),
        r = el.getBoundingClientRect();
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

// t(key, vars) is the card's localize() bound to hass.
// opts.fixedScale: frame to the worst case (pyedautils fixed_scale=True), so the
//   dashed 100 % circle has the same size in every card and rooms are comparable.
//   Default: zoom to this glyph so it fills the space.
// opts.fixedHeight: the card fills a tile of fixed height (the glyph is fitted
//   into width and height). Decides how tightly the viewBox is cropped.
// opts.showLabels (default true), opts.showLegend (default false),
// opts.dark: theme is dark → direction labels use the lightest shade, and
//   palettes with a dark variant use it.
// opts.palette: palette name (src/palettes.js), default 'default'.
// opts.current: live reading {key, t, phi, x} (key from classifyRecord) → the
//   matching segment breathes in its own colour (or a dot where the segment
//   would start when no day fell into that state yet).
// opts.currentMarker (default true): mark the live state in the glyph
//   (breathing segment or dot).
// opts.currentLegend (default true): show the "now" line. Marker and line
//   are independent; either needs opts.current.
export function renderCompass(dist, t, opts = {}) {
    const showLabels = opts.showLabels !== false;
    const pal = resolvePalette(opts.palette || DEFAULT_PALETTE, !!opts.dark);
    const OK_COLOR = pal.ok;
    const STAGE_COLORS = pal.stages;
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
    const armR = []; // outer radius per direction (at least the dashed circle)
    const stageR = {}; // inner radius of every stage slot, also of empty ones
    let rMax = Math.max(rGreen, R0);
    DIRS.forEach((k, i) => {
        let cum = 0,
            rPrev = rGreen;
        for (const st of STAGES) {
            const cnt = g(`${k}_${st}`);
            cum += frac(`${k}_${st}`);
            const rNext = Math.sqrt(rGreen * rGreen + (2 * AREA * cum) / WID_RAD);
            stageR[`${k}_${st}`] = rPrev;
            if (rNext > rPrev + 1e-9) {
                rings.push({
                    key: `${k}_${st}`,
                    r1: rPrev,
                    r2: rNext,
                    deg: THETA[i],
                    color: STAGE_COLORS[k][st],
                    tip: {
                        bg: STAGE_COLORS[k][st],
                        fg: pal.ink(k, st),
                        // Only the hovered segment: direction · stage and its days.
                        lines: [`${name(k)} · ${stage(st)}`, days(cnt)],
                    },
                });
            }
            rPrev = rNext;
        }
        rMax = Math.max(rMax, rPrev);
        armR.push(Math.max(rPrev, R0));
    });
    const K = GLYPH_PX / (opts.fixedScale ? RMAX : rMax); // px per glyph unit
    const pt = (r, deg) => [r * K * Math.cos(rad(deg)), -r * K * Math.sin(rad(deg))];

    const sectorPath = (r1, r2, deg) => {
        const a0 = deg - WID_DEG / 2,
            a1 = deg + WID_DEG / 2;
        const [ox0, oy0] = pt(r2, a0),
            [ox1, oy1] = pt(r2, a1);
        const R2 = r2 * K;
        const d = `M${f2(ox0)},${f2(oy0)}A${f2(R2)},${f2(R2)} 0 0 0 ${f2(ox1)},${f2(oy1)}`;
        if (r1 < 1e-9) return `${d}L0,0Z`;
        const [ix1, iy1] = pt(r1, a1),
            [ix0, iy0] = pt(r1, a0);
        const R1 = r1 * K;
        return `${d}L${f2(ix1)},${f2(iy1)}A${f2(R1)},${f2(R1)} 0 0 1 ${f2(ix0)},${f2(iy0)}Z`;
    };

    // What is drawn: the dashed 100 % circle (it holds the green disc) and
    // every arm that reaches beyond it, with the extremes of its outer arc.
    const content = { x0: -R0 * K, x1: R0 * K, y0: -R0 * K, y1: R0 * K };
    THETA.forEach((deg, i) => {
        if (armR[i] <= R0 + 1e-9) return;
        const a0 = deg - WID_DEG / 2,
            a1 = deg + WID_DEG / 2;
        const angles = [a0, a1, ...[0, 90, 180, 270].filter((a) => a > a0 && a < a1)];
        for (const a of angles) {
            const [x, y] = pt(armR[i], a);
            content.x0 = Math.min(content.x0, x);
            content.x1 = Math.max(content.x1, x);
            content.y0 = Math.min(content.y0, y);
            content.y1 = Math.max(content.y1, y);
        }
    });
    // Frame before the labels:
    // - fit: just the content, so no empty band above or below a lopsided glyph.
    // - fixed, auto height: the width stays ±RMAX (it sets the scale, so equal
    //   areas stay equal across cards of the same width); only the empty height
    //   is cropped, which does not change the scale.
    // - fixed in a fixed-height tile: the full ±RMAX square, because there the
    //   height can set the scale too.
    const frame = () => {
        if (!opts.fixedScale) return { ...content };
        const sq = RMAX * K;
        return opts.fixedHeight
            ? { x0: -sq, x1: sq, y0: -sq, y1: sq }
            : { x0: -sq, x1: sq, y0: content.y0, y1: content.y1 };
    };

    // Each label sits just beyond its own arm, anchored outward so it never
    // reaches back into the glyph. Returns the label specs and the bounding
    // box of glyph + labels (→ viewBox) for a given font size.
    // Label i placed just beyond an arm of radius r: text spec and its box.
    const placeLabel = (i, r, font, lh) => {
        const deg = THETA[i];
        const [x, y] = pt(r, deg);
        const [ux, uy] = [Math.cos(rad(deg)), -Math.sin(rad(deg))];
        const gap = font * 0.58;
        const ax = x + ux * gap,
            ay = y + uy * gap;
        const lines = t(`compass.labels.${DIRS[i]}`).split('\n');
        const pos = LABEL_POS[i];
        const w = Math.max(...lines.map((l) => l.length)) * CHAR_W * font;
        const h = lines.length * lh;
        const top = pos.v === 'top' ? ay - h : pos.v === 'bottom' ? ay : ay - h / 2;
        const left = pos.anchor === 'start' ? ax : pos.anchor === 'end' ? ax - w : ax - w / 2;
        return { ax, top, left, w, h, lines, anchor: pos.anchor };
    };
    const grow = (box, l) => {
        box.x0 = Math.min(box.x0, l.left);
        box.x1 = Math.max(box.x1, l.left + l.w);
        box.y0 = Math.min(box.y0, l.top);
        box.y1 = Math.max(box.y1, l.top + l.h);
    };

    // Fixed scale: the frame (x always, y too in a fixed-height tile) must not
    // depend on the data, or a long arm pushing its label outwards would zoom
    // this card out and equal areas would no longer look equal. So the labels
    // do not follow the arms there: like a compass rose, side and diagonal
    // labels sit at the left / right edge of the frame (top and bottom ones too
    // in a fixed-height tile), the same in every card. Their font is capped so
    // the widest of them fits between the dashed circle and the edge.
    const fixedX = !!opts.fixedScale;
    const fixedY = !!opts.fixedScale && !!opts.fixedHeight;
    const sideChars = Math.max(
        ...THETA.map((deg, i) =>
            deg === 90 || deg === 270
                ? 0
                : Math.max(
                      ...t(`compass.labels.${DIRS[i]}`)
                          .split('\n')
                          .map((l) => l.length),
                  ),
        ),
    );
    const fixedFontCap = ((RMAX - 1.08 * R0) * K) / (sideChars * CHAR_W + 0.58);

    // minFont (viewBox units): with fixed scale, a side label whose arm leaves
    // too little room to the edge is drawn smaller, down to minFont, and left
    // out below that (the tooltip still names the arm).
    const layout = (font, withLabels = showLabels, minFont = 0) => {
        const box = frame();
        const fr = { ...box };
        const specs = [];
        if (withLabels) {
            THETA.forEach((deg, i) => {
                let f = font;
                const side = fixedX && deg !== 90 && deg !== 270;
                if (side) {
                    // Horizontal reach of the arm (the outer arc spans ±WID_DEG / 2).
                    const reach =
                        armR[i] *
                        K *
                        Math.max(...[deg - WID_DEG / 2, deg + WID_DEG / 2].map((a) => Math.abs(Math.cos(rad(a)))));
                    const chars = Math.max(
                        ...t(`compass.labels.${DIRS[i]}`)
                            .split('\n')
                            .map((l) => l.length),
                    );
                    const room = fr.x1 - Math.max(reach, 1.08 * R0 * K);
                    f = Math.min(font, room / (chars * CHAR_W + 0.58));
                    if (f < minFont) return;
                }
                const lh = f * 1.08;
                const l = placeLabel(i, armR[i], f, lh);
                if (side) {
                    const dx = l.anchor === 'start' ? fr.x1 - (l.left + l.w) : fr.x0 - l.left;
                    l.left += dx;
                    l.ax += dx;
                }
                // Top and bottom labels: inside the edge of a fixed-height tile;
                // with auto height above / below everything drawn, so a long
                // neighbouring arm never runs into them.
                if (fixedY && l.anchor === 'middle') l.top = deg === 90 ? fr.y0 : fr.y1 - l.h;
                else if (fixedX && l.anchor === 'middle') {
                    const gap = f * 0.3;
                    l.top = deg === 90 ? Math.min(l.top, fr.y0 - l.h - gap) : Math.max(l.top, fr.y1 + gap);
                }
                grow(box, l);
                specs.push({
                    ax: l.ax,
                    baseline: l.top + f * 0.875,
                    anchor: l.anchor,
                    lines: l.lines,
                    font: f,
                    lh,
                    color: pal.labelColor(DIRS[i], !!opts.dark),
                });
            });
        }
        // Room for the "now" dot at an arm tip.
        // Not tied to whether a live value is there right now, so the frame does
        // not jump when the sensor becomes unavailable.
        const pad = font / 3 + (opts.currentMarker !== false ? font * 0.4 : 0);
        let [x, y, w, h] = [box.x0 - pad, box.y0 - pad, box.x1 - box.x0 + 2 * pad, box.y1 - box.y0 + 2 * pad];
        // Auto height: never taller than wide, so the glyph stays within the
        // card's width cap in both directions (a tall, narrow glyph gets side margins).
        if (!opts.fixedHeight && h > w) {
            x -= (h - w) / 2;
            w = h;
        }
        return { font, specs, vb: [x, y, w, h] };
    };

    // When the card knows how large the glyph box is on screen (opts.boxW /
    // opts.boxH in px; boxH only when the height is fixed), pick the font so the
    // labels render at about TARGET_PX. A few rounds, since the labels change
    // the viewBox and with it the scale.
    const screenScale = ([, , vw, vh]) => (opts.boxH > 0 ? Math.min(opts.boxW / vw, opts.boxH / vh) : opts.boxW / vw);
    const capFont = (f) => (fixedX ? Math.min(f, fixedFontCap) : f);
    let L = layout(capFont(BASE_FONT));
    // Also without direction labels: the text in the green disc uses the same size.
    if (opts.boxW > 0) {
        for (let round = 0; round < 3; round++) {
            const font = capFont(Math.max(6, Math.min(40, TARGET_PX / screenScale(L.vb))));
            if (Math.abs(font - L.font) < 0.2) break;
            L = layout(font);
        }
        if (fixedX && showLabels) {
            // The frame does not depend on the labels here, so the scale is known:
            // labels below MIN_LABEL_PX on screen are left out, all of them when
            // even the cap is too small (narrow card).
            const minFont = MIN_LABEL_PX / screenScale(L.vb);
            L = layout(L.font, L.font >= minFont - 1e-9, minFont);
        }
    }
    // A thin outline in the card colour keeps a label readable where an arm runs under it.
    const labels = L.specs.map(
        (p) =>
            svg`<text class="label" x=${f2(p.ax)} y=${f2(p.baseline)} text-anchor=${p.anchor} fill=${p.color} stroke-width=${f2(p.font * 0.28)} font-size=${f2(p.font)} font-weight="500">
        ${p.lines.map((l, j) => svg`<tspan x=${f2(p.ax)} dy=${j === 0 ? 0 : f2(p.lh)}>${l}</tspan>`)}</text>`,
    );
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

    const okPct = `${(ok * 100).toFixed(0)}%`;
    // Green disc: the share plus the words "in range" when they fit inside;
    // otherwise (small disc) a caption line below the compass says it. Sizes
    // follow the label font, which the card keeps at a readable pixel size.
    const R = rGreen * K;
    const okFont = Math.min(L.font * 2, Math.max(L.font * 1.3, R * 0.42));
    const okWord = name('ok');
    const wordFont = L.font * 0.92;
    const blockH = okFont + wordFont * 1.25;
    const blockW = Math.max(okPct.length * 0.62 * okFont, okWord.length * CHAR_W * wordFont);
    const wordInside = R > 0 && blockH <= R * 1.45 && blockW <= R * 1.8;
    const pctInside = R > 0 && okFont * 1.1 <= R * 1.5 && okPct.length * 0.62 * okFont <= R * 1.45;
    const okTip = { bg: OK_COLOR, fg: pal.okInk, lines: [name('ok'), days(g('ok'))] };

    // Live reading: state, colour, values and tooltip for the "now" marker.
    const cur = opts.current && opts.current.key ? opts.current : null;
    const curDir = cur && cur.key !== 'ok' ? cur.key.split('_')[0] : null;
    const curStage = cur && cur.key !== 'ok' ? cur.key.split('_')[1] : null;
    const curColor = !cur ? null : cur.key === 'ok' ? OK_COLOR : STAGE_COLORS[curDir][curStage];
    const curName = !cur ? '' : cur.key === 'ok' ? name('ok') : `${name(curDir)} · ${stage(curStage)}`;
    // Numbers in the user's locale (27,4 in German); the card works in °C.
    const nf = (v, d) => {
        if (opts.formatNumber) return opts.formatNumber(v, d);
        try {
            return new Intl.NumberFormat(opts.locale || undefined, {
                minimumFractionDigits: d,
                maximumFractionDigits: d,
            }).format(v);
        } catch (e) {
            return v.toFixed(d);
        }
    };
    // Live values in the card's unit system (opts.show from src/units.js).
    const curValues = !cur
        ? ''
        : opts.show
          ? `${opts.show.temperature(cur.t)} · ${nf(cur.phi * 100, 0)} %` +
            (Number.isFinite(cur.x) ? ` · ${opts.show.absHumidity(cur.x)}` : '')
          : `${nf(cur.t, 1)} °C · ${nf(cur.phi * 100, 0)} %` +
            (Number.isFinite(cur.x) ? ` · ${nf(cur.x * 1000, 1)} g/kg` : '');
    const curTip = cur
        ? {
              bg: curColor,
              fg: cur.key === 'ok' ? pal.okInk : pal.ink(curDir, curStage),
              lines: [`${t('compass.now')} · ${curName}`, curValues],
          }
        : null;
    // "Now" marker: the matching segment breathes its own colour (fill
    // opacity), so nothing is drawn on top of the glyph. Only when that state
    // has no segment yet a small dot marks where it would start.
    const marker = !!cur && opts.currentMarker !== false;
    const liveKey = marker ? cur.key : null;
    // The live segment's tip also names the current values (the only place
    // they show when the "Now" line is switched off).
    const nowLine = cur ? `${t('compass.now')}: ${curValues}` : '';
    const withNow = (tip, key) => (key === liveKey ? { ...tip, lines: [...tip.lines, nowLine] } : tip);
    let nowMark = nothing;
    if (marker && !(cur.key === 'ok' ? rGreen > 0 : rings.some((w) => w.key === cur.key))) {
        const [cx, cy] = cur.key === 'ok' ? [0, 0] : pt(stageR[cur.key], THETA[DIRS.indexOf(curDir)]);
        nowMark = svg`<circle class="now-dot" cx=${f2(cx)} cy=${f2(cy)} r=${f2(L.font * 0.38)} fill=${curColor}
            @pointerenter=${(ev) => onEnter(ev, curTip)} @pointerleave=${onLeave}
            @pointerdown=${onDown} @click=${(ev) => onTap(ev, curTip)}></circle>`;
    }

    const legend = !opts.showLegend
        ? nothing
        : html` <div class="legend">
              ${
                  cur && opts.currentLegend !== false
                      ? html` <div class="row now-row">
                            <span class="dot ${marker ? 'now-legend' : ''}" style="background:${curColor}"></span>
                            <span class="name"
                                ><b>${t('compass.now')}</b> · ${curName}<span class="now-values"
                                    >${curValues}</span
                                ></span
                            >
                        </div>`
                      : nothing
              }
              ${rows.map(
                  (r) =>
                      html` <div class="row">
                          <span class="dot" style="background:${r.color}"></span>
                          <span class="name">${name(r.k)}</span>
                          <span class="count">${Math.round(r.cnt)} <span class="unit">${unit(r.cnt)}</span></span>
                          <span class="share">${pct(r.cnt)}%</span>
                      </div>`,
              )}
              ${
                  devs.length
                      ? html` <div class="stage-key">
                            ${STAGES.map((st) => html`<span><span class="dot" style="background:${pal.greys[st]}"></span>${stage(st)}</span>`)}
                        </div>`
                      : nothing
              }
          </div>`;

    return html`
        <div class="compass-body ${opts.showLegend ? 'with-legend' : ''}">
            <div class="glyph-box">
                <svg
                    class="glyph"
                    style="--ccc-ok-ink:${pal.okInk}"
                    viewBox=${vb}
                    role="img"
                    aria-label=${cur ? `${t('compass.title')}. ${t('compass.now')}: ${curName}, ${curValues}` : t('compass.title')}
                >
                    <circle class="ref" r=${f2(R0 * K)}></circle>
                    ${
                        rGreen > 0
                            ? svg`<circle class="seg ok ${liveKey === 'ok' ? 'live' : ''}" r=${f2(rGreen * K)} fill=${OK_COLOR}
                        @pointerenter=${(ev) => onEnter(ev, withNow(okTip, 'ok'))} @pointerleave=${onLeave}
                        @pointerdown=${onDown} @click=${(ev) => onTap(ev, withNow(okTip, 'ok'))}></circle>`
                            : nothing
                    }
                    ${rings.map(
                        (
                            w,
                        ) => svg`<path class="seg ${w.key === liveKey ? 'live' : ''}" d=${sectorPath(w.r1, w.r2, w.deg)} fill=${w.color}
                        @pointerenter=${(ev) => onEnter(ev, withNow(w.tip, w.key))} @pointerleave=${onLeave}
                        @pointerdown=${onDown} @click=${(ev) => onTap(ev, withNow(w.tip, w.key))}></path>`,
                    )}
                    ${
                        wordInside
                            ? svg`<text class="ok-pct" y=${f2(-blockH / 2 + okFont * 0.82)} text-anchor="middle" font-size=${f2(okFont)}>${okPct}</text>
                        <text class="ok-word" y=${f2(blockH / 2 - wordFont * 0.18)} text-anchor="middle" font-size=${f2(wordFont)}>${okWord}</text>`
                            : pctInside
                              ? svg`<text class="ok-pct" y=${f2(okFont * 0.36)} text-anchor="middle" font-size=${f2(okFont)}>${okPct}</text>`
                              : nothing
                    }
                    ${labels} ${nowMark}
                </svg>
            </div>
            ${legend}
            ${
                !wordInside && !opts.showLegend && total > 0
                    ? html` <div class="ok-caption">
                          <span class="dot" style="background:${OK_COLOR}"></span><b>${okPct}</b> ${okWord}
                      </div>`
                    : nothing
            }
            ${
                cur && opts.currentLegend !== false && !opts.showLegend && !opts.compact
                    ? html` <div class="now-caption" title=${curValues}>
                          <span class="dot ${marker ? 'now-legend' : ''}" style="background:${curColor}"></span
                          ><b>${t('compass.now')}</b> ${curName}<span class="now-values inline">${curValues}</span>
                      </div>`
                    : nothing
            }
            <div class="tip" role="tooltip"></div>
        </div>
    `;
}
