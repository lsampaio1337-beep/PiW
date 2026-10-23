import crypto from 'crypto';

let storage = [];
for (let i = 0; i < 5000; i++) {
    const id = Math.floor(Math.random() * 151) + 1;
    const uuid = crypto.randomUUID();
    storage.push({
        id,
        uuid,
        level: Math.floor(Math.random() * 100) + 1,
        quality: Math.random() * 100,
        ivs: { hp: 31, atk: 31, def: 31, spa: 31, spd: 31, spe: 31 }
    });
}

let pokemonData = [];
for (let i = 1; i <= 200; i++) {
    pokemonData.push({
        id: i,
        name: `Pokemon${i}`,
        hp: 50, atk: 50, def: 50, spa: 50, spd: 50, spe: 50
    });
}

let marketSelectedPokemonForSale = new Set();
storage.forEach(p => marketSelectedPokemonForSale.add(p.uuid));

function calculatePP(bst, level, quality, sumIV) {
    return bst + level + quality + sumIV;
}

let state = { config: { pokemonData: pokemonData } };

function runBenchmarkInside() {
    const start = performance.now();
    let totalGain = 0;

    for (let i = 0; i < storage.length; i++) {
        let p = storage[i];
        if (marketSelectedPokemonForSale.has(p.uuid)) {
            let sumIV = p.ivs.hp + p.ivs.atk + p.ivs.def + p.ivs.spa + p.ivs.spd + p.ivs.spe;
            if (p.bst === undefined) {
                if (typeof p.id === 'number' && state.config && state.config.pokemonData) {
                    const pd = state.config.pokemonData.find(pd => pd.id === p.id);
                    if (pd) p.bst = pd.hp + pd.atk + pd.def + pd.spa + pd.spd + pd.spe;
                }
            }
            let pEv = calculatePP(p.bst || 300, p.level, p.quality, sumIV);
            totalGain += pEv;
        }
    }

    for (let p of storage) p.bst = undefined;

    return performance.now() - start;
}

let _cachedPokemonDataMap = null;
function getPokemonDataMap() {
    if (!_cachedPokemonDataMap && state.config && state.config.pokemonData) {
        _cachedPokemonDataMap = new Map();
        for (let i = 0; i < state.config.pokemonData.length; i++) {
            _cachedPokemonDataMap.set(state.config.pokemonData[i].id, state.config.pokemonData[i]);
        }
    }
    return _cachedPokemonDataMap;
}

function runBenchmarkOutside() {
    const start = performance.now();
    let totalGain = 0;

    const map = getPokemonDataMap();

    for (let i = 0; i < storage.length; i++) {
        let p = storage[i];
        if (marketSelectedPokemonForSale.has(p.uuid)) {
            let sumIV = p.ivs.hp + p.ivs.atk + p.ivs.def + p.ivs.spa + p.ivs.spd + p.ivs.spe;
            if (p.bst === undefined) {
                if (typeof p.id === 'number') {
                    if (map) {
                        const pd = map.get(p.id);
                        if (pd) p.bst = pd.hp + pd.atk + pd.def + pd.spa + pd.spd + pd.spe;
                    }
                }
            }
            let pEv = calculatePP(p.bst || 300, p.level, p.quality, sumIV);
            totalGain += pEv;
        }
    }

    for (let p of storage) p.bst = undefined;

    return performance.now() - start;
}

for (let i = 0; i < 5; i++) {
    runBenchmarkInside();
    runBenchmarkOutside();
}

let timeInside = 0;
let timeOutside = 0;
const iterations = 50;

for (let i = 0; i < iterations; i++) {
    timeInside += runBenchmarkInside();
    timeOutside += runBenchmarkOutside();
}

console.log(`Original Code (O(N*M)): ${(timeInside / iterations).toFixed(2)} ms per run`);
console.log(`Optimized Code (Map): ${(timeOutside / iterations).toFixed(2)} ms per run`);
console.log(`Improvement: ${((timeInside - timeOutside) / timeInside * 100).toFixed(2)}%`);
