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
    await page.goto('file://' + path.resolve('demo-anim10.html'));

    // Wait for a few seconds to record
    await page.waitForTimeout(5000);

    await context.close();
    await browser.close();

    const videoPath = await page.video().path();
    const fs = require('fs');
    fs.renameSync(videoPath, path.join(__dirname, 'anim10-random.webm'));
    console.log("Video saved to: anim10-random.webm");
})();
