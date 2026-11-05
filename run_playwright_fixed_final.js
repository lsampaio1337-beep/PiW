const { chromium } = require('playwright');
const path = require('path');

(async () => {
  const browser = await chromium.launch({ headless: true, args: ['--disable-web-security', '--no-sandbox'] });
  const context = await browser.newContext();
  const page = await context.newPage();

  await page.goto(`file://${path.resolve('index.html')}`);
  await page.waitForTimeout(3000);

  // Use the game's actual internal initialization
  await page.evaluate(async () => {
      // Run full initialization
      if (typeof window.init === 'function') {
         await window.init();
      }

      // Mock state post-init
      window.state.tutorialFinished = true;

      // Ensure achievements and upgrades exist
      if (!window.state.achievements) window.state.achievements = {};
      if (!window.state.upgrades) window.state.upgrades = {};

      window.state.stats.playtime = 3661;
      window.state.stats.caughtSpeciesCount = 151;
      window.state.stats.shinyCaughtSpeciesCount = 10;

      window.state.globalStats.playtime = 3661;
      window.state.currentRegion = 1;
      window.state.currentRegionName = 'Kanto';

      window.state.achievements['1'] = { league: true, caughtAll: true, caughtAllShiny: true };
      window.state.upgrades.storage = 2;

      // Hide tutorial overlay if it's there
      const tutorial = document.getElementById('tutorial-overlay');
      if (tutorial) tutorial.style.display = 'none';

      // Open Trainer Stats window
      window.showTrainerStats('medals');
  });
  await page.waitForTimeout(2000);

  await page.screenshot({ path: 'test_click_0.png' });

  // Click first medal item to open inner modal
  await page.evaluate(() => { const medal = document.querySelector('.medal-item'); if (medal) medal.click(); });
  await page.waitForTimeout(2000);
  await page.screenshot({ path: 'test_click_1.png' });

  // Is inner modal visible?
  const visible = await page.evaluate(() => {
    const el = document.getElementById('trainer-stats-inner-modal');
    return el && el.style.display !== 'none';
  });
  console.log("Inner modal visible?", visible);

  await browser.close();
})();
