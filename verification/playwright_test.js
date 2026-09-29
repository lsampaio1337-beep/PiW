const { chromium } = require('playwright');
const path = require('path');

(async () => {
  const browser = await chromium.launch({ args: ['--disable-web-security'] });
  const context = await browser.newContext({
    viewport: { width: 1280, height: 720 },
    bypassCSP: true
  });
  const page = await context.newPage();

  const fileUrl = 'file://' + path.resolve(__dirname, '../index.html');
  await page.goto(fileUrl);

  await page.evaluate(() => { localStorage.clear(); });
  await page.reload();

  await page.waitForTimeout(2000);
  await page.screenshot({ path: 'verification/screenshots/verification_debug1.png' });

  try {
    await page.waitForSelector('#btn-new-profile', { timeout: 10000 });
    await page.click('#btn-new-profile');

    await page.waitForTimeout(1000);
    await page.screenshot({ path: 'verification/screenshots/verification_debug2.png' });

    await page.waitForSelector('#choose-bulbasaur');
    await page.click('#choose-bulbasaur');
  } catch(e) {
    console.log("Error in profile creation", e);
  }

  await page.waitForTimeout(2000);
  await page.screenshot({ path: 'verification/screenshots/verification_debug3.png' });

  await browser.close();
})();
