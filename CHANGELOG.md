# Changelog

All notable changes to this card. The format follows [Keep a Changelog](https://keepachangelog.com/en/1.1.0/) and the card uses [Semantic Versioning](https://semver.org/). Until 1.0.0, released together with the [Mollier hx Card](https://github.com/retomarek/mollier-hx-card), a minor version may change the configuration.

## [Unreleased]

## [0.1.0] - 2026-11-26

First public version. The earlier 1.0.0 betas and release candidates were withdrawn; nobody needs to migrate.

### Added

- Comfort compass from the daily means of a temperature and a humidity sensor (Home Assistant long-term statistics): green disc for the days in range, eight area-true arms for the directions (too warm, too humid, too dry, too cold and the four mixes), each split into mild, moderate and severe.
- Comfort zone (`comfort_zone`: temperature, relative and optional absolute humidity) and warning bands (`warning_bands`) with the same schema as the Mollier hx Card. Humidity counts as off when the relative **or** the absolute limit is exceeded.
- Live reading: the matching segment breathes (`show_current`, `breathing`), a "Now" line gives state and values (`show_current_legend`).
- Optional legend (`show_legend`), direction labels (`show_labels`), hover / tap tooltips.
- `scale: fit | fixed`, so several rooms can be compared by area.
- 18 colour palettes (`palette`), with dark / light variants and labels at WCAG AA contrast.
- `days_to_show` (1 to 3650), `altitude` or `pressure` for the absolute humidity.
- Sizing for masonry, sections (auto height or fixed rows) and panel views.
- Visual editor that writes only non-default values and keeps other keys (`grid_options`, YAML-only band keys).
- 14 languages (English and German by the author, the others machine-translated).
- Robust loading: a slow first load says so, a hanging request is retried, a missing sensor or empty statistics show a translated message.
- [Live demo](https://retomarek.github.io/mollier-hx-card/) of both cards, with sample rooms and the YAML to copy.

### Development

- Unit tests (vitest), including a day-by-day comparison with `pyedautils.comfort.comfort_compass_distribution`; ESLint and Prettier; CI on every push; a check that the code shared with the Mollier hx Card is identical in both repositories.

[Unreleased]: https://github.com/retomarek/comfort-compass-card/compare/v0.1.0...HEAD
[0.1.0]: https://github.com/retomarek/comfort-compass-card/releases/tag/v0.1.0
