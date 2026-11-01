const fs = require('fs');
let code = fs.readFileSync('config/hoennRoutes.js', 'utf8');
code = code.replace(/export const /g, 'exports.');
fs.writeFileSync('scripts/tempRoutes3.js', code);

const { hoennUnlocks } = require('./tempRoutes3.js');
let lastGymIdx = -1;
let gymCount = 1;
for (let i = 0; i < 44; i++) {
  if (hoennUnlocks[i].areaId.includes("Gym")) {
    console.log(`Gym ${gymCount} at ${hoennUnlocks[i].challengeName}. Distance from last gym: ${i - lastGymIdx - 1} challenges`);
    lastGymIdx = i;
    gymCount++;
  }
}
