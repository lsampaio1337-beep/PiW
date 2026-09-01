const { chromium } = require('playwright');

(async () => {
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext();
  const page = await context.newPage();

  // Create a dummy save file to trigger the prompt
  await page.goto('http://localhost:3000');

  await page.evaluate(() => {
    localStorage.setItem('idle_pokemon_world_save', JSON.stringify({
        party: [{
            id: 1,
            name: "Bulbasaur",
            level: 5,
            currentHp: 20,
            maxHp: 20,
            qualityName: "Normal",
            quality: 1,
            ivs: {hp: 1, atk: 1, def: 1, spa: 1, spd: 1, spe: 1},
            moves: [{name: "Tackle", power: 40, type: "Normal"}]
        }],
        storage: [],
        currentRoute: 'Professor Oak Lab',
        trainer: { badges: 0, money: 0, xp: 0 },
        stats: { battlesWon: 0, caught: 0 }
    }));
  });

  // Reload to trigger the save prompt
  await page.reload();

  await page.waitForSelector('#save-prompt-modal', { state: 'visible', timeout: 5000 });
  console.log('Modal visible');

  // Click continue
  await page.click('#btn-continue-game');
  await page.waitForTimeout(1000); // Wait for initialization

  // Map route check
  console.log('Clicked Continue');

  // Navigate to Route 1
  await page.evaluate(() => {
      window.navigateToLocation('Route 1');
  });
  await page.waitForTimeout(1500); // wait for route transition and battle start

  const arenaDisplay = await page.evaluate(() => {
      return document.getElementById('view-battle-arena').style.display;
  });
  console.log('Arena display:', arenaDisplay);

  const hasEnemy = await page.evaluate(() => {
      return document.getElementById('enemy-name').innerText !== 'Wild Pokemon' &&
             document.getElementById('enemy-name').innerText !== '';
  });
  console.log('Enemy spawned:', hasEnemy);

  await browser.close();
})();
