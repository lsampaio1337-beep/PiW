const fs = require('fs');
const path = require('path');

const pokemonDataFile = fs.readFileSync(path.resolve(__dirname, '../data/pokemon.json'), 'utf8');
const pokemonData = JSON.parse(pokemonDataFile);

const pkmNamesToIds = {};
pokemonData.forEach(p => {
    pkmNamesToIds[p.name] = p.id;
});

// Some manual overrides
pkmNamesToIds['Nidoran♂'] = 32;
pkmNamesToIds['Nidoran♀'] = 29;
pkmNamesToIds['Mr. Mime'] = 122;
pkmNamesToIds['Mr. Rime'] = 866;

const lines = fs.readFileSync(path.resolve(__dirname, 'galar_data.txt'), 'utf8').trim().split('\n').slice(1);

const locationSpawns = {};

lines.forEach(line => {
    const [route, pkmNameRaw] = line.split('\t');
    if (!route || !pkmNameRaw) return;

    let pkmName = pkmNameRaw.trim();
    let pid = pkmNamesToIds[pkmName];

    if (!pid) {
         if (pkmName === "Sirfetch'd") pid = 865;
         else if (pkmName === "Mime Jr.") pid = 439;
         else if (pkmName === "Flapple") pid = 840;
         else if (pkmName === "Farfetch'd") pid = 83; // Assuming regular for now
    }

    if (!locationSpawns[route]) {
        locationSpawns[route] = [];
    }

    if (pid) {
        locationSpawns[route].push(pid);
    } else {
        console.log("Missing ID for: " + pkmName);
    }
});

const legacyMainOrder = [
    "Slumbering Weald",
    "Route 1",
    "Route 2",
    "Rolling Fields",
    "Dappled Grove",
    "Watchtower Ruins",
    "East Lake Axewell",
    "West Lake Axewell",
    "Axew's Eye",
    "South Lake Miloch",
    "Giant's Seat",
    "North Lake Miloch",
    "Motostoke Riverbank",
    "Bridge Field",
    "Stony Wilderness",
    "Dusty Bowl",
    "Giant's Mirror",
    "Hammerlocke Hills",
    "Giant's Cap",
    "Lake of Outrage",
    "Route 3",
    "Galar Mine",
    "Route 4",
    "Turffield Gym",
    "Route 5",
    "Hulbury",
    "Hulbury Gym",
    "Galar Mine No. 2",
    "Motostoke Outskirts",
    "Motostoke Gym",
    "Route 6",
    "Stow-on-Side Gym",
    "Glimwood Tangle",
    "Ballonlea Gym",
    "Route 7",
    "Route 8",
    "Circhester Gym",
    "Route 9",
    "Spikemuth Gym",
    "Hammerlocke Gym",
    "Route 10",
    "Energy Plant",
    "Pokemon League"
];

// Combine the user locations with the gym structural progression.
// The user provided the locations, but we also want the ones not provided that are required
// We want to construct exactly the sequence `legacyMainOrder` up to Pokemon League, but only keeping the locations present in `locationSpawns` plus Gyms.

const mainLocations = [];
legacyMainOrder.forEach(loc => {
    if (locationSpawns[loc] || loc.includes("Gym") || loc === "Pokemon League" || loc === "Energy Plant") {
        mainLocations.push(loc);
    }
});

const armorLocations = [
    "Fields of Honor",
    "Soothing Wetlands",
    "Forest of Focus",
    "Challenge Beach",
    "Brawlers' Cave",
    "Challenge Road",
    "Courageous Cavern",
    "Loop Lagoon",
    "Training Lowlands",
    "Warm-Up Tunnel",
    "Potbottom Desert",
    "Workout Sea",
    "Stepping-Stone Sea",
    "Insular Sea",
    "Honeycalm Sea",
    "Honeycalm Island",
    "Master Dojo"
];

const crownLocations = [
    "Slippery Slope",
    "Freezington",
    "Frostpoint Field",
    "Giant's Bed",
    "Old Cemetery",
    "Snowslide Slope",
    "Tunnel to the Top",
    "Path to the Peak",
    "Crown Shrine",
    "Giant's Foot",
    "Roaring-Sea Caves",
    "Frigid Sea",
    "Three-Point Pass",
    "Ballimere Lake",
    "Lakeside Cave",
    "Dyna Tree Hill",
    "Rock Peak Ruins",
    "Iceberg Ruins",
    "Iron Ruins",
    "Split-Decision Ruins"
];

// Let's create the final galarRoutes array
let galarRoutes = [];
let galarUnlocks = [];
let challengeIdx = 1;

let lastRouteName = null;

// The base level of each route, starting from 1 to 100
function createRouteData(locName, minLevel, maxLevel) {
    const route = {
        name: locName,
        spawns: []
    };

    if (locationSpawns[locName]) {
        let chance = (1 / locationSpawns[locName].length).toFixed(2);
        if (locationSpawns[locName].length === 0) chance = 0;

        locationSpawns[locName].forEach(pid => {
            route.spawns.push({
                pokemonId: pid,
                minLevel: minLevel,
                maxLevel: maxLevel,
                chance: parseFloat(chance)
            });
        });
    }

    return route;
}

let allLocs = [
    ...mainLocations,
    ...armorLocations.filter(loc => locationSpawns[loc]),
    ...crownLocations.filter(loc => locationSpawns[loc])
];

let level = 1;
const levelInc = 100 / allLocs.length;

allLocs.forEach((loc, idx) => {
    let minLv = Math.max(1, Math.floor(level));
    let maxLv = Math.min(100, Math.floor(level + levelInc));
    galarRoutes.push(createRouteData(loc, minLv, maxLv));
    level += levelInc;
});

// Create Unlocks
let prevLoc = null;
let mainChallengeNum = 1;
let armorChallengeNum = 1;
let crownChallengeNum = 1;

const gyms = {
    "Turffield Gym": { name: "Galar Badge 1", leader: "Milo", badgeCount: 1 },
    "Hulbury Gym": { name: "Galar Badge 2", leader: "Nessa", badgeCount: 2 },
    "Motostoke Gym": { name: "Galar Badge 3", leader: "Kabu", badgeCount: 3 },
    "Stow-on-Side Gym": { name: "Galar Badge 4", leader: "Bea", badgeCount: 4 },
    "Ballonlea Gym": { name: "Galar Badge 5", leader: "Opal", badgeCount: 5 },
    "Circhester Gym": { name: "Galar Badge 6", leader: "Gordie", badgeCount: 6 },
    "Spikemuth Gym": { name: "Galar Badge 7", leader: "Marnie", badgeCount: 7 },
    "Hammerlocke Gym": { name: "Galar Badge 8", leader: "Raihan", badgeCount: 8 }
};

for (let i = 0; i < allLocs.length; i++) {
    const currLoc = allLocs[i];
    const nextLoc = allLocs[i+1];

    let challengeName = "";
    if (mainLocations.includes(currLoc)) {
        challengeName = `Challenge ${mainChallengeNum.toString().padStart(2, '0')}`;
        mainChallengeNum++;
    } else if (armorLocations.includes(currLoc)) {
        challengeName = `Extra Challenge EArmmor ${armorChallengeNum.toString().padStart(2, '0')}`;
        armorChallengeNum++;
    } else if (crownLocations.includes(currLoc)) {
        challengeName = `Extra Challenge ECrown ${crownChallengeNum.toString().padStart(2, '0')}`;
        crownChallengeNum++;
    }

    let reqs = {};
    if (gyms[currLoc]) {
        reqs = { earnBadge: gyms[currLoc] };
    }
    if (currLoc === "Pokemon League") {
        reqs = { defeatGalarChampion: true };
    }

    let unlocks = nextLoc ? [nextLoc] : [];

    // Also at Pokemon League, it unlocks BOTH the first armor and first crown locations if available
    if (currLoc === "Pokemon League") {
        let arm = armorLocations.find(l => locationSpawns[l]);
        let crw = crownLocations.find(l => locationSpawns[l]);
        unlocks = [];
        if (arm) unlocks.push(arm);
        if (crw) unlocks.push(crw);
    }

    // For the last location of Armor, maybe don't unlock Crown (handled by league)
    if (currLoc === armorLocations.findLast(l => locationSpawns[l])) {
        unlocks = [];
    }

    galarUnlocks.push({
        challengeName: challengeName,
        areaId: currLoc,
        unlocks: unlocks,
        requirements: reqs
    });
}

fs.writeFileSync('config/galarRoutes.js', `export const galarRoutes = ${JSON.stringify(galarRoutes, null, 2)};\n\nexport const galarUnlocks = ${JSON.stringify(galarUnlocks, null, 2)};\n`);

console.log("Written config/galarRoutes.js successfully");
