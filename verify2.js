const { chromium } = require('playwright');

(async () => {
    const browser = await chromium.launch();
    const page = await browser.newPage();

    // Mock Electron APIs
    await page.addInitScript(() => {
        window.require = function (moduleName) {
            if (moduleName === 'electron') {
                return {
                    ipcRenderer: {
                        on: () => {},
                        send: () => {},
                        removeAllListeners: () => {},
                        invoke: async () => {}
                    }
                };
            }
            if (moduleName === 'fs') {
                return {
                    existsSync: () => false,
                    readFileSync: () => '',
                    writeFileSync: () => {}
                };
            }
            if (moduleName === 'path') {
                return { join: (...args) => args.join('/') };
            }
            return {};
        };
    });

    await page.goto('http://localhost:3000');
    console.log("Navigated to page");

    try {
        await page.evaluate(() => {
            window.showSettings();
        });

        await page.waitForSelector('#window-settings', { timeout: 5000 });
        console.log("Settings opened");

    } catch (e) {
        console.error("Test failed: ", e);
    }
    await browser.close();
    process.exit(0);
})();
