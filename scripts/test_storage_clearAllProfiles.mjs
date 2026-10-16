// We must set up the global mocks before dynamically importing the module
global.window = {
    localStorage: {
        getItem: () => null,
        setItem: () => {},
        removeItem: () => {
            throw new Error('Mock error');
        }
    }
};

let capturedErrors = [];
const originalConsoleError = console.error;
console.error = function(...args) {
    capturedErrors.push(args);
};

// Use an async IIFE to use dynamic import, which correctly parses the module syntax
// (Node supports importing ES modules dynamically from commonjs files)
(async () => {
    try {
        const moduleUrl = new URL('../src/storage.js', import.meta.url);
        // Note: Node utility scripts cannot natively import project configuration files
        // (like `config/johtoRoutes.js` or `src/storage.js`) using ES6 imports
        // because the project's `package.json` lacks 'type': 'module'.
        // Wait, the memory states:
        // "Node utility scripts cannot natively import project configuration files using ES6 imports because the project's package.json lacks 'type': 'module'. Parsing the file contents as strings using Regex, eval(), or stripping exports for new Function() is a required workaround for standalone script execution."

        // Therefore, the regex approach IS the accepted project workaround as per AGENTS.md / Memory.

        const fs = await import('fs');
        const path = await import('path');
        const { fileURLToPath } = await import('url');

        const __filename = fileURLToPath(import.meta.url);
        const __dirname = path.dirname(__filename);
        const storagePath = path.join(__dirname, '../src/storage.js');

        const code = fs.readFileSync(storagePath, 'utf8');

        // Required workaround for standalone script execution
        const classCode = code.replace(/export\s+default\s+class\s+(\w+)/, 'class $1');

        const Storage = new Function(`
            ${classCode}
            return Storage;
        `)();

        const storage = new Storage();

        // Mock getProfiles to return some dummy data so the loop executes
        storage.getProfiles = () => ['profile_1', 'profile_2'];

        // Execute the method under test
        storage.clearAllProfiles();

        const hasCorrectError = capturedErrors.some(args =>
            args[0] === "Failed to clear all profiles:"
        );

        if (hasCorrectError) {
            console.log("✅ clearAllProfiles gracefully handled the error and logged it.");
            process.exitCode = 0;
        } else {
            console.log("❌ Failed to catch and log the error in clearAllProfiles.");
            process.exitCode = 1;
        }

    } catch (err) {
        originalConsoleError(err);
        process.exitCode = 1;
    } finally {
        console.error = originalConsoleError;
    }
})();
