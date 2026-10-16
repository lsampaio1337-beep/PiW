import { jest } from '@jest/globals';

jest.mock('../../src/ui.js', () => ({
  showModal: jest.fn()
}));

jest.mock('../../src/ui/cheatControl.js', () => ({
  showCheatControlModal: jest.fn()
}));

jest.mock('../../src/mathEngine.js', () => ({
  calculatePP: jest.fn()
}));

import { showSettings, showTimeLapseModal, runTimeLapse, showAddPokemonModal, forceNextEncounter, exportLog, activateCheat } from './settings.js';
import { state, globals } from '../state.js';
import { showModal } from '../ui.js';
import { showCheatControlModal } from './cheatControl.js';
import * as mathEngine from '../mathEngine.js';

describe('settings.js', () => {
    beforeEach(() => {
        jest.clearAllMocks();
        // Reset globals and state
        globals.battleSystem = null;
        for (const key in state) {
            delete state[key];
        }
        state.globalStats = {};
        state.stats = {};
        document.body.innerHTML = '';
        window.updateMainControl = jest.fn();
    });

    describe('showSettings', () => {
        it('should return early if battle system gym state is active', () => {
            globals.battleSystem = { gymState: { isActive: true } };
            showSettings();
            expect(showModal).not.toHaveBeenCalled();
        });

        it('should call showModal with settings HTML when no active gym battle', () => {
            globals.battleSystem = { gymState: { isActive: false } };
            showSettings();
            expect(showModal).toHaveBeenCalledTimes(1);
            expect(showModal).toHaveBeenCalledWith("Settings", expect.stringContaining("Export Save Log"), "window-settings");
        });
    });

    describe('showTimeLapseModal', () => {
        it('should call showModal with timelapse HTML', () => {
            showTimeLapseModal();
            expect(showModal).toHaveBeenCalledTimes(1);
            expect(showModal).toHaveBeenCalledWith("TimeLapse", expect.stringContaining("How long?:"), "window-timelapse");
        });
    });

    describe('runTimeLapse', () => {
        it('should do nothing if input elements are missing', () => {
            runTimeLapse();
            // No exceptions thrown, and no logic executed
        });

        it('should run timelapse correctly for hours', () => {
            document.body.innerHTML = `
                <input type="number" id="timelapse-duration-input" value="2">
                <select id="timelapse-unit-input">
                    <option value="hours" selected>Hours</option>
                </select>
            `;
            const mockRunFastForward = jest.fn().mockReturnValue({ simulatedTimeMs: 7200000 });
            globals.battleSystem = { runFastForward: mockRunFastForward };

            const originalShowTimeLapseResults = window.showTimeLapseResults;
            window.showTimeLapseResults = jest.fn();

            runTimeLapse();

            expect(mockRunFastForward).toHaveBeenCalledWith(2 * 3600 * 1000);
            expect(state.globalStats.playtime).toBe(7200);
            expect(state.stats.battleModeTimer).toBe(7200);
            expect(window.updateMainControl).toHaveBeenCalled();
            expect(window.showTimeLapseResults).toHaveBeenCalledWith({ simulatedTimeMs: 7200000 });

            window.showTimeLapseResults = originalShowTimeLapseResults;
        });

        it('should run timelapse correctly for minutes', () => {
            document.body.innerHTML = `
                <input type="number" id="timelapse-duration-input" value="30">
                <select id="timelapse-unit-input">
                    <option value="minutes" selected>Minutes</option>
                </select>
            `;
            const mockRunFastForward = jest.fn().mockReturnValue({ simulatedTimeMs: 1800000 });
            globals.battleSystem = { runFastForward: mockRunFastForward };

            const originalShowTimeLapseResults = window.showTimeLapseResults;
            window.showTimeLapseResults = jest.fn();

            runTimeLapse();

            expect(mockRunFastForward).toHaveBeenCalledWith(30 * 60 * 1000);
            expect(state.globalStats.playtime).toBe(1800);

            window.showTimeLapseResults = originalShowTimeLapseResults;
        });

        it('should not run timelapse if duration is invalid', () => {
            document.body.innerHTML = `
                <input type="number" id="timelapse-duration-input" value="-5">
                <select id="timelapse-unit-input">
                    <option value="hours" selected>Hours</option>
                </select>
            `;
            const mockRunFastForward = jest.fn();
            globals.battleSystem = { runFastForward: mockRunFastForward };

            runTimeLapse();

            expect(mockRunFastForward).not.toHaveBeenCalled();
        });
    });

    describe('window.showTimeLapseResults', () => {
        beforeEach(() => {
            state.config = {
                balance: {
                    items: {
                        stones: { price: 1000 },
                        pokeballs: [
                            { name: 'PokeBall', price: 200 }
                        ],
                        potions: [
                            { name: 'Potion', price: 300 }
                        ]
                    }
                }
            };
            state.settings = {
                activeBallTier: 0,
                activePotionTier: 0
            };
        });

        it('should calculate and display results properly', () => {
            mathEngine.calculatePP.mockReturnValue(500);

            const results = {
                simulatedTimeMs: 3661000, // 1h 1m 1s
                encounters: 10,
                xpEarned: 5000,
                money: 2000,
                caught: 2,
                shinies: 1,
                ballsUsed: 5,
                potionsUsed: 2,
                itemsLooted: {
                    'PokeBall': 3,
                    'Fire Stone': 1,
                    'HP Up': 1 // VITAMINS
                },
                caughtPokemonList: [
                    { bst: 300, level: 10, quality: 1, qualityName: "Regular", ivs: {hp:1, atk:1, def:1, spa:1, spd:1, spe:1} },
                    { bst: 300, level: 10, quality: 1, qualityName: "Shiny", ivs: {hp:1, atk:1, def:1, spa:1, spd:1, spe:1} }
                ]
            };

            window.showTimeLapseResults(results);

            expect(showModal).toHaveBeenCalledTimes(1);
            expect(showModal).toHaveBeenCalledWith("TimeLapse Results", expect.any(String), "window-timelapse-results", "600px");

            const html = showModal.mock.calls[0][1];
            expect(html).toContain("1h 1m 1s");
            expect(html).toContain("Battles:</b> 10");
            // Pokeballs: 3 * 200 = 600
            // Fire Stone: 1 * 1000 = 1000
            // HP Up (vitamin): 1 * 2000 = 2000
            // Total Looted Buy = 3600
            // Total Looted Sell = (3 * 100) + (1 * 500) + (1 * 1000) = 1800

            // Used Items:
            // 5 balls * 200 = 1000
            // 2 potions * 300 = 600
            // Total used buy = 1600

            // Pokemons Sold = 500
            // Shinies Sold = 500

            // Profit Sell = 2000 (money) + 1800 (loot sell) + 500 (poke sold) - 1600 (used buy) = 2700
            expect(html).toContain("$2,700");
        });
    });

    describe('showAddPokemonModal', () => {
        it('should call showModal with add pokemon HTML', () => {
            showAddPokemonModal();
            expect(showModal).toHaveBeenCalledTimes(1);
            expect(showModal).toHaveBeenCalledWith("Force Next Encounter", expect.stringContaining("Pokemon ID:"), "window-force-encounter");
        });
    });

    describe('forceNextEncounter', () => {
        it('should set state.nextForcedEncounter and hide modal overlay', () => {
            document.body.innerHTML = `
                <input id="force-enc-id" value="25">
                <input id="force-enc-level" value="10">
                <input id="force-enc-q" value="1.5">
                <input id="force-enc-sumiv" value="400">
                <div id="modal-overlay" style="display: block;"></div>
            `;

            forceNextEncounter();

            expect(state.nextForcedEncounter).toEqual({
                id: 25,
                level: 10,
                qValue: 1.5,
                sumIV: 400
            });
            expect(document.getElementById('modal-overlay').style.display).toBe('none');
        });
    });

    describe('exportLog', () => {
        it('should call state.storageRef.exportLog if storageRef exists', () => {
            state.storageRef = { exportLog: jest.fn() };
            exportLog();
            expect(state.storageRef.exportLog).toHaveBeenCalledWith(state);
        });

        it('should do nothing if storageRef does not exist', () => {
            exportLog();
            // Should not throw
        });
    });

    describe('activateCheat', () => {
        it('should call showCheatControlModal', () => {
            activateCheat();
            expect(showCheatControlModal).toHaveBeenCalledTimes(1);
        });
    });
});
