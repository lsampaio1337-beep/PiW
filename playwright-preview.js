const { chromium } = require('playwright');

(async () => {
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage({
    viewport: { width: 1000, height: 800 },
    recordVideo: {
      dir: '/tmp/'
    }
  });

  await page.goto('http://localhost:8000/animation_preview.html');
  await page.waitForTimeout(4000);

  const videoPath = await page.video().path();
  console.log("Video saved to: " + videoPath);

  await browser.close();
})();
