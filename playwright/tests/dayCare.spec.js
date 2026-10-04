const { test, expect } = require('@playwright/test');

// Playwright runs this in a Node.js context which currently throws on ES6 exports
// due to standard configuration lacking ES modules natively if type: commonjs.
// However, the browser handles it fine. Let's use Playwright's page.evaluate
// to run tests in the browser context since it is a frontend module.
// But we want to test the class independently, so we can inject it into a page.

test.describe('DayCare', () => {
    test.beforeEach(async ({ page }) => {
        // We will just serve the files over http and load it.
        // We have python3 -m http.server running on localhost:8080.
        // blank_test.html is a blank page we can use to avoid CORS with localhost scripts on about:blank
        await page.goto('http://localhost:8080/blank_test.html');

        // Inject the script as a module - path must be absolute to root or relative to server root
        await page.evaluate(async () => {
            const module = await import('/src/dayCare.js');
            window.DayCare = module.default;
            window.trackDailyChallenge = () => {};
        });
    });

    test('Initial state is correct', async ({ page }) => {
        const state = await page.evaluate(() => {
            const dayCare = new window.DayCare({});
            return {
                slot1: dayCare.slot1,
                slot2: dayCare.slot2
            };
        });

        expect(state.slot1.pokemon).toBeNull();
        expect(state.slot1.isBreeding).toBe(false);
        expect(state.slot1.isFinished).toBe(false);
        expect(state.slot1.battles).toBe(0);
        expect(state.slot1.requiredBattles).toBe(100);

        expect(state.slot2.pokemon).toBeNull();
        expect(state.slot2.battles).toBe(0);
        expect(state.slot2.requiredBattles).toBe(100);
    });

    test.describe('Breeding Logic', () => {
        test('tickBattle increments battles when breeding', async ({ page }) => {
            const battles = await page.evaluate(() => {
                const dayCare = new window.DayCare({});
                dayCare.slot1.pokemon = { quality: 1.0 };
                dayCare.slot1.isBreeding = true;
                dayCare.tickBattle();
                return dayCare.slot1.battles;
            });
            expect(battles).toBe(1);
        });

        test('tickBattle does not increment battles when not breeding', async ({ page }) => {
            const battles = await page.evaluate(() => {
                const dayCare = new window.DayCare({});
                dayCare.slot1.pokemon = { quality: 1.0 };
                dayCare.slot1.isBreeding = false;
                dayCare.tickBattle();
                return dayCare.slot1.battles;
            });
            expect(battles).toBe(0);
        });

        test('tickBattle does not increment battles when breeding is finished', async ({ page }) => {
            const battles = await page.evaluate(() => {
                const dayCare = new window.DayCare({});
                dayCare.slot1.pokemon = { quality: 1.0 };
                dayCare.slot1.isBreeding = true;
                dayCare.slot1.isFinished = true;
                dayCare.tickBattle();
                return dayCare.slot1.battles;
            });
            expect(battles).toBe(0);
        });

        test('completeBreeding increases quality and sets finished flags', async ({ page }) => {
            const result = await page.evaluate(() => {
                const dayCare = new window.DayCare({});
                dayCare.slot1.pokemon = { quality: 1.0, qualityName: 'Normal' };
                dayCare.slot1.isBreeding = true;
                dayCare.completeBreeding();
                return {
                    quality: dayCare.slot1.pokemon.quality,
                    isFinished: dayCare.slot1.isFinished,
                    isBreeding: dayCare.slot1.isBreeding
                };
            });

            expect(result.quality).toBeGreaterThanOrEqual(1.0);
            expect(result.quality).toBeLessThanOrEqual(1.99);
            expect(result.isFinished).toBe(true);
            expect(result.isBreeding).toBe(false);
        });

        test('completeBreeding sets Perfect qualityName when quality >= 1.99', async ({ page }) => {
            const result = await page.evaluate(() => {
                const dayCare = new window.DayCare({});
                dayCare.slot1.pokemon = { quality: 1.99, qualityName: 'Normal' };
                dayCare.slot1.isBreeding = true;
                dayCare.completeBreeding();
                return {
                    quality: dayCare.slot1.pokemon.quality,
                    qualityName: dayCare.slot1.pokemon.qualityName
                };
            });

            expect(result.qualityName).toBe('Perfect');
            expect(result.quality).toBe(1.99);
        });

        test('tickBattle calls completeBreeding when required battles are met', async ({ page }) => {
            const result = await page.evaluate(() => {
                const dayCare = new window.DayCare({});
                dayCare.slot1.pokemon = { quality: 1.0, qualityName: 'Normal' };
                dayCare.slot1.isBreeding = true;
                dayCare.slot1.battles = 99;
                dayCare.slot1.requiredBattles = 100;
                dayCare.tickBattle();
                return {
                    battles: dayCare.slot1.battles,
                    isFinished: dayCare.slot1.isFinished,
                    isBreeding: dayCare.slot1.isBreeding
                };
            });

            expect(result.battles).toBe(100);
            expect(result.isFinished).toBe(true);
            expect(result.isBreeding).toBe(false);
        });
    });

    test.describe('Training Logic', () => {
        test('tickBattle increments battles when IV is below 600', async ({ page }) => {
            const battles = await page.evaluate(() => {
                const dayCare = new window.DayCare({});
                dayCare.slot2.pokemon = {
                    ivs: { hp: 10, atk: 10, def: 10, spa: 10, spd: 10, spe: 10 }
                };
                dayCare.tickBattle();
                return dayCare.slot2.battles;
            });
            expect(battles).toBe(1);
        });

        test('tickBattle freezes battles when IV reaches 600', async ({ page }) => {
            const battles = await page.evaluate(() => {
                const dayCare = new window.DayCare({});
                dayCare.slot2.pokemon = {
                    ivs: { hp: 100, atk: 100, def: 100, spa: 100, spd: 100, spe: 100 }
                };
                dayCare.slot2.battles = 50;
                dayCare.slot2.requiredBattles = 100;
                dayCare.tickBattle();
                return dayCare.slot2.battles;
            });
            expect(battles).toBe(100);
        });

        test('completeTrainingCycle increases a sub-100 IV and resets battles', async ({ page }) => {
            const result = await page.evaluate(() => {
                const dayCare = new window.DayCare({});
                dayCare.slot2.pokemon = {
                    ivs: { hp: 99, atk: 99, def: 99, spa: 99, spd: 99, spe: 99 }
                };
                dayCare.completeTrainingCycle();
                return {
                    battles: dayCare.slot2.battles,
                    cycles: dayCare.slot2.pokemon.trainingCyclesCompleted,
                    ivs: dayCare.slot2.pokemon.ivs
                };
            });

            expect(result.battles).toBe(0);
            expect(result.cycles).toBe(1);
            const totalIV = result.ivs.hp + result.ivs.atk + result.ivs.def + result.ivs.spa + result.ivs.spd + result.ivs.spe;
            expect(totalIV).toBe(595); // 594 + 1
        });

        test('completeTrainingCycle sets battles to required if cap is reached', async ({ page }) => {
            const result = await page.evaluate(() => {
                const dayCare = new window.DayCare({});
                dayCare.slot2.pokemon = {
                    ivs: { hp: 99, atk: 100, def: 100, spa: 100, spd: 100, spe: 100 }
                };
                dayCare.completeTrainingCycle();
                return {
                    hp: dayCare.slot2.pokemon.ivs.hp,
                    battles: dayCare.slot2.battles
                };
            });

            expect(result.hp).toBe(100);
            expect(result.battles).toBe(100);
        });

        test('tickBattle calls completeTrainingCycle when required battles are met', async ({ page }) => {
            const result = await page.evaluate(() => {
                const dayCare = new window.DayCare({});
                dayCare.slot2.pokemon = {
                    ivs: { hp: 10, atk: 10, def: 10, spa: 10, spd: 10, spe: 10 }
                };
                dayCare.slot2.battles = 99;
                dayCare.slot2.requiredBattles = 100;
                dayCare.tickBattle();
                return {
                    battles: dayCare.slot2.battles,
                    cycles: dayCare.slot2.pokemon.trainingCyclesCompleted,
                    ivs: dayCare.slot2.pokemon.ivs
                };
            });

            expect(result.battles).toBe(0);
            expect(result.cycles).toBe(1);
            const totalIV = result.ivs.hp + result.ivs.atk + result.ivs.def + result.ivs.spa + result.ivs.spd + result.ivs.spe;
            expect(totalIV).toBe(61);
        });
    });

    test.describe('Passive XP Logic', () => {
        test('grantPassiveXP increases pokemon xp by 50% of amount when no callback is provided', async ({ page }) => {
            const xp = await page.evaluate(() => {
                const dayCare = new window.DayCare({});
                dayCare.slot2.pokemon = { xp: 100 };
                dayCare.grantPassiveXP(50);
                return dayCare.slot2.pokemon.xp;
            });
            expect(xp).toBe(125);
        });

        test('grantPassiveXP calls the callback with 50% of amount if callback is provided', async ({ page }) => {
            const result = await page.evaluate(() => {
                const dayCare = new window.DayCare({});
                dayCare.slot2.pokemon = { xp: 100 };
                let calledAmount = 0;
                let calledPokemon = null;
                // Expose function is too complex for evaluate since it only gets called on browser, so test it in browser
                const mockCallback = (pokemon, amount) => {
                    window.calledPokemon = pokemon !== null; // simplify objects
                    window.calledAmount = amount;
                };
                dayCare.grantPassiveXP(50, mockCallback);
                return {
                    calledPokemon: window.calledPokemon,
                    calledAmount: window.calledAmount,
                    xp: dayCare.slot2.pokemon.xp
                };
            });

            expect(result.calledPokemon).toBe(true);
            expect(result.calledAmount).toBe(25);
            expect(result.xp).toBe(100);
        });

        test('grantPassiveXP does nothing if no pokemon in slot2', async ({ page }) => {
            const called = await page.evaluate(() => {
                const dayCare = new window.DayCare({});
                dayCare.slot2.pokemon = null;
                window.called = false;
                const mockCallback = () => { window.called = true; };
                dayCare.grantPassiveXP(50, mockCallback);
                return window.called;
            });

            expect(called).toBe(false);
        });
    });
});
