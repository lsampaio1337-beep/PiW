const { test, expect } = require('@playwright/test');
const fs = require('fs');

test('dayCare breeding logic fixes floating point properly 2', async ({ page }) => {
    // Navigate to a blank page
    await page.route('**/*', route => route.fulfill({ body: '<html><body></body></html>', contentType: 'text/html' }));
    await page.goto('http://localhost:8080/');

    const dayCareCode = fs.readFileSync('src/dayCare.js', 'utf8');
    const cleanedCode = dayCareCode.replace('export default DayCare;', 'window.DayCare = DayCare;');

    await page.evaluate(`
        ${cleanedCode}
    `);

    // We mock Math.random to return something that gives precision issues if added naively
    const result = await page.evaluate(() => {
        Math.random = () => 0.05 / 0.11; // 0.05 * 11 / 11 = 0.05. Math.floor(0.4545 * 11)/100 = 0.05

        const gameState = {};
        const daycare = new window.DayCare(gameState);

        window.trackDailyChallenge = () => {};

        let prevQual = 1.05;
        // 1.05 + 0.05 rand = 1.10. sometimes 1.100000000000001 or 1.099999999999999 depending on how JS feels
        daycare.slot1.pokemon = { quality: prevQual };
        daycare.slot1.isBreeding = true;
        daycare.slot1.requiredBattles = 1; // trigger in next
        daycare.slot1.battles = 0;

        daycare.tickBattle();

        return daycare.slot1.pokemon.quality;
    });

    console.log("Result quality (expected 1.1):", result);
    expect(result).toBeLessThanOrEqual(1.99);

    // Check that it's rounded properly
    const parts = String(result).split('.');
    if (parts.length > 1) {
        expect(parts[1].length).toBeLessThanOrEqual(2);
    }
});
