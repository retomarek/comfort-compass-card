// Renders the built card (dist/comfort-compass-card.js) with deterministic sample
// data in headless Chrome and writes the README images to docs/, including the
// palette overview docs/palettes.png (every palette, dark and light theme).
//
//   npm run build && npm run screenshots
//
// Chrome is taken from $CHROME_PATH, else the first browser found on PATH.
// Runs locally and in .github/workflows/screenshots.yaml.

import { execSync } from 'node:child_process';
import { existsSync, mkdirSync, readFileSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import puppeteer from 'puppeteer-core';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const bundle = readFileSync(resolve(root, 'dist/comfort-compass-card.js'), 'utf8');
const outDir = resolve(root, 'docs');
mkdirSync(outDir, { recursive: true });

function findChrome() {
    if (process.env.CHROME_PATH) return process.env.CHROME_PATH;
    for (const name of ['google-chrome', 'google-chrome-stable', 'chromium-browser', 'chromium']) {
        try {
            const p = execSync(`command -v ${name}`, { encoding: 'utf8' }).trim();
            if (p && existsSync(p)) return p;
        } catch { /* not found */ }
    }
    throw new Error('No Chrome/Chromium found. Set CHROME_PATH.');
}

// Home Assistant's default theme colours, enough for the card chrome.
const THEMES = {
    dark: { page: '#111111', card: '#1c1c1c', text: '#e1e1e1', muted: '#9b9b9b', divider: 'rgba(225,225,225,0.12)' },
    light: { page: '#fafafa', card: '#ffffff', text: '#212121', muted: '#727272', divider: 'rgba(0,0,0,0.12)' },
};

const SHOTS = [
    { file: 'screenshot.png', theme: 'dark', lang: 'en', title: 'Living room', width: 340, extra: {} },
    { file: 'screenshot-light-de.png', theme: 'light', lang: 'de', title: 'Wohnzimmer', width: 560, extra: { show_legend: true } },
];

const CONFIG = {
    type: 'custom:comfort-compass-card',
    temperature_entity: 'sensor.living_room_temperature',
    humidity_entity: 'sensor.living_room_humidity',
    days_to_show: 120,
    altitude: 450,
};

function page(shot) {
    const c = THEMES[shot.theme];
    const config = { ...CONFIG, ...shot.extra, title: shot.title };
    return `<!doctype html><html><head><meta charset="utf-8">
<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Roboto:wght@400;500;700&display=swap">
<style>
  html, body { margin: 0; background: ${c.page}; }
  body { padding: 16px; font-family: Roboto, "Noto Sans", sans-serif; color: ${c.text};
    --primary-text-color: ${c.text}; --secondary-text-color: ${c.muted}; --divider-color: ${c.divider};
    --ha-card-background: ${c.card}; --card-background-color: ${c.card}; }
  #wrap { width: ${shot.width}px; }
</style></head><body><div id="wrap"><comfort-compass-card id="card"></comfort-compass-card></div>
<script>
  // Minimal stand-in for Home Assistant's <ha-card>.
  customElements.define('ha-card', class extends HTMLElement {
    static get observedAttributes() { return ['header']; }
    constructor() {
      super();
      this.attachShadow({ mode: 'open' }).innerHTML =
        '<style>:host{display:block;background:var(--ha-card-background);border-radius:12px;border:1px solid var(--divider-color);overflow:hidden;color:var(--primary-text-color)}' +
        '.h{font:400 24px/1.3 Roboto,sans-serif;padding:20px 16px 4px}</style><div class="h"></div><slot></slot>';
    }
    set header(h) { this.setAttribute('header', h || ''); }
    attributeChangedCallback() {
      const h = this.getAttribute('header'), el = this.shadowRoot.querySelector('.h');
      el.textContent = h || ''; el.hidden = !h;
    }
  });
</script>
<script>${bundle.replace(/<\/script/g, '<\\/script')}</script>
<script>
  // Deterministic sample: 120 days of room climate, July to November.
  const T = ${JSON.stringify(CONFIG.temperature_entity)}, H = ${JSON.stringify(CONFIG.humidity_entity)};
  let seed = 7; const rnd = () => (seed = (seed * 16807) % 2147483647) / 2147483647;
  const end = new Date('2026-11-05T12:00:00Z'), tR = [], hR = [];
  for (let i = 120; i >= 1; i--) {
    const d = new Date(end.getTime() - i * 86400000); d.setUTCHours(0, 0, 0, 0);
    const doy = (d - new Date(Date.UTC(2026, 0, 1))) / 86400000;
    const season = Math.cos(((doy - 200) / 365) * 2 * Math.PI);
    let t = 22.4 + 4.4 * Math.max(season, -0.2) + (rnd() - 0.5) * 2.6; if (rnd() < 0.08) t += 2.6;
    let rh = 47 + 10 * season + (rnd() - 0.5) * 16; if (season < 0.1 && rnd() < 0.3) rh -= 11;
    tR.push({ start: d.toISOString(), mean: +t.toFixed(2) });
    hR.push({ start: d.toISOString(), mean: +Math.max(18, Math.min(80, rh)).toFixed(1) });
  }
  const card = document.getElementById('card');
  card.setConfig(${JSON.stringify(config)});
  card.hass = {
    language: '${shot.lang}', locale: { language: '${shot.lang}' }, themes: { darkMode: ${shot.theme === 'dark'} },
    states: { [T]: { state: '21.8' }, [H]: { state: '43' } },
    callWS: async () => ({ [T]: tR, [H]: hR }),
  };
</script></body></html>`;
}

// --- palette overview --------------------------------------------------------
// One tile per palette: the card on a dark and on a light theme side by side.
// The sample days spread over all eight directions and three stages, so every
// colour of a palette shows. Names come from the editor labels (en.json).
const EN = JSON.parse(readFileSync(resolve(root, 'src/localize/languages/en.json'), 'utf8'));
const PALETTE_NAMES = Object.keys(EN.editor.palettes);
const GALLERY_COLS = 3;
const GALLERY_CARD = 250;

function galleryPage() {
    const tiles = PALETTE_NAMES.map((p) => `
  <figure class="tile"><figcaption><b>${EN.editor.palettes[p]}</b><code>palette: ${p}</code></figcaption>
    <div class="pair">
      <div class="th dark"><comfort-compass-card data-palette="${p}" data-dark="1"></comfort-compass-card></div>
      <div class="th light"><comfort-compass-card data-palette="${p}" data-dark=""></comfort-compass-card></div>
    </div></figure>`).join('');
    const d = THEMES.dark, l = THEMES.light;
    return `<!doctype html><html><head><meta charset="utf-8">
<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Roboto:wght@400;500;700&display=swap">
<style>
  html, body { margin: 0; background: #f3f4f6; }
  body { padding: 20px; font-family: Roboto, "Noto Sans", sans-serif; }
  #wrap { display: grid; grid-template-columns: repeat(${GALLERY_COLS}, auto); gap: 18px; width: max-content; }
  .tile { margin: 0; background: #ffffff; border: 1px solid #e3e5e8; border-radius: 14px; padding: 10px 10px 10px; }
  figcaption { display: flex; justify-content: space-between; align-items: baseline; gap: 8px; padding: 2px 4px 8px;
    font-size: 15px; color: #1f2733; }
  figcaption code { font: 12px/1 "DejaVu Sans Mono", monospace; color: #6b7280; }
  .pair { display: grid; grid-template-columns: repeat(2, ${GALLERY_CARD}px); gap: 8px; }
  .th { border-radius: 12px; }
  .th.dark { --primary-text-color: ${d.text}; --secondary-text-color: ${d.muted}; --divider-color: ${d.divider};
    --ha-card-background: ${d.card}; --card-background-color: ${d.card}; color: ${d.text}; }
  .th.light { --primary-text-color: ${l.text}; --secondary-text-color: ${l.muted}; --divider-color: ${l.divider};
    --ha-card-background: ${l.card}; --card-background-color: ${l.card}; color: ${l.text}; }
</style></head><body><div id="wrap">${tiles}</div>
<script>
  customElements.define('ha-card', class extends HTMLElement {
    constructor() {
      super();
      this.attachShadow({ mode: 'open' }).innerHTML =
        '<style>:host{display:block;background:var(--ha-card-background);border-radius:12px;border:1px solid var(--divider-color);overflow:hidden;color:var(--primary-text-color)}</style><slot></slot>';
    }
    set header(h) {}
  });
</script>
<script>${bundle.replace(/<\/script/g, '<\\/script')}</script>
<script>
  // Deterministic days around the default comfort zone (20–26 °C, 30–65 %):
  // 110 in range and, per direction, mild / moderate / severe days.
  const T = 'sensor.t', H = 'sensor.h', tR = [], hR = [];
  const pts = [];
  for (let i = 0; i < 110; i++) pts.push([23 + ((i * 7) % 9 - 4) * 0.6, 47 + ((i * 5) % 11 - 5) * 2.5]);
  // [dt sign, dphi sign, weight] per direction; offsets per stage.
  const dirs = [[1, 0, 5], [1, 1, 4], [0, 1, 4], [-1, 1, 3], [-1, 0, 4], [-1, -1, 3], [0, -1, 4], [1, -1, 3]];
  const off = [[0.5, 2.5, 3], [1.7, 7.5, 2], [3.6, 15, 1]];
  for (const [st, sh, wgt] of dirs) {
    off.forEach(([dt, dp, n]) => {
      for (let j = 0; j < Math.round(wgt * n / 2) + 1; j++) {
        const t = st > 0 ? 26 + dt : st < 0 ? 20 - dt : 23;
        const h = sh > 0 ? 65 + dp : sh < 0 ? 30 - dp : 47;
        pts.push([t, h]);
      }
    });
  }
  const end = Date.UTC(2026, 10, 5);
  pts.forEach(([t, h], i) => {
    const s = new Date(end - (pts.length - i) * 86400000).toISOString();
    tR.push({ start: s, mean: t }); hR.push({ start: s, mean: h });
  });
  for (const card of document.querySelectorAll('comfort-compass-card')) {
    card.setConfig({
      type: 'custom:comfort-compass-card', temperature_entity: T, humidity_entity: H,
      days_to_show: pts.length + 5, comfort_zone: { temperature: [20, 26], humidity: [30, 65] },
      show_current: false, palette: card.dataset.palette,
    });
    card.hass = {
      language: 'en', locale: { language: 'en' }, themes: { darkMode: !!card.dataset.dark },
      states: { [T]: { state: '23' }, [H]: { state: '47' } },
      callWS: async () => ({ [T]: tR, [H]: hR }),
    };
  }
</script></body></html>`;
}

const browser = await puppeteer.launch({
    executablePath: findChrome(),
    headless: true,
    args: ['--no-sandbox', '--disable-gpu', '--hide-scrollbars'],
});
try {
    for (const shot of SHOTS) {
        const tab = await browser.newPage();
        await tab.setViewport({ width: shot.width + 32, height: 800, deviceScaleFactor: 2 });
        await tab.setContent(page(shot), { waitUntil: 'networkidle0' });
        await tab.evaluate(() => document.fonts.ready);
        // Wait until the card has drawn the compass.
        await tab.waitForFunction(() => {
            const root = document.querySelector('comfort-compass-card')?.shadowRoot;
            return root?.querySelector('.glyph .seg');
        }, { timeout: 15000 });
        const el = await tab.$('#wrap');
        await el.screenshot({ path: resolve(outDir, shot.file) });
        console.log(`docs/${shot.file}`);
        await tab.close();
    }
    const tab = await browser.newPage();
    await tab.setViewport({ width: 1800, height: 1200, deviceScaleFactor: 2 });
    await tab.setContent(galleryPage(), { waitUntil: 'networkidle0' });
    await tab.evaluate(() => document.fonts.ready);
    await tab.waitForFunction((n) => {
        const cards = [...document.querySelectorAll('comfort-compass-card')];
        return cards.length === n && cards.every((c) => c.shadowRoot?.querySelector('.glyph .seg'));
    }, { timeout: 30000 }, PALETTE_NAMES.length * 2);
    // Let the cards size their labels to the measured glyph box.
    await new Promise((r) => setTimeout(r, 400));
    await (await tab.$('#wrap')).screenshot({ path: resolve(outDir, 'palettes.png') });
    console.log('docs/palettes.png');
    await tab.close();
} finally {
    await browser.close();
}
