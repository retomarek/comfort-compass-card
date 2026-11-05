# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## What this project is

A Home Assistant custom dashboard card (Lit + Parcel, no D3) distributed through HACS / the Home Assistant Marketplace. It reads daily means of a temperature and a humidity sensor from long-term statistics and draws an area-true "comfort compass": share of days in range (green disc) and per deviation direction (8 arms, split mild / moderate / severe). Sister project of retomarek/mollier-hx-card, which shares the `comfort_zone` / `warning_bands` config schema.

## Commands

- `npm run build`: Parcel production build (no cache), `src/comfort-compass-card.js` → `dist/comfort-compass-card.js`. Commit `dist/` too.
- `npm run watch`: development build.
- `npm run screenshots`: renders the built bundle with deterministic sample data in headless Chrome (`puppeteer-core`, browser from `$CHROME_PATH` or PATH) into `docs/screenshot*.png`. CI does the same on every push to `main` (`.github/workflows/screenshots.yaml`).
- `npm run social-preview`: re-renders `docs/social-preview.png` from `scripts/social-preview.html` (upload manually: repo Settings → General → Social preview).

No tests, linter or typechecker.

## Architecture

- `src/comfort-compass-card.js`: entry; registers `comfort-compass-card` and `comfort-compass-card-editor`, `window.customCards`, console version banner (keep `version` in sync with `package.json`).
- `src/card.js`: `ComfortCompassCard` (LitElement). `setConfig` parses comfort zone (user units → °C / 0..1 / kg/kg), bands, pressure/altitude. First `hass` triggers `recorder/statistics_during_period` (period day, mean). Reactive props are initialised in the constructor, never as class fields (a class field shadows Lit's accessor and breaks re-rendering).
- `src/compass.js`: `compassDistribution()` is a 1:1 port of `pyedautils.comfort.comfort_compass_distribution` (stage limits = band offsets, humidity judged relative OR absolute). `renderCompass()` draws the glyph as a Lit `svg` template (area-true wedges, labels hugging each arm, viewBox computed from the content) plus optional legend and a hover/tap tooltip.
- `src/bands.js`: band parsing and defaults, shared with mollier-hx-card. Keep in sync.
- `src/vendor/mollierFunctions.js`: verbatim from pyedautils `data/d3_mollierhx` (+ ES exports); used for absolute humidity.
- `src/editor.js`: `<ha-form>` editor; writes only non-default values; keeps `grid_options` and YAML-only band keys.
- `src/localize/`: `en.json` is base and fallback; add keys to `en.json` and `de.json` together.

## Sizing (dashboard best practice)

HA sets `layout` on the card ("grid" in sections, "panel" in panel view, unset in masonry). Fixed mode = `layout === 'panel'` or (`layout === 'grid'` and `grid_options.rows` is a number), reflected as the `fixed-height` attribute: the card fills the tile, the glyph fits the remaining space (max 380 px). Auto mode: glyph max 340 px wide, centred. Legend beside the glyph from 480 px container width, below otherwise. `getGridOptions()` = `{columns: 6, min_columns: 3, min_rows: 3}` (no default rows → auto height), `getCardSize()` = 5. Default `scale: fit` (each glyph zoomed to itself, not comparable across cards; the README says so); `scale: fixed` frames to RMAX so the 100 % circle is the same size everywhere (pyedautils `fixed_scale=True`). The user chose `fit` as default on 2026-11-05. Pattern follows HA's built-in gauge / statistics-graph cards.

## Releasing

SemVer. Bump `package.json` and the `version` constant, build, update `CHANGELOG.md`, push, publish a GitHub release `vX.Y.Z` (pre-release for betas); `.github/workflows/release.yaml` attaches `comfort-compass-card.js`. `hacs/action` validation (category `plugin`) must pass; the catalog (`hacs/default`, file `plugin`) also needs README images. Dashboard cards get no custom icon in HACS / Marketplace lists (only integrations do).

## Claude Code setup

- `.claude/agents/card-reviewer.md`: read-only reviewer with the HA card, Lit, compass-logic, translation and packaging checklist. Run it on a change before committing or releasing.
- `.claude/skills/visual-check/`: `npm run visual-check` renders the bundle in ~12 dashboard situations (`scripts/visual-check.mjs`, output in `tmp/visual/`); look at the images after any rendering, style or sizing change.
- `.claude/skills/release/`: release checklist (versions, changelog, workflows, HACS catalog).
