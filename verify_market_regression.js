const { chromium } = require('playwright');
const path = require('path');

(async () => {
    // Launch browser
    const browser = await chromium.launch({ headless: true });

    // Create a context and start recording video
    const context = await browser.newContext({
        viewport: { width: 1280, height: 720 },
        recordVideo: {
            dir: '/home/jules/verification/videos/', // Video will be saved here
            size: { width: 1280, height: 720 }
        }
    });

    const page = await context.newPage();

    // Navigate to the local server
    await page.goto(`http://localhost:8000/index.html`);
    await page.waitForTimeout(1000);

    // Dismiss "New Game" if it appears
    if (await page.$('#new-game-modal')) {
        await page.click('#new-game-modal button:has-text("New Game")');
        await page.waitForTimeout(500);
    }

    // Pick a starter if needed
    const starters = await page.$$('#starter-selection-modal img');
    if (starters.length > 0) {
        await starters[0].click();
        await page.waitForTimeout(1000);
    }

    // Check if we can navigate to map then PokeCenter
    await page.evaluate(() => {
        if(window.showMap) {
            window.showMap();
        }
    });

    await page.waitForTimeout(500);

    await page.evaluate(() => {
        if(window.navigateToLocation) {
            window.navigateToLocation('PokeCenter & PokeMarket');
        }
    });

    await page.waitForTimeout(1000);

    // Take screenshot
    await page.screenshot({ path: '/home/jules/verification/screenshots/verification.png' });

    await context.close(); // Important to close context to save video
    await browser.close();
})();
