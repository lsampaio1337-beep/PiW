const DayCare = require('./src/dayCare.js').default;

const gameState = {};
const daycare = new DayCare(gameState);
daycare.slot1.pokemon = { quality: 1.5 };
daycare.slot1.isBreeding = true;
daycare.slot1.requiredBattles = 100;
daycare.slot1.battles = 99;

// Mock window to avoid reference error
global.window = {
    trackDailyChallenge: () => {}
};

daycare.tickBattle();

console.log("Quality after breeding:", daycare.slot1.pokemon.quality);
if (daycare.slot1.pokemon.quality <= 1.99) {
    console.log("SUCCESS: Quality is correctly capped.");
} else {
    console.log("FAILURE: Quality is over cap.");
}
