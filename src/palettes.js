// Colour palettes for the compass (`palette` option).
//
// Every palette keeps the meaning of the glyph: warm is reddish at the top,
// cold bluish at the bottom, humid on the right, dry on the left, the
// mixtures in between, and "in range" stands out in the centre. A palette
// gives one base colour per direction; the three severity stages are derived
// from it in OKLCH (same hue, stepped lightness), so mild → severe always
// reads as a ramp. A palette may give separate `dark` and `light` variants;
// the card picks the one that matches the Home Assistant theme.
//
// Ramps: 'down' (default) = mild light → severe dark, for most themes.
//        'up' = mild dim → severe bright, for glowing colours on dark cards.

const DIRS = ['f', 'wf', 'w', 'wt', 't', 'ct', 'c', 'kf'];

// --- colour maths (sRGB ↔ OKLab / OKLCH) -------------------------------------

const toLin = (c) => (c <= 0.04045 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4);
const toGam = (c) => (c <= 0.0031308 ? 12.92 * c : 1.055 * c ** (1 / 2.4) - 0.055);

function hexToRgb(hex) {
    const h = hex.replace('#', '');
    const n = parseInt(h.length === 3 ? h.split('').map((c) => c + c).join('') : h, 16);
    return [(n >> 16) & 255, (n >> 8) & 255, n & 255].map((v) => v / 255);
}

const rgbToHex = (rgb) => `#${rgb.map((v) => Math.round(Math.min(1, Math.max(0, v)) * 255).toString(16).padStart(2, '0')).join('')}`;

function rgbToOklch(rgb) {
    const [r, g, b] = rgb.map(toLin);
    const l = Math.cbrt(0.4122214708 * r + 0.5363325363 * g + 0.0514459929 * b);
    const m = Math.cbrt(0.2119034982 * r + 0.6806995451 * g + 0.1073969566 * b);
    const s = Math.cbrt(0.0883024619 * r + 0.2817188376 * g + 0.6299787005 * b);
    const L = 0.2104542553 * l + 0.793617785 * m - 0.0040720468 * s;
    const A = 1.9779984951 * l - 2.428592205 * m + 0.4505937099 * s;
    const B = 0.0259040371 * l + 0.7827717662 * m - 0.808675766 * s;
    return [L, Math.hypot(A, B), Math.atan2(B, A)];
}

function oklchToRgb([L, C, H]) {
    const A = C * Math.cos(H), B = C * Math.sin(H);
    const l = (L + 0.3963377774 * A + 0.2158037573 * B) ** 3;
    const m = (L - 0.1055345942 * A - 0.0638541728 * B) ** 3;
    const s = (L - 0.0894841775 * A - 1.291485548 * B) ** 3;
    return [
        4.0767416621 * l - 3.3077115913 * m + 0.2309699292 * s,
        -1.2684380046 * l + 2.6097574011 * m - 0.3413193965 * s,
        -0.0041960863 * l - 0.7034186147 * m + 1.707614701 * s,
    ].map(toGam);
}

const inGamut = (rgb) => rgb.every((v) => v >= -1e-4 && v <= 1 + 1e-4);

// OKLCH → hex, lowering the chroma until the colour fits into sRGB.
function lch(L, C, H) {
    L = Math.min(0.98, Math.max(0.12, L));
    let rgb = oklchToRgb([L, C, H]);
    for (let i = 0; i < 30 && !inGamut(rgb); i++) {
        C *= 0.92;
        rgb = oklchToRgb([L, C, H]);
    }
    return rgbToHex(rgb);
}

export const lightness = (hex) => rgbToOklch(hexToRgb(hex))[0];

// WCAG relative luminance and contrast.
function luminance(hex) {
    const [r, g, b] = hexToRgb(hex).map(toLin);
    return 0.2126 * r + 0.7152 * g + 0.0722 * b;
}
const contrast = (a, b) => {
    const [x, y] = [luminance(a), luminance(b)].sort((p, q) => q - p);
    return (x + 0.05) / (y + 0.05);
};

const INK_DARK = '#1f2733';
const INK_LIGHT = '#ffffff';
// Text colour with the better contrast on a fill.
export const inkFor = (hex) => (contrast(hex, INK_LIGHT) >= contrast(hex, INK_DARK) ? INK_LIGHT : INK_DARK);

// Text colour on a typical card (Home Assistant's default dark / light card
// background), stepped in lightness until it reaches WCAG AA (4.5:1).
const CARD_BG = { dark: '#1c1c1c', light: '#ffffff' };
function readable(hex, isDark) {
    const bg = isDark ? CARD_BG.dark : CARD_BG.light;
    const [L, C, H] = rgbToOklch(hexToRgb(hex));
    let out = hex;
    for (let i = 1; i <= 20 && contrast(out, bg) < 4.5; i++) out = lch(L + (isDark ? 0.025 : -0.025) * i, C, H);
    return out;
}

// Three stages from one base colour. `spread` scales the lightness steps.
function ramp(base, dir = 'down', spread = 1) {
    const [L, C, H] = rgbToOklch(hexToRgb(base));
    if (dir === 'up') {
        return { l: lch(L - 0.24 * spread, C * 0.6, H), d: lch(L - 0.11 * spread, C * 0.85, H), s: base };
    }
    return { l: lch(L + 0.13 * spread, C * 0.75, H), d: base, s: lch(L - 0.13 * spread, C * 1.02, H) };
}

// --- palettes ----------------------------------------------------------------
//
// ok: "in range" colour. Directions: w warm, wf warm + humid, f humid,
// kf cold + humid, c cold, ct cold + dry, t dry, wt warm + dry.

export const DEFAULT_PALETTE = 'default';

const PALETTES = {
    // The original look: soft, clear, works on light and dark themes.
    default: {
        ok: '#22C55E',
        okInk: '#ffffff',
        stages: {
            w: { l: '#e49e93', d: '#cf6e60', s: '#b04336' },
            wf: { l: '#dc9dbb', d: '#c66d9a', s: '#a64278' },
            f: { l: '#baa7e2', d: '#9a7ccf', s: '#7954b3' },
            kf: { l: '#9eb0ea', d: '#7289da', s: '#4e63bf' },
            c: { l: '#82b9e5', d: '#3d96d4', s: '#0072af' },
            ct: { l: '#afb982', d: '#8b955f', s: '#69713d' },
            t: { l: '#d6a977', d: '#bf7f29', s: '#965d00' },
            wt: { l: '#e0a383', d: '#cb7545', s: '#ab4b00' },
        },
        greys: { l: '#b2b2b2', d: '#8e8e8e', s: '#6c6c6c' },
        // The original ink: dark text on the light "mild" stage, white otherwise.
        stageInk: { l: INK_DARK, d: INK_LIGHT, s: INK_LIGHT },
    },
    // Glowing colours: bright on dark cards, deep and saturated on light ones.
    neon: {
        dark: {
            ramp: 'up', ok: '#39FF14',
            base: { w: '#FF3366', wf: '#FF2BD6', f: '#B44CFF', kf: '#7A6BFF', c: '#2E9BFF', ct: '#00F0D0', t: '#FFE600', wt: '#FF8A00' },
        },
        light: {
            ok: '#00C853',
            base: { w: '#F0004E', wf: '#D600AA', f: '#9620F0', kf: '#4F45FF', c: '#0080FF', ct: '#00B3A1', t: '#F2B800', wt: '#FF6D00' },
        },
    },
    // Based on Okabe & Ito (2002), the classic colour-blind-safe set: vermillion,
    // orange, yellow, blue, sky blue and reddish purple; violet and slate fill the gaps.
    okabe_ito: {
        ok: '#009E73',
        base: { w: '#D55E00', wf: '#CC79A7', f: '#9B5FC0', kf: '#56B4E9', c: '#0072B2', ct: '#8FA3AD', t: '#F0E442', wt: '#E69F00' },
    },
    // Paul Tol's "muted" scheme: colour-blind safe and calm.
    tol_muted: {
        ok: '#117733',
        base: { w: '#CC6677', wf: '#882255', f: '#AA4499', kf: '#332288', c: '#6699CC', ct: '#44AA99', t: '#DDCC77', wt: '#999933' },
    },
    // Strong, clearly separated colours with high contrast, for low vision and bright rooms.
    high_contrast: {
        dark: {
            ramp: 'up', spread: 1.2, ok: '#3DDC4A',
            base: { w: '#FF4D4D', wf: '#FF5CC8', f: '#C77DFF', kf: '#8C8CFF', c: '#4DB8FF', ct: '#2EE6D6', t: '#FFD60A', wt: '#FF9F1C' },
        },
        light: {
            spread: 1.2, ok: '#008A00',
            base: { w: '#C00000', wf: '#A0007A', f: '#6A00C8', kf: '#2A2AD4', c: '#0057B8', ct: '#006B6B', t: '#9A6A00', wt: '#C04A00' },
        },
    },
    // Soft pastels, like chalk on paper.
    pastel: {
        spread: 0.75, ok: '#7FD1A0',
        base: { w: '#F49C9C', wf: '#EFA0CB', f: '#C3AEF0', kf: '#A6B6F4', c: '#93CBF2', ct: '#9ED8CF', t: '#F3D28E', wt: '#F6B48F' },
    },
    // Material Design / Home Assistant's named colours (as used by Mushroom and tile cards).
    material: {
        ok: '#4CAF50',
        base: { w: '#F44336', wf: '#E91E63', f: '#9C27B0', kf: '#3F51B5', c: '#2196F3', ct: '#009688', t: '#FFC107', wt: '#FF9800' },
    },
    // Nord: arctic frost blues and aurora colours.
    nord: {
        ok: '#A3BE8C',
        base: { w: '#BF616A', wf: '#B48EAD', f: '#8C7FC0', kf: '#5E81AC', c: '#81A1C1', ct: '#8FBCBB', t: '#EBCB8B', wt: '#D08770' },
    },
    // Dracula (dark) and Alucard (light).
    dracula: {
        dark: {
            ramp: 'up', ok: '#50FA7B',
            base: { w: '#FF5555', wf: '#FF79C6', f: '#BD93F9', kf: '#8A9BEA', c: '#8BE9FD', ct: '#7FE3C4', t: '#F1FA8C', wt: '#FFB86C' },
        },
        light: {
            ok: '#14710A',
            base: { w: '#CB3A2A', wf: '#A3144D', f: '#644AC9', kf: '#3A5BA0', c: '#036A96', ct: '#1F7A6E', t: '#846E15', wt: '#A34D14' },
        },
    },
    // Catppuccin: Mocha on dark themes, Latte on light ones.
    catppuccin: {
        dark: {
            ramp: 'up', ok: '#A6E3A1',
            base: { w: '#F38BA8', wf: '#F5C2E7', f: '#CBA6F7', kf: '#B4BEFE', c: '#89B4FA', ct: '#94E2D5', t: '#F9E2AF', wt: '#FAB387' },
        },
        light: {
            ok: '#40A02B',
            base: { w: '#D20F39', wf: '#EA76CB', f: '#8839EF', kf: '#7287FD', c: '#1E66F5', ct: '#179299', t: '#DF8E1D', wt: '#FE640B' },
        },
    },
    // Solarized accent colours, the same on light and dark.
    solarized: {
        ok: '#859900',
        base: { w: '#DC322F', wf: '#D33682', f: '#6C71C4', kf: '#4A7ECB', c: '#268BD2', ct: '#2AA198', t: '#B58900', wt: '#CB4B16' },
    },
    // Gruvbox: warm retro colours.
    gruvbox: {
        dark: {
            ramp: 'up', ok: '#B8BB26',
            base: { w: '#FB4934', wf: '#E8687A', f: '#D3869B', kf: '#A396B8', c: '#83A598', ct: '#8EC07C', t: '#FABD2F', wt: '#FE8019' },
        },
        light: {
            ok: '#79740E',
            base: { w: '#9D0006', wf: '#A8325A', f: '#8F3F71', kf: '#5D5A8C', c: '#076678', ct: '#427B58', t: '#B57614', wt: '#AF3A03' },
        },
    },
    // Tokyo Night: deep blue night with neon accents.
    tokyo_night: {
        dark: {
            ramp: 'up', ok: '#9ECE6A',
            base: { w: '#F7768E', wf: '#FF7AC6', f: '#BB9AF7', kf: '#7AA2F7', c: '#7DCFFF', ct: '#73DACA', t: '#E0AF68', wt: '#FF9E64' },
        },
        light: {
            ok: '#485E30',
            base: { w: '#8C4351', wf: '#9A3D7C', f: '#5A4A78', kf: '#34548A', c: '#0F4B6E', ct: '#33635C', t: '#8F5E15', wt: '#965027' },
        },
    },
    // Bauhaus: primary red, yellow and blue, a design classic.
    bauhaus: {
        ok: '#2F8F46',
        base: { w: '#D62828', wf: '#B5226B', f: '#6B3FA0', kf: '#2F4FA8', c: '#1D4E9E', ct: '#2D7F8C', t: '#F2C12E', wt: '#EE7A1A' },
    },
    // Vintage: faded print colours, like an old atlas.
    vintage: {
        ok: '#7A9A5B',
        base: { w: '#B5523B', wf: '#A85A6E', f: '#7E6B8F', kf: '#5E6F8E', c: '#4F7A94', ct: '#6E8B74', t: '#C9A35B', wt: '#C27A45' },
    },
    // Earth: forest, clay, sand and lake.
    earth: {
        ok: '#5E8C31',
        base: { w: '#A0442D', wf: '#8B4C6A', f: '#6A5A8E', kf: '#4E6A8E', c: '#3E7CA6', ct: '#5F8F7A', t: '#D2A24C', wt: '#C06C2E' },
    },
    // Sunset: coral, rose and violet over a cool sea.
    sunset: {
        ok: '#2BB673',
        base: { w: '#FF5E5B', wf: '#F2587F', f: '#A35CD1', kf: '#5C6BD6', c: '#2E86C1', ct: '#2AB7A9', t: '#FFC145', wt: '#FF8C42' },
    },
    // Minimal: only "in range" in colour, all deviations in neutral greys.
    minimal: {
        ok: '#22C55E', okInk: '#ffffff',
        base: Object.fromEntries(DIRS.map((k) => [k, '#8A94A6'])),
    },
};

export const PALETTE_NAMES = Object.keys(PALETTES);

// Resolved palette for a theme: { ok, okInk, stages: {dir: {l,d,s}}, greys,
// ink(dir, stage) }. Cached per name and theme.
const cache = new Map();
export function resolvePalette(name, dark) {
    const key = `${name}|${dark ? 'd' : 'l'}`;
    if (cache.has(key)) return cache.get(key);
    const entry = PALETTES[name] || PALETTES[DEFAULT_PALETTE];
    const p = entry.dark || entry.light ? (dark ? entry.dark : entry.light) || entry.dark || entry.light : entry;
    const dir = p.ramp || 'down';
    const stages = p.stages || Object.fromEntries(DIRS.map((k) => [k, ramp(p.base[k], dir, p.spread)]));
    const greys = p.greys || ramp(dir === 'up' ? '#b4b4b4' : '#8e8e8e', dir, p.spread);
    const inks = {};
    for (const k of DIRS) {
        inks[k] = {};
        for (const st of ['l', 'd', 's']) inks[k][st] = p.stageInk ? p.stageInk[st] : inkFor(stages[k][st]);
    }
    const labels = new Map();
    const out = {
        ok: p.ok,
        okInk: p.okInk || inkFor(p.ok),
        stages,
        greys,
        ink: (k, st) => inks[k][st],
        // Direction labels: the lightest stage on dark cards, the darkest on
        // light ones, made lighter / darker until the text is readable.
        labelColor: (k, isDark) => {
            const ck = `${k}|${isDark ? 'd' : 'l'}`;
            if (labels.has(ck)) return labels.get(ck);
            const s = stages[k];
            const by = ['l', 'd', 's'].sort((a, b) => lightness(s[a]) - lightness(s[b]));
            const c = readable(s[isDark ? by[2] : by[0]], isDark);
            labels.set(ck, c);
            return c;
        },
    };
    cache.set(key, out);
    return out;
}
