const { chromium } = require('playwright');

(async () => {
    const browser = await chromium.launch({ headless: true });
    const page = await browser.newPage({ viewport: { width: 1280, height: 720 } });
    await page.goto('http://localhost:3000');
    await page.waitForTimeout(2000);
    await page.evaluate(() => {
        // mock state enough for just ui test
        window.state = {
            stats: { caughtSpecies: {}, caughtSpeciesCount: 10 },
            regions: {
                Kanto: { stats: { caughtSpecies: {}, caughtSpeciesCount: 10 } },
                Johto: { stats: { caughtSpecies: {}, caughtSpeciesCount: 10 } }
            },
            currentRegionName: 'Kanto',
            config: { balance: { expansions: {} } },
            party: [],
            storage: []
        };
        // instead of game logic just create modal
        const html = '<div style="display: grid; grid-template-columns: repeat(2, 1fr); grid-template-rows: repeat(5, 1fr); gap: 10px; padding: 10px; height: 100%; overflow: hidden; box-sizing: border-box;"><div style="background: red;">1</div><div style="background: red;">2</div><div style="background: red;">3</div><div style="background: red;">4</div><div style="background: red;">5</div><div style="background: red;">6</div><div style="background: red;">7</div><div style="background: red;">8</div><div style="background: red;">9</div><div style="background: red;">10</div></div>';

        window.windowManager.createDynamicWindow('window-trainer', 'Trainer', html, '800px', 'auto');
    });
    await page.waitForTimeout(1000);
    await page.screenshot({ path: 'test_modal_screenshot.png' });

    const sizes = await page.evaluate(() => {
        const win = document.getElementById('window-trainer');
        if (!win) return { error: "no window-trainer" };
        const grid = win.querySelector('.content-panel > div');
        const header = win.querySelector('.window-header');
        return {
            windowRect: win.getBoundingClientRect(),
            gridRect: grid ? grid.getBoundingClientRect() : null,
            headerRect: header ? header.getBoundingClientRect() : null,
            contentPanelRect: win.querySelector('.content-panel').getBoundingClientRect(),
            innerHeight: window.innerHeight
        };
    });
    console.log(sizes);
    await browser.close();
})();
