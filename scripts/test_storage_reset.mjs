import fs from 'fs';
import path from 'path';
import test from 'node:test';
import assert from 'node:assert';

// Read the Storage source file
const storagePath = path.join(process.cwd(), 'src', 'storage.js');
const storageCode = fs.readFileSync(storagePath, 'utf-8');

// Strip ES module exports so it can be evaluated in a new Function
const classCode = storageCode.replace(/export default class/g, 'class');

test('Storage.reset error handling test', (t) => {
    // Setup global window mock
    global.window = {
        localStorage: {
            getItem: () => null,
            setItem: () => {},
            removeItem: (key) => {
                // Ignore the migrateOldSave calls
                if (key === 'idle_pokemon_world_save') return;

                // Throw an error to test the catch block in reset()
                throw new Error("Mocked localStorage.removeItem error");
            }
        }
    };

    // Spy on console.error
    let errorLogCalled = false;
    let loggedMessage = null;
    let loggedError = null;

    const originalConsoleError = console.error;
    console.error = (msg, err) => {
        errorLogCalled = true;
        loggedMessage = msg;
        loggedError = err;
    };

    // Ignore console.log and console.warn during test
    const originalConsoleLog = console.log;
    const originalConsoleWarn = console.warn;
    console.log = () => {};
    console.warn = () => {};

    try {
        // Instantiate the Storage class using the eval workaround
        const Storage = new Function(`${classCode}\nreturn Storage;`)();
        const storage = new Storage();

        // Setup state to allow reset
        storage.currentProfileId = "test_profile_id";

        // Call the method under test
        storage.reset();

        // Assertions
        assert.strictEqual(errorLogCalled, true, "console.error was not called.");
        assert.strictEqual(loggedMessage, "Failed to clear save:", "Incorrect message logged.");
        assert.strictEqual(loggedError.message, "Mocked localStorage.removeItem error", "Incorrect error object logged.");

    } finally {
        // Restore console methods
        console.error = originalConsoleError;
        console.log = originalConsoleLog;
        console.warn = originalConsoleWarn;
    }
});
