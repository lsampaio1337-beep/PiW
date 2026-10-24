const { chromium } = require('playwright');
(async () => {
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({ viewport: { width: 1280, height: 720 } });
  const page = await context.newPage();

  await page.goto('http://localhost:3000');

  // Wait for the game to load
  await page.waitForTimeout(1000);

  // Evaluate setup logic - create a state
  await page.evaluate(() => {
    // Attempt to bypass main menu to game
    if (window.selectGameSave) {
        window.selectGameSave(1); // Start/load a save
    }
  });

  await page.waitForTimeout(1000);

  await page.evaluate(() => {
    if (window.showTrainerStats) {
      window.showTrainerStats('medals');
    }
  });

  await page.waitForTimeout(1000);

  await page.screenshot({ path: 'medals_screenshot3.png' });
  await browser.close();
})();
