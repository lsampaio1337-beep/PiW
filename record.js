const { chromium } = require('playwright');
const path = require('path');

(async () => {
    const browser = await chromium.launch();
    const context = await browser.newContext({
        recordVideo: {
            dir: '.',
            size: { width: 1024, height: 768 }
        }
    });
    const page = await context.newPage();
    // Using file protocol but allowing access to local files
    await page.goto('file://' + path.resolve('demo.html'));

    // Wait for a few seconds to record
    await page.waitForTimeout(5000);

    await context.close();
    await browser.close();

    const videoPath = await page.video().path();
    const fs = require('fs');
    fs.renameSync(videoPath, path.join(__dirname, 'machop-animations.webm'));
    console.log("Video saved to:", 'machop-animations.webm');
})();
