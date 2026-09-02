// src/battleSystem.js
import * as mathEngine from './mathEngine.js';

class BattleSystem {
    constructor(gameState, updateUI) {
        this.state = gameState; // reference to global game state
        this.updateUI = updateUI; // callback to update UI

        this.activeEncounter = null;
        this.combatLoop = null;
        this.isSearching = false;

        this.gymState = {
            isActive: false,
            gym: null,
            currentTrainerIndex: 0
        };
    }

    start() {
        if (!this.combatLoop) {
            this.searchNext();
        }
    }

    stop() {
        if (this.combatLoop) {
            clearTimeout(this.combatLoop);
            this.combatLoop = null;
        }
    }

    getTypeEffectiveness(moveType, defenderTypes) {
        let effectiveness = 1.0;
        if (!this.state.config.types[moveType]) return effectiveness;

        for (const defType of defenderTypes) {
            if (this.state.config.types[moveType][defType] !== undefined) {
                effectiveness *= this.state.config.types[moveType][defType];
            }
        }
        return effectiveness;
    }

    getBestMove(attacker, defender) {
        let bestMove = null;
        let maxExpectedDamage = -1;

        // In a full implementation, attacker.moves would have populated Move objects
        for (const move of attacker.moves) {
            // Very simplified: skip if missing data
            if (!move || move.power === 0) continue;

            const isPhysical = move.category === 'Physical';
            const atkStat = isPhysical ? attacker.currentStats.atk : attacker.currentStats.spa;
            const defStat = isPhysical ? defender.currentStats.def : defender.currentStats.spd;
            const eff = this.getTypeEffectiveness(move.type, defender.types);

            // Expected damage ignores crit/random modifier for selection
            const expDamage = Math.floor((((attacker.level + 5) / 125) * (move.power * atkStat / defStat)) + 2) * eff * attacker.quality;

            if (expDamage > maxExpectedDamage) {
                maxExpectedDamage = expDamage;
                bestMove = move;
            }
        }

        // Fallback to struggle if no moves
        if (!bestMove) {
            bestMove = { name: "Struggle", power: 50, type: "Normal", category: "Physical" };
        }

        return bestMove;
    }

    startGymBattle(gymName) {
        const gym = this.state.config.gyms.find(g => g.name === gymName);
        if (!gym) return;

        this.stop();
        this.gymState = {
            isActive: true,
            gym: gym,
            currentTrainerIndex: 0
        };

        // Update gym UI specifically to show current trainer
        this.updateGymUI();
    }

    updateGymUI() {
        const vGym = document.getElementById("view-gym");
        const contentArea = document.getElementById("gym-content-area");
        if (!vGym || !contentArea) return;

        const gym = this.gymState.gym;
        if (!gym) return;

        const trainer = gym.trainers[this.gymState.currentTrainerIndex];

        if (trainer) {
            // Let's add sprites and damage numbers to gym battles!
            contentArea.innerHTML = `
                <p>Next Opponent: ${trainer.name}</p>

                <div id="gym-battle-area" style="display: none; margin-top: 20px; margin-bottom: 20px; position: relative;">
                    <div style="display: flex; justify-content: space-between; align-items: flex-end; height: 150px; background: rgba(0,0,0,0.3); border: 2px solid #555; border-radius: 10px; padding: 20px;">

                        <div style="text-align: left; width: 40%;">
                            <h4 id="gym-player-name">Player</h4>
                            <div style="width: 100%; height: 10px; background: #333; border: 1px solid #777;">
                                <div id="gym-player-hp-bar" style="width: 100%; height: 100%; background: #2ecc71;"></div>
                            </div>
                            <span id="gym-player-hp-text"></span>
                            <div style="position: relative; height: 80px; margin-top: 10px;">
                                <img id="gym-player-sprite" src="" style="position: absolute; bottom: 0; left: 0; max-height: 80px; transform: scaleX(-1);">
                            </div>
                        </div>

                        <div id="gym-combat-log" style="width: 20%; font-size: 12px; color: #ccc; text-align: center; overflow: hidden; height: 100px;"></div>

                        <div style="text-align: right; width: 40%;">
                            <h4 id="gym-enemy-name">Enemy</h4>
                            <div style="width: 100%; height: 10px; background: #333; border: 1px solid #777;">
                                <div id="gym-enemy-hp-bar" style="width: 100%; height: 100%; background: #e74c3c; float: right;"></div>
                            </div>
                            <span id="gym-enemy-hp-text"></span>
                            <div style="position: relative; height: 80px; margin-top: 10px;">
                                <img id="gym-enemy-sprite" src="" style="position: absolute; bottom: 0; right: 0; max-height: 80px;">
                            </div>
                        </div>
                    </div>
                </div>

                <button id="btn-start-gym-battle" onclick="window.battleEngine.startNextGymBattle()" style="padding: 10px 20px; font-size: 16px; cursor: pointer;">Battle ${trainer.name}</button>
                <br><br>
                <button onclick="window.battleEngine.stopGymBattle()" style="padding: 5px 10px; background: #e74c3c; border: none; color: white; border-radius: 3px; cursor: pointer;">Flee Gym</button>
            `;
            // Temporary expose for the button
            window.battleEngine = this;

            // Re-bind to use our special gym start func that toggles visibility
            window.battleEngine.startNextGymBattle = () => {
                document.getElementById('btn-start-gym-battle').style.display = 'none';
                document.getElementById('gym-battle-area').style.display = 'block';
                this.searchNext();
            };
        } else {
            // Gym completed
            contentArea.innerHTML = `
                <h3>You defeated ${gym.leader}!</h3>
                <p>You earned the ${gym.name} badge.</p>
                <button onclick="window.battleEngine.stopGymBattle()" style="padding: 10px 20px; cursor: pointer;">Leave</button>
            `;
            window.battleEngine = this;
        }
    }

    stopGymBattle() {
        this.gymState.isActive = false;
        this.gymState.gym = null;
        this.stop();

        // Return to normal map or idle
        if (typeof window.navigateToLocation === 'function') {
             // Reset UI back to just the gym entry
             window.navigateToLocation(this.state.currentRoute);
        }
    }

    async searchNext(delayOverride) {
        if (this.state.party.every(p => p.currentHp <= 0)) {
            this.handleWipeout();
            return;
        }

        if (this.state.currentRoute && this.state.currentRoute.startsWith("Casino - ")) {
            const cost = 10;
            if (this.state.trainer.money < cost) {
                alert("Not enough money! You need $" + cost + " to continue hunting here.");
                this.stop();
                if (typeof window.navigateToLocation === 'function') {
                    window.navigateToLocation("Casino");
                }
                return;
            }
            this.state.trainer.money -= cost;
        }

        this.isSearching = true;
        this.activeEncounter = null;
        this.updateUI();

        let delay = delayOverride;
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
        }, delay);
    }

    generateGymEncounter() {
        const gym = this.gymState.gym;
        if (!gym) return;

        const trainer = gym.trainers[this.gymState.currentTrainerIndex];
        if (!trainer) {
            // Should not happen, but safe fallback
            this.stopGymBattle();
            return;
        }

        // We'll simulate fighting the entire team as sequential encounters for now
        // A full implementation might handle the team differently, but this fits the idle structure easiest
        // For this task, we will just pick a random pokemon from the trainer's team or the first one
        // Better: We should track which pokemon of the trainer we are on.
        // Let's add a `currentPokemonIndex` to `gymState`.
        if (this.gymState.currentPokemonIndex === undefined) {
            this.gymState.currentPokemonIndex = 0;
        }

        const pokemonDef = trainer.team[this.gymState.currentPokemonIndex];
        if (!pokemonDef) return; // Should have been handled in defeat

        const pokemonBase = this.state.config.pokemonData.find(p => p.id === pokemonDef.id);
        const level = pokemonDef.level;

        // Gym leaders and trainers have fixed quality (e.g. Regular or Uncommon)
        const isLeader = this.gymState.currentTrainerIndex === gym.trainers.length - 1;
        const q = isLeader ? { name: "Rare", q: 1.40 } : { name: "Uncommon", q: 1.20 };

        // Track seen for pokedex
        if (!this.state.stats.seenSpecies) this.state.stats.seenSpecies = {};
        this.state.stats.seenSpecies[pokemonBase.name] = true;

        // Give them good IVs
        const ivs = { hp: 50, atk: 50, def: 50, spa: 50, spd: 50, spe: 50 };
        if (isLeader) {
            ivs.hp = 80; ivs.atk = 80; ivs.def = 80; ivs.spa = 80; ivs.spd = 80; ivs.spe = 80;
        }

        const stats = {
            hp: mathEngine.calculateHP(pokemonBase.hp, ivs.hp, level, q.q),
            atk: mathEngine.calculateStat(pokemonBase.atk, ivs.atk, level, q.q),
            def: mathEngine.calculateStat(pokemonBase.def, ivs.def, level, q.q),
            spa: mathEngine.calculateStat(pokemonBase.spa, ivs.spa, level, q.q),
            spd: mathEngine.calculateStat(pokemonBase.spd, ivs.spd, level, q.q),
            spe: mathEngine.calculateStat(pokemonBase.spe, ivs.spe, level, q.q)
        };

        const bst = pokemonBase.hp + pokemonBase.atk + pokemonBase.def + pokemonBase.spa + pokemonBase.spd + pokemonBase.spe;
        const totalIV = ivs.hp + ivs.atk + ivs.def + ivs.spa + ivs.spd + ivs.spe;

        this.activeEncounter = {
            id: pokemonBase.id,
            name: pokemonBase.name,
            level: level,
            types: pokemonBase.types,
            qualityName: q.name,
            quality: q.q,
            ivs: ivs,
            currentStats: stats,
            maxHp: stats.hp,
            currentHp: stats.hp,
            ev: mathEngine.calculateEV(bst, level, q.q, totalIV),
            bst: bst,
            moves: this.getLearnsetMoves(pokemonBase, level)
        };

        this.isSearching = false;
        this.updateUI();

        // Wait 2s for slide in animation before starting combat turns
        if (window.resumeIdleAnimation) window.resumeIdleAnimation();
        this.combatLoop = setTimeout(() => {
            if (window.pauseIdleAnimation) window.pauseIdleAnimation();
            this.scheduleTurn();
        }, 2000);
    }

    generateEncounter() {
        let pokemonBase;
        let level;
        let q;
        let ivs;

        if (this.state.nextForcedEncounter) {
            const forced = this.state.nextForcedEncounter;
            pokemonBase = this.state.config.pokemonData.find(p => p.id === forced.id) || this.state.config.pokemonData[0];
            level = forced.level;

            const qName = forced.qValue >= 2.0 ? "Shiny" : "Custom";
            q = { name: qName, q: forced.qValue };

            // Distribute SumIV randomly
            let remainingIV = forced.sumIV;
            ivs = { hp: 0, atk: 0, def: 0, spa: 0, spd: 0, spe: 0 };
            const stats = ['hp', 'atk', 'def', 'spa', 'spd', 'spe'];

            while (remainingIV > 0) {
                // Filter out stats that are already maxed at 100
                const availableStats = stats.filter(s => ivs[s] < 100);
                if (availableStats.length === 0) break; // All maxed out

                const randomStat = availableStats[Math.floor(Math.random() * availableStats.length)];
                ivs[randomStat]++;
                remainingIV--;
            }

            if (qName === "Shiny") this.state.stats.shiniesSeen++;



            this.state.nextForcedEncounter = null;
        } else {
            // Find route spawns based on state.currentRoute
            const route = this.state.config.routes.find(r => r.name === this.state.currentRoute);
            if (!route) return;

            const rand = Math.random();
            let cumulative = 0;
            let selectedSpawn = route.spawns[0];
            for (const spawn of route.spawns) {
                cumulative += spawn.chance;
                if (rand <= cumulative) {
                    selectedSpawn = spawn;
                    break;
                }
            }

            pokemonBase = this.state.config.pokemonData.find(p => p.id === selectedSpawn.pokemonId);
            level = Math.floor(Math.random() * (selectedSpawn.maxLevel - selectedSpawn.minLevel + 1)) + selectedSpawn.minLevel;

            q = mathEngine.generateQuality(this.state.stats);
            if (q.name === "Shiny") {
                this.state.stats.shiniesSeen = (this.state.stats.shiniesSeen || 0) + 1;
                if (!this.state.stats.seenShiniesSpecies) this.state.stats.seenShiniesSpecies = {};
                this.state.stats.seenShiniesSpecies[pokemonBase.name] = true;
            }

            ivs = mathEngine.generateIVs(this.state.stats, q.name === "Shiny");

            // Route 1 Level Cap
            if (this.state.currentRoute === "Route 1") {
                const playerLevel = this.state.party[0] ? this.state.party[0].level : 1;
                if (playerLevel === 1) {
                    level = 1;
                } else {
                    level = Math.random() < 0.5 ? 1 : 2;
                }
            }
        }

        // Track seen for pokedex
        if (!this.state.stats.seenSpecies) this.state.stats.seenSpecies = {};
        this.state.stats.seenSpecies[pokemonBase.name] = true;

        const stats = {
            hp: mathEngine.calculateHP(pokemonBase.hp, ivs.hp, level, q.q),
            atk: mathEngine.calculateStat(pokemonBase.atk, ivs.atk, level, q.q),
            def: mathEngine.calculateStat(pokemonBase.def, ivs.def, level, q.q),
            spa: mathEngine.calculateStat(pokemonBase.spa, ivs.spa, level, q.q),
            spd: mathEngine.calculateStat(pokemonBase.spd, ivs.spd, level, q.q),
            spe: mathEngine.calculateStat(pokemonBase.spe, ivs.spe, level, q.q),
        };

        const totalIV = ivs.hp + ivs.atk + ivs.def + ivs.spa + ivs.spd + ivs.spe;
        const bst = pokemonBase.hp + pokemonBase.atk + pokemonBase.def + pokemonBase.spa + pokemonBase.spd + pokemonBase.spe;

        this.activeEncounter = {
            id: pokemonBase.id,
            name: pokemonBase.name,
            types: pokemonBase.types,
            level: level,
            qualityName: q.name,
            quality: q.q,
            ivs: ivs,
            currentStats: stats,
            maxHp: stats.hp,
            currentHp: stats.hp,
            ev: mathEngine.calculateEV(bst, level, q.q, totalIV),
            bst: bst,
            moves: this.getLearnsetMoves(pokemonBase, level)
        };

        this.isSearching = false;
        this.updateUI();

        // Wait 2s for slide in animation before starting combat turns
        if (window.resumeIdleAnimation) window.resumeIdleAnimation();
        this.combatLoop = setTimeout(() => {
            if (window.pauseIdleAnimation) window.pauseIdleAnimation();
            this.scheduleTurn();
        }, 2000);
    }

    getLearnsetMoves(pokemonBase, level) {
        if (!pokemonBase.learnset) return [];
        let learned = [];
        for (const ls of pokemonBase.learnset) {
            if (level >= ls.level) {
                if (this.state.config.moves[ls.move]) {
                    const moveData = JSON.parse(JSON.stringify(this.state.config.moves[ls.move]));
                    moveData.name = ls.move;
                    learned.push(moveData);
                }
            }
        }
        // Keep up to 4 most recent moves
        return learned.slice(-4);
    }

    scheduleTurn() {
        if (!this.activeEncounter || this.activeEncounter.currentHp <= 0) return;
        const leader = this.state.party[0];
        if (leader.currentHp <= 0) {
            this.handleFaint();
            return;
        }

        // Leader attack delay
        let leaderDelay = this.state.config.balance.baseAttackDelay * 1000 * (100 / (100 + leader.currentStats.spe));
        leaderDelay = Math.max(250, leaderDelay) / this.state.settings.gameSpeed;

        // Enemy attack delay
        let enemyDelay = this.state.config.balance.baseAttackDelay * 1000 * (100 / (100 + this.activeEncounter.currentStats.spe));
        enemyDelay = Math.max(250, enemyDelay) / this.state.settings.gameSpeed;

        // Which goes first
        const isLeaderFaster = leaderDelay <= enemyDelay;
        const firstActor = isLeaderFaster ? leader : this.activeEncounter;
        const secondActor = isLeaderFaster ? this.activeEncounter : leader;
        const firstDelay = Math.min(leaderDelay, enemyDelay);

        this.combatLoop = setTimeout(() => {
            this.executeTurn(firstActor, secondActor);
        }, firstDelay);
    }

    executeTurn(attacker, defender) {
        if (!this.activeEncounter) return;

        const leader = this.state.party[0];

        // Check if player uses potion
        if (attacker === leader && this.state.settings.autoPotion) {
            if (this.tryUsePotion(attacker)) {
                this.updateUI();
                this.scheduleNextStrike(attacker, defender);
                return;
            }
        }

        // Attack
        const move = this.getBestMove(attacker, defender);
        const isPhysical = move.category === 'Physical';
        const atkStat = isPhysical ? attacker.currentStats.atk : attacker.currentStats.spa;
        const defStat = isPhysical ? defender.currentStats.def : defender.currentStats.spd;
        const eff = this.getTypeEffectiveness(move.type, defender.types);

        const hit = mathEngine.calculateDamage(attacker.level, move.power, atkStat, defStat, eff, attacker.quality);

        const targetSide = attacker === leader ? 'enemy' : 'player';
        const attackerSide = attacker === leader ? 'player' : 'enemy';

        if (window.playAttackAnimation) window.playAttackAnimation(attackerSide);

        if (this.combatLoop) clearTimeout(this.combatLoop);

        const applyDamage = () => {
            if (window.playAttackedAnimation) window.playAttackedAnimation(targetSide);

            defender.currentHp -= hit.damage;
            if (typeof window.showDamage === 'function') {
                window.showDamage(targetSide, hit.damage, hit.isCritical, move.name, move.type, eff);
            }

            this.updateUI();

            if (defender.currentHp <= 0) {
                if (defender === this.activeEncounter) {
                    this.handleEnemyDefeat();
                } else {
                    this.handleFaint();
                }
            } else {
                this.scheduleNextStrike(attacker, defender);
            }
        };

        if (window.shootProjectile) {
            window.shootProjectile(attackerSide, move.type, applyDamage);
        } else {
            setTimeout(applyDamage, 400); // Fallback delay if no projectile fn
        }
    }

    scheduleNextStrike(attacker, defender) {
        if (!this.activeEncounter) return;

        const leader = this.state.party[0];
        let delay;
        if (attacker === leader) {
            // Next is enemy
            delay = this.state.config.balance.baseAttackDelay * 1000 * (100 / (100 + this.activeEncounter.currentStats.spe));
        } else {
            delay = this.state.config.balance.baseAttackDelay * 1000 * (100 / (100 + leader.currentStats.spe));
        }

        delay = Math.max(250, delay) / this.state.settings.gameSpeed;

        this.combatLoop = setTimeout(() => {
            this.executeTurn(defender, attacker); // Swap roles
        }, delay);
    }

    tryUsePotion(pokemon) {
        if (pokemon.currentHp >= pokemon.maxHp) return false; // don't heal if full
        if (pokemon.currentHp > pokemon.maxHp * 0.5) return false; // simple logic: heal if <50%

        let tier = this.state.settings.activePotionTier;
        // downgraded logic
        while(tier >= 0) {
            const potName = this.state.config.balance.items.potions[tier].name;
            if (this.state.backpack.potions[potName] > 0) {
                this.state.backpack.potions[potName]--;
                pokemon.currentHp = Math.min(pokemon.maxHp, pokemon.currentHp + this.state.config.balance.items.potions[tier].heal);
                return true;
            }
            tier--;
        }
        return false;
    }

    throwPokeball() {
        let tier = this.state.settings.activeBallTier;
        if (tier < 0) return false; // None selected

        let ballName = this.state.config.balance.items.pokeballs[tier].name;

        while(tier >= 0) {
            if (this.state.backpack.pokeballs[ballName] > 0) {
                this.state.backpack.pokeballs[ballName]--;
                break;
            }
            tier--;
            if (tier >= 0) ballName = this.state.config.balance.items.pokeballs[tier].name;
        }

        if (tier < 0) return false; // No balls left

        let multiplier = this.state.config.balance.items.pokeballs[tier].multiplier;

        const chance = mathEngine.calculateCatchChance(this.activeEncounter.bst, this.activeEncounter.level, multiplier, this.state.stats, this.activeEncounter.qualityName === "Shiny");

        return (Math.random() * 100) <= chance;
    }

    handleEnemyDefeat() {
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
        }

        const finishBattle = () => {
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
        }
    }

    // Legacy throwPokeball replaced by inline logic above, keeping for safety if referenced elsewhere
    throwPokeball() { return false; }



    handleGymVictory() {
        this.handleGymEnemyDefeat();
    }

    handleGymEnemyDefeat() {
        const gym = this.gymState.gym;
        const trainer = gym.trainers[this.gymState.currentTrainerIndex];

        this.gymState.currentPokemonIndex++;

        if (this.gymState.currentPokemonIndex >= trainer.team.length) {
            // Defeated trainer
            this.gymState.currentTrainerIndex++;
            this.gymState.currentPokemonIndex = 0;
            this.stop(); // Stop loop to show next button

            if (this.gymState.currentTrainerIndex >= gym.trainers.length) {
                // Defeated Gym!
                if (!this.state.trainer.badges) this.state.trainer.badges = 0;

                const gymIndex = this.state.config.gyms.findIndex(g => g.name === gym.name);
                if (gymIndex !== -1 && this.state.trainer.badges === gymIndex) {
                    this.state.trainer.badges++;
                }

                // Bonus money for winning
                this.state.trainer.money += 1000 * this.state.trainer.badges;
            }
            this.updateGymUI();
        } else {
            // Next pokemon
            this.searchNext();
        }
    }

    checkRouteUnlocks() {
        // Progression is handled via map clicks based on stats.battlesWon.
        // We no longer forcefully move the player to the next route here.
        // The user must open the map to travel to newly unlocked routes manually.
    }

    grantXP(pokemon, amount) {
        // Underlevel Boost
        if (pokemon.level < this.state.trainer.level) {
            const boost = Math.min(1.0, (this.state.trainer.level - pokemon.level) * amount * 0.05);
            amount += boost;
        }

        pokemon.xp += amount;
        this.state.trainer.xp += amount;

        // Check Trainer level up
        let newTrainerLvl = mathEngine.getLevelFromXP(this.state.trainer.xp);
        if (newTrainerLvl > this.state.trainer.level) {
            this.state.trainer.level = newTrainerLvl;
        }

        // Check level up
        let newLvl = mathEngine.getLevelFromXP(pokemon.xp);
        if (newLvl > pokemon.level) {
            pokemon.level = newLvl;
            // re-calc stats
            const pBase = this.state.config.pokemonData.find(p => p.id === pokemon.id);
            if (pBase) {
                pokemon.maxHp = mathEngine.calculateHP(pBase.hp, pokemon.ivs.hp, pokemon.level, pokemon.quality);
                pokemon.currentStats.atk = mathEngine.calculateStat(pBase.atk, pokemon.ivs.atk, pokemon.level, pokemon.quality);
                pokemon.currentStats.def = mathEngine.calculateStat(pBase.def, pokemon.ivs.def, pokemon.level, pokemon.quality);
                pokemon.currentStats.spa = mathEngine.calculateStat(pBase.spa, pokemon.ivs.spa, pokemon.level, pokemon.quality);
                pokemon.currentStats.spd = mathEngine.calculateStat(pBase.spd, pokemon.ivs.spd, pokemon.level, pokemon.quality);
                pokemon.currentStats.spe = mathEngine.calculateStat(pBase.spe, pokemon.ivs.spe, pokemon.level, pokemon.quality);
                // heal by diff
                pokemon.currentHp += (pokemon.maxHp - pokemon.currentHp);

                // Learn new moves
                pokemon.moves = this.getLearnsetMoves(pBase, pokemon.level);
            }
        }
    }

    handleFaint() {
        // move fainted pokemon to end of party
        const fainted = this.state.party.shift();
        this.state.party.push(fainted);

        if (this.state.party[0].currentHp <= 0) {
            this.handleWipeout();
        } else {
            this.updateUI();
            this.scheduleTurn(); // restart turn with new leader
        }
    }

    handleWipeout() {
        this.stop();
        this.activeEncounter = null;

        // Penalty: deduct 10% gold
        this.state.trainer.money = Math.floor(this.state.trainer.money * 0.9);

        // Reset Trainer XP to start of level (simplified)
        this.state.trainer.xp = mathEngine.calculateTotalXP(this.state.trainer.level);

        // Heal all party to full
        this.state.party.forEach(p => p.currentHp = p.maxHp);

        if (this.gymState && this.gymState.isActive) {
            // Flee gym
            this.stopGymBattle();
            this.updateUI();
        } else {
            // Return to poke center (simulated by just waiting and searching again for idle game)
            setTimeout(() => {
                this.searchNext();
            }, 5000 / this.state.settings.gameSpeed);

            this.updateUI();
        }
    }

    switchLeader(index) {
        if (index === 0 || index >= this.state.party.length) return;
        const target = this.state.party[index];
        if (target && target.currentHp > 0) {
            const currentLeader = this.state.party[0];
            this.state.party[0] = target;
            this.state.party[index] = currentLeader;
            this.updateUI();

            // if in battle, resetting turn timers
            if (this.activeEncounter && this.combatLoop) {
                clearTimeout(this.combatLoop);
                this.scheduleTurn();
            }
        }
    }
}

export default BattleSystem;