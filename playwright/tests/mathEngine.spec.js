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

test('getLevelFromXP calculates correct level from total XP', () => {
    // 0 XP should be level 1
    expect(mathEngine.getLevelFromXP(0)).toBe(1);

    // XP needed for Level 2 is calculateReqXP(1) which is 52
    const xpForLevel2 = mathEngine.calculateReqXP(1); // 52
    expect(mathEngine.getLevelFromXP(xpForLevel2 - 1)).toBe(1); // Almost level 2
    expect(mathEngine.getLevelFromXP(xpForLevel2)).toBe(2); // Exactly level 2

    // XP needed for Level 3 is calculateReqXP(1) + calculateReqXP(2)
    const xpForLevel3 = xpForLevel2 + mathEngine.calculateReqXP(2); // 52 + 90 = 142
    expect(mathEngine.getLevelFromXP(xpForLevel3 - 1)).toBe(2);
    expect(mathEngine.getLevelFromXP(xpForLevel3)).toBe(3);

    // Extremely high XP should cap at level 100
    expect(mathEngine.getLevelFromXP(999999999)).toBe(100);
});
