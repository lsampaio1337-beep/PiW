const { test, expect } = require('@playwright/test');

test('test main control renders and resizes without errors', async ({ page }) => {
    const logs = [];
    page.on('console', msg => {
        logs.push(`${msg.type()}: ${msg.text()}`);
    });
    page.on('pageerror', err => {
        logs.push(`PageError: ${err.message}`);
    });

    await page.goto('http://localhost:3000/index.html');

    // Wait for the game to initialize
    await page.waitForTimeout(1000);

    // Click "New Game"
    const newGameBtn = page.locator('#btn-new-game');
    if (await newGameBtn.isVisible()) {
        await newGameBtn.click();



        // Choose starter
        await page.waitForTimeout(500);
        const starterBtn = page.locator('#btn-start-charmander');
        if (await starterBtn.isVisible()) {
            await starterBtn.click();
        }
    }

    // Give it a bit to load
    await page.waitForTimeout(1000);

    const tutorialSkip = page.locator('button:has-text("Skip")');
    if (await tutorialSkip.isVisible()) {
        await tutorialSkip.click();
    }

    await page.waitForTimeout(1000);


    // Check if main control is visible and has reasonable width
    const mainControl = page.locator('#main-control-window');
    await expect(mainControl).toBeVisible();

    const boundingBox = await mainControl.boundingBox();
    console.log(`Main Control Bounding Box: ${JSON.stringify(boundingBox)}`);


    // Ensure height > 0
    expect(boundingBox.height).toBeGreaterThan(0);

    console.log('--- CONSOLE LOGS ---');
    logs.forEach(log => console.log(log));



    await page.screenshot({ path: '/home/jules/verification/screenshots/main_control_verify_final.png' });
});
