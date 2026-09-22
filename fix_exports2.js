const fs = require('fs');
let content = fs.readFileSync('src/ui.js', 'utf8');

content = content.replace("window.showBonusCandyModal = showBonusCandyModal;\nimport { showSettings, updateGameSpeed, exportLog, showAddPokemonModal, forceNextEncounter, activateCheat, showTimeLapseModal, runTimeLapse } from './ui/settings.js';\nwindow.showGiftModal = showGiftModal;\nimport { showSettings, updateGameSpeed, addMoney, addXp, exportLog, showAddPokemonModal, forceNextEncounter, activateCheat, showTimeLapseModal, runTimeLapse } from './ui/settings.js';",
"window.showBonusCandyModal = showBonusCandyModal;\nwindow.showGiftModal = showGiftModal;\nimport { showSettings, updateGameSpeed, exportLog, showAddPokemonModal, forceNextEncounter, activateCheat, showTimeLapseModal, runTimeLapse } from './ui/settings.js';");

fs.writeFileSync('src/ui.js', content, 'utf8');
