const fs = require('fs');

let content = fs.readFileSync('src/ui/pokedex.js', 'utf8');

// We need to add hasEncounteredSpecies helper
const encounteredHelper = `
export function hasEncounteredSpecies(id, state) {
    const pData = state.config.pokemonData.find(p => p.id === id);
    if (!pData) return false;
    return (state.stats.seenSpecies && state.stats.seenSpecies[pData.name]) ||
           (state.stats.caughtSpecies && state.stats.caughtSpecies[pData.name]) ||
           state.party.some(p => p.id === id) ||
           state.storage.some(p => p.id === id) ||
           state.safe.some(p => p.id === id) ||
           state.breeding.some(p => p.id === id) ||
           state.training.some(p => p.id === id) ||
           false;
}
`;

// Insert it before showPokedex
content = content.replace('export function showPokedex() {', encounteredHelper + '\nexport function showPokedex() {');

// Update showPokedex to use it
content = content.replace(
    /const hasEncountered = \([\s\S]*?false;/m,
    'const hasEncountered = hasEncounteredSpecies(i, state);'
);

fs.writeFileSync('src/ui/pokedex.js', content);
