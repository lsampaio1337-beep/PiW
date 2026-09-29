const { chromium } = require('playwright');
const path = require('path');

(async () => {
  const browser = await chromium.launch();
  const context = await browser.newContext({
    viewport: { width: 1280, height: 720 },
    bypassCSP: true
  });
  const page = await context.newPage();

  const fileUrl = 'file://' + path.resolve(__dirname, '../index.html');
  await page.goto(fileUrl);

  await page.waitForTimeout(3000);

  // Close Professor Oak Lab popup if it's there
  try {
     await page.evaluate(() => {
        const bg = document.getElementById('window-bg');
        if (bg) bg.click();
     });
  } catch (e) {}

  await page.waitForTimeout(1000);

  // Directly load Route 1 to enter battle view
  await page.evaluate(() => {
      if (window.loadRoute) {
          window.loadRoute('Route 1');
      }
  });

  await page.waitForTimeout(2000);

  await page.evaluate(() => {
      if (document.getElementById('smartwatch-threshold-card')) {
          document.getElementById('smartwatch-threshold-card').click();
      } else {
          console.log("No card found");
      }
  });

  await page.waitForTimeout(1000);

  await page.screenshot({ path: 'verification/screenshots/verification6.png' });

  await browser.close();
})();
