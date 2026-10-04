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

test('calculateHP base cases', () => {
    // Level 1: floor(((2 * 45 + 31) * 1 / 100 + 1 + 10) * 1.0) = floor((121 * 0.01) + 11) = floor(1.21 + 11) = 12
    expect(mathEngine.calculateHP(45, 31, 1, 1.0)).toBe(12);

    // Level 100: floor(((2 * 45 + 31) * 100 / 100 + 100 + 10) * 1.0) = floor((121 * 1) + 110) = 231
    expect(mathEngine.calculateHP(45, 31, 100, 1.0)).toBe(231);
});

test('calculateHP edge IVs', () => {
    // Level 50, 0 IVs: floor(((2 * 45 + 0) * 50 / 100 + 50 + 10) * 1.0) = floor((90 * 0.5) + 60) = floor(45 + 60) = 105
    expect(mathEngine.calculateHP(45, 0, 50, 1.0)).toBe(105);

    // Level 50, 31 IVs: floor(((2 * 45 + 31) * 50 / 100 + 50 + 10) * 1.0) = floor((121 * 0.5) + 60) = floor(60.5 + 60) = 120
    expect(mathEngine.calculateHP(45, 31, 50, 1.0)).toBe(120);
});

test('calculateHP with different quality multipliers', () => {
    // Level 50, Quality 0.8: floor(((2 * 45 + 31) * 50 / 100 + 50 + 10) * 0.8) = floor(120.5 * 0.8) = floor(96.4) = 96
    expect(mathEngine.calculateHP(45, 31, 50, 0.8)).toBe(96);

    // Level 50, Quality 1.5: floor(((2 * 45 + 31) * 50 / 100 + 50 + 10) * 1.5) = floor(120.5 * 1.5) = floor(180.75) = 180
    expect(mathEngine.calculateHP(45, 31, 50, 1.5)).toBe(180);
});

test('calculateStat base cases', () => {
    // stat = floor(((2 * 49 + 31) * 1 / 100) + 5) * 1.0) = floor((129 * 0.01) + 5) = floor(1.29 + 5) = 6
    expect(mathEngine.calculateStat(49, 31, 1, 1.0)).toBe(6);

    // stat = floor(((2 * 49 + 31) * 100 / 100) + 5) * 1.0) = floor(129 + 5) = 134
    expect(mathEngine.calculateStat(49, 31, 100, 1.0)).toBe(134);
});

test('calculateStat edge IVs', () => {
    // Level 50, 0 IVs: floor(((2 * 49 + 0) * 50 / 100) + 5) * 1.0) = floor(98 * 0.5 + 5) = floor(49 + 5) = 54
    expect(mathEngine.calculateStat(49, 0, 50, 1.0)).toBe(54);

    // Level 50, 31 IVs: floor(((2 * 49 + 31) * 50 / 100) + 5) * 1.0) = floor(129 * 0.5 + 5) = floor(64.5 + 5) = 69
    expect(mathEngine.calculateStat(49, 31, 50, 1.0)).toBe(69);
});

test('calculateStat with different quality multipliers', () => {
    // Level 50, Quality 0.8: floor(((2 * 49 + 31) * 50 / 100) + 5) * 0.8) = floor(69.5 * 0.8) = floor(55.6) = 55
    expect(mathEngine.calculateStat(49, 31, 50, 0.8)).toBe(55);

    // Level 50, Quality 1.5: floor(((2 * 49 + 31) * 50 / 100) + 5) * 1.5) = floor(69.5 * 1.5) = floor(104.25) = 104
    expect(mathEngine.calculateStat(49, 31, 50, 1.5)).toBe(104);
});
