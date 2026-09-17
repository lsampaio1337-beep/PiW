const { chromium } = require('playwright');
const fs = require('fs');

(async () => {
    const browser = await chromium.launch({ headless: true });
    const context = await browser.newContext();
    const page = await context.newPage();

    await page.goto('http://localhost:8080');

    // Wait for the app to load
    await page.waitForTimeout(1000);

    // Mock profile to bypass start screen
    const mockProfile = {
        profileName: "TestUser",
        trainer: { badges: 0 },
        party: [],
        stats: { seenSpecies: {"Bulbasaur": true}, caughtSpecies: {"Bulbasaur": true} },
        config: { unlocks: [] }
    };
    await page.evaluate((profile) => {
        localStorage.setItem('idle_pokemon_world_profiles', JSON.stringify(['profile_test1']));
        localStorage.setItem('profile_test1', JSON.stringify(profile));
    }, mockProfile);

    await page.reload();
    await page.waitForTimeout(2000);

    // Open Pokedex
    await page.evaluate(() => {
        if(window.showPokedex) window.showPokedex();
    });
    await page.waitForTimeout(1000);
    await page.screenshot({ path: 'pokedex.png' });

    // Open Dex Entry
    await page.evaluate(() => {
        if(window.showDexEntry) window.showDexEntry(1);
    });
    await page.waitForTimeout(1000);
    await page.screenshot({ path: 'dex_entry.png' });

    await browser.close();
})();
