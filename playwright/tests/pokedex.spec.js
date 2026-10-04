import { test, expect } from '@playwright/test';
const fs = require('fs');
const path = require('path');

let hasSeenSpecies;
let hasCaughtSpecies;

test.beforeAll(() => {
    // We dynamically extract the pure functions for testing to avoid Playwright/Node ESM issues.
    // This is safe since the functions are pure logic based purely on their inputs.
    const code = fs.readFileSync(path.join(__dirname, '../../src/ui/pokedex.js'), 'utf8');
    const hasSeenCodeStr = code.match(/export function hasSeenSpecies\(id, state\)\s*{[\s\S]*?\n}/)[0].replace('export function ', 'function ');
    const hasCaughtCodeStr = code.match(/export function hasCaughtSpecies\(id, state\)\s*{[\s\S]*?\n}/)[0].replace('export function ', 'function ');

    hasSeenSpecies = new Function(`
        ${hasSeenCodeStr}
        return hasSeenSpecies;
    `)();

    hasCaughtSpecies = new Function(`
        ${hasCaughtCodeStr}
        return hasCaughtSpecies;
    `)();
});

test.describe('Pokedex UI logic - hasSeenSpecies', () => {
    let mockState;

    test.beforeEach(() => {
        mockState = {
            config: {
                pokemonData: [
                    { id: 1, name: "Bulbasaur" },
                    { id: 4, name: "Charmander" }
                ]
            },
            stats: {
                seenSpecies: {}
            }
        };
    });

    test('returns false when ID does not exist in pokemonData', () => {
        expect(hasSeenSpecies(999, mockState)).toBe(false);
    });

    test('returns falsy when state.stats.seenSpecies is undefined', () => {
        delete mockState.stats.seenSpecies;
        expect(hasSeenSpecies(1, mockState)).toBeFalsy();
    });

    test('returns falsy when Pokémon has not been seen', () => {
        expect(hasSeenSpecies(1, mockState)).toBeFalsy();
    });

    test('returns true when Pokémon has been seen', () => {
        mockState.stats.seenSpecies["Bulbasaur"] = true;
        expect(hasSeenSpecies(1, mockState)).toBe(true);
        expect(hasSeenSpecies(4, mockState)).toBeFalsy();
    });
});

test.describe('Pokedex UI logic - hasCaughtSpecies', () => {
    let mockState;

    test.beforeEach(() => {
        mockState = {
            config: {
                pokemonData: [
                    { id: 1, name: "Bulbasaur" },
                    { id: 4, name: "Charmander" },
                    { id: 7, name: "Squirtle" }
                ]
            },
            stats: {
                caughtSpecies: {}
            },
            party: [],
            storage: [],
            safe: [],
            breeding: [],
            training: []
        };
    });

    test('returns false when ID does not exist in pokemonData', () => {
        expect(hasCaughtSpecies(999, mockState)).toBe(false);
    });

    test('returns true when Pokémon is in caughtSpecies', () => {
        mockState.stats.caughtSpecies["Bulbasaur"] = true;
        expect(hasCaughtSpecies(1, mockState)).toBe(true);
        expect(hasCaughtSpecies(4, mockState)).toBeFalsy();
    });

    test('returns true when Pokémon is currently in the party', () => {
        mockState.party.push({ id: 4, name: "Charmander" });
        expect(hasCaughtSpecies(4, mockState)).toBe(true);
        expect(hasCaughtSpecies(1, mockState)).toBeFalsy();
    });

    test('returns true when Pokémon is currently in storage', () => {
        mockState.storage.push({ id: 7, name: "Squirtle" });
        expect(hasCaughtSpecies(7, mockState)).toBe(true);
        expect(hasCaughtSpecies(1, mockState)).toBeFalsy();
    });

    test('returns true when Pokémon is currently in the safe', () => {
        mockState.safe.push({ id: 1, name: "Bulbasaur" });
        expect(hasCaughtSpecies(1, mockState)).toBe(true);
    });

    test('returns true when Pokémon is currently in breeding', () => {
        mockState.breeding.push({ id: 4, name: "Charmander" });
        expect(hasCaughtSpecies(4, mockState)).toBe(true);
    });

    test('returns true when Pokémon is currently in training', () => {
        mockState.training.push({ id: 7, name: "Squirtle" });
        expect(hasCaughtSpecies(7, mockState)).toBe(true);
    });

    test('returns false when Pokémon has not been caught and is not in any storage', () => {
        expect(hasCaughtSpecies(1, mockState)).toBe(false);
        expect(hasCaughtSpecies(4, mockState)).toBe(false);
        expect(hasCaughtSpecies(7, mockState)).toBe(false);
    });

    test('handles missing caughtSpecies object without throwing error', () => {
        delete mockState.stats.caughtSpecies;
        expect(hasCaughtSpecies(1, mockState)).toBe(false);
    });
});
