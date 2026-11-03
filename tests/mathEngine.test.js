import { calculateDamage, calculateReqXP, calculateStat, calculateCatchChance, generateQuality } from '../src/mathEngine.js';

describe('generateQuality', () => {
    afterEach(() => {
        jest.restoreAllMocks();
    });

    test('should generate Weak quality', () => {
        // roll = Math.floor(Math.random() * maxTableRoll) + 1;
        // maxTableRoll is usually 12000 (11999 + 1)
        // weakMaxRoll = 1474
        // To get roll <= 1474, random needs to be close to 0
        jest.spyOn(Math, 'random').mockReturnValue(0.01);
        // 0.01 * 12000 = 120. floor(120) + 1 = 121 <= 1474 -> Weak
        // originalQ = baseQ + Math.random() * (maxQ - baseQ)
        // For Weak, baseQ = 0.80, maxQ = 0.99
        // Math.random() is mocked to 0.01, so originalQ = 0.80 + 0.01 * 0.19 = 0.8019
        const result = generateQuality();
        expect(result.name).toBe('Weak');
        expect(result.q).toBeCloseTo(0.80, 2);
    });

    test('should generate Regular quality', () => {
        // regularMaxRoll = 6586
        // Need a roll between 1474 and 6586
        jest.spyOn(Math, 'random').mockReturnValue(0.2); // 0.2 * 12000 = 2400
        const result = generateQuality();
        expect(result.name).toBe('Regular');
        // baseQ = 1.00, maxQ = 1.19
        expect(result.q).toBeGreaterThanOrEqual(1.00);
        expect(result.q).toBeLessThanOrEqual(1.19);
    });

    test('should generate Uncommon quality', () => {
        // uncommonMaxRoll = 9593
        jest.spyOn(Math, 'random').mockReturnValue(0.6); // 0.6 * 12000 = 7200
        const result = generateQuality();
        expect(result.name).toBe('Uncommon');
        expect(result.q).toBeGreaterThanOrEqual(1.20);
        expect(result.q).toBeLessThanOrEqual(1.39);
    });

    test('should generate Rare quality', () => {
        // rareMaxRoll = 11097
        jest.spyOn(Math, 'random').mockReturnValue(0.85); // 0.85 * 12000 = 10200
        const result = generateQuality();
        expect(result.name).toBe('Rare');
        expect(result.q).toBeGreaterThanOrEqual(1.40);
        expect(result.q).toBeLessThanOrEqual(1.59);
    });

    test('should generate Epic quality', () => {
        // maxTableRoll = 11999
        jest.spyOn(Math, 'random').mockReturnValue(0.95); // 0.95 * 12000 = 11400
        const result = generateQuality();
        expect(result.name).toBe('Epic');
        expect(result.q).toBeGreaterThanOrEqual(1.60);
        expect(result.q).toBeLessThanOrEqual(1.80);
    });

    test('should generate Shiny quality', () => {
        // maxTableRoll is usually 12000, shiny roll happens when roll > 11999
        // To get shiny, Math.random() needs to be almost 1 to reach 12000
        jest.spyOn(Math, 'random').mockReturnValue(0.99999);
        const result = generateQuality();
        expect(result.name).toBe('Shiny');
        // Shinies range from 2.00 to 2.50
        expect(result.q).toBeGreaterThanOrEqual(2.00);
        expect(result.q).toBeLessThanOrEqual(2.51);
    });

    test('should apply shiny boosters correctly (rainbowCandies)', () => {
        // With 1000 rainbow candies, maxTableRoll = 11999 + 1001 = 13000
        // A random of 0.99 gives 0.99 * 13000 = 12870, which is > 11999, so Shiny!
        jest.spyOn(Math, 'random').mockReturnValue(0.99);

        // Without candies, 0.99 * 12000 = 11880 (Epic)
        const normalResult = generateQuality();
        expect(normalResult.name).toBe('Epic');

        // With candies
        const boostedResult = generateQuality({ rainbowCandies: 1000 });
        expect(boostedResult.name).toBe('Shiny');
    });

    test('should apply shiny boosters correctly (shinySeenTaskTier)', () => {
        jest.spyOn(Math, 'random').mockReturnValue(0.9999); // Close to threshold

        // Without booster: 0.9999 * 12000 = 11998 (Epic)
        const normalResult = generateQuality();
        expect(normalResult.name).toBe('Epic');

        // With booster (Tier 2 gives +2 rolls, maxTableRoll = 12002)
        // 0.9999 * 12002 = 12000 (Shiny)
        const boostedResult = generateQuality({ shinySeenTaskTier: 2 });
        expect(boostedResult.name).toBe('Shiny');
    });

    test('should apply double shiny bonus correctly', () => {
        jest.spyOn(Math, 'random').mockReturnValue(0.9999);

        // Double shiny means shinyRolls = (1)*2 = 2. maxTableRoll = 12001
        // 0.9999 * 12001 = 12000 (Shiny)
        const boostedResult = generateQuality({}, true);
        expect(boostedResult.name).toBe('Shiny');
    });

    test('should apply finalTaskTier bonus correctly', () => {
        jest.spyOn(Math, 'random').mockReturnValue(0.9995);

        // Final task tier gives *12 shiny rolls. maxTableRoll = 11999 + 12 = 12011
        // Without bonus: 0.9995 * 12000 = 11994 (Epic)
        const normalResult = generateQuality();
        expect(normalResult.name).toBe('Epic');

        // With finalTaskTier = 1
        // 0.9995 * 12011 = 12004.99 -> 12005 (Shiny)
        const boostedResult = generateQuality({ finalTaskTier: 1 });
        expect(boostedResult.name).toBe('Shiny');
    });

    test('should apply qTaskTier bonus value to quality', () => {
        // Roll for Regular quality to see effect of qTaskTier bonus
        // Need a roll between 1474 and 6586
        jest.spyOn(Math, 'random').mockReturnValue(0.2); // 0.2 * 12000 = 2400 (Regular)

        const normalResult = generateQuality();
        // Regular baseQ is 1.00. normalResult.q = 1.00 + 0.2 * 0.19 = 1.038
        expect(normalResult.name).toBe('Regular');

        // With qTaskTier = 5, bonus is 1.0. NewValue = (1 + BonusValue) * (OriginalValue - TierMin) + TierMin
        // max table roll = 12000. 0.2 * 12000 = 2400.
        // For qTaskTier >= 5, weakMaxRoll = 120, regularMaxRoll = 3720. 2400 is Regular.
        // Expected Q: (1 + 1.0) * (OriginalValue - 1.00) + 1.00
        const boostedResult = generateQuality({ qTaskTier: 5 });
        expect(boostedResult.name).toBe('Regular');
        expect(boostedResult.q).toBeGreaterThan(normalResult.q);
    });

    test('should cap newQ at maxQ', () => {
        // Roll for Regular quality near the upper bound
        jest.spyOn(Math, 'random').mockReturnValue(0.5); // 0.5 * 12000 = 6000 (Regular max is 6586)

        // With qTaskTier = 5, the calculated Q might exceed maxQ (1.19 for Regular)
        // If it does, it should be capped at 1.19.
        const boostedResult = generateQuality({ qTaskTier: 5 });
        expect(boostedResult.name).toBe('Uncommon'); // Wait, 6000 is Uncommon for qTaskTier=5 (regularMaxRoll=3720, uncommonMaxRoll=6120)
        // So we need to ensure the capping logic works.
        // For Uncommon, maxQ is 1.39.
        expect(boostedResult.q).toBeLessThanOrEqual(1.39);

        // To specifically test capping, force Math.random to 0.99 for the second call (which determines value)
        jest.spyOn(Math, 'random')
            .mockReturnValueOnce(0.2) // Roll for tier (2400 -> Regular for qTaskTier 5)
            .mockReturnValueOnce(0.99); // Roll for originalQ (near maxQ)

        const maxBoostedResult = generateQuality({ qTaskTier: 5 });
        expect(maxBoostedResult.name).toBe('Regular');
        expect(maxBoostedResult.q).toBeCloseTo(1.19, 2);
    });
});

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
        expect(result).toBeCloseTo(46.852, 2);
    });

    test('should apply cTaskTier bonuses correctly', () => {
        const bst = 300;
        const level = 10;
        const quality = 1.0;
        const totalIV = 300;
        const ballMultiplier = 1;
        const baseChance = 46.852;

        expect(calculateCatchChance(bst, level, quality, totalIV, ballMultiplier, { cTaskTier: 1 })).toBeCloseTo(baseChance * 1.05, 2);
        expect(calculateCatchChance(bst, level, quality, totalIV, ballMultiplier, { cTaskTier: 2 })).toBeCloseTo(baseChance * 1.10, 2);
        expect(calculateCatchChance(bst, level, quality, totalIV, ballMultiplier, { cTaskTier: 3 })).toBeCloseTo(baseChance * 1.15, 2);
        expect(calculateCatchChance(bst, level, quality, totalIV, ballMultiplier, { cTaskTier: 4 })).toBeCloseTo(baseChance * 1.20, 2);
        expect(calculateCatchChance(bst, level, quality, totalIV, ballMultiplier, { cTaskTier: 5 })).toBeCloseTo(baseChance * 1.25, 2);
    });

    test('should apply shiny multiplier if isShiny is true and shinySeenTaskTier >= 3', () => {
        const bst = 300;
        const level = 10;
        const quality = 1.0;
        const totalIV = 300;
        const ballMultiplier = 1;
        const baseChance = 46.852;

        // No multiplier if tier < 3
        expect(calculateCatchChance(bst, level, quality, totalIV, ballMultiplier, { shinySeenTaskTier: 2 }, true)).toBeCloseTo(baseChance, 2);
        // Multiplier if tier >= 3
        expect(calculateCatchChance(bst, level, quality, totalIV, ballMultiplier, { shinySeenTaskTier: 3 }, true)).toBeCloseTo(baseChance * 2, 2);
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
        const baseChance = 46.852; // roughly

        // 1 candy = 1.20x multiplier
        expect(calculateCatchChance(bst, level, quality, totalIV, ballMultiplier, { blackYellowCandies: 1 })).toBeCloseTo(baseChance * 1.20, 2);

        // 5 candies = 2.0x multiplier
        expect(calculateCatchChance(bst, level, quality, totalIV, ballMultiplier, { blackYellowCandies: 5 })).toBeCloseTo(baseChance * 2.0, 2);
    });
});
