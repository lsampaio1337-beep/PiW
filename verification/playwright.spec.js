const { test, expect } = require('@playwright/test');
const fs = require('fs');

test('verify threshold card on smartwatch UI', async ({ page }) => {
  await page.goto('file:///app/index.html');
  await page.waitForLoadState('networkidle');

  // Initialization
  await page.waitForSelector('#btn-new-profile', { state: 'visible', timeout: 5000 }).catch(async () => {
    if (await page.isVisible('#btn-wipe-save')) {
      await page.click('#btn-wipe-save');
      await page.waitForSelector('#btn-new-profile');
    }
  });

  await page.click('#btn-new-profile');
  await page.waitForSelector('#choose-bulbasaur');
  await page.click('#choose-bulbasaur');

  // Give the game time to start up and load assets
  await page.waitForTimeout(2000);

  // Click Map icon and start a route to enter battle
  await page.click('#icon-map');
  await page.waitForTimeout(1000);

  // Click Route 1
  await page.evaluate(() => {
    window.startRoute(1);
  });

  // Wait for battle view to be active
  await page.waitForTimeout(1000);

  // Click the smartwatch threshold card
  await page.evaluate(() => {
    const card = document.getElementById('smartwatch-threshold-card');
    if(card) {
      card.click();
    } else {
      console.log('No smartwatch threshold card found');
    }
  });

  // Wait for the popup to appear
  await page.waitForTimeout(500);

  await page.screenshot({ path: 'verification/screenshots/verification2.png' });
});
