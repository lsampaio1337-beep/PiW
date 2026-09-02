const fs = require('fs');

let data = fs.readFileSync('src/ui/pokemonStats.js', 'utf-8');

data = data.replace(/const baseCost = Math.ceil\(requiredLevel \* 0.1\);/g, 'const baseCost = Math.ceil(p.level * 0.1);');

fs.writeFileSync('src/ui/pokemonStats.js', data);
