const fs = require('fs');

let settingsJs = fs.readFileSync('src/ui/settings.js', 'utf8');

settingsJs = settingsJs.replace(
    "            state.globalStats.playtime = (state.globalStats.playtime || 0) + simulatedSeconds;",
    "            state.globalStats.playtime = (state.globalStats.playtime || 0) + simulatedSeconds;\n            if (state.currentRegionName && state.regions && state.regions[state.currentRegionName] && state.regions[state.currentRegionName].stats) {\n                state.regions[state.currentRegionName].stats.playtime = (state.regions[state.currentRegionName].stats.playtime || 0) + simulatedSeconds;\n            }\n            if (state.currentRegionName === 'Kanto' && state.stats) {\n                state.stats.playtime = (state.stats.playtime || 0) + simulatedSeconds;\n            }"
);

fs.writeFileSync('src/ui/settings.js', settingsJs);
