// How tightly the glyph is framed (viewBox) in the scale and height modes.
import { render } from 'lit';
import { describe, expect, it } from 'vitest';
import { renderCompass } from '../src/compass.js';

const t = (key) => key.split('.').pop();
const DIRS = ['f', 'wf', 'w', 'wt', 't', 'ct', 'c', 'kf'];
const dist = (counts) => {
    const d = { ok: 0 };
    for (const k of DIRS) for (const st of ['l', 'd', 's']) d[`${k}_${st}`] = 0;
    return { ...d, ...counts };
};
const viewBox = (d, opts) => {
    const host = document.createElement('div');
    render(renderCompass(d, t, { boxW: 320, ...opts }), host);
    return host.querySelector('svg.glyph').getAttribute('viewBox').split(' ').map(Number);
};

const balanced = dist({ ok: 50, w_l: 5, c_l: 5, f_l: 5, t_l: 5 });
const humidOnly = dist({ ok: 40, f_l: 20, f_d: 20, f_s: 20 }); // one long arm to the right
const warmOnly = dist({ ok: 30, w_l: 30, w_d: 20, w_s: 20 }); // one long arm upwards

describe('viewBox', () => {
    it('fit: no empty band above and below a sideways arm', () => {
        const [, , w, h] = viewBox(humidOnly, {});
        expect(h).toBeLessThan(w * 0.75);
    });

    it('auto height: never taller than wide', () => {
        for (const fixedScale of [false, true]) {
            const [, , w, h] = viewBox(warmOnly, { fixedScale });
            expect(h).toBeLessThanOrEqual(w + 1e-6);
        }
    });

    it('fixed scale, auto height: same width for every glyph (with or without labels), so equal areas stay equal', () => {
        for (const showLabels of [false, true]) {
            const opts = { fixedScale: true, showLabels };
            const widths = [balanced, humidOnly, warmOnly].map((d) => viewBox(d, opts)[2]);
            expect(widths[1]).toBeCloseTo(widths[0], 6);
            expect(widths[2]).toBeCloseTo(widths[0], 6);
            // ...but the empty height is cropped.
            const [, , w, h] = viewBox(balanced, opts);
            expect(h).toBeLessThan(w * 0.8);
        }
    });

    it('fixed scale in a fixed-height tile: the same frame for every glyph', () => {
        for (const showLabels of [false, true]) {
            const opts = { fixedScale: true, fixedHeight: true, boxH: 300, showLabels };
            const boxes = [balanced, humidOnly, warmOnly].map((d) => viewBox(d, opts));
            for (const b of boxes) {
                expect(b[2]).toBeCloseTo(boxes[0][2], 6);
                expect(b[3]).toBeCloseTo(boxes[0][3], 6);
            }
        }
    });
});
