const { _electron } = require('playwright');
const path = require('path');

(async () => {
  const app = await _electron.launch({ args: ['.'], executablePath: '/app/node_modules/electron/dist/electron' });
  const window = await app.firstWindow();

  // Wait for game to load
  await window.waitForTimeout(1000);

  // Bypass intro
  await window.evaluate(() => {
    window.startNewGame();
    window.selectStarter(1);

    // Cheat upgrades for test
    const state = window.globals.state || window.state;
    if (state && state.stats) {
        state.stats.upgrades = {
            ballsTier: 2,
            potionsTier: 2,
            boxTier: 2,
            speedTier: 2,
            lootTier: 2,
            smartwatchTier: 2
        };
    }
  });

  await window.waitForTimeout(500);

  // Open Trainer Stats
  await window.evaluate(() => {
    window.showTrainerStats();
  });
  await window.waitForTimeout(500);

  // Click Upgrades tab
  await window.evaluate(() => {
    window.showTrainerStats('upgrades');
  });
  await window.waitForTimeout(500);

  await window.screenshot({ path: '/home/jules/verification/screenshots/click_upgrades2.png' });

  await app.close();
})();
