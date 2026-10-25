import { state, globals, checkFinalChallengeCompleted } from '../state.js';
import { checkDailyRewardAvailable, checkAnyDailyChallengeCompleted } from './calendar.js';

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

    if (req.catchSpeciesByQuality) {
        for (let spec of req.catchSpeciesByQuality) {
            let caughtKey = spec.species + "_" + spec.quality;
            let caughtCount = state.stats.challengeCaughtSpecific ? (state.stats.challengeCaughtSpecific[caughtKey] || 0) : 0;
            if (caughtCount < spec.count) isMet = false;
            textParts.push(`Catch ${spec.count} ${spec.quality} ${formatSpecies(spec.species)} ${countDisplay(caughtCount, spec.count)}${getStatusHtml(caughtCount >= spec.count)}`);
        }
    }

    if (req.catchSpeciesByQuality) {
        for (let spec of req.catchSpeciesByQuality) {
            let caughtKey = spec.species + "_" + spec.quality;
            let caughtCount = state.stats.challengeCaughtSpecific ? (state.stats.challengeCaughtSpecific[caughtKey] || 0) : 0;
            if (caughtCount < spec.count) isMet = false;
            textParts.push(`Catch ${spec.count} ${spec.quality} ${formatSpecies(spec.species)} ${countDisplay(caughtCount, spec.count)}${getStatusHtml(caughtCount >= spec.count)}`);
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

    if (req.catchSpeciesAnyOfByQuality) {
         for (let specGroup of req.catchSpeciesAnyOfByQuality) {
             let caughtCount = 0;
             for (let s of specGroup.species) {
                 let caughtKey = s + "_" + specGroup.quality;
                 caughtCount += state.stats.challengeCaughtSpecific ? (state.stats.challengeCaughtSpecific[caughtKey] || 0) : 0;
             }
             if (caughtCount < specGroup.count) isMet = false;
             let speciesList = specGroup.species.map(formatSpecies).join(' or ');
             textParts.push(`Catch ${specGroup.count} ${specGroup.quality} ${speciesList} ${countDisplay(caughtCount, specGroup.count)}${getStatusHtml(caughtCount >= specGroup.count)}`);
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

    if (req.catchSpeciesUniqueCount) {
        let uniqueCaught = state.stats.caughtSpeciesCount || 0;
        if (uniqueCaught < req.catchSpeciesUniqueCount) isMet = false;
        textParts.push(`Capture ${req.catchSpeciesUniqueCount} different Pokémons (${uniqueCaught}/${req.catchSpeciesUniqueCount})${getStatusHtml(uniqueCaught >= req.catchSpeciesUniqueCount)}`);
    }

    if (req.catchByQuality) {
        let qualities = ["Weak", "Regular", "Uncommon", "Rare", "Epic", "Shiny", "Legendary", "Mythical"];
        let targetQualities = [req.catchByQuality.quality];

        let displayQuality = req.catchByQuality.quality;
        if (req.catchByQuality.quality.endsWith('+')) {
            let baseQuality = req.catchByQuality.quality.slice(0, -1);
            let idx = qualities.indexOf(baseQuality);
            if (idx !== -1) {
                targetQualities = qualities.slice(idx);
            }
        }

        let caughtCount = 0;
        if (state.stats.challengeCaughtSpecific) {
            for (let r of targetQualities) {
                caughtCount += state.stats.challengeCaughtSpecific["Any_" + r] || 0;
            }
        }

        if (caughtCount < req.catchByQuality.count) isMet = false;
        textParts.push(`Catch ${req.catchByQuality.count} ${displayQuality} Pokémon from ${unlock.areaId} ${countDisplay(caughtCount, req.catchByQuality.count)}${getStatusHtml(caughtCount >= req.catchByQuality.count)}`);
    }

    if (req.catchByQualityAndType) {
        let caughtKey = req.catchByQualityAndType.type + "_" + req.catchByQualityAndType.quality;
        let caughtCount = state.stats.challengeCaughtSpecific ? (state.stats.challengeCaughtSpecific[caughtKey] || 0) : 0;
        if (caughtCount < req.catchByQualityAndType.count) isMet = false;
        textParts.push(`Catch ${req.catchByQualityAndType.count} ${req.catchByQualityAndType.quality} ${req.catchByQualityAndType.type}-type ${countDisplay(caughtCount, req.catchByQualityAndType.count)}${getStatusHtml(caughtCount >= req.catchByQualityAndType.count)}`);
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

    if (req.defeatMultipleSpecific) {
        for (let target of req.defeatMultipleSpecific) {
            let key = target.name || target.pokemonId;
            if (key === '__proto__' || key === 'constructor' || key === 'prototype') continue;
            let defeated = state.stats.challengeSpecificDefeats ? (state.stats.challengeSpecificDefeats[key] || 0) : 0;
            if (defeated < target.count) isMet = false;
            let displayName = target.name || target.pokemonId;
            textParts.push(`Defeat ${target.count} ${displayName} ${countDisplay(defeated, target.count)}${getStatusHtml(defeated >= target.count)}`);
        }
    }

    if (req.defeatEliteFourAndChampion) {
        let beatenE4 = state.stats.defeatedBosses && (state.stats.defeatedBosses["Pokemon League Lorelei"] || state.stats.defeatedBosses["Lorelei"]) && state.stats.defeatedBosses["Champion Rival"];
        if (!beatenE4) isMet = false;
        textParts.push(`Win Kanto Pokémon League${getStatusHtml(beatenE4)}`);
    }

    if (req.defeatJohtoChampion) {
        let beaten = state.stats.defeatedBosses && state.stats.defeatedBosses["Johto Champion"];
        if (!beaten) isMet = false;
        textParts.push(`Win Johto Pokémon League${getStatusHtml(beaten)}`);
    }
    if (req.defeatHoennChampion) {
        let beaten = state.stats.defeatedBosses && state.stats.defeatedBosses["Hoenn Champion"];
        if (!beaten) isMet = false;
        textParts.push(`Win Hoenn Pokémon League${getStatusHtml(beaten)}`);
    }
    if (req.defeatSinnohChampion) {
        let beaten = state.stats.defeatedBosses && state.stats.defeatedBosses["Sinnoh Champion"];
        if (!beaten) isMet = false;
        textParts.push(`Win Sinnoh Pokémon League${getStatusHtml(beaten)}`);
    }
    if (req.defeatUnovaChampion) {
        let beaten = state.stats.defeatedBosses && state.stats.defeatedBosses["Unova Champion"];
        if (!beaten) isMet = false;
        textParts.push(`Win Unova Pokémon League${getStatusHtml(beaten)}`);
    }
    if (req.defeatRed) {
        let beatenRed = state.stats.defeatedBosses && state.stats.defeatedBosses["Red"];
        if (!beatenRed) isMet = false;
        textParts.push(`Defeat Red${getStatusHtml(beatenRed)}`);
    }

    if (req.completeChallenges) {
        let completedIds = state.stats.completedChallengeIds || [];
        for (let target of req.completeChallenges) {
            // target could be either an areaId or a challengeName
            let match = null;
            if (typeof window !== 'undefined' && window.getCurrentUnlocks) {
                match = window.getCurrentUnlocks().find(u => u.challengeName === target || u.areaId === target);
            }
            // fallback for finding the areaId manually to ensure it won't break
            if (!match && state.config) {
                let allUnlocks = [];
                if (state.config.unlocks) allUnlocks = allUnlocks.concat(state.config.unlocks);
                if (state.config.johtoUnlocks) allUnlocks = allUnlocks.concat(state.config.johtoUnlocks);
                if (state.config.hoennUnlocks) allUnlocks = allUnlocks.concat(state.config.hoennUnlocks);
                if (state.config.sinnohUnlocks) allUnlocks = allUnlocks.concat(state.config.sinnohUnlocks);
                if (state.config.unovaUnlocks) allUnlocks = allUnlocks.concat(state.config.unovaUnlocks);
                match = allUnlocks.find(u => u && (u.challengeName === target || u.areaId === target));
            }

            let checkId = match ? match.areaId : target;
            let completed = completedIds.includes(checkId);
            if (!completed) isMet = false;
            textParts.push(`Complete ${target}${getStatusHtml(completed)}`);
        }
    }

    return { isMet, textParts };
}

export function updateMainControl() {
    const battleSystem = globals.battleSystem;
    const inGym = battleSystem && battleSystem.gymState && battleSystem.gymState.isActive;
    const noPokemon = state.party.length === 0 && state.storage.length === 0;

    let isFinalChallengeCompleted = checkFinalChallengeCompleted();

    const mainControlTitle = document.getElementById('main-control-title');
    if (mainControlTitle) {
        const regionName = state.currentRegionName || "Kanto";
        mainControlTitle.innerText = `Main Control (${regionName})`;
    }

    // Legacy saves might not have hasPickedStarter but will have party/storage
    const isStarterPending = !state.stats.hasPickedStarter && noPokemon;

    const lockMenus = inGym || noPokemon || isStarterPending;
    const navButtons = document.getElementById('main-control');
    if (navButtons) {
        navButtons.style.pointerEvents = lockMenus ? 'none' : 'auto';
        navButtons.style.opacity = lockMenus ? '0.5' : '1.0';
    }

    const timerRoute = document.getElementById('main-view-timer-route');
    const timerTotal = document.getElementById('main-view-timer-total');
    if (timerRoute && timerTotal) {
        const routeSec = state.stats.battleModeTimer || 0;
        const totalSec = state.globalStats.playtime || 0;

        const formatTime = (secs) => {
            const d = Math.floor(secs / 86400);
            const h = Math.floor((secs % 86400) / 3600);
            const m = Math.floor((secs % 3600) / 60);
            const s = Math.floor(secs % 60);
            let timeStr = `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
            if (d >= 1) timeStr = `${d}d ${timeStr}`;
            return timeStr;
        };

        timerRoute.innerText = `${formatTime(routeSec)} (route)`;
        timerTotal.innerText = `(total) ${formatTime(totalSec)}`;
    }

    const elChallengeText = document.getElementById('current-challenge-text');
    if (elChallengeText) elChallengeText.innerHTML = getChallengeText();

    const bonusCandyContainer = document.getElementById('bonus-candy-container');
    const exclamation = document.getElementById('bonus-candy-exclamation');
    if (exclamation && bonusCandyContainer) {
        if (state.stats.whiteCandies > 0) {
            bonusCandyContainer.style.display = 'inline-block';
            if (!state.stats.hasSeenBonusCandyIcon) {
                exclamation.style.display = 'block';
            } else {
                exclamation.style.display = 'none';
            }
        } else if (state.stats.hasSeenBonusCandyIcon) {
            bonusCandyContainer.style.display = 'inline-block';
            exclamation.style.display = 'none';
        } else {
            exclamation.style.display = 'none';
            bonusCandyContainer.style.display = 'none';
        }
    }

    const giftContainer = document.getElementById('gift-container');
    const giftNotification = document.getElementById('gift-notification');
    if (giftContainer && giftNotification) {
        if (state.stats.pendingGifts && state.stats.pendingGifts.length > 0) {
            giftContainer.style.display = 'inline-block';
            if (!state.globalStats.hasSeenGiftIcon) {
                giftNotification.style.display = 'block';
            } else {
                giftNotification.style.display = 'none';
            }
        } else if (state.globalStats.hasSeenGiftIcon) {
            giftContainer.style.display = 'inline-block';
            giftNotification.style.display = 'none';
        } else {
            giftNotification.style.display = 'none';
            giftContainer.style.display = 'none';
        }
    }

    const calendarNotification = document.getElementById('calendar-notification');
    if (calendarNotification) {
        if (checkDailyRewardAvailable() || checkAnyDailyChallengeCompleted()) {
            calendarNotification.style.display = 'block';
        } else {
            calendarNotification.style.display = 'none';
        }
    }

    // Professor Task Notification Tracking
    if (window.getProfTaskAvailableCount) {
        let currentProfTasksCount = window.getProfTaskAvailableCount();
        if (currentProfTasksCount > (state.stats.profTasksAvailableCount || 0)) {
            state.stats.showMapProfNotification = true;
            state.stats.showProfMarkerPulse = true;
            state.stats.showProfLobbyNotification = true;
        } else if (currentProfTasksCount === 0) {
            state.stats.showMapProfNotification = false;
            state.stats.showProfMarkerPulse = false;
            state.stats.showProfLobbyNotification = false;
        }
        state.stats.profTasksAvailableCount = currentProfTasksCount;
    }

    const mapNotification = document.getElementById('map-notification');
    if (mapNotification) {
        let isFinalChallengeCompleted = checkFinalChallengeCompleted();
        if (state.stats.hasUnseenMap || state.stats.showMapProfNotification || (isFinalChallengeCompleted && !state.globalStats.hasSeenJohtoMap)) {
            mapNotification.style.display = 'block';
        } else {
            mapNotification.style.display = 'none';
        }
    }

    const challengesNotification = document.getElementById('challenges-notification');
    if (challengesNotification) {
        let anyMet = false;
        if (state.config && window.getCurrentUnlocks() && state.stats.activeChallenges) {
            for (let activeId of state.stats.activeChallenges) {
                let unlock = window.getCurrentUnlocks().find(u => u.areaId === activeId);
                if (unlock) {
                    let cData = getChallengeData(unlock);
                    if (cData.isMet) {
                        anyMet = true;
                        break;
                    }
                }
            }
        }
        challengesNotification.style.display = anyMet ? 'block' : 'none';
    }

    const sleepContainer = document.getElementById('sleep-container');
    const sleepNotification = document.getElementById('sleep-notification');

    if (sleepContainer && sleepNotification) {
        if (state.globalStats.playtime && state.globalStats.playtime >= 3600) {
            sleepContainer.style.display = 'inline-block';
            if (!state.stats.hasSeenZzZIcon) {
                sleepNotification.style.display = 'block';
            } else {
                sleepNotification.style.display = 'none';
            }
        } else {
            sleepContainer.style.display = 'none';
            sleepNotification.style.display = 'none';
        }
    }
    // Auto-adjust width of the Main Control window if new icons appeared
    if (window.windowManager) {
        window.windowManager.autoAdjustWidth('main-control-window');
    }
}


export function getChallengeText() {
    if (!state.stats.activeChallenges || state.stats.activeChallenges.length === 0) {
        return "Next Challenge: None";
    }

    let activeCount = state.stats.activeChallenges.length;

    // If only one, provide basic info
    if (activeCount === 1) {
        let activeId = state.stats.activeChallenges[0];
        let unlock = window.getCurrentUnlocks().find(u => u.areaId === activeId);
        if (unlock) {
            let unlocks = "Unlocks: " + (unlock.unlocks ? unlock.unlocks.join(' + ') : "Next Area");
            let displayName = unlock.challengeName || activeId;
            return `Next Challenge: ${displayName} - ${unlocks}`;
        }
    }

    return `${activeCount} Active Challenges Available`;
}
