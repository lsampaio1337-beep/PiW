import { generateQuality } from '../src/mathEngine.js';

describe('generateQuality', () => {
    afterEach(() => {
        jest.restoreAllMocks();
    });

    it('should generate Weak quality with correct q range and name', () => {
        // Mock random to be very low, ensuring Weak tier
        jest.spyOn(Math, 'random').mockReturnValue(0.01);
        const result = generateQuality();

        expect(result.name).toBe('Weak');
        expect(result.q).toBeGreaterThanOrEqual(0.80);
        expect(result.q).toBeLessThanOrEqual(0.99);
    });

    it('should generate Regular quality with correct q range and name', () => {
        // Weak max roll is 1474.
        // 1475 / 12000 = 0.1229
        jest.spyOn(Math, 'random').mockReturnValue(0.125);
        const result = generateQuality();

        expect(result.name).toBe('Regular');
        expect(result.q).toBeGreaterThanOrEqual(1.00);
        expect(result.q).toBeLessThanOrEqual(1.19);
    });

    it('should generate Uncommon quality with correct q range and name', () => {
        // Regular max roll is 6586
        // 6587 / 12000 = 0.5489
        jest.spyOn(Math, 'random').mockReturnValue(0.55);
        const result = generateQuality();

        expect(result.name).toBe('Uncommon');
        expect(result.q).toBeGreaterThanOrEqual(1.20);
        expect(result.q).toBeLessThanOrEqual(1.39);
    });

    it('should generate Rare quality with correct q range and name', () => {
        // Uncommon max roll is 9593
        // 9594 / 12000 = 0.7995
        jest.spyOn(Math, 'random').mockReturnValue(0.80);
        const result = generateQuality();

        expect(result.name).toBe('Rare');
        expect(result.q).toBeGreaterThanOrEqual(1.40);
        expect(result.q).toBeLessThanOrEqual(1.59);
    });

    it('should generate Epic quality with correct q range and name', () => {
        // Rare max roll is 11097
        // 11098 / 12000 = 0.9248
        jest.spyOn(Math, 'random').mockReturnValue(0.95);
        const result = generateQuality();

        expect(result.name).toBe('Epic');
        expect(result.q).toBeGreaterThanOrEqual(1.60);
        expect(result.q).toBeLessThanOrEqual(1.80);
    });

    it('should generate Shiny quality', () => {
        // Roll > 11999 means shiny. Base max table roll is 11999 + 1 = 12000.
        // Returning 0.99999 ensures roll is 12000 (Shiny)
        jest.spyOn(Math, 'random').mockReturnValue(0.99999);
        const result = generateQuality();

        expect(result.name).toBe('Shiny');
        expect(result.q).toBe(2.00);
    });

    it('should apply bonus value from qTaskTier', () => {
        // With qTaskTier = 5, bonusValue = 1.00
        // maxQ for Weak is 0.99, base is 0.80
        // This will result in higher q, potentially maxed.
        jest.spyOn(Math, 'random').mockReturnValue(0.001); // First roll determines tier (Weak). Second roll is also 0.001
        const result = generateQuality({ qTaskTier: 5 });

        expect(result.name).toBe('Weak');
        // Original logic: newQ = (1 + bonusValue) * (originalQ - baseQ) + baseQ;
        // originalQ = 0.80 + 0.001 * (0.99 - 0.80) = 0.80019
        // newQ = 2.0 * (0.80019 - 0.80) + 0.80 = 0.80038 => floor => 0.80
        expect(result.q).toBeGreaterThanOrEqual(0.80);
    });

    it('should increase max table roll with shiny boosters', () => {
        // With finalTaskTier >= 1, shinyRolls = 1 * 12 = 12
        // maxTableRoll = 11999 + 12 = 12011
        // We need a roll > 11999 to get Shiny.
        // We will mock Math.random to return something that gives exactly 12000 or above.
        // Math.random() = 12000 / 12011 = 0.999084
        jest.spyOn(Math, 'random').mockReturnValue(0.9991);
        const result = generateQuality({ finalTaskTier: 1 });

        expect(result.name).toBe('Shiny');
    });

    it('should apply double shiny bonus', () => {
        // isDoubleShiny = true
        // shinyRolls = 1 * 2 = 2
        // maxTableRoll = 11999 + 2 = 12001
        // 12000 / 12001 = 0.99991
        jest.spyOn(Math, 'random').mockReturnValue(0.99992);
        const result = generateQuality({}, true);

        expect(result.name).toBe('Shiny');
    });

    it('should apply rainbowCandies bonus', () => {
        // rainbowCandies = 5
        // shinyRolls = 1 + 5 = 6
        // maxTableRoll = 11999 + 6 = 12005
        // 12000 / 12005 = 0.99958
        jest.spyOn(Math, 'random').mockReturnValue(0.9996);
        const result = generateQuality({ rainbowCandies: 5 });

        expect(result.name).toBe('Shiny');
    });

    it('should apply shinySeenTaskTier bonus 1', () => {
        // shinySeenTaskTier = 1 -> shinyRolls += 1 -> total = 2
        // maxTableRoll = 11999 + 2 = 12001
        // 12000 / 12001 = 0.99991
        jest.spyOn(Math, 'random').mockReturnValue(0.99992);
        const result = generateQuality({ shinySeenTaskTier: 1 });

        expect(result.name).toBe('Shiny');
    });

    it('should apply shinySeenTaskTier bonus 2', () => {
        // shinySeenTaskTier = 2 -> shinyRolls += 2 -> total = 3
        // maxTableRoll = 11999 + 3 = 12002
        // 12000 / 12002 = 0.99983
        jest.spyOn(Math, 'random').mockReturnValue(0.99984);
        const result = generateQuality({ shinySeenTaskTier: 2 });

        expect(result.name).toBe('Shiny');
    });

    it('should correctly cap maximum quality for a tier if bonusValue pushes it too high', () => {
        // Test clipping `if (newQ > maxQ) newQ = maxQ`
        jest.spyOn(Math, 'random').mockReturnValueOnce(0.001) // First roll: weak tier (For qTaskTier 5, weakMaxRoll is 120, so 0.001 * 12000 = 12 which is <= 120)
                                  .mockReturnValueOnce(0.99); // Second roll: originalQ near max
        // qTaskTier: 5 -> bonusValue: 1.00
        const result = generateQuality({ qTaskTier: 5 });

        expect(result.name).toBe('Weak');
        expect(result.q).toBe(0.99); // Capped at 0.99
    });
});
