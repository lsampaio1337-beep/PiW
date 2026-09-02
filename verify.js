const { chromium } = require('playwright');

(async () => {
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage();
  await page.goto('http://localhost:8080');

  // Wait for the UI to settle
  await page.waitForTimeout(1000);

  // Use JS to set money and jump directly to Casino Starter Troupe spot
  await page.evaluate(() => {
    // Hide splash directly
    const splash = document.getElementById('splash-screen');
    if (splash) splash.style.display = 'none';

    if (window.state && window.state.trainer) {
      window.state.trainer.money = 2000;
    }

    // Auto-init game so we are not stuck in oak screen
    if (window.initGame) {
      window.initGame('Charmander');
    }

    // Jump straight to map view
    if (window.switchView) {
        window.switchView('MAP');
    }
  });

  await page.waitForTimeout(1000);
  await page.screenshot({ path: 'map_view.png' });

  // Navigate straight to Casino Hub
  await page.evaluate(() => {
    if (window.switchView) window.switchView('CASINO_HUB');
    if (window.navigateToLocation) window.navigateToLocation('Casino');
  });

  await page.waitForTimeout(1000);
  await page.screenshot({ path: 'casino_hub.png' });

  // Navigate to specific spot
  await page.evaluate(() => {
    if (window.navigateToLocation) {
        window.navigateToLocation('Casino - Starter Troupe');
    }
  });

  await page.waitForTimeout(1000);
  await page.screenshot({ path: 'casino_spot.png' });

  await browser.close();
})();
