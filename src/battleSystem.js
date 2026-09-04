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
            currentTrainerIndex: 0,
            phase: 'REST'
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

        if (this.gymState.phase === 'END') {
            contentArea.innerHTML = `
                <div style="background-color: rgba(0,0,0,0.8); padding: 20px; border-radius: 8px; text-align: center; color: white; width: 300px;">
                    <h3 style="margin-top:0;">You defeated ${gym.leader}!</h3>
                    <p>You earned the ${gym.name} badge.</p>
                    <button onclick="window.battleEngine.collectBadge()" style="padding: 10px 20px; cursor: pointer;">Collect Badge</button>
                </div>
            `;
            window.battleEngine = this;
        } else if (this.gymState.phase === 'BATTLE') {
            const trainer = gym.trainers[this.gymState.currentTrainerIndex];
            contentArea.innerHTML = `
                <div id="gym-battle-area" style="display: block; background-color: rgba(0,0,0,0.8); padding: 20px; border-radius: 8px; width: 100%;">
                    <h3 style="margin-top: 0; margin-bottom: 5px; text-align: center; color: white;">${gym.name}</h3>
                    <div style="font-size: 14px; margin-bottom: 10px; text-align: center; color: white;">Trainer: ${trainer.name}</div>

                    <div style="display: flex; justify-content: space-between; align-items: flex-end; height: 150px; background: rgba(0,0,0,0.3); border: 2px solid #555; border-radius: 10px; padding: 20px;">
                        <div style="text-align: left; width: 40%;">
                            <h4 id="gym-player-name" style="margin: 0; color: white;">Player</h4>
                            <div style="width: 100%; height: 10px; background: #333; border: 1px solid #777;">
                                <div id="gym-player-hp-bar" style="width: 100%; height: 100%; background: #2ecc71;"></div>
                            </div>
                            <span id="gym-player-hp-text" style="color: white; font-size: 12px;"></span>
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

    async searchNext() {
        if (this.state.party.every(p => p.currentHp <= 0)) {
            this.handleWipeout();
            return;
        }

        if (this.state.currentRoute && this.state.currentRoute.startsWith("Casino - ")) {
            const cost = this.state.casinoDoubleShiny ? 20 : 10;
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

        // Speed Delays: Search Time: BaseSearchTime(3.0s) * (100 / (100 + Speed)), minimum 0.30s
        const leaderSpeed = this.state.party[0].currentStats.spe;
        let delay = this.state.config.balance.baseSearchTime * 1000 * (100 / (100 + leaderSpeed));
        delay = Math.max(300, delay) / this.state.settings.gameSpeed;

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
        this.scheduleTurn();
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

            q = mathEngine.generateQuality(this.state.stats, this.state.casinoDoubleShiny);
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
        this.scheduleTurn();
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
        const animDuration = 500 / this.state.settings.gameSpeed;

        if (typeof window.playCombatAnimations === 'function') {
            window.playCombatAnimations(targetSide, move.type, animDuration);
        }

        // Delay damage and next turn by projectile travel time
        setTimeout(() => {
            defender.currentHp -= hit.damage;

            // Show floating damage and splash
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
        }, animDuration);
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
        const leader = this.state.party[0];
        const ev = this.activeEncounter.ev;

        // Bonus Candy Defeats Tracker
        if ((this.state.stats.bonusCandyDefeats || 0) < 1000) {
            this.state.stats.bonusCandyDefeats = (this.state.stats.bonusCandyDefeats || 0) + 1;
        }

        // Auto Throw Pokeball logic (disable in gyms)
        if (this.state.settings.autoCatch && (!this.gymState || !this.gymState.isActive)) {
            const caught = this.throwPokeball();
            if (caught) {
                let caughtPokemon = JSON.parse(JSON.stringify(this.activeEncounter));
                // Fix the level 100 jump bug by setting xp explicitly to the exact minimum needed for their captured level
                caughtPokemon.xp = mathEngine.calculateTotalXP(caughtPokemon.level);
                this.state.storage.push(caughtPokemon);
                this.state.stats.caught++;
                if (this.activeEncounter.qualityName === "Shiny") this.state.stats.shiniesCaught = (this.state.stats.shiniesCaught || 0) + 1;
                if (this.activeEncounter.qualityName === "Epic") this.state.stats.epicCaptures = (this.state.stats.epicCaptures || 0) + 1;

                let sumIV = caughtPokemon.ivs.hp + caughtPokemon.ivs.atk + caughtPokemon.ivs.def + caughtPokemon.ivs.spa + caughtPokemon.ivs.spd + caughtPokemon.ivs.spe;
                if (sumIV < 300) this.state.stats.caughtIVUnder300 = (this.state.stats.caughtIVUnder300 || 0) + 1;
                if (sumIV < 350) this.state.stats.caughtIVUnder350 = (this.state.stats.caughtIVUnder350 || 0) + 1;
                if (sumIV < 400) this.state.stats.caughtIVUnder400 = (this.state.stats.caughtIVUnder400 || 0) + 1;
                if (sumIV < 450) this.state.stats.caughtIVUnder450 = (this.state.stats.caughtIVUnder450 || 0) + 1;
                if (sumIV < 500) this.state.stats.caughtIVUnder500 = (this.state.stats.caughtIVUnder500 || 0) + 1;

                if (caughtPokemon.level >= 15) this.state.stats.caughtLvl15 = (this.state.stats.caughtLvl15 || 0) + 1;
                if (caughtPokemon.level >= 30) this.state.stats.caughtLvl30 = (this.state.stats.caughtLvl30 || 0) + 1;
                if (caughtPokemon.level >= 45) this.state.stats.caughtLvl45 = (this.state.stats.caughtLvl45 || 0) + 1;
                if (caughtPokemon.level >= 60) this.state.stats.caughtLvl60 = (this.state.stats.caughtLvl60 || 0) + 1;
                if (caughtPokemon.level >= 75) this.state.stats.caughtLvl75 = (this.state.stats.caughtLvl75 || 0) + 1;

                // Track species catches for unlocks
                if (!this.state.stats.caughtSpecies) this.state.stats.caughtSpecies = {};
                this.state.stats.caughtSpecies[this.activeEncounter.name] = (this.state.stats.caughtSpecies[this.activeEncounter.name] || 0) + 1;

                // Track specific typings
                if (!this.state.stats.caughtSpecific) this.state.stats.caughtSpecific = {};
                if (!this.state.stats.challengeCaughtSpecific) this.state.stats.challengeCaughtSpecific = {};

                let qName = this.activeEncounter.qualityName || "Regular";

                if (this.activeEncounter.types) {
                      for (let t of this.activeEncounter.types) {
                          this.state.stats.caughtSpecific[t] = (this.state.stats.caughtSpecific[t] || 0) + 1;
                          let typeRarityKey = t + "_" + qName;
                          let typeAnyKey = t + "_Any";
                          this.state.stats.challengeCaughtSpecific[typeRarityKey] = (this.state.stats.challengeCaughtSpecific[typeRarityKey] || 0) + 1;
                          this.state.stats.challengeCaughtSpecific[typeAnyKey] = (this.state.stats.challengeCaughtSpecific[typeAnyKey] || 0) + 1;
                      }
                }

                let speciesRarityKey = this.activeEncounter.name + "_" + qName;
                this.state.stats.challengeCaughtSpecific[speciesRarityKey] = (this.state.stats.challengeCaughtSpecific[speciesRarityKey] || 0) + 1;

                // console.log(`Caught ${this.activeEncounter.name}!`);
            }
        }

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

        // Loot drops for Stones
        let dropRate = 0;
        switch (this.activeEncounter.qualityName) {
            case "Regular": dropRate = 0.01; break;
            case "Uncommon": dropRate = 0.02; break;
            case "Rare": dropRate = 0.03; break;
            case "Epic": dropRate = 0.05; break;
            case "Shiny": dropRate = 1.0; break;
        }

        if (Math.random() < (dropRate * lootMultiplier) && this.activeEncounter.types && this.activeEncounter.types.length > 0) {
            const types = this.activeEncounter.types;
            const randomType = types[Math.floor(Math.random() * types.length)];
            const stoneName = `${randomType} Stone`;

            let dropQuantity = Math.floor(lootMultiplier);
            if (Math.random() < (lootMultiplier % 1)) dropQuantity += 1;

            if (!this.state.backpack.stones) this.state.backpack.stones = {};
            this.state.backpack.stones[stoneName] = (this.state.backpack.stones[stoneName] || 0) + dropQuantity;
        }

        this.state.stats.battlesWon++;

        this.checkRouteUnlocks();

        // Record the defeated boss (for wild bosses like Mewtwo, Articuno)
        if (!this.state.stats.defeatedBosses) this.state.stats.defeatedBosses = {};
        if (this.activeEncounter.qualityName === "Boss" || this.activeEncounter.qualityName === "Legendary") { // In case we add these tiers later, or just check the name directly
            this.state.stats.defeatedBosses[this.activeEncounter.name] = true;
        } else {
             // For safety, just track the name of everything defeated in the wild just in case a challenge requires it
             // but let's stick to the specific bosses for now
             this.state.stats.defeatedBosses[this.activeEncounter.name] = true;
        }

        if (this.gymState && this.gymState.isActive) {
            this.handleGymEnemyDefeat();
        } else {
            this.searchNext();
        }
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

                // Record the defeated boss
                if (!this.state.stats.defeatedBosses) this.state.stats.defeatedBosses = {};
                this.state.stats.defeatedBosses[gym.leader] = true;

                const gymIndex = this.state.config.gyms.findIndex(g => g.name === gym.name);
                if (gymIndex !== -1 && this.state.trainer.badges === gymIndex) {
                    this.state.trainer.badges++;
                }

                // Bonus money for winning
                this.state.trainer.money += 1000 * this.state.trainer.badges;
                this.gymState.phase = 'END';
            } else {
                this.gymState.phase = 'REST';
            }
            this.updateGymUI();
        } else {
            // Next pokemon
            this.searchNext();
        }
    }

    checkRouteUnlocks() {
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
    }

    grantXP(pokemon, amount) {
        let levelTaskTier = this.state.stats.levelTaskTier || 0;
        let bonus = 0;
        if (levelTaskTier >= 1 && pokemon.level < 15) bonus += 0.5;
        if (levelTaskTier >= 2 && pokemon.level < 30) bonus += 0.5;
        if (levelTaskTier >= 3 && pokemon.level < 45) bonus += 0.5;
        if (levelTaskTier >= 4 && pokemon.level < 60) bonus += 0.5;
        if (levelTaskTier >= 5 && pokemon.level < 75) bonus += 0.5;
        // Purple Candy XP Bonus
        const xpMultiplier = 1 + (0.01 * (this.state.stats.purpleCandies || 0));
        amount = amount * (1 + bonus) * xpMultiplier;

        pokemon.xp += amount;

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