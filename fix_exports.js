const fs = require('fs');
let content = fs.readFileSync('src/ui.js', 'utf8');

if (!content.includes("import { showSettings, updateGameSpeed, exportLog, showAddPokemonModal, forceNextEncounter, activateCheat } from './ui/settings.js';")) {
    content = content.replace("window.showBonusCandyModal = showBonusCandyModal;",
`window.showBonusCandyModal = showBonusCandyModal;
import { showSettings, updateGameSpeed, exportLog, showAddPokemonModal, forceNextEncounter, activateCheat, showTimeLapseModal, runTimeLapse } from './ui/settings.js';`);
}

fs.writeFileSync('src/ui.js', content, 'utf8');
