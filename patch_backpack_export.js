const fs = require('fs');
let code = fs.readFileSync('src/ui.js', 'utf8');
code = code.replace(
    /window\.renderBackpackTab = renderBackpackTab;/,
    `window.renderBackpackTab = renderBackpackTab;\nwindow.startSellMode = window.startSellMode || (() => { if (window.showBackpack) { window.showBackpack(); window.startSellMode && window.startSellMode(); } });`
);
// Actually startSellMode is defined in pokemon.js which is not imported fully. Let's make sure ui.js can access it.
fs.writeFileSync('src/ui.js', code);
