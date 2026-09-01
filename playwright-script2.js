const { chromium } = require('playwright');

(async () => {
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext();
  const page = await context.newPage();

  // Trigger New Game logic
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
        currentRoute: 'Route 1',
        trainer: { badges: 0, money: 0, xp: 0 },
        stats: { battlesWon: 0, caught: 0 }
    }));
  });

  await page.reload();
  await page.waitForSelector('#save-prompt-modal', { state: 'visible', timeout: 5000 });

  await page.click('#btn-new-game');
  await page.waitForTimeout(1000);

  const labDisplay = await page.evaluate(() => {
      return document.getElementById('view-prof-oak-lab').style.display;
  });
  console.log('Lab display:', labDisplay);

  const bulbasaurButtonVisible = await page.evaluate(() => {
      const btn = document.getElementById('choose-bulbasaur');
      return btn !== null; // Starter buttons should be back
  });
  console.log('Bulbasaur starter button present:', bulbasaurButtonVisible);

  await browser.close();
})();
