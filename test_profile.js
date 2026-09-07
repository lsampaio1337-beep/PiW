const { chromium } = require('playwright');
const path = require('path');

(async () => {
    const browser = await chromium.launch();
    const context = await browser.newContext();
    const page = await context.newPage();

    page.on('pageerror', err => {
        console.log('PAGE ERROR STACK:', err);
    });

    page.on('console', msg => {
        if(msg.type() === 'error') console.log('CONSOLE:', msg.text(), msg.location());
    });

    const fileUrl = 'http://127.0.0.1:8000/index.html';
    await page.goto(fileUrl);

    // Add fake profile
    await page.evaluate(() => {
        window.localStorage.setItem('idle_pokemon_world_profiles', JSON.stringify(['test']));
        window.localStorage.setItem('test', JSON.stringify({
            profileName: 'Test',
            stats: { playtime: 0 },
            lastPlayed: Date.now()
        }));
    });

    await page.reload();
    await page.waitForTimeout(1000);

    // Click new game
    const btn = await page.$('#btn-new-profile');
    if (btn) {
        // execute JS click
        await page.evaluate(b => b.click(), btn);
        console.log('clicked new game via evaluate');
    }

    await page.waitForTimeout(1000);
    await page.screenshot({ path: 'test_save_click.png' });

    await browser.close();
})();
