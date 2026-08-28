// src/battleSystem.js
import * as mathEngine from './mathEngine.js';

class BattleSystem {
    constructor(gameState, updateUI) {
        this.state = gameState; // reference to global game state
        this.updateUI = updateUI; // callback to update UI

        this.activeEncounter = null;
        this.combatLoop = null;
        this.isSearching = false;
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
            this.generateEncounter();
        }, delay);
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

        // Auto Throw Pokeball logic
        if (this.state.settings.autoCatch) {
            const caught = this.throwPokeball();
            if (caught) {
                this.state.box.push(JSON.parse(JSON.stringify(this.activeEncounter)));
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
        this.searchNext();
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

        // Return to poke center (simulated by just waiting and searching again for idle game)
        setTimeout(() => {
            this.searchNext();
        }, 5000 / this.state.settings.gameSpeed);

        this.updateUI();
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