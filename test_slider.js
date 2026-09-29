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

    // 1. Open potion popup to generate the threshold card DOM
    await page.evaluate(() => {
        window.showActiveItemSelection('potion');
    });

    const thresholdCardInMain = await page.$('#smartwatch-threshold-card');
    console.log("Threshold card in main view? (should be null):", thresholdCardInMain);

    // Check for threshold card in popup
    const thresholdCardInPopup = await page.$('#smartwatch-potion-threshold-card');
    console.log("Threshold card in popup? (should not be null):", thresholdCardInPopup);

    // 2. Click threshold card in popup (which opens the slider and DESTROYS the potion popup DOM, thus destroying the card)
    await page.evaluate(() => {
        window.showActiveItemSelection('threshold');
    });

    // 3. Drag slider
    await page.evaluate(() => {
        let slider = document.getElementById('smartwatch-popup-threshold-slider');
        slider.value = 60;
        slider.dispatchEvent(new Event('input'));
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

    // Notice: if we open the 'threshold' popup, it overwrites the 'potion' popup content because they share the same container
    // So the card itself won't be in the DOM to be updated, but the slider label will

    let sliderLabelText = await page.evaluate(() => {
        return document.getElementById('smartwatch-popup-threshold-val').textContent;
    });
    console.log("New slider label text:", sliderLabelText);

    await browser.close();
})();
