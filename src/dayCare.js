// src/dayCare.js

class DayCare {
    constructor(gameState) {
        this.state = gameState;

        this.slot1 = {
            pokemon: null,
            isBreeding: false,
            isFinished: false,
            battles: 0,
            requiredBattles: 100
        };

        this.slot2 = {
            pokemon: null,
            battles: 0,
            requiredBattles: 100
        };
    }

    tickBattle() {
        // Breeding logic
        if (this.slot1.pokemon && this.slot1.isBreeding && !this.slot1.isFinished) {
            this.slot1.battles++;
            if (this.slot1.battles >= this.slot1.requiredBattles) {
                this.completeBreeding();
            }
        }

        // Training logic
        if (this.slot2.pokemon) {
            this.slot2.battles++;
            if (this.slot2.battles >= this.slot2.requiredBattles) {
                this.completeTrainingCycle();
            }
        }
    }

    grantPassiveXP(amount) {
        if (this.slot2.pokemon) {
            // Passively receives 50% of battle XP
            this.slot2.pokemon.xp += amount * 0.50;
            // Simplified level up checking
        }
    }

    completeBreeding() {
        const p = this.slot1.pokemon;
        if (!p) return;

        // Increase quality by 0.01 (Max 1.99)
        p.quality = Math.min(1.99, p.quality + 0.01);

        // Map Quality Tier if Q >= 1.5, 1.25, etc.
        if (p.quality >= 1.99) {
            p.qualityName = "Perfect";
        } else if (p.quality >= 1.70) { // Generic threshold updates could go here
            p.qualityName = p.qualityName;
        }

        // Let UI know it's finished
        this.slot1.isFinished = true;
        this.slot1.isBreeding = false;

        // Note: the pokemon stays in state.breeding array (this.slot1.pokemon is a ref)
        // until the player moves it manually.
    }

    completeTrainingCycle() {
        const pkmn = this.slot2.pokemon;
        const totalIV = pkmn.ivs.hp + pkmn.ivs.atk + pkmn.ivs.def + pkmn.ivs.spa + pkmn.ivs.spd + pkmn.ivs.spe;

        if (totalIV < 600) {
            const sub100Stats = [];
            for (const stat in pkmn.ivs) {
                if (pkmn.ivs[stat] < 100) sub100Stats.push(stat);
            }

            if (sub100Stats.length > 0) {
                const randStat = sub100Stats[Math.floor(Math.random() * sub100Stats.length)];
                pkmn.ivs[randStat]++;
            }
        }

        // Track how many times this pokemon has completed a training cycle
        if (!pkmn.trainingCyclesCompleted) {
            pkmn.trainingCyclesCompleted = 0;
        }
        pkmn.trainingCyclesCompleted++;

        this.slot2.battles = 0;
    }
}

export default DayCare;