const fs = require('fs');

let battleJs = fs.readFileSync('src/battleSystem.js', 'utf8');

const searchNextSig = `    async searchNext() {`;
const searchNextReplacement = `    async searchNext(delayOverride) {`;
battleJs = battleJs.replace(searchNextSig, searchNextReplacement);

const oldSearchDelay = `        // Speed Delays: Search Time: BaseSearchTime(3.0s) * (100 / (100 + Speed)), minimum 0.30s
        const leaderSpeed = this.state.party[0].currentStats.spe;
        let delay = this.state.config.balance.baseSearchTime * 1000 * (100 / (100 + leaderSpeed));
        delay = Math.max(300, delay) / this.state.settings.gameSpeed;

        this.combatLoop = setTimeout(() => {
            if (this.gymState.isActive) {
                this.generateGymEncounter();
            } else {
                this.generateEncounter();
            }
        }, delay);`;

const newSearchDelay = `        let delay = delayOverride;
        if (delay === undefined) {
            const leaderSpeed = this.state.party[0].currentStats.spe;
            delay = 5.0 - ((leaderSpeed - 15) / 150) * 4.5;
            delay = Math.max(0.5, Math.min(5.0, delay)) * 1000;
        }

        this.combatLoop = setTimeout(() => {
            if (this.gymState.isActive) {
                this.generateGymEncounter();
            } else {
                this.generateEncounter();
            }
        }, delay);`;

battleJs = battleJs.replace(oldSearchDelay, newSearchDelay);

fs.writeFileSync('src/battleSystem.js', battleJs);
console.log('Patched searchNext delay!');
