const { _electron: electron } = require('playwright');

(async () => {
    const app = await electron.launch({ args: ['.'], executablePath: '/app/node_modules/electron/dist/electron' });
    const window = await app.firstWindow();

    // Wait for the app to load completely
    await window.waitForLoadState('networkidle');

    // Start game and select starter if needed
    await window.evaluate(() => {
        if (window.startNewGame) window.startNewGame();
        if (window.selectStarter) window.selectStarter(1);
    });

    // Open the calendar modal
    await window.evaluate(() => {
        if (window.showCalendar) window.showCalendar('activities');
    });

    // Take screenshot of the calendar tab
    await window.waitForTimeout(1000); // Wait for modal to render
    await window.screenshot({ path: 'calendar_activities.png' });

    // Open the shop tab
    await window.evaluate(() => {
        if (window.showCalendar) window.showCalendar('shop');
    });

    await window.waitForTimeout(1000);
    await window.screenshot({ path: 'calendar_shop.png' });

    await app.close();
})();
