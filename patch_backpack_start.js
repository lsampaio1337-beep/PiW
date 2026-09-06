const fs = require('fs');
let code = fs.readFileSync('src/ui/backpack/pokemon.js', 'utf8');

if (!code.includes('export function initSellMode')) {
    // Just ensure window.startSellMode is registered early when pokemon.js is imported.
    // wait, pokemon.js is imported in backpack/index.js which is imported in ui.js
    // Let's look at index.js
}
