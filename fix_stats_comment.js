const fs = require('fs');

let data = fs.readFileSync('src/ui/pokemonStats.js', 'utf-8');

data = data.replace(/\/\/ Consume stones based on the evolution's required level!/g, '// Consume stones based on the pokemon\'s current level');

fs.writeFileSync('src/ui/pokemonStats.js', data);
