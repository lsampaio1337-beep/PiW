const fs = require('fs');

let code = fs.readFileSync('scripts/tempRoutes.js', 'utf8');
const { hoennRoutes, hoennUnlocks } = require('./tempRoutes.js');

let unlocks = hoennUnlocks;
let extraChallenges = unlocks.filter(c => c.challengeName && (c.challengeName.startsWith("Extra ") || c.challengeName.includes("Nebula") || c.challengeName.includes("Key")));
console.log("Unlocks extra challenges:", extraChallenges.length);
