const { _electron: electron } = require('playwright');
const path = require('path');
const fs = require('fs');

async function run() {
  const electronApp = await electron.launch({
    args: ['.'],
    executablePath: '/app/node_modules/electron/dist/electron',
  });

  const context = await electronApp.context();

  // start recording video
  await context.tracing.start({ screenshots: true, snapshots: true });

  const window = await electronApp.firstWindow();

  // Wait for the app to load
  await window.waitForLoadState('domcontentloaded');

  // Bypass intro
  await window.evaluate(() => {
    if (window.startNewGame) {
      window.startNewGame();
      window.selectStarter(1); // Select Bulbasaur
    }
  });

  await window.waitForTimeout(1000); // give time for selection

  // Switch to Route 1 to trigger a battle
  await window.evaluate(() => {
    if (window.switchView) {
      window.switchView('ROUTE_1');
    }
  });

  // Wait some time to let battles play out
  console.log("Recording battle for 10 seconds...");
  await window.waitForTimeout(10000);

  const videoDir = '/home/jules/verification/video';
  if (!fs.existsSync(videoDir)) {
      fs.mkdirSync(videoDir, { recursive: true });
  }

  await context.tracing.stop({ path: path.join(videoDir, 'trace.zip') });

  // take a screenshot as well
  await window.screenshot({ path: path.join(videoDir, 'battle_screenshot.png') });

  await electronApp.close();
  console.log("Done.");
}

run().catch(console.error);
