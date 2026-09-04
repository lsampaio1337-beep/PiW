const fs = require('fs');
let code = fs.readFileSync('src/battleSystem.js', 'utf8');

// Replace the end of handleEnemyDefeat
const toReplace = `
        // Daycare logic
        if (this.state.dayCareRef) {
            this.state.dayCareRef.tickBattle();
            this.state.dayCareRef.grantPassiveXP(ev, (pkmn, amt) => this.grantXP(pkmn, amt));
        }

        // Loot Bonus Calculation
        const lootMultiplier = 1 + (0.01 * (this.state.stats.greenCandies || 0));

        // Award XP and Money (EV)
        this.grantXP(leader, ev);
        this.state.trainer.money += Math.floor(ev * lootMultiplier);
`;

const replaceWith = `
        const lootMultiplier = 1 + (0.01 * (this.state.stats.greenCandies || 0));

        if (this.state.settings.autoCatch && (!this.gymState || !this.gymState.isActive)) {
            const { caught, ballName } = this.throwPokeball();
            if (ballName && typeof window.playCaptureAnimation === 'function') {
                window.playCaptureAnimation(ballName, caught, () => {
                    finalizeDefeatLogic(caught);
                    this.proceedAfterDefeat(leader, ev, lootMultiplier);
                });
                return;
            } else {
                finalizeDefeatLogic(caught);
            }
        } else {
            finalizeDefeatLogic(false);
        }

        this.proceedAfterDefeat(leader, ev, lootMultiplier);
    }

    proceedAfterDefeat(leader, ev, lootMultiplier) {
        // Daycare logic
        if (this.state.dayCareRef) {
            this.state.dayCareRef.tickBattle();
            this.state.dayCareRef.grantPassiveXP(ev, (pkmn, amt) => this.grantXP(pkmn, amt));
        }

        // Award XP and Money (EV)
        this.grantXP(leader, ev);
        this.state.trainer.money += Math.floor(ev * lootMultiplier);
`;

code = code.replace(toReplace, replaceWith);
fs.writeFileSync('src/battleSystem.js', code);
