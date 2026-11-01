const fs = require('fs');

let code = fs.readFileSync('config/hoennMapCoordinates.js', 'utf8');

const replacements = {
    '"Tiny Fishing Spot"': '"Route 106 Fishing Spot"',
    '"Small Fishing Spot"': '"Route 109 Fishing Spot"',
    '"Big Fishing Spot"': '"Route 124"',
    '"Underwater Fishing Spot"': '"Route 126 Underwater"',
    '"tiny_fishing_spot"': '"route_106_fishing_spot"',
    '"small_fishing_spot"': '"route_109_fishing_spot"',
    '"big_fishing_spot"': '"route_124"',
    '"underwater_fishing_spot"': '"route_126_underwater"'
};

for (const [old, newName] of Object.entries(replacements)) {
    code = code.replace(old, newName);
}

// Remove Mirage Island
code = code.replace(/  "mirage_island": \{\n    "name": "Mirage Island",\n    "x": 85.2,\n    "y": 53.88\n  \},\n/, '');

// Add new routes
const newCoords = `  "105": {
    "name": "Route 105",
    "x": 4.88,
    "y": 70.0
  },
  "108": {
    "name": "Route 108",
    "x": 22.0,
    "y": 92.0
  },
  "weather_institute": {
    "name": "Weather Institute",
    "x": 46.72,
    "y": 15.0
  },
  "125": {
    "name": "Route 125",
    "x": 84.0,
    "y": 20.0
  },
`;

code = code.replace('  "107": {', newCoords + '  "107": {');

fs.writeFileSync('config/hoennMapCoordinates.js', code);
