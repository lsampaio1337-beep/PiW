const { chromium } = require('playwright');

(async () => {
    const browser = await chromium.launch({ args: ['--no-sandbox'] });
    const context = await browser.newContext();
    const page = await context.newPage();

    await page.setViewportSize({ width: 1200, height: 800 });

    console.log('Navigating to local server...');
    await page.goto('http://localhost:8080');

    // Wait for New Game button and click it to get out of the initial overlay
    await page.waitForSelector('button:has-text("New Game")');
    await page.click('button:has-text("New Game")');

    // Wait for the window manager to finish transition
    await page.waitForTimeout(500);

    // Skip Tutorial button
    await page.waitForSelector('button:has-text("Skip")');
    await page.click('button:has-text("Skip")');

    // Wait a moment for starters to load
    await page.waitForTimeout(1000);

    // Click on bulbasaur image
    await page.evaluate(() => {
        const starterImgs = document.querySelectorAll('img[src*="sprites/"]');
        if (starterImgs.length > 0) {
            starterImgs[0].click();
        }
    });

    console.log('Waiting for the game UI to load...');
    await page.waitForTimeout(2000);

    console.log('Injecting state...');
    await page.evaluate(() => {
        window.state = window.state || { stats: {} };
        window.state.stats = window.state.stats || {};
        window.state.stats.caughtSpecific = window.state.stats.caughtSpecific || {};
        window.state.stats.shinyCaughtSpecific = window.state.stats.shinyCaughtSpecific || {};
        window.state.stats.completedChallengeIds = window.state.stats.completedChallengeIds || [];

        // Kanto: All 3 Medals
        window.state.stats.completedChallengeIds.push('Champion Blue');
        for (let i = 1; i <= 151; i++) {
            window.state.stats.caughtSpecific[i] = 1;
            window.state.stats.shinyCaughtSpecific[i] = 1;
        }

        // Johto: 2 Medals (Bronze, Silver)
        window.state.stats.completedChallengeIds.push('Red');
        for (let i = 152; i <= 251; i++) {
            window.state.stats.caughtSpecific[i] = 1;
        }

        // Unova: 1 Medal (Bronze)
        window.state.stats.completedChallengeIds.push('Champion Alder');

        window.showTrainerStats();
    });

    await page.waitForTimeout(1000);

    console.log('Switching to Medals tab...');
    await page.evaluate(() => {
        const medalsTabBtn = document.querySelector('button[onclick*="medals"]');
        if (medalsTabBtn) {
            medalsTabBtn.click();
        }
    });

    await page.waitForTimeout(2000);

    // Make sure we bring the trainer stats window to front and it's not hidden
    await page.evaluate(() => {
        const windows = document.querySelectorAll('.window-container');
        windows.forEach(w => {
            if (w.innerHTML.includes('Medals')) {
                w.style.zIndex = 9999;
                w.style.opacity = 1;
                w.style.display = 'block';
            }
        });
    });

    const screenshotPath = '/home/jules/verification/screenshots/verification22.png';
    await page.screenshot({ path: screenshotPath });
    console.log(`Screenshot saved to ${screenshotPath}`);

    await browser.close();
    console.log('Done.');
})();
