const fs = require('fs');
const marketPath = 'src/ui/market.js';
let content = fs.readFileSync(marketPath, 'utf8');

content = content.replace(
    'id="market-pokemon-filters" style="display: flex; flex-wrap: wrap; gap: calc(var(--m-width) * 0.012); justify-content: center; align-items: center;',
    'id="market-pokemon-filters" style="display: flex; flex-wrap: nowrap; gap: calc(var(--m-width) * 0.012); justify-content: center; align-items: center;'
);

fs.writeFileSync(marketPath, content);
console.log('Flex-wrap updated to nowrap.');
