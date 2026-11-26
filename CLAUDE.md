# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## What this project is

A Home Assistant custom dashboard card (Lit + Parcel, no D3) distributed through HACS / the Home Assistant Marketplace. It reads daily means of a temperature and a humidity sensor from long-term statistics and draws an area-true "comfort compass": share of days in range (green disc) and per deviation direction (8 arms, split mild / moderate / severe). Sister project of retomarek/mollier-hx-card, which shares the `comfort_zone` / `warning_bands` config schema.

## Commands

- `npm run build`: Parcel production build (no cache), `src/comfort-compass-card.js` → `dist/comfort-compass-card.js`. `dist/` is gitignored: the release workflow builds and attaches the bundle.
- `npm run watch`: development build.
- `npm run screenshots`: renders the built bundle with deterministic sample data in headless Chrome (`puppeteer-core`, browser from `$CHROME_PATH` or PATH) into `docs/screenshot*.png` and the palette overview `docs/palettes.png`. CI does the same on every push to `main` (`.github/workflows/screenshots.yaml`).
- `npm run social-preview`: re-renders `docs/banner.png` (README header) and `docs/social-preview.png` from `scripts/banner.html` / `scripts/social-preview.html` (upload manually: repo Settings → General → Social preview).
- `npm test`: unit tests (vitest + happy-dom, `test/*.test.js`). `npm run lint` (ESLint, flat config, `--max-warnings 0`), `npm run format` / `format:check` (Prettier: 4 spaces, single quotes, width 120; vendored code is ignored). CI (`.github/workflows/ci.yaml`) runs lint, format check, tests and build on every push.
- `npm run check-shared` (`-- --local ../<sister>` for a local clone): compares the files shared with the sister card (`bands.js`, `statistics.js`, `localize/localize.js`, `mollierFunctions.js`, the shared tests, tooling config, `ci.yaml`) with its `main`; CI fails on a difference. Change shared files in both repos together.
- Golden fixture: `test/fixtures/compass.json` holds pyedautils' classification of 942 days; regenerate with `PYTHONPATH=../pyedautils python scripts/gen-compass-fixture.py` when pyedautils changes.
- Live demo of both cards: lives in the mollier-hx-card repo (`demo/`, `npm run demo` there), published to https://retomarek.github.io/mollier-hx-card/.

## Architecture

- `src/comfort-compass-card.js`: entry; registers `comfort-compass-card` and `comfort-compass-card-editor`, `window.customCards`, console version banner (keep `version` in sync with `package.json`).
- `src/card.js`: `ComfortCompassCard` (LitElement). `setConfig` validates everything before taking the config (throws clear errors), parses comfort zone (user units → °C / 0..1 / kg/kg; a given zone without `absolute_humidity` → `range_x: null`, relative humidity only), bands, pressure/altitude and `days_to_show` (via `src/statistics.js`). First `hass` triggers `recorder/statistics_during_period` (period day, mean); loading shows an empty placeholder, failures retry with `RETRY_MS` back-off. Reactive props are initialised in the constructor, never as class fields (a class field shadows Lit's accessor and breaks re-rendering).
- `src/compass.js`: `compassDistribution()` is a 1:1 port of `pyedautils.comfort.comfort_compass_distribution` (stage limits = band offsets, humidity judged relative OR absolute). `renderCompass()` draws the glyph as a Lit `svg` template (area-true wedges, labels hugging each arm, viewBox computed from the content) plus optional legend and a hover/tap tooltip.
- `src/palettes.js`: `palette` option. Per palette one base colour per direction (+ `ok`), optional `dark` / `light` variants picked by `hass.themes.darkMode`; stages derived in OKLCH (`ramp` 'down' = mild light → severe dark, 'up' = mild dim → severe bright for dark cards). `default` keeps the original explicit colours and ink. Labels are adjusted to WCAG AA against the default card backgrounds. New palette: add it here and its label in `en.json` / `de.json` (`editor.palettes`); `docs/palettes.png` picks it up from `en.json`. Ported 1:1 to pyedautils `pyedautils/plots/_compass_palettes.py` (`plot_comfort_compass(palette=, dark=)`); keep in sync.
- `src/bands.js`: band parsing and defaults, shared with mollier-hx-card. Keep in sync.
- `src/statistics.js`: statistics fetch and config helpers (days, pressure, missing entities), shared with mollier-hx-card. Keep in sync. `airPressure(config, hass)`: `altitude`, else `pressure`, else `hass.config.elevation` (`elevationOf`), else sea level; the card calls it in `setConfig` and again when the elevation in `hass` changes. The editor's *Air pressure from* has `home` (default, writes nothing), `altitude`, `pressure`.
- `src/vendor/mollierFunctions.js`: verbatim from pyedautils `data/d3_mollierhx` (+ ES exports); used for absolute humidity.
- `src/editor.js`: `<ha-form>` editor; writes only non-default values; keeps `grid_options` and YAML-only band keys.
- `src/localize/`: `en.json` is base and fallback; add keys to `en.json` and `de.json` together.

## Sizing (dashboard best practice)

HA sets `layout` on the card ("grid" in sections, "panel" in panel view, unset in masonry). Fixed mode = `layout === 'panel'` or (`layout === 'grid'` and `grid_options.rows` is a number), reflected as the `fixed-height` attribute: the card fills the tile, the glyph fits the remaining space (max 380 px). Auto mode: glyph max 340 px wide, centred. Like HA's own cards, `:host` and `ha-card` are `height: 100%` in both modes: in a sections row with auto height the card stretches to its neighbours (the glyph keeps its size and stays at the top, like HA's gauge); in masonry and stacks that resolves to the content height. Legend beside the glyph from 480 px container width, below otherwise. `getGridOptions()` = `{columns: 6, min_columns: 3, min_rows: 3}` (no default rows → auto height). `getCardSize()` measures the rendered card in auto mode (`ceil(px / 50)`), else estimates from title / legend: HA seeds the row count with it when the user switches auto height off. Default `scale: fit` (each glyph zoomed to itself, not comparable across cards; the README says so); `scale: fixed` frames to RMAX so the 100 % circle is the same size everywhere (pyedautils `fixed_scale=True`).

viewBox and labels (`renderCompass`, tested in `test/viewbox.test.js`): `fit` crops to what is drawn (dashed circle, arms, labels at the arm tips), never taller than wide in auto mode. `fixed` keeps the frame data-independent so areas stay comparable: width ±RMAX always (height cropped to the content in auto mode, the full ±RMAX square in a fixed-height tile, where the height can set the scale). Its labels form a compass rose: side and diagonal labels at the left / right edge, top and bottom ones above / below everything drawn (at the edge in a tile); the font is capped so the widest side label fits between circle and edge; a side label beside a long arm is drawn smaller per label, and left out below 9 px (`MIN_LABEL_PX`), all of them in very narrow cards. Labels have a halo in the card colour.

## Releasing

SemVer. Bump `package.json` and the `version` constant, build, update `CHANGELOG.md`, push, publish a GitHub release `vX.Y.Z` (pre-release for betas); `.github/workflows/release.yaml` attaches `comfort-compass-card.js`. `hacs/action` validation (category `plugin`) must pass; the catalog (`hacs/default`, file `plugin`) also needs README images. Dashboard cards get no custom icon in HACS / Marketplace lists (only integrations do).

## Claude Code setup

- `.claude/agents/card-reviewer.md`: read-only reviewer with the HA card, Lit, compass-logic, translation and packaging checklist. Run it on a change before committing or releasing.
- `.claude/skills/visual-check/`: `npm run visual-check` renders the bundle in ~17 dashboard situations (`scripts/visual-check.mjs`, output in `tmp/visual/`); look at the images after any rendering, style or sizing change.
- `.claude/skills/release/`: release checklist (versions, changelog, workflows, HACS catalog).
