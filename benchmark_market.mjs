import { performance } from 'perf_hooks';

// Mock state
const state = {
    config: {
        pokemonData: []
    },
    storage: [],
    trainer: { money: 0 }
};

// Populate config with 1000 pokemons
for (let i = 1; i <= 1000; i++) {
    state.config.pokemonData.push({
        id: i,
        hp: 10, atk: 10, def: 10, spa: 10, spd: 10, spe: 10
    });
}

// Populate storage with 10000 pokemons to sell
for (let i = 0; i < 10000; i++) {
    state.storage.push({
        uuid: `uuid-${i}`,
        id: (i % 1000) + 1,
        ivs: { hp: 1, atk: 1, def: 1, spa: 1, spd: 1, spe: 1 },
        level: 10,
        quality: 1,
        // bst is undefined
    });
}

// Mock calculatePP
function calculatePP(bst, level, quality, sumIV) {
    return 100;
}

// Global scope mock
global.state = state;
global.window = {
    marketSelectedPokemonForSale: new Set(state.storage.map(p => p.uuid))
};
global.calculatePP = calculatePP;

function unoptimized() {
    let numSold = global.window.marketSelectedPokemonForSale.size;
    let totalGain = 0;

    let newStorage = global.state.storage.filter(p => {
        if (global.window.marketSelectedPokemonForSale.has(p.uuid)) {
            let sumIV = p.ivs.hp + p.ivs.atk + p.ivs.def + p.ivs.spa + p.ivs.spd + p.ivs.spe;
            if (p.bst === undefined) {
                if (typeof p.id === 'number' && global.state.config && global.state.config.pokemonData) {
                    const pd = global.state.config.pokemonData.find(pd => pd.id === p.id);
                    if (pd) p.bst = pd.hp + pd.atk + pd.def + pd.spa + pd.spd + pd.spe;
                }
            }
            let pEv = global.calculatePP(p.bst || 300, p.level, p.quality, sumIV);
            totalGain += pEv;
            return false;
        }
        return true;
    });

    return totalGain;
}

function optimized() {
    let numSold = global.window.marketSelectedPokemonForSale.size;
    let totalGain = 0;

    // Reset BST
    global.state.storage.forEach(p => p.bst = undefined);

    let pokemonDataMap = new Map();
    if (global.state.config && global.state.config.pokemonData) {
        for (const pd of global.state.config.pokemonData) {
            pokemonDataMap.set(pd.id, pd);
        }
    }

    let newStorage = global.state.storage.filter(p => {
        if (global.window.marketSelectedPokemonForSale.has(p.uuid)) {
            let sumIV = p.ivs.hp + p.ivs.atk + p.ivs.def + p.ivs.spa + p.ivs.spd + p.ivs.spe;
            if (p.bst === undefined) {
                if (typeof p.id === 'number') {
                    const pd = pokemonDataMap.get(p.id);
                    if (pd) p.bst = pd.hp + pd.atk + pd.def + pd.spa + pd.spd + pd.spe;
                }
            }
            let pEv = global.calculatePP(p.bst || 300, p.level, p.quality, sumIV);
            totalGain += pEv;
            return false;
        }
        return true;
    });

    return totalGain;
}

const ITERATIONS = 10;

let startUnopt = performance.now();
for (let i = 0; i < ITERATIONS; i++) {
    // Reset BSTs for fair comparison
    global.state.storage.forEach(p => p.bst = undefined);
    unoptimized();
}
let timeUnopt = performance.now() - startUnopt;
console.log(`Unoptimized average time: ${timeUnopt / ITERATIONS} ms`);

let startOpt = performance.now();
for (let i = 0; i < ITERATIONS; i++) {
    // Reset BSTs for fair comparison
    global.state.storage.forEach(p => p.bst = undefined);
    optimized();
}
let timeOpt = performance.now() - startOpt;
console.log(`Optimized average time: ${timeOpt / ITERATIONS} ms`);

console.log(`Speedup: ${(timeUnopt / timeOpt).toFixed(2)}x`);
