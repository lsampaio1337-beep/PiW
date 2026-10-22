const fs = require('fs');

let state = {
    stats: {
        caughtSpecies: {},
        caughtSpeciesCount: 0
    },
    config: {
        pokemonData: []
    }
};

for (let i = 0; i < 1000; i++) {
    state.config.pokemonData.push({ name: `Pokemon${i}` });
}

function original() {
    state.stats = { caughtSpecies: {}, caughtSpeciesCount: 0 };
    for (let i = 0; i < 150; i++) {
        state.stats.caughtSpecies[`Pokemon${i}`] = 1;
    }
    state.stats.caughtSpeciesCount = 150;

    let start = performance.now();
    for (let j = 0; j < 100000; j++) {
        let count = 0;
        for (let i = 0; i < state.config.pokemonData.length; i++) {
             if (count >= 150) break;
             let p = state.config.pokemonData[i];
             if (!state.stats.caughtSpecies[p.name]) {
                 state.stats.caughtSpeciesCount = (state.stats.caughtSpeciesCount || 0) + 1;
             }
             state.stats.caughtSpecies[p.name] = 1;
             count++;
        }
    }
    return performance.now() - start;
}

function optimized() {
    state.stats = { caughtSpecies: {}, caughtSpeciesCount: 0 };
    for (let i = 0; i < 150; i++) {
        state.stats.caughtSpecies[`Pokemon${i}`] = 1;
    }
    state.stats.caughtSpeciesCount = 150;

    let start = performance.now();
    for (let j = 0; j < 100000; j++) {
        if (!state.stats.caughtSpecies) state.stats.caughtSpecies = {};
        state.stats.caughtSpeciesCount = state.stats.caughtSpeciesCount || 0;
        for (let i = 0; i < state.config.pokemonData.length; i++) {
             if (state.stats.caughtSpeciesCount >= 150) break;
             let p = state.config.pokemonData[i];
             if (!state.stats.caughtSpecies[p.name]) {
                 state.stats.caughtSpeciesCount++;
                 state.stats.caughtSpecies[p.name] = 1;
             }
        }
    }
    return performance.now() - start;
}

const origTime = original();
const optTime = optimized();

console.log(`Original: ${origTime.toFixed(2)}ms`);
console.log(`Optimized: ${optTime.toFixed(2)}ms`);
console.log(`Improvement: ${((origTime - optTime) / origTime * 100).toFixed(2)}%`);
