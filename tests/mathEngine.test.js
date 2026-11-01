import { calculateDamage, calculateReqXP, calculateStat } from '../src/mathEngine.js';

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

describe('generateQuality', () => {
    const { generateQuality } = require('../src/mathEngine.js');

    beforeEach(() => {
        jest.spyOn(Math, 'random');
    });

    afterEach(() => {
        jest.restoreAllMocks();
    });

    test('should generate Weak tier correctly', () => {
        // Roll: 1474 is within Weak (<= 1474)
        // OriginalQ random: 0
        Math.random
            .mockReturnValueOnce((1474 - 1) / 12000) // roll = 1474
            .mockReturnValueOnce(0); // originalQ = baseQ (0.80)

        const result = generateQuality({}, false);
        expect(result).toEqual({ name: 'Weak', q: 0.8 });
    });

    test('should generate Regular tier correctly', () => {
        // Roll: 6586 is within Regular (<= 6586)
        // OriginalQ random: 0.5 -> baseQ + 0.5 * (1.19 - 1.00) = 1.095
        Math.random
            .mockReturnValueOnce((6586 - 1) / 12000) // roll = 6586
            .mockReturnValueOnce(0.5);

        const result = generateQuality({}, false);
        expect(result.name).toBe('Regular');
        expect(result.q).toBeCloseTo(1.09, 2);
    });

    test('should generate Uncommon tier correctly', () => {
        // Roll: 9593 is within Uncommon (<= 9593)
        // OriginalQ random: 1.0 -> maxQ (1.39)
        Math.random
            .mockReturnValueOnce((9593 - 1) / 12000) // roll = 9593
            .mockReturnValueOnce(1.0);

        const result = generateQuality({}, false);
        expect(result).toEqual({ name: 'Uncommon', q: 1.39 });
    });

    test('should generate Rare tier correctly', () => {
        // Roll: 11097 is within Rare (<= 11097)
        // OriginalQ random: 0.0 -> baseQ (1.40)
        Math.random
            .mockReturnValueOnce((11097 - 1) / 12000) // roll = 11097
            .mockReturnValueOnce(0.0);

        const result = generateQuality({}, false);
        expect(result).toEqual({ name: 'Rare', q: 1.4 });
    });

    test('should generate Epic tier correctly', () => {
        // Roll: 11999 is within Epic (<= 11999)
        // OriginalQ random: 1.0 -> maxQ (1.80)
        Math.random
            .mockReturnValueOnce((11999 - 1) / 12000) // roll = 11999
            .mockReturnValueOnce(1.0);

        const result = generateQuality({}, false);
        expect(result).toEqual({ name: 'Epic', q: 1.8 });
    });

    test('should generate Shiny tier correctly', () => {
        // Roll: 12001 is Shiny (> 11999)
        // OriginalQ random: 0.5 -> 2.00 + 0.5 * 0.51 = 2.255 -> 2.25
        Math.random
            .mockReturnValueOnce((12001 - 1) / 12001) // roll = 12001 (requires shiny roll > 0)
            .mockReturnValueOnce(0.5);

        const result = generateQuality({ rainbowCandies: 1 }, false);
        expect(result.name).toBe('Shiny');
        expect(result.q).toBe(2.25);
    });

    test('should apply qTaskTier bonuses correctly', () => {
        // qTaskTier = 5 -> bonusValue = 1.00
        // weakMaxRoll becomes 120
        // Base roll in Regular: 121
        // OriginalQ random: 0.5 -> 1.00 + 0.5 * 0.19 = 1.095
        // NewQ = (1 + 1.00) * (1.095 - 1.00) + 1.00 = 2 * 0.095 + 1.00 = 1.19
        Math.random
            .mockReturnValueOnce((121 - 1) / 12000)
            .mockReturnValueOnce(0.5);

        const result = generateQuality({ qTaskTier: 5 }, false);
        expect(result.name).toBe('Regular');
        expect(result.q).toBe(1.19);
    });

    test('should apply shiny boosters and increase total pool', () => {
        // Base shiny rolls: 1
        // rainbowCandies = 2 -> +2
        // shinySeenTaskTier = 2 -> +2
        // isDoubleShiny = true -> (1 + 2 + 2) * 2 = 10
        // finalTaskTier = 1 -> 10 * 12 = 120 total shiny rolls
        // maxTableRoll = 11999 + 120 = 12119
        // Roll: 12119 (guaranteed shiny for testing boundary)
        Math.random
            .mockReturnValueOnce(0.9999999) // almost 1.0 to get maxTableRoll (12119)
            .mockReturnValueOnce(0.0); // shiny q = 2.00

        const result = generateQuality({
            rainbowCandies: 2,
            shinySeenTaskTier: 2,
            finalTaskTier: 1
        }, true);

        expect(result.name).toBe('Shiny');
        expect(result.q).toBe(2.00);
    });
});
