import { getCapacity } from "./mathEngine.js";
import { WindowManager } from './windowManager.js';
import { setupClickThrough } from './clickThrough.js';
import { getChallengeData, updateTimers } from './ui/mainControl.js';

import * as mathEngine from "./mathEngine.js";
import BattleSystem from "./battleSystem.js";
import DayCare from "./dayCare.js";
import Storage from "./storage.js";

// Import State and modules
import { state, setBattleSystem, globals, swapRegion } from './state.js';
import { trackDailyChallenge, checkAndResetDailyChallenges } from './ui/dailyChallenges.js';
import { showHelp } from './ui/help.js';
import {
    ZZZ_CONFIG,
    calculateZzZSimulationParams,
    consumeZzZGrains,
    summarizeZzZResults,
    buildZzZResultsModalHtml,
    buildZzZWakeUpModalHtml,
} from './ui/zzz.js';
import { hydratePokemonInfo } from './utils/pokemonDataLoader.js';
import { pokedexIndexes } from '../config/pokedexIndexes.js';

window.globals = globals;
if (globals) globals.swapRegion = swapRegion;

import { showProfTutorialIfNeeded, skipProfTutorial, proceedProfTutorial, concludeProfTutorial } from './ui/tutorials/profTutorial.js';
window.skipProfTutorial = skipProfTutorial;
window.proceedProfTutorial = proceedProfTutorial;
window.concludeProfTutorial = concludeProfTutorial;
export { showProfTutorialIfNeeded };

let autosaveInterval = null;
let hasUnloadAutosaveListener = false;
let hasDragAndDropScrollListeners = false;

/** Safely replace an element's contents using DOMParser. */
function setSafeHTML(element, html) {
    if (!element || typeof element.replaceChildren !== 'function') return;
    const doc = new DOMParser().parseFromString(html, 'text/html');
    element.replaceChildren(...doc.body.childNodes);
}

window.dismissDaycareMessage = function() {
    state.stats.hasSeenDaycare = true;
    document.getElementById('daycare-first-time-overlay').style.display = 'none';

    // Enable buttons now that message is dismissed
    const trainBtn = document.getElementById('btn-daycare-train');
    if (trainBtn) {
        trainBtn.style.pointerEvents = 'auto';
        trainBtn.style.opacity = '1';
    }
    const breedBtn = document.getElementById('btn-daycare-breed');
    if (breedBtn) {
        breedBtn.style.pointerEvents = 'auto';
        breedBtn.style.opacity = '1';
    }

    if (window.storageRef) {
        window.storageRef.save(state);
    }
    updateUI();
    if (window.showCalendar && document.getElementById('window-calendar') && document.getElementById('window-calendar').offsetParent !== null) {
        window.showCalendar('shop');
    }
};



window.dismissBonusCandyMessage = function() {
    state.globalStats.hasSeenBonusCandyModal = true;
    const overlay = document.getElementById('bonus-candy-first-time-overlay');
    if (overlay) {
        overlay.style.display = 'none';
    }
    if (window.storageRef) {
        window.storageRef.save(state);
    }
};

import { TYPE_COLORS } from './constants.js';
export { TYPE_COLORS };
import { updateMainControl, updateMainViewRouteBadge } from './ui/mainControl.js';
import { updateTeamWindow } from './ui/teamWindow.js';
import { updateBattleArena, showDamage, playCombatAnimations, triggerDefeatAnimation, showLoot, showLevelUp } from './ui/battle.js';
import { showCalendar } from './ui/calendar.js';
import './ui/tokenShop.js';
import './ui/multiplayer.js';
import { showGiftModal } from './ui/gift.js';
import { showMap, navigateToLocation, showMapTooltip, hideMapTooltip } from './ui/map.js';
import { showPokedex, showDexEntry, showSmartCaptureMode, setSmartCaptureShinyMode, showSmartCaptureBallSelection, selectSmartCaptureBall, selectGlobalSmartCaptureBall } from './ui/pokedex.js';
import { showPokemonStats, showPokemonStatsByUuid, evolvePokemon } from './ui/pokemonStats.js';
import { showBonusCandyModal } from './ui/bonusCandy.js';
window.showBonusCandyModal = showBonusCandyModal;
window.showGiftModal = showGiftModal;
import { showSettings, exportLog, exportData, triggerImportData, showAddPokemonModal, forceNextEncounter, forceNextCapture, activateCheat, showTimeLapseModal, runTimeLapse } from './ui/settings.js';
import { setupMarket, buyItem, openPokeMarketBuy, renderPokeMarketTab, updateBuyItemPrice, buySetMax } from './ui/market.js';
import { showBackpack, renderBackpackTab, setActiveItem, setAutoPotionThreshold } from './ui/backpack/index.js';
import { dragStart, dragOver, handleDrop } from './ui/backpack/pokemon.js';
import { normalizeRoutesData } from './utils/chanceUtils.js';

const storage = new Storage();
window.storageRef = storage;
const dayCare = new DayCare(state);
state.dayCareRef = dayCare;
state.storageRef = storage;

// Attach exported methods to window so inline HTML onclicks work
window.updateZzZModeUI = function() {
    if (state.isZzZMode) {
        document.querySelectorAll('.nav-icon').forEach(icon => {
            if (icon.id !== 'btn-sleep' && icon.id !== 'btn-exit' && icon.id !== 'btn-map') {
                icon.style.pointerEvents = 'none';
                icon.style.filter = 'grayscale(100%)';
            }
        });
    } else {
        document.querySelectorAll('.nav-icon').forEach(icon => {
            icon.style.pointerEvents = 'auto';
            icon.style.filter = '';
        });
    }
};

window.showMap = showMap;
window.navigateToLocation = navigateToLocation;
window.showMapTooltip = showMapTooltip;
window.hideMapTooltip = hideMapTooltip;
window.showBackpack = showBackpack;
window.renderBackpackTab = renderBackpackTab;
window.setActiveItem = setActiveItem;
window.setAutoPotionThreshold = setAutoPotionThreshold;
window.showPokedex = showPokedex;
window.showDexEntry = showDexEntry;
window.showSmartCaptureMode = showSmartCaptureMode;
window.setSmartCaptureShinyMode = setSmartCaptureShinyMode;
window.showSmartCaptureBallSelection = showSmartCaptureBallSelection;
window.selectSmartCaptureBall = selectSmartCaptureBall;
window.selectGlobalSmartCaptureBall = selectGlobalSmartCaptureBall;
window.showPokemonStats = showPokemonStats;
window.showPokemonStatsByUuid = showPokemonStatsByUuid;
window.evolvePokemon = evolvePokemon;
window.showSettings = showSettings;
window.exportLog = exportLog;
window.exportData = exportData;
window.triggerImportData = triggerImportData;
window.buyItem = buyItem;
window.updateBuyItemPrice = updateBuyItemPrice;
window.buySetMax = buySetMax;
window.openPokeMarketBuy = openPokeMarketBuy;
window.renderPokeMarketTab = renderPokeMarketTab;
window.showAddPokemonModal = showAddPokemonModal;
window.forceNextEncounter = forceNextEncounter;
window.forceNextCapture = forceNextCapture;
window.activateCheat = activateCheat;

import { cheatAction } from "./ui/cheatControl.js";
import { getSpriteUrl } from './utils/sprites.js';
window.getSpriteUrl = getSpriteUrl;


import { badgeMapping, getBadgeFileName } from './utils/badges.js';
window.badgeMapping = badgeMapping;
window.getBadgeFileName = (region, number) => getBadgeFileName(region, number, window.badgeMapping);


window.cheatAction = cheatAction;
window.showTimeLapseModal = showTimeLapseModal;
window.runTimeLapse = runTimeLapse;
window.dragStart = dragStart;
window.completeChallenge = function(targetAreaId) {

    if (!state.stats.activeChallenges) {
        state.stats.activeChallenges = ["Route 1 (Kanto)"];
    }
    if (!state.stats.completedChallengeIds) {
        state.stats.completedChallengeIds = [];
    }

    // Default to the first active challenge if none provided
    if (!targetAreaId && state.stats.activeChallenges.length > 0) {
        targetAreaId = state.stats.activeChallenges[0];
    }

    // Safety check, ensure it's in active
    if (!state.stats.activeChallenges.includes(targetAreaId)) return;

    let unlock = null;
    if (window.getCurrentUnlocks()) {
        unlock = window.getCurrentUnlocks().find(u => u.areaId === targetAreaId);
    }

    if (unlock) {
        if (unlock.gifts) {
            if (!state.stats.pendingGifts) state.stats.pendingGifts = [];
            for (let g of unlock.gifts) {
                state.stats.pendingGifts.push({ type: 'item', item: g.item, count: g.count });
            }
            state.globalStats.hasSeenGiftIcon = false;
        } else if (unlock.gift) {
            if (!state.stats.pendingGifts) state.stats.pendingGifts = [];
            state.stats.pendingGifts.push({ type: 'item', item: unlock.gift.item || unlock.gift, count: unlock.gift.count || 1 });
            state.globalStats.hasSeenGiftIcon = false;
        }
        if (unlock.unlocks) {
            for (let newRoute of unlock.unlocks) {
                if (!state.stats.newRoutes) state.stats.newRoutes = [];
                if (!state.stats.newRoutes.includes(newRoute)) {
                    state.stats.newRoutes.push(newRoute);
                }
                // Add the newly unlocked area to active challenges, but check if already completed
                if (!state.stats.activeChallenges.includes(newRoute) && !state.stats.completedChallengeIds.includes(newRoute)) {
                    state.stats.activeChallenges.push(newRoute);
                }
            }
            if (unlock.unlocks.length > 0) {
                state.stats.hasUnseenMap = true;
            }
        }
    }

    // Remove from active, add to completed
    state.stats.activeChallenges = state.stats.activeChallenges.filter(id => id !== targetAreaId);
    state.stats.completedChallengeIds.push(targetAreaId);

    // Also increment integer for backwards compatibility with any existing simple checks
    state.stats.completedChallenges = (state.stats.completedChallenges || 0) + 1;

    // Track Daily Challenges
    trackDailyChallenge('complete_progress_challenge');

    // Clear challenge specific tracking state
    // We only want to clear progress if no OTHER active challenge needs it.
    // However, to be perfectly safe, since the requirements are distinct, we can leave the tracked progress.
    // Wait, if we never clear it, a future challenge that asks for "Catch 2 Mankey" might auto-complete.
    // Let's clear ONLY the specific progress tied to the completed challenge.
    if (unlock && unlock.requirements) {
        if (unlock.requirements.defeatCountRoute) {
            state.stats.challengeRouteDefeats = 0;
        }
        if (unlock.requirements.catchRouteQuality && state.stats.challengeCaughtSpecific) {
            const rqKey = `Route_${unlock.requirements.catchRouteQuality.route}_${unlock.requirements.catchRouteQuality.quality}`;
            delete state.stats.challengeCaughtSpecific[rqKey];
        }
        if (unlock.requirements.defeatSpecific) {
             if (state.stats.challengeSpecificDefeats) delete state.stats.challengeSpecificDefeats[unlock.requirements.defeatSpecific.name];
        }

        if (unlock.requirements.defeatMultipleSpecific) {
             if (state.stats.challengeSpecificDefeats) {
                 for (let ds of unlock.requirements.defeatMultipleSpecific) {
                     delete state.stats.challengeSpecificDefeats[ds.name];
                 }
             }
        }
        if (unlock.requirements.catchSpecies) {
             for (let s of unlock.requirements.catchSpecies) {
                 if (state.stats.caughtSpecies && state.stats.caughtSpecies[s.species] !== undefined) {
                     delete state.stats.caughtSpecies[s.species];
                     state.stats.caughtSpeciesCount = Math.max(0, (state.stats.caughtSpeciesCount || 0) - 1);
                 }
             }
        }
        if (unlock.requirements.catchByQuality) {
            if (state.stats.challengeCaughtSpecific) {
                let qualities = ["Weak", "Regular", "Uncommon", "Rare", "Epic", "Shiny", "Legendary", "Mythical"];
                let targetQualities = [unlock.requirements.catchByQuality.quality];
                if (unlock.requirements.catchByQuality.quality.endsWith('+')) {
                    let baseQuality = unlock.requirements.catchByQuality.quality.slice(0, -1);
                    let idx = qualities.indexOf(baseQuality);
                    if (idx !== -1) {
                        targetQualities = qualities.slice(idx);
                    }
                }
                for (let r of targetQualities) {
                    delete state.stats.challengeCaughtSpecific["Any_" + r];
                }
            }
        }
if (unlock.requirements.catchSpeciesByQuality) {
             for (let s of unlock.requirements.catchSpeciesByQuality) {
                 if (state.stats.challengeCaughtSpecific) delete state.stats.challengeCaughtSpecific[s.species + "_" + s.quality];
             }
        }
        if (unlock.requirements.catchSpeciesByQualityOrHigher) {
             let qualities = ["Weak", "Regular", "Uncommon", "Rare", "Epic", "Shiny", "Legendary", "Mythical"];
             for (let s of unlock.requirements.catchSpeciesByQualityOrHigher) {
                 let idx = qualities.indexOf(s.quality);
                 if (idx !== -1 && state.stats.challengeCaughtSpecific) {
                     for (let i = idx; i < qualities.length; i++) {
                         delete state.stats.challengeCaughtSpecific[s.species + "_" + qualities[i]];
                     }
                 }
             }
        }
        if (unlock.requirements.catchSpeciesAnyOfByQuality) {
             for (let group of unlock.requirements.catchSpeciesAnyOfByQuality) {
                 for (let s of group.species) {
                     if (state.stats.challengeCaughtSpecific) delete state.stats.challengeCaughtSpecific[s + "_" + group.quality];
                 }
             }
        }
        if (unlock.requirements.catchByQualityAndType) {
             if (state.stats.challengeCaughtSpecific) delete state.stats.challengeCaughtSpecific[unlock.requirements.catchByQualityAndType.type + "_" + unlock.requirements.catchByQualityAndType.quality];
        }
        if (unlock.requirements.catchByType) {
             if (state.stats.challengeCaughtSpecific) delete state.stats.challengeCaughtSpecific[unlock.requirements.catchByType.type + "_Any"];
        }
        if (unlock.requirements.catchEachFromSlotMachine) {
             if (unlock.requirements.catchEachFromSlotMachine.machines) {
                 for (let m of unlock.requirements.catchEachFromSlotMachine.machines) {
                     for (let s of m) {
                         if (state.stats.caughtSpecies && state.stats.caughtSpecies[s] !== undefined) {
                             delete state.stats.caughtSpecies[s];
                             state.stats.caughtSpeciesCount = Math.max(0, (state.stats.caughtSpeciesCount || 0) - 1);
                         }
                     }
                 }
             }
        }
    }

    updateUI();
    const challengeWin = document.getElementById('window-challenges');
    if (challengeWin && challengeWin.style.display !== 'none') {
        window.showChallengesModal(); // refresh modal
    } else if (document.getElementById('modal-overlay') && document.getElementById('modal-overlay').style.display !== 'none') {
        window.showChallengesModal(); // refresh modal
    }

};




window.cheatProgressChallenge = function(targetAreaId) {

    if (!targetAreaId && state.stats.activeChallenges && state.stats.activeChallenges.length > 0) targetAreaId = state.stats.activeChallenges[0];
    if (!targetAreaId) return;
    let unlock = window.getCurrentUnlocks().find(u => u.areaId === targetAreaId);
    if (!unlock) return;

    let req = unlock.requirements;
    if (req) {
        if (req.defeatCountRoute) {
            state.stats.challengeRouteDefeats = Math.max(state.stats.challengeRouteDefeats || 0, req.defeatCountRoute.count);
        }
        if (req.catchRouteQuality) {
            if (!state.stats.challengeCaughtSpecific) state.stats.challengeCaughtSpecific = {};
            const rqKey = `Route_${req.catchRouteQuality.route}_${req.catchRouteQuality.quality}`;
            state.stats.challengeCaughtSpecific[rqKey] = Math.max(state.stats.challengeCaughtSpecific[rqKey] || 0, req.catchRouteQuality.count);
        }
        if (req.defeatSpecific) {
            if (req.defeatSpecific.name === '__proto__' || req.defeatSpecific.name === 'constructor' || req.defeatSpecific.name === 'prototype') return;
            if (!state.stats.challengeSpecificDefeats) state.stats.challengeSpecificDefeats = {};
            state.stats.challengeSpecificDefeats[req.defeatSpecific.name] = Math.max(state.stats.challengeSpecificDefeats[req.defeatSpecific.name] || 0, req.defeatSpecific.count);
        }

        if (req.defeatMultipleSpecific) {
            if (!state.stats.challengeSpecificDefeats) state.stats.challengeSpecificDefeats = {};
            for (let ds of req.defeatMultipleSpecific) {
                let key = ds.name || ds.pokemonId;
                if (key === '__proto__' || key === 'constructor' || key === 'prototype') continue;
                state.stats.challengeSpecificDefeats[key] = Math.max(state.stats.challengeSpecificDefeats[key] || 0, ds.count);
            }
        }

        if (req.catchSpeciesUniqueCount) {
            if (!state.stats.caughtSpecies) state.stats.caughtSpecies = {};
            state.stats.caughtSpeciesCount = state.stats.caughtSpeciesCount || 0;
            for (let i = 1; i < state.config.pokemonData.length; i++) {
                 if (state.stats.caughtSpeciesCount >= req.catchSpeciesUniqueCount) break;
                 let p = state.config.pokemonData[i];
                 if (!state.stats.caughtSpecies[p.name]) {
                     state.stats.caughtSpeciesCount++;
                     state.stats.caughtSpecies[p.name] = 1;
                 }
            }
        }

        if (req.catchSpecies) {
            if (!state.stats.caughtSpecies) state.stats.caughtSpecies = {};
            req.catchSpecies.forEach(r => {
                if (r.species === '__proto__' || r.species === 'constructor' || r.species === 'prototype') return;
                if (!state.stats.caughtSpecies[r.species]) {
                    state.stats.caughtSpeciesCount = (state.stats.caughtSpeciesCount || 0) + 1;
                }
                state.stats.caughtSpecies[r.species] = (state.stats.caughtSpecies[r.species] || 0) + r.count;
            });
        }

        if (req.catchSpeciesOr) {
            for (let spec of req.catchSpeciesOr) {
                if (spec.species === '__proto__' || spec.species === 'constructor' || spec.species === 'prototype') continue;
                if (!state.stats.caughtSpecies) state.stats.caughtSpecies = {};
                // Cheat by catching the first one in the list
                state.stats.caughtSpecies[spec.species] = Math.max(state.stats.caughtSpecies[spec.species] || 0, spec.count);
                break; // Just fulfill one
            }
        }
if (req.catchSpeciesByQuality) {
            if (!state.stats.challengeCaughtSpecific) state.stats.challengeCaughtSpecific = {};
            req.catchSpeciesByQuality.forEach(r => {
                let key = r.species + "_" + r.quality;
                if (key === '__proto__' || key === 'constructor' || key === 'prototype') return;
                state.stats.challengeCaughtSpecific[key] = (state.stats.challengeCaughtSpecific[key] || 0) + r.count;
            });
        }
        if (req.catchSpeciesByQualityOrHigher) {
            if (!state.stats.challengeCaughtSpecific) state.stats.challengeCaughtSpecific = {};
            req.catchSpeciesByQualityOrHigher.forEach(r => {
                let key = r.species + "_" + r.quality;
                if (key === '__proto__' || key === 'constructor' || key === 'prototype') return;
                state.stats.challengeCaughtSpecific[key] = (state.stats.challengeCaughtSpecific[key] || 0) + r.count;
            });
        }
        if (req.catchSpeciesAnyOf) {
            if (!state.stats.caughtSpecies) state.stats.caughtSpecies = {};
            req.catchSpeciesAnyOf.forEach(r => {
                let speciesList = Array.isArray(r) ? r : r.species;
                let firstSpecies = speciesList[0];
                if (firstSpecies && typeof firstSpecies === 'object' && firstSpecies.species) {
                    firstSpecies = firstSpecies.species;
                }
                let count = r.count || (Array.isArray(r) && r[0] && r[0].count) || 1;

                if (firstSpecies === '__proto__' || firstSpecies === 'constructor' || firstSpecies === 'prototype') return;
                if (!state.stats.caughtSpecies[firstSpecies]) {
                    state.stats.caughtSpeciesCount = (state.stats.caughtSpeciesCount || 0) + 1;
                }
                state.stats.caughtSpecies[firstSpecies] = (state.stats.caughtSpecies[firstSpecies] || 0) + count;
            });
        }
        if (req.catchSpeciesAnyOfByQuality) {
            if (!state.stats.challengeCaughtSpecific) state.stats.challengeCaughtSpecific = {};
            req.catchSpeciesAnyOfByQuality.forEach(r => {
                // Cheat by catching the first one in the list
                let key = r.species[0] + "_" + r.quality;
                if (key === '__proto__' || key === 'constructor' || key === 'prototype') return;
                state.stats.challengeCaughtSpecific[key] = (state.stats.challengeCaughtSpecific[key] || 0) + r.count;
            });
        }
        if (req.catchEachFromSlotMachine) {
            if (!state.stats.caughtSpecies) state.stats.caughtSpecies = {};
            if (req.catchEachFromSlotMachine.machines) {
                req.catchEachFromSlotMachine.machines.forEach(m => {
                    if (m[0] === '__proto__' || m[0] === 'constructor' || m[0] === 'prototype') return;
                    if (!state.stats.caughtSpecies[m[0]]) {
                        state.stats.caughtSpeciesCount = (state.stats.caughtSpeciesCount || 0) + 1;
                    }
                    state.stats.caughtSpecies[m[0]] = (state.stats.caughtSpecies[m[0]] || 0) + 1;
                });
            } else if (req.catchEachFromSlotMachine.speciesList) {
                req.catchEachFromSlotMachine.speciesList.forEach(s => {
                    if (s === '__proto__' || s === 'constructor' || s === 'prototype') return;
                    if (!state.stats.caughtSpecies[s]) {
                        state.stats.caughtSpeciesCount = (state.stats.caughtSpeciesCount || 0) + 1;
                    }
                    state.stats.caughtSpecies[s] = (state.stats.caughtSpecies[s] || 0) + 1;
                });
            }
        }
        if (req.catchByQuality) {
             let baseQuality = req.catchByQuality.quality.replace('+', '');
             let key = "Any_" + baseQuality;
             if (key === '__proto__' || key === 'constructor' || key === 'prototype') return;
             if (!state.stats.challengeCaughtSpecific) state.stats.challengeCaughtSpecific = {};
             state.stats.challengeCaughtSpecific[key] = (state.stats.challengeCaughtSpecific[key] || 0) + req.catchByQuality.count;
        }
        if (req.catchByQualityAndType) {
             let key = req.catchByQualityAndType.type + "_" + req.catchByQualityAndType.quality;
             if (key === '__proto__' || key === 'constructor' || key === 'prototype') return;
             if (!state.stats.challengeCaughtSpecific) state.stats.challengeCaughtSpecific = {};
             state.stats.challengeCaughtSpecific[key] = (state.stats.challengeCaughtSpecific[key] || 0) + req.catchByQualityAndType.count;
        }
        if (req.catchByType) {
            let typeKey = req.catchByType.type + "_Any";
            if (typeKey === '__proto__' || typeKey === 'constructor' || typeKey === 'prototype') return;
            if (!state.stats.challengeCaughtSpecific) state.stats.challengeCaughtSpecific = {};
            state.stats.challengeCaughtSpecific[typeKey] = (state.stats.challengeCaughtSpecific[typeKey] || 0) + req.catchByType.count;
        }
        if (req.earnBadge) {
            // Only give badge if they don't have it yet to prevent duplicates if cheated multiple times
            let reqGymIndex = req.earnBadge.badgeCount - 1;
            if (state.currentRegionName === 'Johto') {
                reqGymIndex = req.earnBadge.badgeCount <= 8 ? req.earnBadge.badgeCount + 8 : req.earnBadge.badgeCount - 9;
            }
            const hasPending = state.stats.pendingGifts && state.stats.pendingGifts.some(g => g.type === 'badge' && g.gymIndex === reqGymIndex);
            if (state.trainer.badges < req.earnBadge.badgeCount && !hasPending) {
                 if (!state.stats.pendingGifts) state.stats.pendingGifts = [];
                 state.stats.pendingGifts.push({ type: 'badge', gymName: req.earnBadge.name.replace(' Badge', ''), gymIndex: reqGymIndex });
                 // Do not auto-increment badges, the gift claim will do it
            }
        }
        if (req.defeatEliteFourAndChampion) {
            if (!state.stats.defeatedBosses) state.stats.defeatedBosses = {};
            state.stats.defeatedBosses["Pokemon League Lorelei"] = true;
            state.stats.defeatedBosses["Champion Rival"] = true;
        }

        if (req.defeatJohtoChampion) {
            if (!state.stats.defeatedBosses) state.stats.defeatedBosses = {};
            state.stats.defeatedBosses["Johto Champion"] = true;
        }
        if (req.defeatHoennChampion) {
            if (!state.stats.defeatedBosses) state.stats.defeatedBosses = {};
            state.stats.defeatedBosses["Hoenn Champion"] = true;
        }
        if (req.defeatSinnohChampion) {
            if (!state.stats.defeatedBosses) state.stats.defeatedBosses = {};
            state.stats.defeatedBosses["Sinnoh Champion"] = true;
        }
        if (req.defeatUnovaChampion) {
            if (!state.stats.defeatedBosses) state.stats.defeatedBosses = {};
            state.stats.defeatedBosses["Unova Champion"] = true;
        }
        if (req.defeatKalosChampion) {
            if (!state.stats.defeatedBosses) state.stats.defeatedBosses = {};
            state.stats.defeatedBosses["Kalos Champion"] = true;
        }
        if (req.defeatAlolaChampion) {
            if (!state.stats.defeatedBosses) state.stats.defeatedBosses = {};
            state.stats.defeatedBosses["Alola Champion"] = true;
        }
        if (req.defeatHisuiChampion) {
            if (!state.stats.defeatedBosses) state.stats.defeatedBosses = {};
            state.stats.defeatedBosses["Hisui Champion"] = true;
        }
        if (req.defeatGalarChampion) {
            if (!state.stats.defeatedBosses) state.stats.defeatedBosses = {};
            state.stats.defeatedBosses["Galar Champion"] = true;
        }
        if (req.defeatRed) {
            if (!state.stats.defeatedBosses) state.stats.defeatedBosses = {};
            state.stats.defeatedBosses["Red"] = true;
        }




        if (req.completeAnyOfChallenges) {
            if (!state.stats.completedChallengeIds) state.stats.completedChallengeIds = [];
            for (let c of req.completeAnyOfChallenges) {
                let match = window.getCurrentUnlocks().find(u => u.challengeName === c || u.areaId === c);
                let idToPush = match ? match.areaId : c;
                if (!state.stats.completedChallengeIds.includes(idToPush)) {
                    state.stats.completedChallengeIds.push(idToPush);
                }
            }
        }

        if (req.completeChallenges) {
            if (!state.stats.completedChallengeIds) state.stats.completedChallengeIds = [];
            for (let c of req.completeChallenges) {
                let match = window.getCurrentUnlocks().find(u => u.challengeName === c || u.areaId === c);
                let idToPush = match ? match.areaId : c;
                if (!state.stats.completedChallengeIds.includes(idToPush)) {
                    state.stats.completedChallengeIds.push(idToPush);
                }
            }
        }

    }
    // Auto-collect any pending gym/badge gifts so the challenge can be claimed immediately
    if (state.stats.pendingGifts && state.stats.pendingGifts.length > 0 && typeof window.claimPendingGift === 'function') {
        const giftWin = document.getElementById('window-gifts');
        const wasGiftOpen = giftWin && giftWin.style.display !== 'none';
        for (let i = state.stats.pendingGifts.length - 1; i >= 0; i--) {
            if (state.stats.pendingGifts[i] && state.stats.pendingGifts[i].type === 'badge') {
                window.claimPendingGift(i);
            }
        }
        if (!wasGiftOpen && window.windowManager) {
            window.windowManager.closeDynamicWindow('window-gifts');
        }
    }

    if (window.updateUI) window.updateUI();
    const challengeWinCheat = document.getElementById('window-challenges');
    if (challengeWinCheat && challengeWinCheat.style.display !== 'none') {
        window.showChallengesModal(); // refresh modal
    } else if (document.getElementById('modal-overlay') && document.getElementById('modal-overlay').style.display !== 'none') {
        window.showChallengesModal(); // refresh modal
    }

    // Find the Complete button in the modal and click it
    setTimeout(() => {
        const modal = document.getElementById('window-challenges');
        if (modal) {
            const completeBtns = Array.from(modal.querySelectorAll('button')).filter(btn => btn.classList.contains('pc-btn-complete') || btn.innerText.includes('Claim') || btn.innerText.includes('Complete'));
            if (completeBtns.length > 0) {
                // Find the specific complete button for this area
                const safeAreaId = targetAreaId.replace(/'/g, "\\'");
                const specificBtn = completeBtns.find(btn => btn.dataset?.areaId === targetAreaId || (btn.getAttribute('onclick') && btn.getAttribute('onclick').includes(safeAreaId)));
                if (specificBtn) specificBtn.click();
                else completeBtns[0].click();
            }
        }
    }, 100);

};

function buildRewardPills(unlock) {
    let pills = [];
    if (unlock.unlocks && unlock.unlocks.length > 0) {
        for (let area of unlock.unlocks) {
            pills.push(`<span class="pc-reward-pill">🗺️ ${area}</span>`);
        }
    }
    if (unlock.gift || unlock.gifts) {
        pills.push(`<span class="pc-reward-pill is-gift">🎁 Gift</span>`);
    }
    if (pills.length === 0) {
        pills.push(`<span class="pc-reward-pill">🗺️ Next Area</span>`);
    }
    return pills.join('');
}

window.togglePastChallenges = function() {
    const list = document.getElementById('pc-past-challenges-list');
    const btn = document.getElementById('pc-past-toggle-btn');
    if (!list || !btn) return;
    const isHidden = list.style.display === 'none';
    list.style.display = isHidden ? 'flex' : 'none';
    btn.textContent = isHidden ? 'Hide' : 'Show';
};

window.showChallengesModal = function() {
    const unlocks = window.getCurrentUnlocks();
    if (!unlocks) return;

    const regionName = state.currentRegionName || "Kanto";
    const activeChallenges = state.stats.activeChallenges || [];
    const activeChallengesCount = activeChallenges.length;

    let actualCompletedIds = [];
    if (state.stats.completedChallengeIds) {
        const unlockSet = new Set(unlocks.map(u => u.areaId));
        actualCompletedIds = state.stats.completedChallengeIds.filter(id => unlockSet.has(id));
    }
    const completedCount = actualCompletedIds.length;
    const totalCount = unlocks.length;
    const overallPct = totalCount > 0 ? Math.min(100, Math.round((completedCount / totalCount) * 100)) : 0;

    let readyCount = 0;
    const activeCardsData = [];
    for (let activeId of activeChallenges) {
        let unlock = unlocks.find(u => u.areaId === activeId);
        if (!unlock) continue;
        let cData = getChallengeData(unlock);
        if (cData.isMet) readyCount++;
        activeCardsData.push({ unlock, cData });
    }

    let html = `<div id="challenges-content-wrapper" class="content-panel pc-wrapper">`;

    // Regional Summary Banner
    html += `<div class="pc-summary-bar">
                <div class="pc-summary-stats">
                    <span class="pc-summary-title">${regionName} Progress</span>
                    <span class="pc-summary-pill">🏆 ${completedCount} / ${totalCount} Completed</span>`;
    if (readyCount > 0) {
        html += `<span class="pc-summary-pill is-ready">✨ ${readyCount} Claim</span>`;
    }
    html += `   </div>
                <div class="pc-summary-progress">
                    <div class="pc-summary-progress-label">
                        <span>Region Completion</span>
                        <span>${overallPct}%</span>
                    </div>
                    <div class="pc-progress-track">
                        <div class="pc-progress-fill ${overallPct === 100 ? 'is-met' : ''}" style="width: ${overallPct}%;"></div>
                    </div>
                </div>
             </div>`;

    // Active Challenges Sector
    html += `<div class="pc-section">
                <div class="pc-section-header">
                    <h3 class="pc-section-title">${activeChallengesCount > 1 ? 'Active Challenges' : 'Active Challenge'} <span class="pc-count-badge">${activeChallengesCount}</span></h3>
                </div>
                <div class="pc-cards-list">`;

    if (activeCardsData.length === 0) {
        html += `<div class="pc-empty-state">
                    <div class="pc-empty-icon">🏆</div>
                    <div class="pc-empty-title">All Challenges Completed!</div>
                    <div class="pc-empty-sub">Your next goal is to earn all regional Medals.</div>
                 </div>`;
    } else {
        for (let { unlock, cData } of activeCardsData) {
            let isExtra = unlock.challengeName && unlock.challengeName.includes("Extra");
            let displayName = unlock.challengeName || (isExtra ? 'Extra Challenge - ' + unlock.areaId : 'Challenge - ' + unlock.areaId);
            let cardClasses = `pc-card${isExtra ? ' is-extra' : ''}${cData.isMet ? ' is-ready' : ''}`;
            let safeAreaId = unlock.areaId.replace(/'/g, "\\'");
            const attrAreaId = unlock.areaId.replace(/&/g, '&amp;').replace(/"/g, '&quot;').replace(/'/g, '&#39;');

            let headerActions = `<button class="pc-btn-cheat" onclick="window.cheatProgressChallenge('${safeAreaId}')">Cheat</button>`;
            if (cData.isMet) {
                headerActions += `<button class="pc-btn-complete" data-area-id="${attrAreaId}" onclick="window.completeChallenge('${safeAreaId}')">Claim ✔️</button>`;
            } else {
                headerActions += `<span class="pc-status-badge">In Progress</span>`;
            }

            html += `<div class="${cardClasses}">
                        <div class="pc-card-header">
                            <div class="pc-card-title-group">
                                <span class="pc-type-tag">${isExtra ? 'Extra' : 'Main'}</span>
                                <span class="pc-card-title">${displayName}</span>
                                <span class="pc-inline-rewards">${buildRewardPills(unlock)}</span>
                            </div>
                            <div class="pc-header-actions">
                                ${headerActions}
                            </div>
                        </div>`;

            html += `<ul class="pc-req-list">`;
            const progressList = cData.progressList || [];
            for (let idx = 0; idx < cData.textParts.length; idx++) {
                const part = cData.textParts[idx];
                const prog = progressList[idx];
                const isReqMet = prog ? prog.isMet : false;
                let barHtml = '';
                if (prog && typeof prog.required === 'number' && prog.required > 0) {
                    const currentVal = Math.min(prog.current || 0, prog.required);
                    const pct = Math.min(100, Math.round((currentVal / prog.required) * 100));
                    barHtml = `<div class="pc-progress-track">
                                   <div class="pc-progress-fill ${isReqMet ? 'is-met' : ''}" style="width: ${pct}%;"></div>
                               </div>`;
                }
                html += `<li class="pc-req-item ${isReqMet ? 'is-met' : ''}">
                            <div class="pc-req-top">
                                <span class="pc-req-text">${part}</span>
                            </div>
                            ${barHtml}
                         </li>`;
            }
            html += `</ul></div>`;
        }
    }

    html += `</div></div>`;

    // Past Challenges Sector
    if (completedCount > 0) {
        let pastTitle = completedCount === 1 ? "Past Challenge" : "Past Challenges";
        const defaultCollapsed = activeCardsData.length > 0;
        html += `<div class="pc-section">
                    <div class="pc-section-header">
                        <h3 class="pc-section-title">${pastTitle} <span class="pc-count-badge">${completedCount}</span></h3>
                        <button id="pc-past-toggle-btn" class="pc-toggle-btn" onclick="window.togglePastChallenges()">${defaultCollapsed ? 'Show' : 'Hide'}</button>
                    </div>
                    <div id="pc-past-challenges-list" class="pc-cards-list" style="display: ${defaultCollapsed ? 'none' : 'flex'};">`;

        for (let i = actualCompletedIds.length - 1; i >= 0; i--) {
            let completedId = actualCompletedIds[i];
            let pUnlock = unlocks.find(u => u.areaId === completedId);
            if (!pUnlock) continue;

            let isExtra = pUnlock.challengeName && pUnlock.challengeName.includes("Extra");
            let pData = getChallengeData(pUnlock);
            let displayName = pUnlock.challengeName || (isExtra ? 'Extra Challenge - ' + pUnlock.areaId : 'Challenge - ' + pUnlock.areaId);

            html += `<div class="pc-card is-past ${isExtra ? 'is-extra' : ''}">
                        <div class="pc-card-header">
                            <div class="pc-card-title-group">
                                <span class="pc-type-tag">${isExtra ? 'Extra' : 'Main'}</span>
                                <span class="pc-card-title">${displayName}</span>
                            </div>
                            <span class="pc-status-badge is-done">Completed</span>
                        </div>
                        <ul class="pc-req-list">`;
            for (let part of pData.textParts) {
                part = part.replace(/\(\d+\/(\d+)\)/, (match, p1) => `(${p1}/${p1})`);
                if (!part.includes("[Complete]")) {
                    part += ` <span style="color: #4ade80;">[Complete]</span>`;
                }
                part = part.replace(/color: red/g, 'color: #4ade80');
                html += `<li class="pc-req-item is-met">
                            <div class="pc-req-top">
                                <span class="pc-req-text">${part}</span>
                            </div>
                         </li>`;
            }
            html += `</ul>
                     <div class="pc-rewards-row">
                        <span class="pc-rewards-label">Rewards</span>
                        ${buildRewardPills(pUnlock)}
                     </div>
                     </div>`;
        }
        html += `</div></div>`;
    }

    html += `</div>`;

    showModal("Progress Challenges", html, "window-challenges", "800px");
    const win = document.getElementById("window-challenges");
    if (win) {
        win.style.maxHeight = '80vh';
        const contentContainer = win.querySelector('.window-content-container');
        if (contentContainer) {
            contentContainer.style.overflowY = 'auto';
        }
        // Clear any corrupted saved dimensions for window-challenges
        if (state.settings?.windowSettings?.['window-challenges']) {
            const saved = state.settings.windowSettings['window-challenges'];
            const sw = parseInt(saved.width, 10);
            const sh = parseInt(saved.height, 10);
            if (!sw || sw < 300 || !sh || sh < 200) {
                delete state.settings.windowSettings['window-challenges'];
                win.style.width = '800px';
                win.style.height = 'auto';
                if (window.windowManager) {
                    window.windowManager.recalculateWindowSize('window-challenges');
                }
            }
        }
    }
};
window.dragOver = dragOver;
window.handleDrop = handleDrop;
window.showDamage = showDamage;
window.playCombatAnimations = playCombatAnimations;
window.triggerDefeatAnimation = triggerDefeatAnimation;
window.showLoot = showLoot;
window.showLevelUp = showLevelUp;
window.setLeader = function(idx) {
    if (typeof window.trackDailyChallenge === 'function') window.trackDailyChallenge('defeat_endurance', { streak: 0 });
    if (idx === 0) return;
    if (globals.battleSystem) {
        globals.battleSystem.switchLeader(idx);
    } else {
        const newLeader = state.party.splice(idx, 1)[0];
        state.party.unshift(newLeader);
        updateUI();
    }
};

window.startGymBattle = function(gymName) {
    if (globals.battleSystem) {
        globals.battleSystem.startGymBattle(gymName);
    }
};

window.closeModal = function(windowId) {
    if (windowId && typeof windowId === 'string' && window.windowManager) {
        window.windowManager.closeDynamicWindow(windowId);
    } else {
        const overlay = document.getElementById('modal-overlay');
        if (overlay) overlay.style.display = 'none';
        const modalBox = document.getElementById('modal-content-box');
        if (modalBox && modalBox.dataset.originalStyles !== undefined) {
            modalBox.setAttribute('style', modalBox.dataset.originalStyles);
            delete modalBox.dataset.originalStyles;
        }
    }
};



export function generateCatchRateHtml(showShiny = false) {
    const balls = ["Pokeball", "Greatball", "Ultraball", "Safariball", "Masterball"];
    const targetTracker = showShiny ? (state.stats.shinyCatchAttempts || {}) : (state.stats.catchAttempts || {});

    // Collect all pokemon that have been thrown at
    let rowData = [];
    if (state.config && state.config.pokemonData) {
        state.config.pokemonData.forEach(p => {
            const data = targetTracker[p.name];
            if (data) {
                // Check if any ball was thrown
                let anyThrown = false;
                balls.forEach(b => {
                    if (data[b] && data[b].thrown > 0) anyThrown = true;
                });

                if (anyThrown) {
                    rowData.push({
                        id: p.id,
                        name: p.name,
                        data: data
                    });
                }
            }
        });
        // Sort by dex number ascending
        rowData.sort((a, b) => a.id - b.id);
    }

    // Totals per ball
    const totals = {};
    balls.forEach(b => { totals[b] = { caught: 0, thrown: 0 }; });
    rowData.forEach(row => {
        balls.forEach(b => {
            if (row.data[b] && row.data[b].thrown > 0) {
                totals[b].caught += row.data[b].caught || 0;
                totals[b].thrown += row.data[b].thrown || 0;
            }
        });
    });

    const formatRate = (caught, thrown) => {
        if (!thrown) return '';
        const pct = (caught / thrown) * 100;
        const color = pct >= 50 ? '#4ade80' : pct >= 20 ? '#facc15' : '#f87171';
        return `<div style="font-size: 11px; color: ${color}; font-weight: bold;">${pct.toFixed(1)}%</div>`;
    };

    let html = `<div style="padding: 14px; box-sizing: border-box;">
    <div style="margin-bottom: 10px; display: flex; justify-content: center;">
        <input id="catch-rate-search" class="piw-input" type="text" placeholder="Search Pokémon..." style="width: 240px;">
    </div>
    <div style="max-height: 55vh; overflow-y: auto; border-radius: 10px; border: 1px solid rgba(148, 163, 184, 0.22); background: var(--piw-bg-panel);">
        <table id="catch-rate-table" style="width: 100%; border-collapse: separate; border-spacing: 0; text-align: center; color: white;">
            <thead style="position: sticky; top: 0; background: #0f172a; z-index: 2;">
                <tr>
                    <th style="padding: 8px; border-bottom: 1.5px solid rgba(45, 212, 191, 0.45);">Pokémon</th>`;

    balls.forEach(b => {
        html += `<th style="padding: 8px; border-bottom: 1.5px solid rgba(45, 212, 191, 0.45);">
            <img src="Assets/Items/Balls/${b}.png" style="width: 24px; height: 24px;" alt="${b}" title="${b}"><br>${b}
        </th>`;
    });

    html += `   </tr>
            </thead>
            <tbody>`;

    if (rowData.length === 0) {
        html += `<tr><td colspan="${balls.length + 1}" style="padding: 20px; font-style: italic; color: #94a3b8;">No ${showShiny ? 'shiny ' : ''}catch attempts recorded yet.</td></tr>`;
    } else {
        rowData.forEach((row, idx) => {
            const rowBg = idx % 2 === 0 ? 'rgba(0,0,0,0.2)' : 'rgba(255,255,255,0.03)';
            html += `<tr class="catch-rate-row" data-name="#${row.id} ${row.name.toLowerCase()}" style="border-bottom: 1px solid #334155; background: ${rowBg};">
                <td style="padding: 8px; font-weight: bold; text-align: left;">#${row.id} ${row.name}</td>`;

            balls.forEach(b => {
                const bData = row.data[b];
                if (bData && bData.thrown > 0) {
                    html += `<td style="padding: 8px;"><div>${bData.caught} / ${bData.thrown}</div>${formatRate(bData.caught, bData.thrown)}</td>`;
                } else {
                    html += `<td style="padding: 8px; color: #64748b;">-</td>`;
                }
            });

            html += `</tr>`;
        });
    }

    html += `   </tbody>
            <tfoot style="position: sticky; bottom: 0; background: #0f172a; z-index: 2;">
                <tr>
                    <td style="padding: 8px; font-weight: bold; text-align: left; border-top: 2px solid #3498db;">Total</td>`;
    balls.forEach(b => {
        const t = totals[b];
        if (t.thrown > 0) {
            html += `<td style="padding: 8px; border-top: 2px solid #3498db;"><div>${t.caught} / ${t.thrown}</div>${formatRate(t.caught, t.thrown)}</td>`;
        } else {
            html += `<td style="padding: 8px; color: #64748b; border-top: 2px solid #3498db;">-</td>`;
        }
    });
    html += `       </tr>
            </tfoot>
        </table>
    </div>
    </div>`;

    return html;
}

export function showCatchRateModal(showShiny = false) {
    const html = generateCatchRateHtml(showShiny);
    showModal("Catch Rate", html, "window-catch-rate", "800px", "auto");
    const win = document.getElementById('window-catch-rate');
    if (win) {
        const innerContent = win.querySelector('.window-content-container');
        if (innerContent) {
            innerContent.style.setProperty('padding', '0px', 'important');
        }
    }
    // We override the button action just for standalone modal use

}

export function showModal(title, htmlContent, windowId = 'dynamic-modal', width = '800px', height = 'auto') {
    if (window.windowManager) {
        window.windowManager.createDynamicWindow(windowId, title, htmlContent, width, height);

        // Ensure map window resizes properly without gaps
        if (windowId === 'window-map') {
            const winEl = document.getElementById(windowId);
            if (winEl) {
                const hasSavedWidth = Boolean(state.settings?.windowSettings?.['window-map']?.width);
                if (!hasSavedWidth) {
                    winEl.style.width = width;
                    winEl.style.height = 'auto'; // allow height to match content wrapper
                }

                // Remove internal padding from map content panel
                const contentPanel = winEl.querySelector('.content-panel');
                if (contentPanel) {
                    contentPanel.style.padding = '0';
                    contentPanel.style.overflow = 'hidden'; // no scrolling needed for map
                }
                const scaler = winEl.querySelector('.window-content-scaler');
                if (scaler) {
                    scaler.style.height = '100%';
                    scaler.style.width = '100%';
                }
            }
        }
    }
}

const profTasks = {
    q: [
        { req: 50, stat: 'weakPlusCaptures', text: "Capture 50 Weak+ Pokemons", reward: "Low Quality Booster", effect: "+15% Quality Bonus" },
        { req: 100, stat: 'regularPlusCaptures', text: "Capture 100 Regular+ Pokemons", reward: "Regular Quality Booster", effect: "+30% Quality Bonus" },
        { req: 250, stat: 'uncommonPlusCaptures', text: "Capture 250 Uncommon+ Pokemons", reward: "Good Quality Booster", effect: "+45% Quality Bonus" },
        { req: 500, stat: 'rarePlusCaptures', text: "Capture 500 Rare+ Pokemons", reward: "Excellent Quality Booster", effect: "+70% Quality Bonus" },
        { req: 300, stat: 'epicPlusCaptures', text: "Capture 300 Epic+ Pokemons", reward: "Master Quality Booster", effect: "+100% Quality Bonus" }
    ],
    c: [
        { req: 100, text: "Capture 100 Pokemons", reward: "Low Catch Booster", effect: "+5% Catch Rate" },
        { req: 300, text: "Capture 300 Pokemons", reward: "Regular Catch Booster", effect: "+10% Catch Rate" },
        { req: 750, text: "Capture 750 Pokemons", reward: "Good Catch Booster", effect: "+15% Catch Rate" },
        { req: 1500, text: "Capture 1500 Pokemons", reward: "Excellent Catch Booster", effect: "+20% Catch Rate" },
        { req: 3000, text: "Capture 3000 Pokemons", reward: "Master Catch Booster", effect: "+25% Catch Rate" }
    ],
    level: [
        { req: 1000, stat: 'caughtLvl15', text: "Catch 1000 Pokemons with level >= 15", reward: "Low Level Booster", effect: "+50% XP for level < 15" },
        { req: 2500, stat: 'caughtLvl30', text: "Catch 2500 Pokemons with level >= 30", reward: "Regular Level Booster", effect: "+50% XP for level < 30" },
        { req: 5000, stat: 'caughtLvl45', text: "Catch 5000 Pokemons with level >= 45", reward: "Good Level Booster", effect: "+50% XP for level < 45" },
        { req: 10000, stat: 'caughtLvl60', text: "Catch 10000 Pokemons with level >= 60", reward: "Excellent Level Booster", effect: "+50% XP for level < 60" },
        { req: 25000, stat: 'caughtLvl75', text: "Catch 25000 Pokemons with level >= 75", reward: "Master Level Booster", effect: "+50% XP for level < 75" }
    ],
    shinySeen: [
        { req: 1, text: "See 1 Shiny Pokemon", reward: "Regular Shiny Booster", effect: "+1 Shiny Roll" },
        { req: 2, text: "See 2 Shiny Pokemons", reward: "Good Shiny Booster", effect: "+2 Shiny Rolls" },
        { req: 4, text: "See 4 Shiny Pokemons", reward: "Catch Shiny Booster", effect: "2x Catch Rate on Shinies" }
    ],
    shinyCaught: [
        { req: 1, text: "Catch 1 Shiny Pokemon", reward: "Shiny IV Booster", effect: "+25% IVs for Shinies" }
    ],
    iv: [
        { req: 50, stat: 'caughtIVUnder300', text: "Catch 50 Pokemons with IV < 300", reward: "Low IV Booster", effect: "+5% IVs" },
        { req: 200, stat: 'caughtIVUnder350', text: "Catch 200 Pokemons with IV < 350", reward: "Regular IV Booster", effect: "+10% IVs" },
        { req: 500, stat: 'caughtIVUnder400', text: "Catch 500 Pokemons with IV < 400", reward: "Good IV Booster", effect: "+15% IVs" },
        { req: 1000, stat: 'caughtIVUnder450', text: "Catch 1000 Pokemons with IV < 450", reward: "Excellent IV Booster", effect: "+20% IVs" },
        { req: 2000, stat: 'caughtIVUnder500', text: "Catch 2000 Pokemons with IV < 500", reward: "Master IV Booster", effect: "+25% IVs" }
    ],
    final: [
        { req: 151, text: "Capture 151 Pokemon species", reward: "Final Shiny Booster", effect: "12x Shiny Rolls" }
    ]
};

window.getProfTaskAvailableCount = function() {
    let count = 0;

    // Quality
    let qTier = state.stats.qTaskTier || 0;
    if (qTier < profTasks.q.length) {
        if ((state.stats[profTasks.q[qTier].stat] || 0) >= profTasks.q[qTier].req) count++;
    }

    // Catch
    let cTier = state.stats.cTaskTier || 0;
    if (cTier < profTasks.c.length) {
        if ((state.stats.caught || 0) >= profTasks.c[cTier].req) count++;
    }

    // IV
    let ivTier = state.stats.ivTaskTier || 0;
    if (ivTier < profTasks.iv.length) {
        if ((state.stats[profTasks.iv[ivTier].stat] || 0) >= profTasks.iv[ivTier].req) count++;
    }

    // Level
    let levelTier = state.stats.levelTaskTier || 0;
    if (levelTier < profTasks.level.length) {
        if ((state.stats[profTasks.level[levelTier].stat] || 0) >= profTasks.level[levelTier].req) count++;
    }

    // Shiny Seen
    let seenTier = state.stats.shinySeenTaskTier || 0;
    if (seenTier < profTasks.shinySeen.length) {
        if ((state.stats.shiniesSeen || 0) >= profTasks.shinySeen[seenTier].req) count++;
    }

    // Shiny Caught
    let caughtTier = state.stats.shinyCaughtTaskTier || 0;
    if (caughtTier < profTasks.shinyCaught.length) {
        if ((state.stats.shiniesCaught || 0) >= profTasks.shinyCaught[caughtTier].req) count++;
    }

    // Final
    let finalTier = state.stats.finalTaskTier || 0;
    if (finalTier < profTasks.final.length) {
        let currentSpeciesCount = (state.stats.caughtSpeciesCount || 0);
        let currentRegionName = state.currentRegionName || 'Kanto';
        let regionIdField = currentRegionName.toLowerCase() + '_id';
        let totalSpecies = state.config.pokemonData.filter(p => Number.isInteger(p.id) && p[regionIdField] !== undefined).length;
        if (currentSpeciesCount >= totalSpecies) count++;
    }

    return count;
};

window.claimProfTaskReward = function(type) {
    if (type === 'q') state.stats.qTaskTier = (state.stats.qTaskTier || 0) + 1;
    if (type === 'c') state.stats.cTaskTier = (state.stats.cTaskTier || 0) + 1;
    if (type === 'level') state.stats.levelTaskTier = (state.stats.levelTaskTier || 0) + 1;
    if (type === 'shinySeen') state.stats.shinySeenTaskTier = (state.stats.shinySeenTaskTier || 0) + 1;
    if (type === 'shinyCaught') state.stats.shinyCaughtTaskTier = (state.stats.shinyCaughtTaskTier || 0) + 1;
    if (type === 'iv') state.stats.ivTaskTier = (state.stats.ivTaskTier || 0) + 1;
    if (type === 'final') state.stats.finalTaskTier = (state.stats.finalTaskTier || 0) + 1;
    window.showProfLabModal();
};

window.cheatCompleteProfTask = function(type) {
    let tier = 0;
    let statName = "";
    if (type === 'q') {
        tier = state.stats.qTaskTier || 0;
        if (tier < profTasks.q.length) {
            statName = profTasks.q[tier].stat;
            state.stats[statName] = Math.max(state.stats[statName] || 0, profTasks.q[tier].req);
        }
    }
    if (type === 'c') {
        tier = state.stats.cTaskTier || 0;
        if (tier < profTasks.c.length) state.stats.caught = Math.max(state.stats.caught || 0, profTasks.c[tier].req);
    }
    if (type === 'shinySeen') {
        tier = state.stats.shinySeenTaskTier || 0;
        if (tier < profTasks.shinySeen.length) state.stats.shiniesSeen = Math.max(state.stats.shiniesSeen || 0, profTasks.shinySeen[tier].req);
    }
    if (type === 'shinyCaught') {
        tier = state.stats.shinyCaughtTaskTier || 0;
        if (tier < profTasks.shinyCaught.length) state.stats.shiniesCaught = Math.max(state.stats.shiniesCaught || 0, profTasks.shinyCaught[tier].req);
    }
    if (type === 'level') {
        tier = state.stats.levelTaskTier || 0;
        if (tier < profTasks.level.length) {
            statName = profTasks.level[tier].stat;
            state.stats[statName] = Math.max(state.stats[statName] || 0, profTasks.level[tier].req);
        }
    }
    if (type === 'iv') {
        tier = state.stats.ivTaskTier || 0;
        if (tier < profTasks.iv.length) {
            statName = profTasks.iv[tier].stat;
            state.stats[statName] = Math.max(state.stats[statName] || 0, profTasks.iv[tier].req);
        }
    }
    if (type === 'final') {
        if (!state.stats.caughtSpecies) state.stats.caughtSpecies = {};
        const caught = state.stats.caughtSpecies;
        const names = state.config.allPokemonNames || state.config.pokemonData.map(p => p.name);

        const caughtCount = Object.keys(caught).length;

        if (caughtCount < names.length) {
            for (let i = 0, len = names.length; i < len; i++) {
                const name = names[i];
                if (caught[name] === undefined) caught[name] = 1;
            }
        }
        state.stats.caughtSpeciesCount = Object.keys(caught).length;
    }
    window.showProfLabModal();
};

window.showProfLabModal = function() {
    if (state.stats.showProfLobbyNotification) {
        state.stats.showProfLobbyNotification = false;
        renderProfessorLab(); // Clear the notification from the lobby button
    }

    let html = `<div class="content-panel" style="display:flex; flex-direction:column; gap:15px; text-align:left; height: 100%; overflow-y: auto;">`;

    const renderActiveTask = (type, currentVal, tierIdx, taskList) => {
        if (tierIdx >= taskList.length) {
            return ``;
        }

        let task = taskList[tierIdx];
        let isComplete = currentVal >= task.req;

        let barHtml = "";
        if (isComplete) {
            barHtml = `
                <button class="piw-btn piw-btn-success" onclick="window.claimProfTaskReward('${type}')" style="width: 100%; margin-top: 6px; padding: 7px 10px; font-size: 12px;">
                    Claim: ${task.reward}
                </button>
            `;
        } else {
            let pct = Math.min(100, Math.floor((currentVal / task.req) * 100));
            barHtml = `
                <div class="piw-progress-track" style="height: 20px; position: relative; margin-top: 6px; display: flex; align-items: center;">
                    <div class="piw-progress-fill is-green" style="width: ${pct}%; height: 100%;"></div>
                    <span style="position: absolute; width: 100%; text-align: center; color: #f8fafc; font-size: 10.5px; font-weight: 800; text-shadow: 0 1px 2px rgba(0,0,0,0.85); pointer-events: none;">
                        ${currentVal.toLocaleString('en-US')} / ${task.req.toLocaleString('en-US')}
                    </span>
                </div>
            `;
        }

        return `
            <div style="margin-bottom: 10px; font-size: 12.5px;">
                <div style="display: flex; justify-content: space-between; align-items: center; gap: 8px;">
                    <span style="color: var(--piw-text-primary); font-weight: 600;">${task.text}</span>
                    <button class="piw-btn piw-btn-danger piw-btn-sm" onclick="window.cheatCompleteProfTask('${type}')" style="font-size: 10px; padding: 2px 7px;">Cheat</button>
                </div>
                ${barHtml}
            </div>
        `;
    };

    const renderCard = (title, type, currentVal, tierIdx, taskList, keepAllRewards) => {
        if (tierIdx >= taskList.length) {
            title = title.replace("Assignment", "Reward");
        }
        let taskHtml = renderActiveTask(type, currentVal, tierIdx, taskList);

        let rewardsHtml = "";
        if (tierIdx > 0) {
            if (keepAllRewards) {
                for (let i = 0; i < tierIdx; i++) {
                    rewardsHtml += `
                        <div style="font-size: 11px; margin-top: 6px; padding-left: 8px; border-left: 2px solid #22c55e; color: var(--piw-text-secondary);">
                            <b>${taskList[i].reward}</b>: <span style="color: #4ade80;">${taskList[i].effect}</span>
                        </div>
                    `;
                }
            } else {
                let topReward = taskList[tierIdx - 1];
                rewardsHtml += `
                    <div style="font-size: 11px; margin-top: 6px; padding-left: 8px; border-left: 2px solid #22c55e; color: var(--piw-text-secondary);">
                        <b>${topReward.reward}</b>: <span style="color: #4ade80;">${topReward.effect}</span>
                    </div>
                `;
            }
        }

        return `
            <div class="piw-card" style="padding: 12px 14px;">
                <h3 style="margin: 0 0 10px 0; border-bottom: var(--piw-border-subtle); padding-bottom: 6px; font-size: 13px; font-weight: 800; color: var(--piw-accent-teal); text-transform: uppercase; letter-spacing: 0.4px;">${title}</h3>
                ${taskHtml}
                ${rewardsHtml}
            </div>
        `;
    };

    // Quality Card
    let qTier = state.stats.qTaskTier || 0;
    let qCurrentVal = 0;
    if (qTier < profTasks.q.length) {
        qCurrentVal = state.stats[profTasks.q[qTier].stat] || 0;
    } else if (profTasks.q.length > 0) {
        qCurrentVal = state.stats[profTasks.q[profTasks.q.length - 1].stat] || 0;
    }
    html += renderCard("Quality Assignment", 'q', qCurrentVal, qTier, profTasks.q, false);

    // Catch Card
    html += renderCard("Catch Assignment", 'c', state.stats.caught || 0, state.stats.cTaskTier || 0, profTasks.c, false);

    // IV Card
    let ivTier = state.stats.ivTaskTier || 0;
    let ivCurrentVal = 0;
    if (ivTier < profTasks.iv.length) {
        ivCurrentVal = state.stats[profTasks.iv[ivTier].stat] || 0;
    } else if (profTasks.iv.length > 0) {
        ivCurrentVal = state.stats[profTasks.iv[profTasks.iv.length - 1].stat] || 0; // fallback if completed
    }
    html += renderCard("IV Assignment", 'iv', ivCurrentVal, ivTier, profTasks.iv, false);

    // Level Card
    let levelTier = state.stats.levelTaskTier || 0;
    let levelCurrentVal = 0;
    if (levelTier < profTasks.level.length) {
        levelCurrentVal = state.stats[profTasks.level[levelTier].stat] || 0;
    } else if (profTasks.level.length > 0) {
        levelCurrentVal = state.stats[profTasks.level[profTasks.level.length - 1].stat] || 0; // fallback if completed
    }
    html += renderCard("Level Assignment", 'level', levelCurrentVal, levelTier, profTasks.level, true);

    // Shiny Card (Combined seen and caught, keeps all rewards but obsolete regular seen shiny is removed by good shiny)
    let seenTier = state.stats.shinySeenTaskTier || 0;
    let caughtTier = state.stats.shinyCaughtTaskTier || 0;

    let shinySeenTaskHtml = renderActiveTask('shinySeen', state.stats.shiniesSeen || 0, seenTier, profTasks.shinySeen);
    let shinyCaughtTaskHtml = renderActiveTask('shinyCaught', state.stats.shiniesCaught || 0, caughtTier, profTasks.shinyCaught);

    // Final Task inside Shiny Assignment
    let finalTier = state.stats.finalTaskTier || 0;
    let finalCurrentVal = (state.stats.caughtSpeciesCount || 0);
    let currentRegionName = state.currentRegionName || 'Kanto';
    let regionIdField = currentRegionName.toLowerCase() + '_id';
    let totalSpecies = state.config.pokemonData.filter(p => Number.isInteger(p.id) && p[regionIdField] !== undefined).length;

    if (finalTier >= profTasks.final.length && profTasks.final.length > 0) {
        finalCurrentVal = totalSpecies;
    }
    if (profTasks.final.length > 0) {
        profTasks.final[0].req = totalSpecies;
        profTasks.final[0].text = `Capture ${totalSpecies} Pokemon species`;
    }

    let finalTaskHtml = "";
    if (profTasks.final.length > 0) {
        finalTaskHtml = renderActiveTask('final', finalCurrentVal, finalTier, profTasks.final);
    }

    let shinyTitle = "Shiny Assignment";

    if (seenTier >= profTasks.shinySeen.length && caughtTier >= profTasks.shinyCaught.length && finalTier >= profTasks.final.length) {
        shinyTitle = "Shiny Reward";
        shinySeenTaskHtml = "";
        shinyCaughtTaskHtml = "";
        finalTaskHtml = "";
    } else {
        if (seenTier >= profTasks.shinySeen.length) shinySeenTaskHtml = "";
        if (caughtTier >= profTasks.shinyCaught.length) shinyCaughtTaskHtml = "";
        if (finalTier >= profTasks.final.length) finalTaskHtml = "";
    }

    let shinyRewardsHtml = "";

    // Shiny Seen rewards logic (Good Shiny replaces Regular Shiny)
    for (let i = 0; i < seenTier; i++) {
        let rewardName = profTasks.shinySeen[i].reward;
        // If Good Shiny (tier index 1) is unlocked, we skip Regular Shiny (tier index 0)
        if (seenTier > 1 && i === 0) continue;

        shinyRewardsHtml += `
            <div style="font-size: 11px; margin-top: 6px; padding-left: 8px; border-left: 2px solid #22c55e; color: var(--piw-text-secondary);">
                <b>${rewardName}</b>: <span style="color: #4ade80;">${profTasks.shinySeen[i].effect}</span>
            </div>
        `;
    }

    // Shiny Caught rewards logic
    for (let i = 0; i < caughtTier; i++) {
        shinyRewardsHtml += `
            <div style="font-size: 11px; margin-top: 6px; padding-left: 8px; border-left: 2px solid #22c55e; color: var(--piw-text-secondary);">
                <b>${profTasks.shinyCaught[i].reward}</b>: <span style="color: #4ade80;">${profTasks.shinyCaught[i].effect}</span>
            </div>
        `;
    }

    // Final Task Rewards logic
    for (let i = 0; i < finalTier; i++) {
        if (profTasks.final && profTasks.final[i]) {
            shinyRewardsHtml += `<div style="font-size: 11px; margin-top: 6px; padding-left: 8px; border-left: 2px solid #22c55e; color: var(--piw-text-secondary);"><b>${profTasks.final[i].reward}</b>: <span style="color: #4ade80;">${profTasks.final[i].effect}</span></div>`;
        }
    }

    html += `<div class="piw-card" style="padding: 12px 14px;"><h3 style="margin: 0 0 10px 0; border-bottom: var(--piw-border-subtle); padding-bottom: 6px; font-size: 13px; font-weight: 800; color: var(--piw-accent-teal); text-transform: uppercase; letter-spacing: 0.4px;">${shinyTitle}</h3>${shinySeenTaskHtml}${shinyCaughtTaskHtml}${finalTaskHtml}${shinyRewardsHtml}</div></div>`;

    const overlay = document.getElementById('main-view-inner-modal-overlay');
    const title = document.getElementById('main-view-inner-modal-title');
    const content = document.getElementById('main-view-inner-modal-content');
    if (overlay && title && content) {
        title.innerText = "Assignments and Boosters";
        if (window.windowManager) {
            window.windowManager._parseAndSanitizeToElement(html, content);
        } else {
            setSafeHTML(content, html);
        }

        // Dynamically style the inner modal for Professor Lab to 70% width and proportional scale
        const innerModal = document.getElementById('main-view-inner-modal');
        if (innerModal) {
            innerModal.classList.add('prof-lab-inner-modal');
        }

        // Ensure cleanup when the modal is closed
        const cleanUp = () => {
            if (innerModal && innerModal.classList) {
                innerModal.classList.remove('prof-lab-inner-modal');
            }
            overlay.style.display = 'none';
            const moneyDisplay = document.getElementById('inner-modal-money-display');
            if (moneyDisplay) moneyDisplay.style.display = 'none';
        };

        const closeBtn = document.getElementById('btn-close-inner-modal');
        if (closeBtn) {
            closeBtn.onclick = cleanUp;
        }
        overlay.onclick = (e) => {
            if (e.target === overlay) {
                cleanUp();
            }
        };

        overlay.style.display = 'flex';
    } else {
        showModal("Assignments and Boosters", html, "window-tasks");
    const winTasks = document.getElementById("window-tasks");
    if (winTasks) {
        winTasks.style.maxHeight = '800px';
    }
    if (window.windowManager) window.windowManager.recalculateWindowSize('window-tasks');
    }
};



// Main View has 2 modes:
// 1. Hub Mode: The taller one (where you visit places such as casino, market, professor lab, safari, gyms).
const MAIN_VIEW_HUB_MODE_RATIO = 1.8;
// 2. Battle Mode: The shorter one (where battle occurs).
const MAIN_VIEW_BATTLE_MODE_RATIO = 5.75;

export function switchView(viewName) {
    state.currentView = viewName;
    if (typeof updateMainViewRouteBadge === 'function') updateMainViewRouteBadge();
    document.querySelectorAll('.game-view').forEach(el => el.style.display = 'none');

    const overlay = document.getElementById('main-view-inner-modal-overlay');
    if (overlay) {
        overlay.style.display = 'none';
        const innerModal = document.getElementById('main-view-inner-modal');
        if (innerModal && innerModal.classList) innerModal.classList.remove('prof-lab-inner-modal');
        const moneyDisplay = document.getElementById('inner-modal-money-display');
        if (moneyDisplay) moneyDisplay.style.display = 'none';
    }

    if (viewName === 'BATTLE_ARENA') {
        if (window.windowManager) window.windowManager.setWindowProportions('main-view-window', MAIN_VIEW_BATTLE_MODE_RATIO);
    } else {
        if (window.windowManager) window.windowManager.setWindowProportions('main-view-window', MAIN_VIEW_HUB_MODE_RATIO);
    }

    if (viewName.includes('PROFESSOR_LAB')) {
        document.getElementById('view-professor-lab').style.display = 'block';
        if (viewName === 'PROFESSOR_LAB' || state.currentRegionName === 'Kanto' || !state.globalStats.hasSeenProfTutorial) {
            showProfTutorialIfNeeded();
        }
        renderProfessorLab();
    } else if (viewName === 'BATTLE_ARENA') {
        document.getElementById('view-battle-arena').style.display = 'flex';
        document.getElementById('view-battle-arena').style.flexDirection = 'column';
    } else if (viewName === 'POKEMON_CENTER_MARKET') {
        document.getElementById('view-center-market').style.display = 'block';
        setupMarket(document.getElementById('view-center-market'));
    } else if (viewName === 'GYM') {
        document.getElementById('view-gym').style.display = 'block';
    } else if (viewName === 'BATTLE_STADIUM') {
        document.getElementById('view-battle-stadium').style.display = 'flex';
        // Initialize multiplayer when entering the view if it's not already set up
        if (typeof window.initMultiplayerView === 'function') {
            window.initMultiplayerView();
        }
    } else if (viewName === 'DAYCARE_HUB') {
        document.getElementById('view-daycare').style.display = 'block';

        const introText = document.getElementById('daycare-intro-text');
        if (introText) {
            if (typeof introText.replaceChildren === 'function') introText.replaceChildren();

            const p1 = document.createElement('p');
            p1.textContent = 'Now you are able to use Daycare!';

            const p2 = document.createElement('p');
            p2.textContent = 'You can adjust Pokemon on daycare here or directly in your backpack.';

            const p3 = document.createElement('p');
            setSafeHTML(p3, `<b>Breeding</b> requires <b>two Pokémon of the same species</b> with a <b>QValue difference of 0.05 or less</b>. You can drag them manually to the Breeding Spot or <b>click the spot to auto-filter</b> eligible candidates. Once started, the process <b>cannot be interrupted</b> and takes <b>100 fights</b> to complete (<b>200 for Shinnies</b>). The resulting egg hatches into the same species (provided it has no pre-evolution) at <b>90% of the highest parent's level</b>. The newborn inherits the higher parent's SumIVs and gains a <b>random QValue increase up to 0.03</b>, capped at a maximum of <b>1.80</b>.`);

            const p4 = document.createElement('p');
            setSafeHTML(p4, `For <b>Training</b>, simply place any Pokémon in the Training Spot to <b>continuously improve its SumIV</b>, granting <b>+1 point to a random IV</b> every specified number of fights. This interval is equal to the Pokémon's <b>current SumIV (double for Shinnies)</b>.`);

            introText.appendChild(p1);
            introText.appendChild(p2);
            introText.appendChild(p3);
            introText.appendChild(p4);
        }

        const trainBtn = document.getElementById('btn-daycare-train');
        if (trainBtn) {
            trainBtn.title = `Insert any Pokémon and gain +1 IV based on its current SumIV.`;
            if (!state.stats.hasSeenDaycare) {
                trainBtn.style.pointerEvents = 'none';
                trainBtn.style.opacity = '0.5';
            } else {
                trainBtn.style.pointerEvents = 'auto';
                trainBtn.style.opacity = '1';
            }
        }

        const breedBtn = document.getElementById('btn-daycare-breed');
        if (breedBtn) {
            breedBtn.title = `Insert 2 Pokémons with close Quality Value to increase it up to +0.05 (max 1.99). Requires 200 fights (400 for Shinies).`;
            if (!state.stats.hasSeenDaycare) {
                breedBtn.style.pointerEvents = 'none';
                breedBtn.style.opacity = '0.5';
            } else {
                breedBtn.style.pointerEvents = 'auto';
                breedBtn.style.opacity = '1';
            }
        }
    }
}

export function updateUI() {
    window.currentMapRegion = window.currentMapRegion || state.currentRegionName || 'Kanto';
    updateMainControl();
    updateTeamWindow();
    updateBattleArena();
}

async function loadConfigs() {
    const [pokemonInfo, routes, gyms, balance, moves, types, mapCoordinates, gymAssets, spriteSizes] = await Promise.all([
      fetch(new URL('../data/pokemon_info.json', import.meta.url)).then(res => res.json()),
      import('../config/routes.js').then(m => m.routes),
      import('../config/gyms.js').then(m => m.default),
      import('../config/balance.js').then(m => m.default),
      import('../config/moves.js').then(m => m.default),
      import('../config/types.js').then(m => m.default),
      import('../config/mapCoordinates.js').then(m => m.default),
      import('../config/gymAssets.js').then(m => m.default),
      fetch(new URL('../config/spriteSizes.json', import.meta.url)).then(res => res.json()).catch(() => ({})),
    ]);

    const hydrated = hydratePokemonInfo(pokemonInfo, moves, pokedexIndexes);
    state.config.pokemonInfo = pokemonInfo;
    state.config.pokemonData = hydrated.pokemonData;
    state.config.pokemonMap = hydrated.pokemonMap;
    state.config.spriteSizes = spriteSizes;
    state.config.routes = normalizeRoutesData(routes);
    const unlocksModule = await import('../config/routes.js');
    state.config.unlocks = unlocksModule.unlocks;

    const regions = ['Johto', 'Hoenn', 'Sinnoh', 'Unova', 'Kalos', 'Alola', 'Galar', 'Hisui', 'Paldea'];
    for (const region of regions) {
        const prefix = region.toLowerCase();
        try {
            const module = await import(`../config/${prefix}Routes.js`);
            state.config[`${prefix}Routes`] = normalizeRoutesData(module[`${prefix}Routes`]);
            state.config[`${prefix}Unlocks`] = module[`${prefix}Unlocks`] || [];
        } catch (e) {
            // It's expected that some regions might not have route files yet
        }

        try {
            const mapModule = await import(`../config/${prefix}MapCoordinates.js`);
            state.config[`${prefix}MapCoordinates`] = mapModule.default || mapModule[`${prefix}MapCoordinates`];
        } catch (e) {
            // Expected for regions that don't have map coords
        }
    }

    state.config.gyms = gyms;
    state.config.gymAssets = gymAssets;
    state.config.balance = balance;
    state.config.moves = hydrated.moves;
    state.config.types = types;
    state.config.mapCoordinates = mapCoordinates;
    state.config.allPokemonNames = hydrated.pokemonData.map(p => p.name);

    // Precompute evolution parents for O(1) lookups
    const evolutionParents = {};
    for (const pd of state.config.pokemonData) {
        if (pd.evolutions) {
            for (const evo of pd.evolutions) {
                evolutionParents[evo.to] = pd.id;
            }
        }
    }
    state.config.evolutionParents = evolutionParents;
}




function returnToLab() {
    if (globals.battleSystem) {
        globals.battleSystem.stop();
    }
    window.currentMapRegion = state.currentRegionName || 'Kanto';

    let labRoute = window.currentMapRegion + " Professor Lab";
    let labView = "PROFESSOR_LAB";

    if (state.currentRegionName === "Johto") {
        labView = "JOHTO_PROFESSOR_LAB";
    } else if (state.currentRegionName === "Hoenn") {
        labView = "HOENN_PROFESSOR_LAB";
    }

    state.currentRoute = labRoute;
    switchView(labView);
}
window.returnToLab = returnToLab;

window.selectStarter = selectStarter;

function _createStarterPokemon(pData) {
    const q = 1.40; // Fixed Rare
    const qName = "Rare";
    const ivs = {hp: 50, atk: 50, def: 50, spa: 50, spd: 50, spe: 50};
    const level = 1;

    const stats = {
        hp: mathEngine.calculateHP(pData.hp, ivs.hp, level, q),
        atk: mathEngine.calculateStat(pData.atk, ivs.atk, level, q),
        def: mathEngine.calculateStat(pData.def, ivs.def, level, q),
        spa: mathEngine.calculateStat(pData.spa, ivs.spa, level, q),
        spd: mathEngine.calculateStat(pData.spd, ivs.spd, level, q),
        spe: mathEngine.calculateStat(pData.spe, ivs.spe, level, q),
    };

    const bst = pData.hp + pData.atk + pData.def + pData.spa + pData.spd + pData.spe;

    return {
        id: pData.id,
        name: pData.name,
        types: pData.types,
        level: level,
        xp: 0,
        qualityName: qName,
        quality: q,
        ivs: { ...ivs },
        currentStats: { ...stats },
        maxHp: stats.hp,
        currentHp: stats.hp,
        bst: bst,
        evxp: mathEngine.calculateEVXP(bst, level, q, ivs.hp + ivs.atk + ivs.def + ivs.spa + ivs.spd + ivs.spe),
        evm: mathEngine.calculateEVM(bst, level, q, ivs.hp + ivs.atk + ivs.def + ivs.spa + ivs.spd + ivs.spe),
        pp: mathEngine.calculatePP(bst, level, q, ivs.hp + ivs.atk + ivs.def + ivs.spa + ivs.spd + ivs.spe),
        moves: [{name: "Tackle", power: 40, type: "Normal", category: "Physical"}] // Basic start
    };
}

function _refreshPartyWindowHeight(partyWindow) {
    updateTeamWindow();
    if (partyWindow && window.windowManager) {
        if (typeof partyWindow.adjustHeightForNewContent === 'function') {
            partyWindow.adjustHeightForNewContent();
        }
    }
}

function _initializeInitialRoutes(id) {
    // Setup initial routes correctly so player is not softlocked
    if (!state.stats.newRoutes) state.stats.newRoutes = [];
    if (!state.stats.newRoutes.includes("PokeCenter & PokeMarket")) {
        state.stats.newRoutes.push("PokeCenter & PokeMarket");
    }

    // Add specific first routes for regions if applicable
    let currentRegion = state.currentRegionName || 'Kanto';
    if (!state.stats.activeChallenges || state.stats.activeChallenges.length === 0 || state.stats.activeChallenges[0] === "Route 1" || state.stats.activeChallenges[0] === "Route 1 (Kanto)") {
        if (currentRegion === 'Johto') state.stats.activeChallenges = ['Route 29'];
        else if (currentRegion === 'Hoenn') state.stats.activeChallenges = ['Route 101'];
        else if (currentRegion === 'Sinnoh') state.stats.activeChallenges = ['Route 201'];
        else if (currentRegion === 'Hisui') state.stats.activeChallenges = ['Aspiration Hill'];
    }

    if (currentRegion === 'Johto' && !state.stats.newRoutes.includes("Route 29")) {
        state.stats.newRoutes.push("Route 29");
    } else if (currentRegion === 'Hoenn' && !state.stats.newRoutes.includes("Route 101")) {
        state.stats.newRoutes.push("Route 101");
    } else if (currentRegion === 'Sinnoh' && !state.stats.newRoutes.includes("Route 201")) {
        state.stats.newRoutes.push("Route 201");
    } else if (currentRegion === 'Unova' && !state.stats.newRoutes.includes("Route 19")) {
        state.stats.newRoutes.push("Route 19");
    }
    if (state.stats.activeChallenges) {
        for (let challenge of state.stats.activeChallenges) {
            if (!state.stats.newRoutes.includes(challenge)) {
                state.stats.newRoutes.push(challenge);
            }
        }
    }
    state.stats.hasUnseenMap = true;
    if (window.updateMainControl) window.updateMainControl();

    // Only set dex / caught properly
    state.stats.caught = (state.stats.caught || 0) + 1;
    state.stats.dex = state.stats.dex || {};
    state.stats.dex[id] = true;
}

function _forcePartyWindowRefresh(pData) {
    const partyWindow = document.getElementById('party-window');
    if (partyWindow && window.windowManager) {
        if (partyWindow.style.display === 'none' || !partyWindow.style.display) {
            window.windowManager.toggleWindow('party-window', true);
        }
    }
    _refreshPartyWindowHeight(partyWindow);

    // Add identical pokemon to Team
    const starterCopy = _createStarterPokemon(pData);
    state.party.push(starterCopy);

    // Refresh window after adding duplicate
    _refreshPartyWindowHeight(partyWindow);

    // Remove similar pokemon from Team
    state.party.pop();

    // Refresh window after removing duplicate
    _refreshPartyWindowHeight(partyWindow);
}

function _enableNavButtons() {
    const navButtons = document.getElementById('main-control');
    if (navButtons) {
        navButtons.style.pointerEvents = 'auto';
        navButtons.style.opacity = '1.0';
    }
}

function _ensureProfileExists() {
    if (!storage.currentProfileId) {
        storage.createNewProfile();
    }
}

function _assignStarterToParty(pData) {
    const starter = _createStarterPokemon(pData);
    state.party.push(starter);
    state.stats.hasPickedStarter = true;
    returnToLab();
}

function _finalizeStarterSelection() {
    storage.save(state);
    _enableNavButtons();
    startGame();
    // Refresh generic lab after assigning to display Assignments UI
    renderProfessorLab();
}

function selectStarter(id) {
    _ensureProfileExists();
    const pData = state.config.pokemonData.find(p => p.id === id);
    _assignStarterToParty(pData);
    _forcePartyWindowRefresh(pData);
    _initializeInitialRoutes(id);
    _finalizeStarterSelection();
}

let gameClockTimeout = null;

window.restartGameClock = function() {
    if (gameClockTimeout) {
        clearTimeout(gameClockTimeout);
        gameClockTimeout = null;
    }

    // Safety boundaries for speed
    const speed = (state.settings && state.settings.gameSpeed) || 1;
    // Timeout minimum is usually 4ms in browsers.
    // This naturally caps the speed at ~250x, matching actual execution time.
    const delay = Math.max(4, Math.floor(1000 / speed));

    gameClockTimeout = setTimeout(gameClockTick, delay);
};

let _battleTimerTickCount = 0;
function _updateBattleTimer() {
    if (state.currentView === "BATTLE_ARENA") {
        state.stats.battleModeTimer = (state.stats.battleModeTimer || 0) + 1;
        _battleTimerTickCount++;
        updateTimers();
        if (_battleTimerTickCount % 5 === 0) {
            updateMainControl();
        }
    } else {
        const hadTimer = (state.stats.battleModeTimer || 0) > 0;
        state.stats.battleModeTimer = 0;
        _battleTimerTickCount = 0;
        updateTimers();
        if (hadTimer) {
            updateMainControl();
        }
    }
}

function _getRegionalStats(region) {
    if (region === 'Kanto' && state.currentRegionName === 'Kanto') return state.stats;
    if (region === 'Kanto' && state.regions && state.regions['Kanto']) return state.regions['Kanto'].stats;
    if (state.regions && state.regions[region]) return state.regions[region].stats;
    if (state.currentRegionName === region) return state.stats;
    return null;
}

function _getRegionPokemonCounts(region, regionalStats) {
    let caughtCount = 0;
    let shinyCount = 0;
    let totalInRegion = 0;

    if (state.config && state.config.pokemonData) {
        const regionKey = region.toLowerCase() + '_id';
        state.config.pokemonData.forEach(p => {
            if (p[regionKey]) {
                totalInRegion++;
                if (regionalStats) {
                    if (regionalStats.caughtSpecies && regionalStats.caughtSpecies[p.name]) caughtCount++;
                    if (regionalStats.caughtShiniesSpecies && regionalStats.caughtShiniesSpecies[p.name]) shinyCount++;
                }
            }
        });
    }
    return { caughtCount, shinyCount, totalInRegion };
}

function _recordRegionMedal(region, tier) {
    if (!state.globalStats.medals[region]) {
        state.globalStats.medals[region] = {};
    }
    if (!state.globalStats.medals[region][tier]) {
        state.globalStats.medals[region][tier] = {
            date: Date.now(),
            playtime: state.globalStats.playtime
        };
    }
}

window.evaluateMedals = function() {
    if (!state.globalStats.medals) state.globalStats.medals = {};
    const regions = ['Kanto', 'Johto', 'Hoenn', 'Sinnoh', 'Unova', 'Kalos', 'Alola', 'Galar', 'Hisui', 'Paldea'];

    regions.forEach(region => {
        const regionalStats = _getRegionalStats(region);
        const { caughtCount, shinyCount, totalInRegion } = _getRegionPokemonCounts(region, regionalStats);

        const hasFirst = caughtCount > 0;
        const hasSecond = totalInRegion > 0 && caughtCount >= totalInRegion;
        const hasThird = totalInRegion > 0 && shinyCount >= totalInRegion;

        if (hasFirst) _recordRegionMedal(region, 'First');
        if (hasSecond) _recordRegionMedal(region, 'Second');
        if (hasThird) _recordRegionMedal(region, 'Third');
    });
};

function _awardJigglypuffDustGrains() {
    if (state.globalStats.playtime % 60 === 0 && state.globalStats.playtime > 0) {
        // Current active region
        if (state.stats && state.stats.hasPickedStarter) {
            state.stats.jigglypuffGrains = (state.stats.jigglypuffGrains || 0) + 1;
        }

        // Other unlocked regions
        if (state.regions) {
            for (let regionName in state.regions) {
                // Skip the current active region to avoid double counting if it's somehow in both places during a swap
                if (regionName === state.currentRegionName) continue;

                let regionData = state.regions[regionName];
                if (regionData && regionData.stats && regionData.stats.hasPickedStarter) {
                    regionData.stats.jigglypuffGrains = (regionData.stats.jigglypuffGrains || 0) + 1;
                }
            }
        }

        updateUI(); // Reflect new grains
    }
}

function gameClockTick() {
    const speed = (state.settings && state.settings.gameSpeed) || 1;

    if (!state.globalStats.playtime) state.globalStats.playtime = 0;
    state.globalStats.playtime++;

    _updateBattleTimer();
    _awardJigglypuffDustGrains();

    // Daily Challenge Check
    if (state.globalStats.playtime % 10 === 0) {
        checkAndResetDailyChallenges();
    }

    if (state.globalStats.playtime === 60) {
        updateMainControl();
    }

    // Passively evaluate medals
    if (state.globalStats.playtime % 10 === 0) {
        window.evaluateMedals();
    }

    // Schedule next tick
    const delay = Math.max(4, Math.floor(1000 / speed));
    gameClockTimeout = setTimeout(gameClockTick, delay);
}


function startGame() {
    if (globals.battleSystem) {
        globals.battleSystem.stop();
    }
    let bs = new BattleSystem(state, updateUI);
    setBattleSystem(bs);
    updateUI();
    bs.start();

    state.settings.gameSpeed = 1; // Reset to 1 on load

    // Start playtime tracker
    window.restartGameClock();

    setupAutosave();
    setupDragAndDropScrolling();
}

function setupAutosave() {
    if (autosaveInterval) {
        clearInterval(autosaveInterval);
    }
    const safeSave = () => {
        if (storage.currentProfileId) {
            storage.save(state);
        }
    };
    // Autosave loop (every 30s)
    autosaveInterval = setInterval(safeSave, 30000);

    // Save on beforeunload, pagehide, and tab/window hide
    if (!hasUnloadAutosaveListener) {
        hasUnloadAutosaveListener = true;
        window.addEventListener('beforeunload', safeSave);
        window.addEventListener('pagehide', safeSave);
        document.addEventListener('visibilitychange', () => {
            if (document.visibilityState === 'hidden') {
                safeSave();
            }
        });
    }
}

function setupDragAndDropScrolling() {
    if (hasDragAndDropScrollListeners) return;
    hasDragAndDropScrollListeners = true;
    // Handle scrolling during drag-and-drop (Wheel + Auto-scroll at edges)
    window.isDraggingPokemon = false;
    let dragScrollTarget = null;
    let dragScrollY = 0;
    let autoScrollInterval = null;

    function getScrollableParent(node) {
        if (!node) return null;
        while (node && node !== document.body && node !== document) {
            if (node.scrollHeight > node.clientHeight) {
                const style = window.getComputedStyle(node);
                if (style.overflowY === 'auto' || style.overflowY === 'scroll') {
                    return node;
                }
            }
            node = node.parentNode;
        }
        return null;
    }

    window.addEventListener('dragstart', () => {
        window.isDraggingPokemon = true;
        if (autoScrollInterval) cancelAnimationFrame(autoScrollInterval);

        autoScrollInterval = requestAnimationFrame(autoScrollLoop);
    });

    window.addEventListener('dragend', () => {
        window.isDraggingPokemon = false;
        dragScrollTarget = null;
        if (autoScrollInterval) cancelAnimationFrame(autoScrollInterval);
    });

    // Track mouse position during drag to find what we are hovering
    window.addEventListener('dragover', (e) => {
        dragScrollTarget = document.elementFromPoint(e.clientX, e.clientY) || e.target;
        dragScrollY = e.clientY;
    });

    window.addEventListener('wheel', (e) => {
        if (window.isDraggingPokemon) {
            let scrollNode = getScrollableParent(dragScrollTarget) || cachedScrollNode;
            if (scrollNode) {
                scrollNode.scrollTop += e.deltaY;
            }
        }
    }, { passive: false });

    let cachedScrollNode = null;

    function autoScrollLoop() {
        if (!window.isDraggingPokemon) {
            cachedScrollNode = null;
            return;
        }

        if (dragScrollTarget) {
            let currentNode = getScrollableParent(dragScrollTarget);
            if (currentNode) {
                cachedScrollNode = currentNode;
            }
        }

        if (cachedScrollNode) {
            const rect = cachedScrollNode.getBoundingClientRect();
            const edgeSize = 40;

            // If mouse is near or beyond the top edge of the scroll container
            if (dragScrollY < rect.top + edgeSize) {
                let speed = 15;
                if (dragScrollY < rect.top) speed = 60; // 4x faster beyond border
                cachedScrollNode.scrollTop -= speed;
            }
            // If mouse is near or beyond the bottom edge of the scroll container
            else if (dragScrollY > rect.bottom - edgeSize) {
                let speed = 15;
                if (dragScrollY > rect.bottom) speed = 60; // 4x faster beyond border
                cachedScrollNode.scrollTop += speed;
            }
        }

        autoScrollInterval = requestAnimationFrame(autoScrollLoop);
    }
}

async function init() {
    // Desktop Overlay init
    window.windowManager = new WindowManager(); window.WindowManager = WindowManager;
    setupClickThrough();

    // Register floating windows
    window.windowManager.registerWindow('main-control-window', 'main-control-header', '10%', '3%');
    window.windowManager.registerWindow('party-window', 'party-header', '5%', '15%');
    window.windowManager.registerWindow('main-view-window', 'main-view-header', '30%', '15%');

    window.windowManager.registerWindow('modal-content-box', 'modal-header', '25%', '25%');
    window.windowManager.registerWindow('save-manager-modal', 'save-manager-header', '50%', '15%');
    await loadConfigs();

    const profiles = storage.getProfiles();
    const splashScreen = document.getElementById('splash-screen');
    const saveManagerModal = document.getElementById('save-manager-modal');
    const profilesContainer = document.getElementById('profiles-container');

    const startNewGame = () => {
        storage.setCurrentProfile(null);
        state.globalStats.hasSeenProfTutorial = false;
        state.globalStats.hasSeenGiftIcon = false;
        state.globalStats.hasSeenMultiplayerIcon = false;
        state.globalStats.hasSeenZzZTutorial = false;
        if (splashScreen) splashScreen.style.display = 'none';
        if (saveManagerModal) window.windowManager.toggleWindow('save-manager-modal', false);
        window.windowManager.toggleWindow('main-control-window', true);
        window.windowManager.toggleWindow('party-window', true);
        window.windowManager.toggleWindow('main-view-window', true);

        // Force the nav buttons to be disabled immediately.
        const navButtons = document.getElementById('main-control');
        if (navButtons) {
            navButtons.style.pointerEvents = 'none';
            navButtons.style.opacity = '0.5';
        }

        switchView("PROFESSOR_LAB");
        // Don't call startGame yet, the user must choose a pokemon first.
    };
    window.startNewGame = startNewGame;

    const regions = ['Kanto', 'Johto', 'Hoenn', 'Sinnoh', 'Unova', 'Kalos', 'Alola', 'Galar', 'Hisui', 'Paldea'];
    const regionPokemonMap = new Map();
    if (typeof state !== 'undefined' && state && state.config && state.config.pokemonData) {
        regions.forEach(region => {
            const regionKey = region.toLowerCase() + '_id';
            regionPokemonMap.set(
                region,
                state.config.pokemonData.filter(p => Boolean(p[regionKey])).map(p => p.name)
            );
        });
    }

    const renderProfilesList = () => {
        const currentProfiles = storage.getProfiles();
        const mappedProfiles = currentProfiles.map(id => ({ id, data: storage.getProfileData(id) }));

        // Sort descending by lastPlayed so newest is always on top; corrupted saves at the bottom
        mappedProfiles.sort((a, b) => {
            const timeA = a.data ? (a.data.lastPlayed || 0) : -1;
            const timeB = b.data ? (b.data.lastPlayed || 0) : -1;
            return timeB - timeA;
        });

        if (mappedProfiles.length === 0 || !saveManagerModal || !splashScreen) {
            if (profilesContainer) profilesContainer.innerHTML = '';
            return;
        }

        splashScreen.style.display = 'flex';
        saveManagerModal.style.display = 'flex';
        profilesContainer.innerHTML = ''; // clear

        let profileAction = 'load';

        // Variables to hold pending rename state
        let pendingRenameId = null;

        const renameModal = document.getElementById('rename-modal');
        const renameInput = document.getElementById('rename-input');
        const btnRenameSave = document.getElementById('btn-rename-save');
        const btnRenameCancel = document.getElementById('btn-rename-cancel');

        if (btnRenameSave) {
            btnRenameSave.onclick = () => {
                if (pendingRenameId && renameInput.value.trim() !== "") {
                    storage.renameProfile(pendingRenameId, renameInput.value.trim());
                    window.location.reload();
                }
            };
        }

        if (btnRenameCancel) {
            btnRenameCancel.onclick = () => {
                if (renameModal) renameModal.style.display = 'none';
                pendingRenameId = null;
                profileAction = 'load';
                updateHeader();
            };
        }

        const updateHeader = () => {
            const h2 = document.getElementById('save-action-title');
            const renameBtn = document.getElementById('btn-rename-profile');
            const deleteBtn = document.getElementById('btn-delete-profile');
            if (renameBtn) renameBtn.classList.toggle('is-active', profileAction === 'rename');
            if (deleteBtn) deleteBtn.classList.toggle('is-active', profileAction === 'delete');
            if (h2) {
                if (profileAction === 'rename') {
                    setSafeHTML(h2, "Select a game to <span style='color: #f59e0b;'>rename.</span>");
                    h2.style.display = 'block';
                } else if (profileAction === 'delete') {
                    setSafeHTML(h2, "Select a game to <span style='color: #ef4444;'>delete.</span>");
                    h2.style.display = 'block';
                } else {
                    if (typeof h2.replaceChildren === 'function') h2.replaceChildren();
                    h2.style.display = 'none';
                }
            }
        };

        mappedProfiles.forEach((profileObj, index) => {
            const profileId = profileObj.id;
            const pData = profileObj.data;

            if (!pData) {
                const corruptCard = document.createElement('div');
                corruptCard.className = 'profile-corrupt-card';

                const label = document.createElement('span');
                label.textContent = `Corrupted Save (${profileId})`;

                const delBtn = document.createElement('button');
                delBtn.className = 'profile-corrupt-del-btn';
                delBtn.textContent = "Delete";
                delBtn.onclick = () => {
                    if (confirm(`Delete corrupted save "${profileId}"?`)) {
                        storage.deleteProfile(profileId);
                        renderProfilesList();
                    }
                };

                corruptCard.appendChild(label);
                corruptCard.appendChild(delBtn);
                profilesContainer.appendChild(corruptCard);
                return;
            }

            // Format playtime
            let playtimeStr = "0h 0m 0s";
            let totalSec = 0;
            if (pData.globalStats && pData.globalStats.playtime !== undefined) {
                totalSec = pData.globalStats.playtime;
            } else if (pData.stats && pData.stats.playtime !== undefined) {
                totalSec = pData.stats.playtime;
            }

            if (totalSec > 0) {
                const h = Math.floor(totalSec / 3600);
                const m = Math.floor((totalSec % 3600) / 60);
                const s = totalSec % 60;
                playtimeStr = `${h}h ${m}m ${s}s`;
            }

            // Format last played explicitly as dd/mm/yyyy hh:mm am/pm
            let lastPlayedStr = "Unknown";
            if (pData.lastPlayed) {
                const lpDate = new Date(pData.lastPlayed);
                const dd = String(lpDate.getDate()).padStart(2, '0');
                const mm = String(lpDate.getMonth() + 1).padStart(2, '0');
                const yyyy = lpDate.getFullYear();

                let hours = lpDate.getHours();
                const minutes = String(lpDate.getMinutes()).padStart(2, '0');
                const ampm = hours >= 12 ? 'pm' : 'am';
                hours = hours % 12;
                hours = hours ? hours : 12; // the hour '0' should be '12'
                const strTime = `${String(hours).padStart(2, '0')}:${minutes} ${ampm}`;

                lastPlayedStr = `${dd}/${mm}/${yyyy} ${strTime}`;
            }

            // Get profile name
            const profileName = pData.profileName || `Profile ${index + 1}`;

            const profileCard = document.createElement('div');
            profileCard.className = 'profile-card';

            const cardRow = document.createElement('div');
            cardRow.className = 'profile-card-row';

            const btn = document.createElement('button');
            btn.className = 'action-btn-pill profile-btn';

            const textWrapper = document.createElement('div');
            textWrapper.className = 'profile-text-wrapper';

            const leftSide = document.createElement('div');
            leftSide.className = 'profile-left';

            const rightSide = document.createElement('div');
            rightSide.className = 'profile-right';

            const titleRow = document.createElement('div');
            titleRow.className = 'profile-title-row';

            const formatRelativeTime = (ts) => {
                if (!ts) return "Unknown";
                const diffSec = Math.max(0, Math.floor((Date.now() - ts) / 1000));
                if (diffSec < 60) return "Just now";
                const diffMin = Math.floor(diffSec / 60);
                if (diffMin < 60) return `${diffMin}m ago`;
                const diffHr = Math.floor(diffMin / 60);
                if (diffHr < 24) return `${diffHr}h ago`;
                const diffDay = Math.floor(diffHr / 24);
                if (diffDay === 1) return "Yesterday";
                if (diffDay < 30) return `${diffDay}d ago`;
                const diffMo = Math.floor(diffDay / 30);
                return `${diffMo}mo ago`;
            };

            const titleDiv = document.createElement('div');
            titleDiv.className = 'profile-title';
            titleDiv.textContent = `${profileName} · ${playtimeStr}`;

            titleRow.appendChild(titleDiv);

            leftSide.appendChild(titleRow);

            // Party mini sprites preview
            if (Array.isArray(pData.party) && pData.party.length > 0) {
                const partyRow = document.createElement('div');
                partyRow.className = 'profile-party-row';
                pData.party.slice(0, 6).forEach(mon => {
                    if (!mon || !mon.name) return;
                    const sprite = document.createElement('img');
                    sprite.className = 'profile-party-sprite';
                    sprite.alt = mon.name;
                    sprite.title = `${mon.name} (Lv.${mon.level || 1})`;
                    const folder = mon.isShiny ? 'Shiny' : 'Normal';
                    sprite.src = `Assets/Pokemon/${folder}/${mon.name}.png`;
                    sprite.onerror = () => { sprite.style.display = 'none'; };
                    partyRow.appendChild(sprite);
                });
                if (partyRow.children.length > 0) {
                    leftSide.appendChild(partyRow);
                }
            }

            const playedDiv = document.createElement('div');
            playedDiv.className = 'profile-played';
            playedDiv.textContent = pData.lastPlayed ? formatRelativeTime(pData.lastPlayed) : lastPlayedStr;
            playedDiv.title = lastPlayedStr;

            rightSide.appendChild(playedDiv);

            if (pData.isZzZMode) {
                const sleepImg = document.createElement('img');
                sleepImg.src = "Assets/Extra/Icons/IconSleep.png";
                sleepImg.className = 'profile-sleep-badge';
                sleepImg.title = "ZzZ Mode Active";
                rightSide.appendChild(sleepImg);
            }

            textWrapper.appendChild(leftSide);
            textWrapper.appendChild(rightSide);

            btn.appendChild(textWrapper);

            // Add Medals Container inside the profile card
            const medalsContainer = document.createElement('div');
            medalsContainer.className = 'profile-medals-container';

            let earnedAnyMedal = false;

            regions.forEach(region => {
                let activeTier = null;
                const regionSpecies = regionPokemonMap.get(region);

                if (regionSpecies && regionSpecies.length > 0) {
                    let caughtCount = 0;
                    let shinyCount = 0;
                    const totalInRegion = regionSpecies.length;

                    let regionalStats;
                    if (pData.currentRegionName === region) {
                        regionalStats = pData.stats;
                    } else if (pData.regions && pData.regions[region]) {
                        regionalStats = pData.regions[region].stats;
                    }
                    if (region === 'Kanto' && !regionalStats) {
                        regionalStats = pData.stats;
                    }

                    if (regionalStats) {
                        for (const speciesName of regionSpecies) {
                            if (regionalStats.caughtSpecies && regionalStats.caughtSpecies[speciesName]) {
                                caughtCount++;
                            }
                            if (regionalStats.caughtShiniesSpecies && regionalStats.caughtShiniesSpecies[speciesName]) {
                                shinyCount++;
                            }
                        }
                    }

                    const hasFirst = caughtCount > 0;
                    const hasSecond = totalInRegion > 0 && caughtCount >= totalInRegion;
                    const hasThird = totalInRegion > 0 && shinyCount >= totalInRegion;

                    if (hasThird) {
                        activeTier = 'Third';
                    } else if (hasSecond) {
                        activeTier = 'Second';
                    } else if (hasFirst) {
                        activeTier = 'First';
                    }
                }

                if (activeTier) {
                    earnedAnyMedal = true;
                    const medalImg = document.createElement('img');
                    medalImg.className = 'profile-medal-img';
                    medalImg.src = `Assets/Extra/Medals/${region} ${activeTier}.png`;
                    medalImg.alt = `${region} Medal`;
                    medalImg.title = `${region} (${activeTier} Medal)`;
                    medalImg.onerror = () => { medalImg.src = `Assets/Extra/Medals/Kanto ${activeTier}.png`; };
                    medalsContainer.appendChild(medalImg);
                }
            });

            if (earnedAnyMedal) {
                btn.appendChild(medalsContainer);
            }

            cardRow.appendChild(btn);
            profileCard.appendChild(cardRow);

            btn.onclick = async () => {
                if (profileAction === 'rename') {
                    if (renameModal && renameInput) {
                        pendingRenameId = profileId;
                        renameInput.value = profileName;
                        renameModal.style.display = 'flex';
                    }
                } else if (profileAction === 'delete') {
                    if (confirm(`Are you sure you want to delete "${profileName}"? This cannot be undone.`)) {
                        storage.deleteProfile(profileId);
                        renderProfilesList();
                    }
                    profileAction = 'load';
                    updateHeader();
                } else {
                    // Load Action
                    const loadResult = storage.loadProfileIntoState(profileId, state);
                    if (!loadResult || !loadResult.ok) {
                        alert(`Failed to load "${profileName}". Save data could not be recovered.`);
                        return;
                    }

                    splashScreen.style.display = 'none';
                    window.windowManager.toggleWindow('save-manager-modal', false);
                    window.windowManager.toggleWindow('main-control-window', true);
                    window.windowManager.toggleWindow('party-window', true);
                    window.windowManager.toggleWindow('main-view-window', true);

                    // Handle backwards compatibility for challenges
                    if (state.stats.completedChallenges !== undefined && (!state.stats.completedChallengeIds || state.stats.completedChallengeIds.length === 0)) {
                        state.stats.completedChallengeIds = [];
                        state.stats.activeChallenges = ["Route 1 (Kanto)"];

                        // Wait for configs to be available to build the list
                        // We will do this right after loadConfigs
                    }

                    if (!state.config.pokemonData || state.config.pokemonData.length === 0) {
                        await loadConfigs();
                    }

                    // Complete challenge arrays mapping for older saves
                    if (state.stats.completedChallenges > 0 && state.stats.completedChallengeIds && state.stats.completedChallengeIds.length === 0) {
                        if (window.getCurrentUnlocks()) {
                            let maxIndex = Math.min(state.stats.completedChallenges, window.getCurrentUnlocks().length);
                            for (let i = 0; i < maxIndex; i++) {
                                let unlock = window.getCurrentUnlocks()[i];
                                state.stats.completedChallengeIds.push(unlock.areaId);

                                // Emulate the unlock logic to find the active challenges at that point
                                state.stats.activeChallenges = state.stats.activeChallenges.filter(id => id !== unlock.areaId);
                                if (unlock.unlocks) {
                                    for (let newRoute of unlock.unlocks) {
                                        if (!state.stats.activeChallenges.includes(newRoute)) {
                                            state.stats.activeChallenges.push(newRoute);
                                        }
                                    }
                                }
                            }
                        }
                    }
                    if (!state.stats.activeChallenges) state.stats.activeChallenges = ["Route 1 (Kanto)"];
                    if (!state.stats.completedChallengeIds) state.stats.completedChallengeIds = [];

                    startGame();

                    if (state.isZzZMode) {
                        // For a clean load into sleep mode we don't start at lab. We just wait for wakeup.
                        if (globals.battleSystem) globals.battleSystem.stop();

                        window.updateZzZModeUI();

                        // Close existing windows except main-control, which should be updated.
                        if (window.windowManager) {
                            const winsToClose = [...window.windowManager.windows];
                            winsToClose.forEach(win => {
                                if (win.id !== 'main-control-window') {
                                    window.windowManager.closeDynamicWindow(win.id);
                                }
                            });
                        }

                        window.promptWakeUpRegion(state.currentRegionName);

                    } else {
                        // Saved profiles always start at Professor's lab and are free to explore
                        returnToLab();
                    }
                }
            };

            profilesContainer.appendChild(profileCard);
        });

        document.getElementById('btn-rename-profile').onclick = () => {
            profileAction = profileAction === 'rename' ? 'load' : 'rename';
            updateHeader();
        };

        document.getElementById('btn-delete-profile').onclick = () => {
            profileAction = profileAction === 'delete' ? 'load' : 'delete';
            updateHeader();
        };

        setTimeout(() => {
            if (typeof saveManagerModal.adjustHeightForNewContent === 'function') {
                saveManagerModal.adjustHeightForNewContent();
            }
        }, 0);
    };
    renderProfilesList();

    // Bind buttons (they might be missing if bypass Professor Lab)
    const btnBulbasaur = document.getElementById('choose-bulbasaur');
    if (btnBulbasaur) btnBulbasaur.onclick = () => selectStarter(1);

    const btnCharmander = document.getElementById('choose-charmander');
    if (btnCharmander) btnCharmander.onclick = () => selectStarter(4);

    const btnSquirtle = document.getElementById('choose-squirtle');
    if (btnSquirtle) btnSquirtle.onclick = () => selectStarter(7);

    // Bind Hub Buttons
    const checkCombatLock = () => {
        if (globals.battleSystem && globals.battleSystem.gymState && globals.battleSystem.gymState.isActive && globals.battleSystem.gymState.inCombat) {
            alert("You cannot access this menu during a Gym Battle!");
            return true;
        }
        const noPokemon = state.party.length === 0 && state.storage.length === 0;
        const isStarterPending = !state.stats.hasPickedStarter && noPokemon;

        if (isStarterPending) {
            alert("You must select a starter Pokémon first!");
            return true;
        }
        return false;
    };

    window.startCasinoEncounter = (doubleShiny, locationName) => {
        state.casinoDoubleShiny = doubleShiny;
        state.currentRoute = locationName;

        // Money deduction and validation are handled by battleSystem.searchNext()
        switchView("BATTLE_ARENA");
        if (globals.battleSystem) {
             globals.battleSystem.stop();
             globals.battleSystem.activeEncounter = null;
             globals.battleSystem.isSearching = false;
             if (globals.battleSystem.gymState) globals.battleSystem.gymState.isActive = false;
             globals.battleSystem.searchNext();
        }
        updateUI();
    };

    const bindBtn = (id, fn) => {
        const el = document.getElementById(id);
        if (el) el.onclick = fn;
    };


    bindBtn('btn-toggle-party', () => { window.windowManager.toggleWindow('party-window'); });
    bindBtn('btn-toggle-main', () => { window.windowManager.toggleWindow('main-view-window'); });
    bindBtn('btn-map', () => {
        if(!checkCombatLock()) {
            showMap();
            if (!state.isZzZMode) {
                window.windowManager.toggleWindow('main-view-window', true);
            }
        }
    });
    bindBtn('btn-backpack', () => {
        if(!checkCombatLock()) {
            showBackpack();

        }
    });
    bindBtn('btn-dex', () => {
        if(!checkCombatLock()) {
            showPokedex();

        }
    });
    bindBtn('btn-bonus-candy', () => {
        if(!checkCombatLock()) {
            state.stats.hasSeenBonusCandyIcon = true;
            storage.save(state);
            updateMainControl();
            showBonusCandyModal();

        }
    });
    bindBtn('btn-challenges', () => {
        if(!checkCombatLock()) {
            window.showChallengesModal();

        }
    });
    bindBtn('btn-calendar', () => {
        if(!checkCombatLock()) {
            showCalendar();
            if (state.stats.dailyChallenges) {
                state.stats.dailyChallenges.hasSeenNotification = true;
                updateMainControl();
            }
        }
    });
    bindBtn('btn-gift', () => {
        if(!checkCombatLock()) {
            state.globalStats.hasSeenGiftIcon = true;
            storage.save(state);
            updateMainControl();
            showGiftModal();

        }
    });

        window.showZzZConfirmationModal = function() {
            const grains = state.stats.jigglypuffGrains || 0;
            const hours = Math.floor(grains / 60);
            const mins = grains % 60;
            const formattedDuration = ZZZ_CONFIG.useGrainBased
                ? (hours > 0 ? `${hours}h ${mins}m` : `${mins}m`)
                : '1h 0m';
            const showTutorial = !state.globalStats.hasSeenZzZTutorial;

            const routeClean = (state.currentRoute || 'None').replace(/\s*\([^)]+\)$/, '');
            const activeBallTier = state.settings?.activeBallTier ?? -1;
            const activeBallCfg = activeBallTier >= 0 ? state.config?.balance?.items?.pokeballs?.[activeBallTier] : null;
            const activeBallName = activeBallCfg ? activeBallCfg.name : 'None';
            const activeBallQty = activeBallCfg ? (state.backpack?.pokeballs?.[activeBallName] || 0) : 0;

            const activePotTier = state.settings?.activePotionTier ?? -1;
            const activePotCfg = activePotTier >= 0 ? state.config?.balance?.items?.potions?.[activePotTier] : null;
            const activePotName = activePotCfg ? (activePotCfg.name === 'Big' ? 'Big Potion' : activePotCfg.name) : 'None';
            const activePotQty = activePotCfg ? (state.backpack?.potions?.[activePotName] || 0) : 0;

            const boxUsed = mathEngine.getCurrentCount(state, 'box');
            const boxCap = getCapacity(state, 'box');
            const boxColor = boxUsed >= boxCap ? '#f87171' : '#5eead4';

            const htmlContent = `
                <div class="content-panel zzz-panel">
                    ${showTutorial ? `
                    <div id="zzz-tutorial-overlay-inner" class="zzz-tutorial-overlay">
                        <div class="zzz-tutorial-card">
                            <h4>Welcome to ZzZ Mode!</h4>
                            <p>Earn <strong>1 grain</strong> of Jigglypuff Dust for every minute you play.</p>
                            <p>Each grain grants <strong>1 minute</strong> of offline farming while you sleep.</p>
                            <p>Sleep well!</p>
                            <button id="btn-dismiss-zzz-inner" class="zzz-tutorial-btn">Got it!</button>
                        </div>
                    </div>
                    ` : ''}
                    <div class="zzz-hero-card">
                        <span class="zzz-star s1"></span>
                        <span class="zzz-star s2"></span>
                        <span class="zzz-star s3"></span>
                        <span class="zzz-star s4"></span>
                        <div class="zzz-dust-wrap">
                            <div class="zzz-dust-aura"></div>
                            <img src="Assets/Extra/Jigglypuff Dust.png" class="zzz-dust-img" alt="Jigglypuff Dust">
                        </div>
                        <div class="zzz-stats-col">
                            <div class="zzz-badge">Available Grains</div>
                            <div id="zzz-current-grains" class="zzz-grains-value">${grains}</div>
                            <div class="zzz-duration-pill">Max Offline Farm: ${formattedDuration}</div>
                            <div id="zzz-max-offline-time" class="zzz-subtext">${ZZZ_CONFIG.useGrainBased ? (grains > 0 ? '1 grain = 1 min offline farm' : 'Play actively to earn Jigglypuff Dust (1 grain/min)') : 'Fixed 1 hour offline hunt per ZzZ session'}</div>
                        </div>
                    </div>

                    <div class="zzz-section-card" style="text-align: left; font-size: 11.5px; display: flex; flex-direction: column; gap: 5px;">
                        <div class="zzz-section-title" style="margin-bottom: 2px;">Hunt Readiness</div>
                        <div style="display: flex; justify-content: space-between;"><span>Route</span><b>${routeClean}</b></div>
                        <div style="display: flex; justify-content: space-between;"><span>Active Ball</span><b style="color: ${activeBallCfg && activeBallQty > 0 ? '#4ade80' : '#fbbf24'};">${activeBallCfg ? `${activeBallName} (${activeBallQty})` : 'Disabled'}</b></div>
                        <div style="display: flex; justify-content: space-between;"><span>Auto-Potion</span><b style="color: ${activePotCfg && activePotQty > 0 ? '#4ade80' : '#fbbf24'};">${activePotCfg ? `${activePotName} (${activePotQty})` : 'Disabled'}</b></div>
                        <div style="display: flex; justify-content: space-between;"><span>Box Space</span><b style="color: ${boxColor};">${boxUsed} / ${boxCap}</b></div>
                    </div>

                    <div class="zzz-actions">
                        <button id="btn-zzz-yes" class="zzz-btn zzz-btn-sleep">Go to Sleep</button>
                        <button id="btn-zzz-no" class="zzz-btn zzz-btn-cancel">Cancel</button>
                    </div>
                </div>
            `;

            showModal("ZzZ Mode", htmlContent, "window-zzz-confirmation", "340px");
            const winZzz = document.getElementById('window-zzz-confirmation');
            if (winZzz) {
                winZzz.style.width = '340px';
                winZzz._sizeInitialized = false;
            }
            if (window.windowManager) window.windowManager.recalculateWindowSize('window-zzz-confirmation');

            if (showTutorial) {
                const dismissBtn = document.getElementById('btn-dismiss-zzz-inner');
                if (dismissBtn) {
                    dismissBtn.onclick = () => {
                        state.globalStats.hasSeenZzZTutorial = true;
                        storage.save(state);
                        const overlay = document.getElementById('zzz-tutorial-overlay-inner');
                        if (overlay) overlay.style.display = 'none';
                    };
                }
            }

            document.getElementById('btn-zzz-no').onclick = () => {
                if(window.windowManager) window.windowManager.closeDynamicWindow('window-zzz-confirmation');
            };

            document.getElementById('btn-zzz-yes').onclick = () => {
                state.isZzZMode = true;
                state.zzzTimestamp = Date.now();
                state.settings.isSleepModeActive = true;
                state.stats.lastSaveTime = Date.now();
                storage.save(state);

                if (window.windowManager) {
                    const winsToClose = [...window.windowManager.windows];
                    winsToClose.forEach(win => {
                        if (win.id !== 'main-control-window' && win.id !== 'window-zzz-confirmation') {
                            window.windowManager.closeDynamicWindow(win.id);
                        }
                    });
                    window.windowManager.closeDynamicWindow('window-zzz-confirmation');
                }

                if (globals.battleSystem) globals.battleSystem.stop();

                window.updateZzZModeUI();
            };
};

        bindBtn('btn-sleep', () => {
        if(!checkCombatLock()) {
            if (state.isZzZMode) {
                window.showWakeUpModal();
            } else {
                state.stats.hasSeenZzZIcon = true;
                storage.save(state);
                updateMainControl();
                window.showZzZConfirmationModal();
            }
        }
    });

    window.showBackpackAndFocus = (tab) => {
        if(!checkCombatLock()) {
            showBackpack();
            renderBackpackTab(tab);
        }
    };

    window.updateMainControl = updateMainControl;

    window.showUpgradeDetails = function(typeConfigKey, currentTier) {
        if (!state.config || !state.config.balance || !state.config.balance.expansions || !state.config.balance.expansions[typeConfigKey]) return;

        let htmlContent = '<div style="display: grid; grid-template-columns: repeat(3, 1fr); gap: 15px; padding: 2%; box-sizing: border-box;">';

        for (let t = 1; t <= currentTier; t++) {
            const configItem = state.config.balance.expansions[typeConfigKey][t - 1];
            if (!configItem) continue;

            let displayName = configItem.displayName || configItem.name;
            if (typeConfigKey === 'daycare') {
                const parts = displayName.split(' ');
                if (parts.length >= 2) {
                    displayName = parts.slice(0, -1).join(' ') + '<br>' + parts[parts.length - 1];
                }
            }
            let description = configItem.description || '';

            // Adjust descriptions per tier since they depend on the level in showTrainerStats
            if (typeConfigKey === 'ballPocket') {
                let capacity = 100;
                for (let i = 0; i < t; i++) capacity += state.config.balance.expansions.ballPocket[i].increment;
                description = `Ball capacity: ${capacity.toLocaleString('pt-BR')}`;
            } else if (typeConfigKey === 'potionSatchel') {
                let capacity = 20;
                for (let i = 0; i < t; i++) capacity += state.config.balance.expansions.potionSatchel[i].increment;
                description = `Potion capacity: ${capacity.toLocaleString('pt-BR')}`;
            } else if (typeConfigKey === 'pokemonBox') {
                let capacity = 20;
                for (let i = 0; i < t; i++) capacity += state.config.balance.expansions.pokemonBox[i].increment;
                description = `Storage capacity: ${capacity.toLocaleString('pt-BR')}`;
            } else if (typeConfigKey === 'speed') {
                if (t === 1) description = "Encounter time decreased by 10%";
                else if (t === 2) description = "Encounter time decreased by 20%";
                else if (t === 3) description = "Encounter time decreased by 30%";
                else if (t === 4) description = "Encounter time decreased by 40%";
                else if (t >= 5) description = "Encounter time decreased by 50%";
            } else if (typeConfigKey === 'glass') {
                if (t === 1) description = "Show Healthbar at Main View";
                else if (t === 2) description = "Show Damage at Main View";
                else if (t === 3) description = "Show Level at Main View";
                else if (t === 4) description = "Show Quality at Main View";
                else if (t >= 5) description = "Show SumIV at Main View";
            } else if (typeConfigKey === 'loot') {
                if (t === 1) description = "Can loot Potions";
                else if (t === 2) description = "Can loot Balls";
                else if (t === 3) description = "Can loot Stones";
                else if (t === 4) description = "Can loot Vitamins";
            } else if (typeConfigKey === 'smartwatch') {
                if (t === 1) description = "Can Select Ball at Main View";
                else if (t === 2) description = "Can Select Potion at Main View";
                else if (t >= 3) description = "Access Smart Mode Capture<br>at Main View";
            }

            htmlContent += `
                <div class="upgrade-item" style="background: #2c3e50; border: 2px solid #3498db; border-radius: 10px; padding: 15px; text-align: center; display: flex; flex-direction: column; align-items: center; justify-content: flex-start; gap: 10px;">
                    <div style="font-size: 14px; font-weight: bold; color: white;">${displayName}</div>
                    <img src="./Assets/Items/Upgrades/${configItem.name}.png" style="width: 50px; height: 50px; object-fit: contain;" alt="${displayName}">
                    <div style="font-size: 12px; color: #cbd5e1; line-height: 1.3;">${description}</div>
                </div>
            `;
        }

        htmlContent += '</div>';

        let titleName = typeConfigKey;
        if (titleName === 'ballPocket') titleName = 'Ball Pocket';
        if (titleName === 'potionSatchel') titleName = 'Potion Satchel';
        if (titleName === 'pokemonBox') titleName = 'Pokemon Box';
        if (titleName === 'glass') titleName = 'Glass';
        if (titleName === 'smartwatch') titleName = 'Smartwatch';
        if (titleName === 'speed') titleName = 'Speed';
        if (titleName === 'loot') titleName = 'Loot';
        if (titleName === 'daycare') titleName = 'Daycare';

        // Directly call showTrainerStats to render this inside the existing window
        window.showTrainerStats('upgrade-details', { title: titleName, html: htmlContent });
    };

    window.showMedalDetails = function(region, caughtCount, shinyCount, totalInRegion) {
        const hasFirst = caughtCount > 0;
        const hasSecond = totalInRegion > 0 && caughtCount >= totalInRegion;
        const hasThird = totalInRegion > 0 && shinyCount >= totalInRegion;

        const formatTime = (timeSec) => {
            if (!timeSec) return "Unknown";
            let d = Math.floor(timeSec / (3600 * 24));
            let h = Math.floor((timeSec % (3600 * 24)) / 3600);
            let m = Math.floor((timeSec % 3600) / 60);
            let s = timeSec % 60;
            return `${d}d ${h}h:${m}m:${s}s`;
        };

        const formatDate = (timestamp) => {
            if (!timestamp) return "Unknown";
            const date = new Date(timestamp);
            const dd = String(date.getDate()).padStart(2, '0');
            const mm = String(date.getMonth() + 1).padStart(2, '0');
            const yy = String(date.getFullYear()).slice(-2);
            return `${dd}/${mm}/${yy}`;
        };

        const getMedalInfo = (tier) => {
            if (state.globalStats && state.globalStats.medals && state.globalStats.medals[region] && state.globalStats.medals[region][tier]) {
                const info = state.globalStats.medals[region][tier];
                return {
                    date: formatDate(info.date),
                    playtime: formatTime(info.playtime)
                };
            }
            return { date: "Unknown", playtime: "Unknown" };
        };

        const firstInfo = hasFirst ? getMedalInfo('First') : null;
        const secondInfo = hasSecond ? getMedalInfo('Second') : null;
        const thirdInfo = hasThird ? getMedalInfo('Third') : null;

        const generateMedalHtml = (tier, hasTier, name, info) => {
            let filter = hasTier ? 'filter: drop-shadow(0 0 10px rgba(255, 215, 0, 1));' : 'filter: grayscale(100%) opacity(0.5);';
            let extraInfo = hasTier && info ? `
                <div style="font-size: 14px; color: #a0aec0; margin-top: 5px;">Earned on: ${info.date}</div>
                <div style="font-size: 14px; color: #a0aec0;">(${info.playtime})</div>
            ` : '';
            return `
                <div style="text-align: center; flex: 1; padding: 10px;">
                    <div style="height: 160px; display: flex; align-items: center; justify-content: center; ${filter}">
                        <img src="Assets/Extra/Medals/${region} ${tier}.png" alt="${region} ${tier}" style="max-width: 100%; max-height: 100%; object-fit: contain; image-rendering: pixelated;" onerror="this.src='Assets/Extra/Medals/Kanto ${tier}.png'">
                    </div>
                    <div style="font-size: 16px; font-weight: bold; color: white; margin-top: 15px;">${name}</div>
                    ${extraInfo}
                </div>
            `;
        };

        const htmlContent = `
            <div style="display: flex; justify-content: space-between; align-items: flex-start; gap: 20px; padding: 20px; background: rgba(0,0,0,0.4); border-radius: 10px;">
                ${generateMedalHtml('First', hasFirst, `Won ${region} Pokemon League`, firstInfo)}
                ${generateMedalHtml('Second', hasSecond, `Catch all ${totalInRegion} Pokémons`, secondInfo)}
                ${generateMedalHtml('Third', hasThird, `Catch all ${totalInRegion} Shinies Pokémons`, thirdInfo)}
            </div>
        `;

        window.showTrainerStats('medal-details', { region: region, html: htmlContent });
    };

    function generateTrainerStatisticsHtml() {
    let uniqueSpeciesCaught = 0;
    if (state.stats.caughtSpecies) {
        uniqueSpeciesCaught = (state.stats.caughtSpeciesCount || 0);
    }

    let playtimeStr = "0h 0m 0s";
    if (state.globalStats.playtime) {
        const totalSec = state.globalStats.playtime;
        const h = Math.floor(totalSec / 3600);
        const m = Math.floor((totalSec % 3600) / 60);
        const s = totalSec % 60;
        playtimeStr = `${h}h ${m}m ${s}s`;
    }

    let highestLevel = 0;
    let highestQuality = 0;
    let highestSumIV = 0;
    let highestStatSum = 0;
    let highestStatSumName = 'None';
    let highestDps = 0;
    let highestDpsName = 'None';
    let backpackMons = [];
    if (state.party) backpackMons = backpackMons.concat(state.party);
    if (state.storage) backpackMons = backpackMons.concat(state.storage);
    if (state.safe) backpackMons = backpackMons.concat(state.safe);

    backpackMons.forEach(p => {
        if (!p) return;
        const pName = p.displayName || p.name || 'Unknown';
        if (p.level > highestLevel) highestLevel = p.level;
        if (p.quality > highestQuality) highestQuality = p.quality;
        if (p.ivs) {
            const sumIV = (p.ivs.hp || 0) + (p.ivs.atk || 0) + (p.ivs.def || 0) + (p.ivs.spa || 0) + (p.ivs.spd || 0) + (p.ivs.spe || 0);
            if (sumIV > highestSumIV) highestSumIV = sumIV;
        }
        if (p.currentStats) {
            const cs = p.currentStats;
            const statSum = (cs.hp || 0) + (cs.atk || 0) + (cs.def || 0) + (cs.spa || 0) + (cs.spd || 0) + (cs.spe || 0);
            if (statSum > highestStatSum) {
                highestStatSum = statSum;
                highestStatSumName = pName;
            }
            const atk = cs.atk || 0;
            const spa = cs.spa || 0;
            const spe = cs.spe || 1;
            const attacksPerSec = Math.max(0.2, spe / 100);
            let bestMoveDps = 0;
            if (Array.isArray(p.moves) && p.moves.length > 0) {
                p.moves.forEach(m => {
                    if (!m || !m.power) return;
                    const cat = (m.category || '').toLowerCase();
                    const offStat = cat === 'physical' ? atk : cat === 'special' ? spa : Math.max(atk, spa);
                    const stab = (Array.isArray(p.types) && m.type && p.types.includes(m.type)) ? 1.5 : 1.0;
                    const dps = m.power * (offStat / 100) * stab * attacksPerSec;
                    if (dps > bestMoveDps) bestMoveDps = dps;
                });
            }
            if (bestMoveDps === 0) {
                bestMoveDps = Math.max(atk, spa) * attacksPerSec;
            }
            if (bestMoveDps > highestDps) {
                highestDps = bestMoveDps;
                highestDpsName = pName;
            }
        }
    });

    const whiteCandiesClaimed = state.stats.whiteCandies || 0;

    let challengesCompleted = state.stats.completedChallengeIds ?
        (window.getCurrentUnlocks() ? state.stats.completedChallengeIds.filter(id => window.getCurrentUnlocks().some(u => u.areaId === id)).length : state.stats.completedChallengeIds.length)
        : 0;
    let maxChallenges = window.getCurrentUnlocks() ? window.getCurrentUnlocks().length : 45;

    let assignmentsCompleted = 0;
    assignmentsCompleted += (state.stats.qTaskTier || 0);
    assignmentsCompleted += (state.stats.cTaskTier || 0);
    assignmentsCompleted += (state.stats.levelTaskTier || 0);
    assignmentsCompleted += (state.stats.ivTaskTier || 0);
    assignmentsCompleted += (state.stats.shinySeenTaskTier || 0);
    assignmentsCompleted += (state.stats.shinyCaughtTaskTier || 0);
    assignmentsCompleted += (state.stats.finalTaskTier || 0);
    let maxAssignments = (profTasks.q ? profTasks.q.length : 0) +
                         (profTasks.c ? profTasks.c.length : 0) +
                         (profTasks.level ? profTasks.level.length : 0) +
                         (profTasks.iv ? profTasks.iv.length : 0) +
                         (profTasks.shinySeen ? profTasks.shinySeen.length : 0) +
                         (profTasks.shinyCaught ? profTasks.shinyCaught.length : 0) +
                         (profTasks.final ? profTasks.final.length : 0);

    let uniqueShinySpeciesCaught = 0;
    if (state.stats.caughtShiniesSpecies) {
        uniqueShinySpeciesCaught = Object.keys(state.stats.caughtShiniesSpecies).length;
    }

    const regionKey = (state.currentRegionName || 'Kanto').toLowerCase() + '_id';
    const totalSpeciesInRegion = state.config.pokemonData.filter(p => Number.isInteger(p.id) && p[regionKey] !== undefined).length;
    const battlesWon = state.stats.battlesWon || 0;
    const faints = state.stats.faints || 0;
    const totalCaught = state.stats.caught || 0;
    const shiniesCaught = state.stats.shiniesCaught || 0;
    const breedsCompleted = state.stats.breedsCompleted || 0;
    let totalBallsThrown = 0;
    [state.stats.catchAttempts, state.stats.shinyCatchAttempts].forEach(tracker => {
        if (!tracker) return;
        Object.values(tracker).forEach(monData => {
            if (!monData) return;
            Object.values(monData).forEach(bData => {
                if (bData && bData.thrown) totalBallsThrown += bData.thrown;
            });
        });
    });

    const renderProgress = (current, max, fillClass = '') => {
        const pct = max > 0 ? Math.min(100, Math.round((current / max) * 100)) : 0;
        return `
            <div class="piw-progress-track" style="height: 6px; margin-top: 3px; margin-bottom: 8px;">
                <div class="piw-progress-fill ${fillClass}" style="width: ${pct}%;"></div>
            </div>
        `;
    };

    const headerStyle = 'font-size: 12.5px; font-weight: 800; color: var(--piw-accent-teal); text-transform: uppercase; letter-spacing: 0.6px; margin-bottom: 10px; border-bottom: var(--piw-border-subtle); padding-bottom: 6px;';
    const rowStyle = 'display: flex; justify-content: space-between; font-size: 13px; margin-bottom: 6px; color: var(--piw-text-secondary);';

    return `
        <div style="position: relative; height: 100%; display: flex; flex-direction: column; padding: 14px; box-sizing: border-box;">
            <div style="display: grid; grid-template-columns: repeat(2, 1fr); gap: 12px; text-align: left;">
                <div class="piw-card">
                    <div style="${headerStyle}">General & Combat</div>
                    <div style="${rowStyle}"><span>Time Played</span><b>${playtimeStr}</b></div>
                    <div style="${rowStyle}"><span>Money</span><b>$${state.trainer.money.toLocaleString('en-US')}</b></div>
                    <div style="${rowStyle}"><span>Battles Won</span><b>${battlesWon.toLocaleString('en-US')}</b></div>
                    <div style="${rowStyle}"><span>Faints</span><b>${faints.toLocaleString('en-US')}</b></div>
                    <div style="${rowStyle}"><span>Total Breeds Completed</span><b>${breedsCompleted.toLocaleString('en-US')}</b></div>
                    <div style="${rowStyle}"><span>Total Balls Thrown</span><b>${totalBallsThrown.toLocaleString('en-US')}</b></div>
                </div>
                <div class="piw-card">
                    <div style="${headerStyle}">Pokédex Progress</div>
                    <div style="${rowStyle}"><span>Total Captured</span><b>${totalCaught.toLocaleString('en-US')}</b></div>
                    <div style="${rowStyle}"><span>Shinies Caught</span><b>${shiniesCaught.toLocaleString('en-US')}</b></div>
                    <div style="${rowStyle}"><span>Species Caught</span><b>${uniqueSpeciesCaught} / ${totalSpeciesInRegion}</b></div>
                    ${renderProgress(uniqueSpeciesCaught, totalSpeciesInRegion, '')}
                    <div style="${rowStyle}"><span>Shiny Species</span><b>${uniqueShinySpeciesCaught} / ${totalSpeciesInRegion}</b></div>
                    ${renderProgress(uniqueShinySpeciesCaught, totalSpeciesInRegion, 'is-amber')}
                </div>
                <div class="piw-card">
                    <div style="${headerStyle}">Activities & Rewards</div>
                    <div style="${rowStyle}"><span>Jigglypuff Grains Used</span><b>${(state.stats.jigglypuffGrainsUsed || 0).toLocaleString('en-US')}</b></div>
                    <div style="${rowStyle}"><span>White Candies Claimed</span><b>${(whiteCandiesClaimed || 0).toLocaleString('en-US')}</b></div>
                    <div style="${rowStyle}"><span>Daily Rewards</span><b>${(state.stats.dailyRewards ? state.stats.dailyRewards.daysClaimed : 0).toLocaleString('en-US')}</b></div>
                    <div style="${rowStyle}"><span>Daily Tokens Earned</span><b>${(state.stats.tokensEarned || 0).toLocaleString('en-US')}</b></div>
                    <div style="${rowStyle}"><span>Lab Assignments</span><b>${assignmentsCompleted} / ${maxAssignments}</b></div>
                    ${renderProgress(assignmentsCompleted, maxAssignments, 'is-green')}
                    <div style="${rowStyle}"><span>Progress Challenges</span><b>${challengesCompleted} / ${maxChallenges}</b></div>
                    ${renderProgress(challengesCompleted, maxChallenges, 'is-purple')}
                </div>
                <div class="piw-card">
                    <div style="${headerStyle}">Records</div>
                    <div style="${rowStyle}"><span>Highest Level (Backpack)</span><b>${highestLevel.toLocaleString('en-US')}</b></div>
                    <div style="${rowStyle}"><span>Highest Level (Captured)</span><b>${(state.stats.highestLevelCaptured || 0).toLocaleString('en-US')}</b></div>
                    <div style="${rowStyle}"><span>Highest Quality (Backpack)</span><b>${highestQuality.toLocaleString('en-US')}</b></div>
                    <div style="${rowStyle}"><span>Highest Quality (Captured)</span><b>${(state.stats.highestQualityCaptured || 0).toLocaleString('en-US')}</b></div>
                    <div style="${rowStyle}"><span>Highest IV Sum (Backpack)</span><b>${highestSumIV.toLocaleString('en-US')}</b></div>
                    <div style="${rowStyle}"><span>Highest IV Sum (Captured)</span><b>${(state.stats.highestSumIVCaptured || 0).toLocaleString('en-US')}</b></div>
                    <div style="${rowStyle}"><span>Highest Sum of Stats</span><b>${highestStatSum > 0 ? `${highestStatSumName}: ${Math.round(highestStatSum).toLocaleString('en-US')}` : 'None'}</b></div>
                    <div style="${rowStyle}"><span>Highest DPS</span><b>${highestDps > 0 ? `${highestDpsName}: ${Math.round(highestDps).toLocaleString('en-US')}` : 'None'}</b></div>
                </div>
            </div>
        </div>
    `;
}
function generateTrainerBadgesHtml() {
    let badgesHtml = '<div style="display: grid; grid-template-columns: repeat(4, 1fr); gap: 12px; justify-items: stretch; align-items: stretch; margin: 0 auto;">';

    // To be consistent with gift mapping, we map badge icons based on the current region and sequential badge number
    const badgeRegion = state.currentRegionName || 'Kanto';
    const totalBadges = badgeRegion === 'Alola' ? 11 : 8;
    const earnedBadges = state.trainer.badges || 0;

    for (let i = 0; i < totalBadges; i++) {
        const badgeNum = i + 1;
        const isEarned = i < earnedBadges;
        const badgeFile = window.getBadgeFileName(badgeRegion, badgeNum);
        const imgFilter = isEarned ? 'filter: drop-shadow(0 0 8px rgba(255, 215, 0, 0.6));' : 'filter: grayscale(100%) opacity(0.35);';
        badgesHtml += `
            <div class="piw-card" style="display: flex; flex-direction: column; justify-content: center; align-items: center; gap: 8px; ${isEarned ? 'border-color: rgba(250, 204, 21, 0.45);' : 'opacity: 0.72;'}">
                <img src="./Assets/Gym/Badges/${badgeFile}" style="width: 84px; height: 84px; object-fit: contain; ${imgFilter}" title="Badge ${badgeNum}">
                <div style="font-size: 12px; font-weight: 700; color: ${isEarned ? '#fde68a' : '#64748b'};">Badge ${badgeNum}</div>
            </div>
        `;
    }
    badgesHtml += '</div>';

    return `
        <div style="text-align: center; padding: 14px; box-sizing: border-box;">
            ${badgesHtml}
        </div>
    `;
}
function generateTrainerMedalsHtml() {
    const regions = ['Kanto', 'Johto', 'Hoenn', 'Sinnoh', 'Unova', 'Kalos', 'Alola', 'Galar', 'Hisui', 'Paldea'];

    let medalsHtml = '<div style="display: grid; grid-template-columns: repeat(2, 1fr); grid-template-rows: repeat(5, 1fr); gap: 10px; height: 100%; padding: 14px; overflow: hidden; box-sizing: border-box;">';

    regions.forEach(region => {
        let caughtCount = 0;
        let shinyCount = 0;
        let totalInRegion = 0;

        // Get the regional stats object safely
        let regionalStats;
        if (region === 'Kanto' && state.currentRegionName === 'Kanto') {
            // For Kanto, when it is the current region, stats are in state.stats
            regionalStats = state.stats;
        } else if (region === 'Kanto' && state.regions && state.regions['Kanto']) {
            regionalStats = state.regions['Kanto'].stats;
        } else {
            regionalStats = state.regions && state.regions[region] ? state.regions[region].stats : null;
        }

        // fallback to state.stats if currentRegionName matches this region and we don't have it nested
        if (!regionalStats && state.currentRegionName === region) {
            regionalStats = state.stats;
        }

        if (state.config && state.config.pokemonData) {
            const regionKey = region.toLowerCase() + '_id';

            state.config.pokemonData.forEach(p => {
                if (p[regionKey]) {
                    totalInRegion++;
                    if (regionalStats) {
                        if (regionalStats.caughtSpecies && regionalStats.caughtSpecies[p.name]) {
                            caughtCount++;
                        }
                        if (regionalStats.caughtShiniesSpecies && regionalStats.caughtShiniesSpecies[p.name]) {
                            shinyCount++;
                        }
                    }
                }
            });
        }

        const hasFirst = caughtCount > 0;
        const hasSecond = totalInRegion > 0 && caughtCount >= totalInRegion;
        const hasThird = totalInRegion > 0 && shinyCount >= totalInRegion;

        medalsHtml += `
            <div
                class="piw-card is-interactive medal-item"
                data-region="${region}" data-caught="${caughtCount}" data-shiny="${shinyCount}" data-total="${totalInRegion}"
                onclick="if(window.showMedalDetails) window.showMedalDetails('${region}', ${caughtCount}, ${shinyCount}, ${totalInRegion})"
                style="padding: 10px 15px; display: flex; justify-content: space-around; align-items: center; min-height: 0;"
            >
                <div style="text-align: center; ${!hasFirst ? 'filter: grayscale(100%) opacity(0.5);' : 'filter: drop-shadow(0 0 5px rgba(255, 215, 0, 0.5));'}">
                    <img src="Assets/Extra/Medals/${region} First.png" alt="${region} First" style="width: 100%; max-width: 64px; max-height: 100%; object-fit: contain; image-rendering: pixelated;" onerror="this.src='Assets/Extra/Medals/Kanto First.png'">
                </div>
                <div style="text-align: center; ${!hasSecond ? 'filter: grayscale(100%) opacity(0.5);' : 'filter: drop-shadow(0 0 8px rgba(255, 215, 0, 0.8));'}">
                    <img src="Assets/Extra/Medals/${region} Second.png" alt="${region} Second" style="width: 100%; max-width: 64px; max-height: 100%; object-fit: contain; image-rendering: pixelated;" onerror="this.src='Assets/Extra/Medals/Kanto Second.png'">
                </div>
                <div style="text-align: center; ${!hasThird ? 'filter: grayscale(100%) opacity(0.5);' : 'filter: drop-shadow(0 0 10px rgba(255, 215, 0, 1));'}">
                    <img src="Assets/Extra/Medals/${region} Third.png" alt="${region} Third" style="width: 100%; max-width: 64px; max-height: 100%; object-fit: contain; image-rendering: pixelated;" onerror="this.src='Assets/Extra/Medals/Kanto Third.png'">
                </div>
            </div>
        `;
    });

    medalsHtml += '</div>';

    return medalsHtml;
}
function generateTrainerDetailsHtml(tab, options) {
    const headerTitle = tab === 'medal-details' ? `${options.region} Medals` : `${options.title} Upgrades`;
    const backTab = tab === 'medal-details' ? 'medals' : 'upgrades';
    return `
        <div class="floating-window" style="position: relative; width: 100%; height: 100%; box-sizing: border-box; display: flex; flex-direction: column; overflow: hidden;">
            <div class="window-header" style="position: relative; cursor: default;">
                <span>${headerTitle}</span>
                <div class="window-header-actions">
                    <span class="window-ctrl-btn is-close" onclick="window.showTrainerStats('${backTab}')" title="Close">X</span>
                </div>
            </div>
            <div class="window-content-container" style="flex: 1; overflow-y: auto; overflow-x: hidden;">
                <div style="padding: 15px; box-sizing: border-box; width: 100%; height: 100%;">
                    ${options.html}
                </div>
            </div>
        </div>
    `;
}
function generateTrainerUpgradesHtml() {
    let contentHtml = '<div style="display: grid; grid-template-columns: repeat(auto-fill, minmax(200px, 1fr)); gap: 12px; padding: 14px; box-sizing: border-box;">';
    let hasAnyUpgrade = false;

    if (state.stats.upgrades) {
        const upgradeTypes = [
            { key: 'ballsTier', configKey: 'ballPocket' },
            { key: 'potionsTier', configKey: 'potionSatchel' },
            { key: 'boxTier', configKey: 'pokemonBox' },
            { key: 'glassTier', configKey: 'glass' },
            { key: 'smartwatchTier', configKey: 'smartwatch' },
            { key: 'speedTier', configKey: 'speed' },
            { key: 'lootTier', configKey: 'loot' },
            { key: 'daycareTier', configKey: 'daycare' }
        ];

        upgradeTypes.forEach(type => {
            const tier = state.stats.upgrades[type.key] || 0;
            if (tier > 0) {
                // Show the currently purchased tier (index tier - 1)
                const configItem = state.config?.balance?.expansions?.[type.configKey]?.[tier - 1];
                if (configItem) {
                    hasAnyUpgrade = true;
                    let displayName = configItem.displayName || configItem.name;
                    if (type.configKey === 'daycare') {
                        const parts = displayName.split(' ');
                        if (parts.length >= 2) {
                            displayName = parts.slice(0, -1).join(' ') + '<br>' + parts[parts.length - 1];
                        }
                    }
                    let description = configItem.description || '';
                    if (type.configKey === 'ballPocket') {
                        description = `Ball capacity: ${getCapacity(state, 'balls').toLocaleString('en-US')}`;
                    } else if (type.configKey === 'potionSatchel') {
                        description = `Potion capacity: ${getCapacity(state, 'potions').toLocaleString('en-US')}`;
                    } else if (type.configKey === 'pokemonBox') {
                        description = `Storage capacity: ${getCapacity(state, 'box').toLocaleString('en-US')}`;
                    } else if (type.configKey === 'speed') {
                        if (tier === 1) description = "Encounter time decreased by 10%";
                        else if (tier === 2) description = "Encounter time decreased by 20%";
                        else if (tier === 3) description = "Encounter time decreased by 30%";
                        else if (tier === 4) description = "Encounter time decreased by 40%";
                        else if (tier >= 5) description = "Encounter time decreased by 50%";
                    } else if (type.configKey === 'glass') {
                        if (tier === 1) description = "Show Healthbar at Main View";
                        else if (tier === 2) description = "Show Damage at Main View";
                        else if (tier === 3) description = "Show Level at Main View";
                        else if (tier === 4) description = "Show Quality at Main View";
                        else if (tier >= 5) description = "Show SumIV at Main View";
                    } else if (type.configKey === 'loot') {
                        if (tier === 1) description = "Can loot Potions";
                        else if (tier === 2) description = "Can loot Balls";
                        else if (tier === 3) description = "Can loot Stones";
                        else if (tier === 4) description = "Can loot Vitamins";
                    } else if (type.configKey === 'smartwatch') {
                        if (tier === 1) description = "Can Select Ball at Main View";
                        else if (tier === 2) description = "Can Select Potion at Main View";
                        else if (tier >= 3) description = "Access Smart Mode Capture<br>at Main View";
                    }

                    contentHtml += `
                        <div class="piw-card is-interactive upgrade-item" data-type="${type.configKey}" data-tier="${tier}" onclick="if(window.showUpgradeDetails) window.showUpgradeDetails('${type.configKey}', ${tier})" style="padding: 14px; text-align: center; display: flex; flex-direction: column; align-items: center; justify-content: flex-start; gap: 10px;">
                            <div style="font-size: 14px; font-weight: 700; color: var(--piw-text-primary);">${displayName}</div>
                            <img src="./Assets/Items/Upgrades/${configItem.name}.png" style="width: 50px; height: 50px; object-fit: contain;" alt="${displayName}">
                            <div style="font-size: 12px; color: var(--piw-text-secondary); line-height: 1.3;">${description}</div>
                        </div>
                    `;
                }
            }
        });
    }

    contentHtml += '</div>';

    if (!hasAnyUpgrade) {
        contentHtml = '<div style="text-align: center; font-style: italic; color: var(--piw-text-muted); padding: 28px;">No upgrades purchased yet.</div>';
    }

    return contentHtml;
}

    window.closeTrainerInnerModal = function() {
        const overlay = document.getElementById('trainer-inner-modal-overlay');
        if (overlay) {
            overlay.remove();
        }
    };

    window.showTrainerStats = function(tab = 'statistics', options = {}) {
        if(checkCombatLock()) return;

        if (tab === 'medal-details' || tab === 'upgrade-details') {
            const win = document.getElementById('window-trainer');
            const innerContent = win ? win.querySelector('.window-content-container') : null;
            if (innerContent) {
                innerContent.style.position = 'relative';
                const existingOverlay = document.getElementById('trainer-inner-modal-overlay');
                if (existingOverlay) existingOverlay.remove();

                const headerTitle = tab === 'medal-details' ? `${options.region} Medals` : `${options.title} Upgrades`;
                const overlay = document.createElement('div');
                overlay.id = 'trainer-inner-modal-overlay';
                overlay.className = 'piw-inner-overlay';
                overlay.onclick = (e) => {
                    if (e.target === overlay) window.closeTrainerInnerModal();
                };

                const doc = new DOMParser().parseFromString(`
                    <div class="floating-window" onclick="event.stopPropagation()" onmousedown="event.stopPropagation()" style="position: relative; width: 85%; max-width: 650px; max-height: 85%; box-sizing: border-box; display: flex; flex-direction: column; overflow: hidden;">
                        <div class="window-header" style="position: relative; cursor: default;">
                            <span>${headerTitle}</span>
                            <div class="window-header-actions">
                                <span class="window-ctrl-btn is-close" onclick="if(window.closeTrainerInnerModal) window.closeTrainerInnerModal()" title="Close">X</span>
                            </div>
                        </div>
                        <div class="window-content-container" style="flex: 1; overflow-y: auto; overflow-x: hidden; padding: 15px; box-sizing: border-box;">
                            ${options.html}
                        </div>
                    </div>
                `, 'text/html');
                const modalEl = doc.body.firstElementChild;
                if (modalEl) {
                    overlay.appendChild(modalEl);
                    innerContent.appendChild(overlay);
                }
                return;
            }
        }

        const isShiny = options.showShiny || false;
        let titleHtml = '';

        // Ensure the main Trainer title and navigation tabs are always shown regardless of the sub-tab/inner window
        const activeTab = (tab === 'medal-details') ? 'medals' : (tab === 'upgrade-details') ? 'upgrades' : tab;

        titleHtml = `
            <div style="display: flex; flex-direction: column; align-items: center; gap: 6px; width: 100%;">
                <div style="font-weight: 700; font-size: 18px; color: white; letter-spacing: 0.3px;">Trainer</div>
                <div class="piw-tab-bar" onmousedown="event.stopPropagation()">
                    <button class="piw-tab-btn ${activeTab === 'statistics' ? 'is-active' : ''}" onclick="window.showTrainerStats('statistics')">Statistics</button>
                    <button class="piw-tab-btn ${activeTab === 'badges' ? 'is-active' : ''}" onclick="window.showTrainerStats('badges')">Badges</button>
                    <button class="piw-tab-btn ${activeTab === 'catch-rate' ? 'is-active' : ''}" onclick="window.showTrainerStats('catch-rate', { showShiny: false })">Catch Rate</button>
                    <button class="piw-tab-btn ${activeTab === 'upgrades' ? 'is-active' : ''}" onclick="window.showTrainerStats('upgrades')">Upgrades</button>
                    <button class="piw-tab-btn ${activeTab === 'medals' ? 'is-active' : ''}" onclick="window.showTrainerStats('medals')">Medals</button>
                </div>
                ${activeTab === 'catch-rate' ? `
                <div class="piw-tab-bar" onmousedown="event.stopPropagation()" style="margin-top: 2px;">
                    <button class="piw-tab-btn ${!isShiny ? 'is-active' : ''}" style="font-size: 12px; padding: 4px 12px;" onclick="window.showTrainerStats('catch-rate', { showShiny: false })">Normal</button>
                    <button class="piw-tab-btn ${isShiny ? 'is-active' : ''}" style="font-size: 12px; padding: 4px 12px;" onclick="window.showTrainerStats('catch-rate', { showShiny: true })">Shiny</button>
                </div>
                ` : ''}
            </div>
        `;

        let contentHtml = '';

        if (tab === 'statistics') {
            contentHtml = generateTrainerStatisticsHtml();
        } else if (tab === 'badges') {
            contentHtml = generateTrainerBadgesHtml();
        } else if (tab === 'catch-rate') {
            const showShiny = options.showShiny || false;
            contentHtml = generateCatchRateHtml(showShiny);
        } else if (tab === 'medals') {
            contentHtml = generateTrainerMedalsHtml();
        } else if (tab === 'medal-details' || tab === 'upgrade-details') {
            contentHtml = generateTrainerDetailsHtml(tab, options);
        } else if (tab === 'upgrades') {
            contentHtml = generateTrainerUpgradesHtml();
        }

        const isInnerModal = (tab === 'medal-details' || tab === 'upgrade-details');
        const existingWin = document.getElementById('window-trainer');
        const preservedHeight = (isInnerModal && existingWin) ? existingWin.offsetHeight : null;

        showModal(titleHtml, contentHtml, "window-trainer");

        const win = document.getElementById('window-trainer');
        if (win) {
            if (preservedHeight) {
                win.style.height = `${preservedHeight}px`;
            }
            const innerContent = win.querySelector('.window-content-container');
            if (innerContent) {
                innerContent.style.setProperty('padding', '0px', 'important');
                if (isInnerModal) {
                    innerContent.style.height = '100%';
                    innerContent.style.overflowX = 'hidden';
                }

                // Add redundant event listeners (Failsafe for onclick restriction)
                const medalItems = innerContent.querySelectorAll('.medal-item');
                medalItems.forEach(item => {
                    item.addEventListener('click', (e) => {
                        const region = item.getAttribute('data-region');
                        const caught = parseInt(item.getAttribute('data-caught') || '0', 10);
                        const shiny = parseInt(item.getAttribute('data-shiny') || '0', 10);
                        const total = parseInt(item.getAttribute('data-total') || '0', 10);
                        if(window.showMedalDetails && region) window.showMedalDetails(region, caught, shiny, total);
                    });
                });

                const upgradeItems = innerContent.querySelectorAll('.upgrade-item');
                upgradeItems.forEach(item => {
                    item.addEventListener('click', (e) => {
                        const type = item.getAttribute('data-type');
                        const tier = parseInt(item.getAttribute('data-tier') || '0', 10);
                        if(window.showUpgradeDetails && type && tier > 0) window.showUpgradeDetails(type, tier);
                    });
                });

                const catchRateSearch = innerContent.querySelector('#catch-rate-search');
                if (catchRateSearch) {
                    catchRateSearch.addEventListener('input', (e) => {
                        const query = e.target.value.trim().toLowerCase();
                        const rows = innerContent.querySelectorAll('.catch-rate-row');
                        rows.forEach(row => {
                            const name = row.getAttribute('data-name') || '';
                            row.style.display = name.includes(query) ? '' : 'none';
                        });
                    });
                }
            }
            if (!isInnerModal) {
                setTimeout(() => {
                    if (typeof win.adjustHeightForNewContent === 'function') {
                        win.adjustHeightForNewContent();
                    }
                }, 50);
            }
        }
    };

    bindBtn('btn-stats', () => {
        window.showTrainerStats();
    });

    bindBtn('btn-settings', () => {
        if(!checkCombatLock()) showSettings();
    });

    bindBtn('btn-help', () => {
        if(!checkCombatLock()) showHelp();
    });

    bindBtn('btn-exit', () => {
        window.promptExitGame();
    });
}

export const promptExitGame = () => {
    if (confirm("Do you want to leave the game?")) {
        if (storage.currentProfileId) {
            storage.save(state);
        }
        window.close(); // Closes the app completely (works in Electron/app context)
    }
};

window.promptExitGame = promptExitGame;
window.saveGame = () => storage.save(state);
window.requestSaveGame = () => storage.requestSave(state);


// Ensure the UI script runs
init();


window.showGameAlert = function(message, attachToElementId = null) {
    let container = document.body;
    let isAbsolute = false;

    if (attachToElementId) {
        const el = document.getElementById(attachToElementId);
        if (el) {
            container = el;
            isAbsolute = true;
        }
    }

    let alertBox = document.createElement('div');
    alertBox.className = 'game-alert-toast';

    if (isAbsolute) {
        alertBox.style.position = 'absolute';
        if (window.getComputedStyle(container).position === 'static') {
            container.style.position = 'relative';
        }
    } else {
        alertBox.style.position = 'fixed';
    }

    if (isAbsolute) {
        // Place it just below the typical header height for standardized floating window alerts
        alertBox.style.top = '40px';
    } else {
        alertBox.style.top = '20px';
    }
    alertBox.style.left = '50%';
    alertBox.style.transform = 'translateX(-50%)';
    alertBox.style.backgroundColor = 'rgba(0, 0, 0, 0.85)';
    alertBox.style.color = '#fff';
    alertBox.style.padding = '15px 30px';
    alertBox.style.borderRadius = '10px';
    alertBox.style.border = '2px solid #3498db';
    alertBox.style.boxShadow = '0 4px 15px rgba(0,0,0,0.5)';
    alertBox.style.zIndex = '999999';
    alertBox.style.fontSize = '18px';
    alertBox.style.fontWeight = 'bold';
    alertBox.style.textAlign = 'center';
    alertBox.style.pointerEvents = 'none';
    alertBox.style.opacity = '0';
    alertBox.style.transition = 'opacity 0.3s ease-in-out';
    alertBox.textContent = message;

    container.appendChild(alertBox);

    // Trigger reflow to ensure the transition runs
    void alertBox.offsetWidth;
    alertBox.style.opacity = '1';

    setTimeout(() => {
        alertBox.style.opacity = '0';
        setTimeout(() => {
            if (alertBox.parentElement) {
                alertBox.parentElement.removeChild(alertBox);
            }
        }, 300); // Wait for fade out
    }, 2500);
};

window.enterSafariZone = () => {
    switchView("BATTLE_ARENA");
    if (window.globals && window.globals.battleSystem) {
        window.globals.battleSystem.stop();
        window.globals.battleSystem.activeEncounter = null;
        window.globals.battleSystem.isSearching = false;
        if (window.globals.battleSystem.gymState) window.globals.battleSystem.gymState.isActive = false;
        const targetRoute = window.currentSafariZone || (window.globals.battleSystem.state.currentRoute && window.globals.battleSystem.state.currentRoute.toLowerCase().includes('safari') ? window.globals.battleSystem.state.currentRoute : "Johto Safari Zone");
        window.globals.battleSystem.state.currentRoute = targetRoute;
        window.globals.battleSystem.searchNext();

    }
};

window.leaveSafariZone = () => {
    switchView("MAP");
};
window.switchView = switchView;

window.initGame = init;
window.startGame = startGame;




function renderProfessorSprite(currentRegion) {
    const labConfigs = {
        'Kanto': { sprite: "1_Kanto_Professor_Oak.png", position: { rel_x: 0.5861, rel_y: 0.016, px_width: 595, px_height: 1326 } },
        'Johto': { sprite: "2_Johto_Professor_Elm.png", position: { rel_x: 0.5628, rel_y: 0.037, px_width: 624, px_height: 1256 } },
        'Hoenn': { sprite: "3_Hoenn_Professor_Birch.png", position: { rel_x: 0.4272, rel_y: 0.0395, px_width: 1000, px_height: 948 } },
        'Sinnoh': { sprite: "4_Sinnoh_Professor_Rowan.png", position: { rel_x: 0.5881, rel_y: 0.0415, px_width: 452, px_height: 957 } },
        'Unova': { sprite: "5_Unova_Professor_Juniper.png", position: { rel_x: 0.6294, rel_y: 0.019, px_width: 526, px_height: 1280 } },
        'Kalos': { sprite: "6_Kalos_Professor_Sycamore.png", position: { rel_x: 0.4889, rel_y: 0.053, px_width: 873, px_height: 1371 } },
        'Alola': { sprite: "7_Alola_Professor_Kukui.png", position: { rel_x: 0.5853, rel_y: 0.046, px_width: 597, px_height: 1415 } },
        'Galar': { sprite: "8_Galar_Professor_Magnolia.png", position: { rel_x: 0.6311, rel_y: 0.035, px_width: 458, px_height: 1264 } },
        'Hisui': { sprite: "9_Hisui_Professor_Laventon.png", position: { rel_x: 0.5833, rel_y: 0.02, px_width: 612, px_height: 1367 } },
        'Paldea': { sprite: "10_Paldea_Turo.png", position: { rel_x: 0.5872, rel_y: 0.042, px_width: 475, px_height: 1184 } }
    };

    const config = labConfigs[currentRegion] || labConfigs['Kanto'];
    const profSprite = `./Assets/Lab/${config.sprite}`;

    const profImg = document.getElementById("prof-generic-sprite");
    if (profImg) {
        profImg.src = profSprite;
        profImg.style.left = `${config.position.rel_x * 100}%`;
        profImg.style.top = `${config.position.rel_y * 100}%`;
        profImg.style.width = `${(config.position.px_width / 1800) * 100}%`;
        profImg.style.height = `${(config.position.px_height / 1000) * 100}%`;
    }
}

function renderStarterSelection(currentRegion, labContent) {
    const regionStarters = {
        'Kanto': [1, 4, 7],
        'Johto': [152, 155, 158],
        'Hoenn': [252, 255, 258],
        'Sinnoh': [387, 390, 393],
        'Unova': [495, 498, 501]
    };
    const starterIds = regionStarters[currentRegion] || regionStarters['Kanto'];

    let containerDiv = document.createElement('div');
    containerDiv.style.backgroundColor = 'rgba(0,0,0,0.8)';
    containerDiv.style.position = 'absolute';
    containerDiv.style.left = '15%';
    containerDiv.style.top = '50%';
    containerDiv.style.transform = 'translateY(-50%)';
    containerDiv.style.padding = '30px';
    containerDiv.style.borderRadius = '12px';
    containerDiv.style.border = '2px solid #1abc9c';
    containerDiv.style.boxShadow = '0 8px 24px rgba(0, 0, 0, 0.65), 0 0 14px rgba(26, 188, 156, 0.25)';

    let h2 = document.createElement('h2');
    h2.textContent = 'Choose your Starter Pokémon';
    containerDiv.appendChild(h2);

    let starterChoices = document.createElement('div');
    starterChoices.className = 'starter-choices';

    starterIds.forEach(id => {
        const p = state.config.pokemonData.find(p => p.id === id);
        const name = p ? p.name : 'Unknown';
        const paddedId = id.toString().padStart(4, '0');
        const spriteSrc = window.getSpriteUrl ? window.getSpriteUrl(id, false) : `Assets/Pokemon Sprites/Reg5 BW/Gen5BW_${paddedId}_${name}.png`;

        const btn = document.createElement('button');
        btn.onclick = () => window.selectStarter(id);

        const img = document.createElement('img');
        img.src = spriteSrc;
        img.style.width = '80px';
        img.style.height = '80px';

        const br = document.createElement('br');

        const textNode = document.createTextNode(name);

        btn.appendChild(img);
        btn.appendChild(br);
        btn.appendChild(textNode);
        starterChoices.appendChild(btn);
    });

    containerDiv.appendChild(starterChoices);
    labContent.replaceChildren(containerDiv);
}

function renderAssignmentsAndBoosters(currentRegion, labContent) {
    let containerDiv = document.createElement('div');
    containerDiv.className = 'prof-lab-lobby-modal';

    let h2 = document.createElement('h2');
    h2.style.marginTop = '0';
    h2.textContent = `${currentRegion} Professor Lab`;
    containerDiv.appendChild(h2);

    let flexDiv = document.createElement('div');
    flexDiv.style.display = 'flex';
    flexDiv.style.flexDirection = 'column';
    flexDiv.style.gap = '10px';

    let innerDiv = document.createElement('div');
    innerDiv.style.position = 'relative';
    innerDiv.style.display = 'inline-block';
    innerDiv.style.width = '100%';

    let btn = document.createElement('button');
    btn.onclick = () => window.showProfLabModal();
    btn.className = 'action-btn action-btn-primary action-btn-pill';
    btn.style.width = '100%';
    btn.appendChild(document.createTextNode('Assignments'));
    btn.appendChild(document.createElement('br'));
    btn.appendChild(document.createTextNode('and Boosters'));
    innerDiv.appendChild(btn);

    if (state.stats.showProfLobbyNotification) {
        let img = document.createElement('img');
        img.src = 'Assets/Extra/Icons/ExclamationMark.png';
        img.style.position = 'absolute';
        img.style.top = '-5px';
        img.style.right = '-5px';
        img.style.width = '20px';
        img.style.height = 'auto';
        img.style.pointerEvents = 'none';
        img.style.zIndex = '10';
        innerDiv.appendChild(img);
    }

    flexDiv.appendChild(innerDiv);
    containerDiv.appendChild(flexDiv);

    labContent.replaceChildren(containerDiv);
}

export function renderProfessorLab() {
    const labContent = document.getElementById("generic-lab-content");
    const labView = document.getElementById("view-professor-lab");
    if (!labContent || !labView) return;

    if (state.stats.showProfMarkerPulse) {
        state.stats.showProfMarkerPulse = false;
    }

    let currentRegion = window.currentMapRegion || 'Kanto';

    renderProfessorSprite(currentRegion);

    if (!state.stats.hasPickedStarter) {
        renderStarterSelection(currentRegion, labContent);
    } else {
        renderAssignmentsAndBoosters(currentRegion, labContent);
    }
}



window.simulateSleepFarm = function() {
    const { timeElapsedMs, maxTimeMs, availableGrains } = calculateZzZSimulationParams(state, Date.now(), ZZZ_CONFIG);

    const results = globals.battleSystem.runFastForward(timeElapsedMs);
    const displayTimeMs = results.simulatedTimeMs !== undefined ? results.simulatedTimeMs : timeElapsedMs;

    const { sleepMinutes } = consumeZzZGrains(state, displayTimeMs, maxTimeMs, availableGrains, ZZZ_CONFIG);
    trackDailyChallenge('sleep_minutes', { amount: sleepMinutes });

    state.isZzZMode = false;
    state.zzzTimestamp = null;
    storage.save(state);

    const summary = summarizeZzZResults(results, state, maxTimeMs, ZZZ_CONFIG);
    const resultsHtml = buildZzZResultsModalHtml(summary, state);

    showModal("ZzZ Mode", resultsHtml, "window-zzz-rewards", "320px");
    const winRewards = document.getElementById('window-zzz-rewards');
    if (winRewards) {
        winRewards.style.width = '320px';
        winRewards._sizeInitialized = false;
    }
    if (window.windowManager) window.windowManager.recalculateWindowSize('window-zzz-rewards');

    document.getElementById('btn-zzz-results-close-dynamic').onclick = () => {
        if(window.windowManager) window.windowManager.closeDynamicWindow('window-zzz-rewards');

        if (results.fainted) {
            state.currentRoute = "PokeCenter & PokeMarket";
            window.navigateToLocation("PokeCenter & PokeMarket");
        } else if (results.outOfMoney) {
            if (state.currentRoute && state.currentRoute.toLowerCase().includes('safari')) {
                window.navigateToLocation(state.currentRoute);
            } else if (state.currentRoute && state.currentRoute.startsWith("Celadon Casino ")) {
                state.currentRoute = "Celadon Casino";
                window.navigateToLocation("Celadon Casino");
            } else {
                returnToLab();
            }
        } else {
            returnToLab();
        }
    };

};


window.promptWakeUpRegion = function(regionName) {
    const resumeHtml = buildZzZWakeUpModalHtml(regionName, state, ZZZ_CONFIG);
    showModal(`Wake Up ${regionName}?`, resumeHtml, "window-zzz-wakeup", "450px");
    const winWakeup = document.getElementById('window-zzz-wakeup');
    if (winWakeup) {
        winWakeup.style.width = '450px';
        winWakeup.style.height = 'auto';
        winWakeup._sizeInitialized = false;
    }
    if (window.windowManager) window.windowManager.recalculateWindowSize('window-zzz-wakeup');

    document.getElementById('btn-zzz-wakeup-no').onclick = () => {
        if(window.windowManager) window.windowManager.closeDynamicWindow('window-zzz-wakeup');
    };

    document.getElementById('btn-zzz-wakeup-yes').onclick = () => {
        if(window.windowManager) window.windowManager.closeDynamicWindow('window-zzz-wakeup');
        if (window.closeModal) window.closeModal();

        if (globals.battleSystem) {
            globals.battleSystem.stop();
            globals.battleSystem.activeEncounter = null;
            globals.battleSystem.isSearching = false;
        }

        if (state.currentRegionName !== regionName) {
            window.currentMapRegion = regionName;
            swapRegion(regionName);
        }

        window.simulateSleepFarm();
        window.updateZzZModeUI();
        updateMainControl();
        updateUI();

        if (window.windowManager) window.windowManager.toggleWindow('main-view-window', true);
    };
};

window.showWakeUpModal = function() {
    window.promptWakeUpRegion(state.currentRegionName);
};
