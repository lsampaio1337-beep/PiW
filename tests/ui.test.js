// Mock global fetch
global.fetch = jest.fn(() =>
  Promise.resolve({
    json: () => Promise.resolve([]),
  })
);

// Define global.state before anything else
global.state = {
    settings: { volume: 50 },
    stats: {},
    globalStats: {},
    config: {}
};

// Also put it on window just in case
window.state = global.state;

// Mock storage before importing ui.js to prevent errors
jest.mock('../src/storage.js', () => {
    return {
        __esModule: true,
        default: jest.fn().mockImplementation(() => ({
            load: jest.fn(() => ({})),
            save: jest.fn(),
            reset: jest.fn(),
            getProfile: jest.fn(),
            exportData: jest.fn(),
            importData: jest.fn(),
            setProfile: jest.fn(),
            getProfiles: jest.fn(() => [])
        }))
    };
});

// Mock DayCare
jest.mock('../src/dayCare.js', () => {
    return {
        __esModule: true,
        default: jest.fn().mockImplementation(() => ({}))
    };
});

// Mock WindowManager
jest.mock('../src/windowManager.js', () => {
    return {
        __esModule: true,
        WindowManager: jest.fn().mockImplementation(() => ({
            registerWindow: jest.fn()
        }))
    };
});

// Mock BattleSystem
jest.mock('../src/battleSystem.js', () => {
    return {
        __esModule: true,
        default: jest.fn().mockImplementation(() => ({
            start: jest.fn()
        }))
    };
});

// Mock state module which is imported in src/ui.js
jest.mock('../src/state.js', () => {
    return {
        state: {
            settings: { volume: 50 },
            stats: {},
            globalStats: {},
            config: {}
        }
    }
});

import { updateUI } from '../src/ui.js';
import * as mainControlModule from '../src/ui/mainControl.js';
import * as teamWindowModule from '../src/ui/teamWindow.js';
import * as battleModule from '../src/ui/battle.js';

// Mock the imported modules
jest.mock('../src/ui/mainControl.js', () => ({
    updateMainControl: jest.fn()
}));
jest.mock('../src/ui/teamWindow.js', () => ({
    updateTeamWindow: jest.fn()
}));
jest.mock('../src/ui/battle.js', () => ({
    updateBattleArena: jest.fn(),
    showDamage: jest.fn(),
    playCombatAnimations: jest.fn(),
    triggerDefeatAnimation: jest.fn(),
    showLoot: jest.fn(),
    showLevelUp: jest.fn()
}));
jest.mock('../src/ui/calendar.js', () => ({ showCalendar: jest.fn() }));
jest.mock('../src/ui/gift.js', () => ({ showGiftModal: jest.fn() }));
jest.mock('../src/ui/map.js', () => ({
    showMap: jest.fn(),
    navigateToLocation: jest.fn(),
    showMapTooltip: jest.fn(),
    hideMapTooltip: jest.fn()
}));
jest.mock('../src/ui/pokedex.js', () => ({
    showPokedex: jest.fn(),
    showDexEntry: jest.fn(),
    showSmartCaptureMode: jest.fn(),
    setSmartCaptureShinyMode: jest.fn(),
    showSmartCaptureBallSelection: jest.fn(),
    selectSmartCaptureBall: jest.fn(),
    selectGlobalSmartCaptureBall: jest.fn()
}));
jest.mock('../src/ui/pokemonStats.js', () => ({
    showPokemonStats: jest.fn(),
    showPokemonStatsByUuid: jest.fn(),
    evolvePokemon: jest.fn()
}));
jest.mock('../src/ui/bonusCandy.js', () => ({ showBonusCandyModal: jest.fn() }));
jest.mock('../src/ui/multiplayer.js', () => ({ openMultiplayerModal: jest.fn() }));
jest.mock('../src/ui/tokenShop.js', () => ({}));
jest.mock('../src/ui/backpack/index.js', () => ({
    showBackpack: jest.fn(),
    renderBackpackTab: jest.fn(),
    setActiveItem: jest.fn(),
    setAutoPotionThreshold: jest.fn()
}));
jest.mock('../src/ui/backpack/pokemon.js', () => ({ dragStart: jest.fn(), dragOver: jest.fn(), handleDrop: jest.fn() }));
jest.mock('../src/ui/settings.js', () => ({
    showSettings: jest.fn(),
    exportLog: jest.fn(),
    showAddPokemonModal: jest.fn(),
    forceNextEncounter: jest.fn(),
    activateCheat: jest.fn(),
    showTimeLapseModal: jest.fn(),
    runTimeLapse: jest.fn()
}));
jest.mock('../src/ui/market.js', () => ({
    setupMarket: jest.fn(),
    buyItem: jest.fn(),
    openPokeMarketBuy: jest.fn(),
    renderPokeMarketTab: jest.fn(),
    updateBuyItemPrice: jest.fn(),
    buySetMax: jest.fn()
}));


describe('updateUI', () => {
    let importedState;

    beforeAll(async () => {
        // Dynamic import to get reference to the mocked state
        const stateModule = await import('../src/state.js');
        importedState = stateModule.state;
    });

    beforeEach(() => {
        // Clear all mocks and reset variables before each test
        jest.clearAllMocks();
        global.window.currentMapRegion = undefined;
        // Reset the mocked state's property
        if (importedState) {
            importedState.currentRegionName = undefined;
        }
    });

    test('should fall back to state.currentRegionName if window.currentMapRegion is not set', () => {
        importedState.currentRegionName = 'Johto';

        updateUI();

        expect(global.window.currentMapRegion).toBe('Johto');
    });

    test('should fall back to Kanto if neither window.currentMapRegion nor state.currentRegionName is set', () => {
        updateUI();

        expect(global.window.currentMapRegion).toBe('Kanto');
    });

    test('should not change window.currentMapRegion if it is already set', () => {
        global.window.currentMapRegion = 'Hoenn';
        importedState.currentRegionName = 'Johto';

        updateUI();

        expect(global.window.currentMapRegion).toBe('Hoenn');
    });

    test('should call updateMainControl, updateTeamWindow, and updateBattleArena', () => {
        updateUI();

        expect(mainControlModule.updateMainControl).toHaveBeenCalled();
        expect(teamWindowModule.updateTeamWindow).toHaveBeenCalled();
        expect(battleModule.updateBattleArena).toHaveBeenCalled();
    });
});
