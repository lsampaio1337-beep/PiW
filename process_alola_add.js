const fs = require('fs');

const toInsert = [ "Snorlax", "Braviary", "Mandibuzz", "Sableye", "Luvdisc", "Milotic", "Alomomola", "Gible", "Garchomp", "Lucario", "Zoroark", "Mime Jr.", "Mr. Mime", "Clamperl", "Gorebyss", "Basculin", "Manectric", "Jellicent", "Pawniard", "Bisharp", "Dragalge", "Clawitzer", "Crawdaunt", "Pyroar", "Lickilicky" ];
const pkData = require('./data/pokemon.json');
const pkMap = {};
pkData.forEach(p => pkMap[p.name] = p);
pkData.forEach(p => pkMap[p.id] = p);

let alolaRaw = fs.readFileSync('config/alolaRoutes.js', 'utf8');

// Parse the file safely
const vm = require('vm');
let code = alolaRaw.replace(/export const /g, 'var ');
const sandbox = {};
vm.createContext(sandbox);
vm.runInContext(code, sandbox);
const routes = sandbox.alolaRoutes;
const unlocks = sandbox.alolaUnlocks;

let insertIdx = 0;

for (let r of routes) {
    if (insertIdx >= toInsert.length) break;
    if (r.name.includes("Lab") || r.name.includes("Gym")) continue;

    let toAdd = 1;
    if (r.spawns.length >= 5) toAdd = 2;

    for (let i = 0; i < toAdd && insertIdx < toInsert.length; i++) {
        const pk = pkMap[toInsert[insertIdx]];
        insertIdx++;

        let minL = 10, maxL = 15;
        if (r.spawns.length > 0) {
            minL = r.spawns[0].minLevel;
            maxL = r.spawns[0].maxLevel;
        }

        r.spawns.push({
            pokemonId: pk.id,
            minLevel: minL,
            maxLevel: maxL,
            chance: 0.05
        });
    }
}

// Zygarde to special place
let zyRoute = routes.find(r => r.name === 'Resolution Cave');
if (!zyRoute) {
    zyRoute = {
        name: 'Resolution Cave',
        spawns: []
    };
    routes.push(zyRoute);
}

const zyIdx = zyRoute.spawns.findIndex(s => s.pokemonId === pkMap['Zygarde'].id);
if (zyIdx === -1) {
     zyRoute.spawns.push({
         pokemonId: pkMap['Zygarde'].id,
         minLevel: 70,
         maxLevel: 75,
         chance: 1.0
     });
}

// Check if Resolution Cave is in unlocks, if not add it
const hasResCave = unlocks.some(u => u.areaId === 'Resolution Cave');
if (!hasResCave) {
    unlocks.push({
        challengeName: "Extra Challenge Z 1",
        areaId: "Resolution Cave",
        unlocks: [],
        requirements: { defeatCountRoute: { routeName: "Resolution Cave", count: 10 } }
    });
    // Attach to last challenge
    let lastUnlocks = unlocks.find(u => u.challengeName === "Extra Challenge C 3" || u.challengeName === "Challenge 60");
    if (lastUnlocks) {
         if (!lastUnlocks.unlocks) lastUnlocks.unlocks = [];
         lastUnlocks.unlocks.push("Resolution Cave");
    }
}

// Convert back
let finalStr = "export const alolaRoutes = " + JSON.stringify(routes, null, 2) + ";\n\n";
finalStr += "export const alolaUnlocks = " + JSON.stringify(unlocks, null, 2) + ";\n";

fs.writeFileSync('config/alolaRoutes.js', finalStr);
