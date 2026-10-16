import { JSDOM } from 'jsdom';
import { test, describe, beforeEach } from 'node:test';
import assert from 'node:assert';
import fs from 'fs';

// Node utility scripts cannot natively import project modules using ES6 imports
// because the project's package.json lacks 'type': 'module' and the modules
// use import/export syntax.
// Evaluating the entire ui.js module within the node:test VM causes massive
// unhandledRejection errors due to hundreds of async listeners, fetch requests,
// and DOM event bindings spilling outside the test hook scopes.
// We extract and run only the target function to achieve perfect isolation.
// This is achieved via a non-brittle brace-matching logic that is immune to
// formatting or stylistic changes.

describe('showOakTutorialIfNeeded', () => {
    let document;
    let state;
    let showOakTutorialIfNeeded;

    beforeEach(() => {
        const dom = new JSDOM(`
            <html>
                <body>
                    <div id="oak-tutorial-overlay" style="display: none;"></div>
                    <div id="oak-tutorial-text"></div>
                    <button id="btn-oak-tutorial-skip"></button>
                    <button id="btn-oak-tutorial-proceed"></button>
                    <button id="btn-oak-tutorial-conclude"></button>
                </body>
            </html>
        `);
        document = dom.window.document;
        global.document = document;

        state = {
            globalStats: {
                hasSeenOakTutorial: false
            }
        };
        global.state = state;

        const uiCode = fs.readFileSync('src/ui.js', 'utf8');

        const extractFnBody = (source, name) => {
            const index = source.indexOf(`function ${name}(`);
            if (index === -1) return null;

            let braceCount = 0;
            let startIndex = source.indexOf('{', index);
            let endIndex = startIndex;

            for (let i = startIndex; i < source.length; i++) {
                if (source[i] === '{') braceCount++;
                if (source[i] === '}') braceCount--;
                if (braceCount === 0) {
                    endIndex = i;
                    break;
                }
            }

            return source.substring(index, endIndex + 1);
        };

        const fnCode = extractFnBody(uiCode, 'showOakTutorialIfNeeded');
        if (!fnCode) throw new Error("Could not find showOakTutorialIfNeeded");

        const extractArray = (source, name) => {
            const index = source.indexOf(`const ${name} =`);
            if (index === -1) return null;
            let start = source.indexOf('[', index);
            let end = source.indexOf(']', start);
            return source.substring(index, end + 2); // Includes ];
        };

        const messagesArr = extractArray(uiCode, 'oakTutorialMessages');

        const codeToRun = `
            ${messagesArr || 'const oakTutorialMessages = [];'}
            let currentOakTutorialIndex = 0;
            ${fnCode}
            return showOakTutorialIfNeeded;
        `;

        showOakTutorialIfNeeded = new Function('document', 'state', codeToRun)(document, state);
    });

    test('should show tutorial if hasSeenOakTutorial is false', () => {
        state.globalStats.hasSeenOakTutorial = false;

        showOakTutorialIfNeeded();

        const overlay = document.getElementById('oak-tutorial-overlay');
        assert.strictEqual(overlay.style.display, 'flex');

        const proceedBtn = document.getElementById('btn-oak-tutorial-proceed');
        assert.strictEqual(proceedBtn.style.display, 'inline-block');
        assert.strictEqual(proceedBtn.innerText, 'Proceed 1/8'); // 9 messages - 1 = 8

        const skipBtn = document.getElementById('btn-oak-tutorial-skip');
        assert.strictEqual(skipBtn.style.display, 'inline-block');

        const concludeBtn = document.getElementById('btn-oak-tutorial-conclude');
        assert.strictEqual(concludeBtn.style.display, 'none');
    });

    test('should not show tutorial if hasSeenOakTutorial is true', () => {
        state.globalStats.hasSeenOakTutorial = true;

        showOakTutorialIfNeeded();

        const overlay = document.getElementById('oak-tutorial-overlay');
        assert.strictEqual(overlay.style.display, 'none');
    });

    test('should do nothing gracefully if overlay is missing', () => {
        state.globalStats.hasSeenOakTutorial = false;
        document.getElementById('oak-tutorial-overlay').remove();

        assert.doesNotThrow(() => {
            showOakTutorialIfNeeded();
        });
    });
});
