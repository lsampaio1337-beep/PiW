const { chromium } = require('playwright');
const path = require('path');

(async () => {
  const browser = await chromium.launch({
    headless: true,
    args: ['--disable-web-security']
  });
  const context = await browser.newContext();
  const page = await context.newPage();

  const filePath = `file://${path.resolve(__dirname, '../index.html')}`;
  console.log('Navigating to:', filePath);
  await page.goto(filePath);

  // Wait for game to initialize
  await page.waitForTimeout(1000);

  // Wipe save if it exists, to be safe
  try {
    const isWipeVisible = await page.isVisible('#btn-wipe-save');
    if (isWipeVisible) {
      await page.click('#btn-wipe-save');
      await page.waitForTimeout(500);
    }
  } catch(e) {}

  // Wait for new profile button and click
  await page.waitForSelector('#btn-new-profile', { state: 'visible', timeout: 5000 });
  await page.click('#btn-new-profile');
  await page.waitForTimeout(500);

  // Click bulbasaur
  await page.waitForSelector('#choose-bulbasaur', { state: 'visible', timeout: 5000 });
  await page.click('#choose-bulbasaur');
  await page.waitForTimeout(1000);

  // Wait for oak lab assignments and booster modal
  // From verification_debug3.png, there is a popup "Professor Oak Lab"
  // It has a button: "Assignments and Boosters"
  // But behind it is the Main View. Let's see if we can just close the Oak Lab modal.
  // We can just click the close "X" in the header of the Oak Lab window, or click outside.
  await page.evaluate(() => {
    // Force close active popups if any
    if (window.closePopup) window.closePopup();
  });
  await page.waitForTimeout(1000);

  // Also from screenshot 3 we see the Main View. Let's try evaluating window.closePopupWindow for Oak lab
  await page.evaluate(() => {
     let closeBtns = document.querySelectorAll('.window-controls span');
     closeBtns.forEach(b => b.click());
  });
  await page.waitForTimeout(1000);

  // Start the battle loop by making sure we are on Route 1
  await page.evaluate(() => {
    // Start battle loop by navigating to Route 1
    if (window.updateLocation) {
      window.updateLocation("Route 1");
    }
  });
  await page.waitForTimeout(1000);

  // Take a debug screenshot
  await page.screenshot({ path: path.join(__dirname, 'screenshots/verification_debug_route1.png') });

  // Wait for the smartwatch container to appear
  await page.waitForSelector('#battle-active-items-container', { state: 'visible', timeout: 5000 });

  // Wait for the card specifically
  await page.waitForSelector('#smartwatch-threshold-card', { state: 'visible', timeout: 5000 });

  // Click the threshold card
  await page.click('#smartwatch-threshold-card');

  // Wait a bit for the popup to appear
  await page.waitForTimeout(1000);

  // Take a screenshot
  await page.screenshot({ path: path.join(__dirname, 'screenshots/verification_final.png') });
  console.log('Screenshot saved to verification_final.png');

  await browser.close();
})();
