import { test, expect } from '@playwright/test';
import { generateQuality } from '../../src/mathEngine.js';

test.describe('generateQuality tests', () => {
    let originalMathRandom;

    test.beforeAll(() => {
        originalMathRandom = Math.random;
    });

    test.afterAll(() => {
        Math.random = originalMathRandom;
    });

    test.afterEach(() => {
        Math.random = originalMathRandom; // Restore after each test
    });

    function mockRollAndQ(roll, qRandom = 0) {
        let callCount = 0;
        Math.random = () => {
            if (callCount === 0) {
                callCount++;
                // return 0 for roll 1, return (12000-1)/12000 for 12000
                // Math.floor(Math.random() * 12000) + 1;
                // If random is (roll - 1) / 12000 => Math.floor((roll - 1)/12000 * 12000) + 1 => Math.floor(roll - 1) + 1 = roll
                // The issue: floating point inaccuracies could make (roll - 1) / 12000 * 12000 slightly less than (roll - 1).
                // Let's use (roll - 0.5) / 12000 to be perfectly safe, giving exactly roll.
                return (roll - 0.5) / 12000;
            }
            return qRandom;
        };
    }

    test('should return Weak tier correctly without bonuses', () => {
        mockRollAndQ(1, 0); // Roll 1, Q random 0
        const result = generateQuality();
        expect(result).toEqual({ name: 'Weak', q: 0.8 });
    });

    test('should return Regular tier correctly', () => {
        mockRollAndQ(1475, 0); // Weak max is 1474
        const result = generateQuality();
        expect(result).toEqual({ name: 'Regular', q: 1.0 });
    });

    test('should return Uncommon tier correctly', () => {
        mockRollAndQ(6587, 0); // Regular max is 6586
        const result = generateQuality();
        expect(result).toEqual({ name: 'Uncommon', q: 1.2 });
    });

    test('should return Rare tier correctly', () => {
        mockRollAndQ(9594, 0); // Uncommon max is 9593
        const result = generateQuality();
        expect(result).toEqual({ name: 'Rare', q: 1.4 });
    });

    test('should return Epic tier correctly', () => {
        mockRollAndQ(11098, 0); // Rare max is 11097
        const result = generateQuality();
        expect(result).toEqual({ name: 'Epic', q: 1.6 });
    });

    test('should return Shiny tier correctly', () => {
        mockRollAndQ(12000); // 12000 is shiny
        const result = generateQuality();
        expect(result).toEqual({ name: 'Shiny', q: 2.0 });
    });

    test('should cap generated q at maxQ for tier', () => {
        mockRollAndQ(1, 1); // Q random 1
        const result = generateQuality();
        expect(result).toEqual({ name: 'Weak', q: 0.99 });
    });

    test('should apply qTaskTier properly (tier 5 changes max rolls and increases q)', () => {
        // qTaskTier = 5 -> weakMaxRoll = 120, bonusValue = 1.00
        mockRollAndQ(121, 0.5); // Roll 121 should be Regular. Q random 0.5 -> originalQ = 1.0 + 0.5*(0.19) = 1.095
        // newQ = (1 + 1.00) * (1.095 - 1.0) + 1.0 = 2 * 0.095 + 1.0 = 1.19
        const result = generateQuality({ qTaskTier: 5 });
        expect(result).toEqual({ name: 'Regular', q: 1.19 });
    });

    test('should apply shinySeenTaskTier 2 (+2 shiny rolls)', () => {
        // Without stats, roll 11998 is Epic.
        // With shinySeenTaskTier >= 2, shinyRolls = 3 (1 base + 2).
        // shinyMinThreshold = 12000 - 3 + 1 = 11998.
        // So roll 11998 should be promoted to Shiny.
        mockRollAndQ(11998);
        const result = generateQuality({ shinySeenTaskTier: 2 });
        expect(result).toEqual({ name: 'Shiny', q: 2.0 });
    });

    test('should apply rainbowCandies extra rolls', () => {
        // rainbowCandies adds to extraRolls, promoting lower rolls to 12000.
        // With 5 rainbow candies, extraRolls = 5.
        // If roll >= 12000 - 5 (11995), it becomes 12000.
        mockRollAndQ(11995);
        const result = generateQuality({ rainbowCandies: 5 });
        expect(result).toEqual({ name: 'Shiny', q: 2.0 });
    });

    test('should apply isDoubleShiny properly', () => {
        // isDoubleShiny doubles the shinyRolls.
        // Base shinyRolls = 1. With isDoubleShiny = true -> shinyRolls = 2.
        // shinyMinThreshold = 12000 - 2 + 1 = 11999.
        mockRollAndQ(11999);
        const result = generateQuality({}, true);
        expect(result).toEqual({ name: 'Shiny', q: 2.0 });
    });

    test('should handle combinations of boosters', () => {
        // shinySeenTaskTier 2 -> shinyRolls = 3, extraRolls = 2.
        // isDoubleShiny -> shinyRolls = 6. rareMaxRoll reduced by 3.
        // shinyMinThreshold = 12000 - 6 + 1 = 11995.
        // roll 11995 becomes 12000? No, extraRolls artificially boosts roll *before* shinyMinThreshold check.
        // extraRolls = 2. So roll 11998 becomes 12000.
        // If roll = 11995, it stays 11995. Then shinyMinThreshold = 11995, so it becomes 12000.
        mockRollAndQ(11995);
        const result = generateQuality({ shinySeenTaskTier: 2 }, true);
        expect(result).toEqual({ name: 'Shiny', q: 2.0 });
    });
});
