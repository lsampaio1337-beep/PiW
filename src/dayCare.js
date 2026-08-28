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

    addParentToSlot1(pokemonIndex, fromBox = true) {
        const sourceList = fromBox ? this.state.box : this.state.party;
        const pkmn = sourceList[pokemonIndex];

        if (!this.slot1.parent1) {
            this.slot1.parent1 = pkmn;
            sourceList.splice(pokemonIndex, 1);
            return true;
        } else if (!this.slot1.parent2) {
            // Must be identical species and Quality
            if (this.slot1.parent1.id === pkmn.id && this.slot1.parent1.qualityName === pkmn.qualityName) {
                this.slot1.parent2 = pkmn;
                sourceList.splice(pokemonIndex, 1);
                return true;
            } else {
                return false; // Criteria not met
            }
        }
        return false;
    }

    addPokemonToSlot2(pokemonIndex, fromBox = true) {
        const sourceList = fromBox ? this.state.box : this.state.party;
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
            // Passively receives 20% of battle XP
            this.slot2.pokemon.xp += amount * 0.20;
            // Simplified level up checking
        }
    }

    completeBreeding() {
        const p1 = this.slot1.parent1;
        const p2 = this.slot1.parent2;

        const merged = JSON.parse(JSON.stringify(p1));

        // Keeps highest IVs
        merged.ivs = {
            hp: Math.max(p1.ivs.hp, p2.ivs.hp),
            atk: Math.max(p1.ivs.atk, p2.ivs.atk),
            def: Math.max(p1.ivs.def, p2.ivs.def),
            spa: Math.max(p1.ivs.spa, p2.ivs.spa),
            spd: Math.max(p1.ivs.spd, p2.ivs.spd),
            spe: Math.max(p1.ivs.spe, p2.ivs.spe),
        };

        // Keeps highest XP
        merged.xp = Math.max(p1.xp, p2.xp);

        // Increase quality by 0.01 (Max 1.99)
        merged.quality = Math.min(1.99, Math.max(p1.quality, p2.quality) + 0.01);

        // Re-calculate stats based on new IVs and Quality would happen here

        this.state.box.push(merged);

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

        this.slot2.battles = 0;
    }
}

export default DayCare;