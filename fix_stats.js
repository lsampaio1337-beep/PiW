const fs = require('fs');

let data = fs.readFileSync('src/ui/pokemonStats.js', 'utf-8');

data = data.replace(/const baseCost = Math.ceil\(evo.level \* 0.1\);/g, 'const baseCost = Math.ceil(p.level * 0.1);');
data = data.replace(/onclick="window.\(\$\{current.id\}\)"/g, 'onclick="window.showDexEntry(${current.id})"');

fs.writeFileSync('src/ui/pokemonStats.js', data);
