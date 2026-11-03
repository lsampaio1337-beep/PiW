import { calculateDamage, calculateReqXP, calculateStat, calculateCatchChance, generateIVs } from '../src/mathEngine.js';

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

describe('generateIVs', () => {
    let originalRandom;

    beforeEach(() => {
        originalRandom = Math.random;
        jest.spyOn(Math, 'random');
    });

    afterEach(() => {
        jest.restoreAllMocks();
    });

    test('should generate stats without boosts correctly', () => {
        // Mock random once for sumIV formula (Math.floor(random * 595) + 6).
        // If Math.random() is 0.5, then 0.5 * 595 = 297.5 -> 297 + 6 = 303
        Math.random.mockImplementationOnce(() => 0.5).mockImplementation(originalRandom);

        const result = generateIVs();

        // Ensure standard object return format is correct
        expect(result).toHaveProperty('hp');
        expect(result).toHaveProperty('atk');
        expect(result).toHaveProperty('def');
        expect(result).toHaveProperty('spa');
        expect(result).toHaveProperty('spd');
        expect(result).toHaveProperty('spe');

        const values = Object.values(result);

        // Sum should be 303
        const sum = values.reduce((a, b) => a + b, 0);
        expect(sum).toBe(303);

        // All values should be between 1 and 100
        values.forEach(v => {
            expect(v).toBeGreaterThanOrEqual(1);
            expect(v).toBeLessThanOrEqual(100);
        });
    });

    test('should apply Mastery IV Booster tiers correctly (Tier 1-5)', () => {
        // Base sumIV if Math.random() = 0.5 is 303
        // sumIV = Math.floor(303 * (1 + masteryBoost) * 1)

        // Tier 1: boost 0.05. 303 * 1.05 = 318.15 -> 318
        Math.random.mockImplementationOnce(() => 0.5).mockImplementation(originalRandom);
        const t1 = generateIVs({ ivTaskTier: 1 });
        expect(Object.values(t1).reduce((a, b) => a + b, 0)).toBe(318);

        // Tier 2: boost 0.10. 303 * 1.10 = 333.3 -> 333
        Math.random.mockImplementationOnce(() => 0.5).mockImplementation(originalRandom);
        const t2 = generateIVs({ ivTaskTier: 2 });
        expect(Object.values(t2).reduce((a, b) => a + b, 0)).toBe(333);

        // Tier 3: boost 0.15. 303 * 1.15 = 348.45 -> 348
        Math.random.mockImplementationOnce(() => 0.5).mockImplementation(originalRandom);
        const t3 = generateIVs({ ivTaskTier: 3 });
        expect(Object.values(t3).reduce((a, b) => a + b, 0)).toBe(348);

        // Tier 4: boost 0.20. 303 * 1.20 = 363.6 -> 363
        Math.random.mockImplementationOnce(() => 0.5).mockImplementation(originalRandom);
        const t4 = generateIVs({ ivTaskTier: 4 });
        expect(Object.values(t4).reduce((a, b) => a + b, 0)).toBe(363);

        // Tier 5: boost 0.25. 303 * 1.25 = 378.75 -> 378
        Math.random.mockImplementationOnce(() => 0.5).mockImplementation(originalRandom);
        const t5 = generateIVs({ ivTaskTier: 5 });
        expect(Object.values(t5).reduce((a, b) => a + b, 0)).toBe(378);
    });

    test('should apply Shiny IV Booster correctly', () => {
        // Math.random() = 0.5 -> base 303
        // Shiny boost requires shinyCaughtTaskTier >= 1 and isShiny = true

        // No shiny tier
        Math.random.mockImplementationOnce(() => 0.5).mockImplementation(originalRandom);
        const noShinyBoost = generateIVs({ shinyCaughtTaskTier: 0 }, true);
        expect(Object.values(noShinyBoost).reduce((a, b) => a + b, 0)).toBe(303);

        // Not shiny
        Math.random.mockImplementationOnce(() => 0.5).mockImplementation(originalRandom);
        const notShiny = generateIVs({ shinyCaughtTaskTier: 1 }, false);
        expect(Object.values(notShiny).reduce((a, b) => a + b, 0)).toBe(303);

        // Applied correctly: 303 * 1.25 = 378.75 -> 378
        Math.random.mockImplementationOnce(() => 0.5).mockImplementation(originalRandom);
        const appliedShiny = generateIVs({ shinyCaughtTaskTier: 1 }, true);
        expect(Object.values(appliedShiny).reduce((a, b) => a + b, 0)).toBe(378);
    });

    test('should cap sumIV at 600', () => {
        // Math.random() = 1.0 -> 595 + 6 = 601
        // (but wait, max random is slightly under 1.0, let's use 0.99)
        // 0.99 * 595 = 589.05 -> 589 + 6 = 595
        // Applied max multipliers: 595 * 1.25 * 1.25 = 929.68 -> well above 600
        Math.random.mockImplementationOnce(() => 0.99).mockImplementation(originalRandom);

        const result = generateIVs({ ivTaskTier: 5, shinyCaughtTaskTier: 1 }, true);

        const sum = Object.values(result).reduce((a, b) => a + b, 0);
        expect(sum).toBe(600); // capped at 600

        // If it caps at 600, all stats MUST be 100 since there are 6 stats.
        const values = Object.values(result);
        values.forEach(v => {
            expect(v).toBe(100);
        });
    });

    test('should return valid stat distribution structure when remaining logic distributes stats', () => {
        // Math.random() = 0.0 -> base 6
        Math.random.mockImplementationOnce(() => 0.0).mockImplementation(originalRandom);

        const result = generateIVs();

        const sum = Object.values(result).reduce((a, b) => a + b, 0);
        expect(sum).toBe(6);

        const values = Object.values(result);
        values.forEach(v => {
            expect(v).toBe(1); // minimal value is 1 for each
        });
    });
});
