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
            <label for="add-xp-input">Add XP (Trainer & Slot 1):</label>
            <input type="number" id="add-xp-input" value="1000" style="padding: 5px; width: 80px;">
            <button onclick="window.addXp()" style="padding: 5px 10px; font-size: 14px;">Add</button>
        </div>

        <div style="margin-bottom: 15px;">
            <button onclick="window.showAddPokemonModal()" style="padding: 5px 10px; font-size: 14px;">Add Pokemon</button>
        </div>

        <hr>

        <button onclick="window.exportLog()">Export Save Log</button>
        <button onclick="window.activateCheat()" style="margin-left: 10px; background-color: #c0392b; color: white;">Cheat</button>
        <button onclick="window.showTimeLapseModal()" style="margin-left: 10px; background-color: #8e44ad; color: white;">TimeLapse</button>
    `;
    showModal("Settings", settingsHTML, "window-settings");
}

export function showTimeLapseModal() {
    const html = `
        <div style="margin-bottom: 15px;">
            <label for="timelapse-hours-input">How long? (Hours):</label>
            <input type="number" id="timelapse-hours-input" value="1" min="1" style="padding: 5px; width: 80px;">
        </div>
        <button onclick="window.runTimeLapse()" style="padding: 5px 10px; font-size: 14px;">Start</button>
    `;
    showModal("TimeLapse", html, "window-timelapse");
}

export function runTimeLapse() {
    const inputEl = document.getElementById('timelapse-hours-input');
    if (!inputEl) return;
    const hours = parseFloat(inputEl.value);
    if (!isNaN(hours) && hours > 0) {
        // Close modals
        document.getElementById('modal-overlay').style.display = 'none';
        if (window.windowManager) {
            window.windowManager.closeDynamicWindow('window-timelapse');
            window.windowManager.closeDynamicWindow('window-settings');
        }

        const elapsedMs = hours * 3600 * 1000;

        // Execute TimeLapse Simulation
        if (globals.battleSystem) {
            const results = globals.battleSystem.runFastForward(elapsedMs);
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
            let pEv = p.pp;
            if (pEv === undefined) {
                let sumIV = p.ivs.hp + p.ivs.atk + p.ivs.def + p.ivs.spa + p.ivs.spd + p.ivs.spe;
                pEv = mathEngine.calculatePP(p.bst, p.level, p.quality, sumIV);
            }
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
                evxp: mathEngine.calculateEVXP(bst, level, qVal, totalIV),
                evm: mathEngine.calculateEVM(bst, level, qVal, totalIV),
                pp: mathEngine.calculatePP(bst, level, qVal, totalIV),
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