const { chromium } = require('playwright');
const path = require('path');
const fs = require('fs');

(async () => {
    let browser;
    try {
        const appDir = path.resolve(__dirname);
        const indexPath = `file://${appDir}/index.html`;

        browser = await chromium.launch({
            headless: true,
            args: ['--disable-web-security', '--no-sandbox']
        });
        const context = await browser.newContext();
        const page = await context.newPage();

        page.on('console', msg => console.log('BROWSER:', msg.text()));
        page.on('pageerror', err => console.log('BROWSER ERROR:', err.message));

        await page.goto(indexPath);
        await page.waitForLoadState('domcontentloaded');

        await page.waitForSelector('#btn-new-profile');
        await page.click('#btn-new-profile');

        await page.waitForSelector('#choose-bulbasaur');
        await page.click('#choose-bulbasaur');

        await page.waitForTimeout(1000);
        await page.evaluate(() => {
            if (typeof window.closeModal === 'function') {
                window.closeModal();
            }
        });

        await page.waitForTimeout(500);
        await page.evaluate(() => {
            if (typeof window.closeModal === 'function') {
                window.closeModal();
            }
        });

        await page.waitForTimeout(500);

        // Click on the map button
        await page.click('#btn-map');
        await page.waitForTimeout(500);

        await page.evaluate(() => {
            if (typeof window.navigateToLocation === 'function') {
                window.navigateToLocation("Route 1");
            }
        });

        await page.waitForTimeout(2000); // Wait for battle to start and UI to settle

        // Take a screenshot of the main view
        const dir = 'verification/screenshots';
        if (!fs.existsSync(dir)){
            fs.mkdirSync(dir, { recursive: true });
        }
        await page.screenshot({ path: `${dir}/verification_battle.png` });

        // Click the threshold card
        await page.click('#smartwatch-threshold-card');

        await page.waitForTimeout(1000); // Wait for popup to open

        // Take screenshot of popup
        await page.screenshot({ path: `${dir}/verification_popup.png` });

        console.log("Screenshots captured successfully.");
    } catch (e) {
        console.error("Verification failed:", e);
    } finally {
        if (browser) {
            await browser.close();
        }
    }
})();
