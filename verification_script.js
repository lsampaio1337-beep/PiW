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

    // Give time for Oak Lab and assignments popups to appear
    await page.waitForTimeout(1000);

    // Try to navigate directly to Route 1 which should close modal and trigger battle start
    console.log("Navigating to Route 1...");
    await page.evaluate(() => {
        if (window.navigateToLocation) {
            window.navigateToLocation("Route 1");
        } else {
            console.log("window.navigateToLocation not found");
        }
    });

    // Wait for battle container to appear
    try {
        await page.waitForSelector('#battle-active-items-container', { state: 'visible', timeout: 5000 });
        console.log("Battle items container is visible.");

        // Take a screenshot of the main state before clicking threshold
        await page.screenshot({ path: 'verification/screenshots/verification_route1_success.png' });

        // Click the threshold card
        await page.click('#smartwatch-threshold-card');
        console.log("Clicked threshold card");

        // Wait for the popup
        await page.waitForSelector('#threshold-popup', { state: 'visible', timeout: 2000 });

        // Take final screenshot
        await page.screenshot({ path: 'verification/screenshots/verification_threshold_popup.png' });
        console.log("Done! Screenshots saved.");
    } catch(e) {
        console.log("Failed to show active items container or popup: " + e.message);
        await page.screenshot({ path: 'verification/screenshots/verification_fail.png' });
    }

    await browser.close();
})();
