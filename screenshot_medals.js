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
            regions: {
                Kanto: { stats: {} },
                Johto: { stats: {} },
                Hoenn: { stats: {} },
                Sinnoh: { stats: {} },
                Unova: { stats: {} },
                Kalos: { stats: {} },
                Alola: { stats: {} },
                Galar: { stats: {} },
                Hisui: { stats: {} },
                Paldea: { stats: {} },
            },
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

    await page.waitForTimeout(1000);
    await page.screenshot({ path: 'medals_screenshot.png' });
    await browser.close();
})();
