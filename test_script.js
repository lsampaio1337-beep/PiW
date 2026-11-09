const fs = require('fs');

const path = 'src/ui/map.js';
let content = fs.readFileSync(path, 'utf8');
console.log(content.indexOf('switchView("CASINO_HUB")'));
console.log(content.indexOf('switchView("SAFARI_HUB")'));
