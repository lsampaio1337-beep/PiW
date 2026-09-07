// Quick check script
const fs = require('fs');
const code = fs.readFileSync('src/ui/market.js', 'utf8');

const regex = /<div id="market-pokemon-sell-controls"[\s\S]*?(?=<div id="market-sell-content")/g;
const match = code.match(regex);
if (match) {
    console.log(match[0].includes('id="market-pokemon-filters"'));
}
