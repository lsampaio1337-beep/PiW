const { chromium } = require('playwright');
const path = require('path');
(async () => {
  const browser = await chromium.launch({ headless: true, args: ['--disable-web-security', '--no-sandbox'] });
  const context = await browser.newContext({ recordVideo: { dir: '/home/jules/verification/videos' } });
  const page = await context.newPage();
  await page.goto(`file://${path.resolve('index.html')}`);
  await page.waitForTimeout(1000);
  await page.screenshot({ path: '/home/jules/verification/screenshots/dummy.png' });
  await context.close();
  await browser.close();
})();
