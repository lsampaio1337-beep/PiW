const fs = require('fs');

let code = fs.readFileSync('config/hoennRoutes.js', 'utf8');
code = code.replace(/export const /g, 'exports.');
fs.writeFileSync('scripts/tempRoutes.js', code);
const { hoennRoutes, hoennUnlocks } = require('./tempRoutes.js');

// Helper to find a challenge by its AREA (since challenge names changed)
function findByArea(areaId) {
    return hoennUnlocks.find(c => c.areaId === areaId);
}

// User Requirements by Area / Old Name
const reqUpdates = [
  { area: "Route 120", req: { catchSpecies: [{ species: "Absol", count: 1 }] } }, // Old Chal 27
  { area: "Sky Pillar", req: { catchSpecies: [{ species: "Altaria", count: 1 }, { species: "Claydol", count: 1 }] } }, // Old Chal 42
  { area: "Route 109 Fishing Spot", req: { catchSpecies: [{ species: "Carvanha", count: 1 }, { species: "Barboach", count: 1 }] } }, // Old Chal 25 (Small Fishing Spot -> Route 109 Fishing Spot)
  { area: "Mount Pyre", req: { catchSpecies: [{ species: "Chimecho", count: 1 }] } }, // Old Chal 30
  { area: "Nebula Fissure", req: { catchSpecies: [{ species: "Deoxys", count: 1 }, { species: "Jirachi", count: 1 }] } }, // Nebula Fissure Chal
  { area: "Route 124", req: { catchSpecies: [{ species: "Feebas", count: 1 }, { species: "Tentacruel", count: 1 }] } }, // Old Chal 34 (Big Fishing Spot -> Route 124)
  { area: "Abandoned Ship", req: { catchSpecies: [{ species: "Gorebyss", count: 1 }] } }, // Extra Chal B 3
  { area: "Advanced Starter Sanctuary", req: { catchSpecies: [{ species: "Grovyle", count: 1 }, { species: "Combusken", count: 1 }, { species: "Marshtomp", count: 1 }] } }, // Extra Chal A 3
  { area: "Route 117", req: { catchSpecies: [{ species: "Kirlia", count: 1 }] } }, // Old Chal 14
  { area: "Weather Climax Cave", req: { catchSpecies: [{ species: "Kyogre", count: 1 }, { species: "Groudon", count: 1 }, { species: "Rayquaza", count: 1 }] } }, // Extra Chal A 6
  { area: "Rustboro Fossil Lab", req: { catchSpecies: [{ species: "Lileep", count: 1 }, { species: "Anorith", count: 1 }] } }, // Extra Chal B 2
  { area: "Route 118", req: { catchSpecies: [{ species: "Manectric", count: 1 }, { species: "Kecleon", count: 1 }] } }, // Old Chal 24
  { area: "Safari Zone East", req: { catchSpecies: [{ species: "Pikachu", count: 1 }, { species: "Heracross", count: 1 }, { species: "Stantler", count: 1 }] } }, // Old Chal 29
  { area: "Route 110", req: { catchSpecies: [{ species: "Plusle", count: 1 }, { species: "Minun", count: 1 }, { species: "Gulpin", count: 1 }] } }, // Old Chal 13
  { area: "Ancient Ruins", req: { catchSpecies: [{ species: "Regirock", count: 1 }, { species: "Regice", count: 1 }, { species: "Registeel", count: 1 }] } }, // Extra Chal B 6
  { area: "Route 116", req: { catchSpecies: [{ species: "Skitty", count: 2 }] } }, // Old Chal 06
  { area: "Starter Sanctuary", req: { catchSpecies: [{ species: "Treecko", count: 1 }, { species: "Torchic", count: 1 }, { species: "Mudkip", count: 1 }] } }, // Extra Chal A 2
  { area: "Daycare Special Spot", req: { catchSpecies: [{ species: "Wynaut", count: 1 }, { species: "Azurill", count: 1 }, { species: "Igglybuff", count: 1 }, { species: "Pichu", count: 1 }] } }, // Extra Chal A 4
  { area: "Route 106 Fishing Spot", req: { catchSpeciesByQuality: [{ species: "Magikarp", quality: "Epic", count: 1 }] } }, // Old Chal 09 (Tiny Fishing Spot -> Route 106 Fishing Spot)
  { area: "Key to Nebula Fissure Challenge", req: { completeChallenges: ["Extra Challenge A 6", "Extra Challenge B 6", "Extra Challenge (Roaming)"] } },
  { area: "Battle Frontier Facility", req: { defeatCountRoute: { route: "Battle Frontier Facility", count: 100 } } }, // Extra Chal A 5
  { area: "Enemy Hideout", req: { defeatCountRoute: { route: "Enemy Hideout", count: 100 } } }, // Extra Chal B 4
  { area: "Jagged Pass", req: { defeatCountRoute: { route: "Jagged Pass", count: 100 } } }, // Old Chal 18
  { area: "Route 107", req: { defeatCountRoute: { route: "Route 107", count: 50 } } }, // Old Chal 11
  { area: "Route 121", req: { defeatCountRoute: { route: "Route 121", count: 150 } } }, // Old Chal 28
  { area: "Route 123", req: { defeatCountRoute: { route: "Route 123", count: 150 } } }, // Old Chal 31
  { area: "Route 126 Underwater", req: { defeatCountRoute: { route: "Route 126 Underwater", count: 150 } } }, // Old Chal 35 (Underwater Fishing Spot -> Route 126 Underwater)
  { area: "Victory Road", req: { defeatCountRoute: { route: "Victory Road", count: 200 } } }, // Old Chal 43
  { area: "Hoenn Pokemon League", req: { defeatHoennChampion: true } }, // Old Chal 44
  { area: "Petalburg Woods", req: { defeatMultipleSpecific: [{ species: "Silcoon", count: 1 }, { species: "Cascoon", count: 1 }] } }, // Old Chal 05
  { area: "Petalburg Gym", req: { earnBadge: { name: "Balance Badge", leader: "Norman", badgeCount: 5 } } }, // Old Chal 23
  { area: "Mauville Gym", req: { earnBadge: { name: "Dynamo Badge", leader: "Wattson", badgeCount: 3 } } }, // Old Chal 12
  { area: "Fortree Gym", req: { earnBadge: { name: "Feather Badge", leader: "Winona", badgeCount: 6 } } }, // Old Chal 32
  { area: "Lavaridge Gym", req: { earnBadge: { name: "Heat Badge", leader: "Flannery", badgeCount: 4 } } }, // Old Chal 16
  { area: "Dewford Gym", req: { earnBadge: { name: "Knuckle Badge", leader: "Brawly", badgeCount: 2 } } }, // Old Chal 10
  { area: "Mossdeep Gym", req: { earnBadge: { name: "Mind Badge", leader: "Tate and Liza", badgeCount: 7 } } }, // Old Chal 33
  { area: "Rustboro Gym", req: { earnBadge: { name: "Stone Badge", leader: "Roxanne", badgeCount: 1 } } }, // Old Chal 07

  // Custom text ones matching the prompt list:
  { area: "Sealed Chamber", req: { catchSpecies: [{ species: "Kingdra", count: 1 }, { species: "Wailord", count: 1 }] } }, // Extra Chal B 5
  { area: "Route 103", req: { catchSpecies: [{ species: "Pelipper", count: 1 }] } }, // Old Chal 02 (Capture 1 Pelippiper -> Pelipper)
  { area: "Route 113", req: { catchSpecies: [{ species: "Skarmory", count: 1 }] } }, // Old Chal 19
  { area: "Route 104", req: { catchSpecies: [{ species: "Taillow", count: 1 }] } }, // Old Chal 04
  { area: "Meteor Falls", req: { catchSpecies: [{ species: "Golbat", count: 2 }] } }, // Old Chal 21
  { area: "Trick House", req: { catchSpecies: [{ species: "Voltorb", count: 2 }, { species: "Electrode", count: 1 }] } }, // Extra Chal B 1
  { area: "Mauville Game Corner", req: { catchSpecies: [{ species: "Porygon", count: 3 }] } }, // Extra Chal A 1
  { area: "Fiery Path", req: { catchSpecies: [{ species: "Numel", count: 5 }] } }, // Old Chal 17
  { area: "Route 105", req: { catchSpeciesAnyOf: [[ {species: "Nosepass", count: 1}, {species: "Kadabra", count: 1} ]] } }, // Old Chal 08 -> Catch 1 Nosepass or 1 Kadabra - Actually old chal 8 was Granite Cave. Let's fix that.
  { area: "Route 119", req: { defeatSpecific: { name: "Swellow", count: 10 } } }, // Old Chal 26
  { area: "Route 115", req: { defeatSpecific: { name: "Jigglypuff", count: 10 } } }, // Old Chal 22
  { area: "Route 114", req: { defeatCountRoute: { route: "Route 114", count: 100 } } }, // Old Chal 20
  { area: "Route 101", req: { defeatCountRoute: { route: "Route 101", count: 25 } } }, // Old Chal 01
  { area: "Route 102", req: { defeatSpecific: { name: "Surskit", count: 3 } } }, // Old Chal 03
  { area: "Route 111", req: { defeatSpecific: { name: "Flygon", count: 5 } } }, // Old Chal 15
  { area: "Shoal Cave", req: { defeatMultipleSpecific: [{ name: "Sealeo", count: 5 }, { name: "Snorunt", count: 5 }] } } // Old Chal 37
];

// Correcting the Old Chal 08 (Granite Cave)
let graniteReq = reqUpdates.find(r => r.area === "Route 105");
if (graniteReq) {
    graniteReq.area = "Granite Cave";
    graniteReq.req = { catchSpeciesAnyOf: [[ {species: "Nosepass", count: 1}, {species: "Kadabra", count: 1} ]] };
}

for (let r of reqUpdates) {
    let chal = findByArea(r.area);
    if (chal) {
        chal.requirements = r.req;
    } else {
        console.log("Could not find challenge for area:", r.area);
    }
}

const output = `export const hoennRoutes = ${JSON.stringify(hoennRoutes, null, 2)};\n\nexport const hoennUnlocks = ${JSON.stringify(hoennUnlocks, null, 2)};\n`;

fs.writeFileSync('config/hoennRoutes.js', output);
