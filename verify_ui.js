const { chromium } = require('playwright');
const path = require('path');

(async () => {
    const browser = await chromium.launch();
    const context = await browser.newContext();
    const page = await context.newPage();

    // Convert current dir to file URL
    const fileUrl = 'file://' + path.resolve('index.html');
    await page.goto(fileUrl);

    // Dismiss splash screen
    await page.click('#splash-screen');

    // Wait for Oak's lab
    await page.waitForSelector('#choose-bulbasaur', { state: 'visible' });
    await page.click('#choose-bulbasaur');

    // Start battle
    await page.click('#nav-map');
    await page.waitForSelector('.map-spot', { state: 'visible' });

    // Click route 1
    const spots = await page.$$('.map-spot');
    await spots[0].click();

    await page.waitForTimeout(1500); // Wait for searching/sliding to start

    await page.screenshot({ path: 'battle_ui.png' });

    await browser.close();
})();
