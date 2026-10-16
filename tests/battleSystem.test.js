import BattleSystem from '../src/battleSystem.js';
import * as mathEngine from '../src/mathEngine.js';

jest.mock('../src/mathEngine.js', () => ({
    calculateTotalXP: jest.fn(() => 50),
    calculateHP: jest.fn(() => 20),
    calculateStat: jest.fn(() => 10),
    calculatePP: jest.fn(() => 35),
    generateQuality: jest.fn(() => ({ name: 'Normal', q: 1 })),
    generateIVs: jest.fn(() => ({ hp: 10, atk: 10, def: 10, spa: 10, spd: 10, spe: 10 })),
    calculateEVXP: jest.fn(() => 10),
    calculateEVM: jest.fn(() => 1)
}));

describe('BattleSystem - Combat Initialization', () => {
    let battleSystem;
    let mockGameState;
    let mockUpdateUI;

    beforeEach(() => {
        jest.useFakeTimers();

        mockGameState = {
            config: {
                pokemonData: [
                    { id: 1, name: 'Bulbasaur', types: ['Grass', 'Poison'] },
                    { id: 4, name: 'Charmander', types: ['Fire'] }
                ],
                balance: {
                    baseSearchTime: 1,
                    baseAttackDelay: 1,
                    items: {
                        pokeballs: [{ name: 'Pokeball' }],
                        potions: [{ name: 'Tiny Potion' }]
                    }
                },
                types: {
                    'Normal': { 'Normal': 1 }
                }
            },
            party: [
                {
                    id: 1,
                    currentHp: 20,
                    maxHp: 20,
                    currentStats: { spe: 10, atk: 10, def: 10 },
                    level: 5
                }
            ],
            trainer: { money: 1000 },
            currentRoute: 'Route 1',
            stats: {
                faints: 0,
                upgrades: { speedTier: 0 },
                shiniesSeen: 0,
                seenShiniesSpecies: {},
                seenSpecies: {},
            },
            settings: {
                autoPotion: false,
                gameSpeed: 1
            },
            backpack: {
                pokeballs: {},
                potions: {}
            }
        };

        global.window = {
            getCurrentRoutes: jest.fn(() => [
                {
                    name: 'Route 1',
                    spawns: [
                        { pokemonId: 4, chance: 1, minLevel: 2, maxLevel: 5 }
                    ]
                }
            ]),
            trackDailyChallenge: jest.fn()
        };

        mockUpdateUI = jest.fn();
        battleSystem = new BattleSystem(mockGameState, mockUpdateUI);
    });

    afterEach(() => {
        jest.clearAllTimers();
        jest.useRealTimers();
    });

    test('should initialize correctly', () => {
        expect(battleSystem.state).toBe(mockGameState);
        expect(battleSystem.updateUI).toBe(mockUpdateUI);
        expect(battleSystem.activeEncounter).toBeNull();
        expect(battleSystem.isSearching).toBeFalsy();
    });

    test('searchNext sets isSearching and schedules generateEncounter', () => {
        jest.spyOn(battleSystem, 'generateEncounter').mockImplementation(() => {});

        battleSystem.searchNext();

        expect(battleSystem.isSearching).toBe(true);
        expect(battleSystem.activeEncounter).toBeNull();
        expect(battleSystem.combatLoop).not.toBeNull();

        jest.runAllTimers();

        expect(battleSystem.generateEncounter).toHaveBeenCalled();
    });

    test('searchNext handles wipeout condition', () => {
        mockGameState.party[0].currentHp = 0;

        jest.spyOn(battleSystem, 'handleWipeout').mockImplementation(() => {});

        battleSystem.searchNext();

        expect(battleSystem.handleWipeout).toHaveBeenCalled();
        expect(battleSystem.isSearching).toBe(false);
    });

    test('searchNext stops if out of money in Safari Zone', () => {
        mockGameState.currentRoute = 'Safari Zone';
        mockGameState.config.balance.safariZonePrice = 500;
        mockGameState.trainer.money = 100;

        global.document = {
            getElementById: jest.fn().mockReturnValue({ innerText: '' })
        };
        global.window.switchView = jest.fn();

        jest.spyOn(battleSystem, 'stop');

        battleSystem.searchNext();

        expect(battleSystem.stop).toHaveBeenCalled();
        expect(global.window.switchView).toHaveBeenCalledWith('SAFARI_HUB');
        expect(mockGameState.trainer.money).toBe(100);
    });

    test('generateEncounter creates an encounter correctly', () => {
        jest.spyOn(battleSystem, 'scheduleTurn').mockImplementation(() => {});
        jest.spyOn(battleSystem, 'getLearnsetMoves').mockReturnValue([]);

        battleSystem.generateEncounter(100);

        // Timer starts
        jest.runAllTimers();

        expect(battleSystem.activeEncounter).not.toBeNull();
        expect(battleSystem.activeEncounter.id).toBe(4);
        expect(battleSystem.activeEncounter.name).toBe('Charmander');
        expect(battleSystem.activeEncounter.level).toBeGreaterThanOrEqual(2);
        expect(battleSystem.activeEncounter.level).toBeLessThanOrEqual(5);
        expect(battleSystem.activeEncounter.currentHp).toBe(20);
        expect(battleSystem.isSearching).toBe(false);
        expect(battleSystem.scheduleTurn).toHaveBeenCalled();
    });
});
