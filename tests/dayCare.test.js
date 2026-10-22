import DayCare from '../src/dayCare.js';

describe('DayCare', () => {
    let dayCare;
    let mockState;

    beforeEach(() => {
        mockState = {};
        dayCare = new DayCare(mockState);

        // Ensure global.window exists and has trackDailyChallenge
        if (typeof window === 'undefined') {
            global.window = {};
        }
        global.window.trackDailyChallenge = jest.fn();

        // Mock Math.random to make tests deterministic
        jest.spyOn(Math, 'random').mockReturnValue(0.5);
    });

    afterEach(() => {
        jest.restoreAllMocks();
        delete global.window;
    });

    describe('Initialization', () => {
        test('should initialize with default slots', () => {
            expect(dayCare.state).toBe(mockState);
            expect(dayCare.slot1).toEqual({
                pokemon: null,
                isBreeding: false,
                isFinished: false,
                battles: 0,
                requiredBattles: 100
            });
            expect(dayCare.slot2).toEqual({
                pokemon: null,
                battles: 0,
                requiredBattles: 100
            });
        });
    });

    describe('Slot 1 (Breeding) tickBattle', () => {
        test('should increment battles when breeding', () => {
            dayCare.slot1.pokemon = { quality: 1.0 };
            dayCare.slot1.isBreeding = true;

            dayCare.tickBattle();
            expect(dayCare.slot1.battles).toBe(1);
        });

        test('should not increment battles if not breeding', () => {
            dayCare.slot1.pokemon = { quality: 1.0 };
            dayCare.slot1.isBreeding = false;

            dayCare.tickBattle();
            expect(dayCare.slot1.battles).toBe(0);
        });

        test('should not increment battles if finished', () => {
            dayCare.slot1.pokemon = { quality: 1.0 };
            dayCare.slot1.isBreeding = true;
            dayCare.slot1.isFinished = true;

            dayCare.tickBattle();
            expect(dayCare.slot1.battles).toBe(0);
        });

        test('should call completeBreeding when required battles are reached', () => {
            dayCare.slot1.pokemon = { quality: 1.0 };
            dayCare.slot1.isBreeding = true;
            dayCare.slot1.battles = 99;

            jest.spyOn(dayCare, 'completeBreeding');

            dayCare.tickBattle();

            expect(dayCare.slot1.battles).toBe(100);
            expect(dayCare.completeBreeding).toHaveBeenCalled();
        });
    });

    describe('Slot 2 (Training) tickBattle', () => {
        const createMockPokemon = (ivs) => ({
            ivs: { hp: 0, atk: 0, def: 0, spa: 0, spd: 0, spe: 0, ...ivs }
        });

        test('should increment battles when total IVs < 600', () => {
            dayCare.slot2.pokemon = createMockPokemon({ hp: 50 }); // Total: 50
            dayCare.tickBattle();
            expect(dayCare.slot2.battles).toBe(1);
        });

        test('should keep battles frozen at requiredBattles when total IVs >= 600', () => {
            dayCare.slot2.pokemon = createMockPokemon({ hp: 100, atk: 100, def: 100, spa: 100, spd: 100, spe: 100 }); // Total: 600
            dayCare.slot2.battles = 50;

            dayCare.tickBattle();

            expect(dayCare.slot2.battles).toBe(dayCare.slot2.requiredBattles);
        });

        test('should call completeTrainingCycle when required battles are reached', () => {
            dayCare.slot2.pokemon = createMockPokemon({ hp: 50 });
            dayCare.slot2.battles = 99;

            jest.spyOn(dayCare, 'completeTrainingCycle');

            dayCare.tickBattle();

            // Note: completeTrainingCycle resets battles to 0 if total IVs < 600
            expect(dayCare.slot2.battles).toBe(0);
            expect(dayCare.completeTrainingCycle).toHaveBeenCalled();
        });
    });

    describe('grantPassiveXP', () => {
        test('should call grantXpCallback with 50% XP if provided', () => {
            dayCare.slot2.pokemon = { xp: 0 };
            const callback = jest.fn();

            dayCare.grantPassiveXP(100, callback);

            expect(callback).toHaveBeenCalledWith(dayCare.slot2.pokemon, 50);
            expect(dayCare.slot2.pokemon.xp).toBe(0); // Direct XP should not be modified
        });

        test('should directly add 50% XP if callback is not provided', () => {
            dayCare.slot2.pokemon = { xp: 0 };

            dayCare.grantPassiveXP(100);

            expect(dayCare.slot2.pokemon.xp).toBe(50);
        });

        test('should do nothing if slot2 has no pokemon', () => {
            const callback = jest.fn();
            dayCare.grantPassiveXP(100, callback);
            expect(callback).not.toHaveBeenCalled();
        });
    });

    describe('completeBreeding', () => {
        test('should correctly handle early return if no pokemon in slot1', () => {
            dayCare.completeBreeding();
            expect(global.window.trackDailyChallenge).not.toHaveBeenCalled();
        });

        test('should increase quality by a random amount and fix precision', () => {
            // Math.random is mocked to 0.5, so 0.5 * 11 = 5.5, floor = 5, randIncrease = 0.05
            dayCare.slot1.pokemon = { quality: 1.0 };
            dayCare.completeBreeding();

            expect(dayCare.slot1.pokemon.quality).toBe(1.05);
            expect(dayCare.slot1.isFinished).toBe(true);
            expect(dayCare.slot1.isBreeding).toBe(false);
            expect(global.window.trackDailyChallenge).toHaveBeenCalledWith('hatch_eggs');
        });

        test('should cap quality at 1.99 and set qualityName to Perfect', () => {
            // Force random to max out increase (Math.random() -> 0.999 -> floor(10.9) = 10 -> 0.10)
            jest.spyOn(Math, 'random').mockReturnValue(0.999);
            dayCare.slot1.pokemon = { quality: 1.95 };
            dayCare.completeBreeding();

            expect(dayCare.slot1.pokemon.quality).toBe(1.99);
            expect(dayCare.slot1.pokemon.qualityName).toBe("Perfect");
        });
    });

    describe('completeTrainingCycle', () => {
        const createMockPokemon = (ivs) => ({
            ivs: { hp: 0, atk: 0, def: 0, spa: 0, spd: 0, spe: 0, ...ivs }
        });

        test('should increase a random sub-100 IV stat and track cycles', () => {
            dayCare.slot2.pokemon = createMockPokemon({ hp: 100, atk: 100, def: 100, spa: 100, spd: 100, spe: 99 });
            dayCare.slot2.battles = 100;

            // Only 'spe' is under 100, so it must be selected
            dayCare.completeTrainingCycle();

            expect(dayCare.slot2.pokemon.ivs.spe).toBe(100);
            expect(dayCare.slot2.pokemon.trainingCyclesCompleted).toBe(1);
            expect(global.window.trackDailyChallenge).toHaveBeenCalledWith('daycare_iv', { amount: 1 });
        });

        test('should reset battles to 0 if total IVs are still < 600 after training', () => {
            dayCare.slot2.pokemon = createMockPokemon({ hp: 50 });
            dayCare.slot2.battles = 100;

            dayCare.completeTrainingCycle();

            expect(dayCare.slot2.battles).toBe(0);
        });

        test('should freeze battles at requiredBattles if total IVs hit 600 after training', () => {
            dayCare.slot2.pokemon = createMockPokemon({ hp: 100, atk: 100, def: 100, spa: 100, spd: 100, spe: 99 });
            dayCare.slot2.battles = 100;

            dayCare.completeTrainingCycle();

            // Reached 600 (all stats 100)
            expect(dayCare.slot2.battles).toBe(100);
        });
    });
});
