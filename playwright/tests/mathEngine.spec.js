const { test, expect } = require('@playwright/test');
const mathEngine = require('../../src/mathEngine.js');

test('calculateHP with vitamins', () => {
    // hp = floor(((2 * 45 + 31) * 50 / 100) + 50 + 10) * 1.0 = floor((121 * 0.5) + 60) = floor(60.5 + 60) = 120
    const hpNoVitamins = mathEngine.calculateHP(45, 31, 50, 1.0);
    expect(hpNoVitamins).toBe(120);

    // hp with 20 vitamins = 120 + floor(120 * (20/100)) = 120 + 24 = 144
    const hpMaxVitamins = mathEngine.calculateHP(45, 31, 50, 1.0, 20);
    expect(hpMaxVitamins).toBe(144);
});

test('calculateStat with vitamins', () => {
    // stat = floor(((2 * 49 + 31) * 50 / 100) + 5) * 1.0 = floor((129 * 0.5) + 5) = floor(64.5 + 5) = 69
    const statNoVitamins = mathEngine.calculateStat(49, 31, 50, 1.0);
    expect(statNoVitamins).toBe(69);

    // stat with 20 vitamins = 69 + floor(69 * (20/100)) = 69 + floor(13.8) = 69 + 13 = 82
    const statMaxVitamins = mathEngine.calculateStat(49, 31, 50, 1.0, 20);
    expect(statMaxVitamins).toBe(82);
});

test.describe('calculateDamage', () => {
    let originalRandom;

    test.beforeAll(() => {
        originalRandom = Math.random;
    });

    test.afterAll(() => {
        Math.random = originalRandom;
    });

    test('should calculate correct base damage without critical hit and min variance', () => {
        let callCount = 0;
        Math.random = () => {
            callCount++;
            if (callCount === 1) return 0.5; // > 0.04 -> not critical
            if (callCount === 2) return 0;   // randomMult = 0.85 + 0 = 0.85
            return 0.5;
        };

        // level=100, power=100, attack=100, def=100, typeEffectiveness=1.0, quality=1.0
        // baseDamage = floor( (105 / 125) * (10000 / 100) + 2 ) = 86
        // modifier = 1.0 * 1.0 * 0.85 = 0.85
        // damage = floor(86 * 0.85) = 73
        const result = mathEngine.calculateDamage(100, 100, 100, 100, 1.0, 1.0);
        expect(result.damage).toBe(73);
        expect(result.isCritical).toBe(false);
        expect(result.effectiveness).toBe(1.0);
    });

    test('should calculate correct base damage with critical hit and max variance', () => {
        let callCount = 0;
        Math.random = () => {
            callCount++;
            if (callCount === 1) return 0.01; // < 0.04 -> critical
            if (callCount === 2) return 1.0;  // randomMult = 0.85 + 0.15 = 1.0
            return 0;
        };

        // baseDamage = 86
        // modifier = 1.0 * 1.5 * 1.0 = 1.5
        // damage = floor(86 * 1.5) = 129
        const result = mathEngine.calculateDamage(100, 100, 100, 100, 1.0, 1.0);
        expect(result.damage).toBe(129);
        expect(result.isCritical).toBe(true);
        expect(result.effectiveness).toBe(1.0);
    });

    test('should apply type effectiveness correctly', () => {
        let callCount = 0;
        Math.random = () => {
            callCount++;
            if (callCount === 1) return 0.5; // not critical
            if (callCount === 2) return 1.0; // max variance
            return 0;
        };

        // baseDamage = 86
        // typeEffectiveness = 2.0
        // modifier = 2.0 * 1.0 * 1.0 = 2.0
        // damage = floor(86 * 2.0) = 172
        const result = mathEngine.calculateDamage(100, 100, 100, 100, 2.0, 1.0);
        expect(result.damage).toBe(172);
        expect(result.isCritical).toBe(false);
        expect(result.effectiveness).toBe(2.0);
    });

    test('should enforce minimum damage of 1', () => {
        let callCount = 0;
        Math.random = () => {
            callCount++;
            if (callCount === 1) return 0.5; // not critical
            if (callCount === 2) return 0.0; // min variance
            return 0;
        };

        // level=1, power=10, attack=10, def=10000
        // baseDamage = floor((6/125) * (100/10000) + 2) = floor(0.048 * 0.01 + 2) = 2
        // typeEffectiveness = 0.0 (force modifier to 0)
        // damage = Math.max(1, floor(2 * 0)) = 1
        const result = mathEngine.calculateDamage(1, 10, 10, 10000, 0.0, 1.0);
        expect(result.damage).toBe(1);
        expect(result.isCritical).toBe(false);
        expect(result.effectiveness).toBe(0.0);
    });
});
