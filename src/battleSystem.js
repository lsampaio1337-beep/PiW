import { VITAMINS, WHITE_CANDY_DEFEAT_REQUIREMENT } from "./constants.js";
// src/battleSystem.js
import * as mathEngine from './mathEngine.js';

class BattleSystem {
    constructor(gameState, updateUI) {
        this.state = gameState; // reference to global game state
        this.updateUI = updateUI; // callback to update UI

        this.activeEncounter = null;
        this.combatLoop = null;
        this.isSearching = false;
        this.isFainting = false;

        this.consecutiveHeals = 0;


        this.multiplayerState = {
            isActive: false,
            opponentParty: null,
            currentPokemonIndex: 0
        };

        this.gymState = {
            isActive: false,
            gym: null,
            currentTrainerIndex: 0
        };
    }

    getPokemonBase(id) {
        if (!this.pokemonBaseMap) {
            this.pokemonBaseMap = new Map();
            if (this.state.config && this.state.config.pokemonData) {
                for (const p of this.state.config.pokemonData) {
                    this.pokemonBaseMap.set(p.id, p);
                }
            }
        }
        return this.pokemonBaseMap.get(id);
    }

    getSpeedMultiplier() {
        const speedTier = this.state.stats?.upgrades?.speedTier || 0;
        // Tier 0: 1.0 (100% time)
        // Tier 1: 0.9 (90% time)
        // Tier 5+: 0.5 (50% time)
        const mult = 1.0 - (speedTier * 0.1);
        return Math.max(0.5, mult);
    }

    getLootTier() {
        return this.state.stats?.upgrades?.lootTier || 0;
    }


    getEvolutionStage(pokemonId) {
        if (!this.evolutionStageMap) {
            const evolveFromMap = {};
            const pokemonData = this.state.config.pokemonData;
            const len = pokemonData.length;

            // First pass: Build the reverse lookup map
            for (let i = 0; i < len; i++) {
                const p = pokemonData[i];
                if (p.evolutions) {
                    const evos = p.evolutions;
                    for (let j = 0; j < evos.length; j++) {
                        evolveFromMap[evos[j].to] = p.id;
                    }
                }
            }

            this.evolutionStageMap = {};

            // Second pass: Calculate stages iteratively using an array for path to avoid recursion
            for (let i = 0; i < len; i++) {
                let id = pokemonData[i].id;

                if (this.evolutionStageMap[id]) continue;

                let stage = 1;
                const path = [];

                // Trace back to the base form or a previously calculated stage
                while (id && !this.evolutionStageMap[id]) {
                    path.push(id);
                    id = evolveFromMap[id];
                }

                // If we found a previously calculated stage, start from there
                if (id) {
                    stage = this.evolutionStageMap[id] + 1;
                }

                // Assign stages forward along the path
                for (let j = path.length - 1; j >= 0; j--) {
                    this.evolutionStageMap[path[j]] = stage > 5 ? 5 : stage;
                    stage++;
                }
            }
        }
        return this.evolutionStageMap[pokemonId] || 1;
    }

    start() {

        if (!this.combatLoop) {
            const leaderSpeed = this.state.party[0].currentStats.spe;
            const speedMult = this.getSpeedMultiplier();
            let slideDelay = this.state.config.balance.baseSearchTime * 1000 * (100 / (100 + leaderSpeed)) * speedMult;
            slideDelay = Math.max(300, slideDelay) / this.state.settings.gameSpeed;
            this.generateEncounter(slideDelay);
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
        if (!attacker.moves) return null;
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


    startMultiplayerBattle(opponentParty, isHost) {
        this.stop();
        this.multiplayerState = {
            isActive: true,
            opponentParty: opponentParty,
            isHost: isHost,
            currentPokemonIndex: 0
        };

        if (typeof window.switchView === 'function') {
            window.switchView("BATTLE_ARENA");
        }

        const leaderSpeed = this.state.party[0].currentStats.spe;
        let slideDelay = this.state.config.balance.baseSearchTime * 1000 * (100 / (100 + leaderSpeed));
        slideDelay = Math.max(300, slideDelay) / this.state.settings.gameSpeed;

        this.generateMultiplayerEncounter(slideDelay);
    }

    stopMultiplayerBattle() {
        this.multiplayerState.isActive = false;
        this.multiplayerState.opponentParty = null;
        this.multiplayerState.currentPokemonIndex = 0;
        this.stop();

        // Restore party from backup
        import('./ui/multiplayer.js').then((mp) => {
            if (mp.originalParty && mp.originalParty.length > 0) {
                // Restore the original party array, overriding the shifted one
                this.state.party.length = 0;
                mp.originalParty.forEach(p => {
                     // Heal them up too just in case
                     p.currentHp = p.maxHp;
                     this.state.party.push(p);
                });
            }

            if (typeof window.switchView === 'function') {
                window.switchView("PROF_OAK_LAB");
            }

            // Re-generate idle encounter
            const leaderSpeed = this.state.party[0] ? this.state.party[0].currentStats.spe : 100;
            let slideDelay = this.state.config.balance.baseSearchTime * 1000 * (100 / (100 + leaderSpeed));
            slideDelay = Math.max(300, slideDelay) / this.state.settings.gameSpeed;
            this.generateEncounter(slideDelay);

            // Re-open multiplayer modal and reset ready states so players stay connected
            if (typeof window.resetMultiplayerReady === 'function') {
                window.resetMultiplayerReady();
            }
            if (typeof window.openMultiplayerModal === 'function') {
                const hostStatus = typeof window.getMultiplayerIsHost === 'function' ? window.getMultiplayerIsHost() : false;
                window.openMultiplayerModal(hostStatus ? 'host' : 'join');
            }
        }).catch(err => {
            console.error("Error importing multiplayer:", err);
            // Fallback: Re-open multiplayer modal and reset ready states so players stay connected
            if (typeof window.resetMultiplayerReady === 'function') {
                window.resetMultiplayerReady();
            }
            if (typeof window.openMultiplayerModal === 'function') {
                const hostStatus = typeof window.getMultiplayerIsHost === 'function' ? window.getMultiplayerIsHost() : false;
                window.openMultiplayerModal(hostStatus ? 'host' : 'join');
            }
        });
    }

    generateMultiplayerEncounter(slideDelay) {
        if (!this.multiplayerState.opponentParty) return;

        const pokemonDef = this.multiplayerState.opponentParty[this.multiplayerState.currentPokemonIndex];
        if (!pokemonDef) {
            this.stopMultiplayerBattle();
            return;
        }

        const pokemonBase = this.getPokemonBase(pokemonDef.id);

        let stats = { ...pokemonDef.currentStats };

        this.activeEncounter = {
            id: pokemonDef.id,
            uuid: pokemonDef.uuid,
            name: pokemonBase.name,
            level: pokemonDef.level,
            maxHp: pokemonDef.maxHp,
            currentHp: pokemonDef.currentHp,
            xp: mathEngine.calculateTotalXP(pokemonDef.level),
            types: pokemonDef.types,
            quality: pokemonDef.quality,
            qualityName: pokemonDef.qualityName,
            isShiny: pokemonDef.isShiny,
            currentStats: stats,
            moves: pokemonDef.moves || this.getLearnsetMoves(pokemonBase, pokemonDef.level),
            isBoss: false,
            catchRate: 0,
            xp: mathEngine.calculateTotalXP(pokemonDef.level)
        };

        this.updateUI();

        if (this.state.settings.smartCapture && typeof window.updateSmartCaptureIcon === 'function') {
            window.updateSmartCaptureIcon();
        }

        if (typeof window.triggerSlideAnimation === 'function') {
            window.triggerSlideAnimation(slideDelay);
        }

        this.isSearching = false;
        this.isFainting = false;
        this.isSliding = true;
        this.slideDuration = slideDelay;

        this.combatLoop = setTimeout(() => {
            this.isSliding = false;
            this.updateUI();

            const playerPokemon = this.state.party[0];
            const enemyPokemon = this.activeEncounter;

            // In Multiplayer, the host calculates everything, but we still need turn order based on speed
            if (playerPokemon.currentStats.spe >= enemyPokemon.currentStats.spe) {
                this.executeMultiplayerTurn(playerPokemon, enemyPokemon);
            } else {
                this.executeMultiplayerTurn(enemyPokemon, playerPokemon);
            }
        }, slideDelay);
    }

    handleMultiplayerEvent(event) {
        if (!this.multiplayerState.isActive) return;

        if (event.type === 'attack') {
            const defender = event.target === 'player' ? this.state.party[0] : this.activeEncounter;
            const attacker = event.target === 'player' ? this.activeEncounter : this.state.party[0];

            const animDuration = 500 / this.state.settings.gameSpeed;
            if (typeof window.playCombatAnimations === 'function') {
                window.playCombatAnimations(event.target, event.moveType, animDuration);
            }

            setTimeout(() => {
                defender.currentHp = event.newHp;

                if (typeof window.showDamage === 'function') {
                    window.showDamage(event.target, event.damage, event.isCritical, event.effectiveness);
                }

                this.updateUI();

                if (event.fainted) {
                    this.handleMultiplayerDefeat(defender);
                }
            }, animDuration);
        }
    }

    executeMultiplayerTurn(attacker, defender) {
        if (!this.multiplayerState.isHost) return; // Only host calculates combat
        import('./ui/multiplayer.js').then((mp) => {

            if (this.isFainting) return;
            if (!this.activeEncounter) return;

            let move = this.getBestMove(attacker, defender);
            if (!move) move = { name: 'Struggle', type: 'Normal', category: 'Physical', power: 50 };
            const isPhysical = move.category === 'Physical';
            const atkStat = isPhysical ? attacker.currentStats.atk : attacker.currentStats.spa;
            const defStat = isPhysical ? defender.currentStats.def : defender.currentStats.spd;
            const eff = this.getTypeEffectiveness(move.type, defender.types);

            const hit = mathEngine.calculateDamage(attacker.level, move.power, atkStat, defStat, eff, attacker.quality);

            const targetSide = attacker === this.state.party[0] ? 'enemy' : 'player';
            const animDuration = 500 / this.state.settings.gameSpeed;

            if (typeof window.playCombatAnimations === 'function') {
                window.playCombatAnimations(targetSide, move.type, animDuration);
            }

            let fainted = false;

            setTimeout(() => {
                defender.currentHp -= hit.damage;
                if (defender.currentHp <= 0) {
                    defender.currentHp = 0;
                    fainted = true;
                }

                if (typeof window.showDamage === 'function') {
                    window.showDamage(targetSide, hit.damage, hit.isCritical, hit.effectiveness);
                }

                // Send result to client
                if (mp.dataChannel) {
                     mp.dataChannel.send(JSON.stringify({
                         type: 'combatEvent',
                         event: {
                             type: 'attack',
                             target: targetSide === 'enemy' ? 'player' : 'enemy', // Invert target for the client
                             damage: hit.damage,
                             newHp: defender.currentHp,
                             isCritical: hit.isCritical,
                             effectiveness: hit.effectiveness,
                             moveType: move.type,
                             fainted: fainted
                         }
                     }));
                }

                this.updateUI();

                if (fainted) {
                    this.handleMultiplayerDefeat(defender);
                } else {
                    const delay = Math.max(200, 1000 / this.state.settings.gameSpeed);
                    this.combatLoop = setTimeout(() => {
                        this.executeMultiplayerTurn(defender, attacker);
                    }, delay);
                }
            }, animDuration);
        });
    }

    handleMultiplayerDefeat(defeated) {
        this.isFainting = true;
        this.stop(); // Clear loop

        if (defeated === this.activeEncounter) {
             if (typeof window.triggerDefeatAnimation === 'function') {
                 window.triggerDefeatAnimation('enemy');
             }

             this.multiplayerState.currentPokemonIndex++;

             setTimeout(() => {
                 this.isFainting = false;
                 if (this.multiplayerState.currentPokemonIndex >= this.multiplayerState.opponentParty.length) {
                     this.stopMultiplayerBattle();
                     setTimeout(() => {
                         if (typeof window.showGameAlert === 'function') {
                             window.showGameAlert("You won the multiplayer battle!", "window-multiplayer");
                         } else {
                             alert("You won the multiplayer battle!");
                         }
                     }, 100);
                 } else {
                     const leaderSpeed = this.state.party[0].currentStats.spe;
                     let slideDelay = this.state.config.balance.baseSearchTime * 1000 * (100 / (100 + leaderSpeed));
                     slideDelay = Math.max(300, slideDelay) / this.state.settings.gameSpeed;
                     this.generateMultiplayerEncounter(slideDelay);
                 }
             }, 1000);
        } else {
             if (typeof window.triggerDefeatAnimation === 'function') {
                 window.triggerDefeatAnimation('player');
             }
             // Wait for defeat animation
             setTimeout(() => {
                 this.state.party.shift(); // Remove fainted pokemon
                 this.updateUI();

                 if (this.state.party.length === 0) {
                     this.isFainting = false;
                     this.stopMultiplayerBattle();
                     setTimeout(() => {
                         if (typeof window.showGameAlert === 'function') {
                             window.showGameAlert("You lost the multiplayer battle.", "window-multiplayer");
                         } else {
                             alert("You lost the multiplayer battle.");
                         }
                     }, 100);
                 } else {
                     this.isFainting = false;
                     const playerPokemon = this.state.party[0];
                     const enemyPokemon = this.activeEncounter;
                     const delay = Math.max(200, 1000 / this.state.settings.gameSpeed);

                     if (playerPokemon.currentStats.spe >= enemyPokemon.currentStats.spe) {
                         this.combatLoop = setTimeout(() => this.executeMultiplayerTurn(playerPokemon, enemyPokemon), delay);
                     } else {
                         this.combatLoop = setTimeout(() => this.executeMultiplayerTurn(enemyPokemon, playerPokemon), delay);
                     }
                 }
             }, 1000);
        }
    }

    startGymBattle(gymName) {
        const gym = this.state.config.gyms.find(g => g.name === gymName);
        if (!gym) return;

        this.stop();
        this.gymState = {
            isActive: true,
            gym: gym,
            currentTrainerIndex: 0,
            inCombat: false
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

        // Apply elite 4 background during rest phase if applicable
        if (gym.name === "Indigo Plateau") {
            const trainerBGs = [
                'BG-Elite4-1Lorelei.png',
                'BG-Elite4-2Bruno.png',
                'BG-Elite4-3Agatha.png',
                'BG-Elite4-4Lance.png',
                'BG-Elite4-5Champion.png'
            ];
            let trainerIndex = this.gymState.currentTrainerIndex;
            if (trainerIndex >= trainerBGs.length) {
                trainerIndex = trainerBGs.length - 1; // Keep Champion BG after beating them
            }
            const bgImage = trainerBGs[trainerIndex] || 'BG.png';
            vGym.style.backgroundImage = `url('./Assets/BG/${bgImage}')`;
            vGym.style.backgroundSize = "cover";
        }

        const trainer = gym.trainers[this.gymState.currentTrainerIndex];


        if (trainer) {
            let trainerButtonsHtml = gym.trainers.map((t, index) => {
                const isLeader = index === gym.trainers.length - 1;
                const buttonText = isLeader ? `Fight Gym Leader` : `Fight Gym Trainer`;

                if (index < this.gymState.currentTrainerIndex) {
                    return `<button disabled style="padding: 10px; opacity: 0.5; width: 100%;">${buttonText} (Defeated)</button>`;
                } else if (index === this.gymState.currentTrainerIndex) {
                    return `<button id="btn-start-gym-battle" onclick="window.battleEngine.startNextGymBattle()" style="padding: 10px; font-weight: bold; background-color: #2ecc71; color: white; border: none; cursor: pointer; width: 100%;">${buttonText} (${t.name})</button>`;
                } else {
                    return `<button disabled style="padding: 10px; opacity: 0.5; width: 100%;">${buttonText} (${t.name})</button>`;
                }
            }).join('');

            // Rest phase UI
            contentArea.innerHTML = `
                <div id="gym-rest-area" style="display: flex; flex-direction: column; gap: 10px; width: 100%;">
                    <h3>Gym Lobby</h3>
                    <p style="font-size: 14px; margin-bottom: 10px;">You may heal and organize your party.</p>
                    ${trainerButtonsHtml}
                    <button onclick="window.battleEngine.stopGymBattle()" style="padding: 10px; background: #e74c3c; border: none; color: white; border-radius: 3px; cursor: pointer; margin-top: 10px; width: 100%;">Flee Gym</button>
                </div>
            `;
            // Temporary expose for the button
            window.battleEngine = this;

            // Re-bind to use our special gym start func that toggles visibility
            window.battleEngine.startNextGymBattle = () => {
                this.gymState.inCombat = true;
                if (typeof window.switchView === 'function') {
                    window.switchView("BATTLE_ARENA");
                }
                const leaderSpeed = this.state.party[0].currentStats.spe;
                const speedMult = this.getSpeedMultiplier();
            let slideDelay = this.state.config.balance.baseSearchTime * 1000 * (100 / (100 + leaderSpeed)) * speedMult;
            slideDelay = Math.max(300, slideDelay) / this.state.settings.gameSpeed;
            this.generateGymEncounter(slideDelay);
            };
        } else {
            // Gym completed
            contentArea.innerHTML = `
                <h3>You defeated ${gym.leader}!</h3>
                <p>A Gift is awaiting for you.</p>
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
        // Prevent searching if we are in the middle of fading out/fainting
        if (this.isFainting) {
            return;
        }

        if (this.state.party.every(p => p.currentHp <= 0)) {
            this.handleWipeout();
            return;
        }

        if (this.state.currentRoute === "Safari Zone") {
            const safariCost = this.state.config.balance.safariZonePrice || 500;
            if (this.state.trainer.money < safariCost) {
                this.stop();
                if (typeof window.switchView === 'function') {
                    window.switchView("SAFARI_HUB");
                }
                let msg = document.getElementById("safari-welcome-msg");
                if (msg) msg.innerText = "I am sorry, but you are all out of money. Try to sell some pokemons and come check us latter.";
                return;
            }
            this.state.trainer.money -= safariCost;
        }

        // Out of combat insta-heal if threshold is met
        const leader = this.state.party[0];
        if (leader && leader.currentHp > 0 && this.state.settings.autoPotion) {
            let threshold = this.state.settings.autoPotionThreshold !== undefined ? this.state.settings.autoPotionThreshold : 25;
            while ((leader.currentHp / leader.maxHp) * 100 <= threshold) {
                if (!this.tryUsePotion(leader)) break; // Stop if no potions left
            }
        }

        this.consecutiveHeals = 0; // Reset for new battle

        if (this.state.currentRoute && this.state.currentRoute.startsWith("Casino - ")) {
            const baseCostStandard = this.state.config.balance.casinoPrices?.standard || 10;
            const baseCostSpecial = this.state.config.balance.casinoPrices?.doubleShiny || 20;
            const cost = this.state.casinoDoubleShiny ? baseCostSpecial : baseCostStandard;
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
        const speedMult = this.getSpeedMultiplier();
        let delay = this.state.config.balance.baseSearchTime * 1000 * (100 / (100 + leaderSpeed)) * speedMult;
        delay = Math.max(300, delay) / this.state.settings.gameSpeed;

        // Start encounter generation after search delay, slide duration will be same as search delay
        this.combatLoop = setTimeout(() => {
            if (this.gymState.isActive) {
                this.generateGymEncounter(delay);
            } else {
                this.generateEncounter(delay);
            }
        }, delay);
    }

    generateGymEncounter(slideDelay) {
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

        const pokemonBase = this.getPokemonBase(pokemonDef.id);
        const level = pokemonDef.level;

        // Gym leaders and trainers have fixed quality (e.g. Regular or Uncommon)
        const isLeader = this.gymState.currentTrainerIndex === gym.trainers.length - 1;

        let gymIndex = this.state.config.gyms.findIndex(g => g.name === gym.name);
        if (gymIndex === -1) gymIndex = 0; // Fallback

        // Map Gym Index to QValue and SumIV
        // Gym 1 (Index 0): Q=1.2, SumIV=270 => IV=45
        // Gym 2 (Index 1): Q=1.25, SumIV=300 => IV=50
        // ...
        // Gym 8 (Index 7): Q=1.55, SumIV=480 => IV=80
        // E4 (Index 8): Q=1.6, SumIV=510 => IV=85
        let qValue = 1.2 + (gymIndex * 0.05);
        let sumIV = 270 + (gymIndex * 30);
        let ivValue = sumIV / 6;

        let qualityName = "Gym"; // You can keep a standard name or map it if desired
        if (qValue >= 1.6) qualityName = "Legendary";
        else if (qValue >= 1.4) qualityName = "Epic";
        else if (qValue >= 1.3) qualityName = "Rare";
        else if (qValue >= 1.2) qualityName = "Uncommon";

        const q = { name: qualityName, q: qValue };

        // Track seen for pokedex
        if (!this.state.stats.seenSpecies) this.state.stats.seenSpecies = {};
        if (!this.state.stats.seenSpecies) this.state.stats.seenSpecies = {};
            this.state.stats.seenSpecies[pokemonBase.name] = true;

        // Give them good IVs based on gym progression
        const ivs = { hp: ivValue, atk: ivValue, def: ivValue, spa: ivValue, spd: ivValue, spe: ivValue };

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
            xp: mathEngine.calculateTotalXP(level),
            evxp: mathEngine.calculateEVXP(bst, level, q.q, totalIV),
            evm: mathEngine.calculateEVM(bst, level, q.q, totalIV),
            pp: mathEngine.calculatePP(bst, level, q.q, totalIV),
            bst: bst,
            moves: this.getLearnsetMoves(pokemonBase, level),
            xp: mathEngine.calculateTotalXP(level)
        };

        this.isSearching = false;
        this.isSliding = true;
        this.slideDuration = slideDelay;
        this.updateUI();

        this.combatLoop = setTimeout(() => {
            this.isSliding = false;
            this.updateUI();
            this.scheduleTurn();
        }, slideDelay);
    }

    generateEncounter(slideDelay) {
        let pokemonBase;
        let level;
        let q;
        let ivs;

        let isDisguisedDitto = false;

        if (this.state.nextForcedEncounter) {
            const forced = this.state.nextForcedEncounter;
            pokemonBase = this.getPokemonBase(forced.id) || this.state.config.pokemonData[0];
            level = forced.level;

            const qName = forced.qValue >= 2.0 ? "Shiny" : "Custom";
            q = { name: qName, q: forced.qValue };

            // Distribute SumIV randomly
            let remainingIV = forced.sumIV;
            ivs = { hp: 0, atk: 0, def: 0, spa: 0, spd: 0, spe: 0 };
            const statKeys = ['hp', 'atk', 'def', 'spa', 'spd', 'spe'];

            while (remainingIV > 0) {
                // Filter out stats that are already maxed at 100
                const availableStats = statKeys.filter(s => ivs[s] < 100);
                if (availableStats.length === 0) break; // All maxed out

                const randomStat = availableStats[Math.floor(Math.random() * availableStats.length)];
                ivs[randomStat]++;
                remainingIV--;
            }

            if (qName === "Shiny") {
                this.state.stats.shiniesSeen = (this.state.stats.shiniesSeen || 0) + 1;
                if (!this.state.stats.seenShiniesSpecies) this.state.stats.seenShiniesSpecies = {};
                this.state.stats.seenShiniesSpecies[pokemonBase.name] = true;
            }

            if (!this.state.stats.seenSpecies) this.state.stats.seenSpecies = {};
            this.state.stats.seenSpecies[pokemonBase.name] = true;

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

            let actualPokemonBase = this.getPokemonBase(selectedSpawn.pokemonId);
            pokemonBase = actualPokemonBase;
            level = Math.floor(Math.random() * (selectedSpawn.maxLevel - selectedSpawn.minLevel + 1)) + selectedSpawn.minLevel;

            if (pokemonBase.id === 132 && route.spawns.length > 1) {
                isDisguisedDitto = true;
                const otherSpawns = route.spawns.filter(s => s.pokemonId !== 132);
                if (otherSpawns.length > 0) {
                    const disguiseSpawn = otherSpawns[Math.floor(Math.random() * otherSpawns.length)];
                    pokemonBase = this.getPokemonBase(disguiseSpawn.pokemonId);
                }
            }

            q = mathEngine.generateQuality(this.state.stats, this.state.casinoDoubleShiny);

            // Track seen for pokedex using actual encounter (Ditto or regular)
            if (q.name === "Shiny") {
                if (this.state.currentRoute === 'Casino') {
                    if (typeof window !== 'undefined' && typeof window.trackDailyChallenge === 'function') window.trackDailyChallenge('casino_shiny');
                }
                this.state.stats.shiniesSeen = (this.state.stats.shiniesSeen || 0) + 1;
                if (!this.state.stats.seenShiniesSpecies) this.state.stats.seenShiniesSpecies = {};
                this.state.stats.seenShiniesSpecies[actualPokemonBase.name] = true;
            }

            if (!this.state.stats.seenSpecies) this.state.stats.seenSpecies = {};
            this.state.stats.seenSpecies[actualPokemonBase.name] = true;

            ivs = mathEngine.generateIVs(this.state.stats, q.name === "Shiny");

            // Route 1 Level Cap
            if (this.state.currentRoute === "Route 1") {
                const playerLevel = this.state.party[0] ? this.state.party[0].level : 1;
                level = Math.min(level, playerLevel);
            }
        }

        const currentStats = {
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
            currentStats: currentStats,
            maxHp: currentStats.hp,
            currentHp: currentStats.hp,
            xp: mathEngine.calculateTotalXP(level),
            evxp: mathEngine.calculateEVXP(bst, level, q.q, totalIV),
            evm: mathEngine.calculateEVM(bst, level, q.q, totalIV),
            pp: mathEngine.calculatePP(bst, level, q.q, totalIV),
            bst: bst,
            moves: this.getLearnsetMoves(pokemonBase, level),
            isDisguisedDitto: isDisguisedDitto,
            xp: mathEngine.calculateTotalXP(level)
        };

        this.isSearching = false;
        this.isSliding = true;
        this.slideDuration = slideDelay;
        this.updateUI();

        this.combatLoop = setTimeout(() => {
            this.isSliding = false;
            this.updateUI();
            this.scheduleTurn();
        }, slideDelay);
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
        if (this.isFainting) return;

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
        if (this.isFainting) return;

        if (!this.activeEncounter) return;

        const leader = this.state.party[0];

        // Check if player uses potion
        if (attacker === leader && this.state.settings.autoPotion) {
            // Check if we hit the threshold
            let threshold = this.state.settings.autoPotionThreshold !== undefined ? this.state.settings.autoPotionThreshold : 25;
            let hpPercentage = (attacker.currentHp / attacker.maxHp) * 100;

            if (hpPercentage <= threshold) {
                if (this.consecutiveHeals >= 3) {
                    // Skip heal to attack, reset consecutive heals
                    this.consecutiveHeals = 0;
                } else {
                    if (this.tryUsePotion(attacker)) {
                        this.consecutiveHeals++;
                        this.updateUI();
                        this.scheduleNextStrike(attacker, defender);
                        return;
                    }
                }
            } else {
                // If we attack instead of healing because hp > threshold, reset heals
                this.consecutiveHeals = 0;
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
                    if (!this.isFainting) {
                        this.handleFaint();
                    }
                }
            } else {
                this.scheduleNextStrike(attacker, defender);
            }
        }, animDuration);
    }

    scheduleNextStrike(attacker, defender) {
        if (this.isFainting) return;

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
        if (this.gymState && this.gymState.isActive) return false; // Auto potions disabled in Gyms

        if (pokemon.currentHp >= pokemon.maxHp) return false; // don't heal if full

        let threshold = this.state.settings.autoPotionThreshold !== undefined ? this.state.settings.autoPotionThreshold : 25;
        if ((pokemon.currentHp / pokemon.maxHp) * 100 > threshold) return false;

        let tier = this.state.settings.activePotionTier;
        if (tier < 0) return false;

        const potName = this.state.config.balance.items.potions[tier].name;
        if (this.state.backpack.potions[potName] > 0) {
            this.state.backpack.potions[potName]--;
            if (typeof window !== 'undefined' && typeof window.trackDailyChallenge === 'function') window.trackDailyChallenge('defeat_endurance', { streak: 0 });
            pokemon.currentHp = Math.min(pokemon.maxHp, pokemon.currentHp + this.state.config.balance.items.potions[tier].heal);
            return true;
        }
        return false;
    }

    throwPokeball() {
        if (mathEngine.getCurrentCount(this.state, 'box') >= mathEngine.getCapacity(this.state, 'box')) {
            return { used: false, ballName: null, caught: false };
        }

        let tier = this.state.settings.activeBallTier;

        // Smart Capture Mode override (only if outside Safari Zone, checked later)
        if (this.activeEncounter && this.state.settings.smartCapture) {
            let overrideTier;
            if (this.activeEncounter.qualityName === "Shiny") {
                if (this.state.settings.smartCaptureShiny && this.state.settings.smartCaptureShiny[this.activeEncounter.id] !== undefined) {
                    overrideTier = this.state.settings.smartCaptureShiny[this.activeEncounter.id];
                } else if (this.state.settings.globalSmartCaptureShiny !== undefined) {
                    overrideTier = this.state.settings.globalSmartCaptureShiny;
                }
            } else {
                if (this.state.settings.smartCapture[this.activeEncounter.id] !== undefined) {
                    overrideTier = this.state.settings.smartCapture[this.activeEncounter.id];
                }
            }

            if (overrideTier !== undefined) {
                tier = overrideTier;
            }
        }

        let isSafariZone = this.state.currentRoute === "Safari Zone";
        let ballName;
        let multiplier;

        if (isSafariZone) {
            let safariBallConfig = this.state.config.balance.items.pokeballs.find(b => b.name === "Safariball");
            ballName = "Safariball";
            multiplier = safariBallConfig ? safariBallConfig.multiplier : 1.5;
            this.state.stats.ballsThrown = (this.state.stats.ballsThrown || 0) + 1;
        } else {
            if (tier < 0) return { used: false, ballName: null, caught: false }; // None selected or explicitly ignored (-1)
            ballName = this.state.config.balance.items.pokeballs[tier].name;

            if (ballName !== "Safariball") {
                if (this.state.settings.infiniteItems || this.state.backpack.pokeballs[ballName] > 0) {
                    if (!this.state.settings.infiniteItems) {
                        this.state.backpack.pokeballs[ballName]--;
                    }
                } else {
                    return { used: false, ballName: null, caught: false }; // No balls left
                }
            }

            multiplier = this.state.config.balance.items.pokeballs[tier].multiplier;
            this.state.stats.ballsThrown = (this.state.stats.ballsThrown || 0) + 1;
        }

        const totalIV = this.activeEncounter.ivs.hp + this.activeEncounter.ivs.atk + this.activeEncounter.ivs.def + this.activeEncounter.ivs.spa + this.activeEncounter.ivs.spd + this.activeEncounter.ivs.spe;
        const chance = mathEngine.calculateCatchChance(this.activeEncounter.bst, this.activeEncounter.level, this.activeEncounter.quality, totalIV, multiplier, this.state.stats, this.activeEncounter.qualityName === "Shiny");

        const caught = (Math.random() * 100) <= chance;

        // Track catch attempts per pokemon
        if (!this.state.stats.catchAttempts) this.state.stats.catchAttempts = {};
        if (!this.state.stats.shinyCatchAttempts) this.state.stats.shinyCatchAttempts = {};

        const targetTracker = this.activeEncounter.qualityName === "Shiny" ? this.state.stats.shinyCatchAttempts : this.state.stats.catchAttempts;
        if (!targetTracker[this.activeEncounter.name]) {
            targetTracker[this.activeEncounter.name] = {};
        }
        if (!targetTracker[this.activeEncounter.name][ballName]) {
            targetTracker[this.activeEncounter.name][ballName] = { thrown: 0, caught: 0 };
        }

        targetTracker[this.activeEncounter.name][ballName].thrown++;
        if (caught) {
            targetTracker[this.activeEncounter.name][ballName].caught++;
        }

        return {
            used: true,
            ballName: ballName,
            caught: caught
        };
    }

    handleEnemyDefeat() {
        const leader = this.state.party[0];

        // Out of combat insta-heal if threshold is met
        if (leader && leader.currentHp > 0 && this.state.settings.autoPotion) {
            let threshold = this.state.settings.autoPotionThreshold !== undefined ? this.state.settings.autoPotionThreshold : 25;
            while ((leader.currentHp / leader.maxHp) * 100 <= threshold) {
                if (!this.tryUsePotion(leader)) break;
            }
        }

        const evxp = this.activeEncounter.evxp;
        const evm = this.activeEncounter.evm;

        // Bonus Candy Defeats Tracker
        this.state.stats.bonusCandyDefeats = (this.state.stats.bonusCandyDefeats || 0) + 1;
        if (this.state.stats.bonusCandyDefeats >= WHITE_CANDY_DEFEAT_REQUIREMENT) {
            this.state.stats.bonusCandyDefeats -= WHITE_CANDY_DEFEAT_REQUIREMENT;
            this.state.stats.whiteCandies = (this.state.stats.whiteCandies || 0) + 1;
            // Never reset hasSeenBonusCandyIcon so the exclamation mark never reappears
        }

        // Track Daily Challenges
        if (typeof window !== 'undefined' && typeof window.trackDailyChallenge === 'function') {
            window.trackDailyChallenge('defeat_level', { level: this.activeEncounter.level, playerLevel: leader.level });
            window.trackDailyChallenge('defeat_type', { types: this.activeEncounter.types });
            window.trackDailyChallenge('defeat_species', { species: this.activeEncounter.name });
            window.trackDailyChallenge('defeat_underdog', { level: this.activeEncounter.level, playerLevel: leader.level });

            if (this.state.stats.dailyChallenges) {
                window.trackDailyChallenge('defeat_endurance', { streak: 1 });

                if (this.state.currentRoute === this.state.stats.dailyChallenges.currentRoute) {
                    window.trackDailyChallenge('defeat_single_route', { streak: 2 });
                } else {
                    this.state.stats.dailyChallenges.currentRoute = this.state.currentRoute;
                    window.trackDailyChallenge('defeat_single_route', { streak: 1 });
                }
            }

            if (this.turnCount === 1) {
                 window.trackDailyChallenge('defeat_1_turn');
            } // Handled in a simpler way if needed, or we might need to adjust logic
        }

        // Auto Throw Pokeball logic (disable in gyms)
        if (this.state.settings.autoCatch && (!this.gymState || !this.gymState.isActive)) {
            const ballResult = this.throwPokeball();
            const defeatedEncounter = this.activeEncounter; // cache for closure

            if (ballResult.used) {
                const processCapture = () => {
                    if (ballResult.caught) {
                        let caughtPokemon = JSON.parse(JSON.stringify(defeatedEncounter));

                        let trackingName = defeatedEncounter.name;
                        let trackingTypes = defeatedEncounter.types || [];

                        if (caughtPokemon.isDisguisedDitto) {
                            const dittoBase = this.getPokemonBase(132);
                            caughtPokemon.id = 132;
                            caughtPokemon.name = "Ditto";
                            caughtPokemon.types = ["Normal"];

                            const level = caughtPokemon.level;
                            const ivs = caughtPokemon.ivs;
                            const q = caughtPokemon.quality;

                            caughtPokemon.currentStats = {
                                hp: mathEngine.calculateHP(dittoBase.hp, ivs.hp, level, q),
                                atk: mathEngine.calculateStat(dittoBase.atk, ivs.atk, level, q),
                                def: mathEngine.calculateStat(dittoBase.def, ivs.def, level, q),
                                spa: mathEngine.calculateStat(dittoBase.spa, ivs.spa, level, q),
                                spd: mathEngine.calculateStat(dittoBase.spd, ivs.spd, level, q),
                                spe: mathEngine.calculateStat(dittoBase.spe, ivs.spe, level, q),
                            };

                            caughtPokemon.maxHp = caughtPokemon.currentStats.hp;
                            caughtPokemon.currentHp = caughtPokemon.currentStats.hp;

                            const bst = dittoBase.hp + dittoBase.atk + dittoBase.def + dittoBase.spa + dittoBase.spd + dittoBase.spe;
                            const totalIV = ivs.hp + ivs.atk + ivs.def + ivs.spa + ivs.spd + ivs.spe;

                            caughtPokemon.bst = bst;
                            caughtPokemon.evxp = mathEngine.calculateEVXP(bst, level, q, totalIV);
                            caughtPokemon.evm = mathEngine.calculateEVM(bst, level, q, totalIV);
                            caughtPokemon.pp = mathEngine.calculatePP(bst, level, q, totalIV);
                            caughtPokemon.moves = this.getLearnsetMoves(dittoBase, level);

                            trackingName = "Ditto";
                            trackingTypes = ["Normal"];
                            delete caughtPokemon.isDisguisedDitto;
                        }

                        // Fix the level 100 jump bug by setting xp explicitly to the exact minimum needed for their captured level
                        caughtPokemon.xp = mathEngine.calculateTotalXP(caughtPokemon.level);
                        this.state.storage.push(caughtPokemon);
                        this.state.stats.caught++;
                        if (defeatedEncounter.qualityName === "Shiny") {
                            this.state.stats.shiniesCaught = (this.state.stats.shiniesCaught || 0) + 1;
                            if (!this.state.stats.caughtShiniesSpecies) this.state.stats.caughtShiniesSpecies = {};
                            this.state.stats.caughtShiniesSpecies[trackingName] = true;
                        }
                        // Track captures for Oak Tasks (Weak+, Regular+, Uncommon+, Rare+, Epic+)
                        let qName = defeatedEncounter.qualityName || "Regular";
                        if (["Weak", "Regular", "Uncommon", "Rare", "Epic", "Shiny", "Legendary", "Boss"].includes(qName)) {
                            this.state.stats.weakPlusCaptures = (this.state.stats.weakPlusCaptures || 0) + 1;
                        }
                        if (["Regular", "Uncommon", "Rare", "Epic", "Shiny", "Legendary", "Boss"].includes(qName)) {
                            this.state.stats.regularPlusCaptures = (this.state.stats.regularPlusCaptures || 0) + 1;
                        }
                        if (["Uncommon", "Rare", "Epic", "Shiny", "Legendary", "Boss"].includes(qName)) {
                            this.state.stats.uncommonPlusCaptures = (this.state.stats.uncommonPlusCaptures || 0) + 1;
                        }
                        if (["Rare", "Epic", "Shiny", "Legendary", "Boss"].includes(qName)) {
                            this.state.stats.rarePlusCaptures = (this.state.stats.rarePlusCaptures || 0) + 1;
                        }
                        if (["Epic", "Shiny", "Legendary", "Boss"].includes(qName)) {
                            this.state.stats.epicPlusCaptures = (this.state.stats.epicPlusCaptures || 0) + 1;
                        }

                        let sumIV = caughtPokemon.ivs.hp + caughtPokemon.ivs.atk + caughtPokemon.ivs.def + caughtPokemon.ivs.spa + caughtPokemon.ivs.spd + caughtPokemon.ivs.spe;
                        if (caughtPokemon.level > (this.state.stats.highestLevelCaptured || 0)) this.state.stats.highestLevelCaptured = caughtPokemon.level;
                        if (caughtPokemon.quality > (this.state.stats.highestQualityCaptured || 0)) this.state.stats.highestQualityCaptured = caughtPokemon.quality;
                        if (sumIV > (this.state.stats.highestSumIVCaptured || 0)) this.state.stats.highestSumIVCaptured = sumIV;

                        // Track Daily Challenges
                        if (typeof window !== 'undefined' && typeof window.trackDailyChallenge === 'function') {
                            window.trackDailyChallenge('catch_sum_iv', { sumIv: sumIV });
                            window.trackDailyChallenge('catch_level', { level: caughtPokemon.level });
                            window.trackDailyChallenge('catch_different_species', { species: caughtPokemon.name });
                            window.trackDailyChallenge('catch_rare', { quality: caughtPokemon.qualityName });
                            window.trackDailyChallenge('catch_weak', { quality: caughtPokemon.qualityName });
                            window.trackDailyChallenge('catch_species', { species: caughtPokemon.name });
                            window.trackDailyChallenge('catch_type', { types: caughtPokemon.types });
                            window.trackDailyChallenge('catch_ball_tier', { ball: this.activeEncounter.caughtBall });
                            if (this.state.currentRoute === 'Safari Zone') window.trackDailyChallenge('safari_catch');
                            if (this.state.currentRoute === 'Casino') window.trackDailyChallenge('casino_catch'); // Would need species tracking logic inside trackDailyChallenge if we fully implement it
                        }
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
                        this.state.stats.caughtSpecies[trackingName] = (this.state.stats.caughtSpecies[trackingName] || 0) + 1;

                        // Track specific typings
                        if (!this.state.stats.caughtSpecific) this.state.stats.caughtSpecific = {};
                        if (!this.state.stats.challengeCaughtSpecific) this.state.stats.challengeCaughtSpecific = {};

                        qName = defeatedEncounter.qualityName || "Regular";

                        if (trackingTypes) {
                              for (let t of trackingTypes) {
                                  this.state.stats.caughtSpecific[t] = (this.state.stats.caughtSpecific[t] || 0) + 1;
                                  let typeRarityKey = t + "_" + qName;
                                  let typeAnyKey = t + "_Any";
                                  this.state.stats.challengeCaughtSpecific[typeRarityKey] = (this.state.stats.challengeCaughtSpecific[typeRarityKey] || 0) + 1;
                                  this.state.stats.challengeCaughtSpecific[typeAnyKey] = (this.state.stats.challengeCaughtSpecific[typeAnyKey] || 0) + 1;
                              }
                        }

                        let speciesRarityKey = trackingName + "_" + qName;
                        this.state.stats.challengeCaughtSpecific[speciesRarityKey] = (this.state.stats.challengeCaughtSpecific[speciesRarityKey] || 0) + 1;
                    }
                };

                if (typeof window.triggerDefeatAnimation === 'function' && !this.gymState?.isActive) {
                    // Start visual capture sequence
                    window.triggerDefeatAnimation(defeatedEncounter, ballResult, processCapture);
                } else {
                    // Sync fallback
                    processCapture();
                }
            } else if (typeof window.triggerDefeatAnimation === 'function' && !this.gymState?.isActive) {
                // If ball wasn't used but we still defeated it, we just show a generic ghost fade out without a ball.
                window.triggerDefeatAnimation(defeatedEncounter, ballResult, () => {});
            }
        } else if (typeof window.triggerDefeatAnimation === 'function' && !this.gymState?.isActive) {
             // Generic ghost fade out without ball if autoCatch is disabled
             const defeatedEncounter = this.activeEncounter;
             window.triggerDefeatAnimation(defeatedEncounter, { used: false }, () => {});
        }

        // Daycare logic
        if (this.state.dayCareRef) {
            this.state.dayCareRef.tickBattle();
            this.state.dayCareRef.grantPassiveXP(evxp, (pkmn, amt) => this.grantXP(pkmn, amt, true));
        }

        // Loot Bonus Calculation
        const lootMultiplier = 1 + (0.0025 * (this.state.stats.greenCandies || 0));
        const moneyMultiplier = 1 + (0.01 * (this.state.stats.greenCandies || 0));

        // Award XP and Money (EV)
        this.grantXP(leader, evxp, false);
        if (typeof window !== 'undefined' && typeof window.trackDailyChallenge === 'function') window.trackDailyChallenge('gain_exp', { amount: evxp });
        let earned = Math.floor(evm * moneyMultiplier);
        this.state.trainer.money += earned;
        if (typeof window !== 'undefined' && typeof window.trackDailyChallenge === 'function') {
            window.trackDailyChallenge('earn_money', { amount: earned });
        }

        let lootedItemsThisBattle = {};

        // Loot drops for Stones
        let dropRate = 0;
        const evoStage = this.getEvolutionStage(this.activeEncounter.id);

        if (evoStage === 2) dropRate = 0.01;
        else if (evoStage >= 3) dropRate = 0.02;

        if (this.activeEncounter.qualityName === "Shiny" && evoStage >= 2) {
            dropRate = 1.0;
        }

        if (Math.random() < (dropRate * lootMultiplier) && this.activeEncounter.types && this.activeEncounter.types.length > 0) {
            const types = this.activeEncounter.types;
            const randomType = types[Math.floor(Math.random() * types.length)];
            const stoneName = `${randomType} Stone`;

            let dropQuantity = Math.floor(lootMultiplier);
            if (Math.random() < (lootMultiplier % 1)) dropQuantity += 1;

            if (!this.state.backpack.stones) this.state.backpack.stones = {};
            this.state.backpack.stones[stoneName] = (this.state.backpack.stones[stoneName] || 0) + dropQuantity;
            lootedItemsThisBattle[stoneName] = (lootedItemsThisBattle[stoneName] || 0) + dropQuantity;
        }

        // Loot drops for Balls and Potions
        let sumIV = 0;
        if (this.activeEncounter.ivs) {
            sumIV = this.activeEncounter.ivs.hp + this.activeEncounter.ivs.atk + this.activeEncounter.ivs.def +
                    this.activeEncounter.ivs.spa + this.activeEncounter.ivs.spd + this.activeEncounter.ivs.spe;
        }

        // Vitamin drops
        if (sumIV > 500 && this.activeEncounter?.quality > 1.6 && Math.random() < (0.05 * lootMultiplier)) {
            const vitamins = VITAMINS;
            const randomVitamin = vitamins[Math.floor(Math.random() * vitamins.length)];

            let dropQuantity = Math.floor(lootMultiplier);
            if (Math.random() < (lootMultiplier % 1)) dropQuantity += 1;

            if (!this.state.backpack.stones) this.state.backpack.stones = {};
            this.state.backpack.stones[randomVitamin] = (this.state.backpack.stones[randomVitamin] || 0) + dropQuantity;
        }

        let customDropChance = (2.0 * (sumIV / 600.0)) / 100.0;

        if (Math.random() < (customDropChance * lootMultiplier)) {
            let ballDrop = "Pokeball";
            let potionDrop = "Tiny Potion";
            let level = this.activeEncounter.level;

            if (level >= 76) { ballDrop = "Ultraball"; potionDrop = "Huge Potion"; }
            else if (level >= 56) { ballDrop = "Greatball"; potionDrop = "Big Potion"; }
            else if (level >= 36) { ballDrop = "Greatball"; potionDrop = "Regular Potion"; }
            else if (level >= 16) { ballDrop = "Pokeball"; potionDrop = "Small Potion"; }

            let dropQuantity = Math.floor(lootMultiplier);
            if (Math.random() < (lootMultiplier % 1)) dropQuantity += 1;

            if (Math.random() < 0.5) {
                const currentBalls = mathEngine.getCurrentCount(this.state, 'balls');
                const maxBalls = mathEngine.getCapacity(this.state, 'balls');
                if (currentBalls + dropQuantity > maxBalls && ballDrop !== 'Masterball') {
                    const spaceLeft = maxBalls - currentBalls;
                    if (spaceLeft > 0) {
                        if (!this.state.backpack.pokeballs[ballDrop]) this.state.backpack.pokeballs[ballDrop] = 0;
                        this.state.backpack.pokeballs[ballDrop] += spaceLeft;
                        lootedItemsThisBattle[ballDrop] = (lootedItemsThisBattle[ballDrop] || 0) + spaceLeft;
                    }
                    lootedItemsThisBattle[ballDrop + '_missed'] = 'missed';
                    if (typeof window !== 'undefined' && typeof window.showGameAlert === 'function' && !this.state.isTimeLapsing) window.showGameAlert("Can't collect Ball due to its maximum capacity", "view-battle-arena");
                } else {
                    if (!this.state.backpack.pokeballs[ballDrop]) this.state.backpack.pokeballs[ballDrop] = 0;
                    this.state.backpack.pokeballs[ballDrop] += dropQuantity;
                    lootedItemsThisBattle[ballDrop] = (lootedItemsThisBattle[ballDrop] || 0) + dropQuantity;
                }
            } else {
                const currentPotions = mathEngine.getCurrentCount(this.state, 'potions');
                const maxPotions = mathEngine.getCapacity(this.state, 'potions');
                if (currentPotions + dropQuantity > maxPotions) {
                    const spaceLeft = maxPotions - currentPotions;
                    if (spaceLeft > 0) {
                        if (!this.state.backpack.potions[potionDrop]) this.state.backpack.potions[potionDrop] = 0;
                        this.state.backpack.potions[potionDrop] += spaceLeft;
                        lootedItemsThisBattle[potionDrop] = (lootedItemsThisBattle[potionDrop] || 0) + spaceLeft;
                    }
                    lootedItemsThisBattle[potionDrop + '_missed'] = 'missed';
                    if (typeof window !== 'undefined' && typeof window.showGameAlert === 'function' && !this.state.isTimeLapsing) window.showGameAlert("Can't collect Potion due to its maximum capacity", "view-battle-arena");
                } else {
                    if (!this.state.backpack.potions[potionDrop]) this.state.backpack.potions[potionDrop] = 0;
                    this.state.backpack.potions[potionDrop] += dropQuantity;
                    lootedItemsThisBattle[potionDrop] = (lootedItemsThisBattle[potionDrop] || 0) + dropQuantity;
                }
            }
        }

        let itemDropChance = (2.0 * (sumIV / 600)) / 100.0;

        let level = this.activeEncounter.level || 1;
        let ballTierName = "Pokeball";
        let potionTierName = "Tiny Potion";

        if (level <= 15) {
            ballTierName = "Pokeball";
            potionTierName = "Tiny Potion";
        } else if (level <= 35) {
            ballTierName = "Pokeball";
            potionTierName = "Small Potion";
        } else if (level <= 55) {
            ballTierName = "Greatball";
            potionTierName = "Regular Potion";
        } else if (level <= 75) {
            ballTierName = "Greatball";
            // Potion is "Big" in config
            potionTierName = "Big Potion";
        } else {
            ballTierName = "Ultraball";
            potionTierName = "Huge Potion";
        }

        // Roll for Ball drop
        if (Math.random() < itemDropChance) {
            let ballDropQty = Math.floor(lootMultiplier);
            if (Math.random() < (lootMultiplier % 1)) ballDropQty += 1;

            const currentBalls = mathEngine.getCurrentCount(this.state, 'balls');
            const maxBalls = mathEngine.getCapacity(this.state, 'balls');
            if (currentBalls + ballDropQty > maxBalls && ballTierName !== 'Masterball') {
                const spaceLeft = maxBalls - currentBalls;
                if (spaceLeft > 0) {
                    if (!this.state.backpack.pokeballs) this.state.backpack.pokeballs = {};
                    this.state.backpack.pokeballs[ballTierName] = (this.state.backpack.pokeballs[ballTierName] || 0) + spaceLeft;
                    lootedItemsThisBattle[ballTierName] = (lootedItemsThisBattle[ballTierName] || 0) + spaceLeft;
                }
                lootedItemsThisBattle[ballTierName + '_missed'] = 'missed';
                if (typeof window !== 'undefined' && typeof window.showGameAlert === 'function' && !this.state.isTimeLapsing) window.showGameAlert("Can't collect Ball due to its maximum capacity", "view-battle-arena");
            } else {
                if (!this.state.backpack.pokeballs) this.state.backpack.pokeballs = {};
                this.state.backpack.pokeballs[ballTierName] = (this.state.backpack.pokeballs[ballTierName] || 0) + ballDropQty;
                lootedItemsThisBattle[ballTierName] = (lootedItemsThisBattle[ballTierName] || 0) + ballDropQty;
            }
        }

        // Roll for Potion drop
        if (Math.random() < itemDropChance) {
            let potionDropQty = Math.floor(lootMultiplier);
            if (Math.random() < (lootMultiplier % 1)) potionDropQty += 1;

            const currentPotions = mathEngine.getCurrentCount(this.state, 'potions');
            const maxPotions = mathEngine.getCapacity(this.state, 'potions');
            if (currentPotions + potionDropQty > maxPotions) {
                const spaceLeft = maxPotions - currentPotions;
                if (spaceLeft > 0) {
                    if (!this.state.backpack.potions) this.state.backpack.potions = {};
                    this.state.backpack.potions[potionTierName] = (this.state.backpack.potions[potionTierName] || 0) + spaceLeft;
                    lootedItemsThisBattle[potionTierName] = (lootedItemsThisBattle[potionTierName] || 0) + spaceLeft;
                }
                lootedItemsThisBattle[potionTierName + '_missed'] = 'missed';
                if (typeof window !== 'undefined' && typeof window.showGameAlert === 'function' && !this.state.isTimeLapsing) window.showGameAlert("Can't collect Potion due to its maximum capacity", "view-battle-arena");
            } else {
                if (!this.state.backpack.potions) this.state.backpack.potions = {};
                this.state.backpack.potions[potionTierName] = (this.state.backpack.potions[potionTierName] || 0) + potionDropQty;
                lootedItemsThisBattle[potionTierName] = (lootedItemsThisBattle[potionTierName] || 0) + potionDropQty;
            }
        }

        if (Object.keys(lootedItemsThisBattle).length > 0 && typeof window.showLoot === 'function' && !this.state.isTimeLapsing) {
            window.showLoot(lootedItemsThisBattle);
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
            const leaderSpeed = this.state.party[0].currentStats.spe;
            const speedMult = this.getSpeedMultiplier();
            let slideDelay = this.state.config.balance.baseSearchTime * 1000 * (100 / (100 + leaderSpeed)) * speedMult;
            slideDelay = Math.max(300, slideDelay) / this.state.settings.gameSpeed;
            this.generateEncounter(slideDelay);
        }
    }

    handleGymEnemyDefeat() {
        const gym = this.gymState.gym;
        const trainer = gym.trainers[this.gymState.currentTrainerIndex];

        this.gymState.currentPokemonIndex++;

        if (this.gymState.currentPokemonIndex >= trainer.team.length) {
            // Defeated trainer

            // Heal party and storage during Rest/End Phase
            this.state.party.forEach(p => p.currentHp = p.maxHp);
            if (this.state.storage) {
                this.state.storage.forEach(p => p.currentHp = p.maxHp);
            }

            this.gymState.currentTrainerIndex++;
            this.gymState.currentPokemonIndex = 0;
            this.gymState.inCombat = false; // Return to rest phase
            this.stop(); // Stop loop to show next button

            if (this.gymState.currentTrainerIndex >= gym.trainers.length) {
                // Defeated Gym!
                if (!this.state.trainer.badges) this.state.trainer.badges = 0;

                // Record the defeated boss
                if (!this.state.stats.defeatedBosses) this.state.stats.defeatedBosses = {};
                this.state.stats.defeatedBosses[gym.leader] = true;
                if (typeof window !== 'undefined' && typeof window.trackDailyChallenge === 'function') {
                    window.trackDailyChallenge('defeat_gym_leader');
                }

                const gymIndex = this.state.config.gyms.findIndex(g => g.name === gym.name);
                if (gymIndex !== -1 && this.state.trainer.badges === gymIndex) {
                    if (!this.state.stats.pendingGifts) this.state.stats.pendingGifts = [];
                    this.state.stats.pendingGifts.push({ type: 'badge', gymName: gym.name, gymIndex: gymIndex });
                    this.state.globalStats.hasSeenGiftIcon = false;
                }
            }
            this.updateGymUI();
            if (typeof window.switchView === 'function') {
                window.switchView("GYM");
            }
        } else {
            // Next pokemon
            const leaderSpeed = this.state.party[0].currentStats.spe;
            const speedMult = this.getSpeedMultiplier();
            let slideDelay = this.state.config.balance.baseSearchTime * 1000 * (100 / (100 + leaderSpeed)) * speedMult;
            slideDelay = Math.max(300, slideDelay) / this.state.settings.gameSpeed;
            this.generateGymEncounter(slideDelay);
        }
    }

    checkRouteUnlocks() {
        // Evaluate active challenge defeat trackers
        if (!this.state.config || !this.state.config.unlocks) return;
        if (!this.state.stats.activeChallenges || this.state.stats.activeChallenges.length === 0) return;

        if (!this._unlocksCache) {
            this._unlocksCache = new Map();
            for (let u of this.state.config.unlocks) {
                this._unlocksCache.set(u.areaId, u);
            }
        }

        for (let activeId of this.state.stats.activeChallenges) {
            let unlock = this._unlocksCache.get(activeId);
            if (!unlock) continue;

            let req = unlock.requirements;
            if (req.defeatCountRoute && req.defeatCountRoute.route === this.state.currentRoute) {
                this.state.stats.challengeRouteDefeats = (this.state.stats.challengeRouteDefeats || 0) + 1;
            }

            if (req.defeatSpecific && this.activeEncounter.name === req.defeatSpecific.name) {
                 if (!this.state.stats.challengeSpecificDefeats) this.state.stats.challengeSpecificDefeats = {};
                 this.state.stats.challengeSpecificDefeats[this.activeEncounter.name] = (this.state.stats.challengeSpecificDefeats[this.activeEncounter.name] || 0) + 1;
            }
        }
    }

    grantXP(pokemon, amount) {
        if (pokemon.level === 1) {
            amount = Math.ceil((mathEngine.calculateTotalXP(2) - mathEngine.calculateTotalXP(1)) / 3);
        } else if (pokemon.level === 2) {
            amount = Math.ceil((mathEngine.calculateTotalXP(3) - mathEngine.calculateTotalXP(2)) / 4);
        } else if (pokemon.level === 3) {
            amount = Math.ceil((mathEngine.calculateTotalXP(4) - mathEngine.calculateTotalXP(3)) / 5);
        } else if (pokemon.level === 4) {
            amount = Math.ceil((mathEngine.calculateTotalXP(5) - mathEngine.calculateTotalXP(4)) / 6);
        } else {
            let levelTaskTier = this.state.stats.levelTaskTier || 0;
            let bonus = 0;
            if (levelTaskTier >= 1 && pokemon.level < 15) bonus += 0.5;
            if (levelTaskTier >= 2 && pokemon.level < 30) bonus += 0.5;
            if (levelTaskTier >= 3 && pokemon.level < 45) bonus += 0.5;
            if (levelTaskTier >= 4 && pokemon.level < 60) bonus += 0.5;
            if (levelTaskTier >= 5 && pokemon.level < 75) bonus += 0.5;
            // Purple Candy XP Bonus
            const xpMultiplier = 1 + (0.02 * (this.state.stats.purpleCandies || 0));
            amount = amount * (1 + bonus) * xpMultiplier;
        }

        pokemon.xp += amount;

        // Check level up
        let newLvl = mathEngine.getLevelFromXP(pokemon.xp);
        if (newLvl > pokemon.level) {
            let levelsGained = newLvl - pokemon.level;
            pokemon.level = newLvl;

            // Trigger Level Up animation
            if (typeof window !== 'undefined' && typeof window.showLevelUp === 'function' && !this.state.isTimeLapsing) {
                window.showLevelUp(pokemon.name, newLvl, isDaycare);
            }

            // Track Daily Challenges
            if (typeof window !== 'undefined' && typeof window.trackDailyChallenge === 'function') {
                window.trackDailyChallenge('gain_levels', { amount: levelsGained });
            }
            // re-calc stats
            const pBase = this.getPokemonBase(pokemon.id);
            if (pBase) {
                const vitamins = pokemon.vitamins || {};
                pokemon.maxHp = mathEngine.calculateHP(pBase.hp, pokemon.ivs.hp, pokemon.level, pokemon.quality, vitamins.hp || 0);
                pokemon.currentStats.atk = mathEngine.calculateStat(pBase.atk, pokemon.ivs.atk, pokemon.level, pokemon.quality, vitamins.atk || 0);
                pokemon.currentStats.def = mathEngine.calculateStat(pBase.def, pokemon.ivs.def, pokemon.level, pokemon.quality, vitamins.def || 0);
                pokemon.currentStats.spa = mathEngine.calculateStat(pBase.spa, pokemon.ivs.spa, pokemon.level, pokemon.quality, vitamins.spa || 0);
                pokemon.currentStats.spd = mathEngine.calculateStat(pBase.spd, pokemon.ivs.spd, pokemon.level, pokemon.quality, vitamins.spd || 0);
                pokemon.currentStats.spe = mathEngine.calculateStat(pBase.spe, pokemon.ivs.spe, pokemon.level, pokemon.quality, vitamins.spe || 0);
                // heal by diff
                pokemon.currentHp += (pokemon.maxHp - pokemon.currentHp);

                // Learn new moves
                pokemon.moves = this.getLearnsetMoves(pBase, pokemon.level);
            }
        }
    }

    handleFaint() {
        this.isFainting = true;
        if (typeof window !== 'undefined' && typeof window.trackDailyChallenge === 'function') {
            window.trackDailyChallenge('defeat_endurance', { streak: 0 });
        }
        this.updateUI(); // This will trigger the fade out via UI logic

        // Wait 4 seconds (2s fade out + 2s extra wait)
        setTimeout(() => {
            // move fainted pokemon to end of party
            const fainted = this.state.party.shift();

            // Revert Ditto Transformation on Faint
            if (fainted && fainted.isTransformed && fainted.transformedIntoId) {
                fainted.isTransformed = false;
                fainted.transformedIntoId = null;
                fainted.transformedIntoName = null;
                fainted.id = 132;
                fainted.name = 'Ditto';

                const newBase = this.getPokemonBase(132);
                if (newBase) {
                    fainted.types = newBase.types;
                    fainted.bst = newBase.hp + newBase.atk + newBase.def + newBase.spa + newBase.spd + newBase.spe;

                    // Recalculate stats
                    fainted.maxHp = Math.floor((((2 * newBase.hp + fainted.ivs.hp) * fainted.level / 100) + fainted.level + 10) * fainted.quality);
                    fainted.currentStats.atk = Math.floor((((2 * newBase.atk + fainted.ivs.atk) * fainted.level / 100) + 5) * fainted.quality);
                    fainted.currentStats.def = Math.floor((((2 * newBase.def + fainted.ivs.def) * fainted.level / 100) + 5) * fainted.quality);
                    fainted.currentStats.spa = Math.floor((((2 * newBase.spa + fainted.ivs.spa) * fainted.level / 100) + 5) * fainted.quality);
                    fainted.currentStats.spd = Math.floor((((2 * newBase.spd + fainted.ivs.spd) * fainted.level / 100) + 5) * fainted.quality);
                    fainted.currentStats.spe = Math.floor((((2 * newBase.spe + fainted.ivs.spe) * fainted.level / 100) + 5) * fainted.quality);

                    fainted.currentHp = Math.min(fainted.currentHp, fainted.maxHp);

                    // Moves
                    let getLearnsetMoves = (pokemonBase, level) => {
                        let learned = [];
                        for (let i = 1; i <= level; i++) {
                            if (pokemonBase.learnset && pokemonBase.learnset[i]) {
                                const moveNames = pokemonBase.learnset[i];
                                for (const mName of moveNames) {
                                    const moveData = this.state.config.moves[mName];
                                    if (moveData && !learned.find(lm => lm.name === mName)) {
                                        learned.push(moveData);
                                    }
                                }
                            }
                        }
                        return learned.slice(-4);
                    };
                    fainted.moves = getLearnsetMoves(newBase, fainted.level);
                }
            }
            this.state.party.push(fainted);

            this.isFainting = false;

            if (this.state.party[0].currentHp <= 0) {
                this.handleWipeout();
            } else {
                // Prepare slide in duration for next pokemon
                const leaderSpeed = this.state.party[0].currentStats.spe;
                const speedMult = this.getSpeedMultiplier();
            let slideDelay = this.state.config.balance.baseSearchTime * 1000 * (100 / (100 + leaderSpeed)) * speedMult;
            slideDelay = Math.max(300, slideDelay) / this.state.settings.gameSpeed; // Arbitrary 1s slide in
                this.isPlayerPreSlidingIn = true;
                this.updateUI(); // Move offscreen

                setTimeout(() => {
                    this.isPlayerPreSlidingIn = false;
                    this.isPlayerSlidingIn = true;
                    this.slideDuration = slideDelay;
                    this.updateUI(); // Set position and start sliding animation

                    setTimeout(() => {
                        this.isPlayerSlidingIn = false;
                        this.updateUI();
                        this.scheduleTurn(); // restart turn with new leader
                    }, slideDelay);
                }, 50); // slight delay to ensure offscreen position is applied
            }
        }, 4000 / this.state.settings.gameSpeed);
    }

    handleWipeout() {
        this.stop();
        this.activeEncounter = null;

        if (this.state.party.length === 0) {
            // No pokemon were selected, do not display message of fainted team and go to professor lab
            const labRoute = (this.state.currentRegionName === 'Kanto' || this.state.currentRegionName === 'Johto') ? "Professor Oak Lab" : "Professor Lab";
            this.state.currentRoute = labRoute;

            if (this.gymState) {
                this.gymState.isActive = false;
                this.gymState.gym = null;
                this.gymState.inCombat = false;
            }
            if (typeof window.switchView === 'function') {
                window.switchView("PROF_OAK_LAB");
            }
            if (typeof window.navigateToLocation === 'function') {
                window.navigateToLocation(labRoute);
            }
            this.updateUI();
            return;
        }

        // Track faint
        this.state.stats.faints = (this.state.stats.faints || 0) + 1;

        // Penalty: deduct 10% gold
        const penalty = Math.floor(this.state.trainer.money * 0.1);
        this.state.trainer.money -= penalty;

        if (this.gymState && this.gymState.isActive) {
            // Reset gym state entirely if wiped out
            this.gymState.isActive = false;
            this.gymState.gym = null;
            this.gymState.inCombat = false;
            if (typeof window.switchView === 'function') {
                window.switchView("GYM");
            }

            // Return to poke center
            if (typeof window.navigateToLocation === 'function') {
                window.navigateToLocation("PokeCenter & PokeMarket");
            }
            this.updateUI();
            setTimeout(() => {
                alert(`All party fainted and you were charged $${penalty} to be brought back here. [Enter] Stay safe next time.`);
            }, 100);
        } else {
            this.state.currentRoute = "PokeCenter & PokeMarket";
            if (typeof window.navigateToLocation === 'function') {
                window.navigateToLocation("PokeCenter & PokeMarket");
            }
            this.updateUI();
            setTimeout(() => {
                alert(`All party fainted and you were charged $${penalty} to be brought back here. [Enter] Stay safe next time.`);
            }, 100);
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

    runFastForward(elapsedMs) {
        let results = {
            money: 0,
            caught: 0,
            shinies: 0,
            encounters: 0,
            shinyEncounters: 0,
            ballsUsed: 0,
            potionsUsed: 0,
            fainted: false,
            outOfMoney: false,
            simulatedTimeMs: 0,
            xpEarned: 0,
            itemsLooted: {},
            itemsMissed: {},
            caughtPokemonList: []
        };

        if (this.state.party.length === 0) return results;

        let totalSimTime = 0;
        let lastKnownMoney = this.state.trainer.money;
        let lastKnownCaught = this.state.stats.caught;
        let lastKnownShinies = this.state.stats.shiniesCaught || 0;
        let lastKnownEncounters = this.state.stats.battlesWon || 0; // Approximate encounters fought using battlesWon
        let lastKnownShinyEncounters = this.state.stats.shiniesSeen || 0;
        let initialLeaderXP = this.state.party[0] ? this.state.party[0].xp : 0;

        let initialBalls = this.state.settings.activeBallTier >= 0 ?
            this.state.backpack.pokeballs[this.state.config.balance.items.pokeballs[this.state.settings.activeBallTier].name] || 0 : 0;
        let initialPotions = this.state.settings.activePotionTier >= 0 ?
            this.state.backpack.potions[this.state.config.balance.items.potions[this.state.settings.activePotionTier].name] || 0 : 0;

        // Ensure we don't simulate too many frames and hang the browser if time is huge
        // Limit to approx max of 111h of simulation steps, but it evaluates fast
        const maxTime = Math.min(elapsedMs, 111 * 60 * 60 * 1000);
        const route = this.state.config.routes.find(r => r.name === this.state.currentRoute);

        if (!route && this.state.currentRoute !== "Casino - Eeveelutions" && !this.state.currentRoute.startsWith("Casino")) {
            return results; // Can't farm without a route
        }

        let encounterCost = 0;
        let requiresPayment = false;
        if (this.state.currentRoute === "Safari Zone") {
            encounterCost = this.state.config.balance.safariZonePrice || 500;
            requiresPayment = true;
        } else if (this.state.currentRoute && this.state.currentRoute.startsWith("Casino - ")) {
            const baseCostStandard = this.state.config.balance.casinoPrices?.standard || 10;
            const baseCostSpecial = this.state.config.balance.casinoPrices?.doubleShiny || 20;
            encounterCost = this.state.casinoDoubleShiny ? baseCostSpecial : baseCostStandard;
            requiresPayment = true;
        }

        while (totalSimTime < maxTime) {
            // Check if wiped out
            if (!this.state.party.some(p => p.currentHp > 0)) {
                results.fainted = true;
                break;
            }

            // Check if can pay for encounter
            if (requiresPayment) {
                if (this.state.trainer.money < encounterCost) {
                    results.outOfMoney = true;
                    break;
                }
                this.state.trainer.money -= encounterCost;
            }

            let leader = this.state.party[0];

            // Generate Encounter explicitly without UI triggers
            let pokemonBase;
            let level;
            let q;
            let ivs;

            // Simplify spawn logic for background
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
            if(!selectedSpawn) {
                totalSimTime += 5000;
                continue;
            }

            pokemonBase = this.getPokemonBase(selectedSpawn.pokemonId);
            level = Math.floor(Math.random() * (selectedSpawn.maxLevel - selectedSpawn.minLevel + 1)) + selectedSpawn.minLevel;

            if (this.state.currentRoute === "Route 1") {
                const playerLevel = leader.level || 1;
                level = Math.min(level, playerLevel);
            }

            q = mathEngine.generateQuality(this.state.stats, this.state.casinoDoubleShiny);

            if (!this.state.stats.seenSpecies) this.state.stats.seenSpecies = {};
            this.state.stats.seenSpecies[pokemonBase.name] = true;

            if (q.name === "Shiny") {
                if (this.state.currentRoute === 'Casino') {
                    if (typeof window !== 'undefined' && typeof window.trackDailyChallenge === 'function') window.trackDailyChallenge('casino_shiny');
                }
                this.state.stats.shiniesSeen = (this.state.stats.shiniesSeen || 0) + 1;
                if (!this.state.stats.seenShiniesSpecies) this.state.stats.seenShiniesSpecies = {};
                this.state.stats.seenShiniesSpecies[pokemonBase.name] = true;
            }
            ivs = mathEngine.generateIVs(this.state.stats, q.name === "Shiny");

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
            const evxp = mathEngine.calculateEVXP(bst, level, q.q, totalIV);
            const evm = mathEngine.calculateEVM(bst, level, q.q, totalIV);
            const pp = mathEngine.calculatePP(bst, level, q.q, totalIV);

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
                xp: mathEngine.calculateTotalXP(level),
                evxp: evxp, evm: evm, pp: pp,
                bst: bst,
                moves: this.getLearnsetMoves(pokemonBase, level),
                xp: mathEngine.calculateTotalXP(level)
            };

            let leaderSpe = leader.currentStats ? leader.currentStats.spe : 10;
            let enemySpe = this.activeEncounter.currentStats ? this.activeEncounter.currentStats.spe : 10;

            // Accurate search time to mimic Natural play at 1x speed
            let searchTime = this.state.config.balance.baseSearchTime * 1000 * (100 / (100 + leaderSpe));
            searchTime = Math.max(300, searchTime);

            // Add slide-in animation delay that occurs in Natural play (1000ms at 1x speed)
            searchTime += 1000;

            // Accurate Combat Simulation Loop
            let combatTime = 0;
            let leaderConsecutiveHeals = 0;

            // Leader and Enemy attack delays
            let leaderDelay = this.state.config.balance.baseAttackDelay * 1000 * (100 / (100 + leaderSpe));
            leaderDelay = Math.max(250, leaderDelay);
            let enemyDelay = this.state.config.balance.baseAttackDelay * 1000 * (100 / (100 + enemySpe));
            enemyDelay = Math.max(250, enemyDelay);

            // Which goes first
            let isLeaderFaster = leaderDelay <= enemyDelay;
            let firstDelay = Math.min(leaderDelay, enemyDelay);

            const executeSimulatedTurn = (attacker, defender, isLeader) => {
                if (isLeader && this.state.settings.autoPotion) {
                    let threshold = this.state.settings.autoPotionThreshold !== undefined ? this.state.settings.autoPotionThreshold : 25;
                    let hpPercentage = (attacker.currentHp / attacker.maxHp) * 100;

                    if (hpPercentage <= threshold) {
                        if (leaderConsecutiveHeals >= 3) {
                            leaderConsecutiveHeals = 0;
                        } else {
                            if (this.tryUsePotion(attacker)) {
                                leaderConsecutiveHeals++;
                                return true; // Potion takes the turn
                            }
                        }
                    } else {
                        leaderConsecutiveHeals = 0;
                    }
                }

                const move = this.getBestMove(attacker, defender);
                const isPhysical = move.category === 'Physical';
                const atkStat = isPhysical ? attacker.currentStats.atk : attacker.currentStats.spa;
                const defStat = isPhysical ? defender.currentStats.def : defender.currentStats.spd;
                const eff = this.getTypeEffectiveness(move.type, defender.types);

                const hit = mathEngine.calculateDamage(attacker.level, move.power, atkStat, defStat, eff, attacker.quality);
                defender.currentHp -= hit.damage;

                return false; // Not a potion, just an attack
            };

            while (leader.currentHp > 0 && this.activeEncounter.currentHp > 0) {
                let firstActor = isLeaderFaster ? leader : this.activeEncounter;
                let secondActor = isLeaderFaster ? this.activeEncounter : leader;

                combatTime += firstDelay;

                // First turn
                executeSimulatedTurn(firstActor, secondActor, isLeaderFaster);

                if (secondActor.currentHp <= 0) break;

                // Second turn (delay before second actor strikes)
                let secondDelay = isLeaderFaster ? enemyDelay : leaderDelay;
                combatTime += secondDelay;

                executeSimulatedTurn(secondActor, firstActor, !isLeaderFaster);
            }

            // Add UI defeat/faint fade-out delay mimicking natural play
            combatTime += 500;

            // End of combat logic
            if (leader.currentHp > 0) {
                // Out of combat insta-heal if threshold is met, identical to handleEnemyDefeat
                if (this.state.settings.autoPotion) {
                    let threshold = this.state.settings.autoPotionThreshold !== undefined ? this.state.settings.autoPotionThreshold : 25;
                    while ((leader.currentHp / leader.maxHp) * 100 <= threshold) {
                        if (!this.tryUsePotion(leader)) break;
                    }
                }

                this.state.stats.bonusCandyDefeats = (this.state.stats.bonusCandyDefeats || 0) + 1;
                if (this.state.stats.bonusCandyDefeats >= WHITE_CANDY_DEFEAT_REQUIREMENT) {
                    this.state.stats.bonusCandyDefeats -= WHITE_CANDY_DEFEAT_REQUIREMENT;
                    this.state.stats.whiteCandies = (this.state.stats.whiteCandies || 0) + 1;
                }

                // Track Daily Challenges
                if (typeof window !== 'undefined' && typeof window.trackDailyChallenge === 'function') {
                    window.trackDailyChallenge('defeat_level', { level: this.activeEncounter.level, playerLevel: leader.level });
                    window.trackDailyChallenge('defeat_type', { types: this.activeEncounter.types });
                    window.trackDailyChallenge('defeat_species', { species: this.activeEncounter.name });
                    window.trackDailyChallenge('defeat_underdog', { level: this.activeEncounter.level, playerLevel: leader.level });

                    if (this.state.stats.dailyChallenges) {
                        window.trackDailyChallenge('defeat_endurance', { streak: 1 });

                        if (this.state.currentRoute === this.state.stats.dailyChallenges.currentRoute) {
                            window.trackDailyChallenge('defeat_single_route', { streak: 2 });
                        } else {
                            this.state.stats.dailyChallenges.currentRoute = this.state.currentRoute;
                            window.trackDailyChallenge('defeat_single_route', { streak: 1 });
                        }
                    }

                    if (this.turnCount === 1) {
                         window.trackDailyChallenge('defeat_1_turn');
                    }
                }

                if (this.state.settings.autoCatch) {
                    const ballResult = this.throwPokeball();
                    if (ballResult.caught) {
                        let caughtPokemon = JSON.parse(JSON.stringify(this.activeEncounter));
                        let trackingName = this.activeEncounter.name;

                        if (caughtPokemon.isDisguisedDitto) {
                            const dittoBase = this.getPokemonBase(132);
                            caughtPokemon.id = 132;
                            caughtPokemon.name = "Ditto";
                            caughtPokemon.types = ["Normal"];

                            const level = caughtPokemon.level;
                            const ivs = caughtPokemon.ivs;
                            const q = caughtPokemon.quality;

                            caughtPokemon.currentStats = {
                                hp: mathEngine.calculateHP(dittoBase.hp, ivs.hp, level, q),
                                atk: mathEngine.calculateStat(dittoBase.atk, ivs.atk, level, q),
                                def: mathEngine.calculateStat(dittoBase.def, ivs.def, level, q),
                                spa: mathEngine.calculateStat(dittoBase.spa, ivs.spa, level, q),
                                spd: mathEngine.calculateStat(dittoBase.spd, ivs.spd, level, q),
                                spe: mathEngine.calculateStat(dittoBase.spe, ivs.spe, level, q),
                            };

                            caughtPokemon.maxHp = caughtPokemon.currentStats.hp;
                            caughtPokemon.currentHp = caughtPokemon.currentStats.hp;

                            const bst = dittoBase.hp + dittoBase.atk + dittoBase.def + dittoBase.spa + dittoBase.spd + dittoBase.spe;
                            const totalIV = ivs.hp + ivs.atk + ivs.def + ivs.spa + ivs.spd + ivs.spe;

                            caughtPokemon.bst = bst;
                            caughtPokemon.evxp = mathEngine.calculateEVXP(bst, level, q, totalIV);
                            caughtPokemon.evm = mathEngine.calculateEVM(bst, level, q, totalIV);
                            caughtPokemon.pp = mathEngine.calculatePP(bst, level, q, totalIV);
                            caughtPokemon.moves = this.getLearnsetMoves(dittoBase, level);

                            trackingName = "Ditto";
                            delete caughtPokemon.isDisguisedDitto;
                        }

                        if (!this.state.stats.caughtSpecies) this.state.stats.caughtSpecies = {};
                        this.state.stats.caughtSpecies[trackingName] = (this.state.stats.caughtSpecies[trackingName] || 0) + 1;

                        // Fix the level 100 jump bug by setting xp explicitly to the exact minimum needed for their captured level
                        caughtPokemon.xp = mathEngine.calculateTotalXP(caughtPokemon.level);
                        this.state.storage.push(caughtPokemon);
                        results.caughtPokemonList.push(caughtPokemon);
                        this.state.stats.caught++;
                        if (caughtPokemon.level > (this.state.stats.highestLevelCaptured || 0)) this.state.stats.highestLevelCaptured = caughtPokemon.level;
                        if (caughtPokemon.quality > (this.state.stats.highestQualityCaptured || 0)) this.state.stats.highestQualityCaptured = caughtPokemon.quality;
                        let sumIV_ZzZ = caughtPokemon.ivs.hp + caughtPokemon.ivs.atk + caughtPokemon.ivs.def + caughtPokemon.ivs.spa + caughtPokemon.ivs.spd + caughtPokemon.ivs.spe;
                        if (sumIV_ZzZ > (this.state.stats.highestSumIVCaptured || 0)) this.state.stats.highestSumIVCaptured = sumIV_ZzZ;

                        // Track Daily Challenges
                        if (typeof window !== 'undefined' && typeof window.trackDailyChallenge === 'function') {
                            window.trackDailyChallenge('catch_sum_iv', { sumIv: sumIV_ZzZ });
                            window.trackDailyChallenge('catch_level', { level: caughtPokemon.level });
                        }
                        if (this.activeEncounter.qualityName === "Shiny") this.state.stats.shiniesCaught = (this.state.stats.shiniesCaught || 0) + 1;
                        if (this.activeEncounter.qualityName === "Shiny") {
                            if (!this.state.stats.caughtShiniesSpecies) this.state.stats.caughtShiniesSpecies = {};
                            this.state.stats.caughtShiniesSpecies[trackingName] = true;
                        }
                    }
                }

                const lootMultiplier = 1 + (0.0025 * (this.state.stats.greenCandies || 0));
                const moneyMultiplier = 1 + (0.01 * (this.state.stats.greenCandies || 0));
                this.grantXP(leader, evxp, false);
        if (typeof window !== 'undefined' && typeof window.trackDailyChallenge === 'function') window.trackDailyChallenge('gain_exp', { amount: evxp });
                let earnedZzZ = Math.floor(evm * moneyMultiplier);
                this.state.trainer.money += earnedZzZ;
                if (typeof window !== 'undefined' && typeof window.trackDailyChallenge === 'function') {
                    window.trackDailyChallenge('earn_money', { amount: earnedZzZ });
                }

                // Add loot drops
                const lootTier = this.getLootTier();
                let dropRate = 0;
                const evoStage = this.getEvolutionStage(this.activeEncounter.id);

                if (evoStage === 2) dropRate = 0.005;
                else if (evoStage >= 3) dropRate = 0.01;

                if (this.activeEncounter.qualityName === "Shiny" && evoStage >= 2) {
                    dropRate = 1.0;
                }

                if (lootTier >= 3 && Math.random() < (dropRate * lootMultiplier) && this.activeEncounter.types && this.activeEncounter.types.length > 0) {
                    const types = this.activeEncounter.types;
                    const randomType = types[Math.floor(Math.random() * types.length)];
                    const stoneName = `${randomType} Stone`;

                    let dropQuantity = Math.floor(lootMultiplier);
                    if (Math.random() < (lootMultiplier % 1)) dropQuantity += 1;

                    if (!this.state.backpack.stones) this.state.backpack.stones = {};
                    this.state.backpack.stones[stoneName] = (this.state.backpack.stones[stoneName] || 0) + dropQuantity;
                    results.itemsLooted[stoneName] = (results.itemsLooted[stoneName] || 0) + dropQuantity;
                }

                let sumIV = 0;
                if (this.activeEncounter.ivs) {
                    sumIV = this.activeEncounter.ivs.hp + this.activeEncounter.ivs.atk + this.activeEncounter.ivs.def +
                            this.activeEncounter.ivs.spa + this.activeEncounter.ivs.spd + this.activeEncounter.ivs.spe;
                }

                // Vitamin drops
                if (lootTier >= 4 && sumIV > 500 && this.activeEncounter?.quality > 1.6 && Math.random() < (0.1 * lootMultiplier)) {
                    const vitamins = VITAMINS;
                    const randomVitamin = vitamins[Math.floor(Math.random() * vitamins.length)];

                    let dropQuantity = Math.floor(lootMultiplier);
                    if (Math.random() < (lootMultiplier % 1)) dropQuantity += 1;

                    if (!this.state.backpack.stones) this.state.backpack.stones = {};
                    this.state.backpack.stones[randomVitamin] = (this.state.backpack.stones[randomVitamin] || 0) + dropQuantity;
                    results.itemsLooted[randomVitamin] = (results.itemsLooted[randomVitamin] || 0) + dropQuantity;
                }

                let itemDropChance = (2.0 * (sumIV / 600)) / 100.0;
                let level = this.activeEncounter.level || 1;
                let ballTierName = "Pokeball";
                let potionTierName = "Tiny Potion";

                if (level <= 15) {
                    ballTierName = "Pokeball";
                    potionTierName = "Tiny Potion";
                } else if (level <= 35) {
                    ballTierName = "Pokeball";
                    potionTierName = "Small Potion";
                } else if (level <= 55) {
                    ballTierName = "Greatball";
                    potionTierName = "Regular Potion";
                } else if (level <= 75) {
                    ballTierName = "Greatball";
                    potionTierName = "Big Potion";
                } else {
                    ballTierName = "Ultraball";
                    potionTierName = "Huge Potion";
                }

                if (lootTier >= 2 && Math.random() < itemDropChance) {
                    let ballDropQty = Math.floor(lootMultiplier);
                    if (Math.random() < (lootMultiplier % 1)) ballDropQty += 1;

                    const currentBalls = mathEngine.getCurrentCount(this.state, 'balls');
                    const maxBalls = mathEngine.getCapacity(this.state, 'balls');
                    if (currentBalls + ballDropQty > maxBalls && ballTierName !== 'Masterball') {
                        const spaceLeft = maxBalls - currentBalls;
                        if (spaceLeft > 0) {
                            if (!this.state.backpack.pokeballs) this.state.backpack.pokeballs = {};
                            this.state.backpack.pokeballs[ballTierName] = (this.state.backpack.pokeballs[ballTierName] || 0) + spaceLeft;
                            results.itemsLooted[ballTierName] = (results.itemsLooted[ballTierName] || 0) + spaceLeft;
                        }
                        results.itemsMissed[ballTierName] = (results.itemsMissed[ballTierName] || 0) + (ballDropQty - spaceLeft);
                    } else {
                        if (!this.state.backpack.pokeballs) this.state.backpack.pokeballs = {};
                        this.state.backpack.pokeballs[ballTierName] = (this.state.backpack.pokeballs[ballTierName] || 0) + ballDropQty;
                        results.itemsLooted[ballTierName] = (results.itemsLooted[ballTierName] || 0) + ballDropQty;
                    }
                }

                if (lootTier >= 1 && Math.random() < itemDropChance) {
                    let potionDropQty = Math.floor(lootMultiplier);
                    if (Math.random() < (lootMultiplier % 1)) potionDropQty += 1;

                    const currentPotions = mathEngine.getCurrentCount(this.state, 'potions');
                    const maxPotions = mathEngine.getCapacity(this.state, 'potions');
                    if (currentPotions + potionDropQty > maxPotions) {
                        const spaceLeft = maxPotions - currentPotions;
                        if (spaceLeft > 0) {
                            if (!this.state.backpack.potions) this.state.backpack.potions = {};
                            this.state.backpack.potions[potionTierName] = (this.state.backpack.potions[potionTierName] || 0) + spaceLeft;
                            results.itemsLooted[potionTierName] = (results.itemsLooted[potionTierName] || 0) + spaceLeft;
                        }
                        results.itemsMissed[potionTierName] = (results.itemsMissed[potionTierName] || 0) + (potionDropQty - spaceLeft);
                    } else {
                        if (!this.state.backpack.potions) this.state.backpack.potions = {};
                        this.state.backpack.potions[potionTierName] = (this.state.backpack.potions[potionTierName] || 0) + potionDropQty;
                        results.itemsLooted[potionTierName] = (results.itemsLooted[potionTierName] || 0) + potionDropQty;
                    }
                }

                this.state.stats.battlesWon++;
            } else {
                leader.currentHp = 0;
                const fainted = this.state.party.shift();

                // Revert Ditto Transformation on Faint
                if (fainted && fainted.isTransformed && fainted.transformedIntoId) {
                    fainted.isTransformed = false;
                    fainted.transformedIntoId = null;
                    fainted.transformedIntoName = null;
                    fainted.id = 132;
                    fainted.name = 'Ditto';

                    const newBase = this.getPokemonBase(132);
                    if (newBase) {
                        fainted.types = newBase.types;
                        fainted.bst = newBase.hp + newBase.atk + newBase.def + newBase.spa + newBase.spd + newBase.spe;
                        fainted.maxHp = Math.floor((((2 * newBase.hp + fainted.ivs.hp) * fainted.level / 100) + fainted.level + 10) * fainted.quality);
                        fainted.currentStats.atk = Math.floor((((2 * newBase.atk + fainted.ivs.atk) * fainted.level / 100) + 5) * fainted.quality);
                        fainted.currentStats.def = Math.floor((((2 * newBase.def + fainted.ivs.def) * fainted.level / 100) + 5) * fainted.quality);
                        fainted.currentStats.spa = Math.floor((((2 * newBase.spa + fainted.ivs.spa) * fainted.level / 100) + 5) * fainted.quality);
                        fainted.currentStats.spd = Math.floor((((2 * newBase.spd + fainted.ivs.spd) * fainted.level / 100) + 5) * fainted.quality);
                        fainted.currentStats.spe = Math.floor((((2 * newBase.spe + fainted.ivs.spe) * fainted.level / 100) + 5) * fainted.quality);
                        fainted.currentHp = Math.min(fainted.currentHp, fainted.maxHp);

                        let learned = [];
                        for (let i = 1; i <= fainted.level; i++) {
                            if (newBase.learnset && newBase.learnset[i]) {
                                for (const mName of newBase.learnset[i]) {
                                    const moveData = this.state.config.moves[mName];
                                    if (moveData && !learned.find(lm => lm.name === mName)) learned.push(moveData);
                                }
                            }
                        }
                        fainted.moves = learned.slice(-4);
                    }
                }

                this.state.party.push(fainted);
            }

            totalSimTime += searchTime + combatTime;
        }

        results.money = this.state.trainer.money - lastKnownMoney;
        results.caught = this.state.stats.caught - lastKnownCaught;
        results.shinies = (this.state.stats.shiniesCaught || 0) - lastKnownShinies;
        results.encounters = (this.state.stats.battlesWon || 0) - lastKnownEncounters;
        results.shinyEncounters = (this.state.stats.shiniesSeen || 0) - lastKnownShinyEncounters;

        let finalBalls = this.state.settings.activeBallTier >= 0 ?
            this.state.backpack.pokeballs[this.state.config.balance.items.pokeballs[this.state.settings.activeBallTier].name] || 0 : 0;
        let finalPotions = this.state.settings.activePotionTier >= 0 ?
            this.state.backpack.potions[this.state.config.balance.items.potions[this.state.settings.activePotionTier].name] || 0 : 0;

        results.ballsUsed = Math.max(0, initialBalls - finalBalls);
        results.potionsUsed = Math.max(0, initialPotions - finalPotions);

        results.simulatedTimeMs = totalSimTime;
        results.xpEarned = this.state.party[0] ? this.state.party[0].xp - initialLeaderXP : 0;

        if (results.fainted) {
            // Track faint
            this.state.stats.faints = (this.state.stats.faints || 0) + 1;
            // Heal all
            this.state.party.forEach(p => p.currentHp = p.maxHp);
            this.state.currentRoute = "PokeCenter & PokeMarket";
        }

        return results;
    }
}

export default BattleSystem;