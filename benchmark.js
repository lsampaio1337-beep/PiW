const { performance } = require('perf_hooks');

// Create a mock object with a lot of keys
const caught = {};
for (let i = 0; i < 1000; i++) {
  caught[`pokemon${i}`] = 1;
}

const ITERATIONS = 100000;

// Benchmark for...in loop
let startForIn = performance.now();
let caughtCountForIn = 0;
for (let i = 0; i < ITERATIONS; i++) {
  caughtCountForIn = 0;
  for (let _ in caught) caughtCountForIn++;
}
let endForIn = performance.now();
let timeForIn = endForIn - startForIn;

// Benchmark Object.keys().length
let startObjKeys = performance.now();
let caughtCountObjKeys = 0;
for (let i = 0; i < ITERATIONS; i++) {
  caughtCountObjKeys = Object.keys(caught).length;
}
let endObjKeys = performance.now();
let timeObjKeys = endObjKeys - startObjKeys;

console.log(`for...in loop time: ${timeForIn.toFixed(4)} ms`);
console.log(`Object.keys().length time: ${timeObjKeys.toFixed(4)} ms`);
console.log(`Improvement: ${((timeForIn - timeObjKeys) / timeForIn * 100).toFixed(2)}% faster`);
