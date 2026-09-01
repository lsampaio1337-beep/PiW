import * as mathEngine from "./mathEngine.js";
import BattleSystem from "./battleSystem.js";
import DayCare from "./dayCare.js";
import Storage from "./storage.js";

// Import State and modules
import { state, setBattleSystem, globals } from './state.js';

export const TYPE_COLORS = {
    "Normal": "#A8A77A",
    "Fire": "#EE8130",
    "Water": "#6390F0",
    "Electric": "#F7D02C",
    "Grass": "#7AC74C",
    "Ice": "#96D9D6",
    "Fighting": "#C22E28",
    "Poison": "#A33EA1",
    "Ground": "#E2BF65",
    "Flying": "#A98FF3",
    "Psychic": "#F95587",
    "Bug": "#A6B91A",
    "Rock": "#B6A136",
    "Ghost": "#735797",
    "Dragon": "#6F35FC",
    "Dark": "#705848",
    "Steel": "#B7B7CE",
    "Fairy": "#D685AD"
};
import { updateTopbar } from './ui/topbar.js';
import { updateSidebar } from './ui/sidebar.js';
import { updateBattleArena, showDamage } from './ui/battle.js';
import { showMap, navigateToLocation, showMapTooltip, hideMapTooltip } from './ui/map.js';
import { showPokedex, showDexEntry } from './ui/pokedex.js';
import { showPokemonStats, evolvePokemon } from './ui/pokemonStats.js';
import { showSettings, updateGameSpeed, addMoney, addXp, exportLog } from './ui/settings.js';
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
window.dragStart = dragStart;
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

export function switchView(viewName) {
    document.querySelectorAll('.game-view').forEach(el => el.style.display = 'none');

    if (viewName === 'PROF_OAK_LAB') {
        document.getElementById('view-prof-oak-lab').style.display = 'block';
    } else if (viewName === 'BATTLE_ARENA') {
        document.getElementById('view-battle-arena').style.display = 'flex';
        document.getElementById('view-battle-arena').style.flexDirection = 'column';
    } else if (viewName === 'POKEMON_CENTER_MARKET') {
        document.getElementById('view-center-market').style.display = 'block';
        setupMarket(document.getElementById('view-center-market'));
    } else if (viewName === 'GYM') {
        document.getElementById('view-gym').style.display = 'block';
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

    // Clear out the starter selection UI since they picked one
    const oakLabDiv = document.getElementById("view-prof-oak-lab");
    if (oakLabDiv) {
        oakLabDiv.innerHTML = `
            <div style="background-color: rgba(0,0,0,0.5); display: inline-block; padding: 10px; margin-top: 50px; border-radius: 8px;">
                <h2>Professor Oak Lab</h2>
                <p>You have received your starter Pokémon! Explore Kanto by opening your Map.</p>
            </div>
        `;
    }

    startGame();
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
        const choice = confirm("Save file found. Do you want to continue?\nClick OK to Continue, Cancel to start a New Game.");
        if (choice) {
            Object.assign(state, saved);
            await loadConfigs();

            // Bypass Oak if player already has Pokemon
            if (state.party.length > 0 || state.storage.length > 0) {
                const oakLabDiv = document.getElementById("view-prof-oak-lab");
                if (oakLabDiv) {
                    oakLabDiv.innerHTML = `
                        <div style="background-color: rgba(0,0,0,0.5); display: inline-block; padding: 10px; margin-top: 50px; border-radius: 8px;">
                            <h2>Professor Oak Lab</h2>
                            <p>You already have your Pokémon! Explore Kanto by opening your Map.</p>
                        </div>
                    `;
                }
            }

            startGame();

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
        } else {
            storage.reset();
            switchView("PROF_OAK_LAB");
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
