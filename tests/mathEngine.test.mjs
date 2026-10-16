import { test, expect } from '@playwright/test';
import * as mathEngine from '../src/mathEngine.js';

test.describe('calculateCatchChance logic', () => {
    test('Masterball should always return 100', () => {
        expect(mathEngine.calculateCatchChance(100, 10, 1, 100, 10)).toBe(100);
        expect(mathEngine.calculateCatchChance(100, 10, 1, 100, 11)).toBe(100);
    });

    test('Chance should be clamped between 1 and 100', () => {
        expect(mathEngine.calculateCatchChance(10, 1, 0, 0, 2)).toBe(100);
        expect(mathEngine.calculateCatchChance(700, 100, 2.0, 600, 1)).toBe(1);
    });

    test('cTaskTier should apply correct bonuses', () => {
        const baseChanceNormal = 74.0 - (100 / 14.6) - (10 / 4.0) - 8.0 * ((1 - 0.8) / 1.0) - 5.0 * (100 / 600);

        const tier1 = mathEngine.calculateCatchChance(100, 10, 1, 100, 1, { cTaskTier: 1 });
        const tier5 = mathEngine.calculateCatchChance(100, 10, 1, 100, 1, { cTaskTier: 5 });

        expect(tier1).toBeCloseTo(baseChanceNormal * 1.05, 3);
        expect(tier5).toBeCloseTo(baseChanceNormal * 1.25, 3);
    });

    test('Shiny seen task tier should apply 2x multiplier only if tier 3+', () => {
        const baseChanceNormal = 74.0 - (100 / 14.6) - (10 / 4.0) - 8.0 * ((1 - 0.8) / 1.0) - 5.0 * (100 / 600);
        const baseChanceLow = 74.0 - (300 / 14.6) - (50 / 4.0) - 8.0 * ((1 - 0.8) / 1.0) - 5.0 * (300 / 600);

        const shinyNoTier = mathEngine.calculateCatchChance(100, 10, 1, 100, 1, { shinySeenTaskTier: 2 }, true);
        const shinyTier3 = mathEngine.calculateCatchChance(300, 50, 1, 300, 1, { shinySeenTaskTier: 3 }, true);

        expect(shinyNoTier).toBeCloseTo(baseChanceNormal, 3);
        expect(shinyTier3).toBeCloseTo(baseChanceLow * 2, 3);
    });

    test('Black Yellow Candies should apply multiplicative bonus', () => {
        const baseChanceNormal = 74.0 - (100 / 14.6) - (10 / 4.0) - 8.0 * ((1 - 0.8) / 1.0) - 5.0 * (100 / 600);

        const candy = mathEngine.calculateCatchChance(100, 10, 1, 100, 1, { blackYellowCandies: 2 });

        expect(candy).toBeCloseTo(baseChanceNormal * 1.4, 3);
    });

    test('Combined modifiers should apply correctly', () => {
        const baseChanceLow = 74.0 - (300 / 14.6) - (50 / 4.0) - 8.0 * ((1 - 0.8) / 1.0) - 5.0 * (300 / 600);

        let expectedCombined = baseChanceLow * 1.20 * 2 * 1.20;
        if (expectedCombined > 100) expectedCombined = 100;

        const actual = mathEngine.calculateCatchChance(300, 50, 1, 300, 1, {
            cTaskTier: 4,
            shinySeenTaskTier: 3,
            blackYellowCandies: 1
        }, true);

        expect(actual).toBeCloseTo(expectedCombined, 3);
    });
});
