import { getChallengeData } from './ui/topbar.js';

import * as mathEngine from "./mathEngine.js";
import BattleSystem from "./battleSystem.js";
import DayCare from "./dayCare.js";
import Storage from "./storage.js";

// Import State and modules
import { state, setBattleSystem, globals } from './state.js';

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
import { updateTopbar } from './ui/topbar.js';
import { updateSidebar } from './ui/sidebar.js';
import { updateBattleArena, showDamage, playCombatAnimations, triggerDefeatAnimation } from './ui/battle.js';
import { showCalendar } from './ui/calendar.js';
import { showGiftModal } from './ui/gift.js';
import { showMap, navigateToLocation, showMapTooltip, hideMapTooltip } from './ui/map.js';
import { showPokedex, showDexEntry } from './ui/pokedex.js';
import { showPokemonStats, showPokemonStatsByUuid, evolvePokemon } from './ui/pokemonStats.js';
import { showBonusCandyModal } from './ui/bonusCandy.js';
window.showBonusCandyModal = showBonusCandyModal;
import { showSettings, updateGameSpeed, addMoney, addXp, exportLog, showAddPokemonModal, forceNextEncounter, activateCheat } from './ui/settings.js';
import { setupMarket, buyItem, openPokeMarketBuy, renderPokeMarketTab, updateMarketPrices } from './ui/market.js';
import { showBackpack, renderBackpackTab, setActiveItem } from './ui/backpack/index.js';
import { dragStart, dragOver, handleDrop } from './ui/backpack/pokemon.js';

const storage = new Storage();
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
window.showPokedex = showPokedex;
window.showDexEntry = showDexEntry;
window.showPokemonStats = showPokemonStats;
window.showPokemonStatsByUuid = showPokemonStatsByUuid;
window.evolvePokemon = evolvePokemon;
window.showSettings = showSettings;
window.updateGameSpeed = updateGameSpeed;
window.addMoney = addMoney;
window.addXp = addXp;
window.exportLog = exportLog;
window.buyItem = buyItem;
window.openPokeMarketBuy = openPokeMarketBuy;
window.renderPokeMarketTab = renderPokeMarketTab;
window.updateMarketPrices = updateMarketPrices;
window.showAddPokemonModal = showAddPokemonModal;
window.forceNextEncounter = forceNextEncounter;
window.activateCheat = activateCheat;
window.dragStart = dragStart;
window.completeChallenge = function() {
    state.stats.completedChallenges = (state.stats.completedChallenges || 0) + 1;

    // Clear challenge specific tracking state
    state.stats.challengeRouteDefeats = 0;
    state.stats.challengeSpecificDefeats = {};
    state.stats.challengeCaughtSpecific = {};

    updateUI();
    if (document.getElementById('modal-overlay').style.display !== 'none') {
        window.showChallengesModal(); // refresh modal
    }
};



window.showChallengesModal = function() {
    if (!state.config.unlocks) return;

    let currentIndex = state.stats.completedChallenges || 0;

    let html = `<div style="display:flex; flex-direction:column; gap:15px; text-align:left;">`;

    // Active Challenge Sector
    html += `<div style="border: 1px solid #555; padding: 10px; border-radius: 5px; background-color: rgba(0,0,0,0.5);">
                <h3 style="margin-top: 0; margin-bottom: 10px; border-bottom: 1px solid #444; padding-bottom: 5px; font-size: 16px;">Active Challenge</h3>`;

    if (currentIndex >= state.config.unlocks.length) {
        html += `<div style="text-align: center; font-size: 16px; color: #aaa;">No active Challenge</div>`;
    } else {
        let unlock = state.config.unlocks[currentIndex];
        let cData = getChallengeData(unlock);

        let rewardsStr = unlock.unlocks ? unlock.unlocks.join(", ") : "Next Area";

        html += `<div style="margin-bottom: 5px;"><b>Requirements:</b></div>
                 <ul style="margin-top: 0; padding-left: 20px;">`;

        for (let part of cData.textParts) {
            html += `<li>${part}</li>`;
        }

        html += `</ul>
                 <div style="margin-top: 10px; color: #4CAF50;"><b>Rewards:</b> Unlocks ${rewardsStr}</div>`;

        if (cData.isMet) {
             html += `<div style="text-align: center; margin-top: 15px;">
                         <button onclick="window.completeChallenge()" style="padding: 10px 20px; font-size: 16px; font-weight: bold; background-color: #4CAF50; color: white; border: none; border-radius: 5px; cursor: pointer;">Complete ✔️</button>
                      </div>`;
        }
    }

    html += `</div>`;

    // Past Challenges Sector
    if (currentIndex > 0) {
        let pastTitle = currentIndex === 1 ? "Past Challenge" : "Past Challenges";
        html += `<div style="border: 1px solid #555; padding: 10px; border-radius: 5px; background-color: rgba(0,0,0,0.5);">
                    <h3 style="margin-top: 0; margin-bottom: 10px; border-bottom: 1px solid #444; padding-bottom: 5px; font-size: 16px;">${pastTitle}</h3>
                    <div style="display: flex; flex-direction: column; gap: 10px;">`;

        for (let i = currentIndex - 1; i >= 0; i--) {
             let pUnlock = state.config.unlocks[i];
             // Fake the data slightly to make it look completed, though getChallengeData will naturally evaluate to true
             let pData = getChallengeData(pUnlock);
             let pRewards = pUnlock.unlocks ? pUnlock.unlocks.join(", ") : "Next Area";

             html += `<div style="border: 1px solid #333; padding: 10px; border-radius: 5px; background-color: rgba(255,255,255,0.05);">
                          <div style="color: #4CAF50; font-weight: bold; margin-bottom: 5px;">Challenge ${i+1}</div>
                          <ul style="margin-top: 0; margin-bottom: 5px; padding-left: 20px; font-size: 14px;">`;
             for (let part of pData.textParts) {
                  // Ensure we show them as complete using words

                  // For past challenges, ensure they look complete and numbers match max requirements
                  // The text might look like "Defeat 25 Pokémon on Route 1 (0/25)"
                  // We extract the required count and force it to say (25/25) [Complete]
                  part = part.replace(/\((\d+)\/(\d+)\)/, (match, p1, p2) => `(${p2}/${p2})`);
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

    showModal("Progress Challenges", html);
};
window.dragOver = dragOver;
window.handleDrop = handleDrop;
window.showDamage = showDamage;
window.playCombatAnimations = playCombatAnimations;
window.triggerDefeatAnimation = triggerDefeatAnimation;
window.setLeader = function(idx) {
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

window.closeModal = function() {
    document.getElementById('modal-overlay').style.display = 'none';
    const modalBox = document.getElementById('modal-content-box');
    if (modalBox && modalBox.dataset.originalStyles !== undefined) {
        modalBox.setAttribute('style', modalBox.dataset.originalStyles);
        delete modalBox.dataset.originalStyles;
    }
};

export function showModal(title, htmlContent) {
    let rightCol = document.getElementById('modal-overlay');
    let contentPanel = document.getElementById('content-panel');
    const modalBox = document.getElementById('modal-content-box');

    // Reset styles for regular modals if not overridden by Map/Backpack
    if (modalBox && modalBox.dataset.originalStyles !== undefined) {
        modalBox.setAttribute('style', modalBox.dataset.originalStyles);
        delete modalBox.dataset.originalStyles;
    }

    rightCol.style.display = 'flex';
    let titleHtml = title ? `<h2>${title}</h2>` : '';
    contentPanel.innerHTML = `${titleHtml}${htmlContent}`;
}

const oakTasks = {
    q: [
        { req: 50, text: "Capture 50 Epic Pokemons", reward: "Low Quality Booster", effect: "+15% Quality" },
        { req: 100, text: "Capture 100 Epic Pokemons", reward: "Regular Quality Booster", effect: "+30% Quality" },
        { req: 250, text: "Capture 250 Epic Pokemons", reward: "Good Quality Booster", effect: "+45% Quality" },
        { req: 500, text: "Capture 500 Epic Pokemons", reward: "Excellent Quality Booster", effect: "+70% Quality" },
        { req: 1000, text: "Capture 1000 Epic Pokemons", reward: "Master Quality Booster", effect: "+100% Quality" }
    ],
    c: [
        { req: 1000, text: "Capture 1000 Pokemons", reward: "Low Catch Booster", effect: "+10% Catch Rate" },
        { req: 2500, text: "Capture 2500 Pokemons", reward: "Regular Catch Booster", effect: "+25% Catch Rate" },
        { req: 5000, text: "Capture 5000 Pokemons", reward: "Good Catch Booster", effect: "+45% Catch Rate" },
        { req: 10000, text: "Capture 10000 Pokemons", reward: "Excellent Catch Booster", effect: "+70% Catch Rate" },
        { req: 25000, text: "Capture 25000 Pokemons", reward: "Master Catch Booster", effect: "+100% Catch Rate" }
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
        { req: 3, text: "See 3 Shiny Pokemons", reward: "Good Shiny Booster", effect: "+2 Shiny Rolls" },
        { req: 10, text: "See 10 Shiny Pokemons", reward: "Catch Shiny Booster", effect: "4x Catch Rate on Shinies" }
    ],
    shinyCaught: [
        { req: 2, text: "Catch 2 Shiny Pokemons", reward: "Shiny IV Booster", effect: "+25% IVs for Shinies" }
    ],
    iv: [
        { req: 500, stat: 'caughtIVUnder300', text: "Catch 500 Pokemons with IV < 300", reward: "Low IV Booster", effect: "+5% IVs" },
        { req: 1000, stat: 'caughtIVUnder350', text: "Catch 1000 Pokemons with IV < 350", reward: "Regular IV Booster", effect: "+10% IVs" },
        { req: 2500, stat: 'caughtIVUnder400', text: "Catch 2500 Pokemons with IV < 400", reward: "Good IV Booster", effect: "+15% IVs" },
        { req: 5000, stat: 'caughtIVUnder450', text: "Catch 5000 Pokemons with IV < 450", reward: "Excellent IV Booster", effect: "+20% IVs" },
        { req: 10000, stat: 'caughtIVUnder500', text: "Catch 10000 Pokemons with IV < 500", reward: "Master IV Booster", effect: "+25% IVs" }
    ]
};

window.claimOakTaskReward = function(type) {
    if (type === 'q') state.stats.qTaskTier = (state.stats.qTaskTier || 0) + 1;
    if (type === 'c') state.stats.cTaskTier = (state.stats.cTaskTier || 0) + 1;
    if (type === 'level') state.stats.levelTaskTier = (state.stats.levelTaskTier || 0) + 1;
    if (type === 'shinySeen') state.stats.shinySeenTaskTier = (state.stats.shinySeenTaskTier || 0) + 1;
    if (type === 'shinyCaught') state.stats.shinyCaughtTaskTier = (state.stats.shinyCaughtTaskTier || 0) + 1;
    if (type === 'iv') state.stats.ivTaskTier = (state.stats.ivTaskTier || 0) + 1;
    window.showOakLabModal();
};

window.cheatCompleteOakTask = function(type) {
    let tier = 0;
    let req = 0;
    let statName = "";
    if (type === 'q') {
        tier = state.stats.qTaskTier || 0;
        if (tier < oakTasks.q.length) state.stats.epicCaptures = Math.max(state.stats.epicCaptures || 0, oakTasks.q[tier].req);
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
    window.showOakLabModal();
};

window.showOakLabModal = function() {
    let html = `<div style="display:flex; flex-direction:column; gap:15px; text-align:left; max-height: 70vh; overflow-y: auto; padding-right: 10px;">`;

    const renderActiveTask = (type, currentVal, tierIdx, taskList) => {
        if (tierIdx >= taskList.length) {
            return ``;
        }

        let task = taskList[tierIdx];
        let isComplete = currentVal >= task.req;

        let barHtml = "";
        if (isComplete) {
            barHtml = `
                <div onclick="window.claimOakTaskReward('${type}')" style="width: 100%; background-color: #4CAF50; border-radius: 4px; padding: 5px; text-align: center; cursor: pointer; color: white; font-weight: bold; margin-top: 5px;">
                    ${task.reward}
                </div>
            `;
        } else {
            let pct = Math.min(100, Math.floor((currentVal / task.req) * 100));
            barHtml = `
                <div style="width: 100%; background-color: #333; border-radius: 4px; overflow: hidden; height: 20px; border: 1px solid #555; position: relative; margin-top: 5px; display: flex; align-items: center;">
                    <div style="width: ${pct}%; background-color: #4CAF50; height: 100%;"></div>
                    <span style="position: absolute; width: 100%; text-align: center; color: white; font-size: 12px; font-weight: bold; line-height: 20px;">
                        ${currentVal} / ${task.req}
                    </span>
                </div>
            `;
        }

        return `
            <div style="margin-bottom: 10px;">
                <div style="display: flex; justify-content: space-between; align-items: center;">
                    <span>${task.text}</span>
                    <button onclick="window.cheatCompleteOakTask('${type}')" style="padding: 2px 5px; font-size: 10px; cursor: pointer; background: #d9534f; color: white; border: none; border-radius: 3px;">Cheat Complete</button>
                </div>
                ${barHtml}
            </div>
        `;
    };

    const renderCard = (title, type, currentVal, tierIdx, taskList, keepAllRewards) => {
        if (tierIdx >= taskList.length) {
            title = title.replace("Task", "Reward");
        }
        let taskHtml = renderActiveTask(type, currentVal, tierIdx, taskList);

        let rewardsHtml = "";
        if (tierIdx > 0) {
            if (keepAllRewards) {
                // Shiny style - keep all
                for (let i = 0; i < tierIdx; i++) {
                    rewardsHtml += `
                        <div style="font-size: 12px; margin-top: 5px; padding-left: 5px; border-left: 2px solid #4CAF50;">
                            <b>${taskList[i].reward}</b>: <span style="color: #4CAF50;">${taskList[i].effect}</span>
                        </div>
                    `;
                }
            } else {
                // Normal style - only show highest tier
                let topReward = taskList[tierIdx - 1];
                rewardsHtml += `
                    <div style="font-size: 12px; margin-top: 5px; padding-left: 5px; border-left: 2px solid #4CAF50;">
                        <b>${topReward.reward}</b>: <span style="color: #4CAF50;">${topReward.effect}</span>
                    </div>
                `;
            }
        }

        return `
            <div style="border: 1px solid #555; padding: 10px; border-radius: 5px; background-color: rgba(0,0,0,0.5);">
                <h3 style="margin-top: 0; margin-bottom: 10px; border-bottom: 1px solid #444; padding-bottom: 5px; font-size: 16px;">${title}</h3>
                ${taskHtml}
                ${rewardsHtml}
            </div>
        `;
    };

    // Quality Card
    html += renderCard("Quality Task", 'q', state.stats.epicCaptures || 0, state.stats.qTaskTier || 0, oakTasks.q, false);

    // Catch Card
    html += renderCard("Catch Task", 'c', state.stats.caught || 0, state.stats.cTaskTier || 0, oakTasks.c, false);

    // IV Card
    let ivTier = state.stats.ivTaskTier || 0;
    let ivCurrentVal = 0;
    if (ivTier < oakTasks.iv.length) {
        ivCurrentVal = state.stats[oakTasks.iv[ivTier].stat] || 0;
    } else if (oakTasks.iv.length > 0) {
        ivCurrentVal = state.stats[oakTasks.iv[oakTasks.iv.length - 1].stat] || 0; // fallback if completed
    }
    html += renderCard("IV Task", 'iv', ivCurrentVal, ivTier, oakTasks.iv, false);

    // Level Card
    let levelTier = state.stats.levelTaskTier || 0;
    let levelCurrentVal = 0;
    if (levelTier < oakTasks.level.length) {
        levelCurrentVal = state.stats[oakTasks.level[levelTier].stat] || 0;
    } else if (oakTasks.level.length > 0) {
        levelCurrentVal = state.stats[oakTasks.level[oakTasks.level.length - 1].stat] || 0; // fallback if completed
    }
    html += renderCard("Level Task", 'level', levelCurrentVal, levelTier, oakTasks.level, true);

    // Shiny Card (Combined seen and caught, keeps all rewards but obsolete regular seen shiny is removed by good shiny)
    let seenTier = state.stats.shinySeenTaskTier || 0;
    let caughtTier = state.stats.shinyCaughtTaskTier || 0;

    let shinySeenTaskHtml = renderActiveTask('shinySeen', state.stats.shiniesSeen || 0, seenTier, oakTasks.shinySeen);
    let shinyCaughtTaskHtml = renderActiveTask('shinyCaught', state.stats.shiniesCaught || 0, caughtTier, oakTasks.shinyCaught);

    let shinyTitle = "Shiny Task";

    // Only show "Task: Completed" once if both are done
    if (seenTier >= oakTasks.shinySeen.length && caughtTier >= oakTasks.shinyCaught.length) {
        shinyTitle = "Shiny Reward";
        shinySeenTaskHtml = "";
        shinyCaughtTaskHtml = "";
    } else {
        // If one is complete but not the other, we don't want duplicate "Task: Completed" texts
        // if they rendered their own individual completions. Since we only want a single "Completed" when BOTH are done,
        // we strip out the individual "Task: Completed" if it exists.
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
            <div style="font-size: 12px; margin-top: 5px; padding-left: 5px; border-left: 2px solid #4CAF50;">
                <b>${rewardName}</b>: <span style="color: #4CAF50;">${oakTasks.shinySeen[i].effect}</span>
            </div>
        `;
    }

    // Shiny Caught rewards logic
    for (let i = 0; i < caughtTier; i++) {
        shinyRewardsHtml += `
            <div style="font-size: 12px; margin-top: 5px; padding-left: 5px; border-left: 2px solid #4CAF50;">
                <b>${oakTasks.shinyCaught[i].reward}</b>: <span style="color: #4CAF50;">${oakTasks.shinyCaught[i].effect}</span>
            </div>
        `;
    }

    html += `
        <div style="border: 1px solid #555; padding: 10px; border-radius: 5px; background-color: rgba(0,0,0,0.5);">
            <h3 style="margin-top: 0; margin-bottom: 10px; border-bottom: 1px solid #444; padding-bottom: 5px; font-size: 16px;">${shinyTitle}</h3>
            ${shinySeenTaskHtml}
            ${shinyCaughtTaskHtml}
            ${shinyRewardsHtml}
        </div>
    `;

    html += `</div>`;
    showModal("Tasks & Rewards", html);
};

export function renderOakLab() {
    const oakLabDiv = document.getElementById("view-prof-oak-lab");
    if (!oakLabDiv) return;

    // Check if player has pokemon
    if (state.party.length === 0 && state.storage.length === 0) {
        return; // still selecting starter, handled in index.html
    }

    oakLabDiv.innerHTML = `
        <div style="background-color: rgba(0,0,0,0.85); display: inline-block; padding: 20px; margin-top: 20px; border-radius: 8px; width: 400px; color: white; text-align: center;">
            <h2 style="margin-top:0;">Professor Oak Lab</h2>
            <p style="font-size: 12px; color: #ccc; margin-bottom: 15px;">Complete tasks to unlock global bonuses.</p>

            <div style="display: flex; flex-direction: column; gap: 10px;">
                <button onclick="window.showOakLabModal()" style="padding: 10px; font-size: 16px; cursor: pointer;">Tasks & Rewards</button>
            </div>
        </div>
    `;
}

export function switchView(viewName) {
    document.querySelectorAll('.game-view').forEach(el => el.style.display = 'none');

    if (viewName === 'PROF_OAK_LAB') {
        document.getElementById('view-prof-oak-lab').style.display = 'block';
        renderOakLab();
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
    }
}

export function updateUI() {
    updateTopbar();
    updateSidebar();
    updateBattleArena();
}

async function loadConfigs() {
    const [pokemonData, routes, gyms, balance, moves, types, mapCoordinates] = await Promise.all([
      import('../config/pokemonData.js').then(m => m.default),
      import('../config/routes.js').then(m => m.routes),
      import('../config/gyms.js').then(m => m.default),
      import('../config/balance.js').then(m => m.default),
      import('../config/moves.js').then(m => m.default),
      import('../config/types.js').then(m => m.default),
      import('../config/mapCoordinates.js').then(m => m.default),
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
}

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
        moves: [{name: "Tackle", power: 40, type: "Normal", category: "Physical"}] // Basic start
    };

    state.party.push(starter);
    state.currentRoute = "Professor Oak Lab";
    switchView("PROF_OAK_LAB");

    // Unlock the top bar for a new game
    const navButtons = document.getElementById('nav-buttons');
    if (navButtons) {
        navButtons.style.pointerEvents = 'auto';
        navButtons.style.opacity = '1.0';
    }

    startGame();

    // Force an immediate save so the initial state is persisted to the new profile
    storage.save(state);

    renderOakLab(); // Renders the new Oak Lab UI now that we have a party
}

function startGame() {
    let bs = new BattleSystem(state, updateUI);
    setBattleSystem(bs);
    updateUI();
    bs.start();

    // Playtime tracker (adds 1 second every second)
    setInterval(() => {
        state.stats.playtime = (state.stats.playtime || 0) + 1;
    }, 1000);

    // Autosave loop
    setInterval(() => {
        storage.save(state);
    }, 60000);

    // Save on beforeunload
    window.addEventListener('beforeunload', () => {
        storage.save(state);
    });
}

async function init() {
    await loadConfigs();

    const profiles = storage.getProfiles();
    const splashScreen = document.getElementById('splash-screen');
    const saveManagerModal = document.getElementById('save-manager-modal');
    const profilesContainer = document.getElementById('profiles-container');

    const startNewGame = () => {
        if (splashScreen) splashScreen.style.display = 'none';
        if (saveManagerModal) saveManagerModal.style.display = 'none';

        // Force the nav buttons to be disabled immediately.
        const navButtons = document.getElementById('nav-buttons');
        if (navButtons) {
            navButtons.style.pointerEvents = 'none';
            navButtons.style.opacity = '0.5';
        }

        switchView("PROF_OAK_LAB");
        // Don't call startGame yet, the user must choose a pokemon first.
    };

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
        saveManagerModal.style.display = 'flex';

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
            const h2 = saveManagerModal.querySelector('h2');
            if (h2) {
                if (profileAction === 'rename') {
                    h2.innerHTML = "Save Profiles - <span style='color: #3498db;'>Select Profile to Rename</span>";
                } else if (profileAction === 'erase') {
                    h2.innerHTML = "Save Profiles - <span style='color: #f44336;'>Select Profile to Erase</span>";
                } else {
                    h2.innerHTML = "Save Profiles";
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
                    lastRoute = pUnlock.unlocks ? pUnlock.unlocks.join(", ") : "Next Area";
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
                } else if (profileAction === 'erase') {
                    if (confirm(`Are you sure you want to delete "${profileName}"? This cannot be undone.`)) {
                        storage.deleteProfile(profileId);
                        window.location.reload();
                    }
                    profileAction = 'load';
                    updateHeader();
                } else {
                    // Load Action
                    splashScreen.style.display = 'none';
                    saveManagerModal.style.display = 'none';

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

                    await loadConfigs();

                    startGame();

                    if (state.isZzZMode) {
                        document.getElementById('zzz-resume-modal').style.display = 'flex';

                        document.getElementById('btn-zzz-resume-no').onclick = () => {
                            state.isZzZMode = false;
                            state.zzzTimestamp = null;
                            storage.save(state);
                            document.getElementById('zzz-resume-modal').style.display = 'none';
                            // Start normally at Oak's lab
                            state.currentRoute = "Professor Oak Lab";
                            switchView("PROF_OAK_LAB");
                        };

                        document.getElementById('btn-zzz-resume-yes').onclick = () => {
                            document.getElementById('zzz-resume-modal').style.display = 'none';

                            // Simulate sleep farm
                            const timeElapsedMs = Date.now() - (state.zzzTimestamp || Date.now());
                            const results = globals.battleSystem.runFastForward(timeElapsedMs);

                            state.isZzZMode = false;
                            state.zzzTimestamp = null;
                            storage.save(state);


                            function formatFarmMoney(num) {
                                if (num === 0) return "0";
                                return num.toLocaleString('en-US').replace(/,/g, '.');
                            }

                            // Format Time
                            let totalSeconds = Math.floor(timeElapsedMs / 1000);
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

                            const faintedBanner = results.fainted
                                ? `<div style="background: rgba(239, 68, 68, 0.2); border: 1px solid #ef4444; border-radius: 8px; padding: 10px; color: #fca5a5; text-align: center; font-weight: bold; margin-top: 5px;">❌ Party Fainted</div>`
                                : `<div style="background: rgba(16, 185, 129, 0.2); border: 1px solid #10b981; border-radius: 8px; padding: 10px; color: #6ee7b7; text-align: center; font-weight: bold; margin-top: 5px;">✅ Farm Successful</div>`;

                            // Show results modal
                            document.getElementById('zzz-results-content').innerHTML = `
                                <div style="display: flex; justify-content: space-between; align-items: center; background: rgba(0,0,0,0.3); padding: 8px 12px; border-radius: 8px; margin-bottom: 15px;">
                                    <div style="font-size: 14px; color: #cbd5e1;">📍 <b>Route:</b> ${state.currentRoute}</div>
                                    <div style="font-size: 14px; color: #cbd5e1;">⏳ <b>Time:</b> ${timeStr.trim()}</div>
                                </div>

                                <div style="display: grid; grid-template-columns: repeat(2, 1fr); gap: 10px; margin-bottom: 15px;">

                                    <!-- Money Card -->
                                    <div style="background: linear-gradient(to bottom right, rgba(234, 179, 8, 0.1), rgba(0,0,0,0.4)); border: 1px solid #facc15; border-radius: 8px; padding: 12px; text-align: center; grid-column: span 2; display: flex; flex-direction: column; justify-content: center; align-items: center; box-shadow: inset 0 0 10px rgba(234, 179, 8, 0.1);">
                                        <div style="font-size: 11px; color: #fde047; text-transform: uppercase; letter-spacing: 1px; margin-bottom: 5px;">Money Earned</div>
                                        <div style="font-size: 22px; font-weight: bold; color: #fff; text-shadow: 0 2px 4px rgba(0,0,0,0.5);">$${formatFarmMoney(results.money)}</div>
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
                            `;
                            document.getElementById('zzz-results-modal').style.display = 'flex';
                            document.getElementById('btn-zzz-results-close').onclick = () => {
                                document.getElementById('zzz-results-modal').style.display = 'none';
                                updateUI();
                            };

                            if (results.fainted) {
                                state.currentRoute = "PokeCenter & PokeMarket";
                                window.navigateToLocation("PokeCenter & PokeMarket");
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

        document.getElementById('btn-erase-profile').onclick = () => {
            profileAction = profileAction === 'erase' ? 'load' : 'erase';
            updateHeader();
        };

    } else {
        startNewGame();
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

    bindBtn('btn-map', () => { if(!checkCombatLock()) showMap(); });
    bindBtn('btn-backpack', () => { if(!checkCombatLock()) showBackpack(); });
    bindBtn('btn-dex', () => { if(!checkCombatLock()) showPokedex(); });
    bindBtn('btn-bonus-candy', () => { if(!checkCombatLock()) showBonusCandyModal(); });
    bindBtn('btn-challenges', () => { if(!checkCombatLock()) window.showChallengesModal(); });
    bindBtn('btn-calendar', () => { if(!checkCombatLock()) showCalendar(); });
    bindBtn('btn-gift', () => { if(!checkCombatLock()) showGiftModal(); });

    bindBtn('btn-sleep', () => {
        if(!checkCombatLock()) {
            document.getElementById('zzz-confirmation-modal').style.display = 'flex';
        }
    });

    bindBtn('btn-zzz-no', () => {
        document.getElementById('zzz-confirmation-modal').style.display = 'none';
    });

    bindBtn('btn-zzz-yes', () => {
        state.isZzZMode = true;
        state.zzzTimestamp = Date.now();
        state.settings.isSleepModeActive = true;
        state.stats.lastSaveTime = Date.now();
        storage.save(state);
        window.close();
    });

    window.showBackpackAndFocus = (tab) => {
        if(!checkCombatLock()) {
            showBackpack();
            renderBackpackTab(tab);
        }
    };

    window.updateTopbar = updateTopbar;

    bindBtn('btn-stats', () => {
        if(checkCombatLock()) return;
        let badgesHtml = '<div style="display: flex; gap: 10px; margin-top: 10px; justify-content: center; flex-wrap: wrap;">';
        for (let i = 1; i <= state.trainer.badges; i++) {
            badgesHtml += `<img src="./Assets/Badges/Badge Kanto ${i}.png" style="width: 40px; height: 40px;" title="Badge ${i}">`;
        }
        badgesHtml += '</div>';
        showModal("Statistics", `
            <div style="text-align: left; display: inline-block;">
                <p><b>Battles Won:</b> ${state.stats.battlesWon}</p>
                <p><b>Total Pokémon Captured:</b> ${state.stats.caught}</p>
                <p><b>Shinies Seen:</b> ${state.stats.shiniesSeen || 0}</p>
                <p><b>Shinies Caught:</b> ${state.stats.shiniesCaught || 0}</p>
                <p><b>Money:</b> $${state.trainer.money}</p>
            </div>
            <h3 style="margin-top: 20px;">Badges:</h3>
            ${badgesHtml}
        `);
    });

    bindBtn('btn-settings', () => {
        if(!checkCombatLock()) showSettings();
    });

    bindBtn('btn-exit', () => {
        if (confirm("Are you sure you want to save and exit?")) {
            if (state.party.length === 0 && state.storage.length === 0) {
                window.close();
            } else {
                storage.save(state);
                window.close(); // Closes the app completely (works in Electron/app context)
            }
        }
    });
}

// Ensure the UI script runs
init();


window.showGameAlert = function(message) {
    let alertBox = document.getElementById('game-alert-toast');
    if (!alertBox) {
        alertBox = document.createElement('div');
        alertBox.id = 'game-alert-toast';
        alertBox.style.position = 'fixed';
        alertBox.style.top = '20px';
        alertBox.style.left = '50%';
        alertBox.style.transform = 'translateX(-50%)';
        alertBox.style.backgroundColor = 'rgba(0, 0, 0, 0.85)';
        alertBox.style.color = '#fff';
        alertBox.style.padding = '15px 30px';
        alertBox.style.borderRadius = '10px';
        alertBox.style.border = '2px solid #3498db';
        alertBox.style.boxShadow = '0 4px 15px rgba(0,0,0,0.5)';
        alertBox.style.zIndex = '9999';
        alertBox.style.fontSize = '18px';
        alertBox.style.fontWeight = 'bold';
        alertBox.style.textAlign = 'center';
        alertBox.style.pointerEvents = 'none';
        alertBox.style.opacity = '0';
        alertBox.style.transition = 'opacity 0.3s ease-in-out';
        document.body.appendChild(alertBox);
    }

    alertBox.innerHTML = message;
    alertBox.style.opacity = '1';

    if (window.gameAlertTimeout) {
        clearTimeout(window.gameAlertTimeout);
    }

    window.gameAlertTimeout = setTimeout(() => {
        alertBox.style.opacity = '0';
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
