const { chromium } = require('playwright');

(async () => {
    const browser = await chromium.launch();
    const context = await browser.newContext();
    const page = await context.newPage();

    await page.goto('http://localhost:8000');
    await page.waitForTimeout(1000);

    // Click profile via evaluate to avoid intercepts
    await page.evaluate(() => {
        const btn = document.querySelector('#save-profile-list button');
        if (btn) btn.click();
    });

    // Bypass splash screen if visible
    await page.evaluate(() => {
        const splash = document.getElementById('splash-screen');
        if (splash) splash.style.display = 'none';
    });
    await page.waitForTimeout(500);

    // Check if new game
    await page.evaluate(() => {
        const btn = document.querySelector('#new-game-modal button');
        if (btn) btn.click();
    });
    await page.waitForTimeout(500);

    await page.evaluate(() => {
        const char = document.querySelector('img[src="./Assets/Pokemon/Front/Charmander.png"]');
        if (char) char.click();
    });
    await page.waitForTimeout(500);

    // Go to map
    await page.evaluate(() => {
        const mapBtn = document.getElementById('btn-map');
        if (mapBtn) mapBtn.click();
    });
    await page.waitForTimeout(500);

    // Click PokeCenter
    await page.evaluate(() => {
        const spot = Array.from(document.querySelectorAll('.map-spot')).find(el => el.onclick && el.onclick.toString().includes('PokeCenter'));
        if (spot) spot.click();
    });
    await page.waitForTimeout(500);

    // Open Buy Modal
    await page.evaluate(() => {
        const btn = document.getElementById('btn-market-buy');
        if (btn) btn.click();
    });
    await page.waitForTimeout(500);

    await page.screenshot({ path: 'modal_open.png' });

    await page.evaluate(() => {
        window.closeModal();
    });
    await page.waitForTimeout(500);

    await page.screenshot({ path: 'modal_closed.png' });

    // Open settings (normal modal)
    await page.evaluate(() => {
        const btn = document.getElementById('btn-settings');
        if (btn) btn.click();
    });
    await page.waitForTimeout(500);

    await page.screenshot({ path: 'modal_settings.png' });

    await browser.close();
})();
