# Changelog

All notable changes to this card. The format follows [Keep a Changelog](https://keepachangelog.com/en/1.1.0/) and the card uses [Semantic Versioning](https://semver.org/).

## [Unreleased]

### Added

- `show_current` (default on): the live reading of the two sensors is classified like the daily means and the matching segment slowly breathes in its own colour; a "Now" line names the state and the values (in the legend when it is shown). Editor switch under Display. `show_current_legend: false` hides the "Now" line and keeps only the marker.

## [1.0.0-rc.3] - 2026-11-06

### Changed

- The segment tooltip shows only the hovered segment (direction, stage, days and share), without the direction total and stage split.

## [1.0.0-rc.2] - 2026-11-06

Second release candidate for 1.0.0, from the mobile test.

### Changed

- The green disc shows "in range" under the share; a small disc gets a caption line below the compass instead. Disc text keeps a readable size also in compact mode.

## [1.0.0-rc.1] - 2026-11-06

Release candidate for 1.0.0: this code becomes 1.0.0 if no problems turn up.

### Changed

- Comfort zone default and editor suggestion: relative humidity 30–65 % (was 30–60 %), as in pyedautils.

### Removed

- Aliases for the pre-1.0 option names. Use the names from the README (`title`, `days_to_show`).

## [1.0.0-beta.5] - 2026-11-06

### Added

- Q&A discussions for questions and ideas (one short template); issues stay for bugs and features. README: "Questions and feedback".
- Hint on the card when the comfort zone looks like °F (temperatures are always °C, band offsets K).

### Changed

- Options renamed for 1.0, same as the Mollier hx Card: `header` → `title`, `days` → `days_to_show`. The old names keep working; the editor writes the new ones.
- `days_to_show` up to 3650 days; `pressure` accepted in hPa or Pa.
- A given `comfort_zone` needs `temperature` and `humidity`; `absolute_humidity` is optional and, when left out, means no absolute limit (no longer silently 0–12 g/kg).
- Invalid values (`scale`, `comfort_zone`, `days_to_show`, `pressure`, `altitude`) give a clear error instead of being ignored.
- Statistics code shared with the Mollier hx Card: completed days in the server's day buckets, humidity unit from the sensor.

### Fixed

- No "no data" message while the first load is still running; the card shows an empty body of the compass's size instead.
- A missing sensor says "Entity not found" instead of the hint about `state_class`.
- A failed load is retried with back-off (30 s up to 10 min); a failed hourly refresh keeps the last good compass. Changing sensors or period clears the old data and error.
- Touch: a second tap on the same segment, a tap elsewhere on the card or 5 s without interaction closes the tooltip.
- Editor: clearing a number field no longer writes empty values; it falls back to the previous value or the default. A comfort zone without `absolute_humidity` stays without it.
- README: long-term statistics are kept indefinitely, not for a year.

## [1.0.0-beta.4] - 2026-11-06

### Added

- README: good for people and the environment: what the compass tells you and what helps (ventilating, heating less), with a link to the h,x basics.

### Fixed

- Label size and compact mode also work when the card is attached before it receives its configuration.

## [1.0.0-beta.3] - 2026-11-06

### Added

- Translations for French, Italian, Spanish, Portuguese, Dutch, Polish, Swedish, Danish, Norwegian, Czech, Russian and Chinese (Simplified). They are machine-translated; corrections from native speakers are welcome as pull requests.

### Changed

- README starts with a banner (logo, name, claim); `npm run social-preview` renders it together with the social preview.
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

[Unreleased]: https://github.com/retomarek/comfort-compass-card/compare/v1.0.0-rc.3...HEAD
[1.0.0-rc.3]: https://github.com/retomarek/comfort-compass-card/releases/tag/v1.0.0-rc.3
[1.0.0-rc.2]: https://github.com/retomarek/comfort-compass-card/releases/tag/v1.0.0-rc.2
[1.0.0-rc.1]: https://github.com/retomarek/comfort-compass-card/releases/tag/v1.0.0-rc.1
[1.0.0-beta.5]: https://github.com/retomarek/comfort-compass-card/compare/v1.0.0-beta.4...v1.0.0-beta.5
[1.0.0-beta.4]: https://github.com/retomarek/comfort-compass-card/releases/tag/v1.0.0-beta.4
[1.0.0-beta.3]: https://github.com/retomarek/comfort-compass-card/releases/tag/v1.0.0-beta.3
[1.0.0-beta.2]: https://github.com/retomarek/comfort-compass-card/releases/tag/v1.0.0-beta.2
[1.0.0-beta.1]: https://github.com/retomarek/comfort-compass-card/releases/tag/v1.0.0-beta.1
