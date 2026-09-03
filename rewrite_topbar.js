const fs = require('fs');
const content = `import { state, globals } from '../state.js';
import * as mathEngine from "../mathEngine.js";

function getStatusHtml(isMet) {
    return isMet ? \` <span style="color: green;">[Complete]</span>\` : "";
}

function countDisplay(current, required) {
    let displayCount = Math.min(current, required);
    return \`(\${displayCount}/\${required})\`;
}

export function getChallengeData(unlock) {
    if (!unlock) return { isMet: false, textParts: [] };
    let req = unlock.requirements;
    let isMet = true;
    let textParts = [];

    if (req.defeatCountRoute) {
        let route = req.defeatCountRoute.route;
        let reqCount = req.defeatCountRoute.count;
        let defeats = state.stats.challengeRouteDefeats || 0;
        if (defeats < reqCount) isMet = false;
        let routeText = route === "Route 1" ? " on Route 1" : \` on \${route}\`;
        textParts.push(\`Defeat \${reqCount} Pokémon\${routeText} \${countDisplay(defeats, reqCount)}\${getStatusHtml(defeats >= reqCount)}\`);
    }

    if (req.catchSpecies) {
        for (let spec of req.catchSpecies) {
            let caughtCount = state.stats.caughtSpecies ? (state.stats.caughtSpecies[spec.species] || 0) : 0;
            if (caughtCount < spec.count) isMet = false;
            textParts.push(\`Catch \${spec.count} \${spec.species} \${countDisplay(caughtCount, spec.count)}\${getStatusHtml(caughtCount >= spec.count)}\`);
        }
    }

    if (req.catchSpeciesByRarity) {
        for (let spec of req.catchSpeciesByRarity) {
            let caughtKey = spec.species + "_" + spec.rarity;
            let caughtCount = state.stats.challengeCaughtSpecific ? (state.stats.challengeCaughtSpecific[caughtKey] || 0) : 0;
            if (caughtCount < spec.count) isMet = false;
            textParts.push(\`Catch \${spec.count} \${spec.rarity} \${spec.species} \${countDisplay(caughtCount, spec.count)}\${getStatusHtml(caughtCount >= spec.count)}\`);
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
             textParts.push(\`Catch \${specGroup.count} \${speciesList} \${countDisplay(caughtCount, specGroup.count)}\${getStatusHtml(caughtCount >= specGroup.count)}\`);
         }
    }

    if (req.catchSpeciesAnyOfByRarity) {
         for (let specGroup of req.catchSpeciesAnyOfByRarity) {
             let caughtCount = 0;
             for (let s of specGroup.species) {
                 let caughtKey = s + "_" + specGroup.rarity;
                 caughtCount += state.stats.challengeCaughtSpecific ? (state.stats.challengeCaughtSpecific[caughtKey] || 0) : 0;
             }
             if (caughtCount < specGroup.count) isMet = false;
             let speciesList = specGroup.species.join(' or ');
             textParts.push(\`Catch \${specGroup.count} \${specGroup.rarity} \${speciesList} \${countDisplay(caughtCount, specGroup.count)}\${getStatusHtml(caughtCount >= specGroup.count)}\`);
         }
    }

    if (req.catchByRarityAndType) {
        let caughtKey = req.catchByRarityAndType.type + "_" + req.catchByRarityAndType.rarity;
        let caughtCount = state.stats.challengeCaughtSpecific ? (state.stats.challengeCaughtSpecific[caughtKey] || 0) : 0;
        if (caughtCount < req.catchByRarityAndType.count) isMet = false;
        textParts.push(\`Catch \${req.catchByRarityAndType.count} \${req.catchByRarityAndType.rarity} \${req.catchByRarityAndType.type}-type \${countDisplay(caughtCount, req.catchByRarityAndType.count)}\${getStatusHtml(caughtCount >= req.catchByRarityAndType.count)}\`);
    }

    if (req.catchByType) {
        let typeKey = req.catchByType.type + "_Any";
        let caughtCount = state.stats.challengeCaughtSpecific ? (state.stats.challengeCaughtSpecific[typeKey] || 0) : 0;
        if (caughtCount < req.catchByType.count) isMet = false;
        textParts.push(\`Catch \${req.catchByType.count} \${req.catchByType.type} Type Pokemons \${countDisplay(caughtCount, req.catchByType.count)}\${getStatusHtml(caughtCount >= req.catchByType.count)}\`);
    }

    if (req.earnBadge) {
        let hasBadge = state.trainer.badges >= req.earnBadge.badgeCount;
        if (!hasBadge) isMet = false;
        textParts.push(\`Earn \${req.earnBadge.name}\${getStatusHtml(hasBadge)}\`);
    }

    if (req.defeatSpecific) {
        let defeated = state.stats.challengeSpecificDefeats ? (state.stats.challengeSpecificDefeats[req.defeatSpecific.name] || 0) : 0;
        if (defeated < req.defeatSpecific.count) isMet = false;
        textParts.push(\`Defeat \${req.defeatSpecific.count} \${req.defeatSpecific.name} \${countDisplay(defeated, req.defeatSpecific.count)}\${getStatusHtml(defeated >= req.defeatSpecific.count)}\`);
    }

    if (req.defeatEliteFourAndChampion) {
        let beatenE4 = state.stats.defeatedBosses && state.stats.defeatedBosses["Elite 4 Lorelei"] && state.stats.defeatedBosses["Champion Rival"];
        if (!beatenE4) isMet = false;
        textParts.push(\`Defeat all Elite 4 and Defeat Champion\${getStatusHtml(beatenE4)}\`);
    }

    return { isMet, textParts };
}

export function updateTopbar() {
    const battleSystem = globals.battleSystem;
    const inGym = battleSystem && battleSystem.gymState && battleSystem.gymState.isActive;
    const noPokemon = state.party.length === 0 && state.storage.length === 0;
    const lockMenus = inGym || noPokemon;
    const navButtons = document.getElementById('nav-buttons');
    if (navButtons) {
        navButtons.style.pointerEvents = lockMenus ? 'none' : 'auto';
        navButtons.style.opacity = lockMenus ? '0.5' : '1.0';
    }
}
`;
fs.writeFileSync('src/ui/topbar.js', content);
