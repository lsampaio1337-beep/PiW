const fs = require('fs');

const uiJsPath = './src/ui.js';
const uiJs = fs.readFileSync(uiJsPath, 'utf8');

// I will just use sed/awk or directly replace the logic via bash.
