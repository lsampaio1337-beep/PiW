import { state, globals } from '../state.js';
import { updateUI, showModal } from '../ui.js';

export function showSettings() {
    const battleSystem = globals.battleSystem;
    if (battleSystem && battleSystem.gymState && battleSystem.gymState.isActive) return;

    const speedValues = [0.5, 1, 2, 4, 8, 16, 32];
    const currentIndex = speedValues.indexOf(state.settings.gameSpeed) !== -1 ? speedValues.indexOf(state.settings.gameSpeed) : 1;
    const settingsHTML = `
        <div style="margin-bottom: 15px;">
            <label for="speed-slider">Game Speed: <span id="speed-display">${state.settings.gameSpeed}x</span></label><br>
            <input type="range" id="speed-slider" min="0" max="6" step="1" value="${currentIndex}" oninput="window.updateGameSpeed(this.value)">
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

        <hr>

        <button onclick="window.exportLog()">Export Save Log</button>
    `;
    showModal("Settings", settingsHTML);
}

export function updateGameSpeed(val) {
    const speedValues = [0.5, 1, 2, 4, 8, 16, 32];
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
