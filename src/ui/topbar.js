import { state, globals } from '../state.js';
import * as mathEngine from "../mathEngine.js";


export function getChallengeData(unlock) {
    if (!unlock) return { isMet: false, textParts: [] };
    let req = unlock.requirements;
    let isMet = true;
    let textParts = [];

    if (req.defeatCount) {
        if (state.stats.battlesWon < req.defeatCount) isMet = false;
        let status = (state.stats.battlesWon >= req.defeatCount) ? "[Complete]" : "[Incomplete]";
        textParts.push(`Defeat ${req.defeatCount} Pokemons (${state.stats.battlesWon}/${req.defeatCount}) <span style="color: ${status === '[Complete]' ? 'green' : 'red'};">${status}</span>`);
    }
    if (req.catchSpecies) {
        for (let spec of req.catchSpecies) {
            let caughtCount = state.stats.caughtSpecies ? (state.stats.caughtSpecies[spec.species] || 0) : 0;
            if (caughtCount < spec.count) isMet = false;
            let status = (caughtCount >= spec.count) ? "[Complete]" : "[Incomplete]";
            textParts.push(`Catch ${spec.count} ${spec.species} (${caughtCount}/${spec.count}) <span style="color: ${status === '[Complete]' ? 'green' : 'red'};">${status}</span>`);
        }
    }
    if (req.catchSpeciesAnyOf) {
         for (let specGroup of req.catchSpeciesAnyOf) {
             let caughtCount = 0;
             for (let s of specGroup.species) {
                 caughtCount += state.stats.caughtSpecies ? (state.stats.caughtSpecies[s] || 0) : 0;
             }
             if (caughtCount < specGroup.count) isMet = false;
             let speciesList = specGroup.species.join(' or ');
             let status = (caughtCount >= specGroup.count) ? "[Complete]" : "[Incomplete]";
             textParts.push(`Catch ${specGroup.count} of ${speciesList} (${caughtCount}/${specGroup.count}) <span style="color: ${status === '[Complete]' ? 'green' : 'red'};">${status}</span>`);
         }
    }
    if (req.catchByRarityAndType) {
        let caughtCount = state.stats.caughtSpecific ? (state.stats.caughtSpecific[req.catchByRarityAndType.type] || 0) : 0;
        if (caughtCount < req.catchByRarityAndType.count) isMet = false;
        let status = (caughtCount >= req.catchByRarityAndType.count) ? "[Complete]" : "[Incomplete]";
        textParts.push(`Catch ${req.catchByRarityAndType.count} ${req.catchByRarityAndType.rarity} ${req.catchByRarityAndType.type}-types (${caughtCount}/${req.catchByRarityAndType.count}) <span style="color: ${status === '[Complete]' ? 'green' : 'red'};">${status}</span>`);
    }
    if (req.defeatBoss) {
         if (!state.stats.defeatedBosses || !state.stats.defeatedBosses[req.defeatBoss.name]) {
             isMet = false;
         }
         let statusText = (state.stats.defeatedBosses && state.stats.defeatedBosses[req.defeatBoss.name]) ? "[Complete]" : "[Incomplete]";
         textParts.push(`Defeat ${req.defeatBoss.name} <span style="color: ${statusText === '[Complete]' ? 'green' : 'red'};">${statusText}</span>`);
    }
    if (req.defeatBossesSequential) {
         // Elite four logic is not fully implemented in state yet, so just check badges or a specific flag
         if (state.trainer.badges < 8 || !state.stats.defeatedBosses || !state.stats.defeatedBosses["Elite 4 Lorelei"]) {
             isMet = false;
         }
         let statusText = isMet ? "[Complete]" : "[Incomplete]";
         textParts.push(`Defeat Elite Four & Champion <span style="color: ${statusText === '[Complete]' ? 'green' : 'red'};">${statusText}</span>`);
    }
    if (req.reachPokemonLevel) {
         let highestLvl = 0;
         state.party.forEach(p => { if(p.level > highestLvl) highestLvl = p.level; });
         if (highestLvl < req.reachPokemonLevel.minLevel) isMet = false;
         let statusText = (highestLvl >= req.reachPokemonLevel.minLevel) ? "[Complete]" : "[Incomplete]";
         textParts.push(`Reach Level ${req.reachPokemonLevel.minLevel} (${highestLvl}/${req.reachPokemonLevel.minLevel}) <span style="color: ${statusText === '[Complete]' ? 'green' : 'red'};">${statusText}</span>`);
    }

    return { isMet, textParts };
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



}
