const { chromium } = require('playwright');

(async () => {
    const browser = await chromium.launch({ args: ['--no-sandbox'] });
    const context = await browser.newContext();
    const page = await context.newPage();

    await page.setViewportSize({ width: 1200, height: 800 });

    console.log('Navigating to local server...');
    await page.goto('http://localhost:8080');

    // Wait a bit for initial load
    await page.waitForTimeout(2000);

    console.log('Hiding overlays and forcing Trainer Stats...');
    await page.evaluate(() => {
        // Hide overlays
        const overlays = document.querySelectorAll('#introOverlay, #gameOverlay, .window-container, .modal-backdrop');
        overlays.forEach(o => o.style.display = 'none');

        // Setup state
        window.state = window.state || { stats: {} };
        window.state.stats = window.state.stats || {};
        window.state.currentRegionName = 'Johto';
        window.state.regions = {
            'Kanto': {
                stats: {
                    completedChallengeIds: ['Champion Blue'],
                    caughtSpeciesCount: 151,
                    caughtShiniesSpecies: {}
                }
            }
        };

        for (let i = 1; i <= 151; i++) {
            window.state.regions['Kanto'].stats.caughtShiniesSpecies[i] = 1;
        }

        // Show Trainer Stats
        window.showTrainerStats();
    });

    await page.waitForTimeout(1000);

    console.log('Switching to Medals tab...');
    await page.evaluate(() => {
        const medalsTabBtn = document.querySelector('button[onclick*="medals"]');
        if (medalsTabBtn) {
            medalsTabBtn.click();
        }

        // Bring to front and ensure visible
        const windows = document.querySelectorAll('.window-container');
        windows.forEach(w => {
            if (w.innerHTML.includes('Trainer Stats')) {
                w.style.display = 'block';
                w.style.zIndex = 9999;
                w.style.opacity = 1;
            }
        });
    });

    await page.waitForTimeout(1000);

    const screenshotPath = '/home/jules/verification/screenshots/verification-johto-medals.png';
    await page.screenshot({ path: screenshotPath });
    console.log(`Screenshot saved to ${screenshotPath}`);

    await browser.close();
    console.log('Done.');
})();
