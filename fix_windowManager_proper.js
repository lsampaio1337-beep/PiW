const fs = require('fs');

let code = fs.readFileSync('src/windowManager.js', 'utf8');

// For "Make it able to be resized at proportional rate"
// The resize handle is managed in `_setupResize(winElement, handleElement, scalerElement, headerElement)`.
// `_setupResize` already scales content proportionally because it uses `scale = currentContentWidth / winElement._originalWidth` and scales the height proportionally.
// It ONLY does this if `winElement._originalWidth` is set.
// The problem was that `winElement._originalWidth` was NEVER set correctly because it started as 80x80 or we overrode it!

// For "When game is loaded, its Main Control is all messed. Make sure to save Widith and Height to reload."
// In windowManager.js, `spawnWindow` is ONLY called by `createDynamicWindow`.
// `main-control-window` is registered via `registerWindow` and shown via `toggleWindow`.
// So we need `toggleWindow` to apply saved settings if they exist.

const applySettingsLogic = `
    toggleWindow(windowId, forceShow = false) {
        const winElement = document.getElementById(windowId);
        if (winElement) {
            if (forceShow || winElement.style.display === 'none') {
                winElement.style.display = 'flex';
                this.focusWindow(winElement);

                // ONLY apply saved settings the VERY FIRST TIME it is toggled on (or initialized)
                if (!winElement.dataset.settingsLoaded) {
                    winElement.dataset.settingsLoaded = "true";
                    if (window.state && window.state.settings && window.state.settings.windowSettings && window.state.settings.windowSettings[windowId]) {
                        const savedSettings = window.state.settings.windowSettings[windowId];
                        if (savedSettings.width) winElement.style.width = savedSettings.width;
                        if (savedSettings.height) winElement.style.height = savedSettings.height;
                        if (savedSettings.left) winElement.style.left = savedSettings.left;
                        if (savedSettings.top) winElement.style.top = savedSettings.top;
                    }
                }
            } else {
                winElement.style.display = 'none';
            }
        }
    }
`;

code = code.replace("toggleWindow(windowId, forceShow = false) {", applySettingsLogic + "    // _hidden_ toggleWindow(windowId, forceShow = false) {");
code = code.replace("    // _hidden_ toggleWindow(windowId, forceShow = false) {\n        const winElement = document.getElementById(windowId);\n        if (winElement) {\n            if (forceShow || winElement.style.display === 'none') {\n                winElement.style.display = 'flex';\n                this.focusWindow(winElement);\n            } else {\n                winElement.style.display = 'none';\n            }\n        }\n    }", "");

fs.writeFileSync('src/windowManager.js', code);
