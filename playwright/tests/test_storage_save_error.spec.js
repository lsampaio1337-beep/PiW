const { test, expect } = require('@playwright/test');

test('Storage save handles localStorage error gracefully', async ({ page }) => {
    await page.goto('http://localhost:3000/index.html');

    // Create a promise that resolves when the expected console error is logged
    const errorLoggedPromise = new Promise(resolve => {
        page.on('console', msg => {
            if (msg.type() === 'error' && msg.text().includes('Save failed:')) {
                resolve(true);
            }
        });
    });

    await page.evaluate(() => {
        // Mock setItem to throw an error
        const originalSetItem = window.localStorage.setItem;
        window.localStorage.setItem = () => {
            throw new Error("Simulated QuotaExceededError");
        };

        // Trigger a save using the global storageRef
        if (window.storageRef) {
            window.storageRef.setCurrentProfile('profile_test_error');
            window.storageRef.save({ dummy: 'data' });
        } else {
            console.error("No storageRef found");
        }

        // Restore
        window.localStorage.setItem = originalSetItem;
    });

    // Wait for the specific error to be logged (replaces arbitrary timeout)
    const errorLogged = await errorLoggedPromise;
    expect(errorLogged).toBe(true);
});
