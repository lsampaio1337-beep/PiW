import { test, expect } from '@playwright/test';
import { generateIVs } from '../../src/mathEngine.js';

test.describe('generateIVs Edge Cases', () => {
  let originalRandom;

  test.beforeEach(() => {
    originalRandom = Math.random;
  });

  test.afterEach(() => {
    Math.random = originalRandom;
  });

  test('should return exactly 1 for all stats when random is 0 (minimum bound)', () => {
    Math.random = () => 0; // Forces roll to 6, then adds 0 for each stat distribution
    const ivs = generateIVs();

    expect(ivs).toEqual({
      hp: 1, atk: 1, def: 1, spa: 1, spd: 1, spe: 1
    });

    const sum = Object.values(ivs).reduce((a, b) => a + b, 0);
    expect(sum).toBe(6);
  });

  test('should cap at exactly 100 for all stats when random is ~1 (maximum bound)', () => {
    Math.random = () => 0.9999999; // Forces roll to 600
    const ivs = generateIVs();

    expect(ivs).toEqual({
      hp: 100, atk: 100, def: 100, spa: 100, spd: 100, spe: 100
    });

    const sum = Object.values(ivs).reduce((a, b) => a + b, 0);
    expect(sum).toBe(600);
  });

  test('should cap total IV sum at 600 even with maximum multipliers', () => {
    // Max roll (before cap) but apply multipliers
    Math.random = () => 0.9999999;

    const stats = {
      ivTaskTier: 5, // 0.25 masteryBoost
      shinyCaughtTaskTier: 1 // 0.25 shinyBoost
    };
    const isShiny = true;

    const ivs = generateIVs(stats, isShiny);

    // Original sum = 600.
    // With multipliers: 600 * 1.25 * 1.25 = 937.5, which must cap at 600.
    const sum = Object.values(ivs).reduce((a, b) => a + b, 0);
    expect(sum).toBe(600);

    // Each stat must not exceed 100
    for (const stat of Object.values(ivs)) {
      expect(stat).toBeLessThanOrEqual(100);
    }
  });

  test('should correctly apply multipliers to low sums', () => {
    Math.random = () => 0.1;
    // Roll: Math.floor(0.1 * 595) + 6 = 59 + 6 = 65.

    const stats = {
      ivTaskTier: 3, // 0.15 masteryBoost
      shinyCaughtTaskTier: 1 // 0.25 shinyBoost
    };
    const isShiny = true;

    const ivs = generateIVs(stats, isShiny);
    const sum = Object.values(ivs).reduce((a, b) => a + b, 0);

    // Expected Sum: 65 * 1.15 * 1.25 = 93.4375 => Math.floor(93.4375) = 93
    expect(sum).toBe(93);
  });

  test('fuzz test: stats must always be between 1 and 100, and sum between 6 and 600', () => {
    for (let i = 0; i < 1000; i++) {
        // Vary modifiers
        const tier = Math.floor(originalRandom() * 6); // 0 to 5
        const shinyTier = Math.floor(originalRandom() * 2); // 0 to 1
        const isShiny = originalRandom() > 0.5;

        const ivs = generateIVs({ ivTaskTier: tier, shinyCaughtTaskTier: shinyTier }, isShiny);

        let sum = 0;
        for (const stat of Object.values(ivs)) {
            expect(stat).toBeGreaterThanOrEqual(1);
            expect(stat).toBeLessThanOrEqual(100);
            sum += stat;
        }

        expect(sum).toBeGreaterThanOrEqual(6);
        expect(sum).toBeLessThanOrEqual(600);
    }
  });
});
