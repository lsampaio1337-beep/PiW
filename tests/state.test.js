import {
    state,
    REGION_TEMPLATE,
    setBattleSystem,
    globals,
    checkFinalChallengeCompleted,
    swapRegion
} from '../src/state.js';

describe('state.js', () => {

    // Backup original state to reset after tests if needed, though we can just reset specific fields
    beforeEach(() => {
        // Reset state properties to default for isolation
        for (let key in REGION_TEMPLATE) {
            state[key] = JSON.parse(JSON.stringify(REGION_TEMPLATE[key]));
        }
        state.currentRoute = "Route 1";
        state.currentRegionName = "Kanto";
        state.regions = {};
        state.config = {};
        globals.battleSystem = null;
    });

    describe('setBattleSystem', () => {
        it('should set globals.battleSystem to the provided system', () => {
            const mockSystem = { id: 'mock-system' };
            setBattleSystem(mockSystem);
            expect(globals.battleSystem).toBe(mockSystem);
        });
    });

    describe('checkFinalChallengeCompleted', () => {
        it('should return false if stats or completedChallengeIds are missing', () => {
            state.stats = null;
            expect(checkFinalChallengeCompleted('Kanto')).toBe(false);
        });

        it('should return true if final challenge is completed for Kanto (default)', () => {
            state.stats.completedChallengeIds = ['Kanto Pokemon League'];
            expect(checkFinalChallengeCompleted('Kanto')).toBe(true);
        });

        it('should return false if final challenge is not completed for Kanto', () => {
            state.stats.completedChallengeIds = ['Route 1'];
            expect(checkFinalChallengeCompleted('Kanto')).toBe(false);
        });

        it('should check final challenge from config routes if available', () => {
            state.config = {
                routes: [
                    { challengeName: "Final Challenge", areaId: "Custom League" }
                ]
            };
            state.stats.completedChallengeIds = ['Custom League'];
            expect(checkFinalChallengeCompleted('Kanto')).toBe(true);
        });

        it('should check Johto fallback final challenge', () => {
            state.regions['Johto'] = {
                stats: { completedChallengeIds: ['Mount Silver'] }
            };
            expect(checkFinalChallengeCompleted('Johto')).toBe(true);
        });

        it('should check Hoenn config routes', () => {
            state.config = {
                hoennRoutes: [
                    { challengeName: "Final Challenge", areaId: "Hoenn Custom League" }
                ]
            };
            state.regions['Hoenn'] = {
                stats: { completedChallengeIds: ['Hoenn Custom League'] }
            };
            expect(checkFinalChallengeCompleted('Hoenn')).toBe(true);
        });
    });

    describe('swapRegion', () => {
        it('should not swap if newRegionName is the same as currentRegionName', () => {
            state.currentRegionName = 'Kanto';
            state.stats.battlesWon = 10;
            swapRegion('Kanto');
            expect(state.stats.battlesWon).toBe(10);
            expect(state.regions['Kanto']).toBeUndefined(); // Didn't pack
        });

        it('should pack current region and unpack new region', () => {
            state.currentRegionName = 'Kanto';
            state.stats.battlesWon = 99;

            swapRegion('Johto');

            // Kanto should be packed
            expect(state.regions['Kanto'].stats.battlesWon).toBe(99);

            // Johto should be initialized with Johto defaults
            expect(state.currentRegionName).toBe('Johto');
            expect(state.currentRoute).toBe('Route 29');
            expect(state.stats.activeChallenges).toContain('Route 29');
            expect(state.stats.battlesWon).toBe(0); // From template
        });

        it('should initialize Hoenn with specific starting routes', () => {
            swapRegion('Hoenn');
            expect(state.currentRegionName).toBe('Hoenn');
            expect(state.currentRoute).toBe('Route 101');
            expect(state.stats.activeChallenges).toContain('Route 101');
        });

        it('should initialize Sinnoh with template defaults', () => {
            swapRegion('Sinnoh');
            expect(state.currentRegionName).toBe('Sinnoh');
            expect(state.currentRoute).toBe('Route 1'); // Template default
            expect(state.stats.activeChallenges).toContain('Route 1'); // Template default
        });

        it('should restore previously packed region', () => {
            // Setup Johto
            swapRegion('Johto');
            state.stats.battlesWon = 50; // Modify Johto

            // Swap to Kanto
            swapRegion('Kanto');
            expect(state.stats.battlesWon).toBe(0); // Back to Kanto default

            // Swap back to Johto
            swapRegion('Johto');
            expect(state.stats.battlesWon).toBe(50); // Restored Johto state
        });
    });

    describe('window.getCurrentRoutes', () => {
        it('should return empty array if state.config is missing', () => {
            state.config = null;
            expect(window.getCurrentRoutes()).toEqual([]);
        });

        it('should return config.routes by default', () => {
            state.config = { routes: ['route1'] };
            expect(window.getCurrentRoutes()).toEqual(['route1']);
        });

        it('should return johtoRoutes if in Johto', () => {
            state.currentRegionName = 'Johto';
            state.config = { johtoRoutes: ['johtoRoute1'] };
            expect(window.getCurrentRoutes()).toEqual(['johtoRoute1']);
        });

        it('should return hoennRoutes if in Hoenn', () => {
            state.currentRegionName = 'Hoenn';
            state.config = { hoennRoutes: ['hoennRoute1'] };
            expect(window.getCurrentRoutes()).toEqual(['hoennRoute1']);
        });

        it('should return sinnohRoutes if in Sinnoh', () => {
            state.currentRegionName = 'Sinnoh';
            state.config = { sinnohRoutes: ['sinnohRoute1'] };
            expect(window.getCurrentRoutes()).toEqual(['sinnohRoute1']);
        });

        it('should return unovaRoutes if in Unova', () => {
            state.currentRegionName = 'Unova';
            state.config = { unovaRoutes: ['unovaRoute1'] };
            expect(window.getCurrentRoutes()).toEqual(['unovaRoute1']);
        });

        it('should return empty array if config routes are not defined', () => {
            state.config = {};
            expect(window.getCurrentRoutes()).toEqual([]);
        });
    });

    describe('window.getCurrentUnlocks', () => {
        it('should return empty array if state.config is missing', () => {
            state.config = null;
            expect(window.getCurrentUnlocks()).toEqual([]);
        });

        it('should return config.unlocks by default', () => {
            state.config = { unlocks: ['unlock1'] };
            expect(window.getCurrentUnlocks()).toEqual(['unlock1']);
        });

        it('should return johtoUnlocks if in Johto', () => {
            state.currentRegionName = 'Johto';
            state.config = { johtoUnlocks: ['johtoUnlock1'] };
            expect(window.getCurrentUnlocks()).toEqual(['johtoUnlock1']);
        });

        it('should return hoennUnlocks if in Hoenn', () => {
            state.currentRegionName = 'Hoenn';
            state.config = { hoennUnlocks: ['hoennUnlock1'] };
            expect(window.getCurrentUnlocks()).toEqual(['hoennUnlock1']);
        });

        it('should return sinnohUnlocks if in Sinnoh', () => {
            state.currentRegionName = 'Sinnoh';
            state.config = { sinnohUnlocks: ['sinnohUnlock1'] };
            expect(window.getCurrentUnlocks()).toEqual(['sinnohUnlock1']);
        });

        it('should return unovaUnlocks if in Unova', () => {
            state.currentRegionName = 'Unova';
            state.config = { unovaUnlocks: ['unovaUnlock1'] };
            expect(window.getCurrentUnlocks()).toEqual(['unovaUnlock1']);
        });

        it('should return empty array if config unlocks are not defined', () => {
            state.config = {};
            expect(window.getCurrentUnlocks()).toEqual([]);
        });
    });
});
