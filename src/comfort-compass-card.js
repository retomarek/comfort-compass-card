// Keep in sync with "version" in package.json.
const version = '0.1.0';
import { ComfortCompassCard } from './card.js';
import { ComfortCompassCardEditor } from './editor.js';

// A second copy of the bundle (e.g. loaded both from the Marketplace and by hand)
// must not throw: the first registration wins.
if (!customElements.get('comfort-compass-card')) customElements.define('comfort-compass-card', ComfortCompassCard);
if (!customElements.get('comfort-compass-card-editor'))
    customElements.define('comfort-compass-card-editor', ComfortCompassCardEditor);

window.customCards = window.customCards || [];
if (!window.customCards.some((c) => c.type === 'comfort-compass-card'))
    window.customCards.push({
        type: 'comfort-compass-card',
        name: 'Comfort Compass Card',
        description:
            'Shows how the days split into in range, too warm, too humid, too dry or too cold, from a temperature and a humidity sensor.',
        preview: true,
        documentationURL: 'https://github.com/retomarek/comfort-compass-card',
    });

console.info(
    `%c COMFORT-COMPASS-CARD %c v${version} `,
    'color: white; background: #22a35a; font-weight: 700;',
    'color: #22a35a; background: white; font-weight: 700;',
);
