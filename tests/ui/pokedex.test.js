import {
    formatType,
    formatTypes,
    hasEncounteredSpecies,
    hasSeenSpecies,
    hasCaughtSpecies,
    showPokedex,
    showDexEntry,
    buildEvolutionLineHtml,
    getSpeciesDataHtml,
    showSmartCaptureMode,
    setSmartCaptureShinyMode,
    showSmartCaptureBallSelection,
    selectSmartCaptureBall,
    selectGlobalSmartCaptureBall
} from '../../src/ui/pokedex.js';
import { state } from '../../src/state.js';
import { showModal } from '../../src/ui.js';

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
    beforeEach(() => {
        jest.clearAllMocks();

        // Setup global window properties used by pokedex.js
        window.getSpriteUrl = jest.fn((id, isShiny) => `sprite_${id}_${isShiny}.png`);
        window.storageRef = { save: jest.fn() };

        // Clear and setup default mock state
        for (let key in state) delete state[key];
        Object.assign(state, {
            currentRegionName: 'Kanto',
            config: {
                pokemonData: [
                    { id: 1, kanto_id: 1, name: "Bulbasaur", types: ["Grass", "Poison"], hp: 45, atk: 49, def: 49, spa: 65, spd: 65, spe: 45, evolutions: [{ level: 16, to: 2 }] },
                    { id: 2, kanto_id: 2, name: "Ivysaur", types: ["Grass", "Poison"], hp: 60, atk: 62, def: 63, spa: 80, spd: 80, spe: 60, evolutions: [{ level: 32, to: 3 }] },
                    { id: 3, kanto_id: 3, name: "Venusaur", types: ["Grass", "Poison"], hp: 80, atk: 82, def: 83, spa: 100, spd: 100, spe: 80 },
                    { id: 4, kanto_id: 4, name: "Charmander", types: ["Fire"], hp: 39, atk: 52, def: 43, spa: 60, spd: 50, spe: 65, learnset: [{ level: 1, move: "Scratch" }] },
                    { id: 7, kanto_id: 7, name: "Squirtle", types: ["Water"], hp: 44, atk: 48, def: 65, spa: 50, spd: 64, spe: 43 }
                ],
                evolutionParents: {
                    2: 1,
                    3: 2
                },
                types: {
                    "Water": { "Fire": 2, "Grass": 0.5 },
                    "Fire": { "Grass": 2, "Water": 0.5 },
                    "Grass": { "Water": 2, "Fire": 0.5 }
                },
                moves: {
                    "Scratch": { type: "Normal", power: 40, category: "Physical" }
                },
                balance: {
                    items: {
                        pokeballs: [
                            { name: "Poke Ball" },
                            { name: "Great Ball" }
                        ]
                    }
                }
            },
            stats: {
                seenSpecies: {},
                caughtSpecies: {},
                seenShiniesSpecies: {},
                caughtShiniesSpecies: {}
            },
            party: [],
            storage: [],
            safe: [],
            breeding: [],
            training: [],
            settings: {
                smartCapture: {},
                smartCaptureShiny: {},
                activeBallTier: 0,
                globalSmartCaptureShiny: undefined
            }
        });
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
            expect(result).toContain(', ');
        });

        test('returns None for empty types object', () => {
            const result = formatTypes({});
            expect(result).toBe('None');
        });
    });

    describe('hasSeenSpecies', () => {
        test('returns false if pokemon data does not exist', () => {
            expect(hasSeenSpecies(999, state)).toBe(false);
        });

        test('returns false if pokemon is not in seenSpecies', () => {
            expect(hasSeenSpecies(4, state)).toBeFalsy();
        });

        test('returns true if pokemon is in seenSpecies', () => {
            state.stats.seenSpecies["Charmander"] = true;
            expect(hasSeenSpecies(4, state)).toBe(true);
        });
    });

    describe('hasCaughtSpecies', () => {
        test('returns false if pokemon data does not exist', () => {
            expect(hasCaughtSpecies(999, state)).toBe(false);
        });

        test('returns true if pokemon is in caughtSpecies', () => {
            state.stats.caughtSpecies["Squirtle"] = true;
            expect(hasCaughtSpecies(7, state)).toBe(true);
        });

        test('returns true if pokemon is in party', () => {
            state.party.push({ id: 1 });
            expect(hasCaughtSpecies(1, state)).toBe(true);
        });

        test('returns true if pokemon is in storage', () => {
            state.storage.push({ id: 4 });
            expect(hasCaughtSpecies(4, state)).toBe(true);
        });

        test('returns true if pokemon is in safe', () => {
            state.safe.push({ id: 7 });
            expect(hasCaughtSpecies(7, state)).toBe(true);
        });

        test('returns true if pokemon is in breeding', () => {
            state.breeding.push({ id: 1 });
            expect(hasCaughtSpecies(1, state)).toBe(true);
        });

        test('returns true if pokemon is in training', () => {
            state.training.push({ id: 4 });
            expect(hasCaughtSpecies(4, state)).toBe(true);
        });

        test('returns false if pokemon is nowhere to be found', () => {
            expect(hasCaughtSpecies(1, state)).toBe(false);
        });
    });

    describe('hasEncounteredSpecies', () => {
        test('returns false if pokemon data does not exist', () => {
            expect(hasEncounteredSpecies(999, state)).toBe(false);
        });

        test('returns true if pokemon is in seenSpecies', () => {
            state.stats.seenSpecies["Bulbasaur"] = true;
            expect(hasEncounteredSpecies(1, state)).toBe(true);
        });

        test('returns true if pokemon is caught', () => {
            state.stats.caughtSpecies["Charmander"] = true;
            expect(hasEncounteredSpecies(4, state)).toBe(true);
        });

        test('returns true if pokemon is in party', () => {
            state.party.push({ id: 7 });
            expect(hasEncounteredSpecies(7, state)).toBe(true);
        });

        test('returns false if pokemon is neither seen, caught, nor in any storage', () => {
            expect(hasEncounteredSpecies(1, state)).toBe(false);
        });
    });

    // Add remaining tests here in a second step...
});
describe('showPokedex', () => {
    test('shows loading message if pokemonData is missing', () => {
        const { showPokedex } = require('../../src/ui/pokedex.js');
        const { showModal } = require('../../src/ui.js');
        const oldData = state.config.pokemonData;
        delete state.config.pokemonData;

        showPokedex();

        expect(showModal).toHaveBeenCalledWith('Kanto Pokedex', expect.stringContaining('Loading Pokedex data...'), 'window-pokedex');

        state.config.pokemonData = oldData;
    });

    test('renders pokedex modal for the current region', () => {
        const { showPokedex } = require('../../src/ui/pokedex.js');
        const { showModal } = require('../../src/ui.js');
        state.currentRegionName = 'Johto';
        state.config.pokemonData[0].johto_id = 1;

        showPokedex();

        expect(showModal).toHaveBeenCalledWith('Johto Pokedex', expect.any(String), 'window-pokedex');

        // Hoenn region check
        state.currentRegionName = 'Hoenn';
        showPokedex();
        expect(showModal).toHaveBeenCalledWith('Hoenn Pokedex', expect.any(String), 'window-pokedex');

        // Sinnoh region check
        state.currentRegionName = 'Sinnoh';
        showPokedex();
        expect(showModal).toHaveBeenCalledWith('Sinnoh Pokedex', expect.any(String), 'window-pokedex');

        // Unova region check
        state.currentRegionName = 'Unova';
        showPokedex();
        expect(showModal).toHaveBeenCalledWith('Unova Pokedex', expect.any(String), 'window-pokedex');
    });

    test('renders correct HTML for seen, caught, and shiny pokemon', () => {
        const { showPokedex } = require('../../src/ui/pokedex.js');
        const { showModal } = require('../../src/ui.js');
        state.currentRegionName = 'Kanto';
        state.stats.seenSpecies["Bulbasaur"] = true; // Seen
        state.stats.caughtSpecies["Charmander"] = true; // Caught
        state.stats.caughtShiniesSpecies["Squirtle"] = true; // Caught Shiny
        state.stats.caughtSpecies["Squirtle"] = true;

        showModal.mockClear();
        showPokedex();

        const html = showModal.mock.calls[0][1];

        // Bulbasaur (Seen, not caught)
        // Pokedex only reveals name if caught
        expect(html).toContain('???');
        expect(html).toContain('brightness(0)'); // Not revealed fully

        // Charmander (Caught)
        expect(html).toContain('Charmander');
        expect(html).toContain('onclick="window.showDexEntry(4)"');

        // Squirtle (Caught Shiny)
        expect(html).toContain('Squirtle');
        expect(html).toContain('pokedex-card-shiny-rotate');

        // Unseen Pokemon
        expect(html).toContain('???');
    });
});

describe('showDexEntry', () => {
    test('returns early if pokemon data does not exist', () => {
        const { showDexEntry } = require('../../src/ui/pokedex.js');
        const { showModal } = require('../../src/ui.js');

        showModal.mockClear();
        showDexEntry(999);
        expect(showModal).not.toHaveBeenCalled();
    });

    test('renders dex entry modal', () => {
        const { showDexEntry } = require('../../src/ui/pokedex.js');
        const { showModal } = require('../../src/ui.js');

        showDexEntry(1);

        expect(showModal).toHaveBeenCalledWith(
            'Pokedex Entry - Bulbasaur',
            expect.stringContaining('Bulbasaur'),
            'window-pokedex-entry-1'
        );
    });

    test('shows shiny button if shiny has been seen', () => {
        const { showDexEntry } = require('../../src/ui/pokedex.js');
        const { showModal } = require('../../src/ui.js');
        state.stats.seenShiniesSpecies["Bulbasaur"] = true;

        showModal.mockClear();
        showDexEntry(1);

        const html = showModal.mock.calls[0][1];
        expect(html).toContain('display: inline-block;');
    });
});

describe('buildEvolutionLineHtml', () => {
    test('builds html for evolution line recursively', () => {
        const { buildEvolutionLineHtml } = require('../../src/ui/pokedex.js');
        const pData = state.config.pokemonData[0]; // Bulbasaur

        const html = buildEvolutionLineHtml(pData, state);

        expect(html).toContain('Evolution Line');
        expect(html).toContain('???'); // unseen evolutions
    });

    test('handles missing pokemon data in evolution chain gracefully', () => {
        const { buildEvolutionLineHtml } = require('../../src/ui/pokedex.js');
        // Add fake evolution pointing to non-existent pokemon
        state.config.pokemonData[0].evolutions.push({ level: 100, to: 999 });

        const html = buildEvolutionLineHtml(state.config.pokemonData[0], state);
        expect(html).toBeTruthy();
    });
});

describe('getSpeciesDataHtml', () => {
    test('renders species data, type effectiveness, and learnset', () => {
        const { getSpeciesDataHtml } = require('../../src/ui/pokedex.js');
        const pData = state.config.pokemonData[3]; // Charmander (has learnset)

        const html = getSpeciesDataHtml(pData, state);

        expect(html).toContain('BST:');
        expect(html).toContain('Defensive Effectiveness');
        expect(html).toContain('Offensive Effectiveness');
        expect(html).toContain('Moveset');
        expect(html).toContain('Scratch');
    });

    test('handles all effectiveness multiplier branches', () => {
        const { getSpeciesDataHtml } = require('../../src/ui/pokedex.js');
        // Force types config to have all multipliers for testing branches
        state.config.types = {
            "T1": { "T2": 4, "T3": 0.25, "T4": 0 },
            "T5": { "T6": 2, "T7": 0.5 }
        };
        const pData = {
            types: ["T2", "T3", "T4", "T6", "T7"],
            hp: 1, atk: 1, def: 1, spa: 1, spd: 1, spe: 1
        };

        const html = getSpeciesDataHtml(pData, state);
        expect(html).toBeTruthy(); // Should not crash
    });
});

describe('Smart Capture Mode', () => {
    test('showSmartCaptureMode renders global mode correctly', () => {
        const { showSmartCaptureMode } = require('../../src/ui/pokedex.js');
        const { showModal } = require('../../src/ui.js');
        window.setSmartCaptureGlobalMode(); // Sets isSmartCaptureGlobalMode to true and calls showSmartCaptureMode

        expect(showModal).toHaveBeenCalledWith(
            expect.stringContaining('Smart Capture Mode'),
            expect.stringContaining('Follow Global'),
            'window-smart-capture'
        );
    });

    test('showSmartCaptureMode renders specific mode correctly', () => {
        const { showSmartCaptureMode, setSmartCaptureShinyMode } = require('../../src/ui/pokedex.js');
        const { showModal } = require('../../src/ui.js');
        setSmartCaptureShinyMode(false); // Normal specific mode

        expect(showModal).toHaveBeenCalledWith(
            expect.stringContaining('Smart Capture Mode'),
            expect.any(String),
            'window-smart-capture'
        );
    });

    test('showSmartCaptureMode renders loading message when pokemonData is missing', () => {
        const { showSmartCaptureMode, setSmartCaptureShinyMode } = require('../../src/ui/pokedex.js');
        const { showModal } = require('../../src/ui.js');
        const oldData = state.config.pokemonData;
        delete state.config.pokemonData;

        setSmartCaptureShinyMode(false);
        expect(showModal).toHaveBeenCalledWith(
            expect.any(String),
            expect.stringContaining('Loading Pokedex data...'),
            'window-smart-capture'
        );

        state.config.pokemonData = oldData;
    });

    test('showSmartCaptureBallSelection renders ball selection modal', () => {
        const { showSmartCaptureBallSelection } = require('../../src/ui/pokedex.js');
        const { showModal } = require('../../src/ui.js');

        showModal.mockClear();
        document.body.innerHTML = '<div id="smart-capture-inner-modal-overlay"></div><div id="smart-capture-inner-modal-title"></div><div id="smart-capture-inner-modal-content"></div>';
        showSmartCaptureBallSelection(1); // Bulbasaur

        expect(document.getElementById('smart-capture-inner-modal-title').innerHTML).toContain('Select ball');
        // The expect to showModal shouldn't be called since elements exist

    });

    test('showSmartCaptureBallSelection returns early if pokemon missing', () => {
        const { showSmartCaptureBallSelection } = require('../../src/ui/pokedex.js');
        const { showModal } = require('../../src/ui.js');
        showModal.mockClear();

        showSmartCaptureBallSelection(999);

        expect(showModal).not.toHaveBeenCalled();
    });

    test('selectSmartCaptureBall updates settings and saves state (Normal)', () => {
        const { selectSmartCaptureBall, setSmartCaptureShinyMode } = require('../../src/ui/pokedex.js');
        setSmartCaptureShinyMode(false);

        selectSmartCaptureBall(1, 1); // Set to Great Ball
        expect(state.settings.smartCapture[1]).toBe(1);
        expect(window.storageRef.save).toHaveBeenCalled();

        selectSmartCaptureBall(1, undefined); // Delete
        expect(state.settings.smartCapture[1]).toBeUndefined();
    });

    test('selectSmartCaptureBall updates settings and saves state (Shiny)', () => {
        const { selectSmartCaptureBall, setSmartCaptureShinyMode } = require('../../src/ui/pokedex.js');
        setSmartCaptureShinyMode(true);

        selectSmartCaptureBall(1, 1); // Set to Great Ball
        expect(state.settings.smartCaptureShiny[1]).toBe(1);

        selectSmartCaptureBall(1, undefined); // Delete
        expect(state.settings.smartCaptureShiny[1]).toBeUndefined();
    });

    test('selectGlobalSmartCaptureBall updates settings and saves state', () => {
        const { selectGlobalSmartCaptureBall } = require('../../src/ui/pokedex.js');

        // Shiny global
        selectGlobalSmartCaptureBall(true, 1);
        expect(state.settings.globalSmartCaptureShiny).toBe(1);
        expect(window.storageRef.save).toHaveBeenCalled();

        // Normal global
        window.setActiveItem = jest.fn();
        selectGlobalSmartCaptureBall(false, 1);
        expect(state.settings.activeBallTier).toBe(1);
        expect(window.setActiveItem).toHaveBeenCalledWith('ball', 1);

        // Fallback for setActiveItem
        window.setActiveItem = undefined;
        document.body.innerHTML = '<img id="smartwatch-ball-img" />';
        selectGlobalSmartCaptureBall(false, -1);
        expect(document.getElementById('smartwatch-ball-img').src).toContain('Assets/Extra/No.png');
    });
});
