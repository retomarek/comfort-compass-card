import { describe, expect, it } from 'vitest';
import { configToData, dataToConfig } from '../src/editor.js';

const BASE = { type: 'custom:comfort-compass-card', temperature_entity: 'sensor.t', humidity_entity: 'sensor.h' };
const roundTrip = (c) => dataToConfig(configToData(c), c);

describe('editor mapping', () => {
    it('opening the editor changes nothing', () => {
        for (const c of [
            BASE,
            { ...BASE, title: 'Bedroom', days_to_show: 90, palette: 'nord', scale: 'fixed', show_legend: true },
            { ...BASE, altitude: 450 },
            { ...BASE, pressure: 96000 },
            { ...BASE, comfort_zone: { temperature: [21, 24], humidity: [35, 55], absolute_humidity: [4, 10] } },
            { ...BASE, comfort_zone: { temperature: [21, 24], humidity: [35, 55] } },
            { ...BASE, warning_bands: { orange: { temperature: 0.5 }, red: { humidity: 12 } } },
            { ...BASE, show_current: false, show_current_legend: false, show_labels: false, breathing: 30 },
        ]) {
            expect(roundTrip(c), JSON.stringify(c)).toEqual(c);
        }
    });

    it('writes no defaults', () => {
        const data = configToData(BASE);
        expect(dataToConfig(data, {})).toEqual(BASE);
    });

    it('keeps keys it does not own (grid_options, visibility, YAML-only band keys)', () => {
        const c = {
            ...BASE,
            grid_options: { columns: 12, rows: 6 },
            visibility: [{ condition: 'screen' }],
            warning_bands: { orange: { temperature: 2, color: '#f80', label: 'Watch' } },
        };
        expect(roundTrip(c)).toEqual(c);
    });

    it('a cleared field falls back instead of writing null', () => {
        const c = { ...BASE, days_to_show: 60, comfort_zone: { temperature: [21, 24], humidity: [35, 55] } };
        const data = { ...configToData(c), days_to_show: undefined, comfort_t_min: '', orange_dt: null };
        const out = dataToConfig(data, c);
        expect(out.days_to_show).toBe(60);
        expect(out.comfort_zone.temperature).toEqual([21, 24]);
        expect(JSON.stringify(out)).not.toMatch(/null/);
    });

    it('writes either altitude or pressure, never both', () => {
        const data = { ...configToData({ ...BASE, pressure: 96000 }), air_mode: 'altitude', altitude: 600 };
        const out = dataToConfig(data, { ...BASE, pressure: 96000 });
        expect(out.altitude).toBe(600);
        expect(out).not.toHaveProperty('pressure');
    });

    it('without altitude and pressure: Home Assistant, nothing written', () => {
        const hass = { config: { elevation: 1500 } };
        const data = configToData(BASE, hass);
        expect(data.air_mode).toBe('home');
        expect(data.altitude).toBe(1500); // suggestion when switching to an own altitude
        expect(dataToConfig(data, BASE)).toEqual(BASE);
    });

    it('switching to Home Assistant removes altitude or pressure', () => {
        for (const c of [
            { ...BASE, altitude: 450 },
            { ...BASE, pressure: 96000 },
        ]) {
            const out = dataToConfig({ ...configToData(c), air_mode: 'home' }, c);
            expect(out).not.toHaveProperty('altitude');
            expect(out).not.toHaveProperty('pressure');
        }
    });

    it('switching from Home Assistant to a pressure starts from the pressure at its elevation', () => {
        const data = configToData(BASE, { config: { elevation: 1500 } });
        const out = dataToConfig({ ...data, air_mode: 'pressure' }, BASE);
        expect(out.pressure).toBe(84556);
    });
});
