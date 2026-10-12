const { performance } = require('perf_hooks');

// Mock data
const state = {
    config: {
        balance: {
            items: {
                pokeballs: [
                    { name: 'Poke Ball', price: 200 },
                    { name: 'Great Ball', price: 600 },
                    { name: 'Ultra Ball', price: 1200 },
                    { name: 'Master Ball', price: 0 },
                    // add some padding to make find take slightly longer
                    ...Array(50).fill(0).map((_, i) => ({ name: `Dummy Ball ${i}`, price: 100 })),
                    { name: 'Safari Ball', price: 0 }
                ],
                potions: [
                    { name: 'Potion', price: 300 },
                    { name: 'Super Potion', price: 700 },
                    { name: 'Hyper Potion', price: 1200 },
                    { name: 'Max Potion', price: 2500 },
                    { name: 'Big', price: 2500 }, // Big Potion
                    ...Array(50).fill(0).map((_, i) => ({ name: `Dummy Potion ${i}`, price: 100 })),
                    { name: 'Full Restore', price: 3000 }
                ]
            }
        }
    }
};

const results = {
    itemsLooted: {
        'Poke Ball': 10,
        'Great Ball': 5,
        'Ultra Ball': 2,
        'Master Ball': 1,
        'Potion': 20,
        'Super Potion': 10,
        'Hyper Potion': 5,
        'Max Potion': 2,
        'Big Potion': 1,
        'Full Restore': 1,
        'Dummy Ball 40': 5,
        'Dummy Potion 45': 2
    }
};

const ITERATIONS = 100000;

function runOld() {
    let totalBasePrice = 0;
    for (let i = 0; i < ITERATIONS; i++) {
        for (let itemName in results.itemsLooted) {
            let count = results.itemsLooted[itemName];
            if (count > 0) {
                let imgFolder = "";
                let basePrice = 0;

                if (state.config.balance.items.pokeballs.find(b => b.name === itemName)) {
                    imgFolder = "Balls";
                    basePrice = state.config.balance.items.pokeballs.find(b => b.name === itemName).price;
                } else if (state.config.balance.items.potions.find(p => p.name === itemName || (p.name === 'Big' && itemName === 'Big Potion'))) {
                    imgFolder = "Potions";
                    const potionObj = state.config.balance.items.potions.find(p => p.name === itemName || (p.name === 'Big' && itemName === 'Big Potion'));
                    basePrice = potionObj.price;
                }

                totalBasePrice += basePrice * count;
            }
        }
    }
    return totalBasePrice;
}

function runNew() {
    let totalBasePrice = 0;
    for (let i = 0; i < ITERATIONS; i++) {
        for (let itemName in results.itemsLooted) {
            let count = results.itemsLooted[itemName];
            if (count > 0) {
                let imgFolder = "";
                let basePrice = 0;

                let pokeballObj = state.config.balance.items.pokeballs.find(b => b.name === itemName);
                if (pokeballObj) {
                    imgFolder = "Balls";
                    basePrice = pokeballObj.price;
                } else {
                    let potionObj = state.config.balance.items.potions.find(p => p.name === itemName || (p.name === 'Big' && itemName === 'Big Potion'));
                    if (potionObj) {
                        imgFolder = "Potions";
                        basePrice = potionObj.price;
                    }
                }

                totalBasePrice += basePrice * count;
            }
        }
    }
    return totalBasePrice;
}

const startOld = performance.now();
const resOld = runOld();
const endOld = performance.now();
const timeOld = endOld - startOld;

const startNew = performance.now();
const resNew = runNew();
const endNew = performance.now();
const timeNew = endNew - startNew;

console.log(`Baseline (Old) Time: ${timeOld.toFixed(2)} ms`);
console.log(`Optimized (New) Time: ${timeNew.toFixed(2)} ms`);
console.log(`Improvement: ${((timeOld - timeNew) / timeOld * 100).toFixed(2)}%`);
console.log(`Results match: ${resOld === resNew}`);
