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
    }
  });

  console.log("Waiting for battle to start and recording animation...");

  await window.waitForTimeout(3000);

  // We want to force an attack animation if it hasn't happened.
  // We can just call playCombatAnimations manually to record it.
  await window.evaluate(() => {
     if (window.playCombatAnimations) {
         // player is target, so enemy is attacker
         window.playCombatAnimations("player", "GRASS", 1000);
     }
  });

  await window.waitForTimeout(450); // 450ms into the 1000ms animation (projectile in air, spawn at 400ms)

  const videoDir = '/home/jules/verification/video';
  if (!fs.existsSync(videoDir)) {
      fs.mkdirSync(videoDir, { recursive: true });
  }

  await window.screenshot({ path: path.join(videoDir, 'battle_screenshot3.png') });

  // wait for it to land
  await window.waitForTimeout(600); // 1050ms
  await window.screenshot({ path: path.join(videoDir, 'battle_screenshot4.png') });


  await electronApp.close();
  console.log("Done.");
}

run().catch(console.error);
