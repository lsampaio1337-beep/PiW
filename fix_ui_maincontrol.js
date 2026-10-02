const fs = require('fs');

let code = fs.readFileSync('src/ui/mainControl.js', 'utf8');

// For "When new game is selected, main control window is like 80x80, when I try to resize it snaps to perfect size and proportion. Make sure to skip this"
// If it's starting at 80x80, it's because `autoAdjustWidth` is firing while the window is visible but `window-content-container` isn't fully expanded, OR `winElement._originalWidth` is missing.
// The user asks to skip `autoAdjustWidth`.

code = code.replace(
    "    if (window.windowManager) {\n        window.windowManager.autoAdjustWidth('main-control-window');\n    }",
    "    // if (window.windowManager) {\n    //     window.windowManager.autoAdjustWidth('main-control-window');\n    // }"
);

fs.writeFileSync('src/ui/mainControl.js', code);
