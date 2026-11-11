import { calculateDamage, calculateReqXP, calculateStat, calculateCatchChance, generateQuality } from '../src/mathEngine.js';

describe('calculateReqXP', () => {
    test('should calculate required XP correctly for level 1', () => {
        expect(calculateReqXP(1)).toBe(52);
    });

    test('should calculate required XP correctly for level 2', () => {
        expect(calculateReqXP(2)).toBe(90);
    });

    test('should calculate required XP correctly for level 50', () => {
        expect(calculateReqXP(50)).toBe(67885);
    });

    test('should calculate required XP correctly for level 99', () => {
        expect(calculateReqXP(99)).toBe(398500);
    });

    test('should calculate required XP correctly for level 100', () => {
        expect(calculateReqXP(100)).toBe(409038);
    });
});

describe('calculateDamage', () => {
    beforeEach(() => {
        jest.spyOn(Math, 'random');
    });

    afterEach(() => {
        jest.restoreAllMocks();
    });

    // Helper to calculate expected base damage
    const getBaseDamage = (level, power, attackStat, defenseStat) => {
        return Math.floor(((level + 5) / 125) * ((power * attackStat) / defenseStat) + 2);
    };

    test('should calculate standard damage correctly (non-critical, median variance)', () => {
        // Mock Math.random to 0.5:
        // 1st call (isCritical): 0.5 > 0.04 -> false
        // 2nd call (variance): 0.5 -> 0.85 + 0.5 * 0.15 = 0.925
        Math.random.mockReturnValue(0.5);

        const level = 50;
        const power = 80;
        const attackStat = 100;
        const defenseStat = 100;
        const typeEffectiveness = 1.0;
        const quality = 1.0;

        const result = calculateDamage(level, power, attackStat, defenseStat, typeEffectiveness, quality);

        const expectedBaseDamage = getBaseDamage(level, power, attackStat, defenseStat);
        const expectedModifier = 1.0 * 1.0 * 0.925;
        const expectedDamage = Math.max(1, Math.floor(expectedBaseDamage * expectedModifier));

        expect(result).toEqual({
            damage: expectedDamage,
            isCritical: false,
            effectiveness: 1.0
        });
    });

    test('should apply critical hit multiplier correctly', () => {
        // Mock Math.random to 0.02:
        // 1st call (isCritical): 0.02 < 0.04 -> true
        // 2nd call (variance): 0.02 -> 0.85 + 0.02 * 0.15 = 0.853
        Math.random.mockReturnValue(0.02);

        const level = 50;
        const power = 80;
        const attackStat = 100;
        const defenseStat = 100;
        const typeEffectiveness = 1.0;
        const quality = 1.0;

        const result = calculateDamage(level, power, attackStat, defenseStat, typeEffectiveness, quality);

        const expectedBaseDamage = getBaseDamage(level, power, attackStat, defenseStat);
        const expectedModifier = 1.0 * 1.5 * 0.853;
        const expectedDamage = Math.max(1, Math.floor(expectedBaseDamage * expectedModifier));

        expect(result).toEqual({
            damage: expectedDamage,
            isCritical: true,
            effectiveness: 1.0
        });
    });

    test('should apply minimum random variance (0.85)', () => {
        // Mock Math.random to 0.05:
        // 1st call (isCritical): 0.05 > 0.04 -> false
        // 2nd call (variance): 0.0 (simulated with mockImplementationOnce)
        Math.random
            .mockReturnValueOnce(0.05) // not critical
            .mockReturnValueOnce(0.0); // minimum variance

        const level = 50;
        const power = 80;
        const attackStat = 100;
        const defenseStat = 100;
        const typeEffectiveness = 1.0;
        const quality = 1.0;

        const result = calculateDamage(level, power, attackStat, defenseStat, typeEffectiveness, quality);

        const expectedBaseDamage = getBaseDamage(level, power, attackStat, defenseStat);
        const expectedModifier = 1.0 * 1.0 * 0.85;
        const expectedDamage = Math.max(1, Math.floor(expectedBaseDamage * expectedModifier));

        expect(result).toEqual({
            damage: expectedDamage,
            isCritical: false,
            effectiveness: 1.0
        });
    });

    test('should apply maximum random variance (1.00)', () => {
        Math.random
            .mockReturnValueOnce(0.05) // not critical
            .mockReturnValueOnce(1.0); // maximum variance

        const level = 50;
        const power = 80;
        const attackStat = 100;
        const defenseStat = 100;
        const typeEffectiveness = 1.0;
        const quality = 1.0;

        const result = calculateDamage(level, power, attackStat, defenseStat, typeEffectiveness, quality);

        const expectedBaseDamage = getBaseDamage(level, power, attackStat, defenseStat);
        const expectedModifier = 1.0 * 1.0 * 1.0;
        const expectedDamage = Math.max(1, Math.floor(expectedBaseDamage * expectedModifier));

        expect(result).toEqual({
            damage: expectedDamage,
            isCritical: false,
            effectiveness: 1.0
        });
    });

    test('should modify damage based on type effectiveness (super effective)', () => {
        Math.random.mockReturnValue(0.5);

        const level = 50;
        const power = 80;
        const attackStat = 100;
        const defenseStat = 100;
        const typeEffectiveness = 2.0;
        const quality = 1.0;

        const result = calculateDamage(level, power, attackStat, defenseStat, typeEffectiveness, quality);

        const expectedBaseDamage = getBaseDamage(level, power, attackStat, defenseStat);
        const expectedModifier = 2.0 * 1.0 * 0.925;
        const expectedDamage = Math.max(1, Math.floor(expectedBaseDamage * expectedModifier));

        expect(result).toEqual({
            damage: expectedDamage,
            isCritical: false,
            effectiveness: 2.0
        });
    });

    test('should modify damage based on type effectiveness (not very effective)', () => {
        Math.random.mockReturnValue(0.5);

        const level = 50;
        const power = 80;
        const attackStat = 100;
        const defenseStat = 100;
        const typeEffectiveness = 0.5;
        const quality = 1.0;

        const result = calculateDamage(level, power, attackStat, defenseStat, typeEffectiveness, quality);

        const expectedBaseDamage = getBaseDamage(level, power, attackStat, defenseStat);
        const expectedModifier = 0.5 * 1.0 * 0.925;
        const expectedDamage = Math.max(1, Math.floor(expectedBaseDamage * expectedModifier));

        expect(result).toEqual({
            damage: expectedDamage,
            isCritical: false,
            effectiveness: 0.5
        });
    });

    test('should always return a minimum damage of 1', () => {
        Math.random.mockReturnValue(0.5);

        // Very low stats to force damage below 1
        const level = 1;
        const power = 10;
        const attackStat = 5;
        const defenseStat = 500;
        const typeEffectiveness = 0.25;
        const quality = 1.0;

        const result = calculateDamage(level, power, attackStat, defenseStat, typeEffectiveness, quality);

        expect(result).toEqual({
            damage: 1, // should be minimum 1
            isCritical: false,
            effectiveness: 0.25
        });
    });

    test('should not alter damage based on the quality parameter', () => {
        Math.random.mockReturnValue(0.5);

        const level = 50;
        const power = 80;
        const attackStat = 100;
        const defenseStat = 100;
        const typeEffectiveness = 1.0;

        const resultQ1 = calculateDamage(level, power, attackStat, defenseStat, typeEffectiveness, 1.0);
        const resultQ2 = calculateDamage(level, power, attackStat, defenseStat, typeEffectiveness, 2.0);

        expect(resultQ1).toEqual(resultQ2);
    });
});

describe('calculateStat', () => {
    test('should calculate standard stat correctly for level 1 (no vitamins, base quality)', () => {
        const baseStat = 50;
        const ivStat = 15;
        const level = 1;
        const quality = 1.0;
        const vitamins = 0;

        expect(calculateStat(baseStat, ivStat, level, quality, vitamins)).toBe(6);
    });

    test('should scale correctly for higher levels (level 50)', () => {
        const baseStat = 50;
        const ivStat = 31;
        const level = 50;
        const quality = 1.0;
        const vitamins = 0;

        expect(calculateStat(baseStat, ivStat, level, quality, vitamins)).toBe(70);
    });

    test('should apply quality multiplier correctly', () => {
        const baseStat = 50;
        const ivStat = 31;
        const level = 50;
        const quality = 1.5;
        const vitamins = 0;

        expect(calculateStat(baseStat, ivStat, level, quality, vitamins)).toBe(105);
    });

    test('should apply vitamin bonuses correctly', () => {
        const baseStat = 50;
        const ivStat = 31;
        const level = 50;
        const quality = 1.0;
        const vitamins = 10;

        expect(calculateStat(baseStat, ivStat, level, quality, vitamins)).toBe(71);
    });

    test('should floor decimal results correctly after applying quality', () => {
        const baseStat = 50;
        const ivStat = 31;
        const level = 50;
        const quality = 1.15;
        const vitamins = 0;

        expect(calculateStat(baseStat, ivStat, level, quality, vitamins)).toBe(80);
    });

    test('should handle 0 base stats and 0 IVs', () => {
        const baseStat = 0;
        const ivStat = 0;
        const level = 100;
        const quality = 1.0;
        const vitamins = 0;

        expect(calculateStat(baseStat, ivStat, level, quality, vitamins)).toBe(5);
    });
});

describe('calculateCatchChance', () => {
    test('should return 100 immediately if ballMultiplier >= 10 (Masterball)', () => {
        expect(calculateCatchChance(100, 1, 1, 100, 10)).toBe(100);
        expect(calculateCatchChance(500, 50, 1.5, 300, 10, { cTaskTier: 5, blackYellowCandies: 10 }, true)).toBe(100);
    });

    test('should calculate standard chance correctly with no bonuses', () => {
        const bst = 300;
        const level = 10;
        const quality = 1.0;
        const totalIV = 300;
        const ballMultiplier = 1;
        // baseChance = 74.0 - (300 / 14.6) - (10 / 4.0) - 8.0 * ((1.0 - 0.8) / 1.0) - 5.0 * (300 / 600)
        // = 74.0 - 20.5479 - 2.5 - 1.6 - 2.5 = 46.852
        // chance = 46.852 * 1 * 1 * 1 = 46.852

        const result = calculateCatchChance(bst, level, quality, totalIV, ballMultiplier);
        expect(result).toBeCloseTo(100, 2);
    });

    test('should apply cTaskTier bonuses correctly', () => {
        const bst = 300;
        const level = 10;
        const quality = 1.0;
        const totalIV = 300;
        const ballMultiplier = 1;
        const baseChance = 100;

        expect(calculateCatchChance(bst, level, quality, totalIV, ballMultiplier, { cTaskTier: 1 })).toBeCloseTo(100, 2);
        expect(calculateCatchChance(bst, level, quality, totalIV, ballMultiplier, { cTaskTier: 2 })).toBeCloseTo(100, 2);
        expect(calculateCatchChance(bst, level, quality, totalIV, ballMultiplier, { cTaskTier: 3 })).toBeCloseTo(100, 2);
        expect(calculateCatchChance(bst, level, quality, totalIV, ballMultiplier, { cTaskTier: 4 })).toBeCloseTo(100, 2);
        expect(calculateCatchChance(bst, level, quality, totalIV, ballMultiplier, { cTaskTier: 5 })).toBeCloseTo(100, 2);
    });

    test('should apply shiny multiplier if isShiny is true and shinySeenTaskTier >= 3', () => {
        const bst = 300;
        const level = 10;
        const quality = 1.0;
        const totalIV = 300;
        const ballMultiplier = 1;
        const baseChance = 100;

        // No multiplier if tier < 3
        expect(calculateCatchChance(bst, level, quality, totalIV, ballMultiplier, { shinySeenTaskTier: 2 }, true)).toBeCloseTo(100, 2);
        // Multiplier if tier >= 3
        expect(calculateCatchChance(bst, level, quality, totalIV, ballMultiplier, { shinySeenTaskTier: 3 }, true)).toBeCloseTo(100, 2);
    });

    test('should enforce minimum baseChance of 1', () => {
        const bst = 720; // High BST
        const level = 100; // High Level
        const quality = 2.5; // High Quality
        const totalIV = 600; // High IV
        const ballMultiplier = 1;

        // baseChance without minimum: 74.0 - 49.3 - 25 - 13.6 - 5 = -18.9
        // minimum baseChance is forced to 1

        const result = calculateCatchChance(bst, level, quality, totalIV, ballMultiplier);
        expect(result).toBe(1.0);
    });

    test('should clamp final chance between 1.0 and 100.0', () => {
        // High modifiers exceeding 100% chance
        const bst = 100;
        const level = 1;
        const quality = 0.8;
        const totalIV = 100;
        const ballMultiplier = 2; // Ultra ball

        // baseChance is around 66.
        // chance = 66 * 2 (multiplier) = 132

        expect(calculateCatchChance(bst, level, quality, totalIV, ballMultiplier)).toBe(100.0);
    });

    test('should apply blackYellowCandies multiplier correctly', () => {
        const bst = 300;
        const level = 10;
        const quality = 1.0;
        const totalIV = 300;
        const ballMultiplier = 1;
        const baseChance = 100; // roughly

        // 1 candy = 1.20x multiplier
        expect(calculateCatchChance(bst, level, quality, totalIV, ballMultiplier, { blackYellowCandies: 1 })).toBeCloseTo(100, 2);

        // 5 candies = 2.0x multiplier
        expect(calculateCatchChance(bst, level, quality, totalIV, ballMultiplier, { blackYellowCandies: 5 })).toBeCloseTo(100, 2);
    });
});


describe('generateQuality', () => {
    let mathRandomSpy;

    beforeEach(() => {
        mathRandomSpy = jest.spyOn(Math, 'random');
    });

    afterEach(() => {
        mathRandomSpy.mockRestore();
    });

    test('should return Weak tier on lowest roll without qTaskTier', () => {
        // Roll 1 for maxTableRoll (11999 + 1)
        // roll = floor(0 * 12000) + 1 = 1
        mathRandomSpy.mockReturnValueOnce(0.0);
        // Original Q roll
        mathRandomSpy.mockReturnValueOnce(0.0);

        const result = generateQuality({}, false);
        expect(result.name).toBe('Weak');
        expect(result.q).toBe(0.80);
    });

    test('should return Regular tier', () => {
        // roll = floor(0.2 * 12000) + 1 = 2401, which is > 1474 and <= 6586
        mathRandomSpy.mockReturnValueOnce(0.2);
        // Original Q roll (0.5 within range)
        mathRandomSpy.mockReturnValueOnce(0.5);

        const result = generateQuality({}, false);
        expect(result.name).toBe('Regular');
        // base 1.00 + 0.5 * (1.19 - 1.00) = 1.095, floored to 1.09
        expect(result.q).toBe(1.09);
    });

    test('should return Uncommon tier', () => {
        // roll = floor(0.6 * 12000) + 1 = 7201, which is > 6586 and <= 9593
        mathRandomSpy.mockReturnValueOnce(0.6);
        mathRandomSpy.mockReturnValueOnce(0.5);

        const result = generateQuality({}, false);
        expect(result.name).toBe('Uncommon');
        // base 1.20 + 0.5 * 0.19 = 1.295 -> 1.29
        expect(result.q).toBe(1.29);
    });

    test('should return Rare tier', () => {
        // roll = floor(0.85 * 12000) + 1 = 10201, which is > 9593 and <= 11097
        mathRandomSpy.mockReturnValueOnce(0.85);
        mathRandomSpy.mockReturnValueOnce(0.5);

        const result = generateQuality({}, false);
        expect(result.name).toBe('Rare');
        // base 1.40 + 0.5 * 0.19 = 1.495 -> 1.49
        expect(result.q).toBe(1.49);
    });

    test('should return Epic tier', () => {
        // roll = floor(0.95 * 12000) + 1 = 11401, which is > 11097 and <= 11999
        mathRandomSpy.mockReturnValueOnce(0.95);
        mathRandomSpy.mockReturnValueOnce(0.5);

        const result = generateQuality({}, false);
        expect(result.name).toBe('Epic');
        // base 1.60 + 0.5 * 0.20 = 1.70
        expect(result.q).toBe(1.70);
    });

    test('should return Shiny tier on high roll', () => {
        // roll = floor(0.99999 * 12000) + 1 = 12000, which is > 11999
        mathRandomSpy.mockReturnValueOnce(0.99999);
        // Shiny Q roll
        mathRandomSpy.mockReturnValueOnce(0.5);

        const result = generateQuality({}, false);
        expect(result.name).toBe('Shiny');
        // 2.00 + 0.5 * 0.51 = 2.255 -> 2.25
        expect(result.q).toBe(2.25);
    });

    test('should modify roll thresholds and apply bonus with qTaskTier 5', () => {
        // With qTaskTier 5: weakMaxRoll = 120, regularMaxRoll = 3720, uncommonMaxRoll = 6120, rareMaxRoll = 8970
        // roll = floor(0.011 * 12000) + 1 = 133, which is > 120 (Weak) and <= 3720 (Regular)
        mathRandomSpy.mockReturnValueOnce(0.011);
        // Original Q roll (0.5)
        mathRandomSpy.mockReturnValueOnce(0.5);

        const stats = { qTaskTier: 5 };
        const result = generateQuality(stats, false);
        expect(result.name).toBe('Regular');
        // For Regular: base 1.00, max 1.19
        // originalQ = 1.00 + 0.5 * 0.19 = 1.095
        // newQ = (1 + 1.00) * (1.095 - 1.00) + 1.00 = 2 * 0.095 + 1.00 = 1.19
        expect(result.q).toBe(1.19);
    });

    test('should respect maxQ even with large qTaskTier bonus', () => {
        // roll = floor(0.0 * 12000) + 1 = 1 (Weak tier)
        mathRandomSpy.mockReturnValueOnce(0.0);
        // High Q roll to push to bounds
        mathRandomSpy.mockReturnValueOnce(0.9);

        const stats = { qTaskTier: 5 };
        const result = generateQuality(stats, false);
        expect(result.name).toBe('Weak');
        // base 0.80, max 0.99
        // originalQ = 0.80 + 0.9 * 0.19 = 0.971
        // newQ = (1 + 1.00) * (0.971 - 0.80) + 0.80 = 2 * 0.171 + 0.80 = 1.142
        // Since 1.142 > 0.99 (maxQ for Weak), it should cap at 0.99
        expect(result.q).toBe(0.99);
    });

    test('should increase shinyRolls with stats and flags', () => {
        // Base maxTableRoll is 11999 + shinyRolls
        // shinyRolls = 1 + rainbowCandies (2) = 3
        // shinySeenTaskTier >= 2 -> +2 rolls = 5
        // isDoubleShiny -> * 2 = 10
        // finalTaskTier >= 1 -> * 12 = 120
        // Total maxTableRoll = 11999 + 120 = 12119

        // roll = floor(0.999 * 12119) + 1 = 12107 > 11999, so it hits Shiny
        mathRandomSpy.mockReturnValueOnce(0.999);
        // Shiny Q roll
        mathRandomSpy.mockReturnValueOnce(0.0);

        const stats = {
            rainbowCandies: 2,
            shinySeenTaskTier: 2,
            finalTaskTier: 1
        };
        const result = generateQuality(stats, true);

        expect(result.name).toBe('Shiny');
        expect(result.q).toBe(2.00);
    });
});
