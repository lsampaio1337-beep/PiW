const fs = require('fs');

let stateCode = fs.readFileSync('src/state.js', 'utf8');

const getCurrentRoutesPatch = `
window.getCurrentRoutes = function() {
    if (!state.config) return [];
    if (state.currentRegionName === 'Johto' && state.config.johtoRoutes) return state.config.johtoRoutes;
    if (state.currentRegionName === 'Hoenn' && state.config.hoennRoutes) return state.config.hoennRoutes;
    if (state.currentRegionName === 'Sinnoh' && state.config.sinnohRoutes) return state.config.sinnohRoutes;
    if (state.currentRegionName === 'Unova' && state.config.unovaRoutes) return state.config.unovaRoutes;
    if (state.currentRegionName === 'Kalos' && state.config.kalosRoutes) return state.config.kalosRoutes;
    if (state.currentRegionName === 'Alola' && state.config.alolaRoutes) return state.config.alolaRoutes;
    if (state.currentRegionName === 'Galar' && state.config.galarRoutes) return state.config.galarRoutes;
    if (state.currentRegionName === 'Hisui' && state.config.hisuiRoutes) return state.config.hisuiRoutes;
    if (state.currentRegionName === 'Paldea' && state.config.paldeaRoutes) return state.config.paldeaRoutes;
    return state.config.routes || [];
};
`;

const getCurrentUnlocksPatch = `
window.getCurrentUnlocks = function() {
    if (!state.config) return [];
    if (state.currentRegionName === 'Johto' && state.config.johtoUnlocks) return state.config.johtoUnlocks;
    if (state.currentRegionName === 'Hoenn' && state.config.hoennUnlocks) return state.config.hoennUnlocks;
    if (state.currentRegionName === 'Sinnoh' && state.config.sinnohUnlocks) return state.config.sinnohUnlocks;
    if (state.currentRegionName === 'Unova' && state.config.unovaUnlocks) return state.config.unovaUnlocks;
    if (state.currentRegionName === 'Kalos' && state.config.kalosUnlocks) return state.config.kalosUnlocks;
    if (state.currentRegionName === 'Alola' && state.config.alolaUnlocks) return state.config.alolaUnlocks;
    if (state.currentRegionName === 'Galar' && state.config.galarUnlocks) return state.config.galarUnlocks;
    if (state.currentRegionName === 'Hisui' && state.config.hisuiUnlocks) return state.config.hisuiUnlocks;
    if (state.currentRegionName === 'Paldea' && state.config.paldeaUnlocks) return state.config.paldeaUnlocks;
    return state.config.unlocks || [];
};
`;

stateCode = stateCode.replace(/window\.getCurrentRoutes = function\(\) \{[\s\S]*?return state\.config\.routes \|\| \[\];\n\};/, getCurrentRoutesPatch.trim());
stateCode = stateCode.replace(/window\.getCurrentUnlocks = function\(\) \{[\s\S]*?return state\.config\.unlocks \|\| \[\];\n\};/, getCurrentUnlocksPatch.trim());

fs.writeFileSync('src/state.js', stateCode);
console.log('patched state.js');
