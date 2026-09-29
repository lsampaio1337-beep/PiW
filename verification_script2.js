const { chromium } = require('playwright');
const path = require('path');

(async () => {
    const browser = await chromium.launch({
        headless: true,
        args: ['--disable-web-security', '--no-sandbox']
    });
    const context = await browser.newContext();
    const page = await context.newPage();

    // Use absolute path to index.html
    const filePath = 'file://' + path.resolve(__dirname, 'index.html');
    await page.goto(filePath);

    // Initial setup
    await page.waitForSelector('#btn-new-profile');
    await page.click('#btn-new-profile');
    await page.waitForSelector('#choose-bulbasaur');
    await page.click('#choose-bulbasaur');

    await page.waitForTimeout(1000);

    // Close modal via UI directly
    console.log("Closing modals...");
    await page.evaluate(() => {
        if (window.closeModal) window.closeModal();
    });

    await page.waitForTimeout(500);

    // Click on nav button map if needed
    console.log("Clicking map button...");
    await page.evaluate(() => {
        const btnMap = document.getElementById('btn-map');
        if (btnMap) btnMap.click();
    });

    await page.waitForTimeout(500);

    // Now navigate
    console.log("Navigating to Route 1...");
    await page.evaluate(() => {
        if (window.navigateToLocation) {
            window.navigateToLocation("Route 1");
        } else {
            console.log("window.navigateToLocation not found");
        }
    });

    await page.waitForTimeout(1000);

    try {
        await page.screenshot({ path: 'verification/screenshots/verification_route1_debug2.png' });
        console.log("Screenshot saved.");
    } catch(e) {
        console.log("Error: " + e.message);
    }

    await browser.close();
})();
