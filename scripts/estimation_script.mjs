import fs from 'fs';
import path from 'path';

const balance = {
    baseAttackDelay: 2.0,
    baseSearchTime: 3.0,
    safariZonePrice: 5000,
    casinoPrices: { standard: 75, doubleShiny: 200 }
};

// Math engine stripped functions for simulation
function calculateHP(baseHp, ivHp, level, quality, vitamins = 0) {
    const baseFinal = Math.floor((((2 * baseHp + ivHp) * level / 100) + level + 10) * quality);
    return baseFinal + Math.floor(baseFinal * (vitamins / 100));
}

function calculateStat(baseStat, ivStat, level, quality, vitamins = 0) {
    const baseFinal = Math.floor((((2 * baseStat + ivStat) * level / 100) + 5) * quality);
    return baseFinal + Math.floor(baseFinal * (vitamins / 100));
}

function calculateReqXP(level) {
    return Math.floor((4 + 496 * Math.pow((level - 1) / 98, 1.60)) * (5 + 8 * level));
}

function calculateTotalXP(level) {
    let total = 0;
    for (let i = 1; i < level; i++) total += calculateReqXP(i);
    return total;
}

function calculateEVXP(bst, level, quality, totalIV) {
    return Math.max(1, Math.floor((5 + 8 * level) * (bst / 300) * quality * (0.85 + 0.15 * (totalIV / 600))));
}

function calculateEVM(bst, level, quality, totalIV) {
    return Math.max(1, Math.floor(0.75 * Math.pow(level, 1.15) * Math.pow(bst / 300, 0.5) * Math.pow(quality / 1.20, 0.5) * (0.70 + 0.30 * (totalIV / 600))));
}

function calculateDamage(level, power, attackStat, defenseStat, typeEffectiveness, quality) {
    // using median modifier 0.925 and no critical hits for averages
    let baseDamage = Math.floor(((level + 5) / 125) * ((power * attackStat) / defenseStat) + 2);
    let expectedDamage = Math.max(1, Math.floor(baseDamage * typeEffectiveness * 0.925));
    return { damage: expectedDamage };
}

function calculateCatchChance(bst, level, quality, totalIV, ballMultiplier, catchBonus, shinyCatchMulti) {
    if (ballMultiplier >= 10) return 100;
    let baseChance = 74.0 - (bst / 14.6) - (level / 4.0) - 8.0 * ((quality - 0.8) / 1.0) - 5.0 * (totalIV / 600);
    if (baseChance < 1) baseChance = 1;
    return baseChance * ballMultiplier * (1 + catchBonus / 100) * shinyCatchMulti;
}

// Player state
let currentLevel = 1;
let currentXP = 0;
let money = 0;
let whiteCandies = 0;
let defeats = 0;
let totalTimeSeconds = 0;

let upgrades = {
    catchBonus: 0,
    shinyRolls: 1, // Base 1
    xpBonusMulti: 1.0,
    moneyBonusMulti: 1.0
};

// Simulation settings
const targetLevelKanto = 100;

console.log("Estimating time to beat Kanto (Level 1 to 100 on an average Route)...");
while (currentLevel < targetLevelKanto) {
    // Determine average wild pokemon level
    let wildLevel = currentLevel <= 10 ? 1 : Math.min(95, Math.max(5, currentLevel - 5));
    let bst = currentLevel <= 10 ? 253 : Math.min(500, 250 + (currentLevel * 2)); // average BST scaling
    let quality = 1.1; // Regular average
    let wildIV = 300; // Average IV

    // Buy candies logic
    if (defeats > 0 && defeats % 250 === 0) {
        whiteCandies++;
    }

    let xpGained = Math.floor(calculateEVXP(bst, wildLevel, quality, wildIV) * upgrades.xpBonusMulti);
    let moneyGained = Math.floor(calculateEVM(bst, wildLevel, quality, wildIV) * upgrades.moneyBonusMulti);

    // Assume average starters vs average wild
    let myAtk = calculateStat(80, 50, currentLevel, 1.2); // Player has slightly better quality (Uncommon)
    let mySpeed = calculateStat(80, 50, currentLevel, 1.2);
    let myDef = calculateStat(80, 50, currentLevel, 1.2);
    let myHp = calculateHP(80, 50, currentLevel, 1.2);

    let wildAtk = calculateStat(70, 50, wildLevel, quality);
    let wildDef = calculateStat(70, 50, wildLevel, quality);
    let wildHp = calculateHP(70, 50, wildLevel, quality);

    // Moves are typically ~60 power
    let myDamage = calculateDamage(currentLevel, 60, myAtk, wildDef, 1.0, 1.2).damage;
    let wildDamage = calculateDamage(wildLevel, 50, wildAtk, myDef, 1.0, quality).damage;

    let hitsToKill = Math.ceil(wildHp / Math.max(1, myDamage));
    let hitsToDie = Math.ceil(myHp / Math.max(1, wildDamage));

    // Delays
    let attackDelay = Math.max(0.25, balance.baseAttackDelay * (100 / (100 + mySpeed)));
    let searchTime = Math.max(0.3, balance.baseSearchTime * (100 / (100 + mySpeed)));

    let healTurns = 0;
    let healthLost = wildDamage * hitsToKill;
    if (healthLost >= (myHp * 0.5)) {
        healTurns = Math.floor(healthLost / (myHp * 0.4)); // Potion takes 1 turn, heals ~40%
    }

    // Potions cost money (approx $35 for 100hp, let's just subtract flat rate for now)
    money -= healTurns * 20;
    if (money < 0) money = 0;

    let totalTurns = hitsToKill + healTurns;
    let encounterTime = searchTime + (totalTurns * attackDelay) + 2.0; // 2s transition

    totalTimeSeconds += encounterTime;
    currentXP += xpGained;
    money += moneyGained;
    defeats++;

    let nextLevelXP = calculateTotalXP(currentLevel + 1);
    if (currentXP >= nextLevelXP) {
        currentLevel++;
        if (currentLevel % 10 === 0 || currentLevel === 100) {
            console.log(`Reached Level ${currentLevel} in ${(totalTimeSeconds / 3600).toFixed(2)} hours`);
        }
    }
}
console.log(`\nTime to beat Kanto Pokemon League: ${(totalTimeSeconds / 3600).toFixed(2)} hours`);


// Part 2: Catching 151 Pokemons (Kanto)
// Strategy: Need to catch rares. We will estimate based on encounter rates and catch chance.
// Rares have a low encounter rate and require money to buy good balls (Ultraball)

let kantoTotalTime = totalTimeSeconds;
let totalKantoRares = 15; // approximate hard to catch rares/epics
let avgRareCatchChance = calculateCatchChance(500, 50, 1.5, 300, 2.0, 15, 1.0); // Ultraball (2.0), Rare (1.5), Lv50
console.log(`\nAverage Ultraball catch chance for Rare Lv50: ${avgRareCatchChance.toFixed(2)}%`);

let throwsPerRare = Math.ceil(100 / avgRareCatchChance);
let timePerThrow = 2.5; // approx time for throw animation and turn
let timeToCatchRare = throwsPerRare * timePerThrow;
console.log(`Throws per rare: ${throwsPerRare}. Time: ${timeToCatchRare}s`);

// Assuming a 5% spawn rate for rares on average
let encountersToFindRare = Math.ceil(100 / 5);
let timeToFindRare = encountersToFindRare * 6.0; // 6s per average fast encounter
let timePerRareCapture = timeToFindRare + timeToCatchRare;

let totalRareCatchTimeHours = (timePerRareCapture * totalKantoRares) / 3600;
console.log(`Estimated active time explicitly hunting Kanto Rares: ${totalRareCatchTimeHours.toFixed(2)} hours`);

let kanto100PercentTime = kantoTotalTime / 3600 + totalRareCatchTimeHours; // Includes beating the game
console.log(`Time to Catch all 151 Kanto Pokemons: ${kanto100PercentTime.toFixed(2)} hours`);

// Part 3: Shiny Hunting (151 Shinies)
// Shiny base rate is 1/12000. With max candies and tasks, shinyRolls can reach ~30.
// Let's assume an average mid-late game shiny roll count of 15.
let avgShinyRolls = 15;
let shinyChance = avgShinyRolls / 12000;
console.log(`\nAverage late-game shiny chance: ${(shinyChance * 100).toFixed(4)}% (1 in ${Math.ceil(1/shinyChance)})`);

// To get 151 DIFFERENT shinies, we must consider the coupon collector's problem.
// However, since players hunt on specific routes to target specific mons, it's not purely random across 151.
// They hunt route by route. Let's say a route has 5 pokemon.
// Finding a specific shiny on a route where it has a 20% spawn rate:
// Effective chance = (20%) * (15/12000) = 1 in 4000 encounters per specific shiny.

let encountersPerSpecificShiny = Math.ceil(1 / (0.20 * shinyChance));
let timePerEncounterLateGame = 5.0; // Fast one-shots
let timePerSpecificShiny = encountersPerSpecificShiny * timePerEncounterLateGame;

let totalShinyHuntTime = (timePerSpecificShiny * 151) / 3600;
console.log(`Estimated time to hunt all 151 Shinies: ${totalShinyHuntTime.toFixed(2)} hours`);


// Part 4: Johto (Region 2) - Beat Viridian Gym
// Viridian Gym is the final gym (Gym 8) in Johto.
// Player keeps their level 100 Pokemon, but Johto scales higher.
// Actually, Kanto ends at ~100. Johto starts at ~100 and scales to ~180.
currentLevel = 100;
let johtoTotalTime = 0;
console.log("\nEstimating time to beat Johto (Viridian Gym) starting at Level 100...");
while (currentLevel < 180) {
    let wildLevel = currentLevel - 5;
    let bst = 500;
    let quality = 1.2;
    let wildIV = 400;

    let xpGained = Math.floor(calculateEVXP(bst, wildLevel, quality, wildIV) * 1.5); // Better XP multi later
    let myAtk = calculateStat(90, 80, currentLevel, 1.4);
    let mySpeed = calculateStat(90, 80, currentLevel, 1.4);
    let myDef = calculateStat(90, 80, currentLevel, 1.4);
    let myHp = calculateHP(90, 80, currentLevel, 1.4);

    let wildAtk = calculateStat(80, 50, wildLevel, quality);
    let wildDef = calculateStat(80, 50, wildLevel, quality);
    let wildHp = calculateHP(80, 50, wildLevel, quality);

    let myDamage = calculateDamage(currentLevel, 80, myAtk, wildDef, 1.0, 1.4).damage;
    let wildDamage = calculateDamage(wildLevel, 70, wildAtk, myDef, 1.0, quality).damage;

    let hitsToKill = Math.ceil(wildHp / Math.max(1, myDamage));
    let hitsToDie = Math.ceil(myHp / Math.max(1, wildDamage));

    let attackDelay = Math.max(0.25, balance.baseAttackDelay * (100 / (100 + mySpeed)));
    let searchTime = Math.max(0.3, balance.baseSearchTime * (100 / (100 + mySpeed)));

    let healTurns = 0;
    let healthLost = wildDamage * hitsToKill;
    if (healthLost >= (myHp * 0.5)) {
        healTurns = Math.floor(healthLost / (myHp * 0.4));
    }

    let totalTurns = hitsToKill + healTurns;
    let encounterTime = searchTime + (totalTurns * attackDelay) + 2.0;

    johtoTotalTime += encounterTime;
    currentXP += xpGained;

    let nextLevelXP = calculateTotalXP(currentLevel + 1);
    if (currentXP >= nextLevelXP) {
        currentLevel++;
        if (currentLevel % 10 === 0) {
            console.log(`Reached Level ${currentLevel} in ${(johtoTotalTime / 3600).toFixed(2)} hours (Johto)`);
        }
    }
}
console.log(`Time to beat Johto (Viridian Gym): ${(johtoTotalTime / 3600).toFixed(2)} hours`);

// Johto All Pokemons (approx 100 new)
let johtoRares = 10;
let johtoRareTime = ((timePerRareCapture * johtoRares) / 3600);
let johto100PercentTime = (johtoTotalTime / 3600) + johtoRareTime;
console.log(`Time to Catch all Johto Pokemons: ${johto100PercentTime.toFixed(2)} hours`);

// Johto All Shinies (100 new)
let totalJohtoShinyHuntTime = (timePerSpecificShiny * 100) / 3600;
console.log(`Estimated time to hunt all Johto Shinies: ${totalJohtoShinyHuntTime.toFixed(2)} hours`);
