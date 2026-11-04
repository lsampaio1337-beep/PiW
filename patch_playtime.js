const fs = require('fs');

let uiJs = fs.readFileSync('src/ui.js', 'utf8');

uiJs = uiJs.replace(
    "    state.globalStats.playtime++;",
    "    state.globalStats.playtime++;\n    if (state.currentRegionName && state.regions && state.regions[state.currentRegionName] && state.regions[state.currentRegionName].stats) {\n        if (!state.regions[state.currentRegionName].stats.playtime) state.regions[state.currentRegionName].stats.playtime = 0;\n        state.regions[state.currentRegionName].stats.playtime++;\n    }\n    if (state.currentRegionName === 'Kanto' && state.stats) {\n        if (!state.stats.playtime) state.stats.playtime = 0;\n        state.stats.playtime++;\n    }"
);

fs.writeFileSync('src/ui.js', uiJs);
