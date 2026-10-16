import { test, expect } from '@playwright/test';
import { spawn } from 'child_process';

const PORT = 8100;
let serverProcess;

test.beforeAll(async () => {
    serverProcess = spawn('python3', ['-m', 'http.server', PORT.toString()]);
    // wait for server to start
    await new Promise(resolve => setTimeout(resolve, 2000));
});

test.afterAll(() => {
    if (serverProcess) {
        serverProcess.kill();
    }
});

test.describe('Cheat Control', () => {
    test.beforeEach(async ({ page }) => {
        await page.goto(`http://localhost:${PORT}/index.html`);
        await page.waitForTimeout(1000);

        // Start a new game and pick a starter to initialize state properly
        await page.evaluate(() => {
            if (document.getElementById('btn-new-profile')) {
                document.getElementById('btn-new-profile').click();
            }
        });
        await page.waitForTimeout(500);

        await page.evaluate(() => {
            if (document.getElementById('choose-bulbasaur')) {
                document.getElementById('choose-bulbasaur').click();
            }
        });
        await page.waitForTimeout(500);
    });

    test('should add money when Money cheat is triggered', async ({ page }) => {
        const initialMoney = await page.evaluate(() => window.state.trainer.money);

        await page.evaluate(() => window.cheatAction('Money'));

        const finalMoney = await page.evaluate(() => window.state.trainer.money);

        expect(finalMoney).toBe(initialMoney + 1000000000);
    });

    test('should set money to 0 when NoMoney cheat is triggered', async ({ page }) => {
        await page.evaluate(() => {
            window.state.trainer.money = 5000;
        });

        await page.evaluate(() => window.cheatAction('NoMoney'));

        const finalMoney = await page.evaluate(() => window.state.trainer.money);
        expect(finalMoney).toBe(0);
    });

    test('should add money and items when GodMode cheat is triggered', async ({ page }) => {
        const initialMoney = await page.evaluate(() => window.state.trainer.money);

        await page.evaluate(() => window.cheatAction('GodMode'));

        const finalMoney = await page.evaluate(() => window.state.trainer.money);
        expect(finalMoney).toBe(initialMoney + 100000000);

        const masterballs = await page.evaluate(() => window.state.backpack.pokeballs['Masterball']);
        expect(masterballs).toBe(10000);
    });
});
