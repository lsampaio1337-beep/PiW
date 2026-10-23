const crypto = await import('crypto');

// Create a large storage to benchmark
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

// Minimal mocked pokemon data
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

// Mock calculatePP
function calculatePP(bst, level, quality, sumIV) {
    return bst + level + quality + sumIV;
}

// Function to run benchmark
function runBenchmark(useMap) {
    const start = performance.now();

    let totalGain = 0;

    let map = null;
    if (useMap) {
        map = new Map();
        for (let i = 0; i < pokemonData.length; i++) {
            map.set(pokemonData[i].id, pokemonData[i]);
        }
    }

    for (let i = 0; i < storage.length; i++) {
        let p = storage[i];
        if (marketSelectedPokemonForSale.has(p.uuid)) {
            let sumIV = p.ivs.hp + p.ivs.atk + p.ivs.def + p.ivs.spa + p.ivs.spd + p.ivs.spe;
            if (p.bst === undefined) {
                if (typeof p.id === 'number') {
                    if (useMap) {
                        const pd = map.get(p.id);
                        if (pd) p.bst = pd.hp + pd.atk + pd.def + pd.spa + pd.spd + pd.spe;
                    } else {
                        const pd = pokemonData.find(pd => pd.id === p.id);
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

// Warmup
for (let i = 0; i < 5; i++) {
    runBenchmark(false);
    runBenchmark(true);
}

let timeOld = 0;
let timeNew = 0;
const iterations = 50;

for (let i = 0; i < iterations; i++) {
    timeOld += runBenchmark(false);
    timeNew += runBenchmark(true);
}

console.log(`Baseline (O(N*M)): ${(timeOld / iterations).toFixed(2)} ms per run`);
console.log(`Optimized (Map): ${(timeNew / iterations).toFixed(2)} ms per run`);
console.log(`Improvement: ${((timeOld - timeNew) / timeOld * 100).toFixed(2)}%`);
