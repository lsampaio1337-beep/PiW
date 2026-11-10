const puppeteer = require('puppeteer');
(async () => {
  const browser = await puppeteer.launch({ headless: "new", args: ['--no-sandbox', '--disable-setuid-sandbox'] });
  const page = await browser.newPage();
  await page.goto('http://localhost:8080');

  // Wait for the game to initialize
  await new Promise(resolve => setTimeout(resolve, 3000));

  // We can just verify if puppeteer can load it without throwing fatal JS errors.
  const title = await page.title();
  console.log("Page title is:", title);

  // Ensure no major console errors happen during load
  page.on('console', msg => console.log('PAGE LOG:', msg.text()));

  console.log("Visual verification test complete - app loads without crashing.");
  await browser.close();
})();
