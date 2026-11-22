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
    selectGlobalSmartCaptureBall,
    showUnownVariationsModal,
    closePokedexInnerModal
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
                    { id: 0, name: "MissingNo", types: ["Normal"], hp: 0, atk: 0, def: 0, spa: 0, spd: 0, spe: 0 },
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

        test('returns true if pokemon is in storage, safe, breeding, or training', () => {
            state.storage.push({ id: 1 });
            expect(hasEncounteredSpecies(1, state)).toBe(true);

            state.safe.push({ id: 2 });
            expect(hasEncounteredSpecies(2, state)).toBe(true);

            state.breeding.push({ id: 3 });
            expect(hasEncounteredSpecies(3, state)).toBe(true);

            state.training.push({ id: 4 });
            expect(hasEncounteredSpecies(4, state)).toBe(true);
        });

        test('handles gracefully when seenSpecies or caughtSpecies is undefined', () => {
            state.stats.seenSpecies = undefined;
            state.stats.caughtSpecies = undefined;
            state.party.push({ id: 1, name: 'Bulbasaur' });

            expect(hasEncounteredSpecies(1, state)).toBe(true);
            expect(hasEncounteredSpecies(2, state)).toBe(false);
        });

        test('returns false if pokemon is neither seen, caught, nor in any storage', () => {
            expect(hasEncounteredSpecies(1, state)).toBe(false);
        });
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
        state.config.pokemonData[1].johto_id = 1;

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

    test('filters pokedex entries by kalos_id and paldea_id for Kalos and Paldea regions', () => {
        const { showPokedex } = require('../../src/ui/pokedex.js');
        const { showModal } = require('../../src/ui.js');

        state.config.pokemonData.push(
            { id: 650, kalos_id: 1, name: 'Chespin', types: ['Grass'], hp: 56, atk: 61, def: 65, spa: 48, spd: 45, spe: 38 },
            { id: 653, kalos_id: 4, name: 'Fennekin', types: ['Fire'], hp: 40, atk: 45, def: 40, spa: 62, spd: 60, spe: 60 },
            { id: 906, paldea_id: 1, name: 'Sprigatito', types: ['Grass'], hp: 40, atk: 61, def: 54, spa: 45, spd: 45, spe: 65 }
        );
        state.stats.caughtSpecies['Bulbasaur'] = true;
        state.stats.caughtSpecies['Chespin'] = true;
        state.stats.caughtSpecies['Fennekin'] = true;
        state.stats.caughtSpecies['Sprigatito'] = true;

        showModal.mockClear();
        state.currentRegionName = 'Kalos';
        showPokedex();
        expect(showModal).toHaveBeenCalledWith('Kalos Pokedex', expect.any(String), 'window-pokedex');
        const kalosHtml = showModal.mock.calls[0][1];
        expect(kalosHtml).toContain('Chespin');
        expect(kalosHtml).toContain('#1');
        expect(kalosHtml).toContain('Fennekin');
        expect(kalosHtml).toContain('#4');
        expect(kalosHtml).not.toContain('Bulbasaur');
        expect(kalosHtml).not.toContain('Sprigatito');

        showModal.mockClear();
        state.currentRegionName = 'Paldea';
        showPokedex();
        expect(showModal).toHaveBeenCalledWith('Paldea Pokedex', expect.any(String), 'window-pokedex');
        const paldeaHtml = showModal.mock.calls[0][1];
        expect(paldeaHtml).toContain('Sprigatito');
        expect(paldeaHtml).toContain('#1');
        expect(paldeaHtml).not.toContain('Bulbasaur');
        expect(paldeaHtml).not.toContain('Chespin');
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
        const pData = state.config.pokemonData[1]; // Bulbasaur

        const html = buildEvolutionLineHtml(pData, state);

        expect(html).toContain('Evolution Line');
        expect(html).toContain('???'); // unseen evolutions
    });

    test('handles missing pokemon data in evolution chain gracefully', () => {
        const { buildEvolutionLineHtml } = require('../../src/ui/pokedex.js');
        // Add fake evolution pointing to non-existent pokemon (e.g., future generation)
        state.config.pokemonData[1].evolutions.push({ level: 100, to: 999 });

        const html = buildEvolutionLineHtml(state.config.pokemonData[1], state);
        expect(html).toBeTruthy();
        expect(html).not.toContain('Lv.100');
    });

    test('excludes pre-evolutions not in the current region', () => {
        const { buildEvolutionLineHtml } = require('../../src/ui/pokedex.js');
        state.currentRegionName = 'Kanto';
        const pichu = { id: 172, name: 'Pichu', johto_id: 21, evolutions: [{ level: 20, to: 25 }] };
        const pikachu = { id: 25, name: 'Pikachu', kanto_id: 25, evolutions: [{ level: 30, to: 26 }] };
        const raichu = { id: 26, name: 'Raichu', kanto_id: 26, evolutions: [] };
        state.config.pokemonData.push(pichu, pikachu, raichu);
        state.config.evolutionParents = { ...(state.config.evolutionParents || {}), 25: 172, 26: 25 };
        state.stats.seenSpecies['Pikachu'] = true;

        const html = buildEvolutionLineHtml(pikachu, state);
        expect(html).toContain('Pikachu');
        expect(html).not.toContain('Lv.20');
        expect(html).toContain('Lv.30');
    });
});

describe('getSpeciesDataHtml', () => {
    test('renders species data, type effectiveness, and learnset', () => {
        const { getSpeciesDataHtml } = require('../../src/ui/pokedex.js');
        const pData = state.config.pokemonData[4]; // Charmander (has learnset)

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

describe('Unown Variations Pokedex & Modal', () => {
    beforeEach(() => {
        jest.clearAllMocks();
        state.currentRegionName = 'Johto';
        state.stats = { seenSpecies: {}, caughtSpecies: {}, seenShiniesSpecies: {}, caughtShiniesSpecies: {} };
        state.party = [];
        state.storage = [];
        state.safe = [];
        state.breeding = [];
        state.training = [];
        state.config.pokemonData = [
            { id: 201, canonId: '0201', johto_id: 201, name: 'Unown', types: ['Psychic'], hp: 48, atk: 72, def: 48, spa: 72, spd: 48, spe: 48 },
            { id: 201.1, canonId: '0201.1', name: 'Unown (A)', types: ['Psychic'], hp: 48, atk: 72, def: 48, spa: 72, spd: 48, spe: 48, _folders: [1, 2, 3, 4, 7, 8] },
            { id: 201.6, canonId: '0201.6', name: 'Unown (Em)', types: ['Psychic'], hp: 48, atk: 72, def: 48, spa: 72, spd: 48, spe: 48, _folders: [2, 3, 4, 7, 8] },
            { id: 201.1, canonId: '0201.10', name: 'Unown (J)', types: ['Psychic'], hp: 48, atk: 72, def: 48, spa: 72, spd: 48, spe: 48, _folders: [1, 2, 3, 4, 7, 8] },
            { id: 201.27, canonId: '0201.27', name: 'Unown (F)', types: ['Psychic'], hp: 48, atk: 72, def: 48, spa: 72, spd: 48, spe: 48, _folders: [1, 2, 3, 4, 7, 8] },
        ];
    });

    it('does not render variation mark on Unown card before any Unown is caught', () => {
        showPokedex();
        const html = showModal.mock.calls[0][1];
        expect(html).not.toContain('pokedex-variation-mark');
    });

    it('renders variation mark and reveals Unown card when any Unown variation is caught', () => {
        state.stats.caughtSpecies['Unown (J)'] = 1;
        showPokedex();
        const html = showModal.mock.calls[0][1];
        expect(html).toContain('pokedex-variation-mark');
        expect(html).toContain('window.showVariationsModal(201, event)');
        expect(html).toContain('Unown');
    });

    it('opens inner modal with pokedex cards for region Unown variations', () => {
        state.stats.caughtSpecies['Unown (J)'] = 1;
        const stopPropagation = jest.fn();
        showUnownVariationsModal({ stopPropagation });

        expect(stopPropagation).toHaveBeenCalled();
        expect(showModal).toHaveBeenCalledWith(
            'Unown Variations',
            expect.any(String),
            'window-pokedex-unown-variations'
        );
        const html = showModal.mock.calls[0][1];
        expect(html).toContain('pokedex-grid');
        expect(html).toContain('pokedex-card');
        expect(html).toContain('#201 A');
        expect(html).toContain('#201 F');
        expect(html).toContain('#201 J');
        expect(html).toContain('Unown (J)');
        expect(html).toContain('Caught: 1/3');
        // Unown (Em) is not in Johto (folder 1)
        expect(html).not.toContain('#201 Em');
    });

    it('renders into inner modal overlay inside Pokedex window when present and closes cleanly', () => {
        state.stats.caughtSpecies['Unown (J)'] = 1;
        const overlay = document.createElement('div');
        overlay.id = 'pokedex-inner-modal-overlay';
        overlay.style.display = 'none';
        const titleEl = document.createElement('span');
        titleEl.id = 'pokedex-inner-modal-title';
        const content = document.createElement('div');
        content.id = 'pokedex-inner-modal-content';
        const map = {
            'pokedex-inner-modal-overlay': overlay,
            'pokedex-inner-modal-title': titleEl,
            'pokedex-inner-modal-content': content,
        };
        const getByIdSpy = jest.spyOn(document, 'getElementById').mockImplementation(id => map[id] || null);
        try {
            showUnownVariationsModal({ stopPropagation: jest.fn() });

            expect(showModal).not.toHaveBeenCalled();
            expect(overlay.style.display).toBe('flex');
            expect(content.innerHTML).toContain('#201 J');
            expect(content.innerHTML).toContain('Unown (J)');

            closePokedexInnerModal();
            expect(overlay.style.display).toBe('none');
        } finally {
            getByIdSpy.mockRestore();
        }
    });

    it('uses canonId in showDexEntry so 0201.10 (Unown J) does not collide with 201.1 (Unown A)', () => {
        state.config.pokemonMap = new Map([
            ['0201.1', state.config.pokemonData[1]],
            [201.1, state.config.pokemonData[1]],
            ['0201.10', state.config.pokemonData[3]],
        ]);
        showDexEntry('0201.10');
        expect(window.getSpriteUrl).toHaveBeenCalledWith('0201.10', false);
        const html = showModal.mock.calls[0][1];
        expect(html).toContain('Unown (J)');
        expect(html).toContain('dex-sprite-0201-10');
    });
});

describe('Region 5 Variations Pokedex & Modal', () => {
    beforeEach(() => {
        jest.clearAllMocks();
        state.currentRegionName = 'Unova';
        state.stats = { seenSpecies: {}, caughtSpecies: {}, seenShiniesSpecies: {}, caughtShiniesSpecies: {} };
        state.party = [];
        state.storage = [];
        state.safe = [];
        state.breeding = [];
        state.training = [];
        state.config.pokemonData = [
            { id: 550, canonId: '0550', unova_id: 56, name: 'Basculin', types: ['Water'], hp: 70, atk: 92, def: 65, spa: 80, spd: 55, spe: 98 },
            { id: 550.1, canonId: '0550.1', name: 'Basculin (Blue-Striped Form)', types: ['Water'], hp: 70, atk: 92, def: 65, spa: 80, spd: 55, spe: 98 },
            { id: 550.2, canonId: '0550.2', name: 'Basculin (Red-Striped Form)', types: ['Water'], hp: 70, atk: 92, def: 65, spa: 80, spd: 55, spe: 98 },
            { id: 550.3, canonId: '0550.3', name: 'Basculin (White-Striped Form)', types: ['Water'], hp: 70, atk: 92, def: 65, spa: 80, spd: 55, spe: 98 },
            { id: 555, canonId: '0555', unova_id: 61, name: 'Darmanitan', types: ['Fire'], hp: 105, atk: 140, def: 55, spa: 30, spd: 55, spe: 95 },
            { id: 555.1, canonId: '0555.1', name: 'Darmanitan (Galarian Standard Mode)', types: ['Ice'], hp: 105, atk: 140, def: 55, spa: 30, spd: 55, spe: 95 },
            { id: 555.2, canonId: '0555.2', name: 'Darmanitan (Galarian Zen Mode)', types: ['Ice', 'Fire'], hp: 105, atk: 160, def: 55, spa: 30, spd: 55, spe: 135 },
            { id: 555.3, canonId: '0555.3', name: 'Darmanitan (Standard Mode)', types: ['Fire'], hp: 105, atk: 140, def: 55, spa: 30, spd: 55, spe: 95 },
            { id: 555.4, canonId: '0555.4', name: 'Darmanitan (Zen Mode)', types: ['Fire', 'Psychic'], hp: 105, atk: 30, def: 105, spa: 140, spd: 105, spe: 55 },
            { id: 641, canonId: '0641', unova_id: 147, name: 'Tornadus', types: ['Flying'], hp: 79, atk: 115, def: 70, spa: 125, spd: 80, spe: 111 },
            { id: 641.1, canonId: '0641.1', name: 'Tornadus (Incarnate Forme)', types: ['Flying'], hp: 79, atk: 115, def: 70, spa: 125, spd: 80, spe: 111 },
            { id: 641.2, canonId: '0641.2', name: 'Tornadus (Therian Forme)', types: ['Flying'], hp: 79, atk: 100, def: 80, spa: 110, spd: 90, spe: 121 },
            { id: 642, canonId: '0642', unova_id: 148, name: 'Thundurus', types: ['Electric', 'Flying'], hp: 79, atk: 115, def: 70, spa: 125, spd: 80, spe: 111 },
            { id: 642.1, canonId: '0642.1', name: 'Thundurus (Incarnate Forme)', types: ['Electric', 'Flying'], hp: 79, atk: 115, def: 70, spa: 125, spd: 80, spe: 111 },
            { id: 642.2, canonId: '0642.2', name: 'Thundurus (Therian Forme)', types: ['Electric', 'Flying'], hp: 79, atk: 105, def: 70, spa: 145, spd: 80, spe: 101 },
            { id: 645, canonId: '0645', unova_id: 151, name: 'Landorus', types: ['Ground', 'Flying'], hp: 89, atk: 125, def: 90, spa: 115, spd: 80, spe: 101 },
            { id: 645.1, canonId: '0645.1', name: 'Landorus (Incarnate Forme)', types: ['Ground', 'Flying'], hp: 89, atk: 125, def: 90, spa: 115, spd: 80, spe: 101 },
            { id: 645.2, canonId: '0645.2', name: 'Landorus (Therian Forme)', types: ['Ground', 'Flying'], hp: 89, atk: 145, def: 90, spa: 105, spd: 80, spe: 91 },
            { id: 646, canonId: '0646', unova_id: 152, name: 'Kyurem', types: ['Dragon', 'Ice'], hp: 125, atk: 130, def: 90, spa: 130, spd: 90, spe: 95 },
            { id: 646.1, canonId: '0646.1', name: 'Kyurem (Black Kyurem)', types: ['Dragon', 'Ice'], hp: 125, atk: 170, def: 100, spa: 120, spd: 90, spe: 95 },
            { id: 646.2, canonId: '0646.2', name: 'Kyurem (White Kyurem)', types: ['Dragon', 'Ice'], hp: 125, atk: 120, def: 90, spa: 170, spd: 100, spe: 95 },
            { id: 648, canonId: '0648', unova_id: 154, name: 'Meloetta', types: ['Normal', 'Psychic'], hp: 100, atk: 77, def: 77, spa: 128, spd: 128, spe: 90 },
            { id: 648.1, canonId: '0648.1', name: 'Meloetta (Aria Forme)', types: ['Normal', 'Psychic'], hp: 100, atk: 77, def: 77, spa: 128, spd: 128, spe: 90 },
            { id: 648.2, canonId: '0648.2', name: 'Meloetta (Pirouette Forme)', types: ['Normal', 'Fighting'], hp: 100, atk: 128, def: 90, spa: 77, spd: 77, spe: 128 },
        ];
    });

    it('renders variation marks for all Region 5 variation species when any form is caught and excludes non-Unova forms', () => {
        const { showVariationsModal } = require('../../src/ui/pokedex.js');
        state.stats.caughtSpecies['Basculin (Blue-Striped Form)'] = 1;
        state.stats.caughtSpecies['Darmanitan (Zen Mode)'] = 1;
        state.stats.caughtSpecies['Tornadus (Therian Forme)'] = 1;
        state.stats.caughtSpecies['Thundurus (Incarnate Forme)'] = 1;
        state.stats.caughtSpecies['Landorus (Therian Forme)'] = 1;
        state.stats.caughtSpecies['Kyurem (Black Kyurem)'] = 1;
        state.stats.caughtSpecies['Meloetta (Pirouette Forme)'] = 1;

        showPokedex();
        const html = showModal.mock.calls[0][1];
        for (const [id, title] of [
            [550, 'Basculin Variations (1/2)'],
            [555, 'Darmanitan Variations (1/2)'],
            [641, 'Tornadus Variations (1/2)'],
            [642, 'Thundurus Variations (1/2)'],
            [645, 'Landorus Variations (1/2)'],
            [646, 'Kyurem Variations (1/3)'],
            [648, 'Meloetta Variations (1/2)'],
        ]) {
            expect(html).toContain(`title="${title}"`);
            expect(html).toContain(`window.showVariationsModal(${id}, event)`);
        }

        jest.clearAllMocks();
        showVariationsModal(550, { stopPropagation: jest.fn() });
        const basculinHtml = showModal.mock.calls[0][1];
        expect(basculinHtml).toContain('Basculin (Blue-Striped Form)');
        expect(basculinHtml).not.toContain('White-Striped');

        jest.clearAllMocks();
        showVariationsModal(555, { stopPropagation: jest.fn() });
        const darmanitanHtml = showModal.mock.calls[0][1];
        expect(darmanitanHtml).toContain('Darmanitan (Zen Mode)');
        expect(darmanitanHtml).not.toContain('Galarian');

        jest.clearAllMocks();
        showVariationsModal(646, { stopPropagation: jest.fn() });
        const kyuremHtml = showModal.mock.calls[0][1];
        expect(kyuremHtml).toContain('Kyurem (Black Kyurem)');
        expect(kyuremHtml).toContain('Caught: 1/3');
    });
});

describe('Mega Evolution Pokedex Variations & Evolution Line', () => {
    beforeEach(() => {
        jest.clearAllMocks();
        state.currentRegionName = 'Kalos';
        state.stats = { seenSpecies: {}, caughtSpecies: {}, seenShiniesSpecies: {}, caughtShiniesSpecies: {} };
        state.party = [];
        state.storage = [];
        state.safe = [];
        state.breeding = [];
        state.training = [];
        state.config.evolutionParents = { 6: 5, 5: 4 };
        state.config.pokemonData = [
            { id: 4, canonId: '0004', kalos_id: 80, kanto_id: 4, name: 'Charmander', types: ['Fire'], hp: 39, atk: 52, def: 43, spa: 60, spd: 50, spe: 65, evolutions: [{ level: 16, to: 5 }] },
            { id: 5, canonId: '0005', kalos_id: 81, kanto_id: 5, name: 'Charmeleon', types: ['Fire'], hp: 58, atk: 64, def: 58, spa: 80, spd: 65, spe: 80, evolutions: [{ level: 36, to: 6 }] },
            { id: 6, canonId: '0006', kalos_id: 82, galar_id: 380, kanto_id: 6, name: 'Charizard', types: ['Fire', 'Flying'], hp: 78, atk: 84, def: 78, spa: 109, spd: 85, spe: 100, evolutions: [], megaEvolutions: ['0006.2', '0006.3'], gigantamaxForms: ['0006.1'] },
            { id: 6.1, canonId: '0006.1', name: 'Charizard (Gigantamax)', types: ['Fire', 'Flying'], hp: 78, atk: 84, def: 78, spa: 109, spd: 85, spe: 100 },
            { id: 6.2, canonId: '0006.2', name: 'Mega Charizard X', types: ['Fire', 'Dragon'], hp: 78, atk: 130, def: 111, spa: 130, spd: 85, spe: 100 },
            { id: 6.3, canonId: '0006.3', name: 'Mega Charizard Y', types: ['Fire', 'Flying'], hp: 78, atk: 104, def: 78, spa: 159, spd: 115, spe: 100 },
        ];
        state.config.pokemonMap = new Map();
        for (const p of state.config.pokemonData) {
            state.config.pokemonMap.set(p.canonId, p);
            state.config.pokemonMap.set(p.id, p);
        }
    });

    it('shows variation symbol and Mega variations in Kalos/Alola, excluding Gigantamax and non-Mega regions', () => {
        const { showVariationsModal } = require('../../src/ui/pokedex.js');
        state.stats.caughtSpecies['Charizard'] = true;
        state.stats.caughtSpecies['Mega Charizard X'] = true;

        showPokedex();
        const kalosHtml = showModal.mock.calls[0][1];
        expect(kalosHtml).toContain('title="Charizard Variations (1/2)"');
        expect(kalosHtml).toContain('window.showVariationsModal(6, event)');

        jest.clearAllMocks();
        showVariationsModal(6, { stopPropagation: jest.fn() });
        const varModalHtml = showModal.mock.calls[0][1];
        expect(varModalHtml).toContain('Mega Charizard X');
        expect(varModalHtml).toContain('Caught: 1/2');
        expect(varModalHtml).not.toContain('Gigantamax');

        // Kanto should NOT show Mega variations
        jest.clearAllMocks();
        state.currentRegionName = 'Kanto';
        showPokedex();
        const kantoHtml = showModal.mock.calls[0][1];
        expect(kantoHtml).not.toContain('pokedex-variation-mark');
    });

    it('renders Mega<br>Evolution in Evolution Line only in Kalos/Alola and resolves full line from Mega form', () => {
        state.stats.caughtSpecies['Charmander'] = true;
        state.stats.caughtSpecies['Charmeleon'] = true;
        state.stats.caughtSpecies['Charizard'] = true;
        state.stats.caughtSpecies['Mega Charizard X'] = true;

        const megaXData = state.config.pokemonMap.get('0006.2');
        const kalosEvoHtml = buildEvolutionLineHtml(megaXData, state);
        expect(kalosEvoHtml).toContain('Charmander');
        expect(kalosEvoHtml).toContain('Lv.16 ➔');
        expect(kalosEvoHtml).toContain('Lv.36 ➔');
        expect(kalosEvoHtml).toContain('Mega<br>Evolution');
        expect(kalosEvoHtml).toContain('Mega Charizard X');
        expect(kalosEvoHtml).toContain('sprite_0006.3_false.png');
        expect(kalosEvoHtml).not.toContain('Mega Charizard Y');

        state.currentRegionName = 'Kanto';
        const charizardData = state.config.pokemonMap.get('0006');
        const kantoEvoHtml = buildEvolutionLineHtml(charizardData, state);
        expect(kantoEvoHtml).not.toContain('Mega<br>Evolution');
        expect(kantoEvoHtml).not.toContain('Gigantamax');
    });

    it('shows Gigantamax variation and evolution branch only in Galar', () => {
        const { showVariationsModal } = require('../../src/ui/pokedex.js');
        state.currentRegionName = 'Galar';
        state.stats.caughtSpecies['Charizard'] = true;
        state.stats.caughtSpecies['Charizard (Gigantamax)'] = true;

        showPokedex();
        const galarHtml = showModal.mock.calls[0][1];
        expect(galarHtml).toContain('title="Charizard Variations (1/1)"');
        expect(galarHtml).toContain('window.showVariationsModal(6, event)');

        jest.clearAllMocks();
        showVariationsModal(6, { stopPropagation: jest.fn() });
        const varModalHtml = showModal.mock.calls[0][1];
        expect(varModalHtml).toContain('Charizard (Gigantamax)');
        expect(varModalHtml).toContain('Caught: 1/1');
        expect(varModalHtml).not.toContain('Mega Charizard');

        const gmaxData = state.config.pokemonMap.get('0006.1');
        const galarEvoHtml = buildEvolutionLineHtml(gmaxData, state);
        expect(galarEvoHtml).toContain('Charizard');
        expect(galarEvoHtml).toContain('Gigantamax');
        expect(galarEvoHtml).toContain('Charizard (Gigantamax)');
        expect(galarEvoHtml).not.toContain('Mega<br>Evolution');
    });
});
});
