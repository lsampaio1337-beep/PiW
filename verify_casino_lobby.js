const { chromium } = require('playwright');
const path = require('path');

(async () => {
    const browser = await chromium.launch();
    const context = await browser.newContext();
    const page = await context.newPage();

    const fileUrl = 'file://' + path.resolve('index.html');
    await page.goto(fileUrl);

    await page.waitForTimeout(500);
    await page.evaluate(() => {
        const splash = document.getElementById('splash-screen');
        if(splash) splash.click();
    });

    await page.waitForTimeout(500);

    const isNewGame = await page.evaluate(() => {
        const ng = document.getElementById('new-game-modal');
        if(ng && ng.style.display !== 'none') {
            const btns = Array.from(ng.querySelectorAll('button'));
            const nBtn = btns.find(b => b.textContent === 'New Game');
            if(nBtn) nBtn.click();
            return true;
        }
        return false;
    });

    await page.waitForTimeout(500);

    await page.evaluate(() => {
        const bulba = document.getElementById('starter-bulbasaur');
        if(bulba) bulba.click();
    });

    await page.waitForTimeout(1000);

    await page.evaluate(() => {
        // force display
        document.querySelectorAll('.game-view').forEach(v => v.style.display = 'none');
        document.getElementById('view-casino').style.display = 'block';
        if(window.navigateToLocation) window.navigateToLocation("Casino");
    });

    await page.waitForTimeout(1000);

    const viewCasino = await page.$('#view-casino');
    if (viewCasino) {
        await viewCasino.screenshot({ path: '/app/view_casino_centered.png' });
    }

    await browser.close();
})();
