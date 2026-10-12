const { test, expect } = require('@playwright/test');

// Mock browser globals for Node.js environment
global.window = {
    addEventListener: () => {},
    localStorage: { getItem: () => null, setItem: () => {} },
    location: { reload: () => {} }
};
const mockElement = {
    addEventListener: () => {},
    style: {},
    classList: { add: () => {}, remove: () => {} },
    onclick: null,
    appendChild: () => {},
    innerHTML: '',
    querySelector: () => mockElement,
    querySelectorAll: () => []
};
global.document = {
    addEventListener: () => {},
    createElement: () => ({ ...mockElement }),
    getElementById: () => ({ ...mockElement }),
    querySelector: () => mockElement,
    querySelectorAll: () => []
};
global.localStorage = global.window.localStorage;
global.Audio = class { constructor() {} play() {} pause() {} };
global.fetch = async () => ({ json: async () => ({}) });
global.Math.random = () => 0.5;
global.MutationObserver = class {
    constructor(callback) {}
    disconnect() {}
    observe(element, initObject) {}
};

const { hasCaughtSpecies } = require('../../src/ui/pokedex.js');

function createMockState() {
    return {
        config: {
            pokemonData: [
                { id: 1, name: 'Bulbasaur' },
                { id: 4, name: 'Charmander' },
                { id: 7, name: 'Squirtle' }
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
}

test('hasCaughtSpecies returns false if pokemon id is not in config', () => {
    const state = createMockState();
    expect(hasCaughtSpecies(999, state)).toBe(false);
});

test('hasCaughtSpecies returns true if pokemon is in caughtSpecies stats', () => {
    const state = createMockState();
    state.stats.caughtSpecies['Bulbasaur'] = true;
    expect(hasCaughtSpecies(1, state)).toBe(true);
});

test('hasCaughtSpecies returns true if pokemon is in party', () => {
    const state = createMockState();
    state.party.push({ id: 4 });
    expect(hasCaughtSpecies(4, state)).toBe(true);
});

test('hasCaughtSpecies returns true if pokemon is in storage', () => {
    const state = createMockState();
    state.storage.push({ id: 7 });
    expect(hasCaughtSpecies(7, state)).toBe(true);
});

test('hasCaughtSpecies returns true if pokemon is in safe', () => {
    const state = createMockState();
    state.safe.push({ id: 1 });
    expect(hasCaughtSpecies(1, state)).toBe(true);
});

test('hasCaughtSpecies returns true if pokemon is in breeding', () => {
    const state = createMockState();
    state.breeding.push({ id: 4 });
    expect(hasCaughtSpecies(4, state)).toBe(true);
});

test('hasCaughtSpecies returns true if pokemon is in training', () => {
    const state = createMockState();
    state.training.push({ id: 7 });
    expect(hasCaughtSpecies(7, state)).toBe(true);
});

test('hasCaughtSpecies returns false if pokemon is not caught anywhere', () => {
    const state = createMockState();
    expect(hasCaughtSpecies(1, state)).toBe(false);
});

test('hasCaughtSpecies handles undefined caughtSpecies stats safely', () => {
    const state = createMockState();
    delete state.stats.caughtSpecies;
    expect(hasCaughtSpecies(1, state)).toBe(false);
});
