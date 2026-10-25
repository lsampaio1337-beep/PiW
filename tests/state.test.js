import { checkFinalChallengeCompleted, state, swapRegion, REGION_TEMPLATE, globals, setBattleSystem } from '../src/state.js';

describe('setBattleSystem', () => {
    afterEach(() => {
        globals.battleSystem = null; // Reset between tests
    });

    it('should set globals.battleSystem to the provided system object', () => {
        const mockSystem = { startBattle: jest.fn() };
        setBattleSystem(mockSystem);
        expect(globals.battleSystem).toBe(mockSystem);
    });

    it('should handle setting it to null or undefined', () => {
        setBattleSystem(null);
        expect(globals.battleSystem).toBe(null);

        setBattleSystem(undefined);
        expect(globals.battleSystem).toBe(undefined);
    });
});

describe('checkFinalChallengeCompleted', () => {
    beforeEach(() => {
        // Reset state before each test
        state.currentRegionName = "Kanto";
        state.stats = JSON.parse(JSON.stringify(REGION_TEMPLATE.stats));
        state.regions = {};
        state.config = {};
    });

    it('should return false if stats or completedChallengeIds are missing', () => {
        state.stats.completedChallengeIds = null;
        expect(checkFinalChallengeCompleted('Kanto')).toBe(false);
    });

    it('should return false if region has no stats', () => {
        expect(checkFinalChallengeCompleted('Johto')).toBe(false);
    });

    it('should use default final challenge ID for Kanto if config is missing', () => {
        state.stats.completedChallengeIds = ['Kanto Pokemon League'];
        expect(checkFinalChallengeCompleted('Kanto')).toBe(true);
    });

    it('should use default final challenge ID for Johto if config is missing', () => {
        swapRegion('Johto');
        state.stats.completedChallengeIds = ['Mount Silver'];
        expect(checkFinalChallengeCompleted('Johto')).toBe(true);
    });

    it('should use default final challenge ID for Hoenn if config is missing', () => {
        swapRegion('Hoenn');
        state.stats.completedChallengeIds = ['Battle Frontier'];
        expect(checkFinalChallengeCompleted('Hoenn')).toBe(true);
    });

    it('should use default final challenge ID for Sinnoh if config is missing', () => {
        swapRegion('Sinnoh');
        state.stats.completedChallengeIds = ['Spear Pillar'];
        expect(checkFinalChallengeCompleted('Sinnoh')).toBe(true);
    });

    it('should use default final challenge ID for Unova if config is missing', () => {
        swapRegion('Unova');
        state.stats.completedChallengeIds = ['Giant Chasm'];
        expect(checkFinalChallengeCompleted('Unova')).toBe(true);
    });

    it('should return false if default final challenge is not completed', () => {
        state.stats.completedChallengeIds = ['Some Other Challenge'];
        expect(checkFinalChallengeCompleted('Kanto')).toBe(false);
    });

    it('should return false for unknown region with no config', () => {
        swapRegion('Kalos');
        state.stats.completedChallengeIds = ['Kalos Pokemon League']; // Won't match default since Kalos has none in code
        expect(checkFinalChallengeCompleted('Kalos')).toBe(false);
    });

    it('should use config routes to determine final challenge', () => {
        state.config.routes = [
            { challengeName: 'Final Challenge', areaId: 'Custom Final Challenge' }
        ];
        state.stats.completedChallengeIds = ['Custom Final Challenge'];
        expect(checkFinalChallengeCompleted('Kanto')).toBe(true);
    });

    it('should use config routes for specific regions', () => {
        swapRegion('Johto');
        state.config.johtoRoutes = [
            { challengeName: 'Final Challenge', areaId: 'Johto Custom Final' }
        ];
        state.stats.completedChallengeIds = ['Johto Custom Final'];
        expect(checkFinalChallengeCompleted('Johto')).toBe(true);
    });

    it('should read from state.stats for current region', () => {
        state.currentRegionName = "Hoenn";
        state.stats.completedChallengeIds = ['Battle Frontier'];

        expect(checkFinalChallengeCompleted('Hoenn')).toBe(true);
    });

    it('should read from state.regions for non-current region', () => {
        state.currentRegionName = "Kanto";

        state.regions["Sinnoh"] = {
            stats: {
                completedChallengeIds: ['Spear Pillar']
            }
        };

        expect(checkFinalChallengeCompleted('Sinnoh')).toBe(true);
    });

    it('should fall back to Kanto for null/undefined regionName when Kanto is current', () => {
        state.currentRegionName = undefined; // simulating some uninitialized state or default Kanto
        state.stats.completedChallengeIds = ['Kanto Pokemon League'];

        expect(checkFinalChallengeCompleted()).toBe(true);
    });
});

describe('swapRegion', () => {
    beforeEach(() => {
        // Reset state before each test
        state.currentRegionName = "Kanto";
        for (let key in REGION_TEMPLATE) {
            state[key] = JSON.parse(JSON.stringify(REGION_TEMPLATE[key]));
        }
        state.regions = {};
        state.config = {};
    });

    it('should do nothing if newRegionName is the same as currentRegionName', () => {
        state.trainer.money = 100;
        swapRegion('Kanto');
        expect(state.trainer.money).toBe(100);
        expect(Object.keys(state.regions).length).toBe(0);
    });

    it('should pack current region into state.regions', () => {
        state.trainer.money = 500;
        swapRegion('Johto');
        expect(state.regions['Kanto']).toBeDefined();
        expect(state.regions['Kanto'].trainer.money).toBe(500);
    });

    it('should initialize a new region if it does not exist in state.regions', () => {
        swapRegion('Sinnoh');
        expect(state.currentRegionName).toBe('Sinnoh');
        expect(state.regions['Sinnoh']).toBeDefined();
        expect(state.trainer.money).toBe(0); // From REGION_TEMPLATE
    });

    it('should set starting route and active challenges for Johto specifically', () => {
        swapRegion('Johto');
        expect(state.regions['Johto'].currentRoute).toBe('Route 29');
        expect(state.regions['Johto'].stats.activeChallenges).toContain('Route 29');
        expect(state.stats.activeChallenges).toContain('Route 29'); // Check that it was mounted
    });

    it('should set starting route and active challenges for Hoenn specifically', () => {
        swapRegion('Hoenn');
        expect(state.regions['Hoenn'].currentRoute).toBe('Route 101');
        expect(state.regions['Hoenn'].stats.activeChallenges).toContain('Route 101');
        expect(state.stats.activeChallenges).toContain('Route 101'); // Check that it was mounted
    });

    it('should unpack and mount an existing region from state.regions', () => {
        // Simulate playing in Johto, then going back to Kanto, then back to Johto
        swapRegion('Johto');
        state.trainer.money = 999;

        swapRegion('Kanto');
        expect(state.trainer.money).toBe(0); // Back to Kanto, which had 0

        swapRegion('Johto');
        expect(state.trainer.money).toBe(999); // Johto was packed and unpacked correctly
    });

    it('should perform deep copy during packing so mutations to active state do not affect packed state', () => {
        state.trainer.money = 500;
        state.party.push({ name: 'Pikachu' });

        swapRegion('Johto');

        // Mutate Johto's state (which is currently active in root `state`)
        state.trainer.money = 200;
        state.party.push({ name: 'Chikorita' });

        // Ensure Kanto packed state was unaffected by mutations in Johto state
        expect(state.regions['Kanto'].trainer.money).toBe(500);
        expect(state.regions['Kanto'].party).toHaveLength(1);
        expect(state.regions['Kanto'].party[0].name).toBe('Pikachu');
    });

    it('should safely pack and unpack all properties defined in REGION_TEMPLATE', () => {
        // Set unique values in Kanto for all root template keys
        // Keep in mind state properties might have been modified directly, so check specific keys.
        state.trainer = { money: 999, badges: 999, tokens: 999 };
        state.party = [{ name: 'Test' }];
        state.currentRoute = 'Route 99';

        swapRegion('Johto');

        // Check Johto initialized cleanly
        expect(state.trainer.money).toBe(0);
        expect(state.party).toEqual([]);
        expect(state.currentRoute).toBe('Route 29'); // Johto specific

        swapRegion('Kanto');

        // Check Kanto restored correctly
        expect(state.trainer).toEqual({ money: 999, badges: 999, tokens: 999 });
        expect(state.party).toEqual([{ name: 'Test' }]);
        expect(state.currentRoute).toBe('Route 99');
    });
});

describe('window.getCurrentRoutes', () => {
    beforeEach(() => {
        state.config = {};
        state.currentRegionName = 'Kanto';
    });

    it('should return empty array if state.config is null or missing', () => {
        state.config = null;
        expect(window.getCurrentRoutes()).toEqual([]);
    });

    it('should return johtoRoutes for Johto', () => {
        state.currentRegionName = 'Johto';
        state.config.johtoRoutes = [{ areaId: 'Johto1' }];
        expect(window.getCurrentRoutes()).toEqual([{ areaId: 'Johto1' }]);
    });

    it('should return hoennRoutes for Hoenn', () => {
        state.currentRegionName = 'Hoenn';
        state.config.hoennRoutes = [{ areaId: 'Hoenn1' }];
        expect(window.getCurrentRoutes()).toEqual([{ areaId: 'Hoenn1' }]);
    });

    it('should return sinnohRoutes for Sinnoh', () => {
        state.currentRegionName = 'Sinnoh';
        state.config.sinnohRoutes = [{ areaId: 'Sinnoh1' }];
        expect(window.getCurrentRoutes()).toEqual([{ areaId: 'Sinnoh1' }]);
    });

    it('should return unovaRoutes for Unova', () => {
        state.currentRegionName = 'Unova';
        state.config.unovaRoutes = [{ areaId: 'Unova1' }];
        expect(window.getCurrentRoutes()).toEqual([{ areaId: 'Unova1' }]);
    });

    it('should fall back to state.config.routes', () => {
        state.currentRegionName = 'Kanto';
        state.config.routes = [{ areaId: 'Kanto1' }];
        expect(window.getCurrentRoutes()).toEqual([{ areaId: 'Kanto1' }]);
    });

    it('should return empty array if no routes match', () => {
        state.currentRegionName = 'Kalos';
        expect(window.getCurrentRoutes()).toEqual([]);
    });
});

describe('window.getCurrentUnlocks', () => {
    beforeEach(() => {
        state.config = {};
        state.currentRegionName = 'Kanto';
    });

    it('should return empty array if state.config is null or missing', () => {
        state.config = null;
        expect(window.getCurrentUnlocks()).toEqual([]);
    });

    it('should return johtoUnlocks for Johto', () => {
        state.currentRegionName = 'Johto';
        state.config.johtoUnlocks = [{ id: 'JohtoUnlock1' }];
        expect(window.getCurrentUnlocks()).toEqual([{ id: 'JohtoUnlock1' }]);
    });

    it('should return hoennUnlocks for Hoenn', () => {
        state.currentRegionName = 'Hoenn';
        state.config.hoennUnlocks = [{ id: 'HoennUnlock1' }];
        expect(window.getCurrentUnlocks()).toEqual([{ id: 'HoennUnlock1' }]);
    });

    it('should return sinnohUnlocks for Sinnoh', () => {
        state.currentRegionName = 'Sinnoh';
        state.config.sinnohUnlocks = [{ id: 'SinnohUnlock1' }];
        expect(window.getCurrentUnlocks()).toEqual([{ id: 'SinnohUnlock1' }]);
    });

    it('should return unovaUnlocks for Unova', () => {
        state.currentRegionName = 'Unova';
        state.config.unovaUnlocks = [{ id: 'UnovaUnlock1' }];
        expect(window.getCurrentUnlocks()).toEqual([{ id: 'UnovaUnlock1' }]);
    });

    it('should fall back to state.config.unlocks', () => {
        state.currentRegionName = 'Kanto';
        state.config.unlocks = [{ id: 'KantoUnlock1' }];
        expect(window.getCurrentUnlocks()).toEqual([{ id: 'KantoUnlock1' }]);
    });

    it('should return empty array if no unlocks match', () => {
        state.currentRegionName = 'Kalos';
        expect(window.getCurrentUnlocks()).toEqual([]);
    });
});

describe('checkFinalChallengeCompleted config route fallbacks', () => {
    beforeEach(() => {
        state.config = {};
        state.currentRegionName = "Kanto";
        state.stats = JSON.parse(JSON.stringify(REGION_TEMPLATE.stats));
        state.regions = {};
    });

    it('should use hoennRoutes for Hoenn if provided in config', () => {
        swapRegion('Hoenn');
        state.config.hoennRoutes = [
            { challengeName: 'Final Challenge', areaId: 'Hoenn Custom Final' }
        ];
        state.stats.completedChallengeIds = ['Hoenn Custom Final'];
        expect(checkFinalChallengeCompleted('Hoenn')).toBe(true);
    });

    it('should use sinnohRoutes for Sinnoh if provided in config', () => {
        swapRegion('Sinnoh');
        state.config.sinnohRoutes = [
            { challengeName: 'Final Challenge', areaId: 'Sinnoh Custom Final' }
        ];
        state.stats.completedChallengeIds = ['Sinnoh Custom Final'];
        expect(checkFinalChallengeCompleted('Sinnoh')).toBe(true);
    });

    it('should use unovaRoutes for Unova if provided in config', () => {
        swapRegion('Unova');
        state.config.unovaRoutes = [
            { challengeName: 'Final Challenge', areaId: 'Unova Custom Final' }
        ];
        state.stats.completedChallengeIds = ['Unova Custom Final'];
        expect(checkFinalChallengeCompleted('Unova')).toBe(true);
    });
});
