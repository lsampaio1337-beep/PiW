const { chromium } = require('playwright');
const fs = require('fs');

(async () => {
  const browser = await chromium.launch({ headless: true, args: ['--no-sandbox'] });
  const page = await browser.newPage();

  await page.goto('http://localhost:8080');

  // Wait for load
  await page.waitForTimeout(1000);

  // Set region state
  await page.evaluate(() => {
     window.state = {
         globalStats: { hasSeenJohtoMap: true },
         config: {
             gyms: [
                 { name: "Pewter Gym", leader: "Brock" }
             ],
             gymAssets: {
                 "Brock": { sprite: "Brock.png", background: "BG-Gym-1-Pewter-Rock.png", position: {rel_x: 0, rel_y: 0}, size: {px_width: 100}, tilt: {angle_deg: 0} }
             },
             balance: { casinoPrices: {} }
         }
     };
     window.currentMapRegion = "Kanto";
     window.showMap();
     window.navigateToLocation("Pewter Gym");
  });

  await page.waitForTimeout(500); // Give rendering time

  await page.screenshot({ path: 'map-modal-overlay.png' });
  await browser.close();

  console.log("Screenshot saved.");
})();
