const fs = require('fs');
let content = fs.readFileSync('config/routes.js', 'utf8');

// I also need to ensure Route 15 has an area ID so it appears sequentially.
// Route 14 unblocks Fuchsia gym.
// Actually, in the original unlocks list before my change:
/*
  {
    "areaId": "Route 14",
    "unlocks": ["Fuchsia Gym"],
    "requirements": {
      "catchSpecies": [{ "species": "Ditto", "count": 5 }]
    }
  },
  {
    "areaId": "Route 15",
    "unlocks": ["Fuchsia Gym"],
    "requirements": {
      "catchSpecies": [{ "species": "Ditto", "count": 5 }]
    }
  },
*/

// Let's duplicate the challenge to both Route 14 and Route 15 so either works as a challenge host area.
const oldBlock = `  {
    "areaId": "Route 14",
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

const newBlock = `  {
    "areaId": "Route 14",
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
  },
  {
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

content = content.replace(oldBlock, newBlock);

fs.writeFileSync('config/routes.js', content);
