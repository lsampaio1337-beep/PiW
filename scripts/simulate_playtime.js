import * as mathEngine from '../src/mathEngine.js';
import balance from '../config/balance.js';

function simulateGame() {
    let currentLevel = 5;
    let totalTimeSeconds = 0;
    let currentXP = mathEngine.calculateTotalXP(currentLevel);

    console.log("Starting full game emulation (incorporating Potions, Delays, RNG, Catching)...");

    let totalCatchesNeeded = 50;
    let timeSpentCatching = 0;

    while(currentLevel < 100) {
        let wildLevel = currentLevel <= 10 ? Math.min(5, currentLevel) : Math.min(80, Math.max(5, currentLevel - 2));
        let bst = currentLevel <= 10 ? 253 : Math.min(500, 250 + (currentLevel * 2));

        let xpGained = mathEngine.calculateEVXP(bst, wildLevel, 1.0, 300);

        let myAtk = mathEngine.calculateStat(80, 15, currentLevel, 1.0);
        let mySpeed = mathEngine.calculateStat(80, 15, currentLevel, 1.0);
        let myDef = mathEngine.calculateStat(80, 15, currentLevel, 1.0);
        let myHp = mathEngine.calculateHP(80, 15, currentLevel, 1.0);

        let wildAtk = mathEngine.calculateStat(70, 15, wildLevel, 1.0);
        let wildDef = mathEngine.calculateStat(70, 15, wildLevel, 1.0);
        let wildHp = mathEngine.calculateHP(70, 15, wildLevel, 1.0);

        let myDamage = Math.floor(mathEngine.calculateDamage(currentLevel, 60, myAtk, wildDef, 1.0, 1.0).damage * 0.925);
        let wildDamage = Math.floor(mathEngine.calculateDamage(wildLevel, 50, wildAtk, myDef, 1.0, 1.0).damage * 0.925);

        let hitsToKill = Math.ceil(wildHp / Math.max(1, myDamage));
        let hitsToDie = Math.ceil(myHp / Math.max(1, wildDamage));

        let attackDelay = Math.max(250, balance.baseAttackDelay * 1000 * (100 / (100 + mySpeed))) / 1000;
        let searchTime = Math.max(300, balance.baseSearchTime * 1000 * (100 / (100 + mySpeed))) / 1000;

        let healTurns = 0;
        let healthLost = wildDamage * hitsToKill;
        if (healthLost >= (myHp * 0.5)) {
            healTurns = Math.floor(healthLost / (myHp * 0.4));
        }

        let totalTurns = hitsToKill + healTurns;
        totalTurns *= 1.1;

        let encounterTime = searchTime + (totalTurns * attackDelay) + 2.0;

        totalTimeSeconds += encounterTime;
        currentXP += xpGained;

        let nextLevelXP = mathEngine.calculateTotalXP(currentLevel + 1);
        if (currentXP >= nextLevelXP) {
            currentLevel++;
            if (currentLevel % 10 === 0 || currentLevel === 100) {
                console.log(`Reached Level ${currentLevel} in ${(totalTimeSeconds / 3600).toFixed(2)} hours`);
            }
        }
    }

    totalTimeSeconds += 600;
    totalTimeSeconds *= 1.05;

    console.log(`\nSimulation complete!`);
    console.log(`Estimated active playtime to reach Level 100: ${(totalTimeSeconds / 3600).toFixed(2)} hours`);
}

simulateGame();
