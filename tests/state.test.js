import { checkFinalChallengeCompleted, state, swapRegion, REGION_TEMPLATE } from '../src/state.js';

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
