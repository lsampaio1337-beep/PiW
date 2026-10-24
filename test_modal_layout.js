const { chromium } = require('playwright');
const path = require('path');

(async () => {
    const browser = await chromium.launch();
    const page = await browser.newPage();
    await page.goto(`file://${path.resolve('index.html')}`);

    await page.evaluate(async () => {
        window.state = {
            currentRegionName: 'Kanto',
            stats: {},
            regions: {},
            config: {
                balance: { expansions: { ballPocket: [], potionSatchel: [], pokemonBox: [], glass: [], smartwatch: [], speed: [], loot: [] } }
            }
        };
        const overlays = ['#introOverlay', '#gameOverlay', '#starterModal', '.modal-backdrop'];
        overlays.forEach(sel => {
            const el = document.querySelector(sel);
            if (el) el.style.display = 'none';
        });

        return new Promise((resolve) => {
            let attempts = 0;
            const check = setInterval(() => {
                attempts++;
                if (window.showTrainerStats) {
                    clearInterval(check);
                    window.showTrainerStats('medals');
                    resolve(true);
                } else if (attempts > 20) {
                    clearInterval(check);
                    resolve(false);
                }
            }, 100);
        });
    });

    await page.waitForTimeout(500);

    const layout = await page.evaluate(() => {
        const win = document.getElementById('window-trainer');
        if (!win) return null;

        const header = win.querySelector('.window-header');
        const container = win.querySelector('.window-content-container');
        const scaler = win.querySelector('.window-content-scaler');
        const panel = win.querySelector('.content-panel');
        const grid = panel.querySelector('div');
        const resizeHandle = win.querySelector('.window-resize-handle');

        return {
            window: win.getBoundingClientRect(),
            header: header ? header.getBoundingClientRect() : null,
            container: container ? container.getBoundingClientRect() : null,
            scaler: scaler ? scaler.getBoundingClientRect() : null,
            panel: panel ? panel.getBoundingClientRect() : null,
            grid: grid ? grid.getBoundingClientRect() : null,
            resizeHandle: resizeHandle ? resizeHandle.getBoundingClientRect() : null,
        };
    });

    console.log(JSON.stringify(layout, null, 2));
    await browser.close();
})();
