const { chromium } = require('playwright');

(async () => {
    const browser = await chromium.launch({ args: ['--no-sandbox'] });
    const context = await browser.newContext();
    const page = await context.newPage();

    await page.setViewportSize({ width: 1200, height: 800 });

    console.log('Navigating to local server...');
    await page.goto('http://localhost:8080');

    // Wait for JS to load
    await page.waitForTimeout(1500);

    console.log('Bypassing UI and injecting state...');
    await page.evaluate(() => {
        // Mock state
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

        // Hide anything blocking
        const overlay = document.getElementById('view-overlay');
        if(overlay) overlay.style.display = 'none';

        const gameViews = document.querySelectorAll('.game-view');
        gameViews.forEach(v => v.style.display = 'none');

        const mainView = document.getElementById('view-main');
        if (mainView) mainView.style.display = 'block';

        // Force open trainer stats
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

    const screenshotPath = '/home/jules/verification/screenshots/verification21.png';
    await page.screenshot({ path: screenshotPath });
    console.log(`Screenshot saved to ${screenshotPath}`);

    await browser.close();
    console.log('Done.');
})();
