const test = require('node:test');
const assert = require('node:assert');
const fs = require('fs');
const vm = require('vm');

// Load mathEngine.js without the ES6 export statements to run in commonJS node environment
const mathEngineCode = fs.readFileSync('src/mathEngine.js', 'utf8');
const scriptContent = mathEngineCode.replace(/export \{[\s\S]*?\};/g, '');

// Create a new context and evaluate the script within it
const context = {};
vm.createContext(context);
const script = new vm.Script(scriptContent + '\n; this.calculateStat = calculateStat;');
script.runInContext(context);

const { calculateStat } = context;

test('calculateStat exists', () => {
    assert.strictEqual(typeof calculateStat, 'function');
});

test('calculateStat baseline scenario (level 10, no ivs, quality 1.0)', () => {
    // Formula: floor(((2 * baseStat + ivStat) * level / 100) + 5) * quality
    // baseStat = 50, ivStat = 0, level = 10, quality = 1.0
    // baseFinal = floor(((100 + 0) * 10 / 100) + 5) * 1.0 = floor(10 + 5) = 15
    const result = calculateStat(50, 0, 10, 1.0);
    assert.strictEqual(result, 15);
});

test('calculateStat handles max IVs', () => {
    // baseStat = 50, ivStat = 100, level = 10, quality = 1.0
    // baseFinal = floor(((100 + 100) * 10 / 100) + 5) = floor(20 + 5) = 25
    const result = calculateStat(50, 100, 10, 1.0);
    assert.strictEqual(result, 25);
});

test('calculateStat handles max level (100)', () => {
    // baseStat = 50, ivStat = 50, level = 100, quality = 1.0
    // baseFinal = floor(((100 + 50) * 100 / 100) + 5) = floor(150 + 5) = 155
    const result = calculateStat(50, 50, 100, 1.0);
    assert.strictEqual(result, 155);
});

test('calculateStat handles quality multiplier', () => {
    // baseStat = 50, ivStat = 50, level = 100, quality = 1.5
    // baseFinal = floor((150 + 5) * 1.5) = floor(155 * 1.5) = floor(232.5) = 232
    const result = calculateStat(50, 50, 100, 1.5);
    assert.strictEqual(result, 232);
});

test('calculateStat applies vitamins correctly', () => {
    // baseStat = 50, ivStat = 50, level = 100, quality = 1.5 => baseFinal = 232
    // vitamins = 10
    // total = 232 + floor(232 * (10 / 100)) = 232 + 23 = 255
    const result = calculateStat(50, 50, 100, 1.5, 10);
    assert.strictEqual(result, 255);
});

test('calculateStat handles zero base stat (edge case)', () => {
    // baseStat = 0, ivStat = 0, level = 1, quality = 1.0
    // baseFinal = floor(((0 + 0) * 1 / 100) + 5) * 1.0 = 5
    const result = calculateStat(0, 0, 1, 1.0);
    assert.strictEqual(result, 5);
});

test('calculateStat with high vitamins (e.g. 100)', () => {
    // baseStat = 50, ivStat = 0, level = 10, quality = 1.0 => baseFinal = 15
    // vitamins = 100
    // total = 15 + floor(15 * 1.0) = 30
    const result = calculateStat(50, 0, 10, 1.0, 100);
    assert.strictEqual(result, 30);
});

test('calculateStat floating point precision check', () => {
    // test with numbers that might cause floating point rounding issues
    // baseStat = 77, ivStat = 31, level = 43, quality = 1.13
    // calc: (2*77 + 31) = 154 + 31 = 185
    // 185 * 43 / 100 = 79.55
    // 79.55 + 5 = 84.55
    // 84.55 * 1.13 = 95.5415 -> floor -> 95
    const result = calculateStat(77, 31, 43, 1.13);
    assert.strictEqual(result, 95);
});
