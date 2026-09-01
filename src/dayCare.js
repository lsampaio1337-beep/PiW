// src/dayCare.js

class DayCare {
    constructor(gameState) {
        this.state = gameState;

        this.slot1 = {
            parent1: null,
            parent2: null,
            battles: 0,
            requiredBattles: 100
        };

        this.slot2 = {
            pokemon: null,
            battles: 0,
            requiredBattles: 100
        };
    }

    addParentToSlot1(pokemonIndex, fromStorage = true) {
        const sourceList = fromStorage ? this.state.storage : this.state.party;
        const pkmn = sourceList[pokemonIndex];

        if (!this.slot1.parent1) {
            this.slot1.parent1 = pkmn;
            sourceList.splice(pokemonIndex, 1);
            return true;
        } else if (!this.slot1.parent2) {
            // Must be identical species and have the exact same QValue
            // Note: qualityName check is replaced by strict numerical quality check based on the spec
            if (this.slot1.parent1.id === pkmn.id && Math.abs(this.slot1.parent1.quality - pkmn.quality) < 0.001) {
                this.slot1.parent2 = pkmn;
                sourceList.splice(pokemonIndex, 1);
                return true;
            } else {
                return false; // Criteria not met
            }
        }
        return false;
    }

    addPokemonToSlot2(pokemonIndex, fromStorage = true) {
        const sourceList = fromStorage ? this.state.storage : this.state.party;
        if (!this.slot2.pokemon) {
            this.slot2.pokemon = sourceList[pokemonIndex];
            sourceList.splice(pokemonIndex, 1);
            return true;
        }
        return false;
    }

    tickBattle() {
        // Breeding logic
        if (this.slot1.parent1 && this.slot1.parent2) {
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
        const p1 = this.slot1.parent1;
        const p2 = this.slot1.parent2;

        const sumIV1 = p1.ivs.hp + p1.ivs.atk + p1.ivs.def + p1.ivs.spa + p1.ivs.spd + p1.ivs.spe;
        const sumIV2 = p2.ivs.hp + p2.ivs.atk + p2.ivs.def + p2.ivs.spa + p2.ivs.spd + p2.ivs.spe;

        // Keep the parent with the highest SumIV (if tie, keep p1)
        const keptParent = (sumIV2 > sumIV1) ? p2 : p1;
        const merged = JSON.parse(JSON.stringify(keptParent));

        // Increase quality by 0.01 (Max 1.99)
        merged.quality = Math.min(1.99, merged.quality + 0.01);

        // Discard the other parent (it is not pushed back anywhere)

        // Re-calculate stats based on new IVs and Quality would happen here
        // Usually would call a stat calc method, assuming logic will be integrated via mathEngine later

        this.state.storage.push(merged);

        // Clear parents
        this.slot1.parent1 = null;
        this.slot1.parent2 = null;
        this.slot1.battles = 0;
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