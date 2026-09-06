const fs = require('fs');
let code = fs.readFileSync('src/ui.js', 'utf8');
const lines = code.split('\n');
for (let i=0; i<60; i++) console.log(lines[i]);
