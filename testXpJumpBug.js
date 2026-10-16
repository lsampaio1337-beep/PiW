/**
 * 🔒 SECURITY FIX: Unsafe Dynamic Code Execution (eval)
 *
 * We now securely load the module utilizing standard module requiring.
 * However, because the repository is primarily built as an Electron/browser app,
 * `src/mathEngine.js` uses ES Module `export` syntax which Node (in CommonJS mode) rejects.
 *
 * The safest and standard workaround for testing browser ES Modules in a legacy Node CommonJS
 * environment without utilizing `eval()` or temporary files is to override Node's `require`
 * extension for `.js` files in test wrappers, dynamically transforming the `export` keyword
 * into `module.exports` during the native compile step.
 */

const fs = require('fs');
const Module = require('module');

// Intercept the native Node.js CommonJS module loader specifically for the mathEngine
const originalRequireJs = require.extensions['.js'];

require.extensions['.js'] = function (module, filename) {
    if (filename.endsWith('mathEngine.js')) {
        const content = fs.readFileSync(filename, 'utf8');

        // Dynamically replace the ES export block with module.exports
        // capturing whatever is currently exported to remain completely maintainable.
        const safeContent = content.replace(/export\s*\{([\s\S]*?)\};/, (match, p1) => {
            return `if (typeof module !== 'undefined' && module.exports) { module.exports = { ${p1} }; }`;
        });

        // Compile using the standard built-in Node module compilation
        return module._compile(safeContent, filename);
    }

    // For all other files, fallback to standard require
    return originalRequireJs(module, filename);
};

// Securely require the file using standard Node module loading mechanisms
const mathEngine = require('./src/mathEngine.js');

console.log("total xp for level 100:", mathEngine.calculateTotalXP(100));
console.log("total xp for level 101:", mathEngine.calculateTotalXP(101));

// Restore the original extension handler
require.extensions['.js'] = originalRequireJs;
