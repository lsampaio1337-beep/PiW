import { calculateDamage, calculateReqXP, calculateStat, generateIVs } from '../src/mathEngine.js';

describe('generateIVs', () => {
    let originalRandom;

    beforeEach(() => {
        originalRandom = Math.random;
        jest.spyOn(Math, 'random');
    });

    afterEach(() => {
        jest.restoreAllMocks();
    });

    const getSum = (statsObj) => {
        return statsObj.hp + statsObj.atk + statsObj.def + statsObj.spa + statsObj.spd + statsObj.spe;
    };

    const expectValidStats = (statsObj, expectedSum) => {
        expect(getSum(statsObj)).toBe(expectedSum);
        for (const stat of ['hp', 'atk', 'def', 'spa', 'spd', 'spe']) {
            expect(statsObj[stat]).toBeGreaterThanOrEqual(1);
            expect(statsObj[stat]).toBeLessThanOrEqual(100);
        }
    };

    test('should generate base IVs without boosts correctly', () => {
        let isFirstCall = true;
        Math.random.mockImplementation(() => {
            if (isFirstCall) {
                isFirstCall = false;
                return 0.5; // base sumIV = floor(0.5 * 595) + 6 = 297 + 6 = 303
            }
            return originalRandom();
        });

        const result = generateIVs();
        expectValidStats(result, 303);
    });

    test('should apply Mastery IV Booster correctly (Tier 1)', () => {
        let isFirstCall = true;
        Math.random.mockImplementation(() => {
            if (isFirstCall) {
                isFirstCall = false;
                return 0.5; // base 303
            }
            return originalRandom();
        });

        // Tier 1 gives 0.05 boost. 303 * 1.05 = 318.15 -> 318
        const result = generateIVs({ ivTaskTier: 1 });
        expectValidStats(result, 318);
    });

    test('should apply Mastery IV Booster correctly (Tier 5)', () => {
        let isFirstCall = true;
        Math.random.mockImplementation(() => {
            if (isFirstCall) {
                isFirstCall = false;
                return 0.5; // base 303
            }
            return originalRandom();
        });

        // Tier 5 gives 0.25 boost. 303 * 1.25 = 378.75 -> 378
        const result = generateIVs({ ivTaskTier: 5 });
        expectValidStats(result, 378);
    });

    test('should apply Shiny IV Booster correctly', () => {
        let isFirstCall = true;
        Math.random.mockImplementation(() => {
            if (isFirstCall) {
                isFirstCall = false;
                return 0.5; // base 303
            }
            return originalRandom();
        });

        // Shiny + Tier 1 gives 0.25 boost. 303 * 1.25 = 378.75 -> 378
        const result = generateIVs({ shinyCaughtTaskTier: 1 }, true);
        expectValidStats(result, 378);
    });

    test('should stack Mastery and Shiny IV Boosters multiplicatively', () => {
        let isFirstCall = true;
        Math.random.mockImplementation(() => {
            if (isFirstCall) {
                isFirstCall = false;
                return 0.5; // base 303
            }
            return originalRandom();
        });

        // Tier 5 (0.25) and Shiny (0.25) -> 303 * 1.25 * 1.25 = 473.4375 -> 473
        const result = generateIVs({ ivTaskTier: 5, shinyCaughtTaskTier: 1 }, true);
        expectValidStats(result, 473);
    });

    test('should strictly cap the total IVs at 600', () => {
        let isFirstCall = true;
        Math.random.mockImplementation(() => {
            if (isFirstCall) {
                isFirstCall = false;
                return 0.99; // base sumIV = floor(0.99 * 595) + 6 = 589 + 6 = 595
            }
            return originalRandom();
        });

        // 595 * 1.25 * 1.25 = 929.6875 -> capped at 600
        const result = generateIVs({ ivTaskTier: 5, shinyCaughtTaskTier: 1 }, true);
        expectValidStats(result, 600);
    });

    test('should randomly distribute IVs correctly across multiple generations without exceeding bounds', () => {
        // We will run this several times without mocking the first call,
        // letting it be fully random to ensure distribution logic has no edge cases.
        Math.random.mockImplementation(() => originalRandom());

        for (let i = 0; i < 50; i++) {
            const result = generateIVs({ ivTaskTier: Math.floor(Math.random() * 6) });
            const sum = getSum(result);
            expectValidStats(result, sum);
            expect(sum).toBeLessThanOrEqual(600);
            expect(sum).toBeGreaterThanOrEqual(6);
        }
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
