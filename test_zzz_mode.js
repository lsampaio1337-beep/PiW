const { test, expect } = require('@playwright/test');

test('ZzZ Mode Tutorial and Opening', async ({ page }) => {
  await page.goto('file://' + process.cwd() + '/index.html');

  // Wait for the game to initialize
  await page.waitForTimeout(1000);

  // Create a profile directly via storage to bypass intro
  await page.evaluate(() => {
    localStorage.setItem('idle_pokemon_world_profiles', JSON.stringify(['test-id']));
    const state = {
        trainer: { money: 0, badges: 0 },
        party: [],
        box: [], storage: [], safe: [], breeding: [], training: [],
        backpack: { pokeballs: {}, potions: {}, stones: {} },
        stats: {
            battlesWon: 0, caught: 0, shiniesSeen: 0, shiniesCaught: 0, playtime: 0,
            jigglypuffGrains: 50, hasSeenZzZTutorial: false, dailyRewards: { daysClaimed: 0, lastClaimDate: null }
        },
        settings: { gameSpeed: 1.0, autoPotion: true, activePotionTier: 0, autoCatch: true, activeBallTier: 0 },
        currentRoute: "Route 1",
        config: {}
    };
    localStorage.setItem('idle_pokemon_world_save_test-id', JSON.stringify(state));
  });

  // Reload page to load the profile
  await page.reload();
  await page.waitForTimeout(1000);

  // Click the test profile
  await page.click('#btn-profile-test-id');
  await page.waitForTimeout(1000);

  // Click ZzZ Mode
  await page.click('#btn-sleep');
  await page.waitForTimeout(1000);

  // Take screenshot of ZzZ Mode Modal
  await page.screenshot({ path: 'test_zzz_mode.png' });
});
