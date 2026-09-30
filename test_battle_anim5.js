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
    window.switchView('BATTLE_ARENA');
    const pSprite = document.getElementById('player-pokemon-sprite');
    const eSprite = document.getElementById('enemy-pokemon-sprite');
    if (pSprite) {
        pSprite.src = 'Assets/Pokemon Sprites/Clean/1_Clean.png';
        pSprite.style.display = 'block';
    }
    if (eSprite) {
        eSprite.src = 'Assets/Pokemon Sprites/Clean/4_Clean.png';
        eSprite.style.display = 'block';
    }

    // start at 0ms
    window.playCombatAnimations("player", "FIRE", 1000);
  });

  // wait 1000ms for projectile to hit
  await window.waitForTimeout(1000);

  const videoDir = '/home/jules/verification/video';
  if (!fs.existsSync(videoDir)) {
      fs.mkdirSync(videoDir, { recursive: true });
  }

  // screenshot exactly when splash starts
  await window.screenshot({ path: path.join(videoDir, 'battle_screenshot7.png') });

  // wait 100ms for splash to expand a bit
  await window.waitForTimeout(100);
  await window.screenshot({ path: path.join(videoDir, 'battle_screenshot8.png') });

  await electronApp.close();
  console.log("Done.");
}

run().catch(console.error);
