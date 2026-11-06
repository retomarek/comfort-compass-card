// Keep in sync with "version" in package.json.
const version = "1.0.0-beta.5";
import { ComfortCompassCard } from "./card.js";
import { ComfortCompassCardEditor } from "./editor.js";

customElements.define("comfort-compass-card", ComfortCompassCard);
customElements.define("comfort-compass-card-editor", ComfortCompassCardEditor);

window.customCards = window.customCards || [];
window.customCards.push({
    type: "comfort-compass-card",
    name: "Comfort compass card",
    description: "Shows how the days split into in range, too warm, too humid, too dry or too cold, from a temperature and a humidity sensor.",
    preview: true,
    documentationURL: "https://github.com/retomarek/comfort-compass-card",
});

console.info(
    `%c COMFORT-COMPASS-CARD %c v${version} `,
    "color: white; background: #22a35a; font-weight: 700;",
    "color: #22a35a; background: white; font-weight: 700;"
);
