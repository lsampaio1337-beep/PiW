const fs = require('fs');

let content = fs.readFileSync('src/ui/market.js', 'utf8');

// The filters are actually already inside market-pokemon-sell-controls!
// Let's check where the controls div ends.
