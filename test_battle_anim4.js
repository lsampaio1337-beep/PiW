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
    // Set up some mock image sources so the pure sprites exist
    const pSprite = document.getElementById('player-pokemon-sprite');
    const eSprite = document.getElementById('enemy-pokemon-sprite');
    if (pSprite) pSprite.src = 'Assets/Pokemon Sprites/Clean/1_Clean.png';
    if (eSprite) eSprite.src = 'Assets/Pokemon Sprites/Clean/4_Clean.png';

    // player is target, so enemy is attacker
    window.playCombatAnimations("player", "FIRE", 1000);
  });

  await window.waitForTimeout(450);

  const videoDir = '/home/jules/verification/video';
  if (!fs.existsSync(videoDir)) {
      fs.mkdirSync(videoDir, { recursive: true });
  }

  await window.screenshot({ path: path.join(videoDir, 'battle_screenshot5.png') });

  await window.waitForTimeout(600); // 1050ms
  await window.screenshot({ path: path.join(videoDir, 'battle_screenshot6.png') });

  await electronApp.close();
  console.log("Done.");
}

run().catch(console.error);
