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
});

describe('window.getCurrentRoutes', () => {
    beforeEach(() => {
        state.currentRegionName = "Kanto";
        state.config = {
            routes: ['KantoRoute'],
            johtoRoutes: ['JohtoRoute'],
            hoennRoutes: ['HoennRoute'],
            sinnohRoutes: ['SinnohRoute'],
            unovaRoutes: ['UnovaRoute']
        };
    });

    afterEach(() => {
        state.config = {};
    });

    it('should return empty array if state.config is missing', () => {
        state.config = undefined;
        expect(window.getCurrentRoutes()).toEqual([]);
    });

    it('should return config.routes as fallback', () => {
        expect(window.getCurrentRoutes()).toEqual(['KantoRoute']);
    });

    it('should return johtoRoutes for Johto', () => {
        state.currentRegionName = 'Johto';
        expect(window.getCurrentRoutes()).toEqual(['JohtoRoute']);
    });

    it('should return hoennRoutes for Hoenn', () => {
        state.currentRegionName = 'Hoenn';
        expect(window.getCurrentRoutes()).toEqual(['HoennRoute']);
    });

    it('should return sinnohRoutes for Sinnoh', () => {
        state.currentRegionName = 'Sinnoh';
        expect(window.getCurrentRoutes()).toEqual(['SinnohRoute']);
    });

    it('should return unovaRoutes for Unova', () => {
        state.currentRegionName = 'Unova';
        expect(window.getCurrentRoutes()).toEqual(['UnovaRoute']);
    });

    it('should return fallback if region routes missing', () => {
        state.currentRegionName = 'Unova';
        state.config.unovaRoutes = undefined;
        expect(window.getCurrentRoutes()).toEqual(['KantoRoute']);
    });
});

describe('window.getCurrentUnlocks', () => {
    beforeEach(() => {
        state.currentRegionName = "Kanto";
        state.config = {
            unlocks: ['KantoUnlock'],
            johtoUnlocks: ['JohtoUnlock'],
            hoennUnlocks: ['HoennUnlock'],
            sinnohUnlocks: ['SinnohUnlock'],
            unovaUnlocks: ['UnovaUnlock']
        };
    });

    afterEach(() => {
        state.config = {};
    });

    it('should return empty array if state.config is missing', () => {
        state.config = undefined;
        expect(window.getCurrentUnlocks()).toEqual([]);
    });

    it('should return config.unlocks as fallback', () => {
        expect(window.getCurrentUnlocks()).toEqual(['KantoUnlock']);
    });

    it('should return johtoUnlocks for Johto', () => {
        state.currentRegionName = 'Johto';
        expect(window.getCurrentUnlocks()).toEqual(['JohtoUnlock']);
    });

    it('should return hoennUnlocks for Hoenn', () => {
        state.currentRegionName = 'Hoenn';
        expect(window.getCurrentUnlocks()).toEqual(['HoennUnlock']);
    });

    it('should return sinnohUnlocks for Sinnoh', () => {
        state.currentRegionName = 'Sinnoh';
        expect(window.getCurrentUnlocks()).toEqual(['SinnohUnlock']);
    });

    it('should return unovaUnlocks for Unova', () => {
        state.currentRegionName = 'Unova';
        expect(window.getCurrentUnlocks()).toEqual(['UnovaUnlock']);
    });

    it('should return fallback if region unlocks missing', () => {
        state.currentRegionName = 'Unova';
        state.config.unovaUnlocks = undefined;
        expect(window.getCurrentUnlocks()).toEqual(['KantoUnlock']);
    });
});

describe('checkFinalChallengeCompleted additional tests', () => {
    beforeEach(() => {
        state.currentRegionName = "Kanto";
        state.stats = JSON.parse(JSON.stringify(REGION_TEMPLATE.stats));
        state.regions = {};
        state.config = {};
    });

    it('should use hoennRoutes when checking Hoenn final challenge', () => {
        state.config.hoennRoutes = [
            { challengeName: 'Final Challenge', areaId: 'Hoenn Custom Final' }
        ];
        state.currentRegionName = "Hoenn";
        state.stats.completedChallengeIds = ['Hoenn Custom Final'];
        expect(checkFinalChallengeCompleted('Hoenn')).toBe(true);
    });

    it('should use sinnohRoutes when checking Sinnoh final challenge', () => {
        state.config.sinnohRoutes = [
            { challengeName: 'Final Challenge', areaId: 'Sinnoh Custom Final' }
        ];
        state.currentRegionName = "Sinnoh";
        state.stats.completedChallengeIds = ['Sinnoh Custom Final'];
        expect(checkFinalChallengeCompleted('Sinnoh')).toBe(true);
    });

    it('should use unovaRoutes when checking Unova final challenge', () => {
        state.config.unovaRoutes = [
            { challengeName: 'Final Challenge', areaId: 'Unova Custom Final' }
        ];
        state.currentRegionName = "Unova";
        state.stats.completedChallengeIds = ['Unova Custom Final'];
        expect(checkFinalChallengeCompleted('Unova')).toBe(true);
    });
});
