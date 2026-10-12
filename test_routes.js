const fs = require('fs');

const plains = ["Route 1","Route 2","Route 3","Route 4","Route 24","Route 25","Route 9","Route 10","Power Plant","Route 5","Fighting Dojo","Route 7","Route 6","Route 8","Route 11","Route 12","Cycling Road","Route 13","Route 14","Route 15","Pokémon Mansion","Trade With Friends Hub","Route 22","Route 23","Victory Road"];

// Read config/routes.js and extract all names.
let content = fs.readFileSync('config/routes.js', 'utf8');

let allNames = [];
let regex = /"name":\s*"([^"]+)"/g;
let match;
while ((match = regex.exec(content)) !== null) {
  allNames.push(match[1]);
}

let mismatched = plains.filter(r => !allNames.includes(r));
console.log("Mismatched Plains:", mismatched);

let water = ["Small Fishing Spot","Sea Routes","Seafoam Islands","Big Fishing Spot"];
let mismatchedWater = water.filter(r => !allNames.includes(r));
console.log("Mismatched Water:", mismatchedWater);

let cave = ["Mount Moon","Cerulean Cave","Pokémon Tower","Rock Tunnel","Fossil Revival","Mythical and Legendaries"];
let mismatchedCave = cave.filter(r => !allNames.includes(r));
console.log("Mismatched Cave:", mismatchedCave);
