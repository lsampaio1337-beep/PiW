const fs = require('fs');
let battleJs = fs.readFileSync('src/battleSystem.js', 'utf8');

// Replace the handleEnemyDefeat flow to create the corpse and immediately trigger the new search

const oldHandleDefeat = `    handleEnemyDefeat() {
        if (this.combatLoop) clearTimeout(this.combatLoop);

        // Trigger fade out
        if (typeof window.playEnemyDefeatAnimation === 'function') {
            window.playEnemyDefeatAnimation();
        }
        if (window.pauseIdleAnimation) window.pauseIdleAnimation(); // ensure paused during fade/capture sequence

        // Post battle sequence (wait 2s for fade out)
        this.combatLoop = setTimeout(() => {
            this.processPostBattle();
        }, 2000);
    }

    processPostBattle() {
        const leader = this.state.party[0];
        const ev = this.activeEncounter.ev;

        // Determine if we are catching
        let thrownBallName = null;
        let caught = false;

        if (this.state.settings.autoCatch && (!this.gymState || !this.gymState.isActive)) {
            let tier = this.state.settings.activeBallTier;
            if (tier >= 0) {
                let ballName = this.state.config.balance.items.pokeballs[tier].name;
                while(tier >= 0) {
                    if (this.state.backpack.pokeballs[ballName] > 0) {
                        this.state.backpack.pokeballs[ballName]--;
                        thrownBallName = ballName;
                        break;
                    }
                    tier--;
                    if (tier >= 0) ballName = this.state.config.balance.items.pokeballs[tier].name;
                }

                if (thrownBallName) {
                    let multiplier = this.state.config.balance.items.pokeballs[tier].multiplier;
                    const chance = mathEngine.calculateCatchChance(this.activeEncounter.bst, this.activeEncounter.level, multiplier, this.state.stats, this.activeEncounter.qualityName === "Shiny");
                    caught = (Math.random() * 100) <= chance;
                }
            }
        }`;

const newHandleDefeat = `    handleEnemyDefeat() {
        if (this.combatLoop) clearTimeout(this.combatLoop);

        const leader = this.state.party[0];
        const ev = this.activeEncounter.ev;

        // Determine if we are catching
        let thrownBallName = null;
        let caught = false;

        if (this.state.settings.autoCatch && (!this.gymState || !this.gymState.isActive)) {
            let tier = this.state.settings.activeBallTier;
            if (tier >= 0) {
                let ballName = this.state.config.balance.items.pokeballs[tier].name;
                while(tier >= 0) {
                    if (this.state.backpack.pokeballs[ballName] > 0) {
                        this.state.backpack.pokeballs[ballName]--;
                        thrownBallName = ballName;
                        break;
                    }
                    tier--;
                    if (tier >= 0) ballName = this.state.config.balance.items.pokeballs[tier].name;
                }

                if (thrownBallName) {
                    let multiplier = this.state.config.balance.items.pokeballs[tier].multiplier;
                    const chance = mathEngine.calculateCatchChance(this.activeEncounter.bst, this.activeEncounter.level, multiplier, this.state.stats, this.activeEncounter.qualityName === "Shiny");
                    caught = (Math.random() * 100) <= chance;
                }
            }
        }

        // Trigger fade out / corpse creation
        if (typeof window.playEnemyDefeatAnimation === 'function') {
            window.playEnemyDefeatAnimation(thrownBallName, caught);
        }

        // Immediately process stats and start next search (no more 2s wait)
        this.processPostBattleStats(thrownBallName, caught, leader, ev);
    }

    processPostBattleStats(thrownBallName, caught, leader, ev) {`;

battleJs = battleJs.replace(oldHandleDefeat, newHandleDefeat);

// We need to modify the end of processPostBattleStats (old processPostBattle) so it doesn't wait for pokeball animation

const oldFinishBattle = `        const finishBattle = () => {
            if (caught) {
                let caughtPokemon = JSON.parse(JSON.stringify(this.activeEncounter));
                // Fix the level 100 jump bug by setting xp explicitly to the exact minimum needed for their captured level
                caughtPokemon.xp = mathEngine.calculateTotalXP(caughtPokemon.level);
                this.state.storage.unshift(caughtPokemon);
                this.state.stats.caught++;
                if (this.activeEncounter.qualityName === "Shiny") this.state.stats.shiniesCaught = (this.state.stats.shiniesCaught || 0) + 1;
                if (this.activeEncounter.qualityName === "Epic") this.state.stats.epicCaptures = (this.state.stats.epicCaptures || 0) + 1;

                let sumIV = caughtPokemon.ivs.hp + caughtPokemon.ivs.atk + caughtPokemon.ivs.def + caughtPokemon.ivs.spa + caughtPokemon.ivs.spd + caughtPokemon.ivs.spe;
                if (sumIV < 300) this.state.stats.caughtIVUnder300 = (this.state.stats.caughtIVUnder300 || 0) + 1;
                if (sumIV < 350) this.state.stats.caughtIVUnder350 = (this.state.stats.caughtIVUnder350 || 0) + 1;
                if (sumIV < 400) this.state.stats.caughtIVUnder400 = (this.state.stats.caughtIVUnder400 || 0) + 1;
                if (sumIV < 450) this.state.stats.caughtIVUnder450 = (this.state.stats.caughtIVUnder450 || 0) + 1;
                if (sumIV < 500) this.state.stats.caughtIVUnder500 = (this.state.stats.caughtIVUnder500 || 0) + 1;

                // Track species catches for unlocks
                if (!this.state.stats.caughtSpecies) this.state.stats.caughtSpecies = {};
                this.state.stats.caughtSpecies[this.activeEncounter.name] = (this.state.stats.caughtSpecies[this.activeEncounter.name] || 0) + 1;
            }

            // Re-apply remaining handleEnemyDefeat logic for EXP and searching...
            this.state.trainer.xp += ev;
            this.state.stats.defeated++;
            if (this.activeEncounter.qualityName === "Shiny") this.state.stats.shiniesDefeated = (this.state.stats.shiniesDefeated || 0) + 1;
            if (!this.state.stats.defeatedSpecies) this.state.stats.defeatedSpecies = {};
            this.state.stats.defeatedSpecies[this.activeEncounter.name] = (this.state.stats.defeatedSpecies[this.activeEncounter.name] || 0) + 1;

            if (this.state.dayCareRef) {
                this.state.dayCareRef.incrementTrainEncounters();
            }

            // Drop money
            let moneyDrop = Math.floor(Math.random() * this.activeEncounter.level * 2) + 1;
            moneyDrop = Math.floor(moneyDrop * this.state.settings.gameSpeed);
            if (this.activeEncounter.qualityName === "Shiny") moneyDrop *= 5;
            this.state.trainer.money += moneyDrop;

            // Share EXP
            const xpDrop = ev * this.state.settings.gameSpeed;
            leader.xp += xpDrop;

            this.state.party.forEach((p, idx) => {
                if (idx > 0 && p.currentHp > 0) {
                    p.xp += Math.floor(xpDrop * 0.5); // 50% share
                }
            });

            this.checkLevelUps();

            this.stop();
            this.activeEncounter = null;

            if (this.gymState && this.gymState.isActive) {
                this.handleGymVictory();
            } else {
                // Resume search with new timer logic
                if (window.resumeIdleAnimation) window.resumeIdleAnimation();

                const leaderSpeed = leader.currentStats.spe;
                let searchDelay = 5.0 - ((leaderSpeed - 15) / 150) * 4.5;
                searchDelay = Math.max(0.5, Math.min(5.0, searchDelay)); // clamp 0.5 to 5.0
                searchDelay = searchDelay * 1000;

                this.searchNext(searchDelay);
            }
        };

        if (thrownBallName && typeof window.playPokeballAnimation === 'function') {
            window.playPokeballAnimation(thrownBallName, caught, finishBattle);
        } else {
            finishBattle();
        }`;

const newFinishBattle = `        if (caught) {
            let caughtPokemon = JSON.parse(JSON.stringify(this.activeEncounter));
            // Fix the level 100 jump bug by setting xp explicitly to the exact minimum needed for their captured level
            caughtPokemon.xp = mathEngine.calculateTotalXP(caughtPokemon.level);
            this.state.storage.unshift(caughtPokemon);
            this.state.stats.caught++;
            if (this.activeEncounter.qualityName === "Shiny") this.state.stats.shiniesCaught = (this.state.stats.shiniesCaught || 0) + 1;
            if (this.activeEncounter.qualityName === "Epic") this.state.stats.epicCaptures = (this.state.stats.epicCaptures || 0) + 1;

            let sumIV = caughtPokemon.ivs.hp + caughtPokemon.ivs.atk + caughtPokemon.ivs.def + caughtPokemon.ivs.spa + caughtPokemon.ivs.spd + caughtPokemon.ivs.spe;
            if (sumIV < 300) this.state.stats.caughtIVUnder300 = (this.state.stats.caughtIVUnder300 || 0) + 1;
            if (sumIV < 350) this.state.stats.caughtIVUnder350 = (this.state.stats.caughtIVUnder350 || 0) + 1;
            if (sumIV < 400) this.state.stats.caughtIVUnder400 = (this.state.stats.caughtIVUnder400 || 0) + 1;
            if (sumIV < 450) this.state.stats.caughtIVUnder450 = (this.state.stats.caughtIVUnder450 || 0) + 1;
            if (sumIV < 500) this.state.stats.caughtIVUnder500 = (this.state.stats.caughtIVUnder500 || 0) + 1;

            // Track species catches for unlocks
            if (!this.state.stats.caughtSpecies) this.state.stats.caughtSpecies = {};
            this.state.stats.caughtSpecies[this.activeEncounter.name] = (this.state.stats.caughtSpecies[this.activeEncounter.name] || 0) + 1;
        }

        this.state.trainer.xp += ev;
        this.state.stats.defeated++;
        if (this.activeEncounter.qualityName === "Shiny") this.state.stats.shiniesDefeated = (this.state.stats.shiniesDefeated || 0) + 1;
        if (!this.state.stats.defeatedSpecies) this.state.stats.defeatedSpecies = {};
        this.state.stats.defeatedSpecies[this.activeEncounter.name] = (this.state.stats.defeatedSpecies[this.activeEncounter.name] || 0) + 1;

        if (this.state.dayCareRef) {
            this.state.dayCareRef.incrementTrainEncounters();
        }

        let moneyDrop = Math.floor(Math.random() * this.activeEncounter.level * 2) + 1;
        moneyDrop = Math.floor(moneyDrop * this.state.settings.gameSpeed);
        if (this.activeEncounter.qualityName === "Shiny") moneyDrop *= 5;
        this.state.trainer.money += moneyDrop;

        const xpDrop = ev * this.state.settings.gameSpeed;
        leader.xp += xpDrop;

        this.state.party.forEach((p, idx) => {
            if (idx > 0 && p.currentHp > 0) {
                p.xp += Math.floor(xpDrop * 0.5); // 50% share
            }
        });

        this.checkLevelUps();

        this.stop();
        this.activeEncounter = null;

        if (this.gymState && this.gymState.isActive) {
            this.handleGymVictory();
        } else {
            // Resume search with new timer logic
            if (window.resumeIdleAnimation) window.resumeIdleAnimation();

            const leaderSpeed = leader.currentStats.spe;
            let searchDelay = 5.0 - ((leaderSpeed - 15) / 150) * 4.5;
            searchDelay = Math.max(0.5, Math.min(5.0, searchDelay)); // clamp 0.5 to 5.0
            searchDelay = searchDelay * 1000;

            this.searchNext(searchDelay);
        }`;

battleJs = battleJs.replace(oldFinishBattle, newFinishBattle);

fs.writeFileSync('src/battleSystem.js', battleJs);
console.log('Battle system modified for corpse logic');
