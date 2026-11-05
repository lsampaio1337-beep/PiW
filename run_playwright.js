const { chromium } = require('playwright');
const path = require('path');

(async () => {
  const browser = await chromium.launch();
  const context = await browser.newContext();
  const page = await context.newPage();

  await page.goto(`file://${path.resolve('index.html')}`);

  // Inject mock state to bypass tutorial and populate medals and upgrades
  await page.evaluate(() => {
    // Override init
    if (typeof window.state === 'undefined') {
       window.state = {};
    }

    // Bypass tutorial by removing it if present
    const tutorial = document.getElementById('tutorial-overlay');
    if (tutorial) tutorial.remove();

    // Inject mock data for trainer stats
    window.state.stats = {
      playtime: 3661, // 1 hour, 1 minute, 1 second
      caughtSpeciesCount: 151
    };
    window.state.globalStats = { playtime: 3661 };
    window.state.currentRegion = 1;
    window.state.currentRegionName = 'Kanto';

    // Add Medals
    if (!window.state.achievements) window.state.achievements = {};
    window.state.achievements['1'] = {
      league: true,
      caughtAll: true,
      caughtAllShiny: true,
    };

    // Add Upgrades
    if (!window.state.upgrades) window.state.upgrades = {};
    window.state.upgrades.storage = 2; // Level 2 storage

    if (typeof window.showTrainerStats === 'function') {
      window.showTrainerStats();
    }
  });

  await page.waitForTimeout(1000);
  await page.screenshot({ path: 'medals_tab_fixed.png' });

  // Click first medal item to open inner modal
  await page.evaluate(() => {
    const medal = document.querySelector('.medal-item');
    if (medal) medal.click();
  });
  await page.waitForTimeout(500);
  await page.screenshot({ path: 'medals_modal_fixed.png' });

  // Close inner modal
  await page.evaluate(() => {
    const closeBtn = document.querySelector('.main-view-inner-modal-close');
    if (closeBtn) closeBtn.click();
  });

  // Switch to upgrades tab
  await page.evaluate(() => {
    const btn = Array.from(document.querySelectorAll('.app-window-tab')).find(el => el.textContent.includes('Upgrades'));
    if (btn) btn.click();
  });
  await page.waitForTimeout(500);

  // Click upgrade item
  await page.evaluate(() => {
    const upgrade = document.querySelector('.upgrade-item');
    if (upgrade) upgrade.click();
  });
  await page.waitForTimeout(500);
  await page.screenshot({ path: 'upgrades_modal_fixed.png' });

  await browser.close();
})();
