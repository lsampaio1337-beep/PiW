const fs = require('fs');

const path = 'config/johtoRoutes.js';
let content = fs.readFileSync(path, 'utf8');

content = content.replace(
`    "requirements": {
      "catchByQuality": {
        "quality": "Rare",
        "count": 1
      }
    }`,
`    "requirements": {
      "catchByQuality": {
        "quality": "Rare+",
        "count": 1
      }
    }`
);

fs.writeFileSync(path, content, 'utf8');
