import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { describe, expect, it } from 'vitest';
import { PALETTE_NAMES, resolvePalette } from '../src/palettes.js';

const DIRS = ['f', 'wf', 'w', 'wt', 't', 'ct', 'c', 'kf'];
// Home Assistant's default card backgrounds (src/palettes.js CARD_BG).
const BG = { dark: '#1c1c1c', light: '#ffffff' };
const HEX = /^#[0-9a-f]{6}$/i;

// WCAG 2 contrast ratio.
const lin = (v) => (v <= 0.04045 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4);
const lum = (hex) => {
    const [r, g, b] = [1, 3, 5].map((i) => lin(parseInt(hex.slice(i, i + 2), 16) / 255));
    return 0.2126 * r + 0.7152 * g + 0.0722 * b;
};
const contrast = (a, b) => {
    const [x, y] = [lum(a), lum(b)].sort((p, q) => q - p);
    return (x + 0.05) / (y + 0.05);
};
const lang = (code) => JSON.parse(readFileSync(join(process.cwd(), `src/localize/languages/${code}.json`), 'utf8'));

describe('palettes', () => {
    it('every palette has a name in en and de', () => {
        for (const code of ['en', 'de']) {
            const names = lang(code).editor.palettes;
            expect(
                PALETTE_NAMES.filter((p) => !names[p]),
                code,
            ).toEqual([]);
        }
    });

    for (const name of PALETTE_NAMES) {
        for (const dark of [true, false]) {
            const theme = dark ? 'dark' : 'light';
            it(`${name} (${theme}): colours for every direction and stage, readable labels`, () => {
                const p = resolvePalette(name, dark);
                expect(p.ok).toMatch(HEX);
                for (const k of DIRS) {
                    for (const st of ['l', 'd', 's']) {
                        expect(p.stages[k][st], `${k}_${st}`).toMatch(HEX);
                        expect(p.ink(k, st), `${k}_${st} ink`).toMatch(HEX);
                    }
                    const label = p.labelColor(k, dark);
                    expect(contrast(label, BG[theme]), `${k} label ${label} on ${BG[theme]}`).toBeGreaterThanOrEqual(
                        4.5,
                    );
                }
            });
        }
    }
});
