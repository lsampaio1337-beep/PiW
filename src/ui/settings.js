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
        <button onclick="window.showCheatControlModal()" style="margin-left: 10px; background-color: #c0392b; color: white;">Cheat</button>
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


export function showCheatControlModal() {
    const html = `
        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 10px;">
            <button onclick="window.cheatAddMoney()" style="padding: 10px; font-weight: bold; background-color: #2ecc71; color: white;">Money</button>
            <button onclick="window.cheatNoMoney()" style="padding: 10px; font-weight: bold; background-color: #e74c3c; color: white;">NoMoney</button>
            <button onclick="window.cheatSlot1Xp()" style="padding: 10px; font-weight: bold; background-color: #3498db; color: white;">XP</button>
            <button onclick="window.toggleInfiniteItems()" style="padding: 10px; font-weight: bold; background-color: #9b59b6; color: white;">Infinite items</button>
            <button onclick="window.cheatBuyAllUpgrades()" style="padding: 10px; font-weight: bold; background-color: #f1c40f; color: black;">Upgrades</button>
            <button onclick="window.cheatUnlockMap()" style="padding: 10px; font-weight: bold; background-color: #e67e22; color: white;">Map</button>
            <button onclick="window.cheatPokedex(false)" style="padding: 10px; font-weight: bold; background-color: #34495e; color: white;">Pokedex</button>
            <button onclick="window.cheatPokedex(true)" style="padding: 10px; font-weight: bold; background-color: #bdc3c7; color: black;">PokedexShiny</button>
            <button onclick="window.cheatTimeLapse()" style="padding: 10px; font-weight: bold; background-color: #1abc9c; color: white;">TimeLapse</button>
            <button onclick="window.cheatJigglypuffDust()" style="padding: 10px; font-weight: bold; background-color: #ff9ff3; color: black;">Jigglypuff Dust</button>
            <button onclick="window.cheatAddWhiteCandy()" style="padding: 10px; font-weight: bold; background-color: #ecf0f1; color: black;">Bonus Candy</button>
        </div>
    `;
    showModal("Cheat Control", html, "window-cheat-control", "600px");
}

window.cheatAddMoney = () => {
    state.trainer.money += 1000000000;
    updateUI();
};

window.cheatNoMoney = () => {
    state.trainer.money = 0;
    updateUI();
};

window.cheatSlot1Xp = () => {
    if (state.party.length > 0) {
        const p = state.party[0];
        if (p.level < 100) {
            p.level++;
            p.xp = mathEngine.calculateTotalXP(p.level);

            // Recalculate stats
            const oldMaxHp = p.maxHp;
            const bst = p.bst;
            const totalIV = Object.values(p.ivs).reduce((a, b) => a + b, 0);

            // Need base stats from config
            const pData = state.config.pokemonData.find(x => x.id === p.id);
            if (pData) {
                p.currentStats.hp = mathEngine.calculateHP(pData.hp, p.ivs.hp, p.level, p.quality);
                p.currentStats.atk = mathEngine.calculateStat(pData.atk, p.ivs.atk, p.level, p.quality);
                p.currentStats.def = mathEngine.calculateStat(pData.def, p.ivs.def, p.level, p.quality);
                p.currentStats.spa = mathEngine.calculateStat(pData.spa, p.ivs.spa, p.level, p.quality);
                p.currentStats.spd = mathEngine.calculateStat(pData.spd, p.ivs.spd, p.level, p.quality);
                p.currentStats.spe = mathEngine.calculateStat(pData.spe, p.ivs.spe, p.level, p.quality);
            }

            p.maxHp = p.currentStats.hp;
            p.currentHp = Math.min(p.maxHp, p.currentHp + (p.maxHp - oldMaxHp));
            p.evxp = mathEngine.calculateEVXP(bst, p.level, p.quality, totalIV);
            p.evm = mathEngine.calculateEVM(bst, p.level, p.quality, totalIV);
            p.pp = mathEngine.calculatePP(bst, p.level, p.quality, totalIV);

            updateUI();
        }
    }
};

window.toggleInfiniteItems = () => {
    if (!state.settings) state.settings = {}; // Safety check
    if(!state.settings.infiniteItems) {
        state.settings.infiniteItems = true;
        alert("Infinite items activated");
    } else {
        state.settings.infiniteItems = false;
        alert("Infinite items deactivated");
    }
};

window.cheatBuyAllUpgrades = () => {
    if (!state.stats.upgrades) {
        state.stats.upgrades = { ballsTier: 0, potionsTier: 0, boxTier: 0 };
    }
    state.stats.upgrades.ballsTier = 10;
    state.stats.upgrades.potionsTier = 10;
    state.stats.upgrades.boxTier = 10;

    // Add all market upgrade items directly
    const upgrades = ["Bicycle", "Town Map", "EXP Share", "Catch Charm", "Shiny Charm", "Amulet Coin"];
    if(!state.backpack.upgrades) state.backpack.upgrades = {};
    for(const upg of upgrades) {
        state.backpack.upgrades[upg] = 1;
    }
    updateUI();
};

window.cheatUnlockMap = () => {
    // Complete all challenges
    if(state.config && state.config.unlocks) {
        state.stats.completedChallenges = state.config.unlocks.length;
        state.stats.completedChallengeIds = state.config.unlocks.map(u => u.areaId);
        state.stats.activeChallenges = [];
    }
    updateUI();
};

window.cheatPokedex = (isShiny) => {
    const level = isShiny ? 100 : 1;
    const qName = isShiny ? "Shiny" : "Normal";
    const qVal = isShiny ? 2.0 : (Math.random() * (1.1 - 0.9) + 0.9);

    for (const pData of state.config.pokemonData) {
        if (!pData) continue;

        let ivs;
        if (isShiny) {
            ivs = { hp: 100, atk: 100, def: 100, spa: 100, spd: 100, spe: 100 };
        } else {
            ivs = {
                hp: Math.floor(Math.random() * 101),
                atk: Math.floor(Math.random() * 101),
                def: Math.floor(Math.random() * 101),
                spa: Math.floor(Math.random() * 101),
                spd: Math.floor(Math.random() * 101),
                spe: Math.floor(Math.random() * 101)
            };
        }

        const stats = {
            hp: mathEngine.calculateHP(pData.hp, ivs.hp, level, qVal),
            atk: mathEngine.calculateStat(pData.atk, ivs.atk, level, qVal),
            def: mathEngine.calculateStat(pData.def, ivs.def, level, qVal),
            spa: mathEngine.calculateStat(pData.spa, ivs.spa, level, qVal),
            spd: mathEngine.calculateStat(pData.spd, ivs.spd, level, qVal),
            spe: mathEngine.calculateStat(pData.spe, ivs.spe, level, qVal)
        };

        const bst = pData.hp + pData.atk + pData.def + pData.spa + pData.spd + pData.spe;
        const totalIV = Object.values(ivs).reduce((a, b) => a + b, 0);

        let learned = [];
        if (pData.learnset) {
            for (const ls of pData.learnset) {
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

        const newPokemon = {
            id: pData.id,
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
            moves: JSON.parse(JSON.stringify(moves)),
            uuid: mathEngine.generateUUID()
        };

        // Bypass limits, push straight to storage
        state.storage.push(newPokemon);

        // Pokedex counts
        if (!state.stats.caughtSpecies) state.stats.caughtSpecies = {};
        if (!state.stats.caughtShiniesSpecies) state.stats.caughtShiniesSpecies = {};

        state.stats.caughtSpecies[pData.name] = (state.stats.caughtSpecies[pData.name] || 0) + 1;
        if (isShiny) {
            state.stats.caughtShiniesSpecies[pData.name] = (state.stats.caughtShiniesSpecies[pData.name] || 0) + 1;
        }
    }
    updateUI();
};

window.cheatTimeLapse = () => {
    const html = `
        <div style="text-align: center;">
            <label for="timelapse-hours">How long? (Hours):</label><br><br>
            <input type="number" id="timelapse-hours" value="1" min="0.1" step="0.1" style="width: 100px; padding: 5px;"><br><br>
            <button id="btn-timelapse-confirm" style="padding: 10px 20px; font-weight: bold; background-color: #1abc9c; color: white;">Simulate</button>
        </div>
    `;
    showModal("TimeLapse", html, "window-timelapse-prompt", "300px");

    setTimeout(() => {
        const btn = document.getElementById('btn-timelapse-confirm');
        if (btn) {
            btn.onclick = () => {
                const input = document.getElementById('timelapse-hours');
                const hours = parseFloat(input.value);
                if (!isNaN(hours) && hours > 0) {
                    const timeMs = hours * 3600000;
                    const results = globals.battleSystem.runFastForward(timeMs);

                    // Re-use ZzZ Mode Rewards UI snippet here for convenience
                    let resultsHtml = `<div style="text-align: left; font-size: 14px; max-height: 400px; overflow-y: auto;">
                        <p><b>Simulated Time:</b> ${hours} Hours</p>
                        <p><b>Battles:</b> ${results.battlesCount || 0}</p>
                        <p><b>Pokemon Caught:</b> ${results.caughtCount || 0}</p>
                        <p><b>Shinies Caught:</b> ${results.shinyCaughtCount || 0}</p>
                        <p><b>Faints:</b> ${results.faintsCount || 0}</p>
                        <p><b>Money Earned:</b> $${(results.moneyEarned || 0).toLocaleString()}</p>
                    </div>`;

                    if (results.shinyCaughtNames && results.shinyCaughtNames.length > 0) {
                        resultsHtml += `<div style="margin-top: 10px; text-align: left;">
                            <b>Shinies Caught:</b>
                            <ul style="margin: 5px 0; padding-left: 20px;">`;
                        for (let shinyName of results.shinyCaughtNames) {
                            resultsHtml += `<li>${shinyName}</li>`;
                        }
                        resultsHtml += `</ul></div>`;
                    }

                    if (results.lootDrops && results.lootDrops.length > 0) {
                        resultsHtml += `<div style="margin-top: 10px; text-align: left;">
                            <b>Loot Found:</b>
                            <ul style="margin: 5px 0; padding-left: 20px;">`;
                        for (let drop of results.lootDrops) {
                            resultsHtml += `<li>${drop.qty}x ${drop.name}</li>`;
                        }
                        resultsHtml += `</ul></div>`;
                    }

                    if (window.windowManager) window.windowManager.closeDynamicWindow('window-timelapse-prompt');
                    showModal("TimeLapse Results", resultsHtml, "window-zzz-rewards");
                    updateUI();
                }
            };
        }
    }, 100);
};

window.cheatJigglypuffDust = () => {
    state.stats.jigglypuffGrains = (state.stats.jigglypuffGrains || 0) + 10;
    updateUI();
};

window.cheatAddWhiteCandy = () => {
    state.stats.whiteCandies = (state.stats.whiteCandies || 0) + 10;
    updateUI();
};
