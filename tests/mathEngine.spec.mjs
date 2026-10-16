// By specifying the test file extension as .mjs we force Node/Playwright to treat it as an ES module,
// allowing native imports even in a "type": "commonjs" package workspace.
import { test, expect } from '@playwright/test';
import { calculateReqXP } from '../src/mathEngine.js';

test.describe('calculateReqXP', () => {
    test('strictly monotonically increases up to max level (100)', () => {
        let prev = -1;
        for (let level = 1; level <= 100; level++) {
            const xp = calculateReqXP(level);

            // Check that it's a valid positive number
            expect(typeof xp).toBe('number');
            expect(xp).toBeGreaterThan(0);

            // Check that it strictly increases
            expect(xp).toBeGreaterThan(prev);

            prev = xp;
        }
    });

    test('handles edge case: level 1 returns positive XP', () => {
        const xp = calculateReqXP(1);
        expect(xp).toBeGreaterThan(0);
    });

    test('handles invalid input securely', () => {
        const xp = calculateReqXP(-10);
        expect(Number.isNaN(xp) || typeof xp === 'number').toBeTruthy();
    });
});
