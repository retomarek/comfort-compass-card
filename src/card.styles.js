import { css } from 'lit';

// Sizing:
// - auto mode (masonry, stacks, sections with auto rows): the glyph is at most
//   340 px wide and centred; with the legend, glyph and legend sit side by side
//   once the card is wide enough, otherwise stacked.
// - fixed mode (:host([fixed-height]), set when the tile has a row count or in
//   panel view): the card fills the tile, the glyph fits the remaining space
//   (preserveAspectRatio meet), capped at 380 px and centred.
// Colours follow the Home Assistant theme; segment gaps use the card colour.
export default css`
    :host {
        display: block;
        --ccc-max: 340px;
        --ccc-gap-color: var(--ha-card-background, var(--card-background-color, #fff));
    }
    ha-card {
        display: flex;
        flex-direction: column;
        overflow: hidden;
    }
    .card-content {
        container-type: inline-size;
        padding: 8px 16px 16px;
    }
    :host([fixed-height]),
    :host([fixed-height]) ha-card {
        height: 100%;
    }
    :host([fixed-height]) .card-content {
        flex: 1 1 auto;
        min-height: 0;
        display: flex;
        flex-direction: column;
    }
    .message {
        margin: 8px 0;
        color: var(--secondary-text-color);
    }
    .message.error {
        color: var(--error-color, #db4437);
    }
    .message.hint {
        margin: 0 0 8px;
        font-size: 13px;
    }
    /* While the first load runs: an empty box of about the compass's size, so
       the dashboard does not jump when the glyph appears. */
    .placeholder {
        width: 100%;
        max-width: var(--ccc-max);
        aspect-ratio: 1.15;
        margin: 0 auto;
    }
    :host([fixed-height]) .placeholder {
        flex: 1 1 auto;
        aspect-ratio: auto;
    }

    /* Glyph and legend */
    .compass-body {
        position: relative;
        display: grid;
        grid-template-columns: minmax(0, 1fr);
        justify-items: center;
        align-items: center;
        gap: 8px 20px;
    }
    /* Wide enough: glyph and legend side by side, kept together and centred. */
    @container (min-width: 480px) {
        .compass-body.with-legend {
            grid-template-columns: minmax(0, var(--ccc-max)) minmax(0, 260px);
            justify-content: center;
        }
    }
    .glyph-box {
        width: 100%;
        max-width: var(--ccc-max);
    }
    .glyph {
        display: block;
        width: 100%;
        height: auto;
        overflow: visible;
    }
    :host([fixed-height]) .compass-body {
        flex: 1 1 auto;
        min-height: 0;
        grid-template-rows: minmax(0, 1fr);
    }
    :host([fixed-height]) .compass-body.with-legend {
        grid-template-rows: minmax(0, 1fr) auto;
    }
    :host([fixed-height]) .glyph-box {
        height: 100%;
        max-width: 380px;
        max-height: 380px;
    }
    :host([fixed-height]) .glyph {
        height: 100%;
    }
    @container (min-width: 480px) {
        :host([fixed-height]) .compass-body.with-legend {
            grid-template-rows: minmax(0, 1fr);
        }
    }

    .glyph .ref {
        fill: none;
        /* A touch stronger than the divider colour, which is nearly
           invisible on dark themes. */
        stroke: var(--secondary-text-color, #8a8f98);
        stroke-opacity: 0.4;
        stroke-width: 1;
        stroke-dasharray: 3 3;
    }
    .glyph .seg {
        stroke: var(--ccc-gap-color);
        stroke-width: 1.5;
        cursor: pointer;
        transition: opacity 0.12s;
    }
    .glyph .seg.ok {
        stroke-width: 2;
    }
    .glyph:hover .seg:not(:hover) {
        opacity: 0.55;
    }
    .glyph .ok-pct {
        fill: #ffffff;
        font-weight: 600;
        pointer-events: none;
    }
    .glyph .ok-word {
        fill: #ffffff;
        font-weight: 500;
        pointer-events: none;
    }
    .ok-caption {
        display: flex;
        align-items: center;
        justify-content: center;
        gap: 6px;
        font-size: 13px;
        color: var(--primary-text-color);
        font-variant-numeric: tabular-nums;
    }
    .glyph text {
        font-family: inherit;
    }

    .legend {
        width: 100%;
        max-width: 300px;
        display: flex;
        flex-direction: column;
        gap: 4px;
        font-size: 13px;
        line-height: 1.35;
        font-variant-numeric: tabular-nums;
        color: var(--primary-text-color);
    }
    .legend .row {
        display: grid;
        grid-template-columns: 9px minmax(0, 1fr) auto 3.2em;
        column-gap: 8px;
        align-items: center;
    }
    .legend .count {
        font-weight: 600;
        text-align: right;
        white-space: nowrap;
    }
    .legend .unit {
        font-weight: 400;
        color: var(--secondary-text-color);
    }
    .legend .share {
        color: var(--secondary-text-color);
        text-align: right;
    }
    .dot {
        display: inline-block;
        width: 9px;
        height: 9px;
        border-radius: 50%;
    }
    .stage-key {
        display: flex;
        flex-wrap: wrap;
        gap: 2px 10px;
        margin-top: 6px;
        padding-top: 6px;
        border-top: 1px solid var(--divider-color);
        color: var(--secondary-text-color);
        font-size: 11px;
    }
    .stage-key > span {
        display: inline-flex;
        align-items: center;
        gap: 4px;
    }

    .tip {
        position: absolute;
        pointer-events: none;
        display: none;
        padding: 5px 9px;
        border-radius: 4px;
        font-size: 12px;
        line-height: 1.4;
        white-space: nowrap;
        z-index: 10;
        box-shadow: 0 1px 4px rgba(0, 0, 0, 0.3);
        transform: translate(-50%, calc(-100% - 6px));
    }
    .tip .tip-head {
        font-weight: 600;
    }

    /* Live reading: the matching segment breathes its own colour. Plain
       opacity: Safari/WebKit does not reliably animate fill-opacity on SVG. */
    .glyph .seg.live,
    .glyph .now-dot {
        animation: ccc-breathe 4s ease-in-out infinite;
    }
    /* White share text sits on the green disc: keep it readable. */
    .glyph .seg.ok.live {
        animation-name: ccc-breathe-ok;
    }
    @keyframes ccc-breathe-ok {
        0%, 100% { opacity: 1; }
        50% { opacity: 0.75; }
    }
    .glyph .now-dot {
        stroke: var(--ccc-gap-color);
        stroke-width: 1.5;
        cursor: pointer;
    }
    @keyframes ccc-breathe {
        0%, 100% { opacity: 1; }
        50% { opacity: 0.45; }
    }
    .now-legend {
        animation: ccc-breathe 4s ease-in-out infinite;
    }
    .legend .now-row {
        padding-bottom: 6px;
        margin-bottom: 2px;
        border-bottom: 1px solid var(--divider-color);
    }
    .legend .now-row .name {
        grid-column: 2 / -1;
    }
    .now-values {
        display: block;
        color: var(--secondary-text-color);
        font-size: 12px;
    }
    .now-values.inline {
        display: inline;
        margin-left: 4px;
    }
    .now-caption {
        flex-wrap: wrap;
        display: flex;
        align-items: center;
        justify-content: center;
        gap: 6px;
        font-size: 13px;
        color: var(--primary-text-color);
        cursor: help;
    }

    @media (prefers-reduced-motion: reduce) {
        .glyph .seg {
            transition: none;
        }
        .glyph .seg.live, .glyph .now-dot, .now-legend {
            animation: none;
        }
    }
`;
