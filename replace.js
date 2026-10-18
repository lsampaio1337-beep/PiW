const fs = require('fs');

const path = 'config/johtoRoutes.js';
let content = fs.readFileSync(path, 'utf8');

content = content.replace(
`    "requirements": {
      "catchByRarity": {
        "rarity": "Rare",
        "count": 1
      }
    }`,
`    "requirements": {
      "catchByRarity": {
        "rarity": "Rare+",
        "count": 1
      }
    }`
);

fs.writeFileSync(path, content, 'utf8');
