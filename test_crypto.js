const { chromium } = require('@playwright/test');
(async () => {
  const browser = await chromium.launch();
  const page = await browser.newPage();
  await page.goto('file://' + __dirname + '/index.html');
  const result = await page.evaluate(() => {
    return typeof crypto.randomUUID === 'function';
  });
  console.log('crypto.randomUUID available:', result);
  await browser.close();
})();
