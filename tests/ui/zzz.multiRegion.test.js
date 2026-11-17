import { state, swapRegion, REGION_TEMPLATE } from '../../src/state.js';
import Storage from '../../src/storage.js';
import BattleSystem from '../../src/battleSystem.js';
import {
    ZZZ_CONFIG,
    calculateZzZSimulationParams,
    consumeZzZGrains,
    summarizeZzZResults,
    buildZzZResultsModalHtml,
    buildZzZWakeUpModalHtml,
} from '../../src/ui/zzz.js';

function makePokemon(id, name, spe = 100) {
    return {
        id,
        name,
        types: ['Normal'],
        level: 30,
        xp: 0,
        maxHp: 500,
        currentHp: 500,
        quality: 1.0,
        qualityName: 'Regular',
        ivs: { hp: 50, atk: 50, def: 50, spa: 50, spd: 50, spe: 50 },
        currentStats: { hp: 500, atk: 120, def: 100, spa: 100, spd: 100, spe },
        moves: [{ name: 'Tackle', type: 'Normal', category: 'Physical', power: 40 }],
    };
}

function setupBattleSystemForTest(targetState) {
    const bs = new BattleSystem(targetState);
    const regionRoutes = {
        Kanto: { areaId: 'Route 1 (Kanto)', spawns: [{ pokemonId: 19, minLevel: 2, maxLevel: 2, chance: 100 }] },
        Johto: { areaId: 'Route 29', spawns: [{ pokemonId: 161, minLevel: 2, maxLevel: 2, chance: 100 }] },
        Hoenn: { areaId: 'Route 101', spawns: [{ pokemonId: 261, minLevel: 2, maxLevel: 2, chance: 100 }] },
    };
    bs.getRoute = (routeName) => regionRoutes[targetState.currentRegionName] || { areaId: routeName, spawns: [{ pokemonId: 19, minLevel: 2, maxLevel: 2, chance: 100 }] };
    bs.getSpawnForRoute = (route) => route.spawns[0];
    bs.getPokemonBase = (id) => ({ id, name: `Mon-${id}`, types: ['Normal'], hp: 30, atk: 40, def: 30, spa: 25, spd: 30, spe: 40 });
    bs.getLearnsetMoves = () => [{ name: 'Tackle', type: 'Normal', category: 'Physical', power: 40 }];
    return bs;
}

describe('Multi-Region ZzZ Sleep -> Save -> Relog -> Collect Flow', () => {
    beforeEach(() => {
        localStorage.clear();
        // Reset state cleanly to Kanto
        Object.assign(state, JSON.parse(JSON.stringify(REGION_TEMPLATE)));
        state.regions = {};
        state.currentRegionName = 'Kanto';
        state.currentRoute = 'Route 1 (Kanto)';
        state.config = {
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
        };
        state.settings = {
            activeBallTier: 0,
            activePotionTier: 0,
            autoCatch: false,
            autoPotion: false,
            autoPotionThreshold: 25,
            gameSpeed: 1,
        };
    });

    test('sleep in Kanto and Johto, save, reload from storage, and collect 1h results in both regions', () => {
        const storage = new Storage();
        storage.currentProfileId = 'profile_test_1';

        // 1. Setup Kanto & put Kanto to sleep (with 60 grains, slept > 60m -> capped at 60m)
        state.party = [makePokemon(1, 'Bulbasaur')];
        state.trainer.money = 500;
        state.stats.jigglypuffGrains = 60;
        state.isZzZMode = true;
        state.zzzTimestamp = Date.now() - 90 * 60000;

        // 2. Swap to Johto, setup Johto & put Johto to sleep (with 60 grains, slept > 60m -> capped at 60m)
        swapRegion('Johto');
        expect(state.currentRegionName).toBe('Johto');
        expect(state.regions.Kanto.isZzZMode).toBe(true);
        expect(state.isZzZMode).toBe(false);

        state.party = [makePokemon(152, 'Chikorita')];
        state.trainer.money = 800;
        state.stats.jigglypuffGrains = 60;
        state.isZzZMode = true;
        state.zzzTimestamp = Date.now() - 75 * 60000;

        // 3. Save game (leaving game)
        storage.save(state);

        // 4. Wipe in-memory state and reload (logging back in)
        state.isZzZMode = false;
        state.regions = {};
        state.currentRegionName = 'Kanto';
        const loaded = storage.load();
        expect(loaded).not.toBeNull();
        Object.assign(state, loaded);

        // Should load into Johto with both Johto and Kanto sleeping
        expect(state.currentRegionName).toBe('Johto');
        expect(state.isZzZMode).toBe(true);
        expect(state.regions.Kanto.isZzZMode).toBe(true);

        // Wake Up prompt for background region Kanto while currently in Johto shows Kanto's route
        const kantoWakePrompt = buildZzZWakeUpModalHtml('Kanto', state, ZZZ_CONFIG);
        expect(kantoWakePrompt).toContain('Sleeping in Kanto');
        expect(kantoWakePrompt).toContain('Route 1');

        // 5. Collect Johto's 1-hour offline hunt
        const bsJohto = setupBattleSystemForTest(state);
        const johtoParams = calculateZzZSimulationParams(state, Date.now(), ZZZ_CONFIG);
        expect(johtoParams.timeElapsedMs).toBe(3600000);

        const johtoResults = bsJohto.runFastForward(johtoParams.timeElapsedMs);
        consumeZzZGrains(state, johtoResults.simulatedTimeMs, johtoParams.maxTimeMs, johtoParams.availableGrains, ZZZ_CONFIG);
        state.isZzZMode = false;
        state.zzzTimestamp = null;

        const johtoSummary = summarizeZzZResults(johtoResults, state, johtoParams.maxTimeMs, ZZZ_CONFIG);
        expect(johtoSummary.routeName).toBe('Route 29');
        expect(johtoSummary.durationStr).toBe('1h 0m 0s');
        expect(johtoSummary.moneyEarned).toBeGreaterThan(0);
        expect(johtoSummary.xpEarned).toBeGreaterThan(0);
        expect(buildZzZResultsModalHtml(johtoSummary, state)).not.toContain('NaN');

        // Kanto must STILL be sleeping
        expect(state.regions.Kanto.isZzZMode).toBe(true);

        // 6. Swap to Kanto and collect Kanto's 1-hour offline hunt
        swapRegion('Kanto');
        expect(state.currentRegionName).toBe('Kanto');
        expect(state.isZzZMode).toBe(true);
        expect(state.regions.Johto.isZzZMode).toBe(false);

        const bsKanto = setupBattleSystemForTest(state);
        const kantoParams = calculateZzZSimulationParams(state, Date.now(), ZZZ_CONFIG);
        expect(kantoParams.timeElapsedMs).toBe(3600000);

        const kantoResults = bsKanto.runFastForward(kantoParams.timeElapsedMs);
        state.isZzZMode = false;
        state.zzzTimestamp = null;

        const kantoSummary = summarizeZzZResults(kantoResults, state, kantoParams.maxTimeMs, ZZZ_CONFIG);
        expect(kantoSummary.routeName).toBe('Route 1');
        expect(kantoSummary.durationStr).toBe('1h 0m 0s');
        expect(kantoSummary.moneyEarned).toBeGreaterThan(0);
        expect(kantoSummary.xpEarned).toBeGreaterThan(0);
        expect(state.isZzZMode).toBe(false);
    });

    test('sleep in 3 regions simultaneously (Kanto, Johto, Hoenn) and wake up in any order without cross-contamination', () => {
        const storage = new Storage();
        storage.currentProfileId = 'profile_test_2';

        // Kanto sleep (30 grains)
        state.party = [makePokemon(1, 'Bulbasaur')];
        state.trainer.money = 100;
        state.stats.jigglypuffGrains = 30;
        state.isZzZMode = true;
        state.zzzTimestamp = Date.now() - 40 * 60000;

        // Johto sleep (45 grains)
        swapRegion('Johto');
        state.party = [makePokemon(152, 'Chikorita')];
        state.trainer.money = 200;
        state.stats.jigglypuffGrains = 45;
        state.isZzZMode = true;
        state.zzzTimestamp = Date.now() - 50 * 60000;

        // Hoenn sleep (60 grains)
        swapRegion('Hoenn');
        state.party = [makePokemon(252, 'Treecko')];
        state.trainer.money = 300;
        state.stats.jigglypuffGrains = 60;
        state.isZzZMode = true;
        state.zzzTimestamp = Date.now() - 70 * 60000;

        storage.save(state);
        const loaded = storage.load();
        Object.assign(state, loaded);

        expect(state.currentRegionName).toBe('Hoenn');
        expect(state.isZzZMode).toBe(true);
        expect(state.regions.Kanto.isZzZMode).toBe(true);
        expect(state.regions.Johto.isZzZMode).toBe(true);

        // Wake Hoenn (60 grains -> 60m)
        let bs = setupBattleSystemForTest(state);
        let params = calculateZzZSimulationParams(state, Date.now(), ZZZ_CONFIG);
        let res = bs.runFastForward(params.timeElapsedMs);
        expect(res.simulatedTimeMs).toBeGreaterThanOrEqual(60 * 60000);
        state.isZzZMode = false;

        // Wake Kanto next (30 grains -> 30m)
        swapRegion('Kanto');
        expect(state.isZzZMode).toBe(true);
        expect(state.party[0].name).toBe('Bulbasaur');
        bs = setupBattleSystemForTest(state);
        params = calculateZzZSimulationParams(state, Date.now(), ZZZ_CONFIG);
        res = bs.runFastForward(params.timeElapsedMs);
        expect(res.simulatedTimeMs).toBeGreaterThanOrEqual(30 * 60000);
        state.isZzZMode = false;

        // Wake Johto last (45 grains -> 45m)
        swapRegion('Johto');
        expect(state.isZzZMode).toBe(true);
        expect(state.party[0].name).toBe('Chikorita');
        bs = setupBattleSystemForTest(state);
        params = calculateZzZSimulationParams(state, Date.now(), ZZZ_CONFIG);
        res = bs.runFastForward(params.timeElapsedMs);
        expect(res.simulatedTimeMs).toBeGreaterThanOrEqual(45 * 60000);
        state.isZzZMode = false;

        // All 3 regions are now awake
        expect(state.isZzZMode).toBe(false);
        expect(state.regions.Kanto.isZzZMode).toBe(false);
        expect(state.regions.Hoenn.isZzZMode).toBe(false);
    });
});
