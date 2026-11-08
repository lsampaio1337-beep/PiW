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

function evaluateRequirements(req, unlock) {
    let progress = [];

    if (req.defeatCountRoute) {
        let route = req.defeatCountRoute.route;
        let reqCount = req.defeatCountRoute.count;
        let defeats = state.stats.challengeRouteDefeats || 0;
        progress.push({
            type: 'defeatCountRoute',
            route: route,
            current: defeats,
            required: reqCount,
            isMet: defeats >= reqCount
        });
    }

    if (req.catchSpecies) {
        for (let spec of req.catchSpecies) {
            let caughtCount = state.stats.caughtSpecies ? (state.stats.caughtSpecies[spec.species] || 0) : 0;
            progress.push({
                type: 'catchSpecies',
                species: spec.species,
                current: caughtCount,
                required: spec.count,
                isMet: caughtCount >= spec.count
            });
        }
    }

    if (req.catchSpeciesOr) {
        let isMet = false;
        let bestCurrent = 0;
        let bestRequired = 1;
        let names = [];
        for (let spec of req.catchSpeciesOr) {
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
        progress.push({
            type: 'catchSpeciesOr',
            species: names.join(" or "),
            current: isMet ? bestRequired : bestCurrent,
            required: bestRequired,
            isMet: isMet
        });
    }

if (req.catchSpeciesByQuality) {
        for (let spec of req.catchSpeciesByQuality) {
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
    }

    if (req.catchSpeciesByQualityOrHigher) {
        let qualities = ["Weak", "Regular", "Uncommon", "Rare", "Epic", "Shiny", "Legendary", "Mythical"];
        for (let spec of req.catchSpeciesByQualityOrHigher) {
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
    }

    if (req.catchSpeciesAnyOfByQuality) {
         for (let specGroup of req.catchSpeciesAnyOfByQuality) {
             let caughtCount = 0;
             let speciesList = Array.isArray(specGroup.species) ? specGroup.species : [specGroup.species];
             let quality = specGroup.quality || "Weak";
             let requiredCount = specGroup.count || 1;

             let flatSpeciesList = [];
             for (let s of speciesList) {
                 flatSpeciesList.push(s);
                 let caughtKey = s + "_" + quality;
                 caughtCount += state.stats.challengeCaughtSpecific ? (state.stats.challengeCaughtSpecific[caughtKey] || 0) : 0;
             }
             progress.push({
                 type: 'catchSpeciesAnyOfByQuality',
                 speciesList: flatSpeciesList,
                 quality: quality,
                 current: caughtCount,
                 required: requiredCount,
                 isMet: caughtCount >= requiredCount
             });
         }
    }

    if (req.catchSpeciesAnyOf) {
         for (let specGroup of req.catchSpeciesAnyOf) {
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
    }

    if (req.catchSpeciesAnyOfByQuality) {
         for (let specGroup of req.catchSpeciesAnyOfByQuality) {
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
                progress.push({
                    type: 'catchEachFromSlotMachine',
                    machine: machine,
                    isMet: caughtAny
                });
            });
        }
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

        progress.push({
            type: 'catchByQuality',
            quality: displayQuality,
            areaId: unlock.areaId,
            current: caughtCount,
            required: req.catchByQuality.count,
            isMet: caughtCount >= req.catchByQuality.count
        });
    }

    if (req.catchByQualityAndType) {
        let caughtKey = req.catchByQualityAndType.type + "_" + req.catchByQualityAndType.quality;
        let caughtCount = state.stats.challengeCaughtSpecific ? (state.stats.challengeCaughtSpecific[caughtKey] || 0) : 0;
        progress.push({
            type: 'catchByQualityAndType',
            quality: req.catchByQualityAndType.quality,
            pokemonType: req.catchByQualityAndType.type, // avoid type shadowing
            current: caughtCount,
            required: req.catchByQualityAndType.count,
            isMet: caughtCount >= req.catchByQualityAndType.count
        });
    }

    if (req.catchByType) {
        let typeKey = req.catchByType.type + "_Any";
        let caughtCount = state.stats.challengeCaughtSpecific ? (state.stats.challengeCaughtSpecific[typeKey] || 0) : 0;
        progress.push({
            type: 'catchByType',
            pokemonType: req.catchByType.type, // avoid type shadowing
            current: caughtCount,
            required: req.catchByType.count,
            isMet: caughtCount >= req.catchByType.count
        });
    }

    if (req.earnBadge) {
        let hasBadge = state.trainer.badges >= req.earnBadge.badgeCount;
        progress.push({
            type: 'earnBadge',
            name: req.earnBadge.name,
            isMet: hasBadge
        });
    }

    if (req.defeatSpecific) {
        let defeated = state.stats.challengeSpecificDefeats ? (state.stats.challengeSpecificDefeats[req.defeatSpecific.name] || 0) : 0;
        progress.push({
            type: 'defeatSpecific',
            name: req.defeatSpecific.name,
            current: defeated,
            required: req.defeatSpecific.count,
            isMet: defeated >= req.defeatSpecific.count
        });
    }

    if (req.defeatMultipleSpecific) {
        for (let target of req.defeatMultipleSpecific) {
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
    }

    if (req.defeatEliteFourAndChampion) {
        let beatenE4 = state.stats.defeatedBosses && (state.stats.defeatedBosses["Pokemon League Lorelei"] || state.stats.defeatedBosses["Lorelei"]) && state.stats.defeatedBosses["Champion Rival"];
        progress.push({
            type: 'defeatLeague',
            region: 'Kanto',
            isMet: beatenE4
        });
    }

    if (req.defeatJohtoChampion) {
        let beaten = state.stats.defeatedBosses && state.stats.defeatedBosses["Johto Champion"];
        progress.push({ type: 'defeatLeague', region: 'Johto', isMet: beaten });
    }
    if (req.defeatHoennChampion) {
        let beaten = state.stats.defeatedBosses && state.stats.defeatedBosses["Hoenn Champion"];
        progress.push({ type: 'defeatLeague', region: 'Hoenn', isMet: beaten });
    }
    if (req.defeatSinnohChampion) {
        let beaten = state.stats.defeatedBosses && state.stats.defeatedBosses["Sinnoh Champion"];
        progress.push({ type: 'defeatLeague', region: 'Sinnoh', isMet: beaten });
    }
    if (req.defeatUnovaChampion) {
        let beaten = state.stats.defeatedBosses && state.stats.defeatedBosses["Unova Champion"];
        progress.push({ type: 'defeatLeague', region: 'Unova', isMet: beaten });
    }
    if (req.defeatKalosChampion) {
        let beaten = state.stats.defeatedBosses && state.stats.defeatedBosses["Kalos Champion"];
        progress.push({ type: 'defeatLeague', region: 'Kalos', isMet: beaten });
    }
    if (req.defeatAlolaChampion) {
        let beaten = state.stats.defeatedBosses && state.stats.defeatedBosses["Alola Champion"];
        progress.push({ type: 'defeatLeague', region: 'Alola', isMet: beaten });
    }
    if (req.defeatHisuiChampion) {
        let beaten = state.stats.defeatedBosses && state.stats.defeatedBosses["Hisui Champion"];
        progress.push({ type: 'defeatLeague', region: 'Hisui', isMet: beaten });
    }
    if (req.defeatGalarChampion) {
        let beaten = state.stats.defeatedBosses && state.stats.defeatedBosses["Galar Champion"];
        progress.push({ type: 'defeatLeague', region: 'Galar', isMet: beaten });
    }
    if (req.defeatRed) {
        let beatenRed = state.stats.defeatedBosses && state.stats.defeatedBosses["Red"];
        progress.push({ type: 'defeatRed', isMet: beatenRed });
    }

    if (req.catchSpeciesUniqueCount) {
        let uniqueSpeciesCaught = state.stats.caughtSpeciesCount || 0;
        let reqCount = req.catchSpeciesUniqueCount;
        progress.push({
            type: 'catchSpeciesUniqueCount',
            current: uniqueSpeciesCaught,
            required: reqCount,
            isMet: uniqueSpeciesCaught >= reqCount
        });
    }

    if (req.completeAnyOfChallenges) {
        let completedIds = state.stats.completedChallengeIds || [];
        let anyMet = false;
        for (let target of req.completeAnyOfChallenges) {
            let checkId = getChallengeAreaId(target);
            if (completedIds.includes(checkId)) {
                anyMet = true;
                break;
            }
        }
        progress.push({
            type: 'completeAnyOfChallenges',
            targets: req.completeAnyOfChallenges,
            isMet: anyMet
        });
    }

    if (req.completeChallenges) {
        let completedIds = state.stats.completedChallengeIds || [];
        for (let target of req.completeChallenges) {
            let checkId = getChallengeAreaId(target);
            let completed = completedIds.includes(checkId);
            progress.push({
                type: 'completeChallenges',
                target: target,
                isMet: completed
            });
        }
    }

    return progress;
}

function formatRequirements(progressList) {
    let textParts = [];
    for (let p of progressList) {
        if (p.type === 'defeatCountRoute') {
            let routeText = p.route === "Route 1" ? " on Route 1" : ` on ${p.route}`;
            textParts.push(`Defeat ${p.required} Pokémon${routeText} ${countDisplay(p.current, p.required)}${getStatusHtml(p.isMet)}`);
        } else if (p.type === 'catchSpecies') {
            textParts.push(`Catch ${p.required} ${formatSpecies(p.species)} ${countDisplay(p.current, p.required)}${getStatusHtml(p.isMet)}`);
} else if (p.type === 'catchSpeciesByQuality') {
            textParts.push(`Catch ${p.required} ${p.quality} ${formatSpecies(p.species)} ${countDisplay(p.current, p.required)}${getStatusHtml(p.isMet)}`);
        } else if (p.type === 'catchSpeciesByQualityOrHigher') {
            textParts.push(`Catch ${p.required} ${p.quality}+ ${formatSpecies(p.species)} ${countDisplay(p.current, p.required)}${getStatusHtml(p.isMet)}`);
        } else if (p.type === 'catchSpeciesAnyOf') {
            let speciesList = p.speciesList.map(s => formatSpecies(s)).join(' or ');
            textParts.push(`Catch ${p.required} ${speciesList} ${countDisplay(p.current, p.required)}${getStatusHtml(p.isMet)}`);
        } else if (p.type === 'catchSpeciesAnyOfByQuality') {
            let speciesList = p.speciesList.map(formatSpecies).join(' or ');
            textParts.push(`Catch ${p.required} ${p.quality} ${speciesList} ${countDisplay(p.current, p.required)}${getStatusHtml(p.isMet)}`);
        } else if (p.type === 'catchEachFromSlotMachine') {
            let machineStr = p.machine.map(formatSpecies).join(' or ');
            textParts.push(`Catch 1 ${machineStr} ${getStatusHtml(p.isMet)}`);
        } else if (p.type === 'catchByQuality') {
            textParts.push(`Catch ${p.required} ${p.quality} Pokémon from ${p.areaId} ${countDisplay(p.current, p.required)}${getStatusHtml(p.isMet)}`);
        } else if (p.type === 'catchByQualityAndType') {
            textParts.push(`Catch ${p.required} ${p.quality} ${p.pokemonType}-type ${countDisplay(p.current, p.required)}${getStatusHtml(p.isMet)}`);
        } else if (p.type === 'catchByType') {
            textParts.push(`Catch ${p.required} ${p.pokemonType} Type Pokemons ${countDisplay(p.current, p.required)}${getStatusHtml(p.isMet)}`);
        } else if (p.type === 'earnBadge') {
            textParts.push(`Earn ${escapeHTML(p.name)}${getStatusHtml(p.isMet)}`);
        } else if (p.type === 'defeatSpecific') {
            textParts.push(`Defeat ${p.required} ${escapeHTML(p.name)} ${countDisplay(p.current, p.required)}${getStatusHtml(p.isMet)}`);
        } else if (p.type === 'defeatMultipleSpecific') {
            textParts.push(`Defeat ${p.required} ${escapeHTML(p.name)} ${countDisplay(p.current, p.required)}${getStatusHtml(p.isMet)}`);
        } else if (p.type === 'defeatLeague') {
            textParts.push(`Win ${p.region} Pokémon League${getStatusHtml(p.isMet)}`);
        } else if (p.type === 'defeatRed') {
            textParts.push(`Defeat Red${getStatusHtml(p.isMet)}`);
        } else if (p.type === 'catchSpeciesUniqueCount') {
            textParts.push(`Catch ${p.required} different Pokémon ${countDisplay(p.current, p.required)}${getStatusHtml(p.isMet)}`);
        } else if (p.type === 'completeAnyOfChallenges') {
            textParts.push(`Complete any of: ${p.targets.join(', ')}${getStatusHtml(p.isMet)}`);
        } else if (p.type === 'completeChallenges') {
            textParts.push(`Complete ${p.target}${getStatusHtml(p.isMet)}`);
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
