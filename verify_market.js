const { chromium } = require('playwright');

(async () => {
    const browser = await chromium.launch({ headless: true });
    const context = await browser.newContext({ viewport: { width: 1280, height: 720 } });
    const page = await context.newPage();

    await page.goto(`http://localhost:8000/index.html`);
    await page.waitForTimeout(1000);

    if (await page.$('#new-game-modal')) {
        await page.click('#new-game-modal button:has-text("New Game")');
        await page.waitForTimeout(500);
    }

    const starters = await page.$$('#starter-selection-modal img');
    if (starters.length > 0) {
        await starters[0].click();
        await page.waitForTimeout(1000);
    }

    await page.evaluate(() => {
        if(window.openPokeMarketBuy) {
            window.openPokeMarketBuy();
        }
    });

    await page.waitForTimeout(1000);

    // Take screenshot at large size
    await page.screenshot({ path: '/home/jules/verification/screenshots/market_responsive_1280.png' });

    await page.setViewportSize({ width: 800, height: 600 });
    await page.waitForTimeout(1000);
    await page.screenshot({ path: '/home/jules/verification/screenshots/market_responsive_800.png' });

    await page.setViewportSize({ width: 400, height: 600 });
    await page.waitForTimeout(1000);
    await page.screenshot({ path: '/home/jules/verification/screenshots/market_responsive_400.png' });

    await browser.close();
})();
