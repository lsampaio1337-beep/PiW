import { test, expect } from '@playwright/test';

test.describe('Storage.exportLog', () => {
    test('handles DOM errors gracefully', async ({ page }) => {
        let logs = [];
        page.on('console', msg => {
            if (msg.type() === 'error') {
                logs.push(msg.text());
            }
        });

        // Use the running server to access the page context
        await page.goto('http://localhost:8099/index.html');

        await page.evaluate(async () => {
            const module = await import('./src/storage.js');
            const Storage = module.default;
            const storage = new Storage();

            // Mock document.body.appendChild to throw
            const originalAppendChild = document.body.appendChild;
            document.body.appendChild = () => {
                throw new Error('Simulated DOM failure');
            };

            const mockState = {
                stats: { battlesWon: 10, caught: 5 },
                party: [
                    { name: 'Pikachu', level: 5 }
                ]
            };

            storage.exportLog(mockState);

            // Restore
            document.body.appendChild = originalAppendChild;
        });

        // check if console.error was called with the specific message
        expect(logs.some(log => log.includes('Log export failed:'))).toBeTruthy();
    });
});
