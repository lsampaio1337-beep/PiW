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

test.describe('calculateDamage', () => {
    let originalRandom;

    test.beforeAll(() => {
        originalRandom = Math.random;
    });

    test.afterAll(() => {
        Math.random = originalRandom;
    });

    test('should calculate correct base damage without critical hit and min variance', () => {
        let callCount = 0;
        Math.random = () => {
            callCount++;
            if (callCount === 1) return 0.5; // > 0.04 -> not critical
            if (callCount === 2) return 0;   // randomMult = 0.85 + 0 = 0.85
            return 0.5;
        };

        // level=100, power=100, attack=100, def=100, typeEffectiveness=1.0, quality=1.0
        // baseDamage = floor( (105 / 125) * (10000 / 100) + 2 ) = 86
        // modifier = 1.0 * 1.0 * 0.85 = 0.85
        // damage = floor(86 * 0.85) = 73
        const result = mathEngine.calculateDamage(100, 100, 100, 100, 1.0, 1.0);
        expect(result.damage).toBe(73);
        expect(result.isCritical).toBe(false);
        expect(result.effectiveness).toBe(1.0);
    });

    test('should calculate correct base damage with critical hit and max variance', () => {
        let callCount = 0;
        Math.random = () => {
            callCount++;
            if (callCount === 1) return 0.01; // < 0.04 -> critical
            if (callCount === 2) return 1.0;  // randomMult = 0.85 + 0.15 = 1.0
            return 0;
        };

        // baseDamage = 86
        // modifier = 1.0 * 1.5 * 1.0 = 1.5
        // damage = floor(86 * 1.5) = 129
        const result = mathEngine.calculateDamage(100, 100, 100, 100, 1.0, 1.0);
        expect(result.damage).toBe(129);
        expect(result.isCritical).toBe(true);
        expect(result.effectiveness).toBe(1.0);
    });

    test('should apply type effectiveness correctly', () => {
        let callCount = 0;
        Math.random = () => {
            callCount++;
            if (callCount === 1) return 0.5; // not critical
            if (callCount === 2) return 1.0; // max variance
            return 0;
        };

        // baseDamage = 86
        // typeEffectiveness = 2.0
        // modifier = 2.0 * 1.0 * 1.0 = 2.0
        // damage = floor(86 * 2.0) = 172
        const result = mathEngine.calculateDamage(100, 100, 100, 100, 2.0, 1.0);
        expect(result.damage).toBe(172);
        expect(result.isCritical).toBe(false);
        expect(result.effectiveness).toBe(2.0);
    });

    test('should enforce minimum damage of 1', () => {
        let callCount = 0;
        Math.random = () => {
            callCount++;
            if (callCount === 1) return 0.5; // not critical
            if (callCount === 2) return 0.0; // min variance
            return 0;
        };

        // level=1, power=10, attack=10, def=10000
        // baseDamage = floor((6/125) * (100/10000) + 2) = floor(0.048 * 0.01 + 2) = 2
        // typeEffectiveness = 0.0 (force modifier to 0)
        // damage = Math.max(1, floor(2 * 0)) = 1
        const result = mathEngine.calculateDamage(1, 10, 10, 10000, 0.0, 1.0);
        expect(result.damage).toBe(1);
        expect(result.isCritical).toBe(false);
        expect(result.effectiveness).toBe(0.0);
    });
});

test('calculateCatchChance masterball', () => {
    const chance = mathEngine.calculateCatchChance(500, 50, 1.0, 300, 10);
    expect(chance).toBe(100);
});

test('calculateCatchChance baseline', () => {
    // bst=146 (146/14.6 = 10)
    // level=40 (40/4.0 = 10)
    // quality=1.8 ((1.8-0.8)/1.0 = 1, *8 = 8)
    // totalIV=600 (600/600 = 1, *5 = 5)
    // baseChance = 74 - 10 - 10 - 8 - 5 = 41
    // chance = 41 * 1.0 = 41
    const chance = mathEngine.calculateCatchChance(146, 40, 1.8, 600, 1.0);
    expect(chance).toBeCloseTo(41, 1);
});

test('calculateCatchChance baseChance bounds', () => {
    // bst=730 (50), level=100 (25) -> 74 - 50 - 25 = -1
    // baseChance bounds to 1.
    // chance = 1 * 1.5 = 1.5
    const chance = mathEngine.calculateCatchChance(730, 100, 1.0, 300, 1.5);
    expect(chance).toBeCloseTo(1.5, 1);
});

test('calculateCatchChance task tier bonuses', () => {
    // baseline baseChance = 41
    // cTaskTier = 3 -> 15% bonus -> 41 * 1.15 = 47.15
    const chance = mathEngine.calculateCatchChance(146, 40, 1.8, 600, 1.0, { cTaskTier: 3 });
    expect(chance).toBeCloseTo(47.15, 2);

    // cTaskTier = 5 -> 25% bonus -> 41 * 1.25 = 51.25
    const chanceMax = mathEngine.calculateCatchChance(146, 40, 1.8, 600, 1.0, { cTaskTier: 5 });
    expect(chanceMax).toBeCloseTo(51.25, 2);
});

test('calculateCatchChance shiny multiplier', () => {
    // baseline baseChance = 41
    // shiny = true, shinySeenTaskTier = 3 -> shinyCatchMulti = 2 -> 82
    const chance = mathEngine.calculateCatchChance(146, 40, 1.8, 600, 1.0, { shinySeenTaskTier: 3 }, true);
    expect(chance).toBeCloseTo(82, 1);

    // shiny = true, shinySeenTaskTier = 2 -> shinyCatchMulti = 1 -> 41
    const chanceNoMulti = mathEngine.calculateCatchChance(146, 40, 1.8, 600, 1.0, { shinySeenTaskTier: 2 }, true);
    expect(chanceNoMulti).toBeCloseTo(41, 1);

    // shiny = false, shinySeenTaskTier = 3 -> shinyCatchMulti = 1 -> 41
    const chanceNotShiny = mathEngine.calculateCatchChance(146, 40, 1.8, 600, 1.0, { shinySeenTaskTier: 3 }, false);
    expect(chanceNotShiny).toBeCloseTo(41, 1);
});

test('calculateCatchChance candy bonus', () => {
    // baseline baseChance = 41
    // blackYellowCandies = 2 -> 1 + 0.2*2 = 1.4 -> 41 * 1.4 = 57.4
    const chance = mathEngine.calculateCatchChance(146, 40, 1.8, 600, 1.0, { blackYellowCandies: 2 });
    expect(chance).toBeCloseTo(57.4, 1);
});

test('calculateCatchChance final bounds', () => {
    // chance > 100 bounded to 100
    // baseChance = 74, multiplier = 2.0 -> chance = 148 -> 100
    const chanceMax = mathEngine.calculateCatchChance(0, 0, 0.8, 0, 2.0);
    expect(chanceMax).toBe(100);

    // chance < 1 bounded to 1
    // baseChance = 1, multiplier = 0.5 -> chance = 0.5 -> 1
    const chanceMin = mathEngine.calculateCatchChance(730, 100, 1.0, 300, 0.5);
    expect(chanceMin).toBe(1);
});

test('calculateHP base cases', () => {
    // Level 1: floor(((2 * 45 + 31) * 1 / 100 + 1 + 10) * 1.0) = floor((121 * 0.01) + 11) = floor(1.21 + 11) = 12
    expect(mathEngine.calculateHP(45, 31, 1, 1.0)).toBe(12);

    // Level 100: floor(((2 * 45 + 31) * 100 / 100 + 100 + 10) * 1.0) = floor((121 * 1) + 110) = 231
    expect(mathEngine.calculateHP(45, 31, 100, 1.0)).toBe(231);
});

test('calculateHP edge IVs', () => {
    // Level 50, 0 IVs: floor(((2 * 45 + 0) * 50 / 100 + 50 + 10) * 1.0) = floor((90 * 0.5) + 60) = floor(45 + 60) = 105
    expect(mathEngine.calculateHP(45, 0, 50, 1.0)).toBe(105);

    // Level 50, 31 IVs: floor(((2 * 45 + 31) * 50 / 100 + 50 + 10) * 1.0) = floor((121 * 0.5) + 60) = floor(60.5 + 60) = 120
    expect(mathEngine.calculateHP(45, 31, 50, 1.0)).toBe(120);
});

test('calculateHP with different quality multipliers', () => {
    // Level 50, Quality 0.8: floor(((2 * 45 + 31) * 50 / 100 + 50 + 10) * 0.8) = floor(120.5 * 0.8) = floor(96.4) = 96
    expect(mathEngine.calculateHP(45, 31, 50, 0.8)).toBe(96);

    // Level 50, Quality 1.5: floor(((2 * 45 + 31) * 50 / 100 + 50 + 10) * 1.5) = floor(120.5 * 1.5) = floor(180.75) = 180
    expect(mathEngine.calculateHP(45, 31, 50, 1.5)).toBe(180);
});

test('calculateStat base cases', () => {
    // stat = floor(((2 * 49 + 31) * 1 / 100) + 5) * 1.0) = floor((129 * 0.01) + 5) = floor(1.29 + 5) = 6
    expect(mathEngine.calculateStat(49, 31, 1, 1.0)).toBe(6);

    // stat = floor(((2 * 49 + 31) * 100 / 100) + 5) * 1.0) = floor(129 + 5) = 134
    expect(mathEngine.calculateStat(49, 31, 100, 1.0)).toBe(134);
});

test('calculateStat edge IVs', () => {
    // Level 50, 0 IVs: floor(((2 * 49 + 0) * 50 / 100) + 5) * 1.0) = floor(98 * 0.5 + 5) = floor(49 + 5) = 54
    expect(mathEngine.calculateStat(49, 0, 50, 1.0)).toBe(54);

    // Level 50, 31 IVs: floor(((2 * 49 + 31) * 50 / 100) + 5) * 1.0) = floor(129 * 0.5 + 5) = floor(64.5 + 5) = 69
    expect(mathEngine.calculateStat(49, 31, 50, 1.0)).toBe(69);
});

test('calculateStat with different quality multipliers', () => {
    // Level 50, Quality 0.8: floor(((2 * 49 + 31) * 50 / 100) + 5) * 0.8) = floor(69.5 * 0.8) = floor(55.6) = 55
    expect(mathEngine.calculateStat(49, 31, 50, 0.8)).toBe(55);

    // Level 50, Quality 1.5: floor(((2 * 49 + 31) * 50 / 100) + 5) * 1.5) = floor(69.5 * 1.5) = floor(104.25) = 104
    expect(mathEngine.calculateStat(49, 31, 50, 1.5)).toBe(104);
});

test('getLevelFromXP calculates correct level from total XP', () => {
    // 0 XP should be level 1
    expect(mathEngine.getLevelFromXP(0)).toBe(1);

    // XP needed for Level 2 is calculateReqXP(1) which is 52
    const xpForLevel2 = mathEngine.calculateReqXP(1); // 52
    expect(mathEngine.getLevelFromXP(xpForLevel2 - 1)).toBe(1); // Almost level 2
    expect(mathEngine.getLevelFromXP(xpForLevel2)).toBe(2); // Exactly level 2

    // XP needed for Level 3 is calculateReqXP(1) + calculateReqXP(2)
    const xpForLevel3 = xpForLevel2 + mathEngine.calculateReqXP(2); // 52 + 90 = 142
    expect(mathEngine.getLevelFromXP(xpForLevel3 - 1)).toBe(2);
    expect(mathEngine.getLevelFromXP(xpForLevel3)).toBe(3);

    // Extremely high XP should cap at level 100
    expect(mathEngine.getLevelFromXP(999999999)).toBe(100);
});

test('calculateHP edge and error cases', () => {
    // Zero level
    expect(mathEngine.calculateHP(45, 31, 0, 1.0)).toBe(10);

    // Negative values
    expect(mathEngine.calculateHP(-45, -31, 50, 1.0)).toBe(-1);

    // Floating point level (should ideally be integer but testing math)
    expect(mathEngine.calculateHP(45, 31, 50.5, 1.0)).toBe(121);

    // Zero quality
    expect(mathEngine.calculateHP(45, 31, 50, 0)).toBe(0);

    // Extreme quality
    expect(mathEngine.calculateHP(45, 31, 50, 100)).toBe(12050);

    // Negative quality
    expect(mathEngine.calculateHP(45, 31, 50, -1)).toBe(-121);

    // Negative vitamins
    expect(mathEngine.calculateHP(45, 31, 50, 1.0, -20)).toBe(96);
});

test('calculateStat edge and error cases', () => {
    // Zero level
    expect(mathEngine.calculateStat(49, 31, 0, 1.0)).toBe(5);

    // Negative values
    expect(mathEngine.calculateStat(-49, -31, 50, 1.0)).toBe(-60);

    // Floating point level
    expect(mathEngine.calculateStat(49, 31, 50.5, 1.0)).toBe(70);

    // Zero quality
    expect(mathEngine.calculateStat(49, 31, 50, 0)).toBe(0);

    // Extreme quality
    expect(mathEngine.calculateStat(49, 31, 50, 100)).toBe(6950);

    // Negative quality
    expect(mathEngine.calculateStat(49, 31, 50, -1)).toBe(-70);

    // Negative vitamins
    expect(mathEngine.calculateStat(49, 31, 50, 1.0, -20)).toBe(55);
});
