const { test, expect } = require('@playwright/test');

test.describe('Storage Tests', () => {
    test('Storage.getProfiles returns empty array on invalid JSON', async ({ page }) => {
        await page.route('http://localhost:8080/', (route) => {
            route.fulfill({
                contentType: 'text/html',
                body: `
                    <!DOCTYPE html>
                    <html>
                    <head></head>
                    <body>
                        <script type="module">
                            import Storage from './storage.js';
                            window.GameStorage = Storage;
                        </script>
                    </body>
                    </html>
                `
            });
        });

        await page.route('http://localhost:8080/storage.js', (route) => {
            const fs = require('fs');
            const path = require('path');
            const storageCode = fs.readFileSync(path.join(__dirname, '../storage.js'), 'utf-8');
            route.fulfill({
                contentType: 'application/javascript',
                body: storageCode
            });
        });

        await page.goto('http://localhost:8080/');

        const result = await page.evaluate(() => {
            window.localStorage.setItem('idle_pokemon_world_profiles', '{invalid json');
            const storage = new window.GameStorage();
            return storage.getProfiles();
        });

        expect(result).toEqual([]);
    });

    test('Storage.getProfiles returns empty array when no data exists', async ({ page }) => {
        await page.route('http://localhost:8080/', (route) => {
            route.fulfill({
                contentType: 'text/html',
                body: `
                    <!DOCTYPE html>
                    <html>
                    <head></head>
                    <body>
                        <script type="module">
                            import Storage from './storage.js';
                            window.GameStorage = Storage;
                        </script>
                    </body>
                    </html>
                `
            });
        });

        await page.route('http://localhost:8080/storage.js', (route) => {
            const fs = require('fs');
            const path = require('path');
            const storageCode = fs.readFileSync(path.join(__dirname, '../storage.js'), 'utf-8');
            route.fulfill({
                contentType: 'application/javascript',
                body: storageCode
            });
        });

        await page.goto('http://localhost:8080/');

        const result = await page.evaluate(() => {
            window.localStorage.removeItem('idle_pokemon_world_profiles');
            const storage = new window.GameStorage();
            return storage.getProfiles();
        });

        expect(result).toEqual([]);
    });

    test('Storage.getProfiles returns data when valid JSON exists', async ({ page }) => {
        await page.route('http://localhost:8080/', (route) => {
            route.fulfill({
                contentType: 'text/html',
                body: `
                    <!DOCTYPE html>
                    <html>
                    <head></head>
                    <body>
                        <script type="module">
                            import Storage from './storage.js';
                            window.GameStorage = Storage;
                        </script>
                    </body>
                    </html>
                `
            });
        });

        await page.route('http://localhost:8080/storage.js', (route) => {
            const fs = require('fs');
            const path = require('path');
            const storageCode = fs.readFileSync(path.join(__dirname, '../storage.js'), 'utf-8');
            route.fulfill({
                contentType: 'application/javascript',
                body: storageCode
            });
        });

        await page.goto('http://localhost:8080/');

        const result = await page.evaluate(() => {
            window.localStorage.setItem('idle_pokemon_world_profiles', '["profile_1", "profile_2"]');
            const storage = new window.GameStorage();
            return storage.getProfiles();
        });

        expect(result).toEqual(["profile_1", "profile_2"]);
    });
});
