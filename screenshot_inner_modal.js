const { chromium } = require('playwright');

(async () => {
    const browser = await chromium.launch();
    const page = await browser.newPage();
    await page.goto('http://localhost:3000/index.html');
    await page.waitForFunction('typeof window.startNewGame === "function"');

    // Evaluate script to trigger our new inner modal
    await page.evaluate(() => {
        window.startNewGame();
        window.selectStarter(1); // Bulbasaur

        // Force the unlock
        window.state.stats.playtime = 3600;
        window.state.stats.hasSeenZzZIcon = false; // Ensures icon displays
        window.state.stats.hasSeenZzZTutorial = false; // Forces the inner modal to show up

        // Let UI loop run, then trigger the click programmatically
        setTimeout(() => {
           window.updateTopbar(); // forces UI to recalculate unlocks

           setTimeout(() => {
               const sleepBtn = document.getElementById('btn-sleep');
               if (sleepBtn) sleepBtn.click();
           }, 500);

        }, 500);
    });

    await page.waitForTimeout(2000); // Wait for modal to render

    await page.screenshot({ path: '/home/jules/verification/screenshots/overlay-inner.png', fullPage: false });
    console.log("Screenshot saved!");

    await browser.close();
})();
