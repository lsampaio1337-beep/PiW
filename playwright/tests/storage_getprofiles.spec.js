const { test, expect } = require('@playwright/test');

test('Storage getProfiles error handling returns empty array', async ({ page }) => {
    // Navigate to the app to initialize things (use the same pattern as test_profile_load_playtime.spec.js)
    await page.goto('http://localhost:3000/index.html');

    // Wait for the storageRef to be attached to the window
    await page.waitForFunction(() => window.storageRef !== undefined);

    const profiles = await page.evaluate(() => {
        // Access the instantiated Storage class attached to the window
        const storage = window.storageRef;
        if (!storage) {
            throw new Error('window.storageRef is not defined');
        }

        let errorResult;
        try {
            // Write invalid JSON to the store to trigger a SyntaxError in JSON.parse
            window.localStorage.setItem('idle_pokemon_world_profiles', 'invalid_json{[');

            // Call getProfiles, which should catch the JSON.parse error and return []
            errorResult = storage.getProfiles();
        } finally {
            // Clean up
            window.localStorage.removeItem('idle_pokemon_world_profiles');
        }

        return errorResult;
    });

    expect(profiles).toEqual([]);
});
