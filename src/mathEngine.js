// src/mathEngine.js

function calculateHP(baseHp, ivHp, level, quality, vitamins = 0) {
    // HP = floor(((2 * BaseHP + IV_HP) * Level / 100 + Level + 10) * Q)
    const baseFinal = Math.floor((((2 * baseHp + ivHp) * level / 100) + level + 10) * quality);
    return baseFinal + Math.floor(baseFinal * (vitamins / 100));
}

function calculateStat(baseStat, ivStat, level, quality, vitamins = 0) {
    return Math.floor((Math.floor(((2 * baseStat + ivStat + Math.floor(vitamins / 4)) * level) / 100) + 5) * quality);
}

const MAX_PRECOMPUTED_LEVEL = 1000;
const REQ_XP_TABLE = new Float64Array(MAX_PRECOMPUTED_LEVEL + 1);
const TOTAL_XP_TABLE = new Float64Array(MAX_PRECOMPUTED_LEVEL + 1);

function _computeReqXP(level) {
    // Unified curve for any L: floor((4 + (6 * L^2) / (L + 30)) * (5 + 8 * L))
    const factor = 4 + (6 * level * level) / (level + 30);
    return Math.floor(factor * (5 + 8 * level));
}

{
    let runningTotal = 0;
    for (let lvl = 1; lvl <= MAX_PRECOMPUTED_LEVEL; lvl++) {
        const req = _computeReqXP(lvl);
        REQ_XP_TABLE[lvl] = req;
        TOTAL_XP_TABLE[lvl] = runningTotal;
        runningTotal += req;
    }
}

function calculateReqXP(level) {
    if (Number.isInteger(level) && level >= 1 && level <= MAX_PRECOMPUTED_LEVEL) {
        return REQ_XP_TABLE[level];
    }
    return _computeReqXP(level);
}

function calculateTotalXP(level) {
    if (Number.isInteger(level) && level >= 1 && level <= MAX_PRECOMPUTED_LEVEL) {
        return TOTAL_XP_TABLE[level];
    }
    let total = 0;
    for (let i = 1; i < level; i++) {
        total += calculateReqXP(i);
    }
    return total;
}

function getLevelFromXP(xp, maxLevel = 100) {
    let level = 1;
    let totalXpNeeded = 0;
    while (level < maxLevel) {
        totalXpNeeded += calculateReqXP(level);
        if (xp < totalXpNeeded) {
            break;
        }
        level++;
    }
    return level;
}

function calculateEVXP(bst, level, quality) {
    // Q < 1.4: no impact (1.0x)
    // 1.4 <= Q < 2.0 (Rare / Epic): bonus equal to Q (1.4x - 1.8x+)
    // Q >= 2.0 (Shiny): super bonus (5.0x)
    let qMod = 1.0;
    if (quality >= 2.0) {
        qMod = 5.0;
    } else if (quality >= 1.4) {
        qMod = quality;
    }
    const evxp = Math.floor((5 + 8 * level) * (bst / 300) * qMod);
    return Math.max(1, evxp);
}

function calculateEVM(bst, level, quality, totalIV) {
    // EVM = max(1, floor(0.75 * (Level)^1.15 * (BST / 300)^0.5 * (Q / 1.20)^0.5 * (0.70 + 0.30 * (IV_Total / 600))))
    const evm = Math.floor(0.75 * Math.pow(level, 1.15) * Math.pow(bst / 300, 0.5) * Math.pow(quality / 1.20, 0.5) * (0.70 + 0.30 * (totalIV / 600)));
    return Math.max(1, evm);
}

function calculatePP(bst, level, quality, totalIV) {
    // PP = max(1, floor(50 * (Q / 1.40)^6.0 * (IV_Total / 450)^4.0 * (BST / 300)^5.0 * (Level / 50)^3.0))
    const pp = Math.floor(50 * Math.pow(quality / 1.40, 6.0) * Math.pow(totalIV / 450, 4.0) * Math.pow(bst / 300, 5.0) * Math.pow(level / 50, 3.0));
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

    let shinySeenTaskTier = stats.shinySeenTaskTier || 0;
    let shinyCatchMulti = (isShiny && shinySeenTaskTier >= 3) ? 2 : 1;

    // Base Capture Rate Formula
        const diff = Math.max(0, level - 18) / 26.0 + Math.max(0, bst - 300) / 100.0;
    const qMod = Math.min(2.0, Math.max(0.01, 2.75 - 1.25 * quality));
    const ivMod = Math.min(2.0, Math.max(0.01, 1.30 - 0.001 * totalIV));
    let baseChance = (70.0 / Math.pow(2, diff)) * qMod * ivMod;
    baseChance = Math.min(100.0, Math.max(0.01, baseChance));

    let chance = baseChance * ballMultiplier * (1 + catchBonus / 100) * shinyCatchMulti;    // Black Yellow Candy Catch Bonus
    // Modifies the overall chance directly: chance * (1 + 0.10 * blackYellowCandies)
    const blackYellowMulti = 1 + (0.10 * (stats.blackYellowCandies || 0));
    chance = chance * blackYellowMulti;

    return Math.min(100.0, Math.max(1.0, chance));
}

function generateQuality(stats = {}, isDoubleShiny = false) {
    let shinySeenTaskTier = stats.shinySeenTaskTier || 0;

    // Determine total shiny rolls
    // Base 1 roll + Rainbow Candy + Shiny Boosters
    let shinyRolls = 1 + (stats.rainbowCandies || 0);

    // Shiny Boosters
    // Regular gives +1 roll, Good gives +2 rolls
    if (shinySeenTaskTier >= 2) shinyRolls += 2;
    else if (shinySeenTaskTier == 1) shinyRolls += 1;

    // Casino double shiny bonus
    if (isDoubleShiny) {
        shinyRolls *= 2;
    }

    // Final Assignment Reward
    if ((stats.finalTaskTier || 0) >= 1) {
        shinyRolls *= 12;
    }

    // Instead of cutting into Rare/Epic rolls, we just increase the total pool size.
    // Base pool is 11999 (Weak through Epic).
    let maxTableRoll = 11999 + shinyRolls;

    let roll = Math.floor(Math.random() * maxTableRoll) + 1;

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

    let tierName = "";
    let baseQ = 0;
    let maxQ = 0;

    if (roll <= weakMaxRoll) { tierName = "Weak"; baseQ = 0.80; maxQ = 0.99; }
    else if (roll <= regularMaxRoll) { tierName = "Regular"; baseQ = 1.00; maxQ = 1.19; }
    else if (roll <= uncommonMaxRoll) { tierName = "Uncommon"; baseQ = 1.20; maxQ = 1.39; }
    else if (roll <= rareMaxRoll) { tierName = "Rare"; baseQ = 1.40; maxQ = 1.59; }
    else if (roll <= 11999) { tierName = "Epic"; baseQ = 1.60; maxQ = 1.80; }
    else {
        // Shinies range from 2.00 to 2.50
        return { name: "Shiny", q: Math.floor((2.00 + Math.random() * 0.51) * 100) / 100 };
    }

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

function calculateDamage(level, power, attackStat, defenseStat, typeEffectiveness, quality, options = {}) {
    // BaseDamage = floor(((Level + 5) / 125) * ((Power * AttackStat) / DefenseStat) + 2)
    // Modifier involves type, critical, random. But do NOT include direct Quality multiplier as per AGENTS.md / constraints!
    // Memory: "Base damage calculation modifiers involve type effectiveness, critical hits, and random variance, but they do NOT include a direct Quality multiplier since Quality is already factored into the Attack and Defense stats."
    const critChance = typeof options.critChance === 'number' ? options.critChance : 0.04;
    const isCritical = Math.random() < critChance;
    const criticalMult = isCritical ? 1.5 : 1.0;
    const randomMult = options.maxRoll ? 1.0 : (0.85 + Math.random() * 0.15); // Uniform float in [0.85, 1.00]
    const damageMult = typeof options.damageMult === 'number' ? options.damageMult : 1.0;

    const modifier = typeEffectiveness * criticalMult * randomMult * damageMult;
    const safeDefense = defenseStat > 0 ? defenseStat : 1;

    let baseDamage = Math.floor(((level + 5) / 125) * ((power * attackStat) / safeDefense) + 2);
    let damage = Math.floor(baseDamage * modifier);

    return {
        damage: Math.max(1, Math.floor(damage)), // Minimum 1 damage
        isCritical,
        effectiveness: typeEffectiveness
    };
}

function getCapacity(state, type) {
    let base = 0;
    let expansions = [];
    let currentTier = 0;

    if (type === 'balls' || type === 'pokeballs') {
        base = 100;
        expansions = state.config?.balance?.expansions?.ballPocket || [];
        currentTier = state.stats?.upgrades?.ballsTier || 0;
    } else if (type === 'potions') {
        base = 20;
        expansions = state.config?.balance?.expansions?.potionSatchel || [];
        currentTier = state.stats?.upgrades?.potionsTier || 0;
    } else if (type === 'box') {
        base = 20;
        expansions = state.config?.balance?.expansions?.pokemonBox || [];
        currentTier = state.stats?.upgrades?.boxTier || 0;
    }

    let capacity = base;
    for (let i = 0; i < currentTier; i++) {
        if (expansions[i]) {
            capacity += expansions[i].increment;
        }
    }
    return capacity;
}

function getCurrentCount(state, type) {
    if (!state) return 0;
    let count = 0;
    if (type === 'balls' || type === 'pokeballs') {
        if (!state.backpack || !state.backpack.pokeballs) return 0;
        const pokeballs = state.backpack.pokeballs;
        for (const key in pokeballs) {
            if (Object.prototype.hasOwnProperty.call(pokeballs, key) && key !== 'Masterball') {
                count += pokeballs[key];
            }
        }
    } else if (type === 'potions') {
        if (!state.backpack || !state.backpack.potions) return 0;
        const potions = state.backpack.potions;
        for (const key in potions) {
            if (Object.prototype.hasOwnProperty.call(potions, key) && key !== 'Max Potion') {
                count += potions[key] || 0;
            }
        }
    } else if (type === 'box') {
        const partyLength = state.party ? state.party.length : 0;
        const storageLength = state.storage ? state.storage.length : 0;
        const safeLength = state.safe ? state.safe.length : 0;
        const breedLength = state.breeding ? state.breeding.length : 0;
        const trainLength = state.training ? state.training.length : 0;
        count = partyLength + storageLength + safeLength + breedLength + trainLength;
    }
    return count;
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
    calculateDamage,
    getCapacity,
    getCurrentCount
};
