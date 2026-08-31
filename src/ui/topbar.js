import { state, globals } from '../state.js';
import * as mathEngine from "../mathEngine.js";

export function getChallengeText() {
    if (!state.config.unlocks) return "None";

    for (let unlock of state.config.unlocks) {
        let req = unlock.requirements;
        let isMet = true;
        let textParts = [];

        if (req.defeatCount) {
            if (state.stats.battlesWon < req.defeatCount) isMet = false;
            textParts.push(`Defeat ${req.defeatCount} Pokemons (${state.stats.battlesWon}/${req.defeatCount})`);
        }
        if (req.catchSpecies) {
            for (let spec of req.catchSpecies) {
                let caughtCount = state.stats.caughtSpecies ? (state.stats.caughtSpecies[spec.species] || 0) : 0;
                if (caughtCount < spec.count) isMet = false;
                textParts.push(`Catch ${spec.count} ${spec.species} (${caughtCount}/${spec.count})`);
            }
        }
        if (req.catchSpeciesAnyOf) {
             for (let specGroup of req.catchSpeciesAnyOf) {
                 let caughtCount = 0;
                 for (let s of specGroup.species) {
                     caughtCount += state.stats.caughtSpecies ? (state.stats.caughtSpecies[s] || 0) : 0;
                 }
                 if (caughtCount < specGroup.count) isMet = false;
                 textParts.push(`Catch ${specGroup.count} of ${specGroup.species.join('/')} (${caughtCount}/${specGroup.count})`);
             }
        }
        if (req.catchByRarityAndType) {
            let caughtCount = state.stats.caughtSpecific ? (state.stats.caughtSpecific[req.catchByRarityAndType.type] || 0) : 0;
            if (caughtCount < req.catchByRarityAndType.count) isMet = false;
            textParts.push(`Catch ${req.catchByRarityAndType.count} ${req.catchByRarityAndType.rarity} ${req.catchByRarityAndType.type}-types (${caughtCount}/${req.catchByRarityAndType.count})`);
        }
        if (req.defeatBoss) {
             isMet = false;
             textParts.push(`Defeat Boss ${req.defeatBoss.name}`);
        }
        if (req.defeatBossesSequential) {
             isMet = false;
             textParts.push(`Defeat Elite Four & Champion`);
        }
        if (req.reachPokemonLevel) {
             let highestLvl = 0;
             state.party.forEach(p => { if(p.level > highestLvl) highestLvl = p.level; });
             if (highestLvl < req.reachPokemonLevel.minLevel) isMet = false;
             textParts.push(`Reach Level ${req.reachPokemonLevel.minLevel} (${highestLvl}/${req.reachPokemonLevel.minLevel})`);
        }

        if (!isMet) {
            return textParts.join(" AND ");
        }
    }

    return "All Challenges Completed";
}

export function updateTopbar() {
    const battleSystem = globals.battleSystem;

    // Handle UI Lock for Gym or no Pokemon
    const inGym = battleSystem && battleSystem.gymState && battleSystem.gymState.isActive;
    const noPokemon = state.party.length === 0 && state.storage.length === 0;

    const lockMenus = inGym || noPokemon;
    const navButtons = document.getElementById('nav-buttons');
    if (navButtons) {
        navButtons.style.pointerEvents = lockMenus ? 'none' : 'auto';
        navButtons.style.opacity = lockMenus ? '0.5' : '1.0';
    }

    // Top Nav
    const elTrainerLvl = document.getElementById('trainer-lvl');
    if (elTrainerLvl) elTrainerLvl.innerText = state.trainer.level;

    // Trainer XP relative to current level
    const currentTrainerXp = mathEngine.calculateTotalXP(state.trainer.level);
    const nextTrainerXp = mathEngine.calculateTotalXP(state.trainer.level + 1);
    const trainerXpProgress = Math.floor(state.trainer.xp) - currentTrainerXp;
    const trainerXpRequired = nextTrainerXp - currentTrainerXp;

    const elTrainerXp = document.getElementById('trainer-xp');
    if (elTrainerXp) elTrainerXp.innerText = `${trainerXpProgress}/${trainerXpRequired}`;

    const elTrainerMoney = document.getElementById('trainer-money');
    if (elTrainerMoney) elTrainerMoney.innerText = state.trainer.money;

    const elChallengeText = document.getElementById('current-challenge-text');
    if (elChallengeText) elChallengeText.innerText = getChallengeText();
}
