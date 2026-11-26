import { describe, expect, it } from 'vitest';
import '../src/comfort-compass-card.js';
import {
    cardSizeForHeight,
    BREATHING_RANGE,
    breathingStrength,
    DEFAULT_BREATHING,
    parseComfortZone,
} from '../src/card.js';

const BASE = { type: 'custom:comfort-compass-card', temperature_entity: 'sensor.t', humidity_entity: 'sensor.h' };
const card = () => document.createElement('comfort-compass-card');

describe('registration', () => {
    it('registers the card, the editor and one card-picker entry', async () => {
        expect(customElements.get('comfort-compass-card')).toBeDefined();
        expect(customElements.get('comfort-compass-card-editor')).toBeDefined();
        expect(window.customCards.filter((c) => c.type === 'comfort-compass-card')).toHaveLength(1);
    });
});

describe('parseComfortZone', () => {
    it('defaults without a zone', () => {
        expect(parseComfortZone(undefined)).toEqual({
            range_t: [20, 26],
            range_phi: [0.3, 0.65],
            range_x: [0, 0.012],
        });
    });
    it('converts units and sorts the pairs', () => {
        const cz = parseComfortZone({ temperature: [24, '21'], humidity: [60, 40], absolute_humidity: [10, 2] });
        expect(cz.range_t).toEqual([21, 24]);
        expect(cz.range_phi).toEqual([0.4, 0.6]);
        expect(cz.range_x).toEqual([0.002, 0.01]);
    });
    it('without absolute_humidity there is no absolute limit', () => {
        expect(parseComfortZone({ temperature: [20, 26], humidity: [30, 65] }).range_x).toBeNull();
    });
    it('rejects incomplete or wrong pairs', () => {
        expect(() => parseComfortZone({ humidity: [30, 65] })).toThrow(/comfort_zone.temperature/);
        expect(() => parseComfortZone({ temperature: [20], humidity: [30, 65] })).toThrow(/pair/);
        expect(() => parseComfortZone({ temperature: [20, true], humidity: [30, 65] })).toThrow(/pair/);
        expect(() => parseComfortZone([20, 26])).toThrow(/object/);
    });
});

describe('breathingStrength', () => {
    it('defaults and accepts the range', () => {
        expect(breathingStrength(undefined)).toBe(DEFAULT_BREATHING);
        expect(breathingStrength(BREATHING_RANGE[0])).toBe(BREATHING_RANGE[0]);
        expect(breathingStrength('40')).toBe(40);
    });
    it('is null outside the range or for non-numbers', () => {
        expect(breathingStrength(BREATHING_RANGE[1] + 1)).toBeNull();
        expect(breathingStrength('')).toBeNull();
        expect(breathingStrength(true)).toBeNull();
    });
});

describe('setConfig', () => {
    it('accepts a minimal config', () => {
        expect(() => card().setConfig(BASE)).not.toThrow();
    });
    it.each([
        [{}, /temperature_entity is required/],
        [{ temperature_entity: 'sensor.t' }, /humidity_entity is required/],
        [{ ...BASE, scale: 'huge' }, /scale must be one of/],
        [{ ...BASE, palette: 'rainbow' }, /palette must be one of/],
        [{ ...BASE, breathing: 95 }, /breathing must be a number/],
        [{ ...BASE, show_current: 'yes' }, /show_current must be true or false/],
        [{ ...BASE, days_to_show: 0 }, /days_to_show/],
        [{ ...BASE, pressure: 5 }, /pressure/],
        [{ ...BASE, comfort_zone: { temperature: [20, 26] } }, /comfort_zone.humidity/],
    ])('rejects %j', (config, message) => {
        expect(() => card().setConfig(config)).toThrow(message);
    });
    it('keeps the previous config when a new one is rejected', () => {
        const c = card();
        c.setConfig({ ...BASE, title: 'Living room' });
        expect(() => c.setConfig({ ...BASE, scale: 'huge' })).toThrow();
        expect(c._config.title).toBe('Living room');
        expect(c._scale).toBe('fit');
    });
});

describe('Home Assistant hooks', () => {
    it('stub config picks a temperature and a humidity sensor with statistics', () => {
        const Card = customElements.get('comfort-compass-card');
        const s = (id, dc, sc = 'measurement') => [
            id,
            { entity_id: id, attributes: { device_class: dc, state_class: sc } },
        ];
        const hass = {
            states: Object.fromEntries([
                s('sensor.no_stats', 'temperature', null),
                s('sensor.room_t', 'temperature'),
                s('sensor.room_h', 'humidity'),
            ]),
        };
        expect(Card.getStubConfig(hass)).toMatchObject({
            temperature_entity: 'sensor.room_t',
            humidity_entity: 'sensor.room_h',
        });
        expect(Card.getStubConfig({ states: {} }).temperature_entity).toMatch(/^sensor\./);
    });
    it('grid options: half width, auto height', () => {
        expect(card().getGridOptions()).toEqual({ columns: 6, min_columns: 3, min_rows: 3 });
    });
});

describe('cardSizeForHeight', () => {
    // Home Assistant's rows when auto height is switched off.
    const rowsFor = (n) => Math.ceil((n * 50 + 8) / 64);
    it('gives exactly the rows the card needs', () => {
        for (let h = 40; h <= 900; h += 7) {
            const need = Math.ceil((h + 8) / 64);
            expect(rowsFor(cardSizeForHeight(h)), `${h} px`).toBe(need);
        }
    });
    it('a card stretched to a 5-row neighbour stays at 5 rows', () => {
        expect(rowsFor(cardSizeForHeight(5 * 64 - 8))).toBe(5);
    });
});
