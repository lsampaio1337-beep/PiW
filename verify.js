const { _electron } = require('playwright');
const fs = require('fs');

(async () => {
  const app = await _electron.launch({
    args: ['.'],
    executablePath: '/app/node_modules/electron/dist/electron'
  });
  const window = await app.firstWindow();
  await window.waitForTimeout(2000);

  await window.evaluate(() => {
    if(window.startNewGame) window.startNewGame();
    if(window.selectStarter) window.selectStarter(1);

    // Simulate purchased upgrades
    if (window.state && window.state.stats && window.state.stats.upgrades) {
        window.state.stats.upgrades.smartwatchTier = 2; // smartwatch
        window.state.stats.upgrades.ballsTier = 2; // belt carrier
        window.state.stats.upgrades.potionsTier = 1; // potion
        window.state.stats.upgrades.lootTier = 3; // loot
        window.state.stats.upgrades.speedTier = 1;
        window.state.stats.upgrades.boxTier = 2;
    }
  });

  await window.waitForTimeout(2000);
  await window.click('#btn-stats');
  await window.waitForTimeout(1000);
  await window.click('text="Upgrades"');
  await window.waitForTimeout(1000);

  await window.screenshot({ path: '/home/jules/verification/screenshots/trainer_upgrades_descriptions.png' });
  await app.close();
})();
