const { _electron: electron } = require('playwright');
const fs = require('fs');
const path = require('path');

(async () => {
    fs.mkdirSync('/home/jules/verification/videos', { recursive: true });

    // Electron's Playwright integration handles videos slightly differently
    const app = await electron.launch({
        args: ['.'],
        executablePath: '/app/node_modules/electron/dist/electron',
        recordVideo: { dir: '/home/jules/verification/videos/' }
    });
    const window = await app.firstWindow();

    await window.waitForLoadState('networkidle');
    await window.waitForTimeout(1000);

    await window.evaluate(() => {
        if (window.startNewGame) window.startNewGame();
        if (window.selectStarter) window.selectStarter(1);
    });
    await window.waitForTimeout(1000);

    // Open calendar
    await window.evaluate(() => {
        if (window.showCalendar) window.showCalendar('activities');
    });
    await window.waitForTimeout(2000);

    // Click shop tab
    await window.evaluate(() => {
        if (window.showCalendar) window.showCalendar('shop');
    });
    await window.waitForTimeout(2000);

    await app.close();
})();
