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
import { updateBattleArena, showDamage, playCaptureAnimation } from './ui/battle.js';

import { showCalendar } from './ui/calendar.js';
import { showMap, navigateToLocation, showMapTooltip, hideMapTooltip } from './ui/map.js';
import { showPokedex, showDexEntry } from './ui/pokedex.js';
import { showPokemonStats, showPokemonStatsByUuid, evolvePokemon } from './ui/pokemonStats.js';
import { showBonusCandyModal } from './ui/bonusCandy.js';
window.showBonusCandyModal = showBonusCandyModal;
import { showSettings, updateGameSpeed, addMoney, addXp, exportLog, showAddPokemonModal, forceNextEncounter, activateCheat } from './ui/settings.js';
import { setupMarket, buyItem } from './ui/market.js';
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
window.playCaptureAnimation = playCaptureAnimation;

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

    startGame();
    renderOakLab(); // Renders the new Oak Lab UI now that we have a party
}

function startGame() {
    let bs = new BattleSystem(state, updateUI);
    setBattleSystem(bs);
    updateUI();
    bs.start();

    // Autosave loop
    setInterval(() => {
        storage.save(state);
    }, 60000);
}

async function init() {
    await loadConfigs();
    const saved = storage.load();

    if (saved) {
        // Show the save prompt modal instead of using confirm()
        const savePrompt = document.getElementById('save-prompt-modal');
        const splashScreen = document.getElementById('splash-screen');

        if (savePrompt && splashScreen) {
            splashScreen.style.display = 'flex';
            savePrompt.style.display = 'block';

            document.getElementById('btn-continue-game').onclick = async () => {
                splashScreen.style.display = 'none';
                savePrompt.style.display = 'none';

                Object.assign(state, saved);
                await loadConfigs();

                startGame();

                // If player already has Pokemon, Oak Lab will render the bonuses next time it's visited.

                // Switch view based on saved route
                if (state.currentRoute === "Professor Oak Lab") {
                    switchView("PROF_OAK_LAB");
                } else if (state.currentRoute === "PokeCenter & PokeMarket" || state.currentRoute === "Pokemon Center & Market") {
                    navigateToLocation(state.currentRoute);
                } else if (state.currentRoute.includes("Gym") || state.currentRoute === "Indigo Plateu") {
                    navigateToLocation(state.currentRoute);
                } else {
                    navigateToLocation(state.currentRoute);
                }
            };

            document.getElementById('btn-new-game').onclick = () => {
                splashScreen.style.display = 'none';
                savePrompt.style.display = 'none';

                storage.reset();
                window.location.reload(); // Actually refresh the page to clear memory state completely
            };
        }
    } else {
        switchView("PROF_OAK_LAB");
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
        if (globals.battleSystem && globals.battleSystem.gymState && globals.battleSystem.gymState.isActive) {
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
}

// Ensure the UI script runs
init();
