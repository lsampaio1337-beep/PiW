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

test('calculateCatchChance masterball', () => {
    const chance = mathEngine.calculateCatchChance(500, 50, 1.0, 300, 10);
    expect(chance).toBe(100);
});

test('calculateCatchChance baseline', () => {
    // bst=146 (146/14.6 = 10)
    // level=40 (40/4.0 = 10)
    // quality=1.8 ((1.8-0.8)/1.0 = 1, *8 = 8)
    // totalIV=600 (600/600 = 1, *5 = 5)
    // baseChance = 74 - 10 - 10 - 8 - 5 = 41
    // chance = 41 * 1.0 = 41
    const chance = mathEngine.calculateCatchChance(146, 40, 1.8, 600, 1.0);
    expect(chance).toBeCloseTo(41, 1);
});

test('calculateCatchChance baseChance bounds', () => {
    // bst=730 (50), level=100 (25) -> 74 - 50 - 25 = -1
    // baseChance bounds to 1.
    // chance = 1 * 1.5 = 1.5
    const chance = mathEngine.calculateCatchChance(730, 100, 1.0, 300, 1.5);
    expect(chance).toBeCloseTo(1.5, 1);
});

test('calculateCatchChance task tier bonuses', () => {
    // baseline baseChance = 41
    // cTaskTier = 3 -> 15% bonus -> 41 * 1.15 = 47.15
    const chance = mathEngine.calculateCatchChance(146, 40, 1.8, 600, 1.0, { cTaskTier: 3 });
    expect(chance).toBeCloseTo(47.15, 2);

    // cTaskTier = 5 -> 25% bonus -> 41 * 1.25 = 51.25
    const chanceMax = mathEngine.calculateCatchChance(146, 40, 1.8, 600, 1.0, { cTaskTier: 5 });
    expect(chanceMax).toBeCloseTo(51.25, 2);
});

test('calculateCatchChance shiny multiplier', () => {
    // baseline baseChance = 41
    // shiny = true, shinySeenTaskTier = 3 -> shinyCatchMulti = 2 -> 82
    const chance = mathEngine.calculateCatchChance(146, 40, 1.8, 600, 1.0, { shinySeenTaskTier: 3 }, true);
    expect(chance).toBeCloseTo(82, 1);

    // shiny = true, shinySeenTaskTier = 2 -> shinyCatchMulti = 1 -> 41
    const chanceNoMulti = mathEngine.calculateCatchChance(146, 40, 1.8, 600, 1.0, { shinySeenTaskTier: 2 }, true);
    expect(chanceNoMulti).toBeCloseTo(41, 1);

    // shiny = false, shinySeenTaskTier = 3 -> shinyCatchMulti = 1 -> 41
    const chanceNotShiny = mathEngine.calculateCatchChance(146, 40, 1.8, 600, 1.0, { shinySeenTaskTier: 3 }, false);
    expect(chanceNotShiny).toBeCloseTo(41, 1);
});

test('calculateCatchChance candy bonus', () => {
    // baseline baseChance = 41
    // blackYellowCandies = 2 -> 1 + 0.2*2 = 1.4 -> 41 * 1.4 = 57.4
    const chance = mathEngine.calculateCatchChance(146, 40, 1.8, 600, 1.0, { blackYellowCandies: 2 });
    expect(chance).toBeCloseTo(57.4, 1);
});

test('calculateCatchChance final bounds', () => {
    // chance > 100 bounded to 100
    // baseChance = 74, multiplier = 2.0 -> chance = 148 -> 100
    const chanceMax = mathEngine.calculateCatchChance(0, 0, 0.8, 0, 2.0);
    expect(chanceMax).toBe(100);

    // chance < 1 bounded to 1
    // baseChance = 1, multiplier = 0.5 -> chance = 0.5 -> 1
    const chanceMin = mathEngine.calculateCatchChance(730, 100, 1.0, 300, 0.5);
    expect(chanceMin).toBe(1);
});
