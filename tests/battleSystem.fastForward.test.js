import BattleSystem from '../src/battleSystem.js';

function createMockState({ currentHp = 20, maxHp = 100, potions = 10, autoPotion = true } = {}) {
    return {
        currentRoute: 'Route 1 (Kanto)',
        currentRegionName: 'Kanto',
        trainer: { money: 1000, badges: 0 },
        party: [
            {
                id: 1,
                name: 'Bulbasaur',
                types: ['Grass', 'Poison'],
                level: 10,
                xp: 0,
                maxHp,
                currentHp,
                quality: 1.0,
                qualityName: 'Regular',
                currentStats: { hp: maxHp, atk: 50, def: 50, spa: 50, spd: 50, spe: 100 },
                moves: [{ name: 'Tackle', type: 'Normal', category: 'Physical', power: 40 }],
            },
        ],
        storage: [],
        backpack: {
            pokeballs: { Pokeball: 10 },
            potions: { 'Tiny Potion': potions },
            stones: {},
        },
        settings: {
            activeBallTier: 0,
            activePotionTier: 0,
            autoCatch: false,
            autoPotion,
            autoPotionThreshold: 50,
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
        },
        config: {
            types: { Normal: { Normal: 1.0 } },
            pokemonData: [],
            balance: {
                baseSearchTime: 1,
                baseAttackDelay: 1,
                items: {
                    pokeballs: [{ name: 'Pokeball', price: 200, catchRate: 1 }],
                    potions: [{ name: 'Tiny Potion', price: 100, heal: 20 }],
                },
            },
            pokemon: [
                { id: 1, name: 'Bulbasaur', types: ['Grass', 'Poison'], hp: 45, atk: 49, def: 49, spa: 65, spd: 65, spe: 45 },
                { id: 19, name: 'Rattata', types: ['Normal'], hp: 30, atk: 56, def: 35, spa: 25, spd: 35, spe: 72 },
            ],
            routes: {
                'Route 1 (Kanto)': {
                    spawns: [{ pokemonId: 19, minLevel: 2, maxLevel: 2, chance: 100 }],
                },
            },
        },
    };
}

describe('BattleSystem.runFastForward potion attack-interval behavior', () => {
    beforeEach(() => {
        global.window = global.window || {};
        global.window.getCurrentRoutes = () => ({
            'Route 1 (Kanto)': {
                spawns: [{ pokemonId: 19, minLevel: 2, maxLevel: 2, chance: 100 }],
            },
        });
    });

    test('potion usage consumes leader attack interval (leaderDelay) and advances simulatedTimeMs', () => {
        const mockSpawn = { pokemonId: 19, minLevel: 2, maxLevel: 2, chance: 100 };
        const mockEnemyBase = { id: 19, name: 'Rattata', types: ['Normal'], hp: 30, atk: 56, def: 35, spa: 25, spd: 35, spe: 72 };
        const mockMoves = [{ name: 'Tackle', type: 'Normal', category: 'Physical', power: 40 }];

        const mockRoute = { areaId: 'Route 1 (Kanto)', spawns: [mockSpawn] };

        // Without autoPotion: 1 encounter takes searchTime + 1 leaderDelay + 500ms
        const stateNoPotion = createMockState({ currentHp: 20, maxHp: 100, potions: 5, autoPotion: false });
        const bsNoPotion = new BattleSystem(stateNoPotion);
        bsNoPotion.getRoute = () => mockRoute;
        bsNoPotion.getSpawnForRoute = () => mockSpawn;
        bsNoPotion.getPokemonBase = () => mockEnemyBase;
        bsNoPotion.getLearnsetMoves = () => mockMoves;
        const resNoPotion = bsNoPotion.runFastForward(1);

        // With autoPotion (threshold 50%, hp 20/100 -> heals +20 to 40, still <=50%, heals +20 to 60 -> then attacks):
        // Each in-combat potion takes 1 leaderDelay (+ enemyDelay if enemy survives).
        const stateWithPotion = createMockState({ currentHp: 20, maxHp: 100, potions: 5, autoPotion: true });
        const bsWithPotion = new BattleSystem(stateWithPotion);
        bsWithPotion.getRoute = () => mockRoute;
        bsWithPotion.getSpawnForRoute = () => mockSpawn;
        bsWithPotion.getPokemonBase = () => mockEnemyBase;
        bsWithPotion.getLearnsetMoves = () => mockMoves;
        const resWithPotion = bsWithPotion.runFastForward(1);

        expect(resWithPotion.potionsUsed).toBeGreaterThanOrEqual(1);
        expect(resWithPotion.simulatedTimeMs).toBeGreaterThan(resNoPotion.simulatedTimeMs);
        // Leader attack delay with spe=100, baseAttackDelay=1 is 1000 * (100 / 200) = 500ms per potion turn
        expect(resWithPotion.simulatedTimeMs - resNoPotion.simulatedTimeMs).toBeGreaterThanOrEqual(500);
        expect(Number.isFinite(resWithPotion.money)).toBe(true);
        expect(resWithPotion.xpEarned).toBeGreaterThan(0);
    });
});
