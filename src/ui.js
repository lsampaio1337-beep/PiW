
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
import { updateBattleArena, showDamage } from './ui/battle.js';
import { showMap, navigateToLocation, showMapTooltip, hideMapTooltip } from './ui/map.js';
import { showPokedex, showDexEntry } from './ui/pokedex.js';
import { showPokemonStats, evolvePokemon } from './ui/pokemonStats.js';
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
    updateUI();
};
window.dragOver = dragOver;
window.handleDrop = handleDrop;
window.showDamage = showDamage;
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

export function showModal(title, htmlContent) {
    let rightCol = document.getElementById('modal-overlay');
    let contentPanel = document.getElementById('content-panel');
    rightCol.style.display = 'flex';
    contentPanel.innerHTML = `<h2>${title}</h2>${htmlContent}<br><br><button onclick="document.getElementById('modal-overlay').style.display='none'">Close</button>`;
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
            return `
                <div style="margin-bottom: 10px;">
                    <span style="color: #ccc; font-style: italic;">Task: Completed</span>
                </div>
            `;
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
    html += renderCard("Quality Tasks", 'q', state.stats.epicCaptures || 0, state.stats.qTaskTier || 0, oakTasks.q, false);

    // Catch Card
    html += renderCard("Catch Tasks", 'c', state.stats.caught || 0, state.stats.cTaskTier || 0, oakTasks.c, false);

    // IV Card
    let ivTier = state.stats.ivTaskTier || 0;
    let ivCurrentVal = 0;
    if (ivTier < oakTasks.iv.length) {
        ivCurrentVal = state.stats[oakTasks.iv[ivTier].stat] || 0;
    } else if (oakTasks.iv.length > 0) {
        ivCurrentVal = state.stats[oakTasks.iv[oakTasks.iv.length - 1].stat] || 0; // fallback if completed
    }
    html += renderCard("IV Tasks", 'iv', ivCurrentVal, ivTier, oakTasks.iv, false);

    // Shiny Card (Combined seen and caught, keeps all rewards but obsolete regular seen shiny is removed by good shiny)
    let seenTier = state.stats.shinySeenTaskTier || 0;
    let caughtTier = state.stats.shinyCaughtTaskTier || 0;

    let shinySeenTaskHtml = renderActiveTask('shinySeen', state.stats.shiniesSeen || 0, seenTier, oakTasks.shinySeen);
    let shinyCaughtTaskHtml = renderActiveTask('shinyCaught', state.stats.shiniesCaught || 0, caughtTier, oakTasks.shinyCaught);

    // Only show "Task: Completed" once if both are done
    if (seenTier >= oakTasks.shinySeen.length && caughtTier >= oakTasks.shinyCaught.length) {
        shinySeenTaskHtml = `
            <div style="margin-bottom: 10px;">
                <span style="color: #ccc; font-style: italic;">Task: Completed</span>
            </div>
        `;
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
            <h3 style="margin-top: 0; margin-bottom: 10px; border-bottom: 1px solid #444; padding-bottom: 5px; font-size: 16px;">Shiny Tasks</h3>
            ${shinySeenTaskHtml}
            ${shinyCaughtTaskHtml}
            ${shinyRewardsHtml}
        </div>
    `;

    html += `</div>`;
    showModal("Oak Lab", html);
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
                <button onclick="window.showOakLabModal()" style="padding: 10px; font-size: 16px; cursor: pointer;">View Tasks & Rewards</button>
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
                } else if (state.currentRoute === "Pokemon Center & Market") {
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
                switchView("PROF_OAK_LAB");
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

    document.getElementById('btn-map').onclick = () => { if(!checkCombatLock()) showMap(); };
    document.getElementById('btn-backpack').onclick = () => { if(!checkCombatLock()) showBackpack(); };
    document.getElementById('btn-dex').onclick = () => { if(!checkCombatLock()) showPokedex(); };

    document.getElementById('btn-stats').onclick = () => {
        if(checkCombatLock()) return;
        let badgesHtml = '<div style="display: flex; gap: 10px; margin-top: 10px;">';
        for (let i = 1; i <= state.trainer.badges; i++) {
            badgesHtml += `<img src="./Assets/Badges/Badge Kanto ${i}.png" style="width: 40px; height: 40px;" title="Badge ${i}">`;
        }
        badgesHtml += '</div>';
        showModal("Statistics", `<p>Battles Won: ${state.stats.battlesWon}</p><p>Total Pokémon Captured: ${state.stats.caught}</p><p>Shinies Seen: ${state.stats.shiniesSeen || 0}</p><p>Money: $${state.trainer.money}</p><h3>Badges:</h3>${badgesHtml}`);
    };

    document.getElementById('btn-settings').onclick = () => {
        if(!checkCombatLock()) showSettings();
    };
}

// Ensure the UI script runs
init();
