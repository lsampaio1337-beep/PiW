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

test('calculateStat normal behavior', () => {
    // Normal case (Bulbasaur base stats, level 5, quality 1.0)
    // stat = floor(((2 * 49 + 31) * 5 / 100) + 5) * 1.0 = floor((129 * 0.05) + 5) = floor(6.45 + 5) = 11
    const stat = mathEngine.calculateStat(49, 31, 5, 1.0);
    expect(stat).toBe(11);
});

test('calculateStat bounds and modifiers', () => {
    // Level 1 boundary
    // stat = floor(((2 * 100 + 31) * 1 / 100) + 5) * 1.0 = floor(2.31 + 5) = 7
    const statLvl1 = mathEngine.calculateStat(100, 31, 1, 1.0);
    expect(statLvl1).toBe(7);

    // Level 100 boundary
    // stat = floor(((2 * 100 + 31) * 100 / 100) + 5) * 1.0 = floor(231 + 5) = 236
    const statLvl100 = mathEngine.calculateStat(100, 31, 100, 1.0);
    expect(statLvl100).toBe(236);

    // Minimum IV
    // stat = floor(((2 * 100 + 0) * 100 / 100) + 5) * 1.0 = floor(200 + 5) = 205
    const statMinIV = mathEngine.calculateStat(100, 0, 100, 1.0);
    expect(statMinIV).toBe(205);

    // Weak quality
    // stat = floor(((2 * 100 + 31) * 100 / 100) + 5) * 0.8 = floor(236 * 0.8) = floor(188.8) = 188
    const statWeak = mathEngine.calculateStat(100, 31, 100, 0.8);
    expect(statWeak).toBe(188);

    // Shiny quality
    // stat = floor(((2 * 100 + 31) * 100 / 100) + 5) * 2.0 = floor(236 * 2.0) = 472
    const statShiny = mathEngine.calculateStat(100, 31, 100, 2.0);
    expect(statShiny).toBe(472);
});

test('calculateReqXP bounds', () => {
    // ReqXP(L) = floor((4 + 496 * ((L - 1) / 98)^1.60) * (5 + 8 * L))
    // Level 1 (boundary) -> floor((4 + 496 * (0)^1.60) * (5 + 8)) = floor(4 * 13) = 52
    const xpLvl1 = mathEngine.calculateReqXP(1);
    expect(xpLvl1).toBe(52);

    // Level 2
    // reqXp = floor((4 + 496 * (1/98)^1.60) * (5 + 8 * 2)) = floor((4 + 496 * 0.0006208) * 21)
    // = floor((4 + 0.3079) * 21) = floor(4.3079 * 21) = floor(90.46) = 90
    const xpLvl2 = mathEngine.calculateReqXP(2);
    expect(xpLvl2).toBe(90);

    // Level 100 (boundary) -> floor((4 + 496 * (1)^1.60) * (5 + 800)) = floor(500 * 805) = 402500
    const xpLvl100 = mathEngine.calculateReqXP(100);
    expect(xpLvl100).toBe(409038);
});
