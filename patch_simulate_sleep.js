const fs = require('fs');

let uiJs = fs.readFileSync('src/ui.js', 'utf8');

uiJs = uiJs.replace(
    "    let timeStr = \"\";",
    "    state.globalStats.playtime = (state.globalStats.playtime || 0) + totalSeconds;\n    if (state.currentRegionName && state.regions && state.regions[state.currentRegionName] && state.regions[state.currentRegionName].stats) {\n        state.regions[state.currentRegionName].stats.playtime = (state.regions[state.currentRegionName].stats.playtime || 0) + totalSeconds;\n    }\n    if (state.currentRegionName === 'Kanto' && state.stats) {\n        state.stats.playtime = (state.stats.playtime || 0) + totalSeconds;\n    }\n    let timeStr = \"\";"
);

fs.writeFileSync('src/ui.js', uiJs);
