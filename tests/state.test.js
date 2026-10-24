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
