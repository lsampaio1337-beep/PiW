const fs = require('fs');

let content = fs.readFileSync('src/ui/pokemonStats.js', 'utf8');
content = content.replace(/Assets\/Items\/\$\{stone1Name\}\.png/g, 'Assets/Items/Stones/${stone1Name}.png');
content = content.replace(/Assets\/Items\/\$\{stone2Name\}\.png/g, 'Assets/Items/Stones/${stone2Name}.png');

content = content.replace(/window\.showDexEntry/g, 'window.showDexEntry');

fs.writeFileSync('src/ui/pokemonStats.js', content);
