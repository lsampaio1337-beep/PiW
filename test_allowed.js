const fs = require('fs');
const code = fs.readFileSync('src/windowManager.js', 'utf8');
const match = code.match(/const allowedFuncs = \[(.*?)\];/s);
console.log(match ? match[1] : 'not found');
