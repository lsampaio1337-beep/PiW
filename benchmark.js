const fs = require('fs');

// Benchmark data setup
const numElements = 2000;
const state = {
  stats: {
    completedChallengeIds: Array.from({length: numElements}, (_, i) => `challenge_${i}`)
  }
};

const currentUnlocks = Array.from({length: numElements}, (_, i) => ({areaId: `challenge_${i}`}));

window = {
  getCurrentUnlocks: () => currentUnlocks
};

function runCurrent() {
    let challengesCompleted = state.stats.completedChallengeIds ?
        (window.getCurrentUnlocks() ? state.stats.completedChallengeIds.filter(id => window.getCurrentUnlocks().some(u => u.areaId === id)).length : state.stats.completedChallengeIds.length)
        : 0;
    return challengesCompleted;
}

function runOptimized() {
    let challengesCompleted = 0;
    if (state.stats.completedChallengeIds) {
        const unlocks = window.getCurrentUnlocks();
        if (unlocks) {
            const unlockIds = new Set(unlocks.map(u => u.areaId));
            challengesCompleted = state.stats.completedChallengeIds.filter(id => unlockIds.has(id)).length;
        } else {
            challengesCompleted = state.stats.completedChallengeIds.length;
        }
    }
    return challengesCompleted;
}

// Warmup
for (let i = 0; i < 100; i++) {
    runCurrent();
    runOptimized();
}

console.log(`Running benchmark with N=${numElements}...`);

const iterations = 500;

console.time('Baseline (O(N^2))');
for (let i = 0; i < iterations; i++) {
    runCurrent();
}
console.timeEnd('Baseline (O(N^2))');

console.time('Optimized (O(N))');
for (let i = 0; i < iterations; i++) {
    runOptimized();
}
console.timeEnd('Optimized (O(N))');
