const fs = require('fs');
let code = fs.readFileSync('xlsx.md', 'utf8');
code = code.replace(
    /"Legacy" if it appears there in the official games/,
    '"Legacy" if it appears there in the official games (using fuzzy text matching to accommodate route name variations)'
);
fs.writeFileSync('xlsx.md', code);
