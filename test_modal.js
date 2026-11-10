const fs = require('fs');
const code = fs.readFileSync('src/ui/map.js', 'utf8');
const lines = code.split('\n');
console.log(lines.slice(635, 650).join('\n'));
