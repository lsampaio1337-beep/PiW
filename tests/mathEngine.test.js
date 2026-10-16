import { generateIVs } from '../src/mathEngine.js';

describe('generateIVs', () => {
    let originalRandom;

    beforeEach(() => {
        originalRandom = Math.random;
    });

    afterEach(() => {
        Math.random = originalRandom;
    });

    it('should generate stats between 1 and 100 with default parameters', () => {
        const stats = generateIVs();
        expect(stats.hp).toBeGreaterThanOrEqual(1);
        expect(stats.hp).toBeLessThanOrEqual(100);
        expect(stats.atk).toBeGreaterThanOrEqual(1);
        expect(stats.atk).toBeLessThanOrEqual(100);
        expect(stats.def).toBeGreaterThanOrEqual(1);
        expect(stats.def).toBeLessThanOrEqual(100);
        expect(stats.spa).toBeGreaterThanOrEqual(1);
        expect(stats.spa).toBeLessThanOrEqual(100);
        expect(stats.spd).toBeGreaterThanOrEqual(1);
        expect(stats.spd).toBeLessThanOrEqual(100);
        expect(stats.spe).toBeGreaterThanOrEqual(1);
        expect(stats.spe).toBeLessThanOrEqual(100);
    });

    it('should respect the 600 sum limit even when bonuses push it over', () => {
        // Force high random values to maximize the base sumIV to 600
        Math.random = jest.fn().mockReturnValue(0.999);

        // Provide max mastery (tier 5 -> 25% boost) and shiny boost (tier 1+ and isShiny -> 25% boost)
        const stats = { ivTaskTier: 5, shinyCaughtTaskTier: 1 };
        const result = generateIVs(stats, true);

        // The sum of all generated stats should be exactly 600, not exceeding it
        const sumIV = result.hp + result.atk + result.def + result.spa + result.spd + result.spe;
        expect(sumIV).toBe(600);

        // At 600 sum, every stat must exactly be 100
        expect(result.hp).toBe(100);
        expect(result.atk).toBe(100);
        expect(result.def).toBe(100);
        expect(result.spa).toBe(100);
        expect(result.spd).toBe(100);
        expect(result.spe).toBe(100);
    });

    it('should correctly apply mastery and shiny boosts', () => {
        // Set a deterministic random value that generates a predictable base sum
        // 595 * 0.5 + 6 = 297 base
        // Math.random calls:
        // 1. sumIV roll
        // 2+ stat distribution rolls
        // We'll mock just the first one, then let the rest be random
        let callCount = 0;
        Math.random = jest.fn().mockImplementation(() => {
            callCount++;
            if (callCount === 1) return 0.5; // Controls sumIV
            return originalRandom(); // Real randomness for distribution
        });

        // No boosts: sumIV = floor(297.5) + 6 = 303
        const resultNoBoost = generateIVs({ ivTaskTier: 0, shinyCaughtTaskTier: 0 }, false);
        const sumNoBoost = resultNoBoost.hp + resultNoBoost.atk + resultNoBoost.def +
                           resultNoBoost.spa + resultNoBoost.spd + resultNoBoost.spe;

        callCount = 0;
        // Tier 4 Mastery (+20%), no shiny
        const resultTier4 = generateIVs({ ivTaskTier: 4, shinyCaughtTaskTier: 0 }, false);
        const sumTier4 = resultTier4.hp + resultTier4.atk + resultTier4.def +
                         resultTier4.spa + resultTier4.spd + resultTier4.spe;

        // Floor(303 * 1.2 * 1) = Floor(363.6) = 363
        expect(sumTier4).toBe(363);

        callCount = 0;
        // Tier 5 Mastery (+25%), Shiny (+25%)
        const resultBoth = generateIVs({ ivTaskTier: 5, shinyCaughtTaskTier: 1 }, true);
        const sumBoth = resultBoth.hp + resultBoth.atk + resultBoth.def +
                        resultBoth.spa + resultBoth.spd + resultBoth.spe;

        // Floor(303 * 1.25 * 1.25) = Floor(303 * 1.5625) = Floor(473.4375) = 473
        expect(sumBoth).toBe(473);
    });
});
