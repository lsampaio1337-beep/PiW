// src/mathEngine.js

function calculateHP(baseHp, ivHp, level, quality) {
    // HP = [((2 * BaseHP + IV_HP) * Level / 100) + Level + 10] * Q
    return Math.floor((((2 * baseHp + ivHp) * level / 100) + level + 10) * quality);
}

function calculateStat(baseStat, ivStat, level, quality) {
    // Stat = [((2 * BaseStat + IV_Stat) * Level / 100) + 5] * Q
    return Math.floor((((2 * baseStat + ivStat) * level / 100) + 5) * quality);
}

function calculateTotalXP(level) {
    if (level === 1) return 0;
    // TotalXP(n) = floor(12.65 * (n ^ 3.45)) - 12
    return Math.floor(12.65 * Math.pow(level, 3.45)) - 12;
}

function getLevelFromXP(xp) {
    // Inverse of total xp formula to find level, capped at 100
    for (let i = 1; i <= 100; i++) {
        if (calculateTotalXP(i) > xp) {
            return i - 1;
        }
    }
    return 100;
}

function calculateEV(bst, level, quality, totalIV) {
    // EV = floor(12.5 * (BST/195)^2.86 * (1 + 16.82 * ((Level-1)/99)^1.5) * Q * (1 + TotalIV/1500))
    const ev = Math.floor(12.5 * Math.pow(bst / 195, 2.86) * (1 + 16.82 * Math.pow((level - 1) / 99, 1.5)) * quality * (1 + totalIV / 1500));
    return Math.max(1, ev); // Ensuring positive EV
}

function calculateCatchChance(bst, level, ballMultiplier, stats = {}, isShiny = false) {
    // Formula: CatchChance = Math.max(1, (72 - (BST / 8.5) - (Level / 4)) * BallMultiplier)
    if (ballMultiplier >= 10) return 100; // Masterball
    let chance = (72 - (bst / 8.5) - (level / 4)) * ballMultiplier;

    let cTaskTier = stats.cTaskTier || 0;
    let catchBonus = 0;
    if (cTaskTier >= 5) catchBonus = 1.00;
    else if (cTaskTier >= 4) catchBonus = 0.70;
    else if (cTaskTier >= 3) catchBonus = 0.45;
    else if (cTaskTier >= 2) catchBonus = 0.25;
    else if (cTaskTier >= 1) catchBonus = 0.10;

    chance = chance * (1 + catchBonus);

    let shinySeenTaskTier = stats.shinySeenTaskTier || 0;
    if (isShiny && shinySeenTaskTier >= 3) {
        chance = chance * 4;
    }

    // Result clamped between 1% and 100%
    if (chance > 100) chance = 100;
    return Math.max(1, chance);
}

function generateQuality(stats = {}) {
    let roll = Math.floor(Math.random() * 12000) + 1;
    let shinySeenTaskTier = stats.shinySeenTaskTier || 0;

    // Shiny Boosters
    if (shinySeenTaskTier >= 1 && roll === 11999) roll = 12000;
    if (shinySeenTaskTier >= 2 && roll === 11998) roll = 12000;

    let qTaskTier = stats.qTaskTier || 0;
    let bonusValue = 0;
    let weakMaxRoll = 1474;
    let regularMaxRoll = 6586;
    let uncommonMaxRoll = 9593;
    let rareMaxRoll = 11097;

    // Quality Booster Roll Thresholds based on task tiers
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

    let tierName = "";
    let baseQ = 0;
    let maxQ = 0;

    if (roll <= weakMaxRoll) { tierName = "Weak"; baseQ = 0.80; maxQ = 0.99; }
    else if (roll <= regularMaxRoll) { tierName = "Regular"; baseQ = 1.00; maxQ = 1.19; }
    else if (roll <= uncommonMaxRoll) { tierName = "Uncommon"; baseQ = 1.20; maxQ = 1.39; }
    else if (roll <= rareMaxRoll) { tierName = "Rare"; baseQ = 1.40; maxQ = 1.59; }
    else if (roll <= 11999) { tierName = "Epic"; baseQ = 1.60; maxQ = 1.80; }
    else { return { name: "Shiny", q: 2.00 }; }

    let originalQ = baseQ + Math.random() * (maxQ - baseQ);

    // NewValue = (1 + BonusValue) * (OriginalValue - TierMin) + TierMin
    let newQ = (1 + bonusValue) * (originalQ - baseQ) + baseQ;

    if (newQ > maxQ) newQ = maxQ;
    newQ = Math.floor(newQ * 100) / 100;

    return { name: tierName, q: newQ };
}

function generateIVs(stats = {}, isShiny = false) {
    // IV Booster
    let ivTaskTier = stats.ivTaskTier || 0;
    let ivBoost = 0;
    if (ivTaskTier >= 5) ivBoost = 0.25;
    else if (ivTaskTier >= 4) ivBoost = 0.20;
    else if (ivTaskTier >= 3) ivBoost = 0.15;
    else if (ivTaskTier >= 2) ivBoost = 0.10;
    else if (ivTaskTier >= 1) ivBoost = 0.05;

    let shinyCaughtTaskTier = stats.shinyCaughtTaskTier || 0;
    if (isShiny && shinyCaughtTaskTier >= 1) {
        ivBoost += 0.25;
    }

    // Base roll: Integer [1, 100] per stat
    const ivs = {
        hp: Math.floor(Math.random() * 100) + 1,
        atk: Math.floor(Math.random() * 100) + 1,
        def: Math.floor(Math.random() * 100) + 1,
        spa: Math.floor(Math.random() * 100) + 1,
        spd: Math.floor(Math.random() * 100) + 1,
        spe: Math.floor(Math.random() * 100) + 1
    };

    // Apply role bonuses
    ivs.hp = Math.floor(ivs.hp * 1.5);
    ivs.def = Math.floor(ivs.def * 1.5);
    ivs.spd = Math.floor(ivs.spd * 1.5);
    ivs.atk = Math.floor(ivs.atk * 2.0);
    ivs.spa = Math.floor(ivs.spa * 2.0);
    ivs.spe = Math.floor(ivs.spe * 1.25);

    // Apply mastery boost
    if (ivBoost > 0) {
        for (let stat in ivs) {
            ivs[stat] = Math.floor(ivs[stat] * (1 + ivBoost));
        }
    }

    // Enforce hard cap of 100 per stat and a total IV limit of 600
    let totalIV = 0;
    for (let stat in ivs) {
        ivs[stat] = Math.min(100, ivs[stat]);
        totalIV += ivs[stat];
    }

    // If total exceeds 600, scale them down proportionally
    if (totalIV > 600) {
        let reductionRatio = 600 / totalIV;
        let newTotal = 0;
        let statKeys = Object.keys(ivs);

        for (let i = 0; i < statKeys.length; i++) {
            let stat = statKeys[i];
            if (i === statKeys.length - 1) {
                // To avoid rounding issues, the last stat gets the remainder up to 600
                ivs[stat] = 600 - newTotal;
            } else {
                ivs[stat] = Math.floor(ivs[stat] * reductionRatio);
                newTotal += ivs[stat];
            }
        }
    }

    return ivs;
}

function calculateDamage(level, power, attackStat, defenseStat, typeEffectiveness, quality) {
    // Damage = floor([((Level + 5) / 125) * (Power * A / D)] + 2) * Modifier
    // Modifier = TypeEffectiveness * Critical * Random * Q

    const isCritical = Math.random() < 0.04;
    const criticalMult = isCritical ? 1.5 : 1.0;
    const randomMult = 0.85 + Math.random() * 0.15; // Uniform float in [0.85, 1.00]

    const modifier = typeEffectiveness * criticalMult * randomMult * quality;

    let damage = Math.floor((((level + 5) / 125) * (power * attackStat / defenseStat)) + 2) * modifier;

    return {
        damage: Math.max(1, Math.floor(damage)), // Minimum 1 damage
        isCritical,
        effectiveness: typeEffectiveness
    };
}

export {
    calculateHP,
    calculateStat,
    calculateTotalXP,
    getLevelFromXP,
    calculateEV,
    calculateCatchChance,
    generateQuality,
    generateIVs,
    calculateDamage
};