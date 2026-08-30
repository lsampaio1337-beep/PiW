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
            contentArea.innerHTML = `
                <p>Next Opponent: ${trainer.name}</p>
                <button onclick="window.battleEngine.searchNext()" style="padding: 10px 20px; font-size: 16px; cursor: pointer;">Battle ${trainer.name}</button>
                <br><br>
                <button onclick="window.battleEngine.stopGymBattle()" style="padding: 5px 10px; background: #e74c3c; border: none; color: white; border-radius: 3px; cursor: pointer;">Flee Gym</button>
            `;
            // Temporary expose for the button
            window.battleEngine = this;
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

        const pokemonBase = this.state.config.pokemonData.find(p => p.id === selectedSpawn.pokemonId);
        let level = Math.floor(Math.random() * (selectedSpawn.maxLevel - selectedSpawn.minLevel + 1)) + selectedSpawn.minLevel;

        const q = mathEngine.generateQuality(this.state.stats.caught, this.state.stats.shiniesSeen);
        if (q.name === "Shiny") this.state.stats.shiniesSeen++;

        // Track seen for pokedex
        if (!this.state.stats.seenSpecies) this.state.stats.seenSpecies = {};
        this.state.stats.seenSpecies[pokemonBase.name] = true;


        // Route 1 Level Cap
        if (this.state.currentRoute === "Route 1") {
            const playerLevel = this.state.party[0] ? this.state.party[0].level : 1;
            if (playerLevel === 1) {
                level = 1;
            } else {
                level = Math.random() < 0.5 ? 1 : 2;
            }
        }

        const ivs = mathEngine.generateIVs(this.state.stats.caught, this.state.stats.shiniesCaught, q.name === "Shiny");

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
        defender.currentHp -= hit.damage;

        // Show floating damage
        const targetSide = attacker === leader ? 'enemy' : 'player';
        if (typeof window.showDamage === 'function') {
            window.showDamage(targetSide, hit.damage, hit.isCritical, move.name);
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

        // Catch Rate Booster based on caps
        let caps = this.state.stats.caught;
        let catchBoost = 0;
        if (caps >= 25000) catchBoost = 0.25;
        else if (caps >= 10000) catchBoost = 0.20;
        else if (caps >= 5000) catchBoost = 0.15;
        else if (caps >= 2500) catchBoost = 0.10;
        else if (caps >= 1000) catchBoost = 0.05;

        multiplier *= (1 + catchBoost);

        // Shiny catch multiplier
        if (this.activeEncounter.qualityName === "Shiny" && this.state.stats.shiniesSeen >= 10) {
            multiplier *= 2.0;
        }

        const chance = mathEngine.calculateCatchChance(this.activeEncounter.bst, this.activeEncounter.level, multiplier);

        return (Math.random() * 100) <= chance;
    }

    handleEnemyDefeat() {
        const leader = this.state.party[0];
        const ev = this.activeEncounter.ev;

        // Auto Throw Pokeball logic (disable in gyms)
        if (this.state.settings.autoCatch && (!this.gymState || !this.gymState.isActive)) {
            const caught = this.throwPokeball();
            if (caught) {
                let caughtPokemon = JSON.parse(JSON.stringify(this.activeEncounter));
                // Fix the level 100 jump bug by setting xp explicitly to the exact minimum needed for their captured level
                caughtPokemon.xp = mathEngine.calculateTotalXP(caughtPokemon.level);
                this.state.storage.push(caughtPokemon);
                this.state.stats.caught++;
                if (this.activeEncounter.qualityName === "Shiny") this.state.stats.shiniesCaught++;

                // Track species catches for unlocks
                if (!this.state.stats.caughtSpecies) this.state.stats.caughtSpecies = {};
                this.state.stats.caughtSpecies[this.activeEncounter.name] = (this.state.stats.caughtSpecies[this.activeEncounter.name] || 0) + 1;

                // Track specific typings
                if (!this.state.stats.caughtSpecific) this.state.stats.caughtSpecific = {};
                if (this.activeEncounter.types) {
                     for (let t of this.activeEncounter.types) {
                          this.state.stats.caughtSpecific[t] = (this.state.stats.caughtSpecific[t] || 0) + 1;
                     }
                }
                // console.log(`Caught ${this.activeEncounter.name}!`);
            }
        }

        // Daycare logic
        if (this.state.dayCareRef) {
            this.state.dayCareRef.tickBattle();
            this.state.dayCareRef.grantPassiveXP(ev);
        }

        // Award XP and Money (EV)
        this.grantXP(leader, ev);
        this.state.trainer.money += Math.floor(ev);

        this.state.stats.battlesWon++;
        this.checkRouteUnlocks();

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
                this.state.trainer.badges++;

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