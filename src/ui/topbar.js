import { state, globals } from '../state.js';
import * as mathEngine from "../mathEngine.js";
import { checkDailyRewardAvailable } from './calendar.js';

function getStatusHtml(isMet) {
    return isMet ? ` <span style="color: green;">[Complete]</span>` : "";
}

function countDisplay(current, required) {
    let displayCount = Math.min(current, required);
    return `(${displayCount}/${required})`;
}

function formatSpecies(name) {
    if (name === "NidoranF") return "Nidoran♀";
    if (name === "NidoranM") return "Nidoran♂";
    return name;
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
        let routeText = route === "Route 1" ? " on Route 1" : ` on ${route}`;
        textParts.push(`Defeat ${reqCount} Pokémon${routeText} ${countDisplay(defeats, reqCount)}${getStatusHtml(defeats >= reqCount)}`);
    }

    if (req.catchSpecies) {
        for (let spec of req.catchSpecies) {
            let caughtCount = state.stats.caughtSpecies ? (state.stats.caughtSpecies[spec.species] || 0) : 0;
            if (caughtCount < spec.count) isMet = false;
            textParts.push(`Catch ${spec.count} ${formatSpecies(spec.species)} ${countDisplay(caughtCount, spec.count)}${getStatusHtml(caughtCount >= spec.count)}`);
        }
    }

    if (req.catchSpeciesByRarity) {
        for (let spec of req.catchSpeciesByRarity) {
            let caughtKey = spec.species + "_" + spec.rarity;
            let caughtCount = state.stats.challengeCaughtSpecific ? (state.stats.challengeCaughtSpecific[caughtKey] || 0) : 0;
            if (caughtCount < spec.count) isMet = false;
            textParts.push(`Catch ${spec.count} ${spec.rarity} ${formatSpecies(spec.species)} ${countDisplay(caughtCount, spec.count)}${getStatusHtml(caughtCount >= spec.count)}`);
        }
    }

    if (req.catchSpeciesAnyOf) {
         for (let specGroup of req.catchSpeciesAnyOf) {
             let caughtCount = 0;
             for (let s of specGroup.species) {
                 caughtCount += state.stats.caughtSpecies ? (state.stats.caughtSpecies[s] || 0) : 0;
             }
             if (caughtCount < specGroup.count) isMet = false;
             let speciesList = specGroup.species.map(formatSpecies).join(' or ');
             textParts.push(`Catch ${specGroup.count} ${speciesList} ${countDisplay(caughtCount, specGroup.count)}${getStatusHtml(caughtCount >= specGroup.count)}`);
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
             let speciesList = specGroup.species.map(formatSpecies).join(' or ');
             textParts.push(`Catch ${specGroup.count} ${specGroup.rarity} ${speciesList} ${countDisplay(caughtCount, specGroup.count)}${getStatusHtml(caughtCount >= specGroup.count)}`);
         }
    }


    if (req.catchEachFromSlotMachine) {
        if (req.catchEachFromSlotMachine.machines) {
            req.catchEachFromSlotMachine.machines.forEach(machine => {
                let caughtAny = false;
                for (let s of machine) {
                    if (state.stats.caughtSpecies && state.stats.caughtSpecies[s] >= 1) {
                        caughtAny = true;
                        break;
                    }
                }
                if (!caughtAny) isMet = false;

                let machineStr = machine.map(formatSpecies).join(' or ');
                textParts.push(`Catch 1 ${machineStr} ${getStatusHtml(caughtAny)}`);
            });
        }
    }

    if (req.catchByRarityAndType) {
        let caughtKey = req.catchByRarityAndType.type + "_" + req.catchByRarityAndType.rarity;
        let caughtCount = state.stats.challengeCaughtSpecific ? (state.stats.challengeCaughtSpecific[caughtKey] || 0) : 0;
        if (caughtCount < req.catchByRarityAndType.count) isMet = false;
        textParts.push(`Catch ${req.catchByRarityAndType.count} ${req.catchByRarityAndType.rarity} ${req.catchByRarityAndType.type}-type ${countDisplay(caughtCount, req.catchByRarityAndType.count)}${getStatusHtml(caughtCount >= req.catchByRarityAndType.count)}`);
    }

    if (req.catchByType) {
        let typeKey = req.catchByType.type + "_Any";
        let caughtCount = state.stats.challengeCaughtSpecific ? (state.stats.challengeCaughtSpecific[typeKey] || 0) : 0;
        if (caughtCount < req.catchByType.count) isMet = false;
        textParts.push(`Catch ${req.catchByType.count} ${req.catchByType.type} Type Pokemons ${countDisplay(caughtCount, req.catchByType.count)}${getStatusHtml(caughtCount >= req.catchByType.count)}`);
    }

    if (req.earnBadge) {
        let hasBadge = state.trainer.badges >= req.earnBadge.badgeCount;
        if (!hasBadge) isMet = false;
        textParts.push(`Earn ${req.earnBadge.name}${getStatusHtml(hasBadge)}`);
    }

    if (req.defeatSpecific) {
        let defeated = state.stats.challengeSpecificDefeats ? (state.stats.challengeSpecificDefeats[req.defeatSpecific.name] || 0) : 0;
        if (defeated < req.defeatSpecific.count) isMet = false;
        textParts.push(`Defeat ${req.defeatSpecific.count} ${req.defeatSpecific.name} ${countDisplay(defeated, req.defeatSpecific.count)}${getStatusHtml(defeated >= req.defeatSpecific.count)}`);
    }

    if (req.defeatEliteFourAndChampion) {
        let beatenE4 = state.stats.defeatedBosses && (state.stats.defeatedBosses["Elite 4 Lorelei"] || state.stats.defeatedBosses["Lorelei"]) && state.stats.defeatedBosses["Champion Rival"];
        if (!beatenE4) isMet = false;
        textParts.push(`Defeat all Elite 4 and Defeat Champion${getStatusHtml(beatenE4)}`);
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

    const elChallengeText = document.getElementById('current-challenge-text');
    if (elChallengeText) elChallengeText.innerHTML = getChallengeText();

    const exclamation = document.getElementById('bonus-candy-exclamation');
    if (exclamation) {
        if (state.stats.bonusCandyDefeats >= 1000) {
            exclamation.style.display = 'block';
        } else {
            exclamation.style.display = 'none';
        }
    }
    const giftContainer = document.getElementById('gift-container');
    const giftNotification = document.getElementById('gift-notification');
    if (giftContainer && giftNotification) {
        if (state.stats.giftIconUnlocked) {
            giftContainer.style.display = 'inline-block';
        } else {
            giftContainer.style.display = 'none';
        }

        if (state.stats.pendingGifts && state.stats.pendingGifts.length > 0) {
            giftNotification.style.display = 'block';
        } else {
            giftNotification.style.display = 'none';
        }
    }

    const calendarNotification = document.getElementById('calendar-notification');
    if (calendarNotification) {
        if (checkDailyRewardAvailable()) {
            calendarNotification.style.display = 'block';
        } else {
            calendarNotification.style.display = 'none';
        }
    }

    // Oak Task Notification Tracking
    if (window.getOakTaskAvailableCount) {
        let currentOakTasksCount = window.getOakTaskAvailableCount();
        if (currentOakTasksCount > (state.stats.oakTasksAvailableCount || 0)) {
            state.stats.showMapOakNotification = true;
            state.stats.showOakMarkerPulse = true;
            state.stats.showOakLobbyNotification = true;
        } else if (currentOakTasksCount === 0) {
            state.stats.showMapOakNotification = false;
            state.stats.showOakMarkerPulse = false;
            state.stats.showOakLobbyNotification = false;
        }
        state.stats.oakTasksAvailableCount = currentOakTasksCount;
    }

    const mapNotification = document.getElementById('map-notification');
    if (mapNotification) {
        if (state.stats.hasUnseenMap || state.stats.showMapOakNotification) {
            mapNotification.style.display = 'block';
        } else {
            mapNotification.style.display = 'none';
        }
    }

    const challengesNotification = document.getElementById('challenges-notification');
    if (challengesNotification) {
        if (state.config && state.config.unlocks) {
            let currentIndex = state.stats.completedChallenges || 0;
            if (currentIndex < state.config.unlocks.length) {
                let unlock = state.config.unlocks[currentIndex];
                let cData = getChallengeData(unlock);
                if (cData.isMet) {
                    challengesNotification.style.display = 'block';
                } else {
                    challengesNotification.style.display = 'none';
                }
            } else {
                challengesNotification.style.display = 'none';
            }
        } else {
            challengesNotification.style.display = 'none';
        }
    }
}


export function getChallengeText() {
    let req = state.nextChallengeRequirement;
    if (!req) return "Next Challenge: None";

    let unlocks = "Unlocks: " + state.nextChallengeUnlocks;

    // Check if the area ID belongs to the "Extra Challenges" list.
    // The previous areaId usually implies the CURRENT challenge being evaluated.
    // But since `state.nextChallengeRequirement` doesn't explicitly store `areaId` directly... wait!
    // I can just rely on the unlocks text parsing or let the UI layer handle it.

    // Just reproducing my original simple `getChallengeText` logic:
    if (req.defeatCountRoute) {
        let route = req.defeatCountRoute.route;
        let count = req.defeatCountRoute.count;
        let defeats = state.stats.challengeRouteDefeats || 0;
        return `Defeat ${count} Pokémon on ${route} (${Math.min(defeats, count)}/${count}) - ${unlocks}`;
    }

    // Fallback if needed
    return `Next Challenge: Requirements not formatted. - ${unlocks}`;
}

export function getChallengeData() {
    return {
        req: state.nextChallengeRequirement,
        unlocks: state.nextChallengeUnlocks
    };
}
