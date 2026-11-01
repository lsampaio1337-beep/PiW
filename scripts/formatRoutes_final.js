const fs = require('fs');

let code = fs.readFileSync('config/hoennRoutes.js', 'utf8');

// Note: hoennRoutes exports hoennRoutes and hoennUnlocks!
code = code.replace(/export const /g, 'exports.');
fs.writeFileSync('scripts/tempRoutes.js', code);

const { hoennRoutes, hoennUnlocks } = require('./tempRoutes.js');

let routes = hoennRoutes.filter(r => r.name !== "Mirage Island");

const renameMap = {
  "Tiny Fishing Spot": "Route 106 Fishing Spot",
  "Small Fishing Spot": "Route 109 Fishing Spot",
  "Big Fishing Spot": "Route 124",
  "Underwater Fishing Spot": "Route 126 Underwater"
};

for (const r of routes) {
  if (r.name && renameMap[r.name]) {
    r.name = renameMap[r.name];
  }
}

const newRoutes = [
  {
    name: "Route 105",
    spawns: [
      { pokemonId: 72, minLevel: 10, maxLevel: 14, chance: 0.6 },
      { pokemonId: 278, minLevel: 10, maxLevel: 14, chance: 0.4 }
    ]
  },
  {
    name: "Route 108",
    spawns: [
      { pokemonId: 72, minLevel: 12, maxLevel: 16, chance: 0.6 },
      { pokemonId: 278, minLevel: 12, maxLevel: 16, chance: 0.4 }
    ]
  },
  {
    name: "Weather Institute",
    spawns: [
      { pokemonId: 351, minLevel: 25, maxLevel: 30, chance: 1.0 }
    ]
  },
  {
    name: "Route 125",
    spawns: [
      { pokemonId: 72, minLevel: 35, maxLevel: 40, chance: 0.6 },
      { pokemonId: 278, minLevel: 35, maxLevel: 40, chance: 0.4 }
    ]
  }
];

routes.push(...newRoutes);

let unlocks = hoennUnlocks.filter(c => c.areaId !== "Mirage Island");

for (const c of unlocks) {
  if (c.areaId && renameMap[c.areaId]) {
    c.areaId = renameMap[c.areaId];
  }
  if (c.unlocks) {
    c.unlocks = c.unlocks.map(u => {
      if (u === "Mirage Island") return "Sky Pillar";
      if (renameMap[u]) return renameMap[u];
      return u;
    });
  }
}

const orderedChallenges = [
  "Route 101",
  "Route 103",
  "Route 102",
  "Route 104",
  "Petalburg Woods",
  "Route 116",
  "Rustboro Gym",

  "Route 105",
  "Route 106 Fishing Spot",
  "Granite Cave",
  "Dewford Gym",

  "Route 107",
  "Route 108",
  "Route 109 Fishing Spot",
  "Mauville Gym",

  "Route 110",
  "Route 117",
  "Route 111",
  "Lavaridge Gym",

  "Fiery Path",
  "Jagged Pass",
  "Route 113",
  "Route 114",
  "Meteor Falls",
  "Route 115",
  "Petalburg Gym",

  "Route 118",
  "Route 119",
  "Weather Institute",
  "Fortree Gym",

  "Route 120",
  "Route 121",
  "Safari Zone East",
  "Mount Pyre",
  "Route 123",
  "Mossdeep Gym",

  "Route 124",
  "Route 125",
  "Route 126 Underwater",
  "Sootopolis Gym",

  "Shoal Cave",
  "Sky Pillar",
  "Victory Road",
  "Hoenn Pokemon League"
];

let challenges = [];
let challengeNum = 1;

for (let i = 0; i < orderedChallenges.length; i++) {
  const areaId = orderedChallenges[i];
  const nextAreaId = orderedChallenges[i+1];

  let existing = unlocks.find(c => c.areaId === areaId);

  let newChallenge = {
    challengeName: `Challenge ${String(challengeNum).padStart(2, '0')}`,
    areaId: areaId,
    unlocks: nextAreaId ? [nextAreaId] : []
  };

  if (existing) {
    if (existing.gift) newChallenge.gift = existing.gift;
    if (existing.gifts) newChallenge.gifts = existing.gifts;
    if (existing.requirements) newChallenge.requirements = existing.requirements;
    if (existing.unlocks) {
       const extraUnlocks = existing.unlocks.filter(u => !orderedChallenges.includes(u) && u !== "Sky Pillar" && u !== "Mirage Island");
       newChallenge.unlocks.push(...extraUnlocks);
    }
  } else {
    newChallenge.requirements = {
      defeatCountRoute: {
        route: areaId,
        count: 10
      }
    };
  }

  if (areaId === "Hoenn Pokemon League") {
     newChallenge.unlocks = ["Roaming Hoenn Skies", "Mauville Game Corner", "Trick House"];
  }

  challenges.push(newChallenge);
  challengeNum++;
}

const extraChallenges = unlocks.filter(c => c.challengeName && (c.challengeName.startsWith("Extra ") || c.challengeName.includes("Nebula") || c.challengeName.includes("Key")));
challenges.push(...extraChallenges);

const output = `export const hoennRoutes = ${JSON.stringify(routes, null, 2)};\n\nexport const hoennUnlocks = ${JSON.stringify(challenges, null, 2)};\n`;

fs.writeFileSync('config/hoennRoutes.js', output);
