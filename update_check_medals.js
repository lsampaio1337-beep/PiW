const fs = require('fs');
let uiJs = fs.readFileSync('src/ui.js', 'utf8');

// Insert a global function to check and award medals
const checkMedalsFn = `
window.checkAndAwardMedals = function() {
    if (!state.config || !state.config.pokemonData) return;

    const regions = ['Kanto', 'Johto', 'Hoenn', 'Sinnoh', 'Unova', 'Kalos', 'Alola', 'Galar', 'Hisui', 'Paldea'];

    regions.forEach(region => {
        let regionalStats;
        if (region === 'Kanto' && state.currentRegionName === 'Kanto') {
            regionalStats = state.stats;
        } else if (region === 'Kanto' && state.regions && state.regions['Kanto']) {
            regionalStats = state.regions['Kanto'].stats;
        } else {
            regionalStats = state.regions && state.regions[region] ? state.regions[region].stats : null;
        }

        if (!regionalStats && state.currentRegionName === region) {
            regionalStats = state.stats;
        }

        if (!regionalStats) return;

        if (!regionalStats.medalsEarned) {
            regionalStats.medalsEarned = {};
        }

        let caughtCount = 0;
        let shinyCount = 0;
        let totalInRegion = 0;

        const regionKey = region.toLowerCase() + '_id';

        state.config.pokemonData.forEach(p => {
            if (p[regionKey]) {
                totalInRegion++;
                if (regionalStats.caughtSpecies && regionalStats.caughtSpecies[p.name]) {
                    caughtCount++;
                }
                if (regionalStats.caughtShiniesSpecies && regionalStats.caughtShiniesSpecies[p.name]) {
                    shinyCount++;
                }
            }
        });

        const hasFirst = caughtCount > 0;
        const hasSecond = totalInRegion > 0 && caughtCount >= totalInRegion;
        const hasThird = totalInRegion > 0 && shinyCount >= totalInRegion;

        if (hasFirst && !regionalStats.medalsEarned['First']) {
            regionalStats.medalsEarned['First'] = { date: Date.now(), playtime: regionalStats.playtime || 0 };
        }
        if (hasSecond && !regionalStats.medalsEarned['Second']) {
            regionalStats.medalsEarned['Second'] = { date: Date.now(), playtime: regionalStats.playtime || 0 };
        }
        if (hasThird && !regionalStats.medalsEarned['Third']) {
            regionalStats.medalsEarned['Third'] = { date: Date.now(), playtime: regionalStats.playtime || 0 };
        }
    });
};
`;

uiJs = uiJs.replace(
    "function _awardJigglypuffDustGrains() {",
    checkMedalsFn + "\nfunction _awardJigglypuffDustGrains() {"
);

// Call it in gameClockTick
uiJs = uiJs.replace(
    "    _awardJigglypuffDustGrains();",
    "    _awardJigglypuffDustGrains();\n    window.checkAndAwardMedals();"
);

fs.writeFileSync('src/ui.js', uiJs);
