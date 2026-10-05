const { test, expect } = require('@playwright/test');

test('Verify cheatCompleteOakTask doesn\'t crash', async ({ page }) => {
  await page.goto('http://localhost:3000/index.html');

  // Wait for the game to initialize
  await page.waitForTimeout(2000);

  // Try to call the function
  const result = await page.evaluate(() => {
    try {
      if (typeof window.cheatCompleteOakTask === 'function') {
        window.cheatCompleteOakTask('q');
        return 'success';
      }
      return 'function not found';
    } catch (e) {
      return e.message;
    }
  });

  expect(result).toBe('success');
});
