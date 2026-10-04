const fs = require('fs');

// Load pokemon data
const fileData = fs.readFileSync('data/pokemon.json', 'utf8');
const obj = JSON.parse(fileData);
// Assuming data might be { pokemon: [...] } or something similar
const data = Array.isArray(obj) ? obj : (obj.pokemon || obj.pokemonData || Object.values(obj));

// Test IDs
const testIds = [1, 25, 132, 150, 400, 800, 1000]; // Spread across the dataset

function runFind() {
    let total = 0;
    for (let i = 0; i < 100000; i++) {
        const id = testIds[i % testIds.length];
        const p = data.find(poke => poke.id === id);
        if (p) total++;
    }
    return total;
}

const map = new Map();
data.forEach(p => map.set(p.id, p));

function runMap() {
    let total = 0;
    for (let i = 0; i < 100000; i++) {
        const id = testIds[i % testIds.length];
        const p = map.get(id);
        if (p) total++;
    }
    return total;
}

const startFind = performance.now();
runFind();
const endFind = performance.now();

const startMap = performance.now();
runMap();
const endMap = performance.now();

console.log(`Array.find(): ${(endFind - startFind).toFixed(2)} ms`);
console.log(`Map.get(): ${(endMap - startMap).toFixed(2)} ms`);
