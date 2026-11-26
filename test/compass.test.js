import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { describe, expect, it } from 'vitest';
import { parseWarningBands } from '../src/bands.js';
import { parseComfortZone } from '../src/card.js';
import { classifyRecord, compassDistribution } from '../src/compass.js';
import { createMollier } from '../src/vendor/mollierFunctions.js';

const mollier = createMollier('classical');
const P = 101325;
const czDefault = parseComfortZone(undefined);
const bandsDefault = parseWarningBands(true);
const classify = (t, rh, cz = czDefault, bands = bandsDefault, p = P) =>
    classifyRecord({ t, phi: rh / 100 }, cz, bands, p, mollier);

describe('classifyRecord', () => {
    it('in range', () => {
        expect(classify(23, 45)).toBe('ok');
        expect(classify(20, 30)).toBe('ok'); // limits belong to the zone
        expect(classify(26, 50)).toBe('ok');
    });
    it('one direction per axis', () => {
        expect(classify(26.5, 45)).toBe('w_l');
        expect(classify(19.5, 45)).toBe('c_l');
        expect(classify(23, 68)).toBe('f_l');
        expect(classify(23, 28)).toBe('t_l');
    });
    it('mixed directions', () => {
        expect(classify(28, 70)).toMatch(/^wf_/);
        expect(classify(18, 70)).toMatch(/^kf_/);
        expect(classify(18, 20)).toMatch(/^ct_/);
        expect(classify(28, 20)).toMatch(/^wt_/);
    });
    it('stages follow the warning bands (mild ≤ orange < moderate ≤ red < severe)', () => {
        expect(classify(27, 45)).toBe('w_l');
        expect(classify(27.1, 45)).toBe('w_d');
        expect(classify(28.5, 45)).toBe('w_d');
        expect(classify(28.6, 45)).toBe('w_s');
    });
    it('the worse axis decides the stage', () => {
        expect(classify(26.5, 80)).toBe('wf_s');
    });
    it('humid by absolute humidity even when the relative humidity is in range', () => {
        // 26 °C / 62 %: about 13 g/kg, above the 12 g/kg cap of the default zone.
        const x = mollier.get_x_y(26, 0.62, P).x * 1000;
        expect(x).toBeGreaterThan(12);
        expect(classify(26, 62)).toMatch(/^f_/);
        const relOnly = parseComfortZone({ temperature: [20, 26], humidity: [30, 65] });
        expect(classify(26, 62, relOnly)).toBe('ok');
    });
    it('returns null for missing values', () => {
        expect(classify(NaN, 50)).toBeNull();
        expect(classify(22, NaN)).toBeNull();
    });
});

describe('compassDistribution', () => {
    it('counts every category, zero included', () => {
        const d = compassDistribution([{ t: 23, phi: 0.45 }], czDefault, bandsDefault, P, mollier);
        expect(Object.keys(d)).toHaveLength(1 + 8 * 3);
        expect(d.ok).toBe(1);
        expect(Object.values(d).reduce((a, b) => a + b, 0)).toBe(1);
    });
    it('skips records with missing values', () => {
        const d = compassDistribution([{ t: NaN, phi: 0.4 }], czDefault, bandsDefault, P, mollier);
        expect(Object.values(d).reduce((a, b) => a + b, 0)).toBe(0);
    });
});

// Reference values computed with pyedautils.comfort.comfort_compass_distribution
// (scripts/gen-compass-fixture.py).
describe('agrees with pyedautils', () => {
    const fixture = JSON.parse(readFileSync(join(process.cwd(), 'test/fixtures/compass.json'), 'utf8'));
    for (const c of fixture.cases) {
        it(`${c.name} (${c.records.length} days, pyedautils ${fixture.pyedautils})`, () => {
            const cz = parseComfortZone(c.comfort_zone);
            const bands = parseWarningBands(c.warning_bands || true);
            const wrong = c.records
                .map((r) => ({ ...r, got: classify(r.t, r.rh, cz, bands, c.pressure) }))
                .filter((r) => r.got !== r.expected);
            expect(wrong).toEqual([]);
            const records = c.records.map((r) => ({ t: r.t, phi: r.rh / 100 }));
            expect(compassDistribution(records, cz, bands, c.pressure, mollier)).toEqual(c.counts);
        });
    }
});
