const fs = require('fs');

let data = fs.readFileSync('src/ui/pokemonStats.js', 'utf-8');

data = data.replace(/gap: x;/g, '');

fs.writeFileSync('src/ui/pokemonStats.js', data);
