const { _electron: electron } = require('playwright');
const path = require('path');
const fs = require('fs');

async function run() {
  const electronApp = await electron.launch({
    args: ['.'],
    executablePath: '/app/node_modules/electron/dist/electron',
  });

  const context = await electronApp.context();
  const window = await electronApp.firstWindow();
  await window.waitForLoadState('domcontentloaded');

  await window.evaluate(() => {
    if (window.startNewGame) {
      window.startNewGame();
      window.selectStarter(1);
    }
  });

  await window.waitForTimeout(1000);

  // Switch to Map to trigger travel
  await window.evaluate(() => {
    if (window.switchView) {
      window.switchView('MAP');
    }
  });

  await window.waitForTimeout(1000);

  await window.evaluate(() => {
    // Click route 1
    const route1 = document.querySelector('.map-node[data-route="Route 1"]');
    if (route1) {
      route1.click();
    } else {
        console.log("Could not find route 1");
        // Force battle manually
        if (window.switchView) {
             window.switchView('BATTLE_ARENA');
        }
    }
  });

  console.log("Recording battle for 5 seconds...");
  await window.waitForTimeout(5000);

  const videoDir = '/home/jules/verification/video';
  if (!fs.existsSync(videoDir)) {
      fs.mkdirSync(videoDir, { recursive: true });
  }

  await window.screenshot({ path: path.join(videoDir, 'battle_screenshot2.png') });

  await electronApp.close();
  console.log("Done.");
}

run().catch(console.error);
