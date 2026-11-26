// How the glyph is framed (viewBox) and where the direction labels go, in the
// scale and height modes.
import { render } from 'lit';
import { describe, expect, it } from 'vitest';
import { renderCompass } from '../src/compass.js';
import { localize } from '../src/localize/localize.js';

const DIRS = ['f', 'wf', 'w', 'wt', 't', 'ct', 'c', 'kf'];
const THETA = [0, 45, 90, 135, 180, 225, 270, 315];
// Glyph geometry from src/compass.js.
const AREA = Math.PI;
const WID = (40 * Math.PI) / 180;
const RMAX = Math.sqrt((2 * AREA) / WID) * 1.04;
const K_FIXED = 90 / RMAX; // GLYPH_PX / RMAX

const dist = (counts) => {
    const d = { ok: 0 };
    for (const k of DIRS) for (const st of ['l', 'd', 's']) d[`${k}_${st}`] = 0;
    return { ...d, ...counts };
};
const share = (d, k) => {
    const total = Object.values(d).reduce((a, b) => a + b, 0);
    return ['l', 'd', 's'].reduce((a, st) => a + d[`${k}_${st}`], 0) / total;
};
// Outer radius of an arm in glyph units (area-true stacking).
const armR = (d, k) => {
    const total = Object.values(d).reduce((a, b) => a + b, 0);
    return Math.max(1, Math.sqrt(d.ok / total + (2 * AREA * share(d, k)) / WID));
};

function draw(d, opts, lang = 'en') {
    const host = document.createElement('div');
    const t = (key, vars) => localize({ locale: { language: lang } }, key, vars);
    render(renderCompass(d, t, { boxW: 320, currentMarker: true, ...opts }), host);
    const vb = host.querySelector('svg.glyph').getAttribute('viewBox').split(' ').map(Number);
    const labels = [...host.querySelectorAll('svg.glyph text.label')].map((el) => ({
        x: Number(el.getAttribute('x')),
        anchor: el.getAttribute('text-anchor'),
        font: Number(el.getAttribute('font-size')),
        lines: [...el.querySelectorAll('tspan')].map((s) => s.textContent),
    }));
    return { vb, labels };
}

const balanced = dist({ ok: 50, w_l: 5, c_l: 5, f_l: 5, t_l: 5 });
const humid30 = dist({ ok: 70, f_l: 10, f_d: 10, f_s: 10 });
const humidOnly = dist({ ok: 40, f_l: 20, f_d: 20, f_s: 20 }); // one long arm to the right
const warmOnly = dist({ ok: 30, w_l: 30, w_d: 20, w_s: 20 }); // one long arm upwards
const cellar = dist({ ok: 0, kf_l: 10, kf_d: 30, kf_s: 60, c_l: 5 });

describe('viewBox', () => {
    it('fit: no empty band above and below a sideways arm', () => {
        const [, , w, h] = draw(humidOnly, {}).vb;
        expect(h).toBeLessThan(w * 0.8);
    });

    it('auto height: never taller than wide', () => {
        for (const fixedScale of [false, true]) {
            const [, , w, h] = draw(warmOnly, { fixedScale }).vb;
            expect(h).toBeLessThanOrEqual(w + 1e-6);
        }
    });

    for (const lang of ['en', 'de']) {
        for (const boxW of [210, 320]) {
            it(`fixed scale, auto height (${lang}, ${boxW} px): same width for every glyph, empty height cropped`, () => {
                const widths = [balanced, humid30, humidOnly, warmOnly, cellar].map(
                    (d) => draw(d, { fixedScale: true, boxW }, lang).vb[2],
                );
                for (const w of widths) expect(w).toBeCloseTo(widths[0], 6);
                const [, , w, h] = draw(balanced, { fixedScale: true, boxW }, lang).vb;
                expect(h).toBeLessThan(w * 0.9);
            });
        }
    }

    it('fixed scale in a fixed-height tile: the same frame for every glyph', () => {
        const opts = { fixedScale: true, fixedHeight: true, boxH: 300 };
        const boxes = [balanced, humidOnly, warmOnly, cellar].map((d) => draw(d, opts).vb);
        for (const b of boxes) {
            expect(b[2]).toBeCloseTo(boxes[0][2], 6);
            expect(b[3]).toBeCloseTo(boxes[0][3], 6);
        }
    });
});

describe('direction labels with fixed scale', () => {
    for (const lang of ['en', 'de']) {
        for (const boxW of [210, 250, 320]) {
            for (const [name, d] of [
                ['balanced', balanced],
                ['30 % humid', humid30],
            ]) {
                it(`${lang}, ${boxW} px, ${name}: side labels clear of the circle and their arm, readable or left out`, () => {
                    const { vb, labels } = draw(d, { fixedScale: true, boxW }, lang);
                    if (!labels.length) return; // too narrow: left out on purpose
                    const scale = boxW / vb[2];
                    expect(labels[0].font * scale).toBeGreaterThanOrEqual(9 - 1e-6);
                    labels.forEach((l, i) => {
                        if (l.anchor === 'middle') return;
                        const inner = Math.abs(l.x); // start / end anchor = the side facing the glyph
                        const arm = armR(d, DIRS[i]) * K_FIXED * Math.abs(Math.cos((THETA[i] * Math.PI) / 180));
                        expect(inner, `${DIRS[i]} vs circle`).toBeGreaterThanOrEqual(K_FIXED - 1e-6);
                        expect(inner, `${DIRS[i]} vs its arm`).toBeGreaterThanOrEqual(arm - 1e-6);
                    });
                });
            }
        }
    }

    it('labels sit at the same place whatever the data (compass rose)', () => {
        const a = draw(balanced, { fixedScale: true }).labels;
        const b = draw(humid30, { fixedScale: true }).labels;
        a.forEach((l, i) => {
            // A label shrunk to fit beside a long arm still ends at the edge, so compare same-size ones.
            if (l.anchor !== 'middle' && b[i].font === l.font) expect(b[i].x).toBeCloseTo(l.x, 6);
        });
    });
});
