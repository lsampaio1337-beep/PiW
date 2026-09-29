const { chromium } = require('playwright');
const path = require('path');

(async () => {
    const browser = await chromium.launch({ headless: true, args: ['--no-sandbox', '--disable-web-security'] });
    const context = await browser.newContext();
    const page = await context.newPage();
    const filePath = 'file://' + path.resolve('index.html');
    await page.goto(filePath);

    // Initial setup
    const wipeSave = await page.$('#btn-wipe-save');
    if (wipeSave) {
        await wipeSave.click();
        await page.waitForTimeout(500);
        const confirmWipe = await page.$('#btn-confirm-wipe');
        if (confirmWipe) await confirmWipe.click();
    }
    await page.waitForSelector('#btn-new-profile');
    await page.click('#btn-new-profile');

    await page.waitForSelector('#choose-bulbasaur');
    await page.click('#choose-bulbasaur');

    // Simulate UI flow without full map navigation which is blocking
    // Just evaluate the function directly as if it was triggered via smartwatch UI

    // Evaluate to see if function exists
    let hasFunc = await page.evaluate(() => typeof window.setAutoPotionThreshold === 'function');
    console.log("has window.setAutoPotionThreshold?", hasFunc);

    // Call it manually to test state update
    await page.evaluate(() => {
        window.setAutoPotionThreshold(60);
    });

    let stateVal = await page.evaluate(() => {
        let storageRef = window.storageRef;
        if (!storageRef) return "No storageRef";
        let pid = storageRef.currentProfileId;
        if (!pid) return "No pid";
        let data = localStorage.getItem(pid);
        return data ? JSON.parse(data).settings.autoPotionThreshold : null;
    });
    console.log("New threshold in save:", stateVal);

    await browser.close();
})();
