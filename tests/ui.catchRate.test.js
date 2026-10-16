import { test, expect } from '@playwright/test';

const PORT = 8101;

test.describe('generateCatchRateHtml', () => {
    test.beforeEach(async ({ page }) => {
        await page.goto(`http://localhost:${PORT}/index.html`);
        await page.waitForFunction(() => window.state && window.state.config && window.state.config.pokemonData);
    });

    test('renders correctly for empty records', async ({ page }) => {
        const htmlNormal = await page.evaluate(async () => {
            const uiModule = await import('./src/ui.js');
            return uiModule.generateCatchRateHtml(false);
        });

        expect(htmlNormal).toContain('No catch attempts recorded yet.');
        expect(htmlNormal).toContain('Showing Normal Attempts (Click to show Shiny)');
        expect(htmlNormal).toContain('Pokeball');
        expect(htmlNormal).toContain('Greatball');
        expect(htmlNormal).toContain('Ultraball');
        expect(htmlNormal).toContain('Safariball');
        expect(htmlNormal).toContain('Masterball');

        const htmlShiny = await page.evaluate(async () => {
            const uiModule = await import('./src/ui.js');
            return uiModule.generateCatchRateHtml(true);
        });

        expect(htmlShiny).toContain('No shiny catch attempts recorded yet.');
        expect(htmlShiny).toContain('Showing Shiny Attempts (Click to show Normal)');
    });

    test('renders correctly with catch attempts', async ({ page }) => {
        const htmlNormal = await page.evaluate(async () => {
            // Mock state
            window.state.stats.catchAttempts = {
                "Bulbasaur": {
                    "Pokeball": { thrown: 5, caught: 1 },
                    "Greatball": { thrown: 0, caught: 0 } // Should render as "-"
                },
                "Charmander": {
                    "Ultraball": { thrown: 2, caught: 2 }
                }
            };
            const uiModule = await import('./src/ui.js');
            return uiModule.generateCatchRateHtml(false);
        });

        // Assertions for Bulbasaur and Charmander data being present
        expect(htmlNormal).toContain('#1 Bulbasaur');
        expect(htmlNormal).toContain('1 / 5'); // Pokeball caught / thrown
        // '-' should be present for Greatball since it has 0 throws

        expect(htmlNormal).toContain('#4 Charmander');
        expect(htmlNormal).toContain('2 / 2'); // Ultraball caught / thrown

        // Verify we also render '-' for balls without data
        expect(htmlNormal).toContain('>-<');
    });

    test('renders correctly with shiny catch attempts', async ({ page }) => {
        const htmlShiny = await page.evaluate(async () => {
            // Mock state
            window.state.stats.shinyCatchAttempts = {
                "Squirtle": {
                    "Masterball": { thrown: 1, caught: 1 }
                }
            };
            const uiModule = await import('./src/ui.js');
            return uiModule.generateCatchRateHtml(true);
        });

        expect(htmlShiny).toContain('#7 Squirtle');
        expect(htmlShiny).toContain('1 / 1'); // Masterball caught / thrown
        expect(htmlShiny).toContain('>-<'); // Empty slots for other balls
    });
});
