const fs = require('fs');

const marketPath = 'src/ui/market.js';
let content = fs.readFileSync(marketPath, 'utf8');

// Replace Level Min
content = content.replace(
    '<input type="number" id="market-filter-level-min" placeholder="Min" oninput="if(window.renderPokeMarketSellTab) window.renderPokeMarketSellTab(\'pokemon\')" style="width: calc(var(--m-width) * 0.06);',
    '<input type="text" id="market-filter-level-min" placeholder="Min" oninput="if(window.sanitizeMarketNumberInput) window.sanitizeMarketNumberInput(this); if(window.renderPokeMarketSellTab) window.renderPokeMarketSellTab(\'pokemon\')" style="width: calc(var(--m-width) * 0.04);'
);

// Replace Level Max
content = content.replace(
    '<input type="number" id="market-filter-level-max" placeholder="Max" oninput="if(window.renderPokeMarketSellTab) window.renderPokeMarketSellTab(\'pokemon\')" style="width: calc(var(--m-width) * 0.06);',
    '<input type="text" id="market-filter-level-max" placeholder="Max" oninput="if(window.sanitizeMarketNumberInput) window.sanitizeMarketNumberInput(this); if(window.renderPokeMarketSellTab) window.renderPokeMarketSellTab(\'pokemon\')" style="width: calc(var(--m-width) * 0.04);'
);

// Replace Q Min
content = content.replace(
    '<input type="number" step="0.01" id="market-filter-q-min" placeholder="Min" oninput="if(window.renderPokeMarketSellTab) window.renderPokeMarketSellTab(\'pokemon\')" style="width: calc(var(--m-width) * 0.06);',
    '<input type="text" id="market-filter-q-min" placeholder="Min" oninput="if(window.sanitizeMarketQInput) window.sanitizeMarketQInput(this); if(window.renderPokeMarketSellTab) window.renderPokeMarketSellTab(\'pokemon\')" style="width: calc(var(--m-width) * 0.04);'
);

// Replace Q Max
content = content.replace(
    '<input type="number" step="0.01" id="market-filter-q-max" placeholder="Max" oninput="if(window.renderPokeMarketSellTab) window.renderPokeMarketSellTab(\'pokemon\')" style="width: calc(var(--m-width) * 0.06);',
    '<input type="text" id="market-filter-q-max" placeholder="Max" oninput="if(window.sanitizeMarketQInput) window.sanitizeMarketQInput(this); if(window.renderPokeMarketSellTab) window.renderPokeMarketSellTab(\'pokemon\')" style="width: calc(var(--m-width) * 0.04);'
);

// Replace SumIV Min
content = content.replace(
    '<input type="number" id="market-filter-sumiv-min" placeholder="Min" oninput="if(window.renderPokeMarketSellTab) window.renderPokeMarketSellTab(\'pokemon\')" style="width: calc(var(--m-width) * 0.06);',
    '<input type="text" id="market-filter-sumiv-min" placeholder="Min" oninput="if(window.sanitizeMarketNumberInput) window.sanitizeMarketNumberInput(this); if(window.renderPokeMarketSellTab) window.renderPokeMarketSellTab(\'pokemon\')" style="width: calc(var(--m-width) * 0.04);'
);

// Replace SumIV Max
content = content.replace(
    '<input type="number" id="market-filter-sumiv-max" placeholder="Max" oninput="if(window.renderPokeMarketSellTab) window.renderPokeMarketSellTab(\'pokemon\')" style="width: calc(var(--m-width) * 0.06);',
    '<input type="text" id="market-filter-sumiv-max" placeholder="Max" oninput="if(window.sanitizeMarketNumberInput) window.sanitizeMarketNumberInput(this); if(window.renderPokeMarketSellTab) window.renderPokeMarketSellTab(\'pokemon\')" style="width: calc(var(--m-width) * 0.04);'
);

fs.writeFileSync(marketPath, content);
console.log('Filters updated successfully.');
