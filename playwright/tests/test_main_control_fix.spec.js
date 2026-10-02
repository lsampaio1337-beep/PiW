const { test, expect } = require('@playwright/test');

test('main control auto adjust width with new icon', async ({ page }) => {
  await page.goto('http://localhost:3000/index.html');
  await page.waitForTimeout(1000);

  await page.evaluate(() => {
    window.startNewGame();
    window.selectStarter(1);
  });

  await page.waitForTimeout(1000);

  // Set explicit height on the window
  await page.evaluate(() => {
    const win = document.getElementById('main-control-window');
    win.style.display = 'flex';
    win.style.width = '600px';
    win.style.height = '100px';
  });

  const mainControl = page.locator('#main-control-window');
  const initialBox = await mainControl.boundingBox();
  console.log('Initial bounding box:', initialBox);

  // Trigger add icon logic directly
  await page.evaluate(() => {
    const container = document.getElementById('main-control-window').querySelector('.window-content-container');
    const newIcon = document.createElement('div');
    newIcon.className = 'nav-icon';
    newIcon.style.display = 'flex';
    newIcon.style.flex = '0 0 auto';
    newIcon.style.aspectRatio = '1 / 1';
    newIcon.style.height = '100%';
    newIcon.style.backgroundColor = 'red';
    container.appendChild(newIcon);

    window.windowManager.autoAdjustWidth('main-control-window');
  });

  await page.waitForTimeout(500);

  const finalBox = await mainControl.boundingBox();
  console.log('Final bounding box:', finalBox);

  // Height should remain the same (100) or very close, not exponentially grown
  expect(Math.abs(finalBox.height - initialBox.height)).toBeLessThan(5);
  // Width should have expanded
  expect(finalBox.width).toBeGreaterThan(initialBox.width);
});
