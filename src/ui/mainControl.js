import { state, globals, checkFinalChallengeCompleted } from '../state.js';
import { checkDailyRewardAvailable, checkAnyDailyChallengeCompleted } from './calendar.js';
import { escapeHTML } from '../utils/stringUtils.js';

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


function getChallengeAreaId(target) {
    let match = null;
    if (typeof window !== 'undefined' && window.getCurrentUnlocks) {
        match = window.getCurrentUnlocks().find(u => u.challengeName === target || u.areaId === target);
    }
    if (!match && state.config) {
        let allUnlocks = [];
        if (state.config.unlocks) allUnlocks = allUnlocks.concat(state.config.unlocks);
        if (state.config.johtoUnlocks) allUnlocks = allUnlocks.concat(state.config.johtoUnlocks);
        if (state.config.hoennUnlocks) allUnlocks = allUnlocks.concat(state.config.hoennUnlocks);
        if (state.config.sinnohUnlocks) allUnlocks = allUnlocks.concat(state.config.sinnohUnlocks);
        if (state.config.unovaUnlocks) allUnlocks = allUnlocks.concat(state.config.unovaUnlocks);
        match = allUnlocks.find(u => u && (u.challengeName === target || u.areaId === target));
    }
    return match ? match.areaId : target;
}


const requirementEvaluators = {
    defeatCountRoute: (reqData, unlock) => {
        let route = reqData.route;
        let reqCount = reqData.count;
        let defeats = state.stats.challengeRouteDefeats || 0;
        return [{
            type: 'defeatCountRoute',
            route: route,
            current: defeats,
            required: reqCount,
            isMet: defeats >= reqCount
        }];
    },
    catchSpecies: (reqData, unlock) => {
        let progress = [];
        for (let spec of reqData) {
            let caughtCount = state.stats.caughtSpecies ? (state.stats.caughtSpecies[spec.species] || 0) : 0;
            progress.push({
                type: 'catchSpecies',
                species: spec.species,
                current: caughtCount,
                required: spec.count,
                isMet: caughtCount >= spec.count
            });
        }
        return progress;
    },
    catchSpeciesOr: (reqData, unlock) => {
        let isMet = false;
        let bestCurrent = 0;
        let bestRequired = 1;
        let names = [];
        for (let spec of reqData) {
            names.push(spec.species);
            let caughtCount = state.stats.caughtSpecies ? (state.stats.caughtSpecies[spec.species] || 0) : 0;
            if (caughtCount >= spec.count) {
                isMet = true;
            }
            if (caughtCount > bestCurrent) {
                bestCurrent = caughtCount;
            }
            bestRequired = spec.count;
        }
        return [{
            type: 'catchSpeciesOr',
            species: names.join(" or "),
            current: isMet ? bestRequired : bestCurrent,
            required: bestRequired,
            isMet: isMet
        }];
    },
    catchSpeciesByQuality: (reqData, unlock) => {
        let progress = [];
        for (let spec of reqData) {
            let caughtKey = spec.species + "_" + spec.quality;
            let caughtCount = state.stats.challengeCaughtSpecific ? (state.stats.challengeCaughtSpecific[caughtKey] || 0) : 0;
            progress.push({
                type: 'catchSpeciesByQuality',
                species: spec.species,
                quality: spec.quality,
                current: caughtCount,
                required: spec.count,
                isMet: caughtCount >= spec.count
            });
        }
        return progress;
    },
    catchSpeciesByQualityOrHigher: (reqData, unlock) => {
        let progress = [];
        let qualities = ["Weak", "Regular", "Uncommon", "Rare", "Epic", "Shiny", "Legendary", "Mythical"];
        for (let spec of reqData) {
            let caughtCount = 0;
            let idx = qualities.indexOf(spec.quality);
            if (idx !== -1) {
                for (let i = idx; i < qualities.length; i++) {
                    let caughtKey = spec.species + "_" + qualities[i];
                    caughtCount += state.stats.challengeCaughtSpecific ? (state.stats.challengeCaughtSpecific[caughtKey] || 0) : 0;
                }
            }
            progress.push({
                type: 'catchSpeciesByQualityOrHigher',
                species: spec.species,
                quality: spec.quality,
                current: caughtCount,
                required: spec.count,
                isMet: caughtCount >= spec.count
            });
        }
        return progress;
    },
    catchSpeciesAnyOf: (reqData, unlock) => {
        let progress = [];
        for (let specGroup of reqData) {
             let caughtCount = 0;
             let speciesList = Array.isArray(specGroup) ? specGroup : specGroup.species;
             let requiredCount = specGroup.count || (Array.isArray(specGroup) && specGroup[0] && specGroup[0].count) || 1;

             let flatSpeciesList = [];
             for (let sObj of speciesList) {
                 let s = sObj.species ? sObj.species : sObj;
                 flatSpeciesList.push(s);
                 caughtCount += state.stats.caughtSpecies ? (state.stats.caughtSpecies[s] || 0) : 0;
             }
             progress.push({
                 type: 'catchSpeciesAnyOf',
                 speciesList: flatSpeciesList,
                 current: caughtCount,
                 required: requiredCount,
                 isMet: caughtCount >= requiredCount
             });
         }
         return progress;
    },
    catchSpeciesAnyOfByQuality: (reqData, unlock) => {
        let progress = [];
        for (let specGroup of reqData) {
             let caughtCount = 0;
             for (let s of specGroup.species) {
                 let caughtKey = s + "_" + specGroup.quality;
                 caughtCount += state.stats.challengeCaughtSpecific ? (state.stats.challengeCaughtSpecific[caughtKey] || 0) : 0;
             }
             progress.push({
                 type: 'catchSpeciesAnyOfByQuality',
                 speciesList: specGroup.species,
                 quality: specGroup.quality,
                 current: caughtCount,
                 required: specGroup.count,
                 isMet: caughtCount >= specGroup.count
             });
         }
         return progress;
    },
    catchEachFromSlotMachine: (reqData, unlock) => {
        let progress = [];
        if (reqData.machines) {
            reqData.machines.forEach(machine => {
                let caughtAny = false;
                for (let s of machine) {
                    if (state.stats.caughtSpecies && state.stats.caughtSpecies[s] >= 1) {
                        caughtAny = true;
                        break;
                    }
                }
                progress.push({
                    type: 'catchEachFromSlotMachine',
                    machine: machine,
                    isMet: caughtAny
                });
            });
        }
        return progress;
    },
    catchByQuality: (reqData, unlock) => {
        let qualities = ["Weak", "Regular", "Uncommon", "Rare", "Epic", "Shiny", "Legendary", "Mythical"];
        let targetQualities = [reqData.quality];

        let displayQuality = reqData.quality;
        if (reqData.quality.endsWith('+')) {
            let baseQuality = reqData.quality.slice(0, -1);
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

        return [{
            type: 'catchByQuality',
            quality: displayQuality,
            areaId: unlock.areaId,
            current: caughtCount,
            required: reqData.count,
            isMet: caughtCount >= reqData.count
        }];
    },
    catchByQualityAndType: (reqData, unlock) => {
        let caughtKey = reqData.type + "_" + reqData.quality;
        let caughtCount = state.stats.challengeCaughtSpecific ? (state.stats.challengeCaughtSpecific[caughtKey] || 0) : 0;
        return [{
            type: 'catchByQualityAndType',
            quality: reqData.quality,
            pokemonType: reqData.type,
            current: caughtCount,
            required: reqData.count,
            isMet: caughtCount >= reqData.count
        }];
    },
    catchByType: (reqData, unlock) => {
        let typeKey = reqData.type + "_Any";
        let caughtCount = state.stats.challengeCaughtSpecific ? (state.stats.challengeCaughtSpecific[typeKey] || 0) : 0;
        return [{
            type: 'catchByType',
            pokemonType: reqData.type,
            current: caughtCount,
            required: reqData.count,
            isMet: caughtCount >= reqData.count
        }];
    },
    earnBadge: (reqData, unlock) => {
        let hasBadge = state.trainer.badges >= reqData.badgeCount;
        return [{
            type: 'earnBadge',
            name: reqData.name,
            isMet: hasBadge
        }];
    },
    defeatSpecific: (reqData, unlock) => {
        let defeated = state.stats.challengeSpecificDefeats ? (state.stats.challengeSpecificDefeats[reqData.name] || 0) : 0;
        return [{
            type: 'defeatSpecific',
            name: reqData.name,
            current: defeated,
            required: reqData.count,
            isMet: defeated >= reqData.count
        }];
    },
    defeatMultipleSpecific: (reqData, unlock) => {
        let progress = [];
        for (let target of reqData) {
            let key = target.name || target.pokemonId;
            if (key === '__proto__' || key === 'constructor' || key === 'prototype') continue;
            let defeated = state.stats.challengeSpecificDefeats ? (state.stats.challengeSpecificDefeats[key] || 0) : 0;
            let displayName = target.name || target.pokemonId;
            progress.push({
                type: 'defeatMultipleSpecific',
                name: displayName,
                current: defeated,
                required: target.count,
                isMet: defeated >= target.count
            });
        }
        return progress;
    },
    defeatEliteFourAndChampion: (reqData, unlock) => {
        let beatenE4 = state.stats.defeatedBosses && (state.stats.defeatedBosses["Pokemon League Lorelei"] || state.stats.defeatedBosses["Lorelei"]) && state.stats.defeatedBosses["Champion Rival"];
        return [{
            type: 'defeatLeague',
            region: 'Kanto',
            isMet: beatenE4
        }];
    },
    defeatJohtoChampion: (reqData, unlock) => {
        let beaten = state.stats.defeatedBosses && state.stats.defeatedBosses["Johto Champion"];
        return [{ type: 'defeatLeague', region: 'Johto', isMet: beaten }];
    },
    defeatHoennChampion: (reqData, unlock) => {
        let beaten = state.stats.defeatedBosses && state.stats.defeatedBosses["Hoenn Champion"];
        return [{ type: 'defeatLeague', region: 'Hoenn', isMet: beaten }];
    },
    defeatSinnohChampion: (reqData, unlock) => {
        let beaten = state.stats.defeatedBosses && state.stats.defeatedBosses["Sinnoh Champion"];
        return [{ type: 'defeatLeague', region: 'Sinnoh', isMet: beaten }];
    },
    defeatUnovaChampion: (reqData, unlock) => {
        let beaten = state.stats.defeatedBosses && state.stats.defeatedBosses["Unova Champion"];
        return [{ type: 'defeatLeague', region: 'Unova', isMet: beaten }];
    },
    defeatKalosChampion: (reqData, unlock) => {
        let beaten = state.stats.defeatedBosses && state.stats.defeatedBosses["Kalos Champion"];
        return [{ type: 'defeatLeague', region: 'Kalos', isMet: beaten }];
    },
    defeatAlolaChampion: (reqData, unlock) => {
        let beaten = state.stats.defeatedBosses && state.stats.defeatedBosses["Alola Champion"];
        return [{ type: 'defeatLeague', region: 'Alola', isMet: beaten }];
    },
    defeatHisuiChampion: (reqData, unlock) => {
        let beaten = state.stats.defeatedBosses && state.stats.defeatedBosses["Hisui Champion"];
        return [{ type: 'defeatLeague', region: 'Hisui', isMet: beaten }];
    },
    defeatGalarChampion: (reqData, unlock) => {
        let beaten = state.stats.defeatedBosses && state.stats.defeatedBosses["Galar Champion"];
        return [{ type: 'defeatLeague', region: 'Galar', isMet: beaten }];
    },
    defeatRed: (reqData, unlock) => {
        let beatenRed = state.stats.defeatedBosses && state.stats.defeatedBosses["Red"];
        return [{ type: 'defeatRed', isMet: beatenRed }];
    },
    catchSpeciesUniqueCount: (reqData, unlock) => {
        let uniqueSpeciesCaught = state.stats.caughtSpeciesCount || 0;
        let reqCount = reqData;
        return [{
            type: 'catchSpeciesUniqueCount',
            current: uniqueSpeciesCaught,
            required: reqCount,
            isMet: uniqueSpeciesCaught >= reqCount
        }];
    },
    completeAnyOfChallenges: (reqData, unlock) => {
        let completedIds = state.stats.completedChallengeIds || [];
        let anyMet = false;
        for (let target of reqData) {
            let checkId = getChallengeAreaId(target);
            if (completedIds.includes(checkId)) {
                anyMet = true;
                break;
            }
        }
        return [{
            type: 'completeAnyOfChallenges',
            targets: reqData,
            isMet: anyMet
        }];
    },
    completeChallenges: (reqData, unlock) => {
        let progress = [];
        let completedIds = state.stats.completedChallengeIds || [];
        for (let target of reqData) {
            let checkId = getChallengeAreaId(target);
            let completed = completedIds.includes(checkId);
            progress.push({
                type: 'completeChallenges',
                target: target,
                isMet: completed
            });
        }
        return progress;
    }
};

function evaluateRequirements(req, unlock) {
    let progress = [];
    for (let reqType in req) {
        if (requirementEvaluators[reqType]) {
            let results = requirementEvaluators[reqType](req[reqType], unlock);
            progress = progress.concat(results);
        }
    }
    return progress;
}



const requirementFormatters = {
    defeatCountRoute: (p) => {
        let routeText = p.route === "Route 1" ? " on Route 1" : ` on ${p.route}`;
        return `Defeat ${p.required} Pokémon${routeText} ${countDisplay(p.current, p.required)}${getStatusHtml(p.isMet)}`;
    },
    catchSpecies: (p) => {
        return `Catch ${p.required} ${formatSpecies(p.species)} ${countDisplay(p.current, p.required)}${getStatusHtml(p.isMet)}`;
    },
    catchSpeciesByQuality: (p) => {
        return `Catch ${p.required} ${p.quality} ${formatSpecies(p.species)} ${countDisplay(p.current, p.required)}${getStatusHtml(p.isMet)}`;
    },
    catchSpeciesByQualityOrHigher: (p) => {
        return `Catch ${p.required} ${p.quality}+ ${formatSpecies(p.species)} ${countDisplay(p.current, p.required)}${getStatusHtml(p.isMet)}`;
    },
    catchSpeciesAnyOf: (p) => {
        let speciesList = p.speciesList.map(s => formatSpecies(s)).join(' or ');
        return `Catch ${p.required} ${speciesList} ${countDisplay(p.current, p.required)}${getStatusHtml(p.isMet)}`;
    },
    catchSpeciesAnyOfByQuality: (p) => {
        let speciesList = p.speciesList.map(formatSpecies).join(' or ');
        return `Catch ${p.required} ${p.quality} ${speciesList} ${countDisplay(p.current, p.required)}${getStatusHtml(p.isMet)}`;
    },
    catchEachFromSlotMachine: (p) => {
        let machineStr = p.machine.map(formatSpecies).join(' or ');
        return `Catch 1 ${machineStr} ${getStatusHtml(p.isMet)}`;
    },
    catchByQuality: (p) => {
        return `Catch ${p.required} ${p.quality} Pokémon from ${p.areaId} ${countDisplay(p.current, p.required)}${getStatusHtml(p.isMet)}`;
    },
    catchByQualityAndType: (p) => {
        return `Catch ${p.required} ${p.quality} ${p.pokemonType}-type ${countDisplay(p.current, p.required)}${getStatusHtml(p.isMet)}`;
    },
    catchByType: (p) => {
        return `Catch ${p.required} ${p.pokemonType} Type Pokemons ${countDisplay(p.current, p.required)}${getStatusHtml(p.isMet)}`;
    },
    earnBadge: (p) => {
        return `Earn ${escapeHTML(p.name)}${getStatusHtml(p.isMet)}`;
    },
    defeatSpecific: (p) => {
        return `Defeat ${p.required} ${escapeHTML(p.name)} ${countDisplay(p.current, p.required)}${getStatusHtml(p.isMet)}`;
    },
    defeatMultipleSpecific: (p) => {
        return `Defeat ${p.required} ${escapeHTML(p.name)} ${countDisplay(p.current, p.required)}${getStatusHtml(p.isMet)}`;
    },
    defeatLeague: (p) => {
        return `Win ${p.region} Pokémon League${getStatusHtml(p.isMet)}`;
    },
    defeatRed: (p) => {
        return `Defeat Red${getStatusHtml(p.isMet)}`;
    },
    catchSpeciesUniqueCount: (p) => {
        return `Catch ${p.required} different Pokémon ${countDisplay(p.current, p.required)}${getStatusHtml(p.isMet)}`;
    },
    completeAnyOfChallenges: (p) => {
        return `Complete any of: ${p.targets.join(', ')}${getStatusHtml(p.isMet)}`;
    },
    completeChallenges: (p) => {
        return `Complete ${p.target}${getStatusHtml(p.isMet)}`;
    },
    catchSpeciesOr: (p) => {
        return `Catch ${p.required} ${p.species} ${countDisplay(p.current, p.required)}${getStatusHtml(p.isMet)}`;
    }
};

function formatRequirements(progressList) {
    let textParts = [];
    for (let p of progressList) {
        if (requirementFormatters[p.type]) {
            textParts.push(requirementFormatters[p.type](p));
        }
    }
    return textParts;
}


export function getChallengeData(unlock) {
    if (!unlock) return { isMet: false, textParts: [] };

    let progressList = evaluateRequirements(unlock.requirements, unlock);
    let isMet = progressList.every(p => p.isMet);
    let textParts = formatRequirements(progressList);

    return { isMet, textParts };
}



function updateMainControlTitle() {
    const mainControlTitle = document.getElementById('main-control-title');
    if (mainControlTitle) {
        const regionName = state.currentRegionName || "Kanto";
        mainControlTitle.innerText = `Main Control (${regionName})`;
    }
}

function updateNavButtons(inGym, noPokemon, isStarterPending) {
    const lockMenus = inGym || noPokemon || isStarterPending;
    const navButtons = document.getElementById('main-control');
    if (navButtons) {
        navButtons.style.pointerEvents = lockMenus ? 'none' : 'auto';
        navButtons.style.opacity = lockMenus ? '0.5' : '1.0';
    }
}

function updateTimers() {
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
}

function updateChallengeTextUI() {
    const elChallengeText = document.getElementById('current-challenge-text');
    if (elChallengeText) elChallengeText.innerHTML = getChallengeText();
}

function updateBonusCandy() {
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
}

function updateGifts() {
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
}

function updateCalendar() {
    const calendarNotification = document.getElementById('calendar-notification');
    if (calendarNotification) {
        if (checkDailyRewardAvailable() || checkAnyDailyChallengeCompleted()) {
            calendarNotification.style.display = 'block';
        } else {
            calendarNotification.style.display = 'none';
        }
    }
}

function updateProfTasks() {
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
}

function updateMapNotification(isFinalChallengeCompleted) {
    const mapNotification = document.getElementById('map-notification');
    if (mapNotification) {
        if (state.stats.hasUnseenMap || state.stats.showMapProfNotification || (isFinalChallengeCompleted && !state.globalStats.hasSeenJohtoMap)) {
            mapNotification.style.display = 'block';
        } else {
            mapNotification.style.display = 'none';
        }
    }
}

function updateChallengesNotification() {
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
}

function updateSleepNotification() {
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
}


export function updateMainControl() {
    const battleSystem = globals.battleSystem;
    const inGym = battleSystem && battleSystem.gymState && battleSystem.gymState.isActive;
    const noPokemon = state.party.length === 0 && state.storage.length === 0;

    let isFinalChallengeCompleted = checkFinalChallengeCompleted();

    updateMainControlTitle();

    // Legacy saves might not have hasPickedStarter but will have party/storage
    const isStarterPending = !state.stats.hasPickedStarter && noPokemon;

    updateNavButtons(inGym, noPokemon, isStarterPending);
    updateTimers();
    updateChallengeTextUI();
    updateBonusCandy();
    updateGifts();
    updateCalendar();
    updateProfTasks();
    updateMapNotification(isFinalChallengeCompleted);
    updateChallengesNotification();
    updateSleepNotification();

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
            let unlocks = unlock.unlocks ? "Unlocks: " + unlock.unlocks.join(" + ") : "";
            let displayName = unlock.challengeName || activeId;
            return `Next Challenge: ${displayName}` + (unlocks ? ` - ${unlocks}` : ``);
        }
    }

    return `${activeCount} Active Challenges Available`;
}
