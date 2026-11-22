import BattleSystem from '../src/battleSystem.js';
import { calculateTotalXP } from '../src/mathEngine.js';

function createRegionState(regionName, routeName, partyLevel = 20) {
    return {
        currentRoute: routeName,
        currentRegionName: regionName,
        trainer: { money: 0, badges: 0 },
        party: [
            {
                id: 1,
                name: 'Bulbasaur',
                types: ['Grass', 'Poison'],
                level: partyLevel,
                xp: calculateTotalXP(partyLevel),
                maxHp: 200,
                currentHp: 200,
                quality: 1.0,
                qualityName: 'Regular',
                ivs: { hp: 50, atk: 50, def: 50, spa: 50, spd: 50, spe: 50 },
                currentStats: { hp: 200, atk: 50, def: 50, spa: 50, spd: 50, spe: 50 },
                moves: [{ name: 'Tackle', type: 'Normal', category: 'Physical', power: 40 }],
            },
        ],
        storage: [],
        backpack: { pokeballs: {}, potions: {}, stones: {} },
        settings: { gameSpeed: 1, autoCatch: false, autoPotion: false },
        stats: { levelTaskTier: 0, purpleCandies: 0, seenSpecies: {} },
        config: {
            types: { Normal: { Normal: 1.0 } },
            pokemonData: [
                { id: 1, name: 'Bulbasaur', types: ['Grass', 'Poison'], hp: 45, atk: 49, def: 49, spa: 65, spd: 65, spe: 45 },
                { id: 16, name: 'Pidgey', types: ['Normal', 'Flying'], hp: 40, atk: 45, def: 40, spa: 35, spd: 35, spe: 56 },
            ],
            balance: { baseSearchTime: 1, baseAttackDelay: 1 },
        },
    };
}

describe('BattleSystem Prestige XP & Region Level Scaling', () => {
    test('grantXP applies +100% XP bonus per region (Kanto=1x, Johto=2x, Hoenn=3x)', () => {
        const kantoState = createRegionState('Kanto', 'Route 2', 20);
        const johtoState = createRegionState('Johto', 'Route 30', 20);
        const hoennState = createRegionState('Hoenn', 'Route 102', 20);

        const bsKanto = new BattleSystem(kantoState);
        const bsJohto = new BattleSystem(johtoState);
        const bsHoenn = new BattleSystem(hoennState);

        const baseKantoXp = kantoState.party[0].xp;
        bsKanto.grantXP(kantoState.party[0], 1000, false);
        bsJohto.grantXP(johtoState.party[0], 1000, false);
        bsHoenn.grantXP(hoennState.party[0], 1000, false);

        expect(kantoState.party[0].xp - baseKantoXp).toBe(1000);
        expect(johtoState.party[0].xp - baseKantoXp).toBe(2000);
        expect(hoennState.party[0].xp - baseKantoXp).toBe(3000);
    });

    test('grantXP allows leveling past 100 up to the region cap (200 in Johto)', () => {
        const johtoState = createRegionState('Johto', 'Route 30', 100);
        const bs = new BattleSystem(johtoState);
        const xpTo105 = calculateTotalXP(105) - calculateTotalXP(100);

        bs.grantXP(johtoState.party[0], Math.ceil(xpTo105 / 2), false);
        expect(johtoState.party[0].level).toBeGreaterThanOrEqual(105);

        bs.grantXP(johtoState.party[0], 1e12, false);
        expect(johtoState.party[0].level).toBe(200);
    });

    test('generateEncounter linearly scales wild enemy levels and caps starting routes', () => {
        const johtoState = createRegionState('Johto', 'Route 30', 50);
        const bs = new BattleSystem(johtoState);
        bs.getRoute = () => ({ name: 'Route 30', spawns: [{ pokemonId: 16, minLevel: 10, maxLevel: 10, chance: 1 }] });
        bs.getSpawnForRoute = (r) => r.spawns[0];
        bs.getPokemonBase = (id) => johtoState.config.pokemonData.find(p => p.id === id);
        bs.getLearnsetMoves = () => [];
        bs.updateUI = () => {};
        bs._scheduleTimer = () => null;

        bs.generateEncounter(0);
        expect(bs.activeEncounter.level).toBe(20);

        // Starting route prevents Lv 1 starter softlock
        johtoState.currentRoute = 'Route 29';
        johtoState.party[0].level = 1;
        bs.generateEncounter(0);
        expect(bs.activeEncounter.level).toBe(1);
    });
});
