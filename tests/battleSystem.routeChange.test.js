import { jest } from '@jest/globals';
import BattleSystem from '../src/battleSystem.js';

function createPartyMember(id, name, currentHp = 100, maxHp = 100) {
    return {
        id,
        name,
        types: ['Normal'],
        level: 20,
        xp: 0,
        maxHp,
        currentHp,
        quality: 1.0,
        qualityName: 'Regular',
        ivs: { hp: 50, atk: 50, def: 50, spa: 50, spd: 50, spe: 50 },
        currentStats: { hp: maxHp, atk: 80, def: 60, spa: 60, spd: 60, spe: 100 },
        moves: [{ name: 'Tackle', type: 'Normal', category: 'Physical', power: 50 }],
    };
}

function createMockState() {
    const routes = [
        {
            name: 'Route 1 (Kanto)',
            spawns: [{ pokemonId: 19, minLevel: 2, maxLevel: 2, chance: 1 }],
        },
        {
            name: 'Route 2 (Kanto)',
            spawns: [{ pokemonId: 16, minLevel: 5, maxLevel: 5, chance: 1 }],
        },
        {
            name: 'Empty Route',
            spawns: [],
        },
    ];

    return {
        currentRoute: 'Route 1 (Kanto)',
        currentRegionName: 'Kanto',
        trainer: { money: 1000, badges: 0 },
        party: [
            createPartyMember(1, 'Bulbasaur', 100, 100),
            createPartyMember(4, 'Charmander', 100, 100),
        ],
        storage: [],
        backpack: {
            pokeballs: { Pokeball: 10 },
            potions: { 'Tiny Potion': 10 },
            stones: {},
        },
        settings: {
            activeBallTier: 0,
            activePotionTier: 0,
            autoCatch: false,
            autoPotion: false,
            autoPotionThreshold: 25,
            gameSpeed: 1,
        },
        stats: {
            caught: 0,
            shiniesCaught: 0,
            shiniesSeen: 0,
            battlesWon: 0,
            faints: 0,
            bonusCandyDefeats: 0,
            whiteCandies: 0,
            greenCandies: 0,
            seenSpecies: {},
            activeChallenges: [],
        },
        config: {
            types: { Normal: { Normal: 1.0 } },
            moves: {
                Tackle: { power: 50, type: 'Normal', category: 'Physical' },
            },
            pokemonData: [
                { id: 1, name: 'Bulbasaur', types: ['Grass', 'Poison'], hp: 45, atk: 49, def: 49, spa: 65, spd: 65, spe: 45, learnset: [{ level: 1, move: 'Tackle' }] },
                { id: 4, name: 'Charmander', types: ['Fire'], hp: 39, atk: 52, def: 43, spa: 60, spd: 50, spe: 65, learnset: [{ level: 1, move: 'Tackle' }] },
                { id: 16, name: 'Pidgey', types: ['Normal', 'Flying'], hp: 40, atk: 45, def: 40, spa: 35, spd: 35, spe: 56, learnset: [{ level: 1, move: 'Tackle' }] },
                { id: 19, name: 'Rattata', types: ['Normal'], hp: 30, atk: 56, def: 35, spa: 25, spd: 35, spe: 72, learnset: [{ level: 1, move: 'Tackle' }] },
            ],
            routes,
            balance: {
                baseSearchTime: 1,
                baseAttackDelay: 1,
                items: {
                    pokeballs: [{ name: 'Pokeball', price: 200, multiplier: 1 }],
                    potions: [{ name: 'Tiny Potion', price: 100, heal: 20 }],
                },
            },
        },
    };
}

describe('BattleSystem route change & leader swap safety', () => {
    let state;
    let updateUI;
    let battleSystem;

    beforeEach(() => {
        jest.useFakeTimers();
        state = createMockState();
        updateUI = jest.fn();
        global.window = global.window || {};
        global.window.getCurrentRoutes = () => state.config.routes;
        global.window.getCurrentUnlocks = () => [];
        battleSystem = new BattleSystem(state, updateUI);
    });

    afterEach(() => {
        battleSystem.stop();
        jest.useRealTimers();
    });

    test('changing route mid-projectile does not falsely faint/swap healthy leader or freeze new route', () => {
        // Start an encounter on Route 1
        battleSystem.start();
        expect(battleSystem.activeEncounter.name).toBe('Rattata');
        // Finish slide-in
        jest.advanceTimersByTime(battleSystem.slideDuration);
        expect(battleSystem.isSliding).toBe(false);

        // Give encounter 1 HP so player's projectile is lethal
        battleSystem.activeEncounter.currentHp = 1;
        const leader = state.party[0];
        const enemy = battleSystem.activeEncounter;

        // Fire player attack (starts 500ms projectile timer)
        battleSystem.executeTurn(leader, enemy);

        // Before projectile lands (200ms in), user changes route to Route 2
        jest.advanceTimersByTime(200);
        battleSystem.stop();
        battleSystem.activeEncounter = null;
        battleSystem.isSearching = false;
        state.currentRoute = 'Route 2 (Kanto)';
        battleSystem.searchNext();

        // Advance past when the old projectile AND a 4s handleFaint timer would have fired
        jest.advanceTimersByTime(5000);

        // Leader must NEVER have been swapped
        expect(state.party[0].name).toBe('Bulbasaur');
        expect(state.party[1].name).toBe('Charmander');
        expect(battleSystem.isFainting).toBe(false);

        // New route must have started and spawned Pidgey without freezing
        expect(battleSystem.activeEncounter).not.toBeNull();
        expect(battleSystem.activeEncounter.name).toBe('Pidgey');
        expect(battleSystem.combatLoop).not.toBeNull();
    });

    test('changing route while isFainting is true resets faint state and starts new route without freezing', () => {
        // Simulate leader fainting on Route 1
        state.party[0].currentHp = 0;
        battleSystem.handleFaint();
        expect(battleSystem.isFainting).toBe(true);

        // User heals/switches or immediately moves to Route 2 mid-faint
        jest.advanceTimersByTime(1000);
        state.party[0].currentHp = 100;
        battleSystem.stop();
        battleSystem.activeEncounter = null;
        battleSystem.isSearching = false;
        state.currentRoute = 'Route 2 (Kanto)';
        battleSystem.searchNext();

        expect(battleSystem.isFainting).toBe(false);
        expect(battleSystem.isSearching).toBe(true);

        // Advance past old 4s faint timer + new route search & slide delays
        jest.advanceTimersByTime(5000);

        // Old handleFaint timer must NOT have swapped the healed leader
        expect(state.party[0].name).toBe('Bulbasaur');
        expect(battleSystem.isFainting).toBe(false);
        expect(battleSystem.activeEncounter).not.toBeNull();
        expect(battleSystem.activeEncounter.name).toBe('Pidgey');
        expect(battleSystem.combatLoop).not.toBeNull();
    });

    test('changing route mid-slide resets isSliding and starts new route cleanly', () => {
        battleSystem.start();
        expect(battleSystem.isSliding).toBe(true);

        // Change route before slide finishes
        battleSystem.stop();
        battleSystem.activeEncounter = null;
        state.currentRoute = 'Route 2 (Kanto)';
        battleSystem.searchNext();

        expect(battleSystem.isSliding).toBe(false);
        expect(battleSystem.isSearching).toBe(true);

        // Advance through search delay (500ms) and slide delay (500ms)
        jest.advanceTimersByTime(1050);

        expect(battleSystem.isSearching).toBe(false);
        expect(battleSystem.isSliding).toBe(false);
        expect(battleSystem.activeEncounter.name).toBe('Pidgey');
        expect(battleSystem.combatLoop).not.toBeNull();
    });

    test('handleFaint ignores healthy leader even if called directly', () => {
        state.party[0].currentHp = 50;
        battleSystem.handleFaint();
        expect(battleSystem.isFainting).toBe(false);
        jest.advanceTimersByTime(5000);
        expect(state.party[0].name).toBe('Bulbasaur');
    });

    test('switchLeader during active combat cancels stale projectile and schedules turn cleanly', () => {
        battleSystem.start();
        jest.advanceTimersByTime(battleSystem.slideDuration);
        const enemy = battleSystem.activeEncounter;
        enemy.currentHp = 1;

        // Enemy attacks Bulbasaur (projectile in flight)
        battleSystem.executeTurn(enemy, state.party[0]);
        jest.advanceTimersByTime(100);

        // User manually switches leader to Charmander mid-projectile
        battleSystem.switchLeader(1);
        expect(state.party[0].name).toBe('Charmander');

        // Advance past original projectile time; old enemy attack must NOT hit Bulbasaur or schedule stale strike
        const hpBefore = state.party[1].currentHp;
        jest.advanceTimersByTime(450);
        expect(state.party[1].currentHp).toBe(hpBefore);
    });

    test('generateEncounter on empty or missing route resets isSearching instead of throwing or hanging', () => {
        state.currentRoute = 'Empty Route';
        battleSystem.isSearching = true;
        expect(() => battleSystem.generateEncounter(500)).not.toThrow();
        expect(battleSystem.isSearching).toBe(false);

        state.currentRoute = 'Nonexistent Route';
        battleSystem.isSearching = true;
        expect(() => battleSystem.generateEncounter(500)).not.toThrow();
        expect(battleSystem.isSearching).toBe(false);
    });
});
