const { test, expect } = require('@playwright/test');

test.describe('Frontend Verification', () => {
  test('Map and Backpack Verifications', async ({ page }) => {
    await page.goto('http://localhost:3000');

    // Dismiss splash screen by force-evaluating the click
    await page.evaluate(() => {
        const splash = document.getElementById('splash-screen');
        if (splash) splash.style.display = 'none';
    });

    // Wait for the main UI to load
    await page.waitForSelector('#btn-map', { timeout: 10000 });

    // Test Map markers
    await page.evaluate(() => document.getElementById('btn-map').click());
    await page.waitForSelector('#modal-overlay', { state: 'visible' });
    // Wait for markers to possibly render
    await page.waitForTimeout(1000);
    await page.screenshot({ path: '/home/jules/verification/screenshots/verification_map.png', fullPage: true });

    // Close modal
    await page.evaluate(() => {
       const closeBtn = document.querySelector('.close-modal');
       if (closeBtn) closeBtn.click();
    });
    // await page.waitForSelector('#modal-overlay', { state: 'hidden' });
    await page.waitForTimeout(500);

    // Test Backpack rendering
    await page.evaluate(() => document.getElementById('btn-backpack').click());
    await page.waitForSelector('#modal-overlay', { state: 'visible' });
    await page.waitForTimeout(1000);
    await page.screenshot({ path: '/home/jules/verification/screenshots/verification_backpack.png', fullPage: true });
  });
});
