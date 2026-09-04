const { chromium } = require('playwright');

(async () => {
  const browser = await chromium.launch();
  const page = await browser.newPage();

  await page.goto('http://127.0.0.1:8000');

  const splash = await page.locator('#splash-screen').isVisible();
  if (splash) {
      await page.click('#splash-screen');
      await page.waitForTimeout(500);

      const newGameBtn = page.locator('#btn-new-game');
      if (await newGameBtn.isVisible()) {
          await newGameBtn.click();
          await page.waitForTimeout(500);
      }

      const char = page.locator('img[src="Assets/Pokemon/Front/1.png"]');
      if (await char.isVisible()) {
          await char.click();
          await page.waitForTimeout(500);
      }

      // Navigate to Market
      await page.evaluate(() => { window.navigateToLocation("PokeCenter & PokeMarket"); });
      await page.waitForTimeout(500);

      // Trigger Sell Mode
      await page.click('#btn-market-sell');
      await page.waitForTimeout(500);

      const sellModeTxt = await page.locator('text=SELLING MODE').isVisible();
      if(sellModeTxt) {
          console.log("SUCCESS: Selling mode visible.");
      } else {
          console.log("FAILURE: Selling mode not visible.");
      }

      await browser.close();
  }
})();
