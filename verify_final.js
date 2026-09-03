const { chromium } = require('playwright');

(async () => {
  const browser = await chromium.launch();
  const context = await browser.newContext();
  const page = await context.newPage();

  // Wait a moment for server
  await new Promise(r => setTimeout(r, 1000));

  await page.goto('http://localhost:8080/index.html');
  await page.waitForTimeout(1000);

  // Click modal overlay to close intro
  await page.mouse.click(5, 5);
  await page.waitForTimeout(500);

  // Use evaluate to bypass UI locks for test
  await page.evaluate(() => {
    // Override calendar
    document.getElementById('btn-calendar').click();
  });

  await page.waitForTimeout(1000);
  await page.screenshot({ path: 'verification/screenshots/verification_final.png' });

  await browser.close();
  console.log('done');
})();
