const fs = require('fs');
let code = fs.readFileSync('src/ui/market.js', 'utf8');
code = code.replace(
    /if \(window\.startSellMode\) \{ window\.startSellMode\(\); \} else \{/,
    `if (window.startSellMode) { window.startSellMode(); } else if (window.showBackpack) { window.showBackpack(); if(window.startSellMode) window.startSellMode(); } else {`
);
fs.writeFileSync('src/ui/market.js', code);
