const { test, expect } = require('@playwright/test');

test('test profile loading shows correct playtime', async ({ page }) => {
    // Navigate to the app to initialize things
    await page.goto('http://localhost:3000/index.html');
    await page.waitForTimeout(1000);

    // Setup some profile data in localStorage with known playtime
    await page.evaluate(() => {
        const dummyProfileId = 'profile_test_123';
        const dummyProfileData = {
            profileName: "Test Profile 1",
            lastPlayed: Date.now(),
            stats: {
                completedChallenges: 0
            },
            globalStats: {
                playtime: 3665 // 1h 1m 5s
            }
        };
        const profiles = [dummyProfileId];
        window.localStorage.setItem('idle_pokemon_world_profiles', JSON.stringify(profiles));
        window.localStorage.setItem(dummyProfileId, JSON.stringify(dummyProfileData));
    });

    // Reload the page to load our dummy profile
    await page.reload();
    await page.waitForTimeout(1000);

    // Check if the playtime string is correct
    // The button has text format '"Test Profile 1" - 1h 1m 5s'
    const profileBtn = page.locator('button:has-text("Test Profile 1")').first();
    const btnText = await profileBtn.innerText();

    console.log("Profile button text:\n", btnText);

    expect(btnText).toContain('1h 1m 5s');
});
