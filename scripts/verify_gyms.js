const fs = require('fs');

let code = fs.readFileSync('config/hoennRoutes.js', 'utf8');
code = code.replace(/export const /g, 'exports.');
fs.writeFileSync('scripts/tempRoutes3.js', code);

const { hoennUnlocks } = require('./tempRoutes3.js');
const challenges = hoennUnlocks;

for (let i = 0; i < challenges.length; i++) {
  if (challenges[i].areaId.includes("Gym")) {
    console.log(`${challenges[i].challengeName}: ${challenges[i].areaId}`);
  }
}
