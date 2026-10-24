import {
    formatType,
    formatTypes,
    hasEncounteredSpecies,
    hasSeenSpecies,
    hasCaughtSpecies
} from '../../src/ui/pokedex.js';

// Mock ui.js
jest.mock('../../src/ui.js', () => ({
    showModal: jest.fn(),
    TYPE_COLORS: {
        "Fire": "#F08030",
        "Water": "#6890F0"
    }
}));

// Mock state.js
jest.mock('../../src/state.js', () => ({
    state: {}
}));

describe('Pokedex UI Logic', () => {
    let mockState;

    beforeEach(() => {
        // Setup default mock state
        mockState = {
            config: {
                pokemonData: [
                    { id: 1, name: "Bulbasaur" },
                    { id: 4, name: "Charmander" },
                    { id: 7, name: "Squirtle" }
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

    describe('formatType', () => {
        test('formats known type correctly', () => {
            const result = formatType('Fire');
            expect(result).toContain('color: #F08030');
            expect(result).toContain('Assets/Extra/Types/Type Fire.png');
            expect(result).toContain('Fire');
        });

        test('returns original string if type is unknown', () => {
            const result = formatType('UnknownType');
            expect(result).toBe('UnknownType');
        });

        test('handles null or undefined gracefully', () => {
            expect(formatType(null)).toBe(null);
            expect(formatType(undefined)).toBe(undefined);
            expect(formatType('')).toBe('');
        });
    });

    describe('formatTypes', () => {
        test('formats multiple types', () => {
            const types = { "Fire": 1, "Water": 1 };
            const result = formatTypes(types);
            expect(result).toContain('color: #F08030');
            expect(result).toContain('color: #6890F0');
            expect(result).toContain(', '); // Separated by comma
        });

        test('returns None for empty types object', () => {
            const result = formatTypes({});
            expect(result).toBe('None');
        });
    });

    describe('hasSeenSpecies', () => {
        test('returns false if pokemon data does not exist', () => {
            expect(hasSeenSpecies(999, mockState)).toBe(false);
        });

        test('returns false if pokemon is not in seenSpecies', () => {
            expect(hasSeenSpecies(4, mockState)).toBeFalsy();
        });

        test('returns true if pokemon is in seenSpecies', () => {
            mockState.stats.seenSpecies["Charmander"] = true;
            expect(hasSeenSpecies(4, mockState)).toBe(true);
        });
    });

    describe('hasCaughtSpecies', () => {
        test('returns false if pokemon data does not exist', () => {
            expect(hasCaughtSpecies(999, mockState)).toBe(false);
        });

        test('returns true if pokemon is in caughtSpecies', () => {
            mockState.stats.caughtSpecies["Squirtle"] = true;
            expect(hasCaughtSpecies(7, mockState)).toBe(true);
        });

        test('returns true if pokemon is in party', () => {
            mockState.party.push({ id: 1 });
            expect(hasCaughtSpecies(1, mockState)).toBe(true);
        });

        test('returns true if pokemon is in storage', () => {
            mockState.storage.push({ id: 4 });
            expect(hasCaughtSpecies(4, mockState)).toBe(true);
        });

        test('returns true if pokemon is in safe', () => {
            mockState.safe.push({ id: 7 });
            expect(hasCaughtSpecies(7, mockState)).toBe(true);
        });

        test('returns true if pokemon is in breeding', () => {
            mockState.breeding.push({ id: 1 });
            expect(hasCaughtSpecies(1, mockState)).toBe(true);
        });

        test('returns true if pokemon is in training', () => {
            mockState.training.push({ id: 4 });
            expect(hasCaughtSpecies(4, mockState)).toBe(true);
        });

        test('returns false if pokemon is nowhere to be found', () => {
            expect(hasCaughtSpecies(1, mockState)).toBe(false);
        });
    });

    describe('hasEncounteredSpecies', () => {
        test('returns false if pokemon data does not exist', () => {
            expect(hasEncounteredSpecies(999, mockState)).toBe(false);
        });

        test('returns true if pokemon is in seenSpecies', () => {
            mockState.stats.seenSpecies["Bulbasaur"] = true;
            expect(hasEncounteredSpecies(1, mockState)).toBe(true);
        });

        test('returns true if pokemon is caught', () => {
            mockState.stats.caughtSpecies["Charmander"] = true;
            expect(hasEncounteredSpecies(4, mockState)).toBe(true);
        });

        test('returns true if pokemon is in party', () => {
            mockState.party.push({ id: 7 });
            expect(hasEncounteredSpecies(7, mockState)).toBe(true);
        });

        test('returns false if pokemon is neither seen, caught, nor in any storage', () => {
            expect(hasEncounteredSpecies(1, mockState)).toBe(false);
        });
    });
});
