const fs = require('fs');
const stateCode = fs.readFileSync('./src/state.js', 'utf8');
const uiCode = fs.readFileSync('./src/ui.js', 'utf8');
console.log(uiCode.includes("state.regions[state.config.regions"));
