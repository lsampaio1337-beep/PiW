const fs = require('fs');

global.window = {
    innerWidth: 1000,
    innerHeight: 800,
    addEventListener: () => {},
    showMedalDetail: function(...args) {
        console.log("SUCCESSFULLY CALLED showMedalDetail!", args);
    },
    showUpgradeDetail: function(...args) {
        console.log("SUCCESSFULLY CALLED showUpgradeDetail!", args);
    },
};
global.document = {
    addEventListener: () => {},
    createElement: () => ({ style: {}, appendChild: () => {}, append: () => {}, addEventListener: () => {} }),
    body: { appendChild: () => {} },
    getElementById: () => null
};

const code = fs.readFileSync('src/windowManager.js', 'utf8');

// evaluate windowManager class definition
let WindowManager;
try {
    // Strip export
    let cleanCode = code.replace(/export class WindowManager/, 'WindowManager = class');
    cleanCode = cleanCode.replace(/import .*?;\n/g, '');
    eval(cleanCode);
} catch (err) {
    console.error(err);
}

const wm = new WindowManager();

global.globals = {
    battleSystem: {},
    windowManager: wm
};

const codeToExecute1 = "if(window.showMedalDetail) window.showMedalDetail('Kanto', 10, 5, 150)";
console.log("Testing:", codeToExecute1);
wm._executeInlineEvent(codeToExecute1, {}, {value: ''});

const codeToExecute2 = "if(window.showUpgradeDetail) window.showUpgradeDetail('storage', 2)";
console.log("Testing:", codeToExecute2);
wm._executeInlineEvent(codeToExecute2, {}, {value: ''});
