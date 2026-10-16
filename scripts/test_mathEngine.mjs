import fs from 'fs';
import assert from 'assert';

const content = fs.readFileSync('src/mathEngine.js', 'utf-8');
// Strip export to run in Node
const strippedContent = content.replace(/export\s+\{([^}]+)\};/, '');

const ctx = {};
const fn = new Function('ctx', strippedContent + `
    ctx.calculateReqXP = calculateReqXP;
    ctx.calculateTotalXP = calculateTotalXP;
    ctx.getLevelFromXP = getLevelFromXP;
`);
fn(ctx);

const { getLevelFromXP, calculateTotalXP } = ctx;

console.log("Running getLevelFromXP max level tests...");

try {
    const xpForLevel100 = calculateTotalXP(100);

    // Test exact boundary
    assert.strictEqual(getLevelFromXP(xpForLevel100), 100, `Expected level 100 for exact XP requirement`);

    // Test exceeding boundary
    assert.strictEqual(getLevelFromXP(xpForLevel100 + 5000000), 100, `Expected level 100 when exceeding XP requirement`);

    // Test below boundary
    assert.strictEqual(getLevelFromXP(xpForLevel100 - 1), 99, `Expected level 99 for XP slightly below level 100 requirement`);

    console.log("✅ All edge case tests for getLevelFromXP passed!");
    process.exit(0);
} catch (e) {
    console.error("❌ Test failed:", e.message);
    process.exit(1);
}
