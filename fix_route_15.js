const fs = require('fs');
let content = fs.readFileSync('config/routes.js', 'utf8');

const route15Block = `  {
    "areaId": "Route 15",
    "unlocks": [
      "Fuchsia Gym"
    ],
    "requirements": {
      "catchSpecies": [
        {
          "species": "Ditto",
          "count": 10
        }
      ]
    }
  },`;

content = content.replace(route15Block, "");

fs.writeFileSync('config/routes.js', content);
