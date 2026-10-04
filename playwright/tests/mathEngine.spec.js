const { test, expect } = require('@playwright/test');
const mathEngine = require('../../src/mathEngine.js');

test.describe('mathEngine', () => {

    test.describe('calculateHP', () => {
        test('calculates basic HP correctly without vitamins', () => {
            const hp = mathEngine.calculateHP(45, 31, 50, 1.0);
            expect(hp).toBe(120);
        });

        test('calculates HP correctly with vitamins', () => {
            const hp = mathEngine.calculateHP(45, 31, 50, 1.0, 20);
            expect(hp).toBe(144);
        });

        test('calculates HP correctly with quality multiplier', () => {
            const hp = mathEngine.calculateHP(45, 31, 50, 1.2);
            expect(hp).toBe(144);
        });

        test('calculates HP correctly at level 100', () => {
            const hp = mathEngine.calculateHP(100, 31, 100, 1.0);
            expect(hp).toBe(341);
        });
    });

    test.describe('calculateStat', () => {
        test('calculates basic stat correctly without vitamins', () => {
            const stat = mathEngine.calculateStat(49, 31, 50, 1.0);
            expect(stat).toBe(69);
        });

        test('calculates stat correctly with vitamins', () => {
            const stat = mathEngine.calculateStat(49, 31, 50, 1.0, 20);
            expect(stat).toBe(82);
        });

        test('calculates stat correctly with quality multiplier', () => {
            const stat = mathEngine.calculateStat(49, 31, 50, 1.5);
            expect(stat).toBe(104);
        });

        test('calculates stat correctly at level 100', () => {
            const stat = mathEngine.calculateStat(100, 31, 100, 1.0);
            expect(stat).toBe(236);
        });
    });

    test.describe('XP calculations', () => {
        test('calculateReqXP calculates required XP for a given level', () => {
            expect(mathEngine.calculateReqXP(1)).toBe(52);
            expect(mathEngine.calculateReqXP(2)).toBe(90);
            expect(mathEngine.calculateReqXP(50)).toBe(67885);
            expect(mathEngine.calculateReqXP(100)).toBe(409038);
        });

        test('calculateTotalXP calculates cumulative XP up to a level', () => {
            expect(mathEngine.calculateTotalXP(1)).toBe(0);
            expect(mathEngine.calculateTotalXP(2)).toBe(mathEngine.calculateReqXP(1));
            expect(mathEngine.calculateTotalXP(3)).toBe(mathEngine.calculateReqXP(1) + mathEngine.calculateReqXP(2));
            expect(mathEngine.calculateTotalXP(100)).toBe(11187635);
        });

        test('getLevelFromXP determines the correct level based on XP', () => {
            expect(mathEngine.getLevelFromXP(0)).toBe(1);
            expect(mathEngine.getLevelFromXP(51)).toBe(1);
            expect(mathEngine.getLevelFromXP(52)).toBe(2);
            expect(mathEngine.getLevelFromXP(100)).toBe(2);
            expect(mathEngine.getLevelFromXP(142)).toBe(3); // 52 + 90
            expect(mathEngine.getLevelFromXP(11187635)).toBe(100);
        });
    });

    test.describe('Derived Stats Calculations', () => {
        test('calculateEVXP calculates correctly', () => {
            expect(mathEngine.calculateEVXP(300, 10, 1.0, 300)).toBe(78);
            expect(mathEngine.calculateEVXP(10, 1, 0.5, 0)).toBe(1); // minimum 1
        });

        test('calculateEVM calculates correctly', () => {
            const evm = mathEngine.calculateEVM(300, 10, 1.2, 300);
            expect(evm).toBeGreaterThan(0);
        });

        test('calculatePP calculates correctly', () => {
            const pp = mathEngine.calculatePP(300, 50, 1.4, 450);
            expect(pp).toBe(50);
            expect(mathEngine.calculatePP(100, 1, 0.8, 100)).toBe(1); // minimum 1
        });
    });

    test.describe('Battle Calculations', () => {
        test('calculateDamage returns expected structure and values', () => {
            const result = mathEngine.calculateDamage(50, 90, 100, 100, 1.0, 1.0);
            expect(result).toHaveProperty('damage');
            expect(result).toHaveProperty('isCritical');
            expect(result).toHaveProperty('effectiveness');
            expect(result.damage).toBeGreaterThanOrEqual(1);
            expect(result.effectiveness).toBe(1.0);
        });

        test('calculateCatchChance calculates base chance correctly', () => {
            const chance = mathEngine.calculateCatchChance(300, 10, 1.0, 300, 1.0);
            expect(chance).toBeGreaterThan(0);
            expect(chance).toBeLessThanOrEqual(100);
        });

        test('calculateCatchChance returns 100 for masterball', () => {
            expect(mathEngine.calculateCatchChance(600, 100, 2.0, 600, 10)).toBe(100);
        });

        test('calculateCatchChance applies shiny multiplier', () => {
            const normalChance = mathEngine.calculateCatchChance(300, 10, 1.0, 300, 1.0, { shinySeenTaskTier: 3 }, false);
            const shinyChance = mathEngine.calculateCatchChance(300, 10, 1.0, 300, 1.0, { shinySeenTaskTier: 3 }, true);
            expect(shinyChance).toBeGreaterThan(normalChance);
        });
    });

    test.describe('Random Generation', () => {
        test('generateQuality generates expected structure', () => {
            const quality = mathEngine.generateQuality();
            expect(quality).toHaveProperty('name');
            expect(quality).toHaveProperty('q');
            expect(quality.q).toBeGreaterThanOrEqual(0.8);
            expect(quality.q).toBeLessThanOrEqual(2.0);
        });

        test('generateQuality correctly applies bonuses', () => {
            const q = mathEngine.generateQuality({ qTaskTier: 5 });
            expect(q.q).toBeGreaterThanOrEqual(0.8);
        });

        test('generateIVs distributes stats properly', () => {
            const ivs = mathEngine.generateIVs();
            expect(ivs).toHaveProperty('hp');
            expect(ivs).toHaveProperty('atk');
            expect(ivs).toHaveProperty('def');
            expect(ivs).toHaveProperty('spa');
            expect(ivs).toHaveProperty('spd');
            expect(ivs).toHaveProperty('spe');

            const sum = ivs.hp + ivs.atk + ivs.def + ivs.spa + ivs.spd + ivs.spe;
            expect(sum).toBeGreaterThanOrEqual(6);
            expect(sum).toBeLessThanOrEqual(600);
        });

        test('generateIVs respects 100 cap per stat', () => {
            const ivs = mathEngine.generateIVs({ ivTaskTier: 5, shinyCaughtTaskTier: 1 }, true);
            expect(ivs.hp).toBeLessThanOrEqual(100);
            expect(ivs.atk).toBeLessThanOrEqual(100);
            expect(ivs.def).toBeLessThanOrEqual(100);
            expect(ivs.spa).toBeLessThanOrEqual(100);
            expect(ivs.spd).toBeLessThanOrEqual(100);
            expect(ivs.spe).toBeLessThanOrEqual(100);
        });
    });

    test.describe('Capacity Functions', () => {
        const mockState = {
            config: {
                balance: {
                    expansions: {
                        ballPocket: [{ increment: 10 }, { increment: 10 }],
                        potionSatchel: [{ increment: 5 }],
                        pokemonBox: [{ increment: 20 }]
                    }
                }
            },
            stats: {
                upgrades: {
                    ballsTier: 1,
                    potionsTier: 0,
                    boxTier: 1
                }
            },
            backpack: {
                pokeballs: {
                    Pokeball: 10,
                    Greatball: 5,
                    Masterball: 1
                },
                potions: {
                    Potion: 5,
                    SuperPotion: 2
                }
            },
            party: [{}],
            storage: [{}, {}],
            safe: [],
            breeding: [{}],
            training: []
        };

        test('getCapacity returns base + expansion capacity', () => {
            expect(mathEngine.getCapacity(mockState, 'balls')).toBe(110);
            expect(mathEngine.getCapacity(mockState, 'potions')).toBe(20);
            expect(mathEngine.getCapacity(mockState, 'box')).toBe(40);
        });

        test('getCurrentCount ignores Masterballs in pokeball count', () => {
            expect(mathEngine.getCurrentCount(mockState, 'balls')).toBe(15);
        });

        test('getCurrentCount calculates potion count', () => {
            expect(mathEngine.getCurrentCount(mockState, 'potions')).toBe(7);
        });

        test('getCurrentCount sums all box lengths', () => {
            expect(mathEngine.getCurrentCount(mockState, 'box')).toBe(4);
        });
    });
});
