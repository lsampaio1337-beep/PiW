import { state, globals } from '../state.js';
import * as mathEngine from "../mathEngine.js";
import { checkDailyRewardAvailable } from './calendar.js';

function getPokemonSpriteByName(name) {
    if (state.config.pokemonData) {
        let p = state.config.pokemonData.find(pd => pd.name === name);
        if (p) return `<img src="Assets/Pokemon Sprites/${p.id}.png" style="width: 30px; height: 30px; vertical-align: middle;">`;
    }
    return name;
}

function getGymBadgeByName(name) {
    const badgeMap = {
        "Brock": "Badge Kanto 1",
        "Misty": "Badge Kanto 2",
        "Lt. Surge": "Badge Kanto 3",
        "Erika": "Badge Kanto 4",
        "Koga": "Badge Kanto 5",
        "Sabrina": "Badge Kanto 6",
        "Blaine": "Badge Kanto 7",
        "Giovanni": "Badge Kanto 8"
    };
    if (badgeMap[name]) {
        return `<img src="Assets/Badges/${badgeMap[name]}.png" style="width: 30px; height: 30px; vertical-align: middle;">`;
    }
    return getPokemonSpriteByName(name); // Fallback to sprite for Elite Four or Boss Pokemon
}

export function getChallengeText() {
    if (!state.config.unlocks) return "None";

    let currentIndex = state.stats.completedChallenges || 0;
    if (currentIndex >= state.config.unlocks.length) return "All Challenges Completed";

    let unlock = state.config.unlocks[currentIndex];
    let req = unlock.requirements;
    let isMet = true;
    let textParts = [];

    const pokeballIcon = `<img src="Assets/Items/Balls/Pokeball.png" style="width: 20px; height: 20px; vertical-align: middle;">`;

    if (req.defeatCount) {
        if (state.stats.battlesWon < req.defeatCount) isMet = false;
        textParts.push(`<span style="position: relative; display: inline-block; vertical-align: middle;"><span style="color: red; font-size: 24px; font-weight: bold; text-shadow: 1px 1px 2px black;">❌</span></span> ${req.defeatCount} Pokemons (${state.stats.battlesWon}/${req.defeatCount})`);
    }
    if (req.catchSpecies) {
        for (let spec of req.catchSpecies) {
            let caughtCount = state.stats.caughtSpecies ? (state.stats.caughtSpecies[spec.species] || 0) : 0;
            if (caughtCount < spec.count) isMet = false;
            textParts.push(`${pokeballIcon} ${spec.count} ${getPokemonSpriteByName(spec.species)} (${caughtCount}/${spec.count})`);
        }
    }
    if (req.catchSpeciesAnyOf) {
         for (let specGroup of req.catchSpeciesAnyOf) {
             let caughtCount = 0;
             for (let s of specGroup.species) {
                 caughtCount += state.stats.caughtSpecies ? (state.stats.caughtSpecies[s] || 0) : 0;
             }
             if (caughtCount < specGroup.count) isMet = false;
             let sprites = specGroup.species.map(s => getPokemonSpriteByName(s)).join('/');
             textParts.push(`${pokeballIcon} ${specGroup.count} of ${sprites} (${caughtCount}/${specGroup.count})`);
         }
    }
    if (req.catchByRarityAndType) {
        let caughtCount = state.stats.caughtSpecific ? (state.stats.caughtSpecific[req.catchByRarityAndType.type] || 0) : 0;
        if (caughtCount < req.catchByRarityAndType.count) isMet = false;
        textParts.push(`${pokeballIcon} ${req.catchByRarityAndType.count} ${req.catchByRarityAndType.rarity} ${req.catchByRarityAndType.type}-types (${caughtCount}/${req.catchByRarityAndType.count})`);
    }
    if (req.defeatBoss) {
         isMet = false;
         let badgeOrSprite = getGymBadgeByName(req.defeatBoss.name);
         textParts.push(`<span style="position: relative; display: inline-block; vertical-align: middle;">${badgeOrSprite}<span style="position: absolute; top: 50%; left: 50%; transform: translate(-50%, -50%); color: red; font-size: 24px; font-weight: bold; text-shadow: 1px 1px 2px black;">❌</span></span> ${req.defeatBoss.name}`);
    }
    if (req.defeatBossesSequential) {
         isMet = false;
         textParts.push(`<span style="position: relative; display: inline-block; vertical-align: middle;"><span style="position: absolute; top: 50%; left: 50%; transform: translate(-50%, -50%); color: red; font-size: 24px; font-weight: bold; text-shadow: 1px 1px 2px black;">❌</span></span> Elite Four & Champion`);
    }
    if (req.reachPokemonLevel) {
         let highestLvl = 0;
         state.party.forEach(p => { if(p.level > highestLvl) highestLvl = p.level; });
         if (highestLvl < req.reachPokemonLevel.minLevel) isMet = false;
         textParts.push(`Reach Level ${req.reachPokemonLevel.minLevel} (${highestLvl}/${req.reachPokemonLevel.minLevel})`);
    }

    if (!isMet) {
        return textParts.join(" AND ");
    } else {
        return `<span style="color: green;">Complete</span> <button onclick="window.completeChallenge()" style="background-color: green; color: white; border: none; padding: 2px 5px; cursor: pointer; font-weight: bold; border-radius: 4px;">✔️</button>`;
    }
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

    const elChallengeText = document.getElementById('current-challenge-text');
    if (elChallengeText) elChallengeText.innerHTML = getChallengeText();

    const calendarNotification = document.getElementById('calendar-notification');
    if (calendarNotification) {
        if (checkDailyRewardAvailable()) {
            calendarNotification.style.display = 'block';
        } else {
            calendarNotification.style.display = 'none';
        }
    }
}
