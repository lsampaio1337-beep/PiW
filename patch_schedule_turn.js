const fs = require('fs');

let battleJs = fs.readFileSync('src/battleSystem.js', 'utf8');

// Delay scheduleTurn start to allow the 2s slide in animation to complete
const oldGenerateEncounterFinish = `        this.isSearching = false;
        this.updateUI();
        this.scheduleTurn();
    }`;

const newGenerateEncounterFinish = `        this.isSearching = false;
        this.updateUI();

        // Wait 2s for slide in animation before starting combat turns
        this.combatLoop = setTimeout(() => {
            this.scheduleTurn();
        }, 2000);
    }`;

battleJs = battleJs.replace(oldGenerateEncounterFinish, newGenerateEncounterFinish); // replaces first (gym)
battleJs = battleJs.replace(oldGenerateEncounterFinish, newGenerateEncounterFinish); // replaces second (wild)

fs.writeFileSync('src/battleSystem.js', battleJs);
console.log('Entrance delay patched into battle generation!');
