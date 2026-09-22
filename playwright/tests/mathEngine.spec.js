import { test, expect } from '@playwright/test';
import { calculateDamage } from '../../src/mathEngine.js';

test.describe('calculateDamage', () => {
    let originalRandom;

    test.beforeAll(() => {
        originalRandom = Math.random;
    });

    test.afterAll(() => {
        Math.random = originalRandom;
    });

    test('should calculate base damage correctly (no crit, max random variance)', () => {
        // We want a random multiplier of exactly 1.0 to test max bounds clearly
        // However, mathEngine.js uses `0.85 + Math.random() * 0.15`
        // Floating point arithmetic with `0.999999` gives `0.99999985`, which, when multiplied
        // by 6 and then Math.floor() is applied, results in 5 instead of 6.
        // We'll mock Math.random to return exactly 1.0 (even though real Math.random is strictly < 1)
        // to properly test the maximum bound of the formula.
        Math.random = () => 1.0;

        // Base damage formula: floor(((Level + 5) / 125) * ((Power * AttackStat) / DefenseStat) + 2)
        // With Level 10, Power 40, Attack 50, Defense 50
        // Base damage = floor(((10 + 5) / 125) * ((40 * 50) / 50) + 2)
        // = floor((15 / 125) * (2000 / 50) + 2)
        // = floor((0.12) * (40) + 2)
        // = floor(4.8 + 2) = floor(6.8) = 6
        // Random mult = 1.0, Critical = 1.0, Type = 1.0
        // Total modifier = 1.0 * 1.0 * 1.0 = 1.0
        // Final damage = floor(6 * 1.0) = 6

        const result = calculateDamage(10, 40, 50, 50, 1.0, 1.0);
        expect(result.damage).toBe(6);
        expect(result.isCritical).toBe(false);
        expect(result.effectiveness).toBe(1.0);
    });

    test('should apply critical hit multiplier', () => {
        // Set random to 0.01 to force a critical hit (0.01 < 0.04)
        // Note: the random variance will use the same random value.
        // random variance = 0.85 + (0.01 * 0.15) = 0.8515
        Math.random = () => 0.01;

        // Base damage calculation: Level 10, Power 40, Attack 50, Defense 50 -> Base damage = 6
        // Modifier = Type(1.0) * Crit(1.5) * Random(0.8515) = 1.27725
        // Final damage = floor(6 * 1.27725) = floor(7.6635) = 7
        const result = calculateDamage(10, 40, 50, 50, 1.0, 1.0);

        expect(result.isCritical).toBe(true);
        expect(result.damage).toBe(7);
        expect(result.effectiveness).toBe(1.0);
    });

    test('should apply type effectiveness correctly', () => {
        Math.random = () => 1.0; // No crit, 1.0 random variance

        // Base damage calculation: Level 10, Power 40, Attack 50, Defense 50 -> Base damage = 6

        // Super effective (2.0)
        let result = calculateDamage(10, 40, 50, 50, 2.0, 1.0);
        // BaseDamage (6) * Modifier (2.0 * 1.0 * 1.0) = 12
        expect(result.damage).toBe(12);
        expect(result.effectiveness).toBe(2.0);

        // Not very effective (0.5)
        result = calculateDamage(10, 40, 50, 50, 0.5, 1.0);
        // BaseDamage (6) * Modifier (0.5 * 1.0 * 1.0) = 3
        expect(result.damage).toBe(3);
        expect(result.effectiveness).toBe(0.5);
    });

    test('should apply the lower bound of random variance correctly', () => {
        // Set random to just above critical threshold to avoid crit, but keep variance low
        // Using 0.05.
        // Critical: 0.05 < 0.04 -> False
        // Random variance = 0.85 + (0.05 * 0.15) = 0.8575
        Math.random = () => 0.05;

        // Base damage calculation: Level 10, Power 40, Attack 50, Defense 50 -> Base damage = 6
        // Modifier = Type(1.0) * Crit(1.0) * Random(0.8575) = 0.8575
        // Final damage = floor(6 * 0.8575) = floor(5.145) = 5
        const result = calculateDamage(10, 40, 50, 50, 1.0, 1.0);

        expect(result.isCritical).toBe(false);
        expect(result.damage).toBe(5);
    });

    test('should clamp damage to a minimum of 1', () => {
        Math.random = () => 1.0; // No crit, 1.0 random variance

        // Provide very low attack, very high defense to force base damage < 1
        // Level 10, Power 10, Attack 1, Defense 9999
        // Base damage = floor(((15 / 125) * (10 / 9999)) + 2) = floor(0.00012 + 2) = 2

        // Let's force an even lower outcome to test clamping below 1,
        // e.g. using a not very effective modifier.
        const result = calculateDamage(10, 10, 1, 9999, 0.25, 1.0);

        // Base damage = 2
        // Modifier = 0.25 * 1.0 * 1.0 = 0.25
        // Final damage before clamp = floor(2 * 0.25) = floor(0.5) = 0
        // Clamped damage = 1

        expect(result.damage).toBe(1);
    });

    test('should completely ignore quality in its modifiers', () => {
        Math.random = () => 1.0; // Predictable result

        // Results should be identical regardless of quality parameter
        const resultNormalQuality = calculateDamage(10, 40, 50, 50, 1.0, 1.0);
        const resultHighQuality = calculateDamage(10, 40, 50, 50, 1.0, 99.0);

        expect(resultNormalQuality.damage).toBe(resultHighQuality.damage);
        expect(resultHighQuality.damage).toBe(6); // As calculated in base case
    });
});
