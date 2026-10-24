import { performance } from 'perf_hooks';

// Simulate a dataset of caught Pokemon
const caught = {};
for (let i = 0; i < 1000; i++) {
    caught[`Pokemon_${i}`] = 1;
}

const iterations = 10000;

// Benchmark 1: manual for...in loop
let startTime = performance.now();
for (let j = 0; j < iterations; j++) {
    let caughtCount = 0;
    for (let _ in caught) {
        caughtCount++;
    }
}
let endTime = performance.now();
const timeForIn = endTime - startTime;

// Benchmark 2: Object.keys().length
startTime = performance.now();
for (let j = 0; j < iterations; j++) {
    let caughtCount = Object.keys(caught).length;
}
endTime = performance.now();
const timeObjectKeys = endTime - startTime;

console.log(`Manual for...in loop: ${timeForIn.toFixed(2)} ms`);
console.log(`Object.keys().length: ${timeObjectKeys.toFixed(2)} ms`);
console.log(`Improvement: ${((timeForIn - timeObjectKeys) / timeForIn * 100).toFixed(2)}% faster`);
