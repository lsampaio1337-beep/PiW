const { chromium } = require('playwright');
const path = require('path');

(async () => {
    const browser = await chromium.launch({ headless: true });
    const page = await browser.newPage();
    const filePath = 'file://' + path.resolve('index.html');
    await page.goto(filePath);

    // Give it a moment to load
    await page.waitForTimeout(1000);

    // Dismiss splash screen if present
    const splash = await page.$('#splash-screen');
    if (splash) {
        await page.evaluate(() => {
            document.getElementById('splash-screen').style.display = 'none';
        });
    }

    // click start
    await page.waitForTimeout(500);
    const startBtn = await page.$('text="Start Game"');
    if (startBtn) await startBtn.click();
    await page.waitForTimeout(1000);

    // Click calendar icon
    await page.click('#btn-calendar');
    await page.waitForTimeout(1000);

    // Take screenshot of modal
    await page.screenshot({ path: 'verification/screenshots/verification_final_modal.png' });

    // Click the first card
    await page.evaluate(() => {
        const cards = document.querySelectorAll('#calendar-grid > div');
        if (cards && cards.length > 0) {
            cards[0].click();
        }
    });

    await page.waitForTimeout(500);
    await page.screenshot({ path: 'verification/screenshots/verification_final_claimed.png' });

    await browser.close();
    console.log("Screenshots generated.");
})();
