const fs = require('fs');

// Create mock game state
const fileData = fs.readFileSync('data/pokemon.json', 'utf8');
const obj = JSON.parse(fileData);
const data = Array.isArray(obj) ? obj : (obj.pokemon || obj.pokemonData || Object.values(obj));

const mockState = {
    config: {
        pokemonData: data
    }
};

// Simulate BattleSystem before change
class OldBattleSystem {
    constructor(state) {
        this.state = state;
    }
    getPokemonBase(id) {
        return this.state.config.pokemonData.find(p => p.id === id);
    }
}

// Simulate BattleSystem after change
class NewBattleSystem {
    constructor(state) {
        this.state = state;
    }
    getPokemonBase(id) {
        if (!this.pokemonBaseMap) {
            this.pokemonBaseMap = new Map();
            if (this.state.config && this.state.config.pokemonData) {
                for (const p of this.state.config.pokemonData) {
                    this.pokemonBaseMap.set(p.id, p);
                }
            }
        }
        return this.pokemonBaseMap.get(id);
    }
}

const oldSys = new OldBattleSystem(mockState);
const newSys = new NewBattleSystem(mockState);

const testIds = [1, 25, 132, 150, 400, 800, 1000];
const iterations = 100000;

const startOld = performance.now();
for (let i = 0; i < iterations; i++) {
    oldSys.getPokemonBase(testIds[i % testIds.length]);
}
const endOld = performance.now();

// prime the map
newSys.getPokemonBase(1);
const startNew = performance.now();
for (let i = 0; i < iterations; i++) {
    newSys.getPokemonBase(testIds[i % testIds.length]);
}
const endNew = performance.now();

console.log(`[BENCHMARK] Baseline (O(N) Array.find): ${(endOld - startOld).toFixed(2)} ms`);
console.log(`[BENCHMARK] Optimized (O(1) Map.get): ${(endNew - startNew).toFixed(2)} ms`);
console.log(`[BENCHMARK] Improvement: ${(((endOld - startOld) / (endNew - startNew)) || 1).toFixed(2)}x faster`);
