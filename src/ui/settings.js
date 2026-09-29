import { VITAMINS } from "../constants.js";
import { state, globals } from '../state.js';
import { updateUI, showModal } from '../ui.js';
import * as mathEngine from '../mathEngine.js';

export function showSettings() {
    const battleSystem = globals.battleSystem;
    if (battleSystem && battleSystem.gymState && battleSystem.gymState.isActive) return;

    const settingsHTML = `
        <button onclick="window.exportLog()">Export Save Log</button>
        <button onclick="window.activateCheat()" style="margin-left: 10px; background-color: #c0392b; color: white;">Cheat</button>
    `;
    showModal("Settings", settingsHTML, "window-settings");
}

export function showTimeLapseModal() {
    const html = `
        <div style="margin-bottom: 15px;">
            <label for="timelapse-duration-input">How long?:</label>
            <input type="number" id="timelapse-duration-input" value="1" min="1" style="padding: 5px; width: 80px;">
            <select id="timelapse-unit-input" style="padding: 5px;">
                <option value="hours">Hours</option>
                <option value="minutes">Minutes</option>
            </select>
        </div>
        <button onclick="window.runTimeLapse()" style="padding: 5px 10px; font-size: 14px;">Start</button>
    `;
    showModal("TimeLapse", html, "window-timelapse");
}

export function runTimeLapse() {
    const inputEl = document.getElementById('timelapse-duration-input');
    const unitEl = document.getElementById('timelapse-unit-input');
    if (!inputEl || !unitEl) return;

    const duration = parseFloat(inputEl.value);
    const unit = unitEl.value;

    if (!isNaN(duration) && duration > 0) {
        // Close modals
        document.getElementById('modal-overlay').style.display = 'none';
        if (window.windowManager) {
            window.windowManager.closeDynamicWindow('window-timelapse');
            window.windowManager.closeDynamicWindow('window-settings');
        }

        let elapsedMs = 0;
        if (unit === 'hours') {
            elapsedMs = duration * 3600 * 1000;
        } else if (unit === 'minutes') {
            elapsedMs = duration * 60 * 1000;
        }

        // Execute TimeLapse Simulation
        if (globals.battleSystem) {
            const results = globals.battleSystem.runFastForward(elapsedMs);

            // Add simulated time to playtime and battle mode timer
            let simulatedSeconds = Math.floor((results.simulatedTimeMs !== undefined ? results.simulatedTimeMs : elapsedMs) / 1000);

            state.stats.playtime = (state.stats.playtime || 0) + simulatedSeconds;
            state.stats.battleModeTimer = (state.stats.battleModeTimer || 0) + simulatedSeconds;

            if (window.updateTopbar) window.updateTopbar();

            window.showTimeLapseResults(results);
        }
    }
}

window.showTimeLapseResults = function(results) {
    let totalSeconds = Math.floor(results.simulatedTimeMs / 1000);
    let h = Math.floor(totalSeconds / 3600);
    let m = Math.floor((totalSeconds % 3600) / 60);
    let s = totalSeconds % 60;

    let timeStr = `${h}h ${m}m ${s}s`;

    // Process Pokemons
    let valPokemonsSold = 0;
    let valShiniesSold = 0;
    if (results.caughtPokemonList) {
        for (let p of results.caughtPokemonList) {
            let sumIV = p.ivs.hp + p.ivs.atk + p.ivs.def + p.ivs.spa + p.ivs.spd + p.ivs.spe;
            let pEv = mathEngine.calculatePP(p.bst, p.level, p.quality, sumIV);
            if (p.qualityName === "Shiny") {
                valShiniesSold += pEv;
            } else {
                valPokemonsSold += pEv;
            }
        }
    }

    // Process Items Looted
    let itemsLootedHtml = "";
    let valItemsLootedSold = 0;
    let valItemsLootedBuy = 0;

    for (let itemName in results.itemsLooted) {
        let count = results.itemsLooted[itemName];
        if (count > 0) {
            let imgFolder = "";
            let basePrice = 0;

            if (state.config.balance.items.pokeballs.find(b => b.name === itemName)) {
                imgFolder = "Balls";
                basePrice = state.config.balance.items.pokeballs.find(b => b.name === itemName).price;
            } else if (state.config.balance.items.potions.find(p => p.name === itemName)) {
                imgFolder = "Potions";
                basePrice = state.config.balance.items.potions.find(p => p.name === itemName).price;
            } else if (VITAMINS.includes(itemName)) {
                imgFolder = "Vitamins";
                basePrice = state.config.balance.items.stones.price * 2;
            } else {
                imgFolder = "Stones";
                basePrice = state.config.balance.items.stones.price;
            }

            itemsLootedHtml += `${count}x <img src="Assets/Items/${imgFolder}/${itemName}.png" style="width: 20px; height: 20px; vertical-align: middle;" title="${itemName}"> / `;

            valItemsLootedBuy += basePrice * count;
            valItemsLootedSold += Math.floor(basePrice * 0.5) * count;
        }
    }
    if (itemsLootedHtml.endsWith(" / ")) itemsLootedHtml = itemsLootedHtml.slice(0, -3);
    if (!itemsLootedHtml) itemsLootedHtml = "None";

    // Process Items Used
    let itemsUsedHtml = "";
    let valItemsUsedBuy = 0;

    if (results.ballsUsed > 0 && state.settings.activeBallTier >= 0) {
        const ballName = state.config.balance.items.pokeballs[state.settings.activeBallTier].name;
        const ballPrice = state.config.balance.items.pokeballs[state.settings.activeBallTier].price;
        itemsUsedHtml += `${results.ballsUsed}x <img src="Assets/Items/Balls/${ballName}.png" style="width: 20px; height: 20px; vertical-align: middle;" title="${ballName}"> / `;
        valItemsUsedBuy += ballPrice * results.ballsUsed;
    }
    if (results.potionsUsed > 0 && state.settings.activePotionTier >= 0) {
        const potionName = state.config.balance.items.potions[state.settings.activePotionTier].name;
        const potionPrice = state.config.balance.items.potions[state.settings.activePotionTier].price;
        itemsUsedHtml += `${results.potionsUsed}x <img src="Assets/Items/Potions/${potionName}.png" style="width: 20px; height: 20px; vertical-align: middle;" title="${potionName}"> / `;
        valItemsUsedBuy += potionPrice * results.potionsUsed;
    }
    if (itemsUsedHtml.endsWith(" / ")) itemsUsedHtml = itemsUsedHtml.slice(0, -3);
    if (!itemsUsedHtml) itemsUsedHtml = "None";

    // Profit Calculations
    let profitSell = results.money + valItemsLootedSold + valPokemonsSold - valItemsUsedBuy;
    let profitBuy = results.money + valItemsLootedBuy + valPokemonsSold - valItemsUsedBuy;

    const html = `
        <div style="text-align: left; padding: 10px; line-height: 1.6;">
            <div><b>Time on hunt:</b> ${timeStr}</div>
            <div><b>Battles:</b> ${results.encounters}</div>
            <div><b>XP earned:</b> ${Math.floor(results.xpEarned).toLocaleString()}</div>
            <div><b>Money earned:</b> $${Math.floor(results.money).toLocaleString()}</div>
            <div><b>Items used:</b> ${itemsUsedHtml}</div>
            <div><b>Pokemons caught:</b> ${results.caught}</div>
            <div><b>Value of Pokemons caught if sold:</b> $${Math.floor(valPokemonsSold).toLocaleString()}</div>
            <div><b>Shiny caught:</b> ${results.shinies}</div>
            <div><b>Value of Shiny Pokemons caught if sold:</b> $${Math.floor(valShiniesSold).toLocaleString()}</div>
            <div><b>Items collected:</b> ${itemsLootedHtml}</div>
            <hr style="border: 1px solid #555; margin: 15px 0;">
            <div><b>Hunt Profit Sell:</b> <span style="color: ${profitSell >= 0 ? '#2ecc71' : '#e74c3c'};">$${Math.floor(profitSell).toLocaleString()}</span></div>
            <div><b>Hunt Profit Buy:</b> <span style="color: ${profitBuy >= 0 ? '#2ecc71' : '#e74c3c'};">$${Math.floor(profitBuy).toLocaleString()}</span></div>
        </div>
    `;
    showModal("TimeLapse Results", html, "window-timelapse-results", "600px");
};

export function showAddPokemonModal() {
    const html = `
        <div style="margin-bottom: 10px;">
            <label style="display:inline-block; width:100px;">Pokemon ID:</label>
            <input type="number" id="force-enc-id" value="1" min="1" max="151" style="width: 80px;">
        </div>
        <div style="margin-bottom: 10px;">
            <label style="display:inline-block; width:100px;">Level:</label>
            <input type="number" id="force-enc-level" value="5" min="1" max="100" style="width: 80px;">
        </div>
        <div style="margin-bottom: 10px;">
            <label style="display:inline-block; width:100px;">QValue:</label>
            <input type="number" id="force-enc-q" value="1.0" step="0.01" style="width: 80px;">
        </div>
        <div style="margin-bottom: 10px;">
            <label style="display:inline-block; width:100px;">SumIV:</label>
            <input type="number" id="force-enc-sumiv" value="300" min="0" max="600" style="width: 80px;">
        </div>
        <button onclick="window.forceNextEncounter()" style="padding: 5px 10px;">OK</button>
    `;
    showModal("Force Next Encounter", html, "window-force-encounter");
}

export function forceNextEncounter() {
    const id = parseInt(document.getElementById('force-enc-id').value);
    const level = parseInt(document.getElementById('force-enc-level').value);
    const qValue = parseFloat(document.getElementById('force-enc-q').value);
    const sumIV = parseInt(document.getElementById('force-enc-sumiv').value);

    state.nextForcedEncounter = {
        id,
        level,
        qValue,
        sumIV
    };

    // Close modal
    document.getElementById('modal-overlay').style.display = 'none';
}

export function exportLog() {
    if (state.storageRef) {
        state.storageRef.exportLog(state);
    }
}

import { showCheatControlModal } from './cheatControl.js';

export function activateCheat() {
    showCheatControlModal();
}