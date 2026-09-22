import { test, expect } from '@playwright/test';
import Storage from '../../src/storage.js';

test('Storage.save handles localStorage.setItem error gracefully', async () => {
    // We can test this in Node.js by mocking the global window object.
    const originalWindow = global.window;
    const originalConsoleError = console.error;
    let errorLogged = false;

    try {
        // Mock window and localStorage
        global.window = {
            localStorage: {
                setItem: () => { throw new Error('QuotaExceededError'); },
                getItem: () => null,
                removeItem: () => {}
            }
        };

        // Mock console.error
        console.error = (msg, e) => {
            if (msg === "Save failed:") {
                errorLogged = true;
            } else {
                originalConsoleError(msg, e);
            }
        };

        const storage = new Storage();
        storage.currentProfileId = 'test_profile';

        // Attempt to save
        expect(() => storage.save({ foo: 'bar' })).not.toThrow();
        expect(errorLogged).toBe(true);
    } finally {
        // Restore mocks safely
        console.error = originalConsoleError;
        global.window = originalWindow;
    }
});
