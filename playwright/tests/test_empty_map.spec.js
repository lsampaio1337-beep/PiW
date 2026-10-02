const { test, expect } = require('@playwright/test');

test('test new region map fallback', async ({ page }) => {
    await page.goto('http://localhost:3000/index.html');
    await page.waitForTimeout(1000);

    const newGameBtn = page.locator('#btn-new-game');
    if (await newGameBtn.isVisible()) {
        await newGameBtn.click();
        await page.waitForTimeout(500);
        const starterBtn = page.locator('#btn-start-charmander');
        if (await starterBtn.isVisible()) await starterBtn.click();
    }
    await page.waitForTimeout(1000);
    const tutorialSkip = page.locator('button:has-text("Skip")');
    if (await tutorialSkip.isVisible()) await tutorialSkip.click();
    await page.waitForTimeout(1000);

    // Expose a cheat function to complete the final challenge so we can see all maps
    await page.evaluate(() => {
        window.state.stats.completedChallengeIds = window.state.stats.completedChallengeIds || [];
        window.state.stats.completedChallengeIds.push('Indigo Plateau');
        window.state.globalStats.hasSeenJohtoMap = true;
        window.updateUI();
    });
    await page.waitForTimeout(500);

    // Open map
    await page.evaluate(() => {
        window.switchMapRegion('Kanto'); // triggers showMap indirectly
        window.showMap();
    });

    await page.waitForTimeout(1000);
    const mapWindow = page.locator('#window-map');
    await expect(mapWindow).toBeVisible();

    // Check Hoenn map
    await page.evaluate(() => {
        window.switchMapRegion('Hoenn');
    });
    await page.waitForTimeout(1000);

    await page.screenshot({ path: '/home/jules/verification/screenshots/map_hoenn_fallback.png' });

    // Check Paldea map
    await page.evaluate(() => {
        window.switchMapRegion('Paldea');
    });
    await page.waitForTimeout(1000);

    await page.screenshot({ path: '/home/jules/verification/screenshots/map_paldea_fallback.png' });
});
