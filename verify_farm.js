const { chromium } = require('playwright');

(async () => {
    const browser = await chromium.launch();
    const page = await browser.newPage();

    // Pass logs to node console
    page.on('console', msg => console.log('PAGE LOG:', msg.text()));

    await page.goto('http://127.0.0.1:8000/index.html');

    await page.waitForTimeout(500);

    // Setup mock save profile and settings to trigger zzz-modal testing
    await page.evaluate(() => {
        const mockState = {
            id: 'mock-id',
            playerName: "Mock",
            playtime: 100,
            isZzZMode: true,
            zzzTimestamp: Date.now() - ( (1*24*60*60*1000) + (2*60*60*1000) + (3*60*1000) + (4*1000) ), // 1d 2h 3m 4s
            currentRoute: "Route 1",
            settings: { activeBallTier: 0, activePotionTier: 0, isSleepModeActive: true, autoCatch: true },
            party: [{ id: 1, currentHp: 50, maxHp: 50, name: "Bulbasaur", level: 5, xp: 0, ev: 1 }],
            trainer: { money: 1543200 },
            stats: { caught: 0, shiniesCaught: 0 },
            backpack: { pokeballs: { "Pokeball": 100 }, potions: { "Tiny Potion": 100 } },
            storage: []
        };
        localStorage.setItem('idle_pokemon_world_profiles', JSON.stringify(['mock-id']));
        localStorage.setItem('idle_pokemon_world_mock-id', JSON.stringify(mockState));
    });

    await page.reload();

    await page.waitForTimeout(1000);
    await page.evaluate(() => {
        document.getElementById('splash-screen').style.display = 'none';
        window.loadProfile('mock-id');
    });

    await page.waitForTimeout(2000);

    // Wait for the modal and click Yes
    await page.evaluate(() => {
        document.getElementById('btn-zzz-resume-yes').click();
    });

    await page.waitForTimeout(2000);

    // Output HTML to inspect
    const resultsHtml = await page.evaluate(() => {
        return document.getElementById('zzz-results-content').innerHTML;
    });

    console.log("RESULTS HTML:");
    console.log(resultsHtml);

    await browser.close();
})();
