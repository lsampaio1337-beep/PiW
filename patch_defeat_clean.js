const fs = require('fs');

let battleJs = fs.readFileSync('src/battleSystem.js', 'utf8');

// Replace the mess that was the remnants of the old defeat function

const toCleanStart = `    // cleanup`;
const toCleanEnd = `    handleGymEnemyDefeat() {`;

const match = battleJs.substring(battleJs.indexOf(toCleanStart), battleJs.indexOf(toCleanEnd));
battleJs = battleJs.replace(match, "\n\n    handleGymVictory() {\n        this.handleGymEnemyDefeat();\n    }\n\n");

fs.writeFileSync('src/battleSystem.js', battleJs);
console.log('Cleaned up battle file.');
