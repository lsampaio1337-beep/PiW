# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: playwright/tests/verify.spec.js >> Backpack Interactions
- Location: playwright/tests/verify.spec.js:3:1

# Error details

```
TimeoutError: page.waitForFunction: Timeout 5000ms exceeded.
```

# Page snapshot

```yaml
- generic [ref=e1]:
  - navigation [ref=e2]:
    - generic [ref=e3]: "Level: 1 | XP: 0 | Money: $0 | Badges: 0"
    - generic [ref=e4]: "Next Challenge: None"
    - generic [ref=e5]:
      - button "Map" [ref=e6] [cursor=pointer]
      - button "Backpack" [active] [ref=e7] [cursor=pointer]
      - button "Pokedex" [ref=e8] [cursor=pointer]
      - button "Stats" [ref=e9] [cursor=pointer]
      - button "Settings" [ref=e10] [cursor=pointer]
  - generic [ref=e11]:
    - complementary [ref=e12]:
      - heading "Party" [level=3] [ref=e13]
      - generic [ref=e14]:
        - heading "Day Care" [level=3] [ref=e15]
        - generic [ref=e16]: "Breeding: 0/100"
        - generic [ref=e17]: "Training: 0/100"
    - main [ref=e18]
```

# Test source

```ts
  1  | const { test, expect } = require('@playwright/test');
  2  |
  3  | test('Backpack Interactions', async ({ page }) => {
  4  |   await page.goto('file://' + require('path').resolve('./index.html'));
  5  |
  6  |   await page.waitForSelector('#splash-screen');
  7  |
  8  |   await page.click('#splash-screen', { position: { x: 5, y: 5 }});
  9  |
  10 |   // Need to wait until scripts are mounted and buttons exist
  11 |   await page.waitForSelector('#btn-backpack');
  12 |
  13 |   await page.click('#btn-backpack');
  14 |
> 15 |   await page.waitForFunction(() => {
     |              ^ TimeoutError: page.waitForFunction: Timeout 5000ms exceeded.
  16 |     return document.getElementById('modal-overlay').style.display === 'flex';
  17 |   }, null, { timeout: 5000 });
  18 |
  19 |   await page.evaluate(() => {
  20 |     window.renderBackpackTab('pokeballs');
  21 |   });
  22 |
  23 |   await page.waitForFunction(() => {
  24 |     return document.getElementById('backpack-content-area').style.display === 'block';
  25 |   }, null, { timeout: 5000 });
  26 |
  27 |   await page.evaluate(() => {
  28 |     const bkg = document.querySelector('img[src="./Assets/Extra/Backpack.png"]').parentElement.parentElement;
  29 |     bkg.click();
  30 |   });
  31 |
  32 |   await page.waitForFunction(() => {
  33 |     return document.getElementById('backpack-content-area').style.display === 'none';
  34 |   }, null, { timeout: 5000 });
  35 |
  36 |   let modalDisplay = await page.$eval('#modal-overlay', el => el.style.display);
  37 |   expect(modalDisplay).toBe('flex');
  38 |
  39 |   await page.evaluate(() => {
  40 |     document.getElementById('modal-overlay').click();
  41 |   });
  42 |
  43 |   await page.waitForFunction(() => {
  44 |     return document.getElementById('modal-overlay').style.display === 'none';
  45 |   }, null, { timeout: 5000 });
  46 |
  47 |   modalDisplay = await page.$eval('#modal-overlay', el => el.style.display);
  48 |   expect(modalDisplay).toBe('none');
  49 | });
  50 |
```