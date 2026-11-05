# Changelog

All notable changes to this card. The format follows [Keep a Changelog](https://keepachangelog.com/en/1.1.0/) and the card uses [Semantic Versioning](https://semver.org/).

## [Unreleased]

### Added

- Translations for French, Italian, Spanish, Portuguese, Dutch, Polish, Swedish, Danish, Norwegian, Czech, Russian and Chinese (Simplified). They are machine-translated; corrections from native speakers are welcome as pull requests.

### Changed

- Build tools updated (Puppeteer 25, GitHub actions checkout/setup-node v7).

## [1.0.0-beta.2] - 2026-11-05

### Changed

- Direction labels are sized from the compass's size on screen, so they read at about 12.5 px in every tile, at full width and with `scale: fixed`.
- Legend counts show their unit ("62 days").
- README: why temperature and humidity belong together, how to read the compass, comparing rooms; installation via Marketplace / HACS only.

## [1.0.0-beta.1] - 2026-11-05

First test version. The comfort compass was part of the [Mollier hx Card](https://github.com/retomarek/mollier-hx-card) betas and is now its own card.

### Added

- Area-true comfort compass from the daily means of a temperature and a humidity sensor, ported from pyedautils.
- Severity stages from orange / red warning bands (same schema as the Mollier hx Card).
- Hover or tap tooltips; optional legend (`show_legend`), optional direction labels (`show_labels`), `scale: fit | fixed`.
- Sizing for sections, masonry and panel views: capped and centred glyph, fills tiles with a fixed row count.
- Follows the Home Assistant theme and language (English, German).
- Visual editor that keeps settings it does not show (`grid_options`, `visibility`, `card_mod`, ...).
- Small tiles: below about 200 px the direction labels are dropped automatically.
- Fahrenheit sensors supported (statistics requested in °C); hourly refresh, retry after a failed load; only completed days are counted.
- Claude Code setup for contributors: `card-reviewer` agent, `visual-check` and `release` skills (`npm run visual-check`).

[Unreleased]: https://github.com/retomarek/comfort-compass-card/compare/v1.0.0-beta.2...HEAD
[1.0.0-beta.2]: https://github.com/retomarek/comfort-compass-card/releases/tag/v1.0.0-beta.2
[1.0.0-beta.1]: https://github.com/retomarek/comfort-compass-card/releases/tag/v1.0.0-beta.1
