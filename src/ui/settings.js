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
            <button onclick="window.showAddPokemonModal()" style="padding: 5px 10px; font-size: 14px;">Add Pokemon</button>
        </div>

        <hr>

        <button onclick="window.exportLog()">Export Save Log</button>
        <button onclick="window.activateCheat()" style="margin-left: 10px; background-color: #c0392b; color: white;">Cheat</button>
    `;
    showModal("Settings", settingsHTML, "window-settings");
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

export function updateGameSpeed(val) {
    const speedValues = [0.25, 0.5, 1, 2, 5, 10, 25, 50, 100, 250, 500, 1000];
    const speed = speedValues[parseInt(val)];
    state.settings.gameSpeed = speed;
    const display = document.getElementById('speed-display');
    if (display) display.innerText = speed + 'x';
}

export function exportLog() {
    if (state.storageRef) {
        state.storageRef.exportLog(state);
    }
}

export function showCheatControl() {
    const isInfiniteItems = state.settings.infiniteItems ? 'ON' : 'OFF';
    const btnStyle = 'padding: 5px 10px; font-size: 14px; margin-bottom: 5px; cursor: pointer; width: 100%; border: none; border-radius: 4px;';

    // Use an alternating layout for the buttons to make it clear what they do
    const html = `
        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 10px; width: 400px; box-sizing: border-box; padding: 10px;">
            <div><button style="${btnStyle} background-color: #2ecc71; color: white;" onclick="window.cheatMoney()">Money ($1B)</button></div>
            <div><button style="${btnStyle} background-color: #e74c3c; color: white;" onclick="window.cheatNoMoney()">NoMoney ($0)</button></div>

            <div><button style="${btnStyle} background-color: #f1c40f; color: black;" onclick="window.cheatXP()">XP (+1 Level Slot 1)</button></div>
            <div><button style="${btnStyle} background-color: #3498db; color: white;" onclick="window.cheatInfiniteItems()" id="btn-cheat-infinite-items">Infinite items (${isInfiniteItems})</button></div>

            <div><button style="${btnStyle} background-color: #9b59b6; color: white;" onclick="window.cheatUpgrades()">Upgrades (Max All)</button></div>
            <div><button style="${btnStyle} background-color: #e67e22; color: white;" onclick="window.cheatMap()">Map (Unlock All)</button></div>

            <div><button style="${btnStyle} background-color: #1abc9c; color: white;" onclick="window.cheatPokedex(false)">Pokedex (Normal)</button></div>
            <div><button style="${btnStyle} background-color: #f39c12; color: white;" onclick="window.cheatPokedex(true)">Pokedex (Shiny)</button></div>

            <div><button style="${btnStyle} background-color: #ff9ff3; color: black;" onclick="window.cheatJigglypuff()">Jigglypuff Dust (+10)</button></div>
            <div><button style="${btnStyle} background-color: #ffffff; color: black; border: 1px solid #bdc3c7;" onclick="window.cheatBonusCandy()">Bonus Candy (+10)</button></div>
        </div>
    `;

    showModal("Cheat Control", html, "window-cheat-control");
}

export function activateCheat() {
    // Close the settings modal first
    const overlay = document.getElementById('modal-overlay');
    if (overlay) overlay.style.display = 'none';

    // Show the new Cheat Control window
    showCheatControl();
}

window.cheatMoney = function() {
    state.trainer.money += 1000000000;
    updateUI();
};

window.cheatNoMoney = function() {
    state.trainer.money = 0;
    updateUI();
};

window.cheatXP = function() {
    if (state.party.length > 0) {
        const p = state.party[0];
        const nextLevelXp = mathEngine.calculateTotalXP(p.level + 1);
        const currentXp = p.xp;
        const xpNeeded = nextLevelXp - currentXp;
        if (xpNeeded > 0) {
            p.xp += xpNeeded; // Add exactly enough XP to level up
            state.trainer.xp += xpNeeded;
            p.level = mathEngine.getLevelFromXP(p.xp);
        }
        updateUI();
    }
};

window.cheatInfiniteItems = function() {
    state.settings.infiniteItems = !state.settings.infiniteItems;
    const btn = document.getElementById('btn-cheat-infinite-items');
    if (btn) {
        btn.innerText = `Infinite items (${state.settings.infiniteItems ? 'ON' : 'OFF'})`;
    }
};

window.cheatUpgrades = function() {
    // Max out existing known upgrades
    if (state.config.balance.expansions) {
        if (state.config.balance.expansions.ballPocket) {
            state.stats.upgrades.ballsTier = state.config.balance.expansions.ballPocket.length - 1;
        }
        if (state.config.balance.expansions.potionSatchel) {
            state.stats.upgrades.potionsTier = state.config.balance.expansions.potionSatchel.length - 1;
        }
        if (state.config.balance.expansions.pokemonBox) {
            state.stats.upgrades.boxTier = state.config.balance.expansions.pokemonBox.length - 1;
        }

        // Buy all other expansions that might exist in the config
        for (let key in state.config.balance.expansions) {
            if (key !== 'ballPocket' && key !== 'potionSatchel' && key !== 'pokemonBox') {
                 // For any other dynamic expansions that were added
                 let tierKey = key.replace(/([a-z])([A-Z])/g, '$1_$2').split('_')[0] + 'Tier';
                 if (state.stats.upgrades[tierKey] !== undefined) {
                     state.stats.upgrades[tierKey] = state.config.balance.expansions[key].length - 1;
                 } else {
                     // Try directly or fallback
                     state.stats.upgrades[key + 'Tier'] = state.config.balance.expansions[key].length - 1;
                 }
            }
        }
    }
    updateUI();
};

window.cheatMap = function() {
    if (state.config.unlocks) {
        for (const unlock of state.config.unlocks) {
            window.completeChallenge(unlock.areaId);
        }
    }
    updateUI();
};

window.cheatPokedex = function(isShiny) {
    for (let i = 1; i <= 150; i++) {
        const pData = state.config.pokemonData.find(p => p.id === i);
        if (pData) {
            const level = isShiny ? 100 : 1;
            const qName = isShiny ? "Shiny" : "Regular";
            const qVal = isShiny ? 2.0 : (Math.random() * (1.19 - 1.00) + 1.00); // Random Regular Q

            const ivs = isShiny ? { hp: 100, atk: 100, def: 100, spa: 100, spd: 100, spe: 100 } :
                {
                    hp: Math.floor(Math.random() * 100),
                    atk: Math.floor(Math.random() * 100),
                    def: Math.floor(Math.random() * 100),
                    spa: Math.floor(Math.random() * 100),
                    spd: Math.floor(Math.random() * 100),
                    spe: Math.floor(Math.random() * 100)
                };

            const stats = {
                hp: mathEngine.calculateHP(pData.hp, ivs.hp, level, qVal),
                atk: mathEngine.calculateStat(pData.atk, ivs.atk, level, qVal),
                def: mathEngine.calculateStat(pData.def, ivs.def, level, qVal),
                spa: mathEngine.calculateStat(pData.spa, ivs.spa, level, qVal),
                spd: mathEngine.calculateStat(pData.spd, ivs.spd, level, qVal),
                spe: mathEngine.calculateStat(pData.spe, ivs.spe, level, qVal)
            };

            const bst = pData.hp + pData.atk + pData.def + pData.spa + pData.spd + pData.spe;
            const totalIV = ivs.hp + ivs.atk + ivs.def + ivs.spa + ivs.spd + ivs.spe;

            let learned = [];
            if (pData.learnset) {
                for (const ls of pData.learnset) {
                    if (level >= ls.level) {
                        if (state.config.moves && state.config.moves[ls.move]) {
                            const moveData = JSON.parse(JSON.stringify(state.config.moves[ls.move]));
                            moveData.name = ls.move;
                            learned.push(moveData);
                        }
                    }
                }
            }
            const moves = learned.slice(-4);
            const xp = mathEngine.calculateTotalXP(level);

            const caughtPokemon = {
                id: pData.id,
                uuid: 'cheat_' + Date.now() + '_' + i,
                name: pData.name,
                types: pData.types,
                level: level,
                xp: xp,
                qualityName: qName,
                quality: qVal,
                ivs: { ...ivs },
                currentStats: { ...stats },
                maxHp: stats.hp,
                currentHp: stats.hp,
                evxp: mathEngine.calculateEVXP(bst, level, qVal, totalIV),
                evm: mathEngine.calculateEVM(bst, level, qVal, totalIV),
                pp: mathEngine.calculatePP(bst, level, qVal, totalIV),
                bst: bst,
                moves: JSON.parse(JSON.stringify(moves))
            };

            state.storage.push(caughtPokemon);

            // Also register in Pokedex counts
            if (!state.stats.caughtSpecies) state.stats.caughtSpecies = {};
            state.stats.caughtSpecies[pData.name] = (state.stats.caughtSpecies[pData.name] || 0) + 1;

            if (isShiny) {
                if (!state.stats.caughtShiniesSpecies) state.stats.caughtShiniesSpecies = {};
                state.stats.caughtShiniesSpecies[pData.name] = (state.stats.caughtShiniesSpecies[pData.name] || 0) + 1;
                state.stats.shiniesCaught = (state.stats.shiniesCaught || 0) + 1;
            }

            state.stats.caught++;
        }
    }
    updateUI();
};

window.cheatJigglypuff = function() {
    state.stats.jigglypuffGrains = (state.stats.jigglypuffGrains || 0) + 10;
    updateUI();
};

window.cheatBonusCandy = function() {
    state.stats.whiteCandies = (state.stats.whiteCandies || 0) + 10;
    updateUI();
};
