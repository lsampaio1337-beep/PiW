import { state, globals } from '../state.js';
import { updateUI, showModal } from '../ui.js';
import * as mathEngine from '../mathEngine.js';

export function showSettings() {
    const battleSystem = globals.battleSystem;
    if (battleSystem && battleSystem.gymState && battleSystem.gymState.isActive) return;

    const speedValues = [0.5, 1, 2, 4, 8, 16, 32, 50, 100, 250, 500, 1000];
    const currentIndex = speedValues.indexOf(state.settings.gameSpeed) !== -1 ? speedValues.indexOf(state.settings.gameSpeed) : 1;
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

        <hr>

        <div style="margin-bottom: 15px; text-align: left; padding: 10px; background: rgba(0,0,0,0.3); border-radius: 5px;">
            <h4>Add Pokemon to Safe</h4>
            <div>
                <label>Number (ID):</label>
                <input type="number" id="add-poke-id" value="1" style="width: 50px;">
                <label>Level:</label>
                <input type="number" id="add-poke-level" value="5" style="width: 50px;">
            </div>
            <div style="margin-top: 5px;">
                <label>QValue:</label>
                <input type="number" step="0.01" id="add-poke-q" value="1.0" style="width: 50px;">
                <label>SumIV:</label>
                <input type="number" id="add-poke-iv" value="150" style="width: 50px;">
            </div>
            <button onclick="window.generatePokemon()" style="margin-top: 10px;">Generate Pokemon</button>
        </div>

        <hr>

        <button onclick="window.exportLog()">Export Save Log</button>
    `;
    showModal("Settings", settingsHTML);
}

export function updateGameSpeed(val) {
    const speedValues = [0.5, 1, 2, 4, 8, 16, 32, 50, 100, 250, 500, 1000];
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

export function generatePokemon() {
    const idEl = document.getElementById('add-poke-id');
    const levelEl = document.getElementById('add-poke-level');
    const qEl = document.getElementById('add-poke-q');
    const ivEl = document.getElementById('add-poke-iv');

    if (!idEl || !levelEl || !qEl || !ivEl) return;

    const id = parseInt(idEl.value);
    const level = parseInt(levelEl.value);
    const qValue = parseFloat(qEl.value);
    const sumIV = parseInt(ivEl.value);

    if (isNaN(id) || isNaN(level) || isNaN(qValue) || isNaN(sumIV)) return;
    if (id < 1 || id > 151) {
        alert("Invalid ID (must be 1-151)");
        return;
    }

    const pData = state.config.pokemonData.find(p => p.id === id);
    if (!pData) {
        alert("Pokemon data not found.");
        return;
    }

    // Randomly distribute SumIV across 6 stats, ensuring max 100 per stat
    let ivsArray = [0, 0, 0, 0, 0, 0];
    let remainingIV = Math.min(sumIV, 600); // hard cap at 600 total

    while (remainingIV > 0) {
        let pool = [];
        for (let i = 0; i < 6; i++) {
            if (ivsArray[i] < 100) pool.push(i);
        }
        if (pool.length === 0) break; // all maxed

        let idx = pool[Math.floor(Math.random() * pool.length)];
        ivsArray[idx]++;
        remainingIV--;
    }

    const ivs = {
        hp: ivsArray[0],
        atk: ivsArray[1],
        def: ivsArray[2],
        spa: ivsArray[3],
        spd: ivsArray[4],
        spe: ivsArray[5]
    };

    const stats = {
        hp: mathEngine.calculateHP(pData.hp, ivs.hp, level, qValue),
        atk: mathEngine.calculateStat(pData.atk, ivs.atk, level, qValue),
        def: mathEngine.calculateStat(pData.def, ivs.def, level, qValue),
        spa: mathEngine.calculateStat(pData.spa, ivs.spa, level, qValue),
        spd: mathEngine.calculateStat(pData.spd, ivs.spd, level, qValue),
        spe: mathEngine.calculateStat(pData.spe, ivs.spe, level, qValue)
    };

    let qName = "Custom";
    if (qValue >= 2.0) {
        qName = "Shiny";
    } else if (qValue >= 1.6) {
        qName = "Epic";
    } else if (qValue >= 1.4) {
        qName = "Rare";
    } else if (qValue >= 1.2) {
        qName = "Uncommon";
    } else if (qValue >= 1.0) {
        qName = "Regular";
    } else {
        qName = "Weak";
    }

    // Assign moves based on level
    let currentMoves = [];
    if (state.config.moves && pData.moves) {
        const movesData = state.config.moves;
        let learned = [];
        Object.keys(pData.moves).forEach(lvl => {
            if (parseInt(lvl) <= level) {
                pData.moves[lvl].forEach(mName => learned.push(mName));
            }
        });
        const recentMoves = learned.slice(-4);
        currentMoves = recentMoves.map(mName => {
            const md = movesData[mName];
            if (!md) return { name: mName, power: 40, type: "Normal", category: "Physical" };
            return {
                name: mName,
                power: md.power || 0,
                type: md.type,
                category: md.category
            };
        });
    }

    const newPokemon = {
        id: pData.id,
        name: pData.name,
        types: pData.types,
        level: level,
        xp: mathEngine.calculateTotalXP(level),
        qualityName: qName,
        quality: qValue,
        ivs: ivs,
        currentStats: stats,
        maxHp: stats.hp,
        currentHp: stats.hp,
        moves: currentMoves.length > 0 ? currentMoves : [{name: "Tackle", power: 40, type: "Normal", category: "Physical"}]
    };

    state.safe.push(newPokemon);
    alert(`Generated Lv.${level} ${pData.name} and added to Safe!`);
    updateUI();
}
