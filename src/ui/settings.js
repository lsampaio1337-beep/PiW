import { state, globals } from '../state.js';
import { updateUI, showModal } from '../ui.js';
import * as mathEngine from '../mathEngine.js';

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
            <label for="add-xp-input">Add XP (Slot 1):</label>
            <input type="number" id="add-xp-input" value="1000" style="padding: 5px; width: 80px;">
            <button onclick="window.addXp()" style="padding: 5px 10px; font-size: 14px;">Add</button>
        </div>

        <div style="margin-bottom: 15px;">
            <button onclick="window.showAddPokemonModal()" style="padding: 5px 10px; font-size: 14px;">Add Pokemon</button>
        </div>

        <hr>

        <button onclick="window.exportLog()">Export Save Log</button>
        <button onclick="window.activateCheat()" style="margin-left: 10px; background-color: #c0392b; color: white;">Cheat</button>
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

export function activateCheat() {
    // Set money
    state.trainer.money = 25000000000;

    // Set 1,000,000 of each ball, potion, stone
    for (let key in state.backpack.pokeballs) {
        state.backpack.pokeballs[key] = 1000000;
    }
    for (let key in state.backpack.potions) {
        state.backpack.potions[key] = 1000000;
    }
    for (let key in state.backpack.stones) {
        state.backpack.stones[key] = 1000000;
    }

    // Generate Shiny Mewtwo (ID 150)
    const mewtwoData = state.config.pokemonData.find(p => p.id === 150);
    if (mewtwoData) {
        const level = 100;
        const qName = "Shiny";
        const qVal = 2.0;
        const ivs = { hp: 100, atk: 100, def: 100, spa: 100, spd: 100, spe: 100 };

        const stats = {
            hp: mathEngine.calculateHP(mewtwoData.hp, ivs.hp, level, qVal),
            atk: mathEngine.calculateStat(mewtwoData.atk, ivs.atk, level, qVal),
            def: mathEngine.calculateStat(mewtwoData.def, ivs.def, level, qVal),
            spa: mathEngine.calculateStat(mewtwoData.spa, ivs.spa, level, qVal),
            spd: mathEngine.calculateStat(mewtwoData.spd, ivs.spd, level, qVal),
            spe: mathEngine.calculateStat(mewtwoData.spe, ivs.spe, level, qVal)
        };

        const bst = mewtwoData.hp + mewtwoData.atk + mewtwoData.def + mewtwoData.spa + mewtwoData.spd + mewtwoData.spe;
        const totalIV = 600;

        let learned = [];
        if (mewtwoData.learnset) {
            for (const ls of mewtwoData.learnset) {
                if (level >= ls.level) {
                    if (state.config.moves[ls.move]) {
                        const moveData = JSON.parse(JSON.stringify(state.config.moves[ls.move]));
                        moveData.name = ls.move;
                        learned.push(moveData);
                    }
                }
            }
        }
        const moves = learned.slice(-4);
        const xp = mathEngine.calculateTotalXP(level);

        const createMewtwo = () => {
            return {
                id: mewtwoData.id,
                name: mewtwoData.name,
                types: mewtwoData.types,
                level: level,
                xp: xp,
                qualityName: qName,
                quality: qVal,
                ivs: { ...ivs },
                currentStats: { ...stats },
                maxHp: stats.hp,
                currentHp: stats.hp,
                ev: mathEngine.calculateEV(bst, level, qVal, totalIV),
                bst: bst,
                moves: JSON.parse(JSON.stringify(moves))
            };
        };

        const spaces = 6 - state.party.length;
        if (spaces >= 2) {
            state.party.push(createMewtwo());
            state.party.push(createMewtwo());
        } else if (spaces === 1) {
            state.party.push(createMewtwo());
        }
    }

    updateUI();
    const overlay = document.getElementById('modal-overlay');
    if (overlay) overlay.style.display = 'none';
}
