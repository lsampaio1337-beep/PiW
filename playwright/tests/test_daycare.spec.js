const { test, expect } = require('@playwright/test');
const fs = require('fs');

test('dayCare breeding logic fixes floating point and caps properly', async ({ page }) => {
    // Navigate to a blank page
    await page.route('**/*', route => route.fulfill({ body: '<html><body></body></html>', contentType: 'text/html' }));
    await page.goto('http://localhost:8080/');

    const dayCareCode = fs.readFileSync('src/dayCare.js', 'utf8');
    const cleanedCode = dayCareCode.replace('export default DayCare;', 'window.DayCare = DayCare;');

    await page.evaluate(`
        ${cleanedCode}
    `);

    const result = await page.evaluate(() => {
        const gameState = {};
        const daycare = new window.DayCare(gameState);

        window.trackDailyChallenge = () => {};

        let prevQual = 1.95;
        daycare.slot1.pokemon = { quality: prevQual };
        daycare.slot1.isBreeding = true;
        daycare.slot1.requiredBattles = 1; // trigger in next
        daycare.slot1.battles = 0;

        daycare.tickBattle();

        return daycare.slot1.pokemon.quality;
    });

    console.log("Result quality:", result);
    expect(result).toBeLessThanOrEqual(1.99);

    // Check that it's rounded properly
    const parts = String(result).split('.');
    if (parts.length > 1) {
        expect(parts[1].length).toBeLessThanOrEqual(2);
    }
});
