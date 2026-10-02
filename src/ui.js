import { getCapacity } from "./mathEngine.js";
import { WindowManager } from './windowManager.js';
import { setupClickThrough } from './clickThrough.js';
import { getChallengeData } from './ui/mainControl.js';

import * as mathEngine from "./mathEngine.js";
import BattleSystem from "./battleSystem.js";
import DayCare from "./dayCare.js";
import Storage from "./storage.js";

// Import State and modules
import { state, setBattleSystem, globals } from './state.js';
import { trackDailyChallenge, checkAndResetDailyChallenges } from './ui/dailyChallenges.js';

window.dismissDaycareMessage = function() {
    state.globalStats.hasSeenDaycare = true;
    document.getElementById('daycare-first-time-overlay').style.display = 'none';
    if (window.storageRef) {
        window.storageRef.save(state);
    }
    updateUI();
};

const oakTutorialMessages = [
    "<p>Hello, Trainer!</p><p>Here I will give you some tips for introduce you to game.</p><p>Do you want a tutorial guide to help you understand better the game or do you want to skip and start the game?</p>",
    "<p>This game runs only on the Main Control Tab.</p><p>It is in there that you will open and close all modules</p><p>This module you are seeing it is called “Main View” and it will display all the visual when battling or shopping.</p>",
    "<p>Icons are displayed in the Main Control Tab. You will be able to open modules with them.</p><p>The first two modules are “Main View” and “Team View”, and they will help when you are in battle mode.</p>",
    "<p>Next set of icons will help you to play the game.</p><p>Map will let you travel to different spots and places.</p><p>Backpack will allow you to see items and Pokémons.</p><p>Pokedex with bring all info of Pokémons.</p><p>Trainer have Statistics of the game.</p>",
    "<p>Next set of icon are “Objectives Related”</p><p>Here we have Daily Calendar. It will have daily challenges and rewards you each day you play. It also have a shop to spend Daily Tokens earned… Make sure to expend them on upgrades!</p><p>Next is the Progress Challenges. Completing the Challenge grants a new spot to travel and may grant some gifts.</p>",
    "<p>The last set of icons are related to settings.</p><p>The first is “Help”. In there you can find information about the whole game (with formulas).</p><p>“Settings” will let you change configurations of the game.</p><p>If you want to leave game, just go to the “Exit” icon.</p>",
    "<p>Along the gameplay, some new icons will appear in Main Control.</p><p>But don’t worry, you will be told what they are.</p>",
    "<p>On maps you can find places that are HUB for interactions.</p><p>You are at “Professor Oak Lab” now, and I have some assignments for you… make sure to conclude them to earn boosts.</p>",
    "<p>Now you are all set!</p><p>If you need more help, make sure to open the Help Module!</p><p>Have fun and CATCH THEM ALL!</p>"
];
let currentOakTutorialIndex = 0;

window.skipOakTutorial = function() {
    state.globalStats.hasSeenOakTutorial = true;
    const overlay = document.getElementById('oak-tutorial-overlay');
    if (overlay) overlay.style.display = 'none';
    if (window.storageRef) window.storageRef.save(state);
};

window.proceedOakTutorial = function() {
    currentOakTutorialIndex++;
    if (currentOakTutorialIndex >= oakTutorialMessages.length - 1) {
        // Switch to the conclude button on the last message
        document.getElementById('btn-oak-tutorial-skip').style.display = 'none';
        document.getElementById('btn-oak-tutorial-proceed').style.display = 'none';
        document.getElementById('btn-oak-tutorial-conclude').style.display = 'inline-block';
    } else {
        document.getElementById('btn-oak-tutorial-proceed').innerText = `Proceed ${currentOakTutorialIndex + 1}/${oakTutorialMessages.length - 1}`;
    }

    if (currentOakTutorialIndex < oakTutorialMessages.length) {
        document.getElementById('oak-tutorial-text').innerHTML = oakTutorialMessages[currentOakTutorialIndex];
    }
};

window.concludeOakTutorial = function() {
    window.skipOakTutorial();
};

export function showOakTutorialIfNeeded() {
    if (!state.globalStats.hasSeenOakTutorial) {
        const overlay = document.getElementById('oak-tutorial-overlay');
        if (overlay) {
            currentOakTutorialIndex = 0;
            document.getElementById('oak-tutorial-text').innerHTML = oakTutorialMessages[currentOakTutorialIndex];

            // Reset buttons visibility
            document.getElementById('btn-oak-tutorial-skip').style.display = 'inline-block';

            const proceedBtn = document.getElementById('btn-oak-tutorial-proceed');
            proceedBtn.innerText = `Proceed 1/${oakTutorialMessages.length - 1}`;
            proceedBtn.style.display = 'inline-block';

            document.getElementById('btn-oak-tutorial-conclude').style.display = 'none';

            overlay.style.display = 'flex';
        }
    }
}


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

export const TYPE_COLORS = {
    "Bug": "#aead56",
    "Dark": "#636066",
    "Dragon": "#648abd",
    "Electric": "#ebc74a",
    "Fairy": "#e09bd4",
    "Fighting": "#d98251",
    "Fire": "#da6149",
    "Flying": "#92add3",
    "Ghost": "#8c769f",
    "Grass": "#6da862",
    "Ground": "#b0845f",
    "Ice": "#76c4c5",
    "Normal": "#a69b93",
    "Poison": "#af56a7",
    "Psychic": "#e48194",
    "Rock": "#a7a7a7",
    "Steel": "#869ba7",
    "Water": "#6391c7",
};
import { openMultiplayerModal } from './ui/multiplayer.js';
import { updateMainControl } from './ui/mainControl.js';
import { updateSidebar } from './ui/sidebar.js';
import { updateBattleArena, showDamage, playCombatAnimations, triggerDefeatAnimation, showLoot } from './ui/battle.js';
import { showCalendar } from './ui/calendar.js';
import './ui/tokenShop.js';
import { showGiftModal } from './ui/gift.js';
import { showMap, navigateToLocation, showMapTooltip, hideMapTooltip } from './ui/map.js';
import { showPokedex, showDexEntry, showSmartCaptureMode, toggleSmartCaptureShinyMode, showSmartCaptureBallSelection, selectSmartCaptureBall } from './ui/pokedex.js';
import { showPokemonStats, showPokemonStatsByUuid, evolvePokemon } from './ui/pokemonStats.js';
import { showBonusCandyModal } from './ui/bonusCandy.js';
window.showBonusCandyModal = showBonusCandyModal;
window.showGiftModal = showGiftModal;
import { showSettings, exportLog, showAddPokemonModal, forceNextEncounter, activateCheat, showTimeLapseModal, runTimeLapse } from './ui/settings.js';
import { setupMarket, buyItem, openPokeMarketBuy, renderPokeMarketTab, updateBuyItemPrice, buySetMax } from './ui/market.js';
import { showBackpack, renderBackpackTab, setActiveItem, setAutoPotionThreshold } from './ui/backpack/index.js';
import { dragStart, dragOver, handleDrop } from './ui/backpack/pokemon.js';

const storage = new Storage();
window.storageRef = storage;
const dayCare = new DayCare(state);
state.dayCareRef = dayCare;
state.storageRef = storage;

// Attach exported methods to window so inline HTML onclicks work
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
window.toggleSmartCaptureShinyMode = toggleSmartCaptureShinyMode;
window.showSmartCaptureBallSelection = showSmartCaptureBallSelection;
window.selectSmartCaptureBall = selectSmartCaptureBall;
window.showPokemonStats = showPokemonStats;
window.showPokemonStatsByUuid = showPokemonStatsByUuid;
window.evolvePokemon = evolvePokemon;
window.showSettings = showSettings;
window.exportLog = exportLog;
window.buyItem = buyItem;
window.updateBuyItemPrice = updateBuyItemPrice;
window.buySetMax = buySetMax;
window.openPokeMarketBuy = openPokeMarketBuy;
window.renderPokeMarketTab = renderPokeMarketTab;
window.showAddPokemonModal = showAddPokemonModal;
window.forceNextEncounter = forceNextEncounter;
window.activateCheat = activateCheat;

import { cheatAction } from "./ui/cheatControl.js";
window.cheatAction = cheatAction;
window.showTimeLapseModal = showTimeLapseModal;
window.runTimeLapse = runTimeLapse;
window.dragStart = dragStart;
window.completeChallenge = function(targetAreaId) {
    if (targetAreaId === '150_challenge') {
        state.stats.completed150Challenge = true;
        if (!state.stats.newRoutes) state.stats.newRoutes = [];
        if (!state.stats.newRoutes.includes("Mythical and Legendaries")) {
            state.stats.newRoutes.push("Mythical and Legendaries");
        }
        state.stats.hasUnseenMap = true;
        updateUI();
        const challengeWin = document.getElementById('window-challenges');
        if (challengeWin && challengeWin.style.display !== 'none') {
            window.showChallengesModal(); // refresh modal
        }
        return;
    }
    if (!state.stats.activeChallenges) {
        state.stats.activeChallenges = ["Route 1"];
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
    if (state.config.unlocks) {
        unlock = state.config.unlocks.find(u => u.areaId === targetAreaId);
    }

    if (unlock) {
        if (unlock.gift) {
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
    if (unlock.requirements) {
        if (unlock.requirements.defeatCountRoute) {
            state.stats.challengeRouteDefeats = 0;
        }
        if (unlock.requirements.defeatSpecific) {
             if (state.stats.challengeSpecificDefeats) delete state.stats.challengeSpecificDefeats[unlock.requirements.defeatSpecific.name];
        }
        if (unlock.requirements.catchSpecies) {
             for (let s of unlock.requirements.catchSpecies) {
                 if (state.stats.caughtSpecies) delete state.stats.caughtSpecies[s.species];
             }
        }
        if (unlock.requirements.catchSpeciesByRarity) {
             for (let s of unlock.requirements.catchSpeciesByRarity) {
                 if (state.stats.challengeCaughtSpecific) delete state.stats.challengeCaughtSpecific[s.species + "_" + s.rarity];
             }
        }
        if (unlock.requirements.catchByRarityAndType) {
             if (state.stats.challengeCaughtSpecific) delete state.stats.challengeCaughtSpecific[unlock.requirements.catchByRarityAndType.type + "_" + unlock.requirements.catchByRarityAndType.rarity];
        }
        if (unlock.requirements.catchByType) {
             if (state.stats.challengeCaughtSpecific) delete state.stats.challengeCaughtSpecific[unlock.requirements.catchByType.type + "_Any"];
        }
        if (unlock.requirements.catchEachFromSlotMachine) {
             if (unlock.requirements.catchEachFromSlotMachine.machines) {
                 for (let m of unlock.requirements.catchEachFromSlotMachine.machines) {
                     for (let s of m) {
                         if (state.stats.caughtSpecies) delete state.stats.caughtSpecies[s];
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
    if (targetAreaId === '150_challenge') {
        if (!state.stats.caughtSpecies) state.stats.caughtSpecies = {};
        let count = 0;
        for (let i = 0; i < state.config.pokemonData.length; i++) {
             if (count >= 150) break;
             let p = state.config.pokemonData[i];
             state.stats.caughtSpecies[p.name] = 1;
             count++;
        }
        if (window.updateUI) window.updateUI();
        const challengeWinCheat = document.getElementById('window-challenges');
        if (challengeWinCheat && challengeWinCheat.style.display !== 'none') {
            window.showChallengesModal(); // refresh modal
        }
        setTimeout(() => {
            const modal = document.getElementById('window-challenges');
            if (modal) {
                const completeBtns = Array.from(modal.querySelectorAll('button')).filter(btn => btn.innerText.includes('Complete'));
                if (completeBtns.length > 0) {
                    const specificBtn = completeBtns.find(btn => btn.getAttribute('onclick') && btn.getAttribute('onclick').includes('150_challenge'));
                    if (specificBtn) specificBtn.click();
                }
            }
        }, 100);
        return;
    }
    if (!targetAreaId && state.stats.activeChallenges && state.stats.activeChallenges.length > 0) targetAreaId = state.stats.activeChallenges[0];
    if (!targetAreaId) return;
    let unlock = state.config.unlocks.find(u => u.areaId === targetAreaId);
    if (!unlock) return;

    let req = unlock.requirements;
    if (req) {
        if (req.defeatCountRoute) {
            state.stats.challengeRouteDefeats = Math.max(state.stats.challengeRouteDefeats || 0, req.defeatCountRoute.count);
        }
        if (req.defeatSpecific) {
            if (!state.stats.challengeSpecificDefeats) state.stats.challengeSpecificDefeats = {};
            state.stats.challengeSpecificDefeats[req.defeatSpecific.name] = Math.max(state.stats.challengeSpecificDefeats[req.defeatSpecific.name] || 0, req.defeatSpecific.count);
        }
        if (req.catchSpecies) {
            if (!state.stats.caughtSpecies) state.stats.caughtSpecies = {};
            req.catchSpecies.forEach(r => state.stats.caughtSpecies[r.species] = (state.stats.caughtSpecies[r.species] || 0) + r.count);
        }
        if (req.catchSpeciesByRarity) {
            if (!state.stats.challengeCaughtSpecific) state.stats.challengeCaughtSpecific = {};
            req.catchSpeciesByRarity.forEach(r => {
                let key = r.species + "_" + r.rarity;
                state.stats.challengeCaughtSpecific[key] = (state.stats.challengeCaughtSpecific[key] || 0) + r.count;
            });
        }
        if (req.catchSpeciesAnyOfByRarity) {
            if (!state.stats.challengeCaughtSpecific) state.stats.challengeCaughtSpecific = {};
            req.catchSpeciesAnyOfByRarity.forEach(r => {
                // Cheat by catching the first one in the list
                let key = r.species[0] + "_" + r.rarity;
                state.stats.challengeCaughtSpecific[key] = (state.stats.challengeCaughtSpecific[key] || 0) + r.count;
            });
        }
        if (req.catchEachFromSlotMachine) {
            if (!state.stats.caughtSpecies) state.stats.caughtSpecies = {};
            if (req.catchEachFromSlotMachine.machines) {
                req.catchEachFromSlotMachine.machines.forEach(m => {
                    state.stats.caughtSpecies[m[0]] = (state.stats.caughtSpecies[m[0]] || 0) + 1;
                });
            } else if (req.catchEachFromSlotMachine.speciesList) {
                req.catchEachFromSlotMachine.speciesList.forEach(s => {
                    state.stats.caughtSpecies[s] = (state.stats.caughtSpecies[s] || 0) + 1;
                });
            }
        }
        if (req.catchByRarityAndType) {
             let key = req.catchByRarityAndType.type + "_" + req.catchByRarityAndType.rarity;
             if (!state.stats.challengeCaughtSpecific) state.stats.challengeCaughtSpecific = {};
             state.stats.challengeCaughtSpecific[key] = (state.stats.challengeCaughtSpecific[key] || 0) + req.catchByRarityAndType.count;
        }
        if (req.catchByType) {
            let typeKey = req.catchByType.type + "_Any";
            if (!state.stats.challengeCaughtSpecific) state.stats.challengeCaughtSpecific = {};
            state.stats.challengeCaughtSpecific[typeKey] = (state.stats.challengeCaughtSpecific[typeKey] || 0) + req.catchByType.count;
        }
        if (req.earnBadge) {
            // Only give badge if they don't have it yet to prevent duplicates if cheated multiple times
            const hasPending = state.stats.pendingGifts && state.stats.pendingGifts.some(g => g.type === 'badge' && g.gymIndex === req.earnBadge.badgeCount - 1);
            if (state.trainer.badges < req.earnBadge.badgeCount && !hasPending) {
                 if (!state.stats.pendingGifts) state.stats.pendingGifts = [];
                 state.stats.pendingGifts.push({ type: 'badge', gymName: req.earnBadge.name.replace(' Badge', ''), gymIndex: req.earnBadge.badgeCount - 1 });
                 // Do not auto-increment badges, the gift claim will do it
            }
        }
        if (req.defeatCountRoute) {
            state.stats.challengeRouteDefeats = req.defeatCountRoute.count;
        }
        if (req.defeatSpecific) {
            if (!state.stats.challengeSpecificDefeats) state.stats.challengeSpecificDefeats = {};
            state.stats.challengeSpecificDefeats[req.defeatSpecific.name] = req.defeatSpecific.count;
        }
        if (req.defeatEliteFourAndChampion) {
            if (!state.stats.defeatedBosses) state.stats.defeatedBosses = {};
            state.stats.defeatedBosses["Elite 4 Lorelei"] = true;
            state.stats.defeatedBosses["Champion Rival"] = true;
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
            const completeBtns = Array.from(modal.querySelectorAll('button')).filter(btn => btn.innerText.includes('Complete'));
            if (completeBtns.length > 0) {
                // Find the specific complete button for this area
                const safeAreaId = targetAreaId.replace(/'/g, "\\'");
                const specificBtn = completeBtns.find(btn => btn.getAttribute('onclick') && btn.getAttribute('onclick').includes(safeAreaId));
                if (specificBtn) specificBtn.click();
                else completeBtns[0].click();
            }
        }
    }, 100);

};

window.showChallengesModal = function() {
    const extraChallengeAreas = ['Casino', 'Small Fishing Spot', 'Fighting Dojo', 'Big Fishing Spot', 'Fossil Revival Lab', 'Trade With Friends Hub', 'Power Plant', 'Seafoam Islands', 'Victory Road', 'Cerulean Cave'];

    if (!state.config.unlocks) return;

    let html = `<div id="challenges-content-wrapper" class="content-panel" style="display:flex; flex-direction:column; gap:15px; text-align:left;">`;

    // Active Challenges Sector
    let activeChallengesCount = state.stats.activeChallenges ? state.stats.activeChallenges.length : 0;
    let completedChallengesCount = state.stats.completedChallengeIds ?
        (state.config.unlocks ? state.stats.completedChallengeIds.filter(id => state.config.unlocks.some(u => u.areaId === id)).length : state.stats.completedChallengeIds.length)
        : 0;
    let totalChallengesCount = activeChallengesCount + completedChallengesCount;

    html += `<div style="border: 1px solid #555; padding: 10px; border-radius: 5px; background-color: rgba(0,0,0,0.5);">
                <h3 style="margin-top: 0; margin-bottom: 10px; border-bottom: 1px solid #444; padding-bottom: 5px; font-size: 16px;">${activeChallengesCount > 1 ? 'Active Challenges' : 'Active Challenge'}</h3>
                <div style="display: flex; flex-direction: column; gap: 15px;">`;

    // The 150 Challenge should only appear if the Final Challenge (Indigo Plateau) has been completed
    let isFinalChallengeCompleted = state.stats.completedChallengeIds && state.stats.completedChallengeIds.includes('Indigo Plateau');
    let hasActive150Challenge = isFinalChallengeCompleted && !state.stats.completed150Challenge;

    if (activeChallengesCount === 0 && !hasActive150Challenge) {
        html += `<div style="text-align: center; font-size: 16px; color: #aaa;">No active Challenge</div>`;
    }

    if (hasActive150Challenge) {
        let uniqueSpeciesCaught = state.stats.caughtSpecies ? Object.keys(state.stats.caughtSpecies).length : 0;
        let isMet = uniqueSpeciesCaught >= 150;
        let displayName = "The 150 Challenge";
        let rewardsStr = "Mythical and Legendary Spot";
        let cData = {
            isMet: isMet,
            textParts: [`Capture 150 different Pokémons (${uniqueSpeciesCaught}/150)${isMet ? ' <span style="color: #4CAF50;">[Complete]</span>' : ''}`]
        };

        html += `<div style="border: 1px solid #333; padding: 10px; border-radius: 5px; background-color: rgba(255,255,255,0.05);">
                    <div style="color: #ff9800; font-weight: bold; margin-bottom: 5px;">${displayName}</div>`;

        html += `<div style="margin-bottom: 5px;"><b>Requirements:</b></div>
                 <ul style="margin-top: 0; padding-left: 20px;">`;

        for (let part of cData.textParts) {
            html += `<li>${part}</li>`;
        }

        html += `</ul>
                 <div style="margin-top: 10px; color: #4CAF50;"><b>Rewards:</b> Unlocks ${rewardsStr}</div>`;

        let safeAreaId = "150_challenge";

        html += `<div style="text-align: center; margin-top: 15px; display: flex; justify-content: center; gap: 10px;">
                     <button onclick="window.cheatProgressChallenge('${safeAreaId}')" style="padding: 10px 20px; font-size: 16px; font-weight: bold; background-color: orange; color: white; border: none; border-radius: 5px; cursor: pointer;">Cheat Progress</button>`;

        if (cData.isMet) {
             html += `<button onclick="window.completeChallenge('${safeAreaId}')" style="padding: 10px 20px; font-size: 16px; font-weight: bold; background-color: #4CAF50; color: white; border: none; border-radius: 5px; cursor: pointer;">Complete ✔️</button>`;
        }
        html += `</div></div>`;
    }

    if (activeChallengesCount > 0) {
        for (let activeId of state.stats.activeChallenges) {
            let unlock = state.config.unlocks.find(u => u.areaId === activeId);
            if (!unlock) continue;

            let cData = getChallengeData(unlock);
            let isExtra = extraChallengeAreas.includes(unlock.areaId);
            let rewardsStr = unlock.unlocks ? unlock.unlocks.join(" + ") : "Next Area";
            if (unlock.areaId === "Fossil Revival Lab") rewardsStr += " + Multiplayer Mode";
            if (unlock.gift) rewardsStr += " + Gift";

            let displayName = unlock.challengeName || (isExtra ? 'Extra Challenge - ' + unlock.areaId : 'Challenge - ' + unlock.areaId);

            html += `<div style="border: 1px solid #333; padding: 10px; border-radius: 5px; background-color: rgba(255,255,255,0.05);">
                        <div style="color: ${isExtra ? '#ff9800' : '#4CAF50'}; font-weight: bold; margin-bottom: 5px;">${displayName}</div>`;

            html += `<div style="margin-bottom: 5px;"><b>Requirements:</b></div>
                     <ul style="margin-top: 0; padding-left: 20px;">`;

            for (let part of cData.textParts) {
                html += `<li>${part}</li>`;
            }

            html += `</ul>
                     <div style="margin-top: 10px; color: #4CAF50;"><b>Rewards:</b> Unlocks ${rewardsStr}</div>`;

            let safeAreaId = unlock.areaId.replace(/'/g, "\\'");

            html += `<div style="text-align: center; margin-top: 15px; display: flex; justify-content: center; gap: 10px;">
                         <button onclick="window.cheatProgressChallenge('${safeAreaId}')" style="padding: 10px 20px; font-size: 16px; font-weight: bold; background-color: orange; color: white; border: none; border-radius: 5px; cursor: pointer;">Cheat Progress</button>`;

            if (cData.isMet) {
                 html += `<button onclick="window.completeChallenge('${safeAreaId}')" style="padding: 10px 20px; font-size: 16px; font-weight: bold; background-color: #4CAF50; color: white; border: none; border-radius: 5px; cursor: pointer;">Complete ✔️</button>`;
            }
            html += `</div></div>`;
        }
    }

    html += `</div></div>`;

    // Past Challenges Sector
    let completedCount = state.stats.completedChallengeIds ?
        (state.config.unlocks ? state.stats.completedChallengeIds.filter(id => state.config.unlocks.some(u => u.areaId === id)).length : state.stats.completedChallengeIds.length)
        : 0;
    let actualCompletedIds = state.stats.completedChallengeIds ?
        (state.config.unlocks ? state.stats.completedChallengeIds.filter(id => state.config.unlocks.some(u => u.areaId === id)) : state.stats.completedChallengeIds)
        : [];

    if (state.stats.completed150Challenge) completedCount++;

    if (completedCount > 0) {
        let pastTitle = completedCount === 1 ? "Past Challenge" : "Past Challenges";
        html += `<div style="border: 1px solid #555; padding: 10px; border-radius: 5px; background-color: rgba(0,0,0,0.5);">
                    <h3 style="margin-top: 0; margin-bottom: 10px; border-bottom: 1px solid #444; padding-bottom: 5px; font-size: 16px;">${pastTitle}</h3>
                    <div style="display: flex; flex-direction: column; gap: 10px;">`;

        // Render 150 Challenge in Past Challenges if completed
        if (state.stats.completed150Challenge) {
            html += `<div style="border: 1px solid #333; padding: 10px; border-radius: 5px; background-color: rgba(255,255,255,0.05);">
                          <div style="color: #ff9800; font-weight: bold; margin-bottom: 5px;">The 150 Challenge</div>
                          <ul style="margin-top: 0; margin-bottom: 5px; padding-left: 20px; font-size: 14px;">
                              <li>Capture 150 different Pokémons (150/150) <span style="color: green;">[Complete]</span></li>
                          </ul>
                          <div style="color: #4CAF50; font-size: 14px;"><b>Rewards:</b> Unlocks Mythical and Legendary Spot</div>
                      </div>`;
        }


        for (let i = actualCompletedIds.length - 1; i >= 0; i--) {
             let completedId = actualCompletedIds[i];
             let pUnlock = state.config.unlocks.find(u => u.areaId === completedId);
             if (!pUnlock) continue;

             let isExtra = extraChallengeAreas.includes(pUnlock.areaId);

             // Fake the data slightly to make it look completed, though getChallengeData will naturally evaluate to true
             let pData = getChallengeData(pUnlock);

             let pRewards = pUnlock.unlocks ? pUnlock.unlocks.join(" + ") : "Next Area";
             if (pUnlock.areaId === "Fossil Revival Lab") pRewards += " + Multiplayer Mode";
             if (pUnlock.gift) pRewards += " + Gift";

             let displayName = pUnlock.challengeName || (isExtra ? 'Extra Challenge - ' + pUnlock.areaId : 'Challenge - ' + pUnlock.areaId);

             html += `<div style="border: 1px solid #333; padding: 10px; border-radius: 5px; background-color: rgba(255,255,255,0.05);">
                          <div style="color: ${isExtra ? '#ff9800' : '#4CAF50'}; font-weight: bold; margin-bottom: 5px;">${displayName}</div>
                          <ul style="margin-top: 0; margin-bottom: 5px; padding-left: 20px; font-size: 14px;">`;
             for (let part of pData.textParts) {
                  // Ensure we show them as complete using words

                  // For past challenges, ensure they look complete and numbers match max requirements
                  // The text might look like "Defeat 25 Pokémon on Route 1 (0/25)"
                  // We extract the required count and force it to say (25/25) [Complete]
                  part = part.replace(/\(\d+\/(\d+)\)/, (match, p1) => `(${p1}/${p1})`);
                  if (!part.includes("[Complete]")) {
                       part += ` <span style="color: green;">[Complete]</span>`;
                  }
                  part = part.replace(/color: red/g, 'color: green');

                  html += `<li>${part}</li>`;
             }
             html += `</ul>
                      <div style="font-size: 14px; color: #4CAF50;"><b>Rewards:</b> Unlocks ${pRewards}</div>
                      </div>`;
        }
        html += `</div></div>`;
    }

    html += `</div>`;

    showModal("Progress Challenges", html, "window-challenges", "1000px");
    const win = document.getElementById("window-challenges");
    if (win) {
        // We handle the max height natively in windowManager now, so remove the strict CSS limit
        win.style.maxHeight = '';

        if (window.windowManager) window.windowManager.setWindowProportions('window-challenges', 1.0);

        // Ensure the content container scrolls if it overflows
        const contentContainer = win.querySelector('.window-content-container');
        if (contentContainer) {
            contentContainer.style.overflowY = 'auto';
        }
    }
};
window.dragOver = dragOver;
window.handleDrop = handleDrop;
window.showDamage = showDamage;
window.playCombatAnimations = playCombatAnimations;
window.triggerDefeatAnimation = triggerDefeatAnimation;
window.showLoot = showLoot;
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

    let html = `<div style="padding: 2%; box-sizing: border-box;">
    <div style="text-align: center; margin-bottom: 15px;">
        <button id="btn-catch-rate-shiny-toggle" onclick="window.showTrainerStats('catch-rate', { showShiny: ${!showShiny} })" style="padding: 10px 20px; font-size: 16px; font-weight: bold; cursor: pointer; background: ${showShiny ? '#fbbf24' : '#6b7280'}; color: white; border: none; border-radius: 5px;">
            ${showShiny ? 'Showing Shiny Attempts (Click to show Normal)' : 'Showing Normal Attempts (Click to show Shiny)'}
        </button>
    </div>
    <div style="max-height: 60vh; overflow-y: auto;">
        <table style="width: 100%; border-collapse: collapse; text-align: center; color: white;">
            <thead>
                <tr style="background: rgba(255,255,255,0.1);">
                    <th style="padding: 8px; border-bottom: 1px solid #475569;">Pokémon</th>`;

    balls.forEach(b => {
        html += `<th style="padding: 8px; border-bottom: 1px solid #475569;">
            <img src="Assets/Items/Balls/${b}.png" style="width: 24px; height: 24px;" alt="${b}" title="${b}"><br>${b}
        </th>`;
    });

    html += `   </tr>
            </thead>
            <tbody>`;

    if (rowData.length === 0) {
        html += `<tr><td colspan="${balls.length + 1}" style="padding: 20px; font-style: italic; color: #94a3b8;">No ${showShiny ? 'shiny ' : ''}catch attempts recorded yet.</td></tr>`;
    } else {
        rowData.forEach(row => {
            html += `<tr style="border-bottom: 1px solid #334155; background: rgba(0,0,0,0.2);">
                <td style="padding: 8px; font-weight: bold; text-align: left;">#${row.id} ${row.name}</td>`;

            balls.forEach(b => {
                const bData = row.data[b];
                if (bData && bData.thrown > 0) {
                    html += `<td style="padding: 8px;">${bData.caught} / ${bData.thrown}</td>`;
                } else {
                    html += `<td style="padding: 8px; color: #64748b;">-</td>`;
                }
            });

            html += `</tr>`;
        });
    }

    html += `   </tbody>
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
    setTimeout(() => {
        const btn = document.getElementById('btn-catch-rate-shiny-toggle');
        if (btn) {
            btn.onclick = () => {
                showCatchRateModal(!showShiny);
            };
        }
    }, 0);
}

export function showModal(title, htmlContent, windowId = 'dynamic-modal', width = '800px', height = 'auto') {
    if (window.windowManager) {
        window.windowManager.createDynamicWindow(windowId, title, htmlContent, width, height);
    }
}

const oakTasks = {
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

window.getOakTaskAvailableCount = function() {
    let count = 0;

    // Quality
    let qTier = state.stats.qTaskTier || 0;
    if (qTier < oakTasks.q.length) {
        if ((state.stats[oakTasks.q[qTier].stat] || 0) >= oakTasks.q[qTier].req) count++;
    }

    // Catch
    let cTier = state.stats.cTaskTier || 0;
    if (cTier < oakTasks.c.length) {
        if ((state.stats.caught || 0) >= oakTasks.c[cTier].req) count++;
    }

    // IV
    let ivTier = state.stats.ivTaskTier || 0;
    if (ivTier < oakTasks.iv.length) {
        if ((state.stats[oakTasks.iv[ivTier].stat] || 0) >= oakTasks.iv[ivTier].req) count++;
    }

    // Level
    let levelTier = state.stats.levelTaskTier || 0;
    if (levelTier < oakTasks.level.length) {
        if ((state.stats[oakTasks.level[levelTier].stat] || 0) >= oakTasks.level[levelTier].req) count++;
    }

    // Shiny Seen
    let seenTier = state.stats.shinySeenTaskTier || 0;
    if (seenTier < oakTasks.shinySeen.length) {
        if ((state.stats.shiniesSeen || 0) >= oakTasks.shinySeen[seenTier].req) count++;
    }

    // Shiny Caught
    let caughtTier = state.stats.shinyCaughtTaskTier || 0;
    if (caughtTier < oakTasks.shinyCaught.length) {
        if ((state.stats.shiniesCaught || 0) >= oakTasks.shinyCaught[caughtTier].req) count++;
    }

    // Final
    let finalTier = state.stats.finalTaskTier || 0;
    if (finalTier < oakTasks.final.length) {
        let currentSpeciesCount = state.stats.caughtSpecies ? Object.keys(state.stats.caughtSpecies).length : 0;
        let totalSpecies = state.config.pokemonData.length;
        if (currentSpeciesCount >= totalSpecies) count++;
    }

    return count;
};

window.claimOakTaskReward = function(type) {
    if (type === 'q') state.stats.qTaskTier = (state.stats.qTaskTier || 0) + 1;
    if (type === 'c') state.stats.cTaskTier = (state.stats.cTaskTier || 0) + 1;
    if (type === 'level') state.stats.levelTaskTier = (state.stats.levelTaskTier || 0) + 1;
    if (type === 'shinySeen') state.stats.shinySeenTaskTier = (state.stats.shinySeenTaskTier || 0) + 1;
    if (type === 'shinyCaught') state.stats.shinyCaughtTaskTier = (state.stats.shinyCaughtTaskTier || 0) + 1;
    if (type === 'iv') state.stats.ivTaskTier = (state.stats.ivTaskTier || 0) + 1;
    if (type === 'final') state.stats.finalTaskTier = (state.stats.finalTaskTier || 0) + 1;
    window.showOakLabModal();
};

window.cheatCompleteOakTask = function(type) {
    let tier = 0;
    let req = 0;
    let statName = "";
    if (type === 'q') {
        tier = state.stats.qTaskTier || 0;
        if (tier < oakTasks.q.length) {
            statName = oakTasks.q[tier].stat;
            state.stats[statName] = Math.max(state.stats[statName] || 0, oakTasks.q[tier].req);
        }
    }
    if (type === 'c') {
        tier = state.stats.cTaskTier || 0;
        if (tier < oakTasks.c.length) state.stats.caught = Math.max(state.stats.caught || 0, oakTasks.c[tier].req);
    }
    if (type === 'shinySeen') {
        tier = state.stats.shinySeenTaskTier || 0;
        if (tier < oakTasks.shinySeen.length) state.stats.shiniesSeen = Math.max(state.stats.shiniesSeen || 0, oakTasks.shinySeen[tier].req);
    }
    if (type === 'shinyCaught') {
        tier = state.stats.shinyCaughtTaskTier || 0;
        if (tier < oakTasks.shinyCaught.length) state.stats.shiniesCaught = Math.max(state.stats.shiniesCaught || 0, oakTasks.shinyCaught[tier].req);
    }
    if (type === 'level') {
        tier = state.stats.levelTaskTier || 0;
        if (tier < oakTasks.level.length) {
            statName = oakTasks.level[tier].stat;
            state.stats[statName] = Math.max(state.stats[statName] || 0, oakTasks.level[tier].req);
        }
    }
    if (type === 'iv') {
        tier = state.stats.ivTaskTier || 0;
        if (tier < oakTasks.iv.length) {
            statName = oakTasks.iv[tier].stat;
            state.stats[statName] = Math.max(state.stats[statName] || 0, oakTasks.iv[tier].req);
        }
    }
    if (type === 'final') {
        if (!state.stats.caughtSpecies) state.stats.caughtSpecies = {};
        for (let p of state.config.pokemonData) {
            state.stats.caughtSpecies[p.name] = (state.stats.caughtSpecies[p.name] || 0) + 1;
        }
    }
    window.showOakLabModal();
};

window.showOakLabModal = function() {
    if (state.stats.showOakLobbyNotification) {
        state.stats.showOakLobbyNotification = false;
        renderOakLab(); // Clear the notification from the lobby button
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
                <div onclick="window.claimOakTaskReward('${type}')" style="width: 100%; box-sizing: border-box; background-color: #4CAF50; border-radius: 4px; padding: 5px; text-align: center; cursor: pointer; color: white; font-weight: bold; margin-top: 5px;">
                    ${task.reward}
                </div>
            `;
        } else {
            let pct = Math.min(100, Math.floor((currentVal / task.req) * 100));
            barHtml = `
                <div style="width: 100%; background-color: #333; border-radius: 4px; overflow: hidden; height: 20px; border: 1px solid #555; position: relative; margin-top: 5px; display: flex; align-items: center;">
                    <div style="width: ${pct}%; background-color: #4CAF50; height: 100%;"></div>
                    <span style="position: absolute; width: 100%; text-align: center; color: white; font-size: 9px; font-weight: bold; line-height: 20px;">
                        ${currentVal} / ${task.req}
                    </span>
                </div>
            `;
        }

        return `
            <div style="margin-bottom: 10px; font-size: 12px;">
                <div style="display: flex; justify-content: space-between; align-items: center;">
                    <span>${task.text}</span>
                    <button onclick="window.cheatCompleteOakTask('${type}')" style="padding: 2px 5px; font-size: 8px; cursor: pointer; background: #d9534f; color: white; border: none; border-radius: 3px;">Cheat Complete</button>
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
                // Shiny style - keep all
                for (let i = 0; i < tierIdx; i++) {
                    rewardsHtml += `
                        <div style="font-size: 9px; margin-top: 5px; padding-left: 5px; border-left: 2px solid #4CAF50;">
                            <b>${taskList[i].reward}</b>: <span style="color: #4CAF50;">${taskList[i].effect}</span>
                        </div>
                    `;
                }
            } else {
                // Normal style - only show highest tier
                let topReward = taskList[tierIdx - 1];
                rewardsHtml += `
                    <div style="font-size: 9px; margin-top: 5px; padding-left: 5px; border-left: 2px solid #4CAF50;">
                        <b>${topReward.reward}</b>: <span style="color: #4CAF50;">${topReward.effect}</span>
                    </div>
                `;
            }
        }

        return `
            <div style="border: 1px solid #555; padding: 8px; border-radius: 5px; background-color: rgba(0,0,0,0.5);">
                <h3 style="margin-top: 0; margin-bottom: 10px; border-bottom: 1px solid #444; padding-bottom: 5px; font-size: 12px;">${title}</h3>
                ${taskHtml}
                ${rewardsHtml}
            </div>
        `;
    };

    // Quality Card
    let qTier = state.stats.qTaskTier || 0;
    let qCurrentVal = 0;
    if (qTier < oakTasks.q.length) {
        qCurrentVal = state.stats[oakTasks.q[qTier].stat] || 0;
    } else if (oakTasks.q.length > 0) {
        qCurrentVal = state.stats[oakTasks.q[oakTasks.q.length - 1].stat] || 0;
    }
    html += renderCard("Quality Assignment", 'q', qCurrentVal, qTier, oakTasks.q, false);

    // Catch Card
    html += renderCard("Catch Assignment", 'c', state.stats.caught || 0, state.stats.cTaskTier || 0, oakTasks.c, false);

    // IV Card
    let ivTier = state.stats.ivTaskTier || 0;
    let ivCurrentVal = 0;
    if (ivTier < oakTasks.iv.length) {
        ivCurrentVal = state.stats[oakTasks.iv[ivTier].stat] || 0;
    } else if (oakTasks.iv.length > 0) {
        ivCurrentVal = state.stats[oakTasks.iv[oakTasks.iv.length - 1].stat] || 0; // fallback if completed
    }
    html += renderCard("IV Assignment", 'iv', ivCurrentVal, ivTier, oakTasks.iv, false);

    // Level Card
    let levelTier = state.stats.levelTaskTier || 0;
    let levelCurrentVal = 0;
    if (levelTier < oakTasks.level.length) {
        levelCurrentVal = state.stats[oakTasks.level[levelTier].stat] || 0;
    } else if (oakTasks.level.length > 0) {
        levelCurrentVal = state.stats[oakTasks.level[oakTasks.level.length - 1].stat] || 0; // fallback if completed
    }
    html += renderCard("Level Assignment", 'level', levelCurrentVal, levelTier, oakTasks.level, true);

    // Shiny Card (Combined seen and caught, keeps all rewards but obsolete regular seen shiny is removed by good shiny)
    let seenTier = state.stats.shinySeenTaskTier || 0;
    let caughtTier = state.stats.shinyCaughtTaskTier || 0;

    let shinySeenTaskHtml = renderActiveTask('shinySeen', state.stats.shiniesSeen || 0, seenTier, oakTasks.shinySeen);
    let shinyCaughtTaskHtml = renderActiveTask('shinyCaught', state.stats.shiniesCaught || 0, caughtTier, oakTasks.shinyCaught);

    let shinyTitle = "Shiny Assignment";

    // Only show "Assignment: Completed" once if both are done
    if (seenTier >= oakTasks.shinySeen.length && caughtTier >= oakTasks.shinyCaught.length) {
        shinyTitle = "Shiny Reward";
        shinySeenTaskHtml = "";
        shinyCaughtTaskHtml = "";
    } else {
        // If one is complete but not the other, we don't want duplicate "Assignment: Completed" texts
        // if they rendered their own individual completions. Since we only want a single "Completed" when BOTH are done,
        // we strip out the individual "Assignment: Completed" if it exists.
        if (seenTier >= oakTasks.shinySeen.length) shinySeenTaskHtml = "";
        if (caughtTier >= oakTasks.shinyCaught.length) shinyCaughtTaskHtml = "";
    }

    let shinyRewardsHtml = "";

    // Shiny Seen rewards logic (Good Shiny replaces Regular Shiny)
    for (let i = 0; i < seenTier; i++) {
        let rewardName = oakTasks.shinySeen[i].reward;
        // If Good Shiny (tier index 1) is unlocked, we skip Regular Shiny (tier index 0)
        if (seenTier > 1 && i === 0) continue;

        shinyRewardsHtml += `
            <div style="font-size: 9px; margin-top: 5px; padding-left: 5px; border-left: 2px solid #4CAF50;">
                <b>${rewardName}</b>: <span style="color: #4CAF50;">${oakTasks.shinySeen[i].effect}</span>
            </div>
        `;
    }

    // Shiny Caught rewards logic
    for (let i = 0; i < caughtTier; i++) {
        shinyRewardsHtml += `
            <div style="font-size: 9px; margin-top: 5px; padding-left: 5px; border-left: 2px solid #4CAF50;">
                <b>${oakTasks.shinyCaught[i].reward}</b>: <span style="color: #4CAF50;">${oakTasks.shinyCaught[i].effect}</span>
            </div>
        `;
    }

    html += `
        <div style="border: 1px solid #555; padding: 8px; border-radius: 5px; background-color: rgba(0,0,0,0.5);">
            <h3 style="margin-top: 0; margin-bottom: 10px; border-bottom: 1px solid #444; padding-bottom: 5px; font-size: 12px;">${shinyTitle}</h3>
            ${shinySeenTaskHtml}
            ${shinyCaughtTaskHtml}
            ${shinyRewardsHtml}
        </div>
    `;

    // Final Card
    let finalTier = state.stats.finalTaskTier || 0;
    let finalCurrentVal = state.stats.caughtSpecies ? Object.keys(state.stats.caughtSpecies).length : 0;
    if (finalTier >= oakTasks.final.length && oakTasks.final.length > 0) {
        finalCurrentVal = state.config.pokemonData.length;
    }
    // Update req dynamically if it differs (for example, if new Pokemon are added)
    if (oakTasks.final.length > 0) {
        oakTasks.final[0].req = state.config.pokemonData.length;
        oakTasks.final[0].text = `Capture ${state.config.pokemonData.length} Pokemon species`;
    }
    html += renderCard("Final Assignment", 'final', finalCurrentVal, finalTier, oakTasks.final, true);

    html += `</div>`;

    const overlay = document.getElementById('main-view-inner-modal-overlay');
    const title = document.getElementById('main-view-inner-modal-title');
    const content = document.getElementById('main-view-inner-modal-content');
    if (overlay && title && content) {
        title.innerText = "Assignments and Boosters";
        content.innerHTML = html;

        // Dynamically style the inner modal for Oak Lab to 70% width and proportional scale
        const innerModal = document.getElementById('main-view-inner-modal');
        if (innerModal) {
            // Apply a specific class for Oak Lab modal instead of hacking inline styles permanently
            innerModal.classList.add('oak-lab-inner-modal');
            innerModal.style.width = '70%';
            innerModal.style.aspectRatio = '4/3';
        }

        // Ensure cleanup when the modal is closed
        const cleanUp = () => {
            if (innerModal) {
                innerModal.classList.remove('oak-lab-inner-modal');
                innerModal.style.width = '90%';
                innerModal.style.aspectRatio = '';
            }
            overlay.style.display = 'none';
        };

        const closeBtn = overlay.querySelector('.window-header span');
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

export function renderJohtoOakLab() {
    const johtoOakLabContent = document.getElementById("johto-oak-lab-content");
    if (!johtoOakLabContent) return;

    if (!state.stats.hasPickedStarter) {
        // Show starter selection
        johtoOakLabContent.innerHTML = `
            <div style="background-color: rgba(0,0,0,0.8); display: inline-block; padding: 30px; margin-top: 50px; border-radius: 8px;">
                <h2>Choose your Starter Pokémon</h2>
                <div class="starter-choices">
                  <button onclick="window.selectJohtoStarter(1)">
                    <img src="Assets/Pokemon Sprites/Natural/1.png" style="width: 80px; height: 80px;"><br>Bulbasaur
                  </button>
                  <button onclick="window.selectJohtoStarter(4)">
                    <img src="Assets/Pokemon Sprites/Natural/4.png" style="width: 80px; height: 80px;"><br>Charmander
                  </button>
                  <button onclick="window.selectJohtoStarter(7)">
                    <img src="Assets/Pokemon Sprites/Natural/7.png" style="width: 80px; height: 80px;"><br>Squirtle
                  </button>
                </div>
            </div>
        `;
    } else {
        // Show assignments
        let exclamationHtml = state.stats.showOakLobbyNotification
            ? `<img src="Assets/Extra/ExclamationMark.png" style="position: absolute; top: -5px; right: -5px; width: 20px; height: auto; pointer-events: none; z-index: 10;">`
            : ``;

        johtoOakLabContent.innerHTML = `
            <div style="background-color: rgba(0,0,0,0.85); display: inline-block; padding: 20px; margin-top: 20px; border-radius: 8px; width: 400px; color: white; text-align: center;">
                <h2 style="margin-top:0;">Professor Elm Lab</h2>
                <p style="font-size: 12px; color: #ccc; margin-bottom: 15px;">Complete assignments to unlock global bonuses.</p>

                <div style="display: flex; flex-direction: column; gap: 10px;">
                    <div style="position: relative; display: inline-block; width: 100%;">
                        <button onclick="window.showOakLabModal()" style="width: 100%; box-sizing: border-box; padding: 10px; font-size: 12px; cursor: pointer;">Assignments and Boosters</button>
                        ${exclamationHtml}
                    </div>
                </div>
            </div>
        `;
    }
}

export function renderOakLab() {
    const oakLabDiv = document.getElementById("view-prof-oak-lab");
    if (!oakLabDiv) return;

    // Check if player has pokemon
    if (state.party.length === 0 && state.storage.length === 0) {
        return; // still selecting starter, handled in index.html
    }

    if (state.stats.showOakMarkerPulse) {
        state.stats.showOakMarkerPulse = false;
        // updateUI(); could be called here to refresh map icon but it's done dynamically in topbar
    }

    let exclamationHtml = state.stats.showOakLobbyNotification
        ? `<img src="Assets/Extra/ExclamationMark.png" style="position: absolute; top: -5px; right: -5px; width: 20px; height: auto; pointer-events: none; z-index: 10;">`
        : ``;

    oakLabDiv.innerHTML = `
        <div style="background-color: rgba(0,0,0,0.85); display: inline-block; padding: 20px; margin-top: 20px; border-radius: 8px; width: 400px; color: white; text-align: center;">
            <h2 style="margin-top:0;">Professor Oak Lab</h2>
            <p style="font-size: 12px; color: #ccc; margin-bottom: 15px;">Complete assignments to unlock global bonuses.</p>

            <div style="display: flex; flex-direction: column; gap: 10px;">
                <div style="position: relative; display: inline-block; width: 100%;">
                    <button onclick="window.showOakLabModal()" style="width: 100%; box-sizing: border-box; padding: 10px; font-size: 12px; cursor: pointer;">Assignments and Boosters</button>
                    ${exclamationHtml}
                </div>
            </div>
        </div>
    `;
}

// Main View has 2 modes:
// 1. Hub Mode: The taller one (where you visit places such as casino, market, professor oak, safari, gyms).
const MAIN_VIEW_HUB_MODE_RATIO = 1.8;
// 2. Battle Mode: The shorter one (where battle occurs).
const MAIN_VIEW_BATTLE_MODE_RATIO = 5.75;

export function switchView(viewName) {
    state.currentView = viewName;
    document.querySelectorAll('.game-view').forEach(el => el.style.display = 'none');

    const overlay = document.getElementById('main-view-inner-modal-overlay');
    if (overlay) {
        overlay.style.display = 'none';
        const moneyDisplay = document.getElementById('inner-modal-money-display');
        if (moneyDisplay) moneyDisplay.style.display = 'none';
    }

    if (viewName === 'BATTLE_ARENA') {
        if (window.windowManager) window.windowManager.setWindowProportions('main-view-window', MAIN_VIEW_BATTLE_MODE_RATIO);
    } else {
        if (window.windowManager) window.windowManager.setWindowProportions('main-view-window', MAIN_VIEW_HUB_MODE_RATIO);
    }

    if (viewName === 'PROF_OAK_LAB') {
        document.getElementById('view-prof-oak-lab').style.display = 'block';
        showOakTutorialIfNeeded();
        renderOakLab();
    } else if (viewName === 'JOHTO_OAK_LAB') {
        document.getElementById('view-johto-oak-lab').style.display = 'block';
        renderJohtoOakLab();
    } else if (viewName === 'SAFARI_HUB') {
        document.getElementById('view-safari-hub').style.display = 'flex';
    } else if (viewName === 'BATTLE_ARENA') {
        document.getElementById('view-battle-arena').style.display = 'flex';
        document.getElementById('view-battle-arena').style.flexDirection = 'column';
    } else if (viewName === 'POKEMON_CENTER_MARKET') {
        document.getElementById('view-center-market').style.display = 'block';
        setupMarket(document.getElementById('view-center-market'));
    } else if (viewName === 'GYM') {
        document.getElementById('view-gym').style.display = 'block';
    } else if (viewName === 'CASINO_HUB') {
        document.getElementById('view-casino').style.display = 'block';
    } else if (viewName === 'DAYCARE_HUB') {
        document.getElementById('view-daycare').style.display = 'block';

        // Populate dynamic texts based on required battles
        const breedBattles = state.dayCareRef ? state.dayCareRef.slot1.requiredBattles : 100;
        const trainBattles = state.dayCareRef ? state.dayCareRef.slot2.requiredBattles : 100;

        const introText = document.getElementById('daycare-intro-text');
        if (introText) {
            introText.innerHTML = `
                <p>Now you are able to use Daycare!</p>
                <p>You can adjust pokemon on daycare here or directly in your backpack.</p>
                <p>In order to Breed, you need 2 Pokémons with the same Quality Value. They will generate an egg that will hatch after ${breedBattles} fights. You can drag 2 Pokémons to the Breed Spot or you can click on Breed Spot to automatically filter Pokémons that can be inserted there. The egg will hatch and the Pokémon will have an increased Quality Value of a random number between 0 and 0.1 to a maximum of 1.99, keeping the highest SumIV of both parents. Remember that the process can’t be interrupted.</p>
                <p>To Train, you just need to insert the desired Pokémon in the Train Spot. It will train its SumIV and it will gain +1 point in it every ${trainBattles} fights.</p>
            `;
        }

        const trainBtn = document.getElementById('btn-daycare-train');
        if (trainBtn) trainBtn.title = `Insert any Pokémon and gain +1 SumIV after ${trainBattles} fights.`;

        const breedBtn = document.getElementById('btn-daycare-breed');
        if (breedBtn) breedBtn.title = `Insert 2 Pokémons with same Quality Value to increase it to a random number between 0 and 0.1 to a maximum of 1.99 after ${breedBattles} fights.`;
    }
}

export function updateUI() {
    window.currentMapRegion = state.currentRegionName || 'Kanto';
    updateMainControl();
    updateSidebar();
    updateBattleArena();
}

async function loadConfigs() {
    const [pokemonData, routes, gyms, balance, moves, types, mapCoordinates, johtoMapCoordinates] = await Promise.all([
      import('../config/pokemonData.js').then(m => m.default),
      import('../config/routes.js').then(m => m.routes),
      import('../config/gyms.js').then(m => m.default),
      import('../config/balance.js').then(m => m.default),
      import('../config/moves.js').then(m => m.default),
      import('../config/types.js').then(m => m.default),
      import('../config/mapCoordinates.js').then(m => m.default),
      import('../config/johtoMapCoordinates.js').then(m => m.default),
    ]);

    state.config.pokemonData = pokemonData;
    state.config.routes = routes;
    const unlocksModule = await import('../config/routes.js');
    state.config.unlocks = unlocksModule.unlocks;
    state.config.gyms = gyms;
    state.config.balance = balance;
    state.config.moves = moves;
    state.config.types = types;
    state.config.mapCoordinates = mapCoordinates;
    state.config.johtoMapCoordinates = johtoMapCoordinates;
}

window.selectJohtoStarter = selectJohtoStarter;
function selectJohtoStarter(id) {
    if (state.stats.hasPickedStarter) return;

    const pData = state.config.pokemonData.find(p => p.id === id);
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

    const starter = {
        id: pData.id,
        name: pData.name,
        types: pData.types,
        level: level,
        xp: 0,
        qualityName: qName,
        quality: q,
        ivs: ivs,
        currentStats: stats,
        maxHp: stats.hp,
        currentHp: stats.hp,
        bst: bst,
        evxp: mathEngine.calculateEVXP(bst, level, q, ivs.hp + ivs.atk + ivs.def + ivs.spa + ivs.spd + ivs.spe),
        evm: mathEngine.calculateEVM(bst, level, q, ivs.hp + ivs.atk + ivs.def + ivs.spa + ivs.spd + ivs.spe),
        pp: mathEngine.calculatePP(bst, level, q, ivs.hp + ivs.atk + ivs.def + ivs.spa + ivs.spd + ivs.spe),
        moves: [{name: "Tackle", power: 40, type: "Normal", category: "Physical"}] // Basic start
    };

    if (state.party.length < 6) {
        state.party.push(starter);
    } else {
        state.storage.push(starter);
    }

    state.stats.hasPickedStarter = true;
    storage.save(state);

    // Refresh UI
    updateSidebar();
    renderJohtoOakLab();
}

window.selectStarter = selectStarter;
function selectStarter(id) {
    if (!storage.currentProfileId) {
        storage.createNewProfile();
    }
    const pData = state.config.pokemonData.find(p => p.id === id);
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

    const starter = {
        id: pData.id,
        name: pData.name,
        types: pData.types,
        level: level,
        xp: 0,
        qualityName: qName,
        quality: q,
        ivs: ivs,
        currentStats: stats,
        maxHp: stats.hp,
        currentHp: stats.hp,
        bst: bst,
        evxp: mathEngine.calculateEVXP(bst, level, q, ivs.hp + ivs.atk + ivs.def + ivs.spa + ivs.spd + ivs.spe),
        evm: mathEngine.calculateEVM(bst, level, q, ivs.hp + ivs.atk + ivs.def + ivs.spa + ivs.spd + ivs.spe),
        pp: mathEngine.calculatePP(bst, level, q, ivs.hp + ivs.atk + ivs.def + ivs.spa + ivs.spd + ivs.spe),
        moves: [{name: "Tackle", power: 40, type: "Normal", category: "Physical"}] // Basic start
    };

    state.party.push(starter);
    state.currentRoute = "Professor Oak Lab";
    switchView("PROF_OAK_LAB");

    // Refresh window after adding chosen pokemon
    const partyWindow = document.getElementById('party-window');
    if (partyWindow && window.windowManager) {
        if (partyWindow.style.display === 'none' || !partyWindow.style.display) {
            window.windowManager.toggleWindow('party-window', true);
        }
        if (typeof partyWindow.adjustHeightForNewContent === 'function') partyWindow.adjustHeightForNewContent();
    }
    updateSidebar();

    // Add identical pokemon to Team
    const starterCopy = {
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
    state.party.push(starterCopy);

    // Refresh window after adding duplicate
    if (partyWindow && window.windowManager) {
        if (typeof partyWindow.adjustHeightForNewContent === 'function') partyWindow.adjustHeightForNewContent();
    }
    updateSidebar();

    // Remove similar pokemon from Team
    state.party.pop();

    // Refresh window after removing duplicate
    if (partyWindow && window.windowManager) {
        if (typeof partyWindow.adjustHeightForNewContent === 'function') partyWindow.adjustHeightForNewContent();
    }
    updateSidebar();

    // Continue normal game flow
    const navButtons = document.getElementById('main-control');
    if (navButtons) {
        navButtons.style.pointerEvents = 'auto';
        navButtons.style.opacity = '1.0';
    }

    startGame();
    storage.save(state);
    renderOakLab();
}

let gameClockTimeout = null;
let lastTickTime = null;

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

function gameClockTick() {
    const speed = (state.settings && state.settings.gameSpeed) || 1;

    if (!state.globalStats.playtime) state.globalStats.playtime = 0;
    state.globalStats.playtime++;

    if (state.currentView === "BATTLE_ARENA") {
        state.stats.battleModeTimer = (state.stats.battleModeTimer || 0) + 1;
        updateMainControl();
    } else {
        state.stats.battleModeTimer = 0;
        updateMainControl();
    }

    // Award Jigglypuff Dust grains (1 grain per minute)
    if (state.globalStats.playtime % 60 === 0 && state.globalStats.playtime > 0) {
        state.stats.jigglypuffGrains = (state.stats.jigglypuffGrains || 0) + 1;
        updateUI(); // Reflect new grains
    }

    // Daily Challenge Check
    if (state.globalStats.playtime % 10 === 0) {
        checkAndResetDailyChallenges();
    }

    if (state.globalStats.playtime === 60) {
        updateMainControl();
    }

    // Schedule next tick
    const delay = Math.max(4, Math.floor(1000 / speed));
    gameClockTimeout = setTimeout(gameClockTick, delay);
}


function startGame() {
    let bs = new BattleSystem(state, updateUI);
    setBattleSystem(bs);
    updateUI();
    bs.start();

    state.settings.gameSpeed = 1; // Reset to 1 on load

    // Start playtime tracker
    window.restartGameClock();

    // Autosave loop
    setInterval(() => {
        storage.save(state);
    }, 60000);

    // Save on beforeunload
    window.addEventListener('beforeunload', () => {
        storage.save(state);
    });

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
    window.windowManager.registerWindow('main-control-window', 'main-control-header', '10%', '5%');
    window.windowManager.registerWindow('party-window', 'party-header', '5%', '15%');
    window.windowManager.registerWindow('main-view-window', 'main-view-header', '30%', '15%');

    window.windowManager.registerWindow('modal-content-box', 'modal-header', '25%', '25%');
    window.windowManager.registerWindow('save-manager-modal', 'save-manager-header', '25%', '15%');
    await loadConfigs();

    const profiles = storage.getProfiles();
    const splashScreen = document.getElementById('splash-screen');
    const saveManagerModal = document.getElementById('save-manager-modal');
    const profilesContainer = document.getElementById('profiles-container');

    const startNewGame = () => {
        state.globalStats.hasSeenOakTutorial = false;
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

        switchView("PROF_OAK_LAB");
        // Don't call startGame yet, the user must choose a pokemon first.
    };
    window.startNewGame = startNewGame;

    // Filter corrupted/empty profiles and map them to their data
    let validProfiles = profiles
        .map(id => ({ id, data: storage.getProfileData(id) }))
        .filter(p => p.data !== null);

    // Sort descending by lastPlayed so newest is always on top
    validProfiles.sort((a, b) => {
        const timeA = a.data.lastPlayed || 0;
        const timeB = b.data.lastPlayed || 0;
        return timeB - timeA;
    });

    if (validProfiles.length > 0 && saveManagerModal && splashScreen) {
        splashScreen.style.display = 'flex';
        if (saveManagerModal) saveManagerModal.style.display = 'flex';

        profilesContainer.innerHTML = ''; // clear

        let profileAction = 'load';

        // Variables to hold pending rename state
        let pendingRenameId = null;
        let pendingRenameData = null;

        const renameModal = document.getElementById('rename-modal');
        const renameInput = document.getElementById('rename-input');
        const btnRenameSave = document.getElementById('btn-rename-save');
        const btnRenameCancel = document.getElementById('btn-rename-cancel');

        if (btnRenameSave) {
            btnRenameSave.onclick = () => {
                if (pendingRenameId && pendingRenameData && renameInput.value.trim() !== "") {
                    pendingRenameData.profileName = renameInput.value.trim();
                    window.localStorage.setItem(pendingRenameId, JSON.stringify(pendingRenameData));
                    window.location.reload();
                }
            };
        }

        if (btnRenameCancel) {
            btnRenameCancel.onclick = () => {
                if (renameModal) renameModal.style.display = 'none';
                pendingRenameId = null;
                pendingRenameData = null;
                profileAction = 'load';
                updateHeader();
            };
        }

        const updateHeader = () => {
            const h2 = document.getElementById('save-action-title');
            if (h2) {
                if (profileAction === 'rename') {
                    h2.innerHTML = "Select a game to <span style='color: #3498db;'>rename.</span>";
                    h2.style.display = 'block';
                } else if (profileAction === 'delete') {
                    h2.innerHTML = "Select a game to <span style='color: #f44336;'>delete.</span>";
                    h2.style.display = 'block';
                } else {
                    h2.innerHTML = "";
                    h2.style.display = 'none';
                }
            }
        };

        validProfiles.forEach((profileObj, index) => {
            const profileId = profileObj.id;
            const pData = profileObj.data;

            // Format playtime
            let playtimeStr = "0h 0m 0s";
            if (pData.stats && pData.stats.playtime) {
                const totalSec = pData.stats.playtime;
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

            // Get last route unlocked
            let lastRoute = "None";
            if (pData.stats && pData.stats.completedChallenges !== undefined && state.config.unlocks) {
                const unlocksLength = state.config.unlocks.length;
                let cIndex = pData.stats.completedChallenges;
                // Cap to max
                if (cIndex > unlocksLength) cIndex = unlocksLength;

                // Get the reward from the LAST completed challenge
                if (cIndex > 0) {
                    let pUnlock = state.config.unlocks[cIndex - 1];
                    lastRoute = pUnlock.unlocks ? pUnlock.unlocks.join(" + ") : "Next Area";
                    if (pUnlock.areaId === "Fossil Revival Lab") lastRoute += " + Multiplayer Mode";
                }
            }

            let zzzText = pData.isZzZMode ? ` - ZzZ: ${pData.currentRoute || 'Unknown Route'}` : '';

            const btn = document.createElement('button');
            btn.style.padding = "10px";
            btn.style.fontSize = "16px";
            btn.style.cursor = "pointer";
            btn.style.backgroundColor = "#FFC107"; // Big Yellow Button
            btn.style.color = "black";
            btn.style.border = "none";
            btn.style.borderRadius = "5px";
            btn.style.textAlign = "left";
            btn.style.fontWeight = "bold";
            btn.style.width = "75%";
            btn.style.margin = "0 auto";
            btn.style.display = "flex";
            btn.style.justifyContent = "space-between";
            btn.style.alignItems = "center";

            let zzzIconHtml = pData.isZzZMode ? `<img src="Assets/Extra/IconSleep.png" style="height: 100%; max-height: 60px; margin-left: 10px;" title="ZzZ Mode Active">` : '';

            btn.innerHTML = `
                <div style="flex-grow: 1; display: flex; flex-direction: column; justify-content: center;">
                    <div style="font-size: 18px; margin-bottom: 5px; font-weight: bold; display: flex; align-items: center;">
                        "${profileName}" - ${playtimeStr}
                    </div>
                    <div style="font-size: 14px; font-weight: normal;">Last Played: ${lastPlayedStr}</div>
                    <div style="font-size: 14px; font-weight: normal;">Progress: ${lastRoute}${zzzText}</div>
                </div>
                ${zzzIconHtml}
            `;

            btn.onclick = async () => {
                if (profileAction === 'rename') {
                    if (renameModal && renameInput) {
                        pendingRenameId = profileId;
                        pendingRenameData = pData;
                        renameInput.value = profileName;
                        renameModal.style.display = 'flex';
                    }
                } else if (profileAction === 'delete') {
                    if (confirm(`Are you sure you want to delete "${profileName}"? This cannot be undone.`)) {
                        storage.deleteProfile(profileId);
                        window.location.reload();
                    }
                    profileAction = 'load';
                    updateHeader();
                } else {
                    // Load Action
                    splashScreen.style.display = 'none';
                    window.windowManager.toggleWindow('save-manager-modal', false);
                    window.windowManager.toggleWindow('main-control-window', true);
                    window.windowManager.toggleWindow('party-window', true);
                    window.windowManager.toggleWindow('main-view-window', true);

                    storage.setCurrentProfile(profileId);

                    // Perform a deep merge to preserve nested object structures (like stats, backpack)
                    const deepMerge = (target, source) => {
                        if (typeof source !== 'object' || source === null) return source;
                        if (Array.isArray(source)) return source;
                        for (const key of Object.keys(source)) {
                            if (source[key] instanceof Object && !Array.isArray(source[key])) {
                                if (!target[key]) target[key] = {};
                                deepMerge(target[key], source[key]);
                            } else {
                                target[key] = source[key];
                            }
                        }
                        return target;
                    };
                    deepMerge(state, pData);

                    // Migrate old save data to new globalStats structure
                    if (pData.stats) {
                        if (pData.stats.playtime !== undefined) state.globalStats.playtime = pData.stats.playtime;
                        if (pData.stats.hasSeenOakTutorial !== undefined) state.globalStats.hasSeenOakTutorial = pData.stats.hasSeenOakTutorial;
                        if (pData.stats.hasSeenZzZTutorial !== undefined) state.globalStats.hasSeenZzZTutorial = pData.stats.hasSeenZzZTutorial;
                        if (pData.stats.hasSeenMultiplayerIcon !== undefined) state.globalStats.hasSeenMultiplayerIcon = pData.stats.hasSeenMultiplayerIcon;
                        if (pData.stats.hasSeenGiftIcon !== undefined) state.globalStats.hasSeenGiftIcon = pData.stats.hasSeenGiftIcon;
                        if (pData.stats.hasSeenJohtoMap !== undefined) state.globalStats.hasSeenJohtoMap = pData.stats.hasSeenJohtoMap;
                        if (pData.stats.hasSeenDaycare !== undefined) state.globalStats.hasSeenDaycare = pData.stats.hasSeenDaycare;
                        if (pData.stats.hasSeenBonusCandyModal !== undefined) state.globalStats.hasSeenBonusCandyModal = pData.stats.hasSeenBonusCandyModal;
                    }


                    if (!state.currentRegionName) {
                        state.currentRegionName = 'Kanto';
                    }
                    if (!state.regions) {
                        state.regions = {};
                    }

                    // Fallback for older saves
                    if (state.settings.autoPotionThreshold === undefined) {
                        state.settings.autoPotionThreshold = 25;
                    }

                    // Handle backwards compatibility for challenges
                    if (state.stats.completedChallenges !== undefined && (!state.stats.completedChallengeIds || state.stats.completedChallengeIds.length === 0)) {
                        state.stats.completedChallengeIds = [];
                        state.stats.activeChallenges = ["Route 1"];

                        // Wait for configs to be available to build the list
                        // We will do this right after loadConfigs
                    }

                    await loadConfigs();

                    // Complete challenge arrays mapping for older saves
                    if (state.stats.completedChallenges > 0 && state.stats.completedChallengeIds && state.stats.completedChallengeIds.length === 0) {
                        if (state.config.unlocks) {
                            let maxIndex = Math.min(state.stats.completedChallenges, state.config.unlocks.length);
                            for (let i = 0; i < maxIndex; i++) {
                                let unlock = state.config.unlocks[i];
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
                    if (!state.stats.activeChallenges) state.stats.activeChallenges = ["Route 1"];
                    if (!state.stats.completedChallengeIds) state.stats.completedChallengeIds = [];

                    startGame();

                    if (state.isZzZMode) {
                        const resumeHtml = `
    <div class="content-panel" style="display: flex; flex-direction: column; gap: 15px; width: 100%; text-align: center;">
        <p style="color: white; margin: 0;">Do you want to collect the farm while Sleeping?</p>
        <div style="display: flex; gap: 10px; justify-content: center; margin-top: 10px;">
            <button id="btn-zzz-resume-yes" style="padding: 10px; font-size: 16px; font-weight: bold; cursor: pointer; background-color: #4CAF50; color: white; border: none; border-radius: 5px; flex: 1;">Yes</button>
            <button id="btn-zzz-resume-no" style="padding: 10px; font-size: 16px; font-weight: bold; cursor: pointer; background-color: #f44336; color: white; border: none; border-radius: 5px; flex: 1;">No</button>
        </div>
    </div>
`;
showModal("Sleep Mode", resumeHtml, "window-zzz-resume", "400px");

                        document.getElementById('btn-zzz-resume-no').onclick = () => {
                            state.isZzZMode = false;
                            state.zzzTimestamp = null;
                            storage.save(state);
                            if(window.windowManager) window.windowManager.closeDynamicWindow('window-zzz-resume');
                            // Start normally at Oak's lab
                            state.currentRoute = "Professor Oak Lab";
                            switchView("PROF_OAK_LAB");
                        };

                        document.getElementById('btn-zzz-resume-yes').onclick = () => {
                            if(window.windowManager) window.windowManager.closeDynamicWindow('window-zzz-resume');

                            // Simulate sleep farm
                            let timeElapsedMs = Date.now() - (state.zzzTimestamp || Date.now());
                            timeElapsedMs = Math.max(0, timeElapsedMs); // Prevent negative time if system clock changes

                            // Cap time elapsed by grains
                            let availableGrains = state.stats.jigglypuffGrains || 0;
                            let maxTimeMs = availableGrains * 60000;

                            if (timeElapsedMs > maxTimeMs) {
                                timeElapsedMs = maxTimeMs;
                            }

                            const results = globals.battleSystem.runFastForward(timeElapsedMs);

                            let displayTimeMs = results.simulatedTimeMs !== undefined ? results.simulatedTimeMs : timeElapsedMs;

                            // Make sure to cap the max time back to max available grains to avoid overdraft when resuming from save/etc.
                            let actualTimeConsumedMs = Math.min(displayTimeMs, maxTimeMs);
                            let consumedGrains = Math.ceil(actualTimeConsumedMs / 60000);
                            state.stats.jigglypuffGrains = Math.max(0, availableGrains - consumedGrains);
                            state.stats.jigglypuffGrainsUsed = (state.stats.jigglypuffGrainsUsed || 0) + consumedGrains;

                            // Track Daily Challenges
                            trackDailyChallenge('sleep_minutes', { amount: Math.floor(actualTimeConsumedMs / 60000) });

                            state.isZzZMode = false;
                            state.zzzTimestamp = null;
                            storage.save(state);


                            function formatFarmMoney(num) {
                                if (num === 0) return "0";
                                return num.toLocaleString('en-US').replace(/,/g, '.');
                            }

                            // Format Time based on actual simulated time returned by the engine
                            let totalSeconds = Math.floor(displayTimeMs / 1000);
                            let d = Math.floor(totalSeconds / (3600 * 24));
                            let h = Math.floor((totalSeconds % (3600 * 24)) / 3600);
                            let m = Math.floor((totalSeconds % 3600) / 60);
                            let s = totalSeconds % 60;

                            let timeStr = "";
                            if (d > 0) timeStr += `${d}d`;
                            if (h > 0 || d > 0) timeStr += `${h}h`;
                            if (m > 0 || h > 0 || d > 0) timeStr += `${m}m`;
                            timeStr += `${s}s`; // Always display seconds

                            // Items Used Names
                            let ballUsedStr = "No Ball Used";
                            let ballIconStr = `<div style="font-size: 18px; color: #64748b; margin-bottom: 5px;">-</div>`;
                            if (state.settings.activeBallTier >= 0) {
                                const ballName = state.config.balance.items.pokeballs[state.settings.activeBallTier].name;
                                ballUsedStr = `${results.ballsUsed} ${ballName}s`;
                                ballIconStr = `<img src="Assets/Items/Balls/${ballName}.png" style="width: 30px; height: 30px; margin-bottom: 5px;" alt="${ballName}">`;
                            }

                            let potionUsedStr = "No Potion Used";
                            let potionIconStr = `<div style="font-size: 18px; color: #64748b; margin-bottom: 5px;">-</div>`;
                            if (state.settings.activePotionTier >= 0) {
                                const potionName = state.config.balance.items.potions[state.settings.activePotionTier].name;
                                potionUsedStr = `${results.potionsUsed} ${potionName}s`;
                                potionIconStr = `<img src="Assets/Items/Potions/${potionName}.png" style="width: 30px; height: 30px; margin-bottom: 5px;" alt="${potionName}">`;
                            }

                            let faintedBanner = "";
                            if (results.fainted) {
                                faintedBanner = `<div style="background: rgba(239, 68, 68, 0.2); border: 1px solid #ef4444; border-radius: 8px; padding: 10px; color: #fca5a5; text-align: center; font-weight: bold; margin-top: 5px;">❌ Farm Stopped: Party Fainted</div>`;
                            } else if (results.outOfMoney) {
                                faintedBanner = `<div style="background: rgba(239, 68, 68, 0.2); border: 1px solid #ef4444; border-radius: 8px; padding: 10px; color: #fca5a5; text-align: center; font-weight: bold; margin-top: 5px;">❌ Farm Stopped: No money to buy more entries</div>`;
                            } else if (results.simulatedTimeMs !== undefined && results.simulatedTimeMs >= maxTimeMs) {
                                faintedBanner = `<div style="background: rgba(234, 179, 8, 0.2); border: 1px solid #facc15; border-radius: 8px; padding: 10px; color: #fde047; text-align: center; font-weight: bold; margin-top: 5px;">❌ Farm Stopped: Jigglypuff Dust ended</div>`;
                            } else {
                                faintedBanner = `<div style="background: rgba(16, 185, 129, 0.2); border: 1px solid #10b981; border-radius: 8px; padding: 10px; color: #6ee7b7; text-align: center; font-weight: bold; margin-top: 5px;">✅ Farm Stopped: Logged in a save</div>`;
                            }

                            // Show results modal


                            const resultsHtml = `
                                <div class="content-panel">
                                <div style="display: flex; justify-content: space-between; align-items: center; background: rgba(0,0,0,0.3); padding: 8px 12px; border-radius: 8px; margin-bottom: 15px;">
                                    <div style="font-size: 14px; color: #cbd5e1;">📍 <b>Route:</b> ${state.currentRoute}</div>
                                    <div style="font-size: 14px; color: #cbd5e1;">⏳ <b>Time:</b> ${timeStr.trim()}</div>
                                </div>

                                <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 10px;">

                                    <!-- Money Earned -->
                                    <div style="background: rgba(16, 185, 129, 0.1); border: 1px solid #10b981; border-radius: 8px; padding: 12px; text-align: center; display: flex; flex-direction: column; justify-content: center; align-items: center;">
                                        <div style="font-size: 11px; color: #6ee7b7; text-transform: uppercase; letter-spacing: 1px; margin-bottom: 5px;">Money Earned</div>
                                        <div style="font-size: 18px; font-weight: bold; color: #10b981;">+$${Math.floor(results.moneyEarned).toLocaleString('pt-BR')}</div>
                                    </div>

                                    <!-- XP Earned -->
                                    <div style="background: rgba(59, 130, 246, 0.1); border: 1px solid #3b82f6; border-radius: 8px; padding: 12px; text-align: center; display: flex; flex-direction: column; justify-content: center; align-items: center;">
                                        <div style="font-size: 11px; color: #93c5fd; text-transform: uppercase; letter-spacing: 1px; margin-bottom: 5px;">XP Earned</div>
                                        <div style="font-size: 18px; font-weight: bold; color: #3b82f6;">+${Math.floor(results.xpEarned).toLocaleString('pt-BR')} XP</div>
                                    </div>

                                    <!-- Caught Card -->
                                    <div style="background: rgba(255,255,255,0.05); border: 1px solid #475569; border-radius: 8px; padding: 12px; text-align: center; display: flex; flex-direction: column; justify-content: center; align-items: center;">
                                        <div style="font-size: 11px; color: #94a3b8; text-transform: uppercase; letter-spacing: 1px; margin-bottom: 5px;">Pokémon Caught</div>
                                        <div style="font-size: 18px; font-weight: bold; color: #fff;">${results.caught}/${results.encounters}</div>
                                    </div>

                                    <!-- Shinies Card -->
                                    <div style="background: rgba(255,255,255,0.05); border: 1px solid #475569; border-radius: 8px; padding: 12px; text-align: center; display: flex; flex-direction: column; justify-content: center; align-items: center; position: relative; overflow: hidden;">
                                        ${results.shinies > 0 ? '<div style="position: absolute; top: -10px; left: -10px; width: 150%; height: 150%; background: radial-gradient(circle, rgba(168,85,247,0.2) 0%, transparent 70%); pointer-events: none;"></div>' : ''}
                                        <div style="font-size: 11px; color: #d8b4fe; text-transform: uppercase; letter-spacing: 1px; margin-bottom: 5px; z-index: 1;">Shinies Caught</div>
                                        <div style="font-size: 18px; font-weight: bold; color: #fff; z-index: 1;">${results.shinies}/${results.shinyEncounters}</div>
                                    </div>

                                    <!-- Items Used Header -->
                                    <div style="grid-column: span 2; border-bottom: 1px solid #334155; padding-bottom: 5px; margin-top: 5px; color: #94a3b8; font-size: 11px; text-transform: uppercase; letter-spacing: 1px; text-align: center;">Resources Used</div>

                                    <!-- Balls Used -->
                                    <div style="background: rgba(0,0,0,0.2); border: 1px dashed #475569; border-radius: 8px; padding: 10px; text-align: center; display: flex; flex-direction: column; justify-content: center; align-items: center;">
                                        ${ballIconStr}
                                        <div style="font-size: 12px; color: #cbd5e1;">${ballUsedStr}</div>
                                    </div>

                                    <!-- Potions Used -->
                                    <div style="background: rgba(0,0,0,0.2); border: 1px dashed #475569; border-radius: 8px; padding: 10px; text-align: center; display: flex; flex-direction: column; justify-content: center; align-items: center;">
                                        ${potionIconStr}
                                        <div style="font-size: 12px; color: #cbd5e1;">${potionUsedStr}</div>
                                    </div>

                                </div>
                                ${faintedBanner}
                                <button id="btn-zzz-results-close-dynamic" style="padding: 12px; font-size: 16px; font-weight: bold; cursor: pointer; background: linear-gradient(to right, #10b981, #059669); color: white; border: 1px solid #34d399; border-radius: 8px; box-shadow: 0 4px 6px rgba(0,0,0,0.3); margin-top: 15px; width: 100%; text-transform: uppercase; letter-spacing: 1px;">Claim Rewards</button>
                                </div>
                            `;
                            showModal("ZzZ Mode", resultsHtml, "window-zzz-rewards");

                            document.getElementById('btn-zzz-results-close-dynamic').onclick = () => {
                                if(window.windowManager) window.windowManager.closeDynamicWindow('window-zzz-rewards');
                            };


                            if (results.fainted) {
                                state.currentRoute = "PokeCenter & PokeMarket";
                                window.navigateToLocation("PokeCenter & PokeMarket");
                            } else if (results.outOfMoney) {
                                if (state.currentRoute === "Safari Zone") {
                                    switchView("SAFARI_HUB");
                                } else if (state.currentRoute && state.currentRoute.startsWith("Casino - ")) {
                                    state.currentRoute = "Casino";
                                    window.navigateToLocation("Casino");
                                } else {
                                    state.currentRoute = "Professor Oak Lab";
                                    switchView("PROF_OAK_LAB");
                                }
                            } else {
                                state.currentRoute = "Professor Oak Lab";
                                switchView("PROF_OAK_LAB");
                            }
                        };
                    } else {
                        // Saved profiles always start at Oak's Lab and are free to explore
                        state.currentRoute = "Professor Oak Lab";
                        switchView("PROF_OAK_LAB");
                    }
                }
            };

            profilesContainer.appendChild(btn);
        });

        document.getElementById('btn-new-profile').onclick = startNewGame;

        document.getElementById('btn-rename-profile').onclick = () => {
            profileAction = profileAction === 'rename' ? 'load' : 'rename';
            updateHeader();
        };

        document.getElementById('btn-delete-profile').onclick = () => {
            profileAction = profileAction === 'delete' ? 'load' : 'delete';
            updateHeader();
        };

    } else {
        if (splashScreen) splashScreen.style.display = 'flex';
        if (saveManagerModal) saveManagerModal.style.display = 'flex';

        document.getElementById('btn-new-profile').onclick = startNewGame;
    }

    // Bind buttons (they might be missing if bypass Oak)
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
    bindBtn('btn-multiplayer', () => {
        state.globalStats.hasSeenMultiplayerIcon = true;
        storage.save(state);
        updateMainControl();
        window.openMultiplayerModal();
    });
    bindBtn('btn-toggle-main', () => { window.windowManager.toggleWindow('main-view-window'); });
    bindBtn('btn-map', () => {
        if(!checkCombatLock()) {
            showMap();
            window.windowManager.toggleWindow('main-view-window', true);
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
            const showTutorial = !state.globalStats.hasSeenZzZTutorial;
            const htmlContent = `
                <div class="content-panel" style="display: flex; flex-direction: column; gap: 15px; width: 100%; box-sizing: border-box; position: relative;">
                    ${showTutorial ? `
                    <div id="zzz-tutorial-overlay-inner" style="position: absolute; top: 0; left: 0; width: 100%; height: 100%; z-index: 1000; background: rgba(0, 0, 0, 0.7); display: flex; flex-direction: column; align-items: center; justify-content: center; border-radius: 8px;">
                        <div style="background: #34495e; padding: 20px; border-radius: 10px; border: 2px solid #00ffff; text-align: center; color: white; max-width: 80%;">
                            <div style="margin-top: 0; font-size: 16px;">
                                <p>Welcome to ZzZ Mode!</p>
                                <p>You will earn 1 grain of Jigglypuff Dust for every minute you play.</p>
                                <p>Each grain will grant 1 minute of offline farming.</p>
                                <p>Sleep well!</p>
                            </div>
                            <button id="btn-dismiss-zzz-inner" style="padding: 10px 20px; background: #2ecc71; color: white; border: none; border-radius: 5px; cursor: pointer; font-weight: bold; margin-top: 10px; font-size: 16px;">Ok.</button>
                        </div>
                    </div>
                    ` : ''}
                    <div style="display: flex; align-items: center; justify-content: center; background: rgba(0,0,0,0.2); border-radius: 8px; padding: 20px; border: 1px solid #334155; gap: 20px;">
                        <div style="flex: 1; display: flex; justify-content: flex-end;">
                            <img src="Assets/Extra/Jigglypuff Dust.png" style="width: 120px; height: auto; filter: drop-shadow(0 0 10px rgba(255, 192, 203, 0.4));">
                        </div>
                        <div style="flex: 1; display: flex; flex-direction: column; align-items: center; text-align: center;">
                            <div style="font-size: 14px; color: #94a3b8; text-transform: uppercase; letter-spacing: 2px;">Available Grains</div>
                            <div id="zzz-current-grains" style="font-size: 36px; font-weight: bold; color: #fbcfe8; text-shadow: 0 2px 4px rgba(0,0,0,0.8); margin: 5px 0;">${grains}</div>
                            <div id="zzz-max-offline-time" style="font-size: 12px; color: #cbd5e1;">(1 grain = 1min offline farm)</div>
                        </div>
                    </div>

                    <div style="display: flex; gap: 10px; justify-content: center; margin-top: 10px; padding-bottom: 5px;">
                        <button id="btn-zzz-yes" style="padding: 12px; font-size: 16px; font-weight: bold; cursor: pointer; background: linear-gradient(to right, #3b82f6, #2563eb); color: white; border: 1px solid #60a5fa; border-radius: 8px; flex: 1; box-shadow: 0 4px 6px rgba(0,0,0,0.3); text-transform: uppercase; letter-spacing: 1px;">Go to Sleep</button>
                        <button id="btn-zzz-no" style="padding: 12px; font-size: 16px; font-weight: bold; cursor: pointer; background: linear-gradient(to right, #ef4444, #dc2626); color: white; border: 1px solid #f87171; border-radius: 8px; flex: 1; box-shadow: 0 4px 6px rgba(0,0,0,0.3); text-transform: uppercase; letter-spacing: 1px;">Cancel</button>
                    </div>
                </div>
            `;

            showModal("ZzZ Mode", htmlContent, "window-zzz-confirmation", "460px");
            const winZzz = document.getElementById('window-zzz-confirmation');
            if (winZzz) {
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
                window.close();
            };
};

        bindBtn('btn-sleep', () => {
        if(!checkCombatLock()) {
            state.stats.hasSeenZzZIcon = true;
            storage.save(state);
            updateMainControl();
            window.showZzZConfirmationModal();
        }
    });

    window.showBackpackAndFocus = (tab) => {
        if(!checkCombatLock()) {
            showBackpack();
            renderBackpackTab(tab);
        }
    };

    window.updateMainControl = updateMainControl;

    window.showTrainerStats = function(tab = 'statistics', options = {}) {
        if(checkCombatLock()) return;

        let titleHtml = `
            <div style="display: flex; flex-direction: column; align-items: center; gap: 5px;">
                <div style="font-weight: bold; font-size: 18px; color: white;">Trainer</div>
                <div style="display: inline-flex; background: rgba(0, 0, 0, 0.2); border-radius: 20px; padding: 3px; gap: 5px;">
                    <button onclick="window.showTrainerStats('statistics')" style="${tab === 'statistics' ? 'background: linear-gradient(to bottom, #3498db, #2980b9); color: white; border: 1px solid #3498db; box-shadow: 0 2px 4px rgba(0,0,0,0.2);' : 'background: transparent; color: rgba(255, 255, 255, 0.7); border: 1px solid transparent;'} border-radius: 15px; padding: 5px 15px; font-weight: bold; cursor: pointer; font-size: 14px; transition: all 0.2s;" onmousedown="event.stopPropagation()">Statistics</button>
                    <button onclick="window.showTrainerStats('badges')" style="${tab === 'badges' ? 'background: linear-gradient(to bottom, #3498db, #2980b9); color: white; border: 1px solid #3498db; box-shadow: 0 2px 4px rgba(0,0,0,0.2);' : 'background: transparent; color: rgba(255, 255, 255, 0.7); border: 1px solid transparent;'} border-radius: 15px; padding: 5px 15px; font-weight: bold; cursor: pointer; font-size: 14px; transition: all 0.2s;" onmousedown="event.stopPropagation()">Badges</button>
                    <button onclick="window.showTrainerStats('catch-rate')" style="${tab === 'catch-rate' ? 'background: linear-gradient(to bottom, #3498db, #2980b9); color: white; border: 1px solid #3498db; box-shadow: 0 2px 4px rgba(0,0,0,0.2);' : 'background: transparent; color: rgba(255, 255, 255, 0.7); border: 1px solid transparent;'} border-radius: 15px; padding: 5px 15px; font-weight: bold; cursor: pointer; font-size: 14px; transition: all 0.2s;" onmousedown="event.stopPropagation()">Catch Rate</button>
                    <button onclick="window.showTrainerStats('upgrades')" style="${tab === 'upgrades' ? 'background: linear-gradient(to bottom, #3498db, #2980b9); color: white; border: 1px solid #3498db; box-shadow: 0 2px 4px rgba(0,0,0,0.2);' : 'background: transparent; color: rgba(255, 255, 255, 0.7); border: 1px solid transparent;'} border-radius: 15px; padding: 5px 15px; font-weight: bold; cursor: pointer; font-size: 14px; transition: all 0.2s;" onmousedown="event.stopPropagation()">Upgrades</button>
                </div>
            </div>
        `;

        let contentHtml = '';

        if (tab === 'statistics') {
            let uniqueSpeciesCaught = 0;
            if (state.stats.caughtSpecies) {
                uniqueSpeciesCaught = Object.keys(state.stats.caughtSpecies).length;
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
            let backpackMons = [];
            if (state.party) backpackMons = backpackMons.concat(state.party);
            if (state.storage) backpackMons = backpackMons.concat(state.storage);
            if (state.safe) backpackMons = backpackMons.concat(state.safe);

            backpackMons.forEach(p => {
                if (!p) return;
                if (p.level > highestLevel) highestLevel = p.level;
                if (p.quality > highestQuality) highestQuality = p.quality;
                if (p.ivs) {
                    const sumIV = (p.ivs.hp || 0) + (p.ivs.atk || 0) + (p.ivs.def || 0) + (p.ivs.spa || 0) + (p.ivs.spd || 0) + (p.ivs.spe || 0);
                    if (sumIV > highestSumIV) highestSumIV = sumIV;
                }
            });

            const whiteCandiesClaimed = state.stats.whiteCandies || 0;

            let challengesCompleted = state.stats.completedChallengeIds ?
                (state.config.unlocks ? state.stats.completedChallengeIds.filter(id => state.config.unlocks.some(u => u.areaId === id)).length : state.stats.completedChallengeIds.length)
                : 0;
            let maxChallenges = state.config.unlocks ? state.config.unlocks.length : 45;

            let assignmentsCompleted = 0;
            assignmentsCompleted += (state.stats.qTaskTier || 0);
            assignmentsCompleted += (state.stats.cTaskTier || 0);
            assignmentsCompleted += (state.stats.levelTaskTier || 0);
            assignmentsCompleted += (state.stats.ivTaskTier || 0);
            assignmentsCompleted += (state.stats.shinySeenTaskTier || 0);
            assignmentsCompleted += (state.stats.shinyCaughtTaskTier || 0);
            assignmentsCompleted += (state.stats.finalTaskTier || 0);
            let maxAssignments = (oakTasks.q ? oakTasks.q.length : 0) +
                                 (oakTasks.c ? oakTasks.c.length : 0) +
                                 (oakTasks.level ? oakTasks.level.length : 0) +
                                 (oakTasks.iv ? oakTasks.iv.length : 0) +
                                 (oakTasks.shinySeen ? oakTasks.shinySeen.length : 0) +
                                 (oakTasks.shinyCaught ? oakTasks.shinyCaught.length : 0) +
                                 (oakTasks.final ? oakTasks.final.length : 0);

            let uniqueShinySpeciesCaught = 0;
            if (state.stats.caughtShiniesSpecies) {
                uniqueShinySpeciesCaught = Object.keys(state.stats.caughtShiniesSpecies).length;
            }

            contentHtml = `
                <div style="position: relative; height: 100%; display: flex; flex-direction: column;">
                    <div style="text-align: left; margin-bottom: 20px;">
                        <div style="display: flex; gap: 40px; justify-content: space-between;">
                            <div style="flex: 1;">
                                <p><b>Time played:</b> ${playtimeStr}</p>
                                <p><b>$</b> ${state.trainer.money.toLocaleString()}</p>
                            </div>
                            <div style="flex: 1;">
                                <p><b>Battles Won:</b> ${(state.stats.battlesWon || 0).toLocaleString()}</p>
                                <p><b>Faints:</b> ${(state.stats.faints || 0).toLocaleString()}</p>
                            </div>
                        </div>
                        <hr style="margin: 10px 0;">
                        <div style="display: flex; gap: 40px; justify-content: space-between;">
                            <div style="flex: 1;">
                                <p><b>Total Pokémon Captured:</b> ${(state.stats.caught || 0).toLocaleString()}</p>
                                <p><b>Species Caught:</b> ${uniqueSpeciesCaught} / ${state.config.pokemonData.length}</p>
                            </div>
                            <div style="flex: 1;">
                                <p><b>Shinies Caught:</b> ${(state.stats.shiniesCaught || 0).toLocaleString()}</p>
                                <p><b>Shiny Species Caught:</b> ${uniqueShinySpeciesCaught} / ${state.config.pokemonData.length}</p>
                            </div>
                        </div>
                        <hr style="margin: 10px 0;">
                        <div style="display: flex; gap: 40px; justify-content: space-between;">
                            <div style="flex: 1;">
                                <p><b>Jigglypuff Grains Used:</b> ${(state.stats.jigglypuffGrainsUsed || 0).toLocaleString()}</p>
                                <p><b>Daily Rewards Collected:</b> ${(state.stats.dailyRewards ? state.stats.dailyRewards.daysClaimed : 0).toLocaleString()}</p>
                                <p><b>Professor Oak Assignments Completed:</b> ${assignmentsCompleted}/${maxAssignments}</p>
                            </div>
                            <div style="flex: 1;">
                                <p><b>White Candies Claimed:</b> ${(whiteCandiesClaimed || 0).toLocaleString()}</p>
                                <p><b>Daily Tokens Earned:</b> ${(state.stats.tokensEarned || 0).toLocaleString()}</p>
                                <p><b>Progress Challenge Completed:</b> ${challengesCompleted}/${maxChallenges}</p>
                            </div>
                        </div>
                        <hr style="margin: 10px 0;">
                        <div style="display: flex; gap: 40px; justify-content: space-between;">
                            <div style="flex: 1;">
                                <p><b>Highest Level on Backpack:</b> ${highestLevel}</p>
                                <p><b>Highest Quality on Backpack:</b> ${highestQuality}</p>
                                <p><b>Highest IV Sum on Backpack:</b> ${highestSumIV}</p>
                            </div>
                            <div style="flex: 1;">
                                <p><b>Highest Level Captured:</b> ${state.stats.highestLevelCaptured || 0}</p>
                                <p><b>Highest Quality Captured:</b> ${state.stats.highestQualityCaptured || 0}</p>
                                <p><b>Highest IV Sum Captured:</b> ${state.stats.highestSumIVCaptured || 0}</p>
                            </div>
                        </div>
                    </div>
                </div>
            `;
        } else if (tab === 'badges') {
            let badgesHtml = '<div style="display: flex; gap: 10px; margin-top: 10px; justify-content: center; flex-wrap: wrap;">';
            for (let i = 1; i <= state.trainer.badges; i++) {
                badgesHtml += `<img src="./Assets/Badges/Badge Kanto ${i}.png" style="width: 40px; height: 40px;" title="Badge ${i}">`;
            }
            badgesHtml += '</div>';

            contentHtml = `
                <div style="text-align: center; margin-bottom: 20px;">
                    ${badgesHtml}
                </div>
            `;
        } else if (tab === 'catch-rate') {
            const showShiny = options.showShiny || false;
            contentHtml = generateCatchRateHtml(showShiny);
        } else if (tab === 'upgrades') {
            contentHtml = '<div style="display: grid; grid-template-columns: repeat(auto-fill, minmax(200px, 1fr)); gap: 15px; padding: 15px;">';

            if (state.stats.upgrades) {
                const upgradeTypes = [
                    { key: 'ballsTier', configKey: 'ballPocket' },
                    { key: 'potionsTier', configKey: 'potionSatchel' },
                    { key: 'boxTier', configKey: 'pokemonBox' },
                    { key: 'glassTier', configKey: 'glass' },
                    { key: 'smartwatchTier', configKey: 'smartwatch' },
                    { key: 'speedTier', configKey: 'speed' },
                    { key: 'lootTier', configKey: 'loot' }
                ];

                upgradeTypes.forEach(type => {
                    const tier = state.stats.upgrades[type.key] || 0;
                    if (tier > 0) {
                        // Show the currently purchased tier (index tier - 1)
                        const configItem = state.config.balance.expansions[type.configKey][tier - 1];
                        if (configItem) {
                            const displayName = configItem.displayName || configItem.name;
                            let description = configItem.description || '';
                            if (type.configKey === 'ballPocket') {
                                description = `Ball Stock Capacity: ${getCapacity(state, 'balls')}`;
                            } else if (type.configKey === 'potionSatchel') {
                                description = `Potion Stock Capacity: ${getCapacity(state, 'potions')}`;
                            } else if (type.configKey === 'pokemonBox') {
                                description = `Pokemon Capacity in Backpack: ${getCapacity(state, 'box')}`;
                            } else if (type.configKey === 'speed') {
                                if (tier === 1) description = "Encounter time decreased in 10%";
                                else if (tier === 2) description = "Encounter time decreased in 20%";
                                else if (tier === 3) description = "Encounter time decreased in 30%";
                                else if (tier === 4) description = "Encounter time decreased in 40%";
                                else if (tier >= 5) description = "Encounter time decreased in 50%";
                            } else if (type.configKey === 'glass') {
                                if (tier === 1) description = "Show Healthbar at Main View";
                                else if (tier === 2) description = "Show Healthbar and Damage at Main View";
                                else if (tier === 3) description = "Show Healthbar, Damage and Level at Main View";
                                else if (tier === 4) description = "Show Healthbar, Damage, Level and Quality at Main View";
                                else if (tier >= 5) description = "Show Healthbar, Damage, Level, Quality and SumIV at Main View";
                            } else if (type.configKey === 'loot') {
                                if (tier === 1) description = "Can loot Potion";
                                else if (tier === 2) description = "Can loot Potion and Ball";
                                else if (tier === 3) description = "Can loot Potion, Ball and Stone";
                                else if (tier === 4) description = "Can loot Potion, Ball, Stone and Vitamin";
                            } else if (type.configKey === 'smartwatch') {
                                if (tier === 1) description = "Can Select Ball at Main View";
                                else if (tier === 2) description = "Can Select Ball and potion at Main View";
                                else if (tier >= 3) description = "Can Select Ball and potion at Main View and use smart mode for capture";
                            }

                            contentHtml += `
                                <div style="background: #2c3e50; border: 2px solid #3498db; border-radius: 10px; padding: 15px; text-align: center; display: flex; flex-direction: column; align-items: center; justify-content: flex-start; gap: 10px;">
                                    <div style="font-size: 14px; font-weight: bold; color: white;">${displayName}</div>
                                    <img src="./Assets/Items/Upgrades/${configItem.name}.png" style="width: 50px; height: 50px; object-fit: contain;" alt="${displayName}">
                                    <div style="font-size: 12px; color: #cbd5e1; line-height: 1.3;">${description}</div>
                                </div>
                            `;
                        }
                    }
                });
            }

            contentHtml += '</div>';

            if (contentHtml === '<div style="display: grid; grid-template-columns: repeat(auto-fill, minmax(200px, 1fr)); gap: 15px; padding: 15px;"></div>') {
                contentHtml = '<div style="text-align: center; padding: 20px; font-style: italic; color: #ccc;">No upgrades purchased yet.</div>';
            }
        }

        showModal(titleHtml, contentHtml, "window-trainer");

        if (tab === 'catch-rate') {
            const win = document.getElementById('window-trainer');
            if (win) {
                const innerContent = win.querySelector('.window-content-container');
                if (innerContent) {
                    innerContent.style.setProperty('padding', '0px', 'important');
                }
            }
        } else {
            const win = document.getElementById('window-trainer');
            if (win) {
                const innerContent = win.querySelector('.window-content-container');
                if (innerContent) {
                    innerContent.style.removeProperty('padding'); // Restore default padding if needed, although modal re-renders often reset it. Wait, if it resets, it's fine.
                }
            }
        }
    };

    bindBtn('btn-stats', () => {
        window.showTrainerStats();
    });

    bindBtn('btn-settings', () => {
        if(!checkCombatLock()) showSettings();
    });

    bindBtn('btn-exit', () => {
        window.promptExitGame();
    });
}

export const promptExitGame = () => {
    if (confirm("Do you want to leave the game?")) {
        if (state.party.length === 0 && state.storage.length === 0) {
            window.close();
        } else {
            storage.save(state);
            window.close(); // Closes the app completely (works in Electron/app context)
        }
    }
};

window.promptExitGame = promptExitGame;
window.openMultiplayerModal = openMultiplayerModal;


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

    alertBox.style.top = '20px';
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
    alertBox.innerHTML = message;

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
        window.globals.battleSystem.state.currentRoute = "Safari Zone";
        window.globals.battleSystem.searchNext();

    }
};

window.leaveSafariZone = () => {
    switchView("MAP");
};
window.switchView = switchView;

window.initGame = init;
window.startGame = startGame;
