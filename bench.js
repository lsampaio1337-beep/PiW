// Standalone benchmark logic without importing UI components directly

const pokemonData = Array.from({length: 1000}, (_, i) => ({ id: i, types: ['Normal', 'Fire'], name: `Poke${i}` }));

const routes = Array.from({length: 100}, (_, i) => ({
    name: `Area${i+1}`,
    spawns: Array.from({length: 20}, (_, j) => ({ pokemonId: (i * 20 + j) % 1000 }))
}));

const unlockedAreas = new Set();
for (let i = 1; i <= 50; i++) {
    unlockedAreas.add(`Area${i}`);
}

function runOriginal() {
    let availableTypes = new Set();
    for (let area of unlockedAreas) {
        let route = routes.find(r => r.name === area);
        if (route && route.spawns) {
            for (let s of route.spawns) {
                let pData = pokemonData.find(pd => pd.id === s.pokemonId);
                if (pData && pData.types) pData.types.forEach(t => availableTypes.add(t));
            }
        }
    }
    return availableTypes;
}

function runOptimized() {
    let availableTypes = new Set();

    const routeMap = new Map();
    for (const r of routes) {
        routeMap.set(r.name, r);
    }

    const pokemonMap = new Map();
    for (const p of pokemonData) {
        pokemonMap.set(p.id, p);
    }

    for (let area of unlockedAreas) {
        let route = routeMap.get(area);
        if (route && route.spawns) {
            for (let s of route.spawns) {
                let pData = pokemonMap.get(s.pokemonId);
                if (pData && pData.types) pData.types.forEach(t => availableTypes.add(t));
            }
        }
    }
    return availableTypes;
}

const ITERATIONS = 1000;

let start = performance.now();
for (let i = 0; i < ITERATIONS; i++) {
    runOriginal();
}
let originalTime = performance.now() - start;

start = performance.now();
for (let i = 0; i < ITERATIONS; i++) {
    runOptimized();
}
let optimizedTime = performance.now() - start;

console.log(`Original Time: ${originalTime.toFixed(2)} ms`);
console.log(`Optimized Time: ${optimizedTime.toFixed(2)} ms`);
console.log(`Speedup: ${(originalTime / optimizedTime).toFixed(2)}x`);
