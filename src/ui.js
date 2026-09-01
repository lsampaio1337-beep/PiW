
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

export function renderOakLab() {
    const oakLabDiv = document.getElementById("view-prof-oak-lab");
    if (!oakLabDiv) return;

    // Check if player has pokemon
    if (state.party.length === 0 && state.storage.length === 0) {
        return; // still selecting starter, handled in index.html
    }

    const s = state.stats;
    const epicCaps = s.epicCaptures || 0;
    const caught = s.caught || 0;
    const shiniesSeen = s.shiniesSeen || 0;
    const shiniesCaught = s.shiniesCaught || 0;

    let qBoostTier = "None"; let qProg = 0; let qMax = 50;
    if (epicCaps >= 1000) { qBoostTier = "Master (+100%)"; qProg = epicCaps; qMax = 1000; }
    else if (epicCaps >= 500) { qBoostTier = "Excellent (+70%)"; qProg = epicCaps; qMax = 1000; }
    else if (epicCaps >= 250) { qBoostTier = "Good (+45%)"; qProg = epicCaps; qMax = 500; }
    else if (epicCaps >= 100) { qBoostTier = "Regular (+30%)"; qProg = epicCaps; qMax = 250; }
    else if (epicCaps >= 50) { qBoostTier = "Low (+15%)"; qProg = epicCaps; qMax = 100; }
    else { qProg = epicCaps; }

    let catchBoostTier = "None"; let cProg = 0; let cMax = 1000;
    if (caught >= 25000) { catchBoostTier = "Master (+100%)"; cProg = caught; cMax = 25000; }
    else if (caught >= 10000) { catchBoostTier = "Excellent (+70%)"; cProg = caught; cMax = 25000; }
    else if (caught >= 5000) { catchBoostTier = "Good (+45%)"; cProg = caught; cMax = 10000; }
    else if (caught >= 2500) { catchBoostTier = "Regular (+25%)"; cProg = caught; cMax = 5000; }
    else if (caught >= 1000) { catchBoostTier = "Low (+10%)"; cProg = caught; cMax = 2500; }
    else { cProg = caught; }

    const renderBar = (label, current, max, tierText) => {
        const pct = Math.min(100, Math.floor((current / max) * 100));
        return `
            <div style="margin-bottom: 10px; text-align: left;">
                <div style="display: flex; justify-content: space-between; font-size: 12px; margin-bottom: 2px;">
                    <span><b>${label}</b>: ${tierText}</span>
                    <span>${current} / ${max}</span>
                </div>
                <div style="width: 100%; background-color: #333; border-radius: 4px; overflow: hidden; height: 12px; border: 1px solid #555;">
                    <div style="width: ${pct}%; background-color: #4CAF50; height: 100%;"></div>
                </div>
            </div>
        `;
    };

    let ivStatsHtml = `
        <h3 style="margin-top: 15px; border-bottom: 1px solid #555; padding-bottom: 5px;">IV Boosters</h3>
        ${renderBar('IV < 300 (Low +5%)', s.caughtIVUnder300 || 0, 500, (s.caughtIVUnder300||0)>=500 ? "Unlocked" : "Locked")}
        ${renderBar('IV < 350 (Regular +10%)', s.caughtIVUnder350 || 0, 1000, (s.caughtIVUnder350||0)>=1000 ? "Unlocked" : "Locked")}
        ${renderBar('IV < 400 (Good +15%)', s.caughtIVUnder400 || 0, 2500, (s.caughtIVUnder400||0)>=2500 ? "Unlocked" : "Locked")}
        ${renderBar('IV < 450 (Excellent +20%)', s.caughtIVUnder450 || 0, 5000, (s.caughtIVUnder450||0)>=5000 ? "Unlocked" : "Locked")}
        ${renderBar('IV < 500 (Master +25%)', s.caughtIVUnder500 || 0, 10000, (s.caughtIVUnder500||0)>=10000 ? "Unlocked" : "Locked")}
    `;

    let shinyStatsHtml = `
        <h3 style="margin-top: 15px; border-bottom: 1px solid #555; padding-bottom: 5px;">Shiny Boosters</h3>
        ${renderBar('Regular Shiny (+1 Roll)', shiniesSeen, 1, shiniesSeen>=1 ? "Unlocked" : "Locked")}
        ${renderBar('Good Shiny (+2 Rolls)', shiniesSeen, 3, shiniesSeen>=3 ? "Unlocked" : "Locked")}
        ${renderBar('Catch Shiny (4x Rate)', shiniesSeen, 10, shiniesSeen>=10 ? "Unlocked" : "Locked")}
        ${renderBar('Stronger IV (+25%)', shiniesCaught, 5, shiniesCaught>=5 ? "Unlocked" : "Locked")}
    `;

    oakLabDiv.innerHTML = `
        <div style="background-color: rgba(0,0,0,0.85); display: inline-block; padding: 20px; margin-top: 20px; border-radius: 8px; width: 400px; color: white;">
            <h2 style="margin-top:0;">Professor Oak Lab</h2>
            <p style="font-size: 12px; color: #ccc; margin-bottom: 15px;">Track your global capture milestones to unlock permanent bonuses.</p>

            <h3 style="border-bottom: 1px solid #555; padding-bottom: 5px;">Global Boosters</h3>
            ${renderBar('Quality Booster (Epic Caps)', qProg, qMax, qBoostTier)}
            ${renderBar('Catch Rate Booster', cProg, cMax, catchBoostTier)}

            ${shinyStatsHtml}
            ${ivStatsHtml}
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
