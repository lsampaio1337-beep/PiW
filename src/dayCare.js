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
        this._tickBreeding();
        this._tickTraining();
    }

    _getTotalIV(pkmn) {
        return pkmn.ivs.hp + pkmn.ivs.atk + pkmn.ivs.def + pkmn.ivs.spa + pkmn.ivs.spd + pkmn.ivs.spe;
    }

    _tickBreeding() {
        if (!this.slot1.pokemon || !this.slot1.isBreeding || this.slot1.isFinished) return;

        this.slot1.battles++;
        if (this.slot1.battles >= this.slot1.requiredBattles) {
            this.completeBreeding();
        }
    }

    _tickTraining() {
        if (!this.slot2.pokemon) return;

        const pkmn = this.slot2.pokemon;
        const totalIV = this._getTotalIV(pkmn);

        // If we reach cap organically, keep it frozen
        if (totalIV >= 600) {
            this.slot2.battles = this.slot2.requiredBattles;
            return;
        }

        // Only increment battles if we haven't hit the cap
        this.slot2.battles++;
        if (this.slot2.battles >= this.slot2.requiredBattles) {
            this.completeTrainingCycle();
        }
    }

    grantPassiveXP(amount, grantXpCallback) {
        if (!this.slot2.pokemon || !this.state.stats?.upgrades?.daycareTier || this.state.stats.upgrades.daycareTier < 2) {
            return;
        }

        // Passively receives 50% of battle XP. Use battleSystem's grantXP for correct level up handling.
        const xpGained = Number((amount * 0.50).toFixed(2));
        if (grantXpCallback) {
            grantXpCallback(this.slot2.pokemon, xpGained);
        } else {
            this.slot2.pokemon.xp = Number((this.slot2.pokemon.xp + xpGained).toFixed(2));
        }
    }

    completeBreeding() {
        const p = this.slot1.pokemon;
        if (!p) return;

        // Increase quality by a random number between 0 and 0.05
        // Default: 0, 0.01, 0.02, 0.03. With Upgrade 1: 0, 0.01, 0.02, 0.03, 0.04, 0.05
        const hasQBoost = this.state.stats && this.state.stats.upgrades && this.state.stats.upgrades.daycareTier >= 1;
        const maxQIncrease = hasQBoost ? 6 : 4;

        const randomVal = typeof crypto !== 'undefined' ? (crypto.getRandomValues(new Uint32Array(1))[0] / (0xFFFFFFFF + 1)) : Math.random();
        const randIncrease = Math.floor(randomVal * maxQIncrease) / 100;

        // Store original quality to calculate exact bonus later
        const oldQuality = p.quality;

        // Fix floating point precision
        p.quality = Number((p.quality + randIncrease).toFixed(2));

        const hasAdvancedBreeder = this.state.stats && this.state.stats.upgrades && this.state.stats.upgrades.daycareTier >= 3;
        const maxQuality = hasAdvancedBreeder ? 1.99 : 1.80;

        // Prevent quality from exceeding cap via breeding, but do not downgrade existing high quality
        if (oldQuality < maxQuality) {
            p.quality = Math.min(maxQuality, p.quality);
        } else {
            p.quality = oldQuality; // If they are already above the cap, they gain 0 bonus
        }

        // Fix floating point precision
        p.quality = Number(p.quality.toFixed(2));

        p.lastQBonus = Number((p.quality - oldQuality).toFixed(2));

        // Map Quality Tier if Q >= 1.5, 1.25, etc.
        if (p.quality >= 1.81) {
            p.qualityName = "Legendary";
        } else if (p.quality >= 1.60) {
            p.qualityName = "Epic";
        } else if (p.quality >= 1.40) {
            p.qualityName = "Rare";
        } else if (p.quality >= 1.20) {
            p.qualityName = "Uncommon";
        } else if (p.quality >= 1.00) {
            p.qualityName = "Regular";
        } else {
            p.qualityName = "Weak";
        }

        // Let UI know it's finished
        this.slot1.isFinished = true;
        if (typeof window !== 'undefined' && typeof window.trackDailyChallenge === 'function') window.trackDailyChallenge('hatch_eggs');
        this.slot1.isBreeding = false;

        // Note: the pokemon stays in state.breeding array (this.slot1.pokemon is a ref)
        // until the player moves it manually.
    }

    _gainTrainingIVs(pkmn) {
        let ivsToGain = 1;
        if (this.state.stats?.upgrades?.daycareTier >= 4) {
            const chance = typeof crypto !== 'undefined' ? (crypto.getRandomValues(new Uint32Array(1))[0] / (0xFFFFFFFF + 1)) : Math.random();
            if (chance < 0.20) {
                ivsToGain = 2;
            }
        }

        for (let i = 0; i < ivsToGain; i++) {
            const currentTotalIV = this._getTotalIV(pkmn);
            if (currentTotalIV >= 600) break;

            const sub100Stats = [];
            for (const stat in pkmn.ivs) {
                if (pkmn.ivs[stat] < 100) sub100Stats.push(stat);
            }

            if (sub100Stats.length > 0) {
                const randomVal = typeof crypto !== 'undefined' ? (crypto.getRandomValues(new Uint32Array(1))[0] / (0xFFFFFFFF + 1)) : Math.random();
                const randStat = sub100Stats[Math.floor(randomVal * sub100Stats.length)];
                pkmn.ivs[randStat]++;
            }
        }
    }

    completeTrainingCycle() {
        const pkmn = this.slot2.pokemon;
        const totalIV = this._getTotalIV(pkmn);

        if (totalIV < 600) {
            this._gainTrainingIVs(pkmn);
        }

        // Track how many times this pokemon has completed a training cycle
        if (!pkmn.trainingCyclesCompleted) {
            pkmn.trainingCyclesCompleted = 0;
        }
        pkmn.trainingCyclesCompleted++;
        if (typeof window !== 'undefined' && typeof window.trackDailyChallenge === 'function') window.trackDailyChallenge('daycare_iv', { amount: 1 });

        // Reset progress only if we are still under the cap
        const newTotalIV = this._getTotalIV(pkmn);
        this.slot2.requiredBattles = (pkmn.quality >= 2.0) ? newTotalIV * 2 : newTotalIV;
        if (this.slot2.requiredBattles === 0) this.slot2.requiredBattles = 1;

        if (newTotalIV >= 600) {
            this.slot2.battles = this.slot2.requiredBattles;
        } else {
            this.slot2.battles = 0;
        }
    }
}

export default DayCare;