const fs = require('fs');
const src = fs.readFileSync('src/mathEngine.js', 'utf8').replace(/export \{[\s\S]*?\};/, '');
eval(src);

console.log("total xp for level 100:", calculateTotalXP(100));
console.log("total xp for level 101:", calculateTotalXP(101));

let xp100 = calculateTotalXP(100);
console.log("Level from XP 100: ", getLevelFromXP(xp100));

// But look at getLevelFromXP:
// while (level < 100) { totalXpNeeded += calculateReqXP(level); ... level++; }
// So it can never return a value > 100 !
