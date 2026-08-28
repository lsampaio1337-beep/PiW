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

function calculateCatchChance(bst, level, ballMultiplier) {
    // Formula: CatchChance = Math.max(1, (72 - (BST / 8.5) - (Level / 4)) * BallMultiplier)
    if (ballMultiplier >= 10) return 100; // Masterball
    let chance = (72 - (bst / 8.5) - (level / 4)) * ballMultiplier;
    // Result clamped between 1% and 100%
    if (chance > 100) chance = 100;
    return Math.max(1, chance);
}

function generateQuality(globalCaps = 0, shiniesSeen = 0) {
    let roll = Math.floor(Math.random() * 12000) + 1;

    // Shiny Boosters
    if (shiniesSeen >= 1 && roll === 11999) roll = 12000;
    if (shiniesSeen >= 3 && roll === 11998) roll = 12000;

    let tierName = "";
    let baseQ = 0;
    let minRoll = 1;

    if (roll <= 1474) { tierName = "Weak"; baseQ = 0.80; }
    else if (roll <= 6586) { tierName = "Regular"; baseQ = 1.00; minRoll = 1475; }
    else if (roll <= 9593) { tierName = "Uncommon"; baseQ = 1.20; minRoll = 6587; }
    else if (roll <= 11097) { tierName = "Rare"; baseQ = 1.40; minRoll = 9594; }
    else if (roll <= 11999) { tierName = "Epic"; baseQ = 1.60; minRoll = 11098; }
    else { return { name: "Shiny", q: 2.00 }; }

    // Quality Booster Roll Thresholds based on Global Caps
    let bonusValue = 0;
    if (globalCaps >= 1000) bonusValue = 1.00;
    else if (globalCaps >= 500) bonusValue = 0.70;
    else if (globalCaps >= 250) bonusValue = 0.45;
    else if (globalCaps >= 100) bonusValue = 0.30;
    else if (globalCaps >= 50) bonusValue = 0.15;

    let originalQ = baseQ + Math.random() * 0.19;
    if (tierName === "Epic") originalQ = baseQ + Math.random() * 0.20;

    // NewValue = (1 + BonusValue) * (OriginalValue - TierMin) + TierMin
    let newQ = (1 + bonusValue) * (originalQ - baseQ) + baseQ;

    // Cap newQ based on the next tier's max if needed, but per GDD it just scales the value.
    // Ensure it doesn't wildly exceed bounds if not intended, though formula naturally restricts it.

    return { name: tierName, q: newQ };
}

function generateIVs(globalCaps = 0, shiniesCaptured = 0, isShiny = false) {
    // IV Booster
    let ivBoost = 0;
    if (globalCaps >= 10000) ivBoost = 0.25;
    else if (globalCaps >= 5000) ivBoost = 0.20;
    else if (globalCaps >= 2500) ivBoost = 0.15;
    else if (globalCaps >= 1000) ivBoost = 0.10;
    else if (globalCaps >= 500) ivBoost = 0.05;

    if (isShiny && shiniesCaptured >= 5) {
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
        let totalIV = ivs.hp + ivs.atk + ivs.def + ivs.spa + ivs.spd + ivs.spe;
        let cap = 500;
        if (ivBoost === 0.05) cap = 300;
        else if (ivBoost === 0.10) cap = 350;
        else if (ivBoost === 0.15) cap = 400;
        else if (ivBoost === 0.20) cap = 450;

        if (totalIV < cap) {
            for (let stat in ivs) {
                ivs[stat] = Math.floor(ivs[stat] * (1 + ivBoost));
            }
        }
    }

    // Enforce hard cap
    for (let stat in ivs) {
        ivs[stat] = Math.min(100, ivs[stat]);
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