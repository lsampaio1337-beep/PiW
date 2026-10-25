global.window = {};

const gyms = [];
for (let i = 0; i < 100; i++) {
    gyms.push({ name: `Gym ${i}` });
}

class BattleSystemGymFind {
    constructor() {
        this.state = { config: { gyms } };
    }
    startGymBattle(gymName) {
        return this.state.config.gyms.find(g => g.name === gymName);
    }
}

class BattleSystemGymMap {
    constructor() {
        this.state = { config: { gyms } };
    }
    startGymBattle(gymName) {
        if (!this._gymMapCache) {
            this._gymMapCache = new Map();
            for (const g of this.state.config.gyms) {
                this._gymMapCache.set(g.name, g);
            }
        }
        return this._gymMapCache.get(gymName);
    }
}


const sysFind = new BattleSystemGymFind();
const sysMap = new BattleSystemGymMap();

let t1 = performance.now();
for (let i=0; i<1000000; i++) sysFind.startGymBattle('Gym 50');
let tFind = performance.now() - t1;

let t2 = performance.now();
for (let i=0; i<1000000; i++) sysMap.startGymBattle('Gym 50');
let tMap = performance.now() - t2;

console.log(`Find: ${tFind.toFixed(2)}ms`);
console.log(`Map Cache: ${tMap.toFixed(2)}ms`);
