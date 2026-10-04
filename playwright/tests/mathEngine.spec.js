const { test, expect } = require('@playwright/test');
const mathEngine = require('../../src/mathEngine.js');

test.describe('mathEngine tests', () => {

    test('calculateHP with vitamins', () => {
        // hp = floor(((2 * 45 + 31) * 50 / 100) + 50 + 10) * 1.0 = floor((121 * 0.5) + 60) = floor(60.5 + 60) = 120
        const hpNoVitamins = mathEngine.calculateHP(45, 31, 50, 1.0);
        expect(hpNoVitamins).toBe(120);

        // hp with 20 vitamins = 120 + floor(120 * (20/100)) = 120 + 24 = 144
        const hpMaxVitamins = mathEngine.calculateHP(45, 31, 50, 1.0, 20);
        expect(hpMaxVitamins).toBe(144);
    });

    test('calculateStat with vitamins', () => {
        // stat = floor(((2 * 49 + 31) * 50 / 100) + 5) * 1.0 = floor((129 * 0.5) + 5) = floor(64.5 + 5) = 69
        const statNoVitamins = mathEngine.calculateStat(49, 31, 50, 1.0);
        expect(statNoVitamins).toBe(69);

        // stat with 20 vitamins = 69 + floor(69 * (20/100)) = 69 + floor(13.8) = 69 + 13 = 82
        const statMaxVitamins = mathEngine.calculateStat(49, 31, 50, 1.0, 20);
        expect(statMaxVitamins).toBe(82);
    });

    test.describe('generateQuality', () => {
        let originalMathRandom;

        test.beforeEach(() => {
            originalMathRandom = Math.random;
        });

        test.afterEach(() => {
            Math.random = originalMathRandom;
        });

        test('returns Weak quality when roll is low', () => {
            // First random for roll: weakMaxRoll is 1474.
            // Math.random() = 0 means roll = floor(0 * maxTableRoll) + 1 = 1 (Weak)
            // Second random for originalQ: 0.5. baseQ=0.80, maxQ=0.99. originalQ = 0.80 + 0.5 * 0.19 = 0.895
            // newQ = (1 + 0) * (0.895 - 0.80) + 0.80 = 0.895
            // newQ = floor(0.895 * 100)/100 = 0.89
            let callCount = 0;
            Math.random = () => {
                callCount++;
                if (callCount === 1) return 0.0;
                return 0.5;
            };

            const result = mathEngine.generateQuality();
            expect(result.name).toBe('Weak');
            expect(result.q).toBe(0.89);
        });

        test('returns Regular quality when roll is mid-range', () => {
            // weakMaxRoll=1474, regularMaxRoll=6586
            // Math.random = 1500 / 12000 = 0.125 => roll = 1501
            // originalQ rand = 0.5. baseQ=1.00, maxQ=1.19. originalQ = 1.00 + 0.5*0.19 = 1.095 => 1.09
            let callCount = 0;
            Math.random = () => {
                callCount++;
                if (callCount === 1) return 1500 / 12000;
                return 0.5;
            };

            const result = mathEngine.generateQuality();
            expect(result.name).toBe('Regular');
            expect(result.q).toBe(1.09);
        });

        test('returns Uncommon quality when roll is higher', () => {
            // regularMaxRoll=6586, uncommonMaxRoll=9593
            // Math.random = 7000 / 12000 = 0.5833 => roll = 7001
            // baseQ=1.20, maxQ=1.39
            let callCount = 0;
            Math.random = () => {
                callCount++;
                if (callCount === 1) return 7000 / 12000;
                return 0.5;
            };

            const result = mathEngine.generateQuality();
            expect(result.name).toBe('Uncommon');
            expect(result.q).toBe(1.29);
        });

        test('returns Rare quality when roll is even higher', () => {
            // uncommonMaxRoll=9593, rareMaxRoll=11097
            // Math.random = 10000 / 12000 = 0.8333 => roll = 10001
            // baseQ=1.40, maxQ=1.59
            let callCount = 0;
            Math.random = () => {
                callCount++;
                if (callCount === 1) return 10000 / 12000;
                return 0.5;
            };

            const result = mathEngine.generateQuality();
            expect(result.name).toBe('Rare');
            expect(result.q).toBe(1.49);
        });

        test('returns Epic quality when roll is near max', () => {
            // rareMaxRoll=11097, maxTableRoll=12000 (base)
            // Math.random = 11500 / 12000 = 0.9583 => roll = 11501
            // baseQ=1.60, maxQ=1.80
            let callCount = 0;
            Math.random = () => {
                callCount++;
                if (callCount === 1) return 11500 / 12000;
                return 0.5;
            };

            const result = mathEngine.generateQuality();
            expect(result.name).toBe('Epic');
            expect(result.q).toBe(1.70);
        });

        test('returns Shiny quality when roll exceeds 11999', () => {
            // For roll > 11999 we need maxTableRoll > 11999.
            // Example: shinySeenTaskTier >= 2 gives +2 shinyRolls (total 3).
            // maxTableRoll = 11999 + 3 = 12002.
            // Math.random = 12000 / 12002 => roll = 12001
            // Should return { name: "Shiny", q: 2.00 } without originalQ rand roll
            let callCount = 0;
            Math.random = () => {
                callCount++;
                return 12000 / 12002;
            };

            const result = mathEngine.generateQuality({ shinySeenTaskTier: 2 });
            expect(result.name).toBe('Shiny');
            expect(result.q).toBe(2.00);
        });

        test('applies qTaskTier bonuses to max roll thresholds and quality value', () => {
            // qTaskTier >= 5: bonusValue = 1.00; weakMaxRoll = 120; regularMaxRoll = 3720;
            // if Math.random = 1500 / 12000 => roll = 1501
            // With qTaskTier 5, 1501 is <= regularMaxRoll(3720).
            // Without qTaskTier 5, 1501 is <= regularMaxRoll(6586), so both give Regular.
            // But let's check roll = 4000.
            // Without qTaskTier 5, 4000 <= 6586 (Regular).
            // With qTaskTier 5, 4000 > 3720 and <= 6120 (Uncommon).
            // So qTaskTier changes the tier.
            let callCount = 0;
            Math.random = () => {
                callCount++;
                if (callCount === 1) return 4000 / 12000; // Roll 4001
                return 0.5; // originalQ mid
            };

            const resultWithout = mathEngine.generateQuality(); // Regular (1.09)
            expect(resultWithout.name).toBe('Regular');

            callCount = 0;
            const resultWith = mathEngine.generateQuality({ qTaskTier: 5 });
            // 4001 <= 6120 (Uncommon). baseQ=1.20, maxQ=1.39
            // originalQ = 1.20 + 0.5*0.19 = 1.295
            // newQ = (1 + 1.00) * (1.295 - 1.20) + 1.20 = 2 * 0.095 + 1.20 = 1.39
            expect(resultWith.name).toBe('Uncommon');
            expect(resultWith.q).toBe(1.39); // Caps at maxQ or reaches it
        });

        test('calculates shinyRolls with various modifiers', () => {
            // stats.rainbowCandies = 2 (+2)
            // stats.shinySeenTaskTier = 1 (+1)
            // isDoubleShiny = true (*2)
            // stats.finalTaskTier = 1 (*12)
            // shinyRolls = (1 + 2 + 1) * 2 * 12 = 4 * 2 * 12 = 96
            // maxTableRoll = 11999 + 96 = 12095
            // Math.random = 11999 / 12095 => roll = 12000 (Shiny)
            let callCount = 0;
            Math.random = () => {
                callCount++;
                return 11999 / 12095;
            };

            const result = mathEngine.generateQuality({
                rainbowCandies: 2,
                shinySeenTaskTier: 1,
                finalTaskTier: 1
            }, true); // isDoubleShiny = true

            expect(result.name).toBe('Shiny');
            expect(result.q).toBe(2.00);
        });

        test('caps newQ at maxQ', () => {
            // qTaskTier = 5 -> bonus 1.00
            // if originalQ rand = 0.9 (almost max), originalQ is very high.
            // newQ = 2 * (originalQ - baseQ) + baseQ > maxQ
            let callCount = 0;
            Math.random = () => {
                callCount++;
                if (callCount === 1) return 0; // roll 1 (Weak, baseQ 0.8, maxQ 0.99)
                return 0.9; // originalQ = 0.8 + 0.9 * 0.19 = 0.8 + 0.171 = 0.971
            };
            // newQ = (1+1) * (0.971 - 0.80) + 0.80 = 2 * 0.171 + 0.80 = 0.342 + 0.80 = 1.142
            // 1.142 > maxQ(0.99), so newQ capped at 0.99

            const result = mathEngine.generateQuality({ qTaskTier: 5 });
            expect(result.name).toBe('Weak');
            expect(result.q).toBe(0.99);
        });
    });

});
