// src/mathEngine.js

function calculateHP(baseHp, ivHp, level, quality) {
    // HP = floor(((2 * BaseHP + IV_HP) * Level / 100 + Level + 10) * Q)
    return Math.floor((((2 * baseHp + ivHp) * level / 100) + level + 10) * quality);
}

function calculateStat(baseStat, ivStat, level, quality) {
    // Stat = floor(((2 * BaseStat + IV_Stat) * Level / 100 + 5) * Q)
    return Math.floor((((2 * baseStat + ivStat) * level / 100) + 5) * quality);
}

function calculateReqXP(level) {
    // ReqXP(L) = floor(L * (36 + 0.44 * (L - 1)^2))
    return Math.floor(level * (36 + 0.44 * Math.pow(level - 1, 2)));
}

function calculateTotalXP(level) {
    let total = 0;
    for (let i = 1; i < level; i++) {
        total += calculateReqXP(i);
    }
    return total;
}

function getLevelFromXP(xp) {
    let level = 1;
    let totalXpNeeded = 0;
    while (level < 100) {
        totalXpNeeded += calculateReqXP(level);
        if (xp < totalXpNeeded) {
            break;
        }
        level++;
    }
    return level;
}

function calculateEVXP(bst, level, quality, totalIV) {
    // EVXP = max(1, floor(1.82 * (7.0 + 8.47 * (Level - 1)) * (BST / 300)^0.85 * (Q / 1.20)^0.30 * (0.85 + 0.15 * (IV_Total / 600))))
    const evxp = Math.floor(1.82 * (7.0 + 8.47 * (level - 1)) * Math.pow(bst / 300, 0.85) * Math.pow(quality / 1.20, 0.30) * (0.85 + 0.15 * (totalIV / 600)));
    return Math.max(1, evxp);
}

function calculateEVM(bst, level, quality, totalIV) {
    // EVM = max(1, floor(0.75 * (Level)^1.15 * (BST / 300)^0.5 * (Q / 1.20)^0.5 * (0.70 + 0.30 * (IV_Total / 600))))
    const evm = Math.floor(0.75 * Math.pow(level, 1.15) * Math.pow(bst / 300, 0.5) * Math.pow(quality / 1.20, 0.5) * (0.70 + 0.30 * (totalIV / 600)));
    return Math.max(1, evm);
}

function calculatePP(bst, level, quality, totalIV) {
    // PP = max(1, floor(50 * (Q / 1.40)^4.0 * (IV_Total / 450)^3.0 * (BST / 300)^1.1 * (Level / 50)))
    const pp = Math.floor(50 * Math.pow(quality / 1.40, 4.0) * Math.pow(totalIV / 450, 3.0) * Math.pow(bst / 300, 1.1) * (level / 50));
    return Math.max(1, pp);
}



function calculateCatchChance(bst, level, quality, totalIV, ballMultiplier, stats = {}, isShiny = false) {
    if (ballMultiplier >= 10) return 100; // Masterball

    let cTaskTier = stats.cTaskTier || 0;
    let catchBonus = 0;
    if (cTaskTier >= 5) catchBonus = 25;
    else if (cTaskTier >= 4) catchBonus = 20;
    else if (cTaskTier >= 3) catchBonus = 15;
    else if (cTaskTier >= 2) catchBonus = 10;
    else if (cTaskTier >= 1) catchBonus = 5;

    // Black Yellow Candy Catch Bonus
    catchBonus += (4 * (stats.blackYellowCandies || 0));

    let shinySeenTaskTier = stats.shinySeenTaskTier || 0;
    let shinyCatchMulti = (isShiny && shinySeenTaskTier >= 3) ? 2 : 1;

    let baseChance = 74.0 - (bst / 14.6) - (level / 4.0) - 8.0 * ((quality - 0.8) / 1.0) - 5.0 * (totalIV / 600);
    if (baseChance < 1) baseChance = 1;

    let chance = baseChance * ballMultiplier * (1 + catchBonus / 100) * shinyCatchMulti;

    return Math.min(100.0, Math.max(1.0, chance));
}

function generateQuality(stats = {}, isDoubleShiny = false) {
    let roll = Math.floor(Math.random() * 12000) + 1;
    let shinySeenTaskTier = stats.shinySeenTaskTier || 0;

    // Rainbow Candy Shiny Bonus (+X rolls)
    let extraRolls = stats.rainbowCandies || 0;

    // Shiny Boosters
    // Regular gives +1 roll (11999 becomes 12000). Good gives +2 rolls (11998 becomes 12000), completely replacing the +1.
    if (shinySeenTaskTier >= 2) extraRolls += 2; // Good Shiny +2 rolls
    else if (shinySeenTaskTier == 1) extraRolls += 1; // Regular Shiny +1 roll

    // Apply extra rolls logic by artificially boosting the roll if it's within the threshold
    if (roll >= (12000 - extraRolls)) {
        roll = 12000;
    }

    let qTaskTier = stats.qTaskTier || 0;
    let bonusValue = 0;
    let weakMaxRoll = 1474;
    let regularMaxRoll = 6586;
    let uncommonMaxRoll = 9593;
    let rareMaxRoll = 11097;

    // Quality Booster Roll Thresholds based on task tiers
    // Quality Booster Tier None Low Regular Good Excellent Master
    if (qTaskTier >= 5) {
        bonusValue = 1.00; weakMaxRoll = 120; regularMaxRoll = 3720; uncommonMaxRoll = 6120; rareMaxRoll = 8970;
    } else if (qTaskTier >= 4) {
        bonusValue = 0.70; weakMaxRoll = 270; regularMaxRoll = 4470; uncommonMaxRoll = 7170; rareMaxRoll = 9570;
    } else if (qTaskTier >= 3) {
        bonusValue = 0.45; weakMaxRoll = 570; regularMaxRoll = 5220; uncommonMaxRoll = 7920; rareMaxRoll = 9870;
    } else if (qTaskTier >= 2) {
        bonusValue = 0.30; weakMaxRoll = 870; regularMaxRoll = 5820; uncommonMaxRoll = 8820; rareMaxRoll = 10320;
    } else if (qTaskTier >= 1) {
        bonusValue = 0.15; weakMaxRoll = 1170; regularMaxRoll = 6270; uncommonMaxRoll = 9420; rareMaxRoll = 10920;
    }

    // Determine shiny threshold
    let shinyRolls = 1;

    // Shiny Boosters
    if (shinySeenTaskTier >= 2) shinyRolls += 2; // Good Shiny +2 rolls
    else if (shinySeenTaskTier == 1) shinyRolls += 1; // Regular Shiny +1 roll

    if (isDoubleShiny) {
        let doubleRolls = shinyRolls;
        shinyRolls *= 2;
        rareMaxRoll -= doubleRolls;
    }

    let shinyMinThreshold = 12000 - shinyRolls + 1;
    if (roll >= shinyMinThreshold) {
        roll = 12000;
    }

    let tierName = "";
    let baseQ = 0;
    let maxQ = 0;

    if (roll <= weakMaxRoll) { tierName = "Weak"; baseQ = 0.80; maxQ = 0.99; }
    else if (roll <= regularMaxRoll) { tierName = "Regular"; baseQ = 1.00; maxQ = 1.19; }
    else if (roll <= uncommonMaxRoll) { tierName = "Uncommon"; baseQ = 1.20; maxQ = 1.39; }
    else if (roll <= rareMaxRoll) { tierName = "Rare"; baseQ = 1.40; maxQ = 1.59; }
    else if (roll < 12000) { tierName = "Epic"; baseQ = 1.60; maxQ = 1.80; }
    else { return { name: "Shiny", q: 2.00 }; }

    let originalQ = baseQ + Math.random() * (maxQ - baseQ);

    // NewValue = (1 + BonusValue) * (OriginalValue - TierMin) + TierMin
    let newQ = (1 + bonusValue) * (originalQ - baseQ) + baseQ;

    if (newQ > maxQ) newQ = maxQ;
    newQ = Math.floor(newQ * 100) / 100;

    return { name: tierName, q: newQ };
}

function generateIVs(stats = {}, isShiny = false) {
    // Mastery IV Booster
    let ivTaskTier = stats.ivTaskTier || 0;
    let masteryBoost = 0;
    if (ivTaskTier >= 5) masteryBoost = 0.25;
    else if (ivTaskTier >= 4) masteryBoost = 0.20;
    else if (ivTaskTier >= 3) masteryBoost = 0.15;
    else if (ivTaskTier >= 2) masteryBoost = 0.10;
    else if (ivTaskTier >= 1) masteryBoost = 0.05;

    // Shiny IV Booster
    let shinyCaughtTaskTier = stats.shinyCaughtTaskTier || 0;
    let shinyBoost = 0;
    if (isShiny && shinyCaughtTaskTier >= 1) {
        shinyBoost = 0.25;
    }

    // Roll random SumIV from 6 to 600
    let sumIV = Math.floor(Math.random() * 595) + 6;

    // Apply bonuses multiplicatively
    sumIV = Math.floor(sumIV * (1 + masteryBoost) * (1 + shinyBoost));

    // Cap at 600
    if (sumIV > 600) {
        sumIV = 600;
    }

    // Randomly distribute from 1-100 each stat
    let generatedStats = [1, 1, 1, 1, 1, 1];
    let remaining = sumIV - 6;

    while (remaining > 0) {
        let availableIndices = [];
        for (let i = 0; i < 6; i++) {
            if (generatedStats[i] < 100) availableIndices.push(i);
        }

        let i = availableIndices[Math.floor(Math.random() * availableIndices.length)];

        let capacityOfOthers = 0;
        for (let j of availableIndices) {
            if (j !== i) capacityOfOthers += (100 - generatedStats[j]);
        }

        let minAdd = Math.max(1, remaining - capacityOfOthers);
        let maxAdd = Math.min(remaining, 100 - generatedStats[i]);

        let add = Math.floor(Math.random() * (maxAdd - minAdd + 1)) + minAdd;
        generatedStats[i] += add;
        remaining -= add;
    }

    for (let i = generatedStats.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [generatedStats[i], generatedStats[j]] = [generatedStats[j], generatedStats[i]];
    }

    return {
        hp: generatedStats[0],
        atk: generatedStats[1],
        def: generatedStats[2],
        spa: generatedStats[3],
        spd: generatedStats[4],
        spe: generatedStats[5]
    };
}

function calculateDamage(level, power, attackStat, defenseStat, typeEffectiveness, quality) {
    // BaseDamage = floor(((Level + 5) / 125) * ((Power * AttackStat) / DefenseStat) + 2)
    // Modifier involves type, critical, random. But do NOT include direct Quality multiplier as per AGENTS.md / constraints!
    // Memory: "Base damage calculation modifiers involve type effectiveness, critical hits, and random variance, but they do NOT include a direct Quality multiplier since Quality is already factored into the Attack and Defense stats."
    const isCritical = Math.random() < 0.04;
    const criticalMult = isCritical ? 1.5 : 1.0;
    const randomMult = 0.85 + Math.random() * 0.15; // Uniform float in [0.85, 1.00]

    const modifier = typeEffectiveness * criticalMult * randomMult;

    let baseDamage = Math.floor(((level + 5) / 125) * ((power * attackStat) / defenseStat) + 2);
    let damage = Math.floor(baseDamage * modifier);

    return {
        damage: Math.max(1, Math.floor(damage)), // Minimum 1 damage
        isCritical,
        effectiveness: typeEffectiveness
    };
}

export {
    calculateHP,
    calculateStat,
    calculateReqXP,
    calculateTotalXP,
    getLevelFromXP,
    calculateEVXP,
    calculateEVM,
    calculatePP,
    calculateCatchChance,
    generateQuality,
    generateIVs,
    calculateDamage
};
