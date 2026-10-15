import { chromium } from 'playwright';
(async () => {
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext();
  const page = await context.newPage();

  await page.goto('http://localhost:3000', { waitUntil: 'networkidle' });

  const title = await page.title();
  console.log("Page title is:", title);

  const hasError = await page.evaluate(() => {
    return document.body.innerHTML.includes('SyntaxError') || document.body.innerHTML.includes('Failed to load');
  });

  if (hasError) {
      console.log("Found error on page!");
  } else {
      console.log("No obvious syntax errors on page load.");
  }

  await browser.close();
})();
