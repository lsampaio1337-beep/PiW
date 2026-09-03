const fs = require('fs');

let content = fs.readFileSync('src/battleSystem.js', 'utf8');

// Replace checkRouteUnlocks to actually check current challenge rules for defeats
const checkUnlocksOld = `    checkRouteUnlocks() {
        // Progression is handled via map clicks based on stats.battlesWon.
        // We no longer forcefully move the player to the next route here.
        // The user must open the map to travel to newly unlocked routes manually.
    }`;
const checkUnlocksNew = `    checkRouteUnlocks() {
        // Evaluate active challenge defeat trackers
        if (!this.state.config || !this.state.config.unlocks) return;
        let currentIndex = this.state.stats.completedChallenges || 0;
        if (currentIndex >= this.state.config.unlocks.length) return;

        let unlock = this.state.config.unlocks[currentIndex];
        let req = unlock.requirements;

        if (req.defeatCountRoute && req.defeatCountRoute.route === this.state.currentRoute) {
            this.state.stats.challengeRouteDefeats = (this.state.stats.challengeRouteDefeats || 0) + 1;
        }

        if (req.defeatSpecific && this.activeEncounter.name === req.defeatSpecific.name) {
             if (!this.state.stats.challengeSpecificDefeats) this.state.stats.challengeSpecificDefeats = {};
             this.state.stats.challengeSpecificDefeats[this.activeEncounter.name] = (this.state.stats.challengeSpecificDefeats[this.activeEncounter.name] || 0) + 1;
        }
    }`;

content = content.replace(checkUnlocksOld, checkUnlocksNew);

// We need to also hook captures.
const catchBlockOld = `                if (!this.state.stats.caughtSpecific) this.state.stats.caughtSpecific = {};
                if (this.activeEncounter.types) {
                      this.activeEncounter.types.forEach(t => {
                          this.state.stats.caughtSpecific[t] = (this.state.stats.caughtSpecific[t] || 0) + 1;
                      });
                }`;

const catchBlockNew = `                if (!this.state.stats.caughtSpecific) this.state.stats.caughtSpecific = {};
                if (!this.state.stats.challengeCaughtSpecific) this.state.stats.challengeCaughtSpecific = {};

                let qName = this.activeEncounter.qualityName || "Regular";

                if (this.activeEncounter.types) {
                      this.activeEncounter.types.forEach(t => {
                          this.state.stats.caughtSpecific[t] = (this.state.stats.caughtSpecific[t] || 0) + 1;
                          let typeRarityKey = t + "_" + qName;
                          let typeAnyKey = t + "_Any";
                          this.state.stats.challengeCaughtSpecific[typeRarityKey] = (this.state.stats.challengeCaughtSpecific[typeRarityKey] || 0) + 1;
                          this.state.stats.challengeCaughtSpecific[typeAnyKey] = (this.state.stats.challengeCaughtSpecific[typeAnyKey] || 0) + 1;
                      });
                }

                let speciesRarityKey = this.activeEncounter.name + "_" + qName;
                this.state.stats.challengeCaughtSpecific[speciesRarityKey] = (this.state.stats.challengeCaughtSpecific[speciesRarityKey] || 0) + 1;
`;

content = content.replace(catchBlockOld, catchBlockNew);

fs.writeFileSync('src/battleSystem.js', content);

let uiContent = fs.readFileSync('src/ui.js', 'utf8');

const completeOld = `window.completeChallenge = function() {
    state.stats.completedChallenges = (state.stats.completedChallenges || 0) + 1;
    updateUI();
    if (document.getElementById('modal-overlay').style.display !== 'none') {
        window.showChallengesModal(); // refresh modal
    }
};`;

const completeNew = `window.completeChallenge = function() {
    state.stats.completedChallenges = (state.stats.completedChallenges || 0) + 1;

    // Clear challenge specific tracking state
    state.stats.challengeRouteDefeats = 0;
    state.stats.challengeSpecificDefeats = {};
    state.stats.challengeCaughtSpecific = {};

    updateUI();
    if (document.getElementById('modal-overlay').style.display !== 'none') {
        window.showChallengesModal(); // refresh modal
    }
};`;

uiContent = uiContent.replace(completeOld, completeNew);

fs.writeFileSync('src/ui.js', uiContent);
