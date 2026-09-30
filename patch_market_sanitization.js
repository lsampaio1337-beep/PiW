const fs = require('fs');

const marketPath = 'src/ui/market.js';
let content = fs.readFileSync(marketPath, 'utf8');

const sanitizationFunctions = `
window.sanitizeMarketNumberInput = function(input) {
    let val = input.value.replace(/\\D/g, '');
    if (val.length > 3) val = val.substring(0, 3);
    input.value = val;
};

window.sanitizeMarketQInput = function(input) {
    let val = input.value.replace(/\\D/g, '');
    if (val.length > 3) val = val.substring(0, 3);
    if (val.length > 1) {
        val = val.substring(0, 1) + '.' + val.substring(1);
    }
    input.value = val;
};
`;

content = content.replace(
    'export function setupMarket(vCenter) {',
    sanitizationFunctions + '\nexport function setupMarket(vCenter) {'
);

fs.writeFileSync(marketPath, content);
console.log('Sanitization functions added successfully.');
