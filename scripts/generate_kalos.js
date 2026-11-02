const fs = require('fs');

const pokemonDataRaw = fs.readFileSync('../data/pokemon.json', 'utf8');
const pokemonData = JSON.parse(pokemonDataRaw);
const pokemonNameToId = {};
for (const pkmn of pokemonData) {
  pokemonNameToId[pkmn.name] = pkmn.id;
}

const inputRaw = fs.readFileSync('kalos_data.txt', 'utf8');
const lines = inputRaw.trim().split('\n');

const routes = [];
const routeOrder = [];
let currentRoute = null;

const standardChances6 = [0.3, 0.25, 0.15, 0.15, 0.1, 0.05];
const standardChances5 = [0.3, 0.25, 0.2, 0.15, 0.1];
const standardChances4 = [0.25, 0.25, 0.25, 0.25];
const standardChances3 = [0.33, 0.33, 0.33];
const standardChances9 = [0.1111, 0.1111, 0.1111, 0.1111, 0.1111, 0.1111, 0.1111, 0.1111, 0.1111];

for (const line of lines) {
  const parts = line.trim().split('\t');
  if (parts.length < 2) continue;

  const orderStr = parts[0].trim();
  const routeName = parts[1].trim();
  const pokemonName = parts[2] ? parts[2].trim() : null;

  let routeObj = routes.find(r => r.name === routeName);
  if (!routeObj) {
    routeObj = {
      orderStr: orderStr,
      name: routeName,
      spawns: [],
      isGym: pokemonName === null || pokemonName === ''
    };
    routes.push(routeObj);
    routeOrder.push(routeObj);
  }

  if (pokemonName) {
    const pId = pokemonNameToId[pokemonName];
    if (!pId) {
      console.warn(`Pokemon not found: ${pokemonName}`);
    } else {
      routeObj.spawns.push({ pokemonId: pId, pokemonName: pokemonName });
    }
  }
}

// Generate challenges and level progression
const mainChallenges = routeOrder.filter(r => /^\d+$/.test(r.orderStr));
const extraChallenges = routeOrder.filter(r => !/^\d+$/.test(r.orderStr));

const maxMainLevel = 80;
const numMainChallenges = mainChallenges.length;

function getLevelsForMain(index) {
  const minLevel = 1 + Math.floor((maxMainLevel - 1) * index / (numMainChallenges - 1));
  let range = 2;
  if (minLevel >= 12) range = 3;
  if (minLevel >= 30) range = Math.min(8, Math.floor(minLevel * 0.1));
  return { minLevel, maxLevel: minLevel + range };
}

for (let i = 0; i < mainChallenges.length; i++) {
  const route = mainChallenges[i];
  const levels = getLevelsForMain(i);
  route.minLevel = levels.minLevel;
  route.maxLevel = levels.maxLevel;
  route.challengeName = `Challenge ${String(i).padStart(2, '0')}`;
}

function getLevelsForExtra(route, branchFromRouteName, index, totalExtra) {
    const branchRoute = mainChallenges.find(r => r.name === branchFromRouteName);
    const startMin = branchRoute ? branchRoute.minLevel : 30;
    const targetMin = 100;

    let minLevel = startMin + Math.floor((targetMin - startMin) * (index + 1) / totalExtra);

    let range = 2;
    if (minLevel >= 12) range = 3;
    if (minLevel >= 30) range = Math.min(8, Math.floor(minLevel * 0.1));
    if (minLevel >= 100) range = 5;

    return { minLevel, maxLevel: minLevel + range };
}

const extraA = extraChallenges.filter(r => r.orderStr.startsWith('Extra Challenge A'));
for (let i = 0; i < extraA.length; i++) {
    const levels = getLevelsForExtra(extraA[i], 'Santalune City Gym', i, extraA.length);
    extraA[i].minLevel = levels.minLevel;
    extraA[i].maxLevel = levels.maxLevel;
    extraA[i].challengeName = extraA[i].orderStr;
}

const extraB = extraChallenges.filter(r => r.orderStr.startsWith('Extra Challenge B'));
for (let i = 0; i < extraB.length; i++) {
    const levels = getLevelsForExtra(extraB[i], 'Anistar City Gym', i, extraB.length);
    extraB[i].minLevel = levels.minLevel;
    extraB[i].maxLevel = levels.maxLevel;
    extraB[i].challengeName = extraB[i].orderStr;
}

const league = {
    orderStr: '53',
    name: 'Kalos Pokemon League',
    spawns: [],
    isGym: true,
    minLevel: 80,
    maxLevel: 80,
    challengeName: 'Challenge 53'
};
mainChallenges.push(league);
routeOrder.push(league);

const extraC = extraChallenges.filter(r => r.orderStr.startsWith('Extra Challenge C'));
for (let i = 0; i < extraC.length; i++) {
    const levels = getLevelsForExtra(extraC[i], 'Kalos Pokemon League', i, extraC.length);
    extraC[i].minLevel = levels.minLevel;
    extraC[i].maxLevel = levels.maxLevel;
    extraC[i].challengeName = extraC[i].orderStr;
}

const extraD = extraChallenges.filter(r => r.orderStr.startsWith('Extra Challenge D'));
for (let i = 0; i < extraD.length; i++) {
    const levels = getLevelsForExtra(extraD[i], 'Kalos Pokemon League', i, extraD.length);
    extraD[i].minLevel = levels.minLevel;
    extraD[i].maxLevel = levels.maxLevel;
    extraD[i].challengeName = extraD[i].orderStr;
}

const extraE = extraChallenges.filter(r => r.orderStr.startsWith('Extra Challenge E'));
for (let i = 0; i < extraE.length; i++) {
    const levels = getLevelsForExtra(extraE[i], 'Kalos Pokemon League', i, extraE.length);
    extraE[i].minLevel = levels.minLevel;
    extraE[i].maxLevel = levels.maxLevel;
    extraE[i].challengeName = extraE[i].orderStr;
}

const finalRoutesOutput = [];

for (const route of routeOrder) {
    if (route.isGym) {
        finalRoutesOutput.push({
            name: route.name,
            spawns: []
        });
        continue;
    }

    let chances = standardChances6;
    if (route.spawns.length === 5) chances = standardChances5;
    else if (route.spawns.length === 4) chances = standardChances4;
    else if (route.spawns.length === 3) chances = standardChances3;
    else if (route.spawns.length === 9) chances = standardChances9;

    const mappedSpawns = route.spawns.map((s, idx) => {
        let finalChance = chances[idx] || (1 / route.spawns.length);
        return {
            pokemonId: s.pokemonId,
            minLevel: route.minLevel,
            maxLevel: route.maxLevel,
            chance: Number(finalChance.toFixed(4)) // Keep clean numbers
        };
    });

    finalRoutesOutput.push({
        name: route.name,
        spawns: mappedSpawns
    });
}

const unlocksOutput = [];

for (let i = 0; i < mainChallenges.length; i++) {
    const route = mainChallenges[i];
    const nextRoute = mainChallenges[i + 1];

    let defeatCount = 25 + Math.floor((300 - 25) * i / (numMainChallenges - 1));
    defeatCount = Math.round(defeatCount / 25) * 25;
    if (defeatCount < 25) defeatCount = 25;
    if (defeatCount > 300) defeatCount = 300;

    let unlockObj = {
        challengeName: route.challengeName,
        areaId: route.name,
        unlocks: nextRoute ? [nextRoute.name] : [],
        requirements: {}
    };

    if (route.isGym) {
        if (route.name === 'Santalune City Gym') {
            unlockObj.requirements = { earnBadge: { name: "Bug Badge", leader: "Viola", badgeCount: 1 } };
            unlockObj.unlocks.push(extraA[0].name);
        } else if (route.name === 'Cyllage City Gym') {
            unlockObj.requirements = { earnBadge: { name: "Cliff Badge", leader: "Grant", badgeCount: 2 } };
        } else if (route.name === 'Shalour City Gym') {
            unlockObj.requirements = { earnBadge: { name: "Rumble Badge", leader: "Korrina", badgeCount: 3 } };
        } else if (route.name === 'Coumarine City Gym') {
            unlockObj.requirements = { earnBadge: { name: "Plant Badge", leader: "Ramos", badgeCount: 4 } };
        } else if (route.name === 'Lumiose City Gym') {
            unlockObj.requirements = { earnBadge: { name: "Voltage Badge", leader: "Clemont", badgeCount: 5 } };
        } else if (route.name === 'Laverre City Gym') {
            unlockObj.requirements = { earnBadge: { name: "Fairy Badge", leader: "Valerie", badgeCount: 6 } };
        } else if (route.name === 'Anistar City Gym') {
            unlockObj.requirements = { earnBadge: { name: "Psychic Badge", leader: "Olympia", badgeCount: 7 } };
            unlockObj.unlocks.push(extraB[0].name);
        } else if (route.name === 'Snowbelle City Gym') {
            unlockObj.requirements = { earnBadge: { name: "Iceberg Badge", leader: "Wulfric", badgeCount: 8 } };
        } else if (route.name === 'Kalos Pokemon League') {
            unlockObj.requirements = { defeatKalosChampion: true };
            unlockObj.unlocks = [extraC[0].name, extraD[0].name, extraE[0].name];
        }
    } else {
        unlockObj.requirements = { defeatCountRoute: { route: route.name, count: defeatCount } };
    }

    unlocksOutput.push(unlockObj);
}

const extraChains = [extraA, extraB, extraC, extraD, extraE];
for (const chain of extraChains) {
    for (let i = 0; i < chain.length; i++) {
        const route = chain[i];
        const nextRoute = chain[i + 1];

        let unlockObj = {
            challengeName: route.challengeName,
            areaId: route.name,
            requirements: { defeatCountRoute: { route: route.name, count: 150 } }
        };

        if (nextRoute) {
            unlockObj.unlocks = [nextRoute.name];
        } else {
            unlockObj.gift = { item: "Masterball", count: 1 };
        }

        unlocksOutput.push(unlockObj);
    }
}

const keysChallenge = {
    name: "Keys to Eternal Fight",
    spawns: []
};
const eternalFight = {
    name: "The Eternal Fight",
    spawns: [
        { pokemonId: 717, minLevel: 120, maxLevel: 120, chance: 0.33 },
        { pokemonId: 718, minLevel: 115, maxLevel: 119, chance: 0.33 },
        { pokemonId: 716, minLevel: 115, maxLevel: 119, chance: 0.33 }
    ]
};
finalRoutesOutput.push(keysChallenge);
finalRoutesOutput.push(eternalFight);

unlocksOutput.push({
    challengeName: "Keys to Eternal Fight Challenge",
    areaId: "Keys to Eternal Fight",
    unlocks: ["The Eternal Fight"],
    requirements: {
        completeChallenges: [
            extraC[extraC.length - 1].challengeName,
            extraD[extraD.length - 1].challengeName,
            extraE[extraE.length - 1].challengeName
        ]
    }
});
unlocksOutput.push({
    challengeName: "Eternal Fight Challenge",
    areaId: "The Eternal Fight",
    requirements: {
        catchSpecies: [
            { species: "Yveltal", count: 1 },
            { species: "Zygarde", count: 1 },
            { species: "Xerneas", count: 1 }
        ]
    },
    gift: { item: "Masterball", count: 2 }
});

const finalJs = "export const kalosRoutes = " + JSON.stringify(finalRoutesOutput, null, 2) + ";\n\nexport const kalosUnlocks = " + JSON.stringify(unlocksOutput, null, 2) + ";\n";

fs.writeFileSync('../config/kalosRoutes.js', finalJs);
console.log('Done!');
