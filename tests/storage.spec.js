import { test, expect } from '@playwright/test';
import Storage from '../src/storage.js';

test.describe('Storage', () => {
    test.beforeEach(() => {
        // Mock global window object
        global.window = {
            localStorage: {
                getItem: () => null,
                setItem: () => {},
                removeItem: () => {}
            }
        };
    });

    test('deleteProfile should handle errors when localStorage throws', () => {
        const storage = new Storage();

        // Mock removeItem to throw an error
        const testError = new Error('Mock localStorage error');
        global.window.localStorage.removeItem = () => {
            throw testError;
        };

        // Spy on console.error
        let errorArgs = null;
        const originalConsoleError = console.error;
        console.error = (...args) => {
            errorArgs = args;
        };

        try {
            // Call the method
            storage.deleteProfile('test_profile');

            // Assert console.error was called with the expected arguments
            expect(errorArgs).not.toBeNull();
            expect(errorArgs[0]).toBe('Failed to delete profile:');
            expect(errorArgs[1]).toBe(testError);
        } finally {
            // Restore console.error
            console.error = originalConsoleError;
        }
    });
});
