import { jest } from '@jest/globals';
import { alolaMapCoordinates } from '../../config/alolaMapCoordinates.js';
import { alolaRoutes, alolaUnlocks } from '../../config/alolaRoutes.js';

global.state = {
    currentRegionName: 'Alola',
    party: [],
    storage: [],
    trainer: { badges: 0, money: 0 },
    globalStats: { hasSeenJohtoMap: true },
    stats: {
        hasPickedStarter: false,
        completedChallengeIds: [],
        activeChallenges: [],
        newRoutes: [],
        defeatedBosses: {},
        caughtSpecies: {}
    },
    settings: {},
    regions: {},
    config: {
        alolaMapCoordinates,
        alolaRoutes,
        alolaUnlocks,
        pokemonData: [null, { id: 1, name: 'Bulbasaur' }],
        balance: {}
    }
};
window.state = global.state;

global.globals = {
    battleSystem: { gymState: { isActive: false }, stop: jest.fn() }
};
window.globals = global.globals;

jest.mock('../../src/state.js', () => ({
    state: global.state,
    globals: global.globals,
    swapRegion: jest.fn()
}));

jest.mock('../../src/ui.js', () => ({
    updateUI: jest.fn(),
    switchView: jest.fn(),
    showModal: jest.fn()
}));

jest.mock('../../src/ui/market.js', () => ({
    setupMarket: jest.fn()
}));

jest.mock('../../src/ui/dailyChallenges.js', () => ({
    checkAndResetDailyChallenges: jest.fn()
}));

describe('Alola Map & Cheat Complete Progress', () => {
    let showMap;
    let cheatAction;
    let renderedHtml = '';

    beforeAll(async () => {
        window.showModal = jest.fn((_title, html) => {
            renderedHtml = html;
        });
        window.getCurrentRoutes = () => global.state.config.alolaRoutes;
        window.getCurrentUnlocks = () => global.state.config.alolaUnlocks;
        window.alert = jest.fn();

        const mapMod = await import('../../src/ui/map.js');
        showMap = mapMod.showMap;
        window.showMap = showMap;
        const cheatMod = await import('../../src/ui/cheatControl.js');
        cheatAction = cheatMod.cheatAction;
    });

    beforeEach(() => {
        renderedHtml = '';
        window.currentMapRegion = 'Alola';
        global.state.currentRegionName = 'Alola';
        global.state.party = [];
        global.state.storage = [];
        global.state.stats = {
            hasPickedStarter: false,
            completedChallengeIds: [],
            activeChallenges: [],
            newRoutes: [],
            defeatedBosses: {},
            caughtSpecies: {}
        };
        global.state.regions = {};
    });

    test('renders Alola Professor Lab at its configured coordinate instead of (50, 50) fallback', () => {
        showMap();

        expect(renderedHtml).toContain("7 1 Alola Map.png");
        expect(renderedHtml).toContain('data-location="Alola Professor Lab"');
        expect(renderedHtml).toContain('left: 35.58%; top: 26.47%;');
        expect(renderedHtml).not.toContain('left: 50%; top: 50%;');
    });

    test('swaps Alola map image to 7 2 Alola Map.png after defeating Alola Champion while keeping coordinates', () => {
        global.state.stats.hasPickedStarter = true;
        global.state.stats.defeatedBosses['Alola Champion'] = true;

        showMap();

        expect(renderedHtml).toContain("7 2 Alola Map.png");
        expect(renderedHtml).toContain('data-location="Alola Professor Lab"');
        expect(renderedHtml).toContain('left: 35.58%; top: 26.47%;');
        expect(renderedHtml).toContain('data-location="Route 1 - South"');
    });

    test('uses Alola region stats when viewing Alola map tab from another region', () => {
        global.state.currentRegionName = 'Kanto';
        global.state.stats.defeatedBosses = {};
        global.state.regions = {
            Alola: {
                party: [{ name: 'Rowlet' }],
                storage: [],
                trainer: { badges: 11 },
                stats: {
                    hasPickedStarter: true,
                    completedChallengeIds: ['Pokemon League'],
                    defeatedBosses: { 'Alola Champion': true }
                }
            }
        };

        showMap();

        expect(renderedHtml).toContain("7 2 Alola Map.png");
        expect(renderedHtml).toContain('data-location="Pokemon League"');
    });

    test('cheatAction("Map") unlocks all Alola spots and marks Alola Champion defeated', () => {
        cheatAction('Map');
        showMap();

        expect(global.state.stats.defeatedBosses['Alola Champion']).toBe(true);
        expect(renderedHtml).toContain("7 2 Alola Map.png");
        expect(renderedHtml).toContain('data-location="Alola Professor Lab"');
        expect(renderedHtml).toContain('data-location="Route 1 - South"');
        expect(renderedHtml).toContain('data-location="Pokemon League"');
        expect(renderedHtml).toContain('data-location="Eclipse High Altar"');
    });
});
