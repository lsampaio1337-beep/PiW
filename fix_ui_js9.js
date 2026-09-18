const fs = require('fs');
let code = fs.readFileSync('src/ui.js', 'utf8');
const lines = code.split('\n');
const startIndex = lines.findIndex(l => l.includes('function selectStarter(id) {'));
if (startIndex !== -1) {
    const end = startIndex + 100;
    console.log(lines.slice(startIndex, end).join('\n'));
}
