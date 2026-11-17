import {
    ZZZ_CONFIG,
    calculateZzZSimulationParams,
    consumeZzZGrains,
    formatZzZDuration,
    summarizeZzZResults,
    buildZzZResultsModalHtml,
    buildZzZWakeUpModalHtml,
} from '../../src/ui/zzz.js';

describe('ZzZ Mode Logic & Results Summary', () => {
    test('ZZZ_CONFIG defaults to grain-based mode (1 grain = 1 min)', () => {
        expect(ZZZ_CONFIG.useGrainBased).toBe(true);
        expect(ZZZ_CONFIG.msPerGrain).toBe(60 * 1000);
    });

    describe('calculateZzZSimulationParams', () => {
        test('returns fixed 1h duration when grain-based mode is disabled', () => {
            const state = { zzzTimestamp: 1000, stats: { jigglypuffGrains: 5 } };
            const params = calculateZzZSimulationParams(state, 5000, {
                useGrainBased: false,
                fixedHuntDurationMs: 3600000,
                msPerGrain: 60000,
            });
            expect(params).toEqual({
                timeElapsedMs: 3600000,
                maxTimeMs: 3600000,
                availableGrains: 5,
                useGrainBased: false,
            });
        });

        test('caps elapsed time by available grains when grain-based mode is enabled', () => {
            const state = { zzzTimestamp: 0, stats: { jigglypuffGrains: 10 } };
            const params = calculateZzZSimulationParams(state, 20 * 60000, {
                useGrainBased: true,
                fixedHuntDurationMs: 3600000,
                msPerGrain: 60000,
            });
            expect(params.timeElapsedMs).toBe(10 * 60000);
            expect(params.maxTimeMs).toBe(10 * 60000);
            expect(params.useGrainBased).toBe(true);
        });

        test('clamps negative elapsed time to 0 when system clock moves backwards', () => {
            const state = { zzzTimestamp: 50000, stats: { jigglypuffGrains: 10 } };
            const params = calculateZzZSimulationParams(state, 10000, {
                useGrainBased: true,
                fixedHuntDurationMs: 3600000,
                msPerGrain: 60000,
            });
            expect(params.timeElapsedMs).toBe(0);
        });
    });

    describe('consumeZzZGrains', () => {
        test('does not deduct grains when grain-based mode is disabled', () => {
            const state = { stats: { jigglypuffGrains: 15, jigglypuffGrainsUsed: 2 } };
            const res = consumeZzZGrains(state, 3600000, 3600000, 15, {
                useGrainBased: false,
                msPerGrain: 60000,
            });
            expect(res).toEqual({ consumedGrains: 0, sleepMinutes: 60 });
            expect(state.stats.jigglypuffGrains).toBe(15);
            expect(state.stats.jigglypuffGrainsUsed).toBe(2);
        });

        test('deducts grains proportionally when grain-based mode is enabled', () => {
            const state = { stats: { jigglypuffGrains: 15, jigglypuffGrainsUsed: 2 } };
            const res = consumeZzZGrains(state, 125000, 900000, 15, {
                useGrainBased: true,
                msPerGrain: 60000,
            });
            expect(res).toEqual({ consumedGrains: 3, sleepMinutes: 2 });
            expect(state.stats.jigglypuffGrains).toBe(12);
            expect(state.stats.jigglypuffGrainsUsed).toBe(5);
        });
    });

    describe('formatZzZDuration', () => {
        test('formats durations cleanly across units', () => {
            expect(formatZzZDuration(0)).toBe('0s');
            expect(formatZzZDuration(45000)).toBe('45s');
            expect(formatZzZDuration(125000)).toBe('2m 5s');
            expect(formatZzZDuration(3600000)).toBe('1h 0m 0s');
            expect(formatZzZDuration(90061000)).toBe('1d 1h 1m 1s');
        });
    });

    describe('summarizeZzZResults & buildZzZResultsModalHtml', () => {
        const mockState = {
            currentRoute: 'Route 22 (Kanto)',
            settings: { activeBallTier: 0, activePotionTier: 1 },
            config: {
                balance: {
                    items: {
                        pokeballs: [{ name: 'Pokeball', price: 200 }],
                        potions: [{ name: 'Tiny Potion', price: 100 }, { name: 'Big', price: 500 }],
                    },
                },
            },
        };

        test('reads results.money accurately (no NaN) and aggregates loot, qualities, and rates', () => {
            const results = {
                money: 12500,
                xpEarned: 4800,
                encounters: 120,
                caught: 60,
                shinies: 1,
                shinyEncounters: 2,
                ballsUsed: 65,
                potionsUsed: 8,
                whiteCandiesEarned: 2,
                partyFaints: 1,
                simulatedTimeMs: 3600000,
                itemsLooted: { 'Fire Stone': 1, 'HP Up': 2, Pokeball: 4 },
                itemsMissed: { 'Big': 3 },
                caughtPokemonList: [
                    { name: 'Rattata', level: 5, qualityName: 'Regular', quality: 1.0, ivs: { hp: 50, atk: 50, def: 50, spa: 50, spd: 50, spe: 50 } },
                    { name: 'Mankey', level: 8, qualityName: 'Shiny', quality: 2.0, ivs: { hp: 80, atk: 90, def: 70, spa: 60, spd: 60, spe: 90 } },
                ],
            };

            const summary = summarizeZzZResults(results, mockState, 3600000, ZZZ_CONFIG);

            expect(summary.routeName).toBe('Route 22');
            expect(summary.durationStr).toBe('1h 0m 0s');
            expect(summary.moneyEarned).toBe(12500);
            expect(summary.moneyPerHour).toBe(12500);
            expect(summary.xpEarned).toBe(4800);
            expect(summary.catchRatePct).toBe(50);
            expect(summary.encountersPerMin).toBe('2.0');
            expect(summary.qualityBreakdown).toEqual({ Regular: 1, Shiny: 1 });
            expect(summary.topCatch.name).toBe('Mankey');
            expect(summary.lootedItems).toHaveLength(4); // White Candy + 3 itemsLooted
            expect(summary.missedItems).toEqual([{ name: 'Big Potion', count: 3 }]);
            expect(summary.status).toEqual({ type: 'warning', icon: '✨', text: 'Farm Stopped: Jigglypuff Dust ended' });

            const html = buildZzZResultsModalHtml(summary, mockState);
            expect(html).not.toContain('NaN');
            expect(html).not.toContain('undefined');
            expect(html).toContain('Farm Stopped: Jigglypuff Dust ended');
            expect(html).toContain('Mankey');
            expect(html).toContain('White Candy');
            expect(html).toContain('Fire Stone');
            expect(html).toContain('3× Big Potion');
            expect(html).toContain('65× Pokeball');
            expect(html).toContain('8× Big Potion');
        });

        test('reports fainted status banner when party wipes', () => {
            const summary = summarizeZzZResults(
                { fainted: true, money: 100, xpEarned: 50, simulatedTimeMs: 60000 },
                mockState,
                3600000,
                ZZZ_CONFIG
            );
            expect(summary.status).toEqual({ type: 'error', icon: '❌', text: 'Farm Stopped: Party Fainted' });
        });
    });

    describe('buildZzZWakeUpModalHtml', () => {
        test('renders region name, route, hunt info, and action buttons', () => {
            const now = Date.now();
            const html = buildZzZWakeUpModalHtml('Johto', {
                currentRegionName: 'Kanto',
                regions: {
                    Johto: {
                        currentRoute: 'Route 29 (Johto)',
                        zzzTimestamp: now - 5 * 60000,
                        stats: { jigglypuffGrains: 10 },
                    },
                },
            }, ZZZ_CONFIG);

            expect(html).toContain('Sleeping in Johto');
            expect(html).toContain('Route 29');
            expect(html).toContain('5m 0s elapsed');
            expect(html).toContain('btn-zzz-wakeup-yes');
            expect(html).toContain('btn-zzz-wakeup-no');
        });
    });
});
