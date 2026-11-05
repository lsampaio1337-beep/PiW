const { chromium } = require('playwright');
const path = require('path');

(async () => {
  const browser = await chromium.launch({ args: ['--disable-web-security', '--no-sandbox'] });
  const context = await browser.newContext();
  const page = await context.newPage();

  await page.goto(`file://${path.resolve('index.html')}`);

  // Need to correctly override UI
  await page.evaluate(async () => {
    // Override config mock to prevent failing in ui.js where config is required
    window.state = {
      tutorialFinished: true,
      config: {
        pokemonMap: {},
        regions: [{ num: 1, name: 'Kanto' }, { num: 2, name: 'Johto' }]
      },
      currentRegion: 1,
      currentRegionName: 'Kanto',
      stats: {
        playtime: 3661,
        caughtSpeciesCount: 151,
        shinyCaughtSpeciesCount: 10
      },
      globalStats: { playtime: 3661 },
      achievements: {
        '1': { league: true, caughtAll: true, caughtAllShiny: true }
      },
      upgrades: {
        storage: 2
      }
    };

    // Close overlay if tutorial exists
    const tutorial = document.getElementById('tutorial-overlay');
    if (tutorial) tutorial.style.display = 'none';

    // Show stats
    if (typeof window.showTrainerStats === 'function') {
      window.showTrainerStats();
    }
  });

  await page.waitForTimeout(2000);
  await page.screenshot({ path: 'medals_tab_fixed3.png' });

  // Click first medal item to open inner modal
  await page.evaluate(() => {
    const medal = document.querySelector('.medal-item');
    if (medal) medal.click();
  });
  await page.waitForTimeout(1000);
  await page.screenshot({ path: 'medals_modal_fixed3.png' });

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
  await page.waitForTimeout(1000);

  // Click upgrade item
  await page.evaluate(() => {
    const upgrade = document.querySelector('.upgrade-item');
    if (upgrade) upgrade.click();
  });
  await page.waitForTimeout(1000);
  await page.screenshot({ path: 'upgrades_modal_fixed3.png' });

  await browser.close();
})();
