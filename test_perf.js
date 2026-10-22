const fs = require('fs');

// Mock state and window.getCurrentUnlocks
const state = {
  stats: {
    completedChallengeIds: Array.from({length: 1000}, (_, i) => `challenge_${i}`)
  }
};

const currentUnlocks = Array.from({length: 1000}, (_, i) => ({areaId: `challenge_${i}`}));

window = {
  getCurrentUnlocks: () => currentUnlocks
};

// Benchmark current approach
console.time('current_approach');
for (let i = 0; i < 1000; i++) {
  let challengesCompleted = state.stats.completedChallengeIds ?
      (window.getCurrentUnlocks() ? state.stats.completedChallengeIds.filter(id => window.getCurrentUnlocks().some(u => u.areaId === id)).length : state.stats.completedChallengeIds.length)
      : 0;
}
console.timeEnd('current_approach');

// Benchmark optimized approach
console.time('optimized_approach');
for (let i = 0; i < 1000; i++) {
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
}
console.timeEnd('optimized_approach');
