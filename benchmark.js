const { performance } = require('perf_hooks');

const pokemonBase = {
    learnset: {}
};

// Generate a large learnset
for (let i = 1; i <= 100; i++) {
    pokemonBase.learnset[i] = [];
    for (let j = 0; j < 5; j++) {
        pokemonBase.learnset[i].push(`Move_${(i * 5 + j) % 50}`); // lots of duplicates
    }
}

const config = { moves: {} };
for (let i = 0; i < 100; i++) {
    config.moves[`Move_${i}`] = { name: `Move_${i}` };
}

function originalMethod(level) {
    let learned = [];
    for (let i = 1; i <= level; i++) {
        if (pokemonBase.learnset && pokemonBase.learnset[i]) {
            const moveNames = pokemonBase.learnset[i];
            for (const mName of moveNames) {
                const moveData = config.moves[mName];
                if (moveData && !learned.find(lm => lm.name === mName)) {
                    learned.push(moveData);
                }
            }
        }
    }
    return learned.slice(-4);
}

function optimizedMethod(level) {
    let learned = [];
    let learnedNames = new Set();
    for (let i = 1; i <= level; i++) {
        if (pokemonBase.learnset && pokemonBase.learnset[i]) {
            const moveNames = pokemonBase.learnset[i];
            for (const mName of moveNames) {
                const moveData = config.moves[mName];
                if (moveData && !learnedNames.has(mName)) {
                    learned.push(moveData);
                    learnedNames.add(mName);
                }
            }
        }
    }
    return learned.slice(-4);
}

// Warm up
for(let i = 0; i < 10000; i++) {
    originalMethod(100);
    optimizedMethod(100);
}

let start = performance.now();
for(let i = 0; i < 100000; i++) {
    originalMethod(100);
}
let end = performance.now();
console.log(`Original: ${end - start} ms`);

start = performance.now();
for(let i = 0; i < 100000; i++) {
    optimizedMethod(100);
}
end = performance.now();
console.log(`Optimized: ${end - start} ms`);
