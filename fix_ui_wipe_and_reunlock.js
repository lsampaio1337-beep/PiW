const fs = require('fs');

let content = fs.readFileSync('src/ui.js', 'utf8');

// 1. Fix the reunlock issue
const searchStr1 = `                // Add the newly unlocked area to active challenges
                if (!state.stats.activeChallenges.includes(newRoute)) {
                    state.stats.activeChallenges.push(newRoute);
                }`;
const replaceStr1 = `                // Add the newly unlocked area to active challenges, but check if already completed
                if (!state.stats.activeChallenges.includes(newRoute) && !state.stats.completedChallengeIds.includes(newRoute)) {
                    state.stats.activeChallenges.push(newRoute);
                }`;

content = content.replace(searchStr1, replaceStr1);

// 2. Fix the progress wipe issue
// Wait, the progress wipe happens here:
const searchStr2 = `    // Clear challenge specific tracking state (WARNING: this clears for all active challenges if multiple are tracking specific defeats... but since challenges are parallel now, they might conflict. However, they usually don't track the exact same things, except maybe "defeat 150 pokemon" which would reset. We will clear it for now to preserve standard behavior)
    state.stats.challengeRouteDefeats = 0;
    state.stats.challengeSpecificDefeats = {};
    state.stats.challengeCaughtSpecific = {};`;

const replaceStr2 = `    // Clear challenge specific tracking state
    // We only want to clear progress if no OTHER active challenge needs it.
    // However, to be perfectly safe, since the requirements are distinct, we can leave the tracked progress.
    // Wait, if we never clear it, a future challenge that asks for "Catch 2 Mankey" might auto-complete.
    // Let's clear ONLY the specific progress tied to the completed challenge.
    if (unlock.requirements) {
        if (unlock.requirements.defeatCountRoute) {
            state.stats.challengeRouteDefeats = 0;
        }
        if (unlock.requirements.defeatSpecific) {
             delete state.stats.challengeSpecificDefeats[unlock.requirements.defeatSpecific.name];
        }
        if (unlock.requirements.catchSpecies) {
             for (let s of unlock.requirements.catchSpecies) {
                 delete state.stats.caughtSpecies[s.species];
             }
        }
        if (unlock.requirements.catchSpeciesByRarity) {
             for (let s of unlock.requirements.catchSpeciesByRarity) {
                 delete state.stats.challengeCaughtSpecific[s.species + "_" + s.rarity];
             }
        }
        if (unlock.requirements.catchByRarityAndType) {
             delete state.stats.challengeCaughtSpecific[unlock.requirements.catchByRarityAndType.type + "_" + unlock.requirements.catchByRarityAndType.rarity];
        }
        if (unlock.requirements.catchByType) {
             delete state.stats.challengeCaughtSpecific[unlock.requirements.catchByType.type + "_Any"];
        }
        if (unlock.requirements.catchEachFromSlotMachine) {
             if (unlock.requirements.catchEachFromSlotMachine.machines) {
                 for (let m of unlock.requirements.catchEachFromSlotMachine.machines) {
                     for (let s of m) delete state.stats.caughtSpecies[s];
                 }
             }
        }
    }`;

content = content.replace(searchStr2, replaceStr2);

fs.writeFileSync('src/ui.js', content, 'utf8');
console.log("Fixed ui.js completeChallenge issues.");
