const fs = require('fs');
let code = fs.readFileSync('src/ui.js', 'utf8');
console.log(code.includes('import { openBackpack }'));
