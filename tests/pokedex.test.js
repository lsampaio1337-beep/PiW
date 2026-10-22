jest.mock('../src/state.js', () => ({
    state: {}
}));

jest.mock('../src/ui.js', () => ({
    showModal: jest.fn(),
    TYPE_COLORS: {}
}));

import { hasEncounteredSpecies } from '../src/ui/pokedex.js';

describe('Pokedex - hasEncounteredSpecies', () => {
    let mockState;

    beforeEach(() => {
        mockState = {
            config: {
                pokemonData: [
                    { id: 1, name: 'Bulbasaur' },
                    { id: 2, name: 'Ivysaur' },
                    { id: 4, name: 'Charmander' }
                ]
            },
            stats: {
                seenSpecies: {},
                caughtSpecies: {}
            },
            party: [],
            storage: [],
            safe: [],
            breeding: [],
            training: []
        };
    });

    test('should return false if pokemon data is not found in config', () => {
        const result = hasEncounteredSpecies(999, mockState);
        expect(result).toBe(false);
    });

    test('should return false if species has not been encountered', () => {
        const result = hasEncounteredSpecies(1, mockState);
        expect(result).toBe(false);
    });

    test('should return true if species is in seenSpecies', () => {
        mockState.stats.seenSpecies['Bulbasaur'] = true;
        const result = hasEncounteredSpecies(1, mockState);
        expect(result).toBe(true);
    });

    test('should return true if species is in caughtSpecies', () => {
        mockState.stats.caughtSpecies['Bulbasaur'] = true;
        const result = hasEncounteredSpecies(1, mockState);
        expect(result).toBe(true);
    });

    test('should return true if species is in party', () => {
        mockState.party.push({ id: 1, name: 'Bulbasaur' });
        const result = hasEncounteredSpecies(1, mockState);
        expect(result).toBe(true);
    });

    test('should return true if species is in storage', () => {
        mockState.storage.push({ id: 1, name: 'Bulbasaur' });
        const result = hasEncounteredSpecies(1, mockState);
        expect(result).toBe(true);
    });

    test('should return true if species is in safe', () => {
        mockState.safe.push({ id: 1, name: 'Bulbasaur' });
        const result = hasEncounteredSpecies(1, mockState);
        expect(result).toBe(true);
    });

    test('should return true if species is in breeding', () => {
        mockState.breeding.push({ id: 1, name: 'Bulbasaur' });
        const result = hasEncounteredSpecies(1, mockState);
        expect(result).toBe(true);
    });

    test('should return true if species is in training', () => {
        mockState.training.push({ id: 1, name: 'Bulbasaur' });
        const result = hasEncounteredSpecies(1, mockState);
        expect(result).toBe(true);
    });

    test('should handle gracefully when seenSpecies or caughtSpecies is undefined', () => {
        mockState.stats.seenSpecies = undefined;
        mockState.stats.caughtSpecies = undefined;

        // Setup a different way to encounter so we test the function completes
        mockState.party.push({ id: 1, name: 'Bulbasaur' });

        const resultFound = hasEncounteredSpecies(1, mockState);
        expect(resultFound).toBe(true);

        const resultNotFound = hasEncounteredSpecies(2, mockState);
        expect(resultNotFound).toBe(false);
    });
});
