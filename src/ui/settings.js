import { state, globals } from '../state.js';
import { updateUI, showModal } from '../ui.js';

export function showSettings() {
    const battleSystem = globals.battleSystem;
    if (battleSystem && battleSystem.gymState && battleSystem.gymState.isActive) return;

    const speedValues = [0.25, 0.5, 1, 2, 5, 10, 25, 50, 100, 250, 500, 1000];
    const currentIndex = speedValues.indexOf(state.settings.gameSpeed) !== -1 ? speedValues.indexOf(state.settings.gameSpeed) : 2;
    const settingsHTML = `
        <div style="margin-bottom: 15px;">
            <label for="speed-slider">Game Speed: <span id="speed-display">${state.settings.gameSpeed}x</span></label><br>
            <input type="range" id="speed-slider" min="0" max="11" step="1" value="${currentIndex}" oninput="window.updateGameSpeed(this.value)">
        </div>

        <div style="margin-bottom: 15px;">
            <label for="add-money-input">Add Money:</label>
            <input type="number" id="add-money-input" value="1000" style="padding: 5px; width: 80px;">
            <button onclick="window.addMoney()" style="padding: 5px 10px; font-size: 14px;">Add</button>
        </div>

        <div style="margin-bottom: 15px;">
            <label for="add-xp-input">Add XP (Trainer & Slot 1):</label>
            <input type="number" id="add-xp-input" value="1000" style="padding: 5px; width: 80px;">
            <button onclick="window.addXp()" style="padding: 5px 10px; font-size: 14px;">Add</button>
        </div>

        <div style="margin-bottom: 15px;">
            <button onclick="window.showAddPokemonModal()" style="padding: 5px 10px; font-size: 14px;">Add Pokemon</button>
        </div>

        <hr>

        <button onclick="window.exportLog()">Export Save Log</button>
    `;
    showModal("Settings", settingsHTML);
}

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
    showModal("Force Next Encounter", html);
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

export function updateGameSpeed(val) {
    const speedValues = [0.25, 0.5, 1, 2, 5, 10, 25, 50, 100, 250, 500, 1000];
    const speed = speedValues[parseInt(val)];
    state.settings.gameSpeed = speed;
    const display = document.getElementById('speed-display');
    if (display) display.innerText = speed + 'x';
}

export function addMoney() {
    const inputEl = document.getElementById('add-money-input');
    if (!inputEl) return;
    const amount = parseInt(inputEl.value);
    if (!isNaN(amount) && amount > 0) {
        state.trainer.money += amount;
        updateUI();
    }
}

export function addXp() {
    const inputEl = document.getElementById('add-xp-input');
    if (!inputEl) return;
    const amount = parseInt(inputEl.value);
    if (!isNaN(amount) && amount > 0) {
        state.trainer.xp += amount;
        if (state.party.length > 0) {
            state.party[0].xp += amount;
        }
        updateUI();
    }
}

export function exportLog() {
    if (state.storageRef) {
        state.storageRef.exportLog(state);
    }
}
