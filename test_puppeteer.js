const puppeteer = require('puppeteer');
(async () => {
  const browser = await puppeteer.launch({ headless: "new", args: ['--no-sandbox'] });
  const page = await browser.newPage();
  page.on('console', msg => console.log('PAGE LOG:', msg.text()));
  await page.goto('http://localhost:8080');

  await new Promise(r => setTimeout(r, 2000));
  await page.evaluate("window.showMap()");
  await new Promise(r => setTimeout(r, 1000));

  await page.evaluate("window.navigateToLocation('Kanto Safari Zone')");
  await new Promise(r => setTimeout(r, 1000));

  const metrics = await page.evaluate(() => {
     const modal = document.querySelector('#map-inner-modal');
     return modal ? JSON.stringify(modal.getBoundingClientRect()) : "No modal";
  });

  console.log("Metrics:", metrics);
  await browser.close();
})();
