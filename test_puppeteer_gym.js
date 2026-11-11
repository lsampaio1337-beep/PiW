const puppeteer = require('puppeteer');
(async () => {
  const browser = await puppeteer.launch({ headless: "new", args: ['--no-sandbox'] });
  const page = await browser.newPage();
  page.on('console', msg => console.log('PAGE LOG:', msg.text()));
  await page.goto('http://localhost:8080');

  await new Promise(r => setTimeout(r, 2000));
  await page.evaluate("window.showMap()");
  await new Promise(r => setTimeout(r, 1000));

  await page.evaluate("window.navigateToLocation('Pewter City Gym')");
  await new Promise(r => setTimeout(r, 1000));

  const styles = await page.evaluate(() => {
     const modalContent = document.querySelector('#map-inner-modal-content');
     const computed = window.getComputedStyle(modalContent);
     return {
         overflowY: computed.overflowY,
         flex: computed.flex,
         display: computed.display,
         flexDirection: computed.flexDirection
     };
  });

  console.log("Gym Modal Styles:", styles);
  await browser.close();
})();
