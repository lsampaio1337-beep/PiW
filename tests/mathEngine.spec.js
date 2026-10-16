import { test, expect } from '@playwright/test';
import { getCurrentCount } from '../src/mathEngine.js';

test.describe('getCurrentCount', () => {

    test('calculates balls/pokeballs correctly and excludes Masterball', () => {
        const state = {
            backpack: {
                pokeballs: {
                    Pokeball: 50,
                    Greatball: 20,
                    Ultraball: 10,
                    Masterball: 5
                }
            }
        };
        // 50 + 20 + 10 = 80
        expect(getCurrentCount(state, 'balls')).toBe(80);
        expect(getCurrentCount(state, 'pokeballs')).toBe(80);
    });

    test('calculates potions correctly', () => {
        const state = {
            backpack: {
                potions: {
                    Potion: 10,
                    SuperPotion: 5,
                    HyperPotion: 2
                }
            }
        };
        // 10 + 5 + 2 = 17
        expect(getCurrentCount(state, 'potions')).toBe(17);
    });

    test('calculates box count correctly with all arrays populated', () => {
        const state = {
            party: [{}, {}, {}], // 3
            storage: [{}, {}, {}, {}], // 4
            safe: [{}], // 1
            breeding: [{}, {}], // 2
            training: [{}, {}, {}, {}, {}] // 5
        };
        // 3 + 4 + 1 + 2 + 5 = 15
        expect(getCurrentCount(state, 'box')).toBe(15);
    });

    test('calculates box count correctly with missing arrays', () => {
        const state = {
            party: [{}, {}], // 2
            storage: [{}], // 1
            // missing safe, breeding, training
        };
        // 2 + 1 + 0 + 0 + 0 = 3
        expect(getCurrentCount(state, 'box')).toBe(3);
    });

    test('calculates box count correctly with empty state', () => {
        const state = {};
        expect(getCurrentCount(state, 'box')).toBe(0);
    });

    test('returns 0 for unknown types', () => {
        const state = { backpack: { pokeballs: { Pokeball: 5 } } };
        expect(getCurrentCount(state, 'unknownType')).toBe(0);
    });
});
