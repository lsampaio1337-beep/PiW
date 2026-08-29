// src/ui.js


import * as mathEngine from "./mathEngine.js";
import BattleSystem from "./battleSystem.js";
import DayCare from "./dayCare.js";
import Storage from "./storage.js";

// Global State
const state = {
    trainer: {
        level: 1,
        xp: 0,
        money: 0,
        badges: 0
    },
    party: [],
    box: [],
    storage: [],
    safe: [],
    breeding: [],
    training: [],
    backpack: {
        pokeballs: { "Pokeball": 100, "Greatball": 0, "Ultraball": 0, "Safariball": 0, "Masterball": 0 },
        potions: { "Tiny Potion": 100, "Small Potion": 0, "Regular Potion": 0, "Big Potion": 0, "Hyper Potion": 0, "Ultimate Potion": 0 },
        stones: {
            "Normal Stone": 0, "Fire Stone": 0, "Water Stone": 0, "Grass Stone": 0,
            "Electric Stone": 0, "Ice Stone": 0, "Fighting Stone": 0, "Poison Stone": 0,
            "Ground Stone": 0, "Flying Stone": 0, "Psychic Stone": 0, "Bug Stone": 0,
            "Rock Stone": 0, "Ghost Stone": 0, "Dragon Stone": 0, "Steel Stone": 0,
            "Dark Stone": 0, "Fairy Stone": 0
        }
    },
    stats: {
        battlesWon: 0,
        caught: 0,
        shiniesSeen: 0,
        shiniesCaught: 0,
        playtime: 0
    },
    settings: {
        gameSpeed: 1.0,
        autoPotion: true,
        activePotionTier: 0, // Tiny
        autoCatch: true,
        activeBallTier: 0 // Pokeball
    },
    currentRoute: "Route 1",
    config: {}
};

const storage = new Storage();
const dayCare = new DayCare(state);
let battleSystem;

// Init
function showPokedex() {
    let html = `<h2>Pokedex</h2><p>Caught: ${state.stats.caught} / 150</p><p>Shinies Seen: ${state.stats.shiniesSeen || 0}</p><div style="display:flex; flex-wrap:wrap; max-height:400px; overflow-y:auto; gap:10px;">`;

    // Assumes state.config.pokemonData is available or we load it
    // Wait, pokemonData is imported in init() and not saved to state. We should save it to state in init.
    if (!state.config.pokemonData) {
        html += "<p>Loading Pokedex data...</p>";
    } else {
        // Iterate up to 150
        for(let i = 1; i <= 150; i++) {
            const pData = state.config.pokemonData.find(p => p.id === i);
            if (!pData) continue;

            // Check if seen (we assume "caught" logic or we need to track "seen".
            // The prompt says "When that pokemon is encountered it gains color".
            // Let's check state.stats.caughtSpecies which we added earlier.
            // If we haven't encountered it yet, it's a silhouette.
            const hasEncountered = (state.stats.seenSpecies && state.stats.seenSpecies[pData.name]) || (state.stats.caughtSpecies && state.stats.caughtSpecies[pData.name]) ||
                                   state.party.some(p => p.id === i) ||
                                   state.box.some(p => p.id === i) ||
                                   false;

            let filter = hasEncountered ? "none" : "brightness(0)";
            let cursor = hasEncountered ? "pointer" : "default";
            let onClick = hasEncountered ? `onclick="window.showDexEntry(${i})"` : "";

            html += `<div style="width: 60px; text-align: center; font-size: 10px;">
                <div style="font-weight:bold;">#${i}</div>
                <img src="Assets/Pokemon Sprites/${i}.png" style="width: 50px; height: 50px; filter: ${filter}; cursor: ${cursor};" ${onClick}>
            </div>`;
        }
    }

    html += `</div>`;
    showModal("Pokedex", html);
}

window.showDexEntry = (id) => {
    const pData = state.config.pokemonData.find(p => p.id === id);
    if (!pData) return;

    const bst = pData.hp + pData.atk + pData.def + pData.spa + pData.spd + pData.spe;

    // Calculate Type Effectiveness
    const tConfig = state.config.types;
    let weaknesses = {};
    let resistances = {};
    let immunities = {};
    let effective = {};
    let notEffective = {};
    let noEffect = {};

    // Defending Matchups (Weakness, Resistance, Immune)
    for (const atkType in tConfig) {
        let multiplier = 1;
        for (const defType of pData.types) {
            if (tConfig[atkType] && tConfig[atkType][defType] !== undefined) {
                multiplier *= tConfig[atkType][defType];
            }
        }
        if (multiplier > 1) weaknesses[atkType] = multiplier;
        else if (multiplier < 1 && multiplier > 0) resistances[atkType] = multiplier;
        else if (multiplier === 0) immunities[atkType] = multiplier;
    }

    // Attacking Matchups (Effective, Not Effective, No Effect)
    for (const defType in tConfig) {
        let maxMult = 0;
        for (const atkType of pData.types) {
            let m = 1;
            if (tConfig[atkType] && tConfig[atkType][defType] !== undefined) {
                m = tConfig[atkType][defType];
            }
            if (m > maxMult) maxMult = m;
        }
        if (maxMult > 1) effective[defType] = maxMult;
        else if (maxMult < 1 && maxMult > 0) notEffective[defType] = maxMult;
        else if (maxMult === 0) noEffect[defType] = maxMult;
    }

    const formatTypes = (obj) => Object.keys(obj).length ? Object.keys(obj).join(', ') : 'None';

    // Evolution Line
    let evolveHtml = "";
    if (pData.evolutions && pData.evolutions.length > 0) {
        let evolutionsList = pData.evolutions.map(evo => {
            const nextPData = state.config.pokemonData.find(pd => pd.id === evo.to);
            return `Evolves into <b>${nextPData ? nextPData.name : 'Unknown'}</b> at level ${evo.level}`;
        }).join('<br>');
        evolveHtml = `<div style="text-align: left; margin: 15px 0; font-size: 14px; background: rgba(0,0,0,0.5); padding: 10px; border-radius: 5px;">
            <h4 style="margin: 0 0 5px 0;">Evolution</h4>
            ${evolutionsList}
        </div>`;
    }

    // Moveset Table
    let movesHtml = `
        <table style="width: 100%; border-collapse: collapse; text-align: left; margin-top: 10px; font-size: 12px;">
            <tr style="border-bottom: 1px solid #777;">
                <th>Lvl</th><th>Move Name</th><th>Type</th><th>Power</th><th>Category</th>
            </tr>
    `;
    if (pData.learnset) {
        pData.learnset.forEach(m => {
            let mData = state.config.moves[m.move];
            movesHtml += `<tr style="border-bottom: 1px solid #444;">
                <td>${m.level}</td>
                <td>${m.move}</td>
                <td>${mData ? mData.type : '?'}</td>
                <td>${mData ? mData.power : '?'}</td>
                <td>${mData ? mData.category : '?'}</td>
            </tr>`;
        });
    }
    movesHtml += `</table>`;

    const html = `
        <div style="text-align:center; max-height: 80vh; overflow-y: auto;">
            <h2>#${pData.id} ${pData.name}</h2>
            <img id="dex-sprite" src="Assets/Pokemon Sprites/${pData.id}.png" style="width: 100px; height: 100px;">
            <div>
                <button onclick="document.getElementById('dex-sprite').src = 'Assets/Pokemon Sprites/${pData.id}_shiny.png'">Shiny</button>
                <button onclick="document.getElementById('dex-sprite').src = 'Assets/Pokemon Sprites/${pData.id}.png'">Normal</button>
            </div>

            <p><b>Type:</b> ${pData.types.join(' / ')}</p>
            <p><b>BST:</b> ${bst} (HP:${pData.hp} A:${pData.atk} D:${pData.def} SA:${pData.spa} SD:${pData.spd} S:${pData.spe})</p>

            <div style="text-align: left; margin: 15px 0; font-size: 14px; background: rgba(0,0,0,0.5); padding: 10px; border-radius: 5px;">
                <h4 style="margin: 0 0 5px 0;">Defensive Effectiveness (Receiving)</h4>
                ${Object.keys(weaknesses).length ? `<b>Weak To:</b> ${formatTypes(weaknesses)}<br>` : ''}
                ${Object.keys(resistances).length ? `<b>Resists:</b> ${formatTypes(resistances)}<br>` : ''}
                ${Object.keys(immunities).length ? `<b>Immune To:</b> ${formatTypes(immunities)}<br>` : ''}

                <h4 style="margin: 10px 0 5px 0;">Offensive Effectiveness (Attacking)</h4>
                ${Object.keys(effective).length ? `<b>Super Effective Against:</b> ${formatTypes(effective)}<br>` : ''}
                ${Object.keys(notEffective).length ? `<b>Not Very Effective Against:</b> ${formatTypes(notEffective)}<br>` : ''}
                ${Object.keys(noEffect).length ? `<b>No Effect Against:</b> ${formatTypes(noEffect)}<br>` : ''}
            </div>

            ${evolveHtml}

            <h4 style="text-align: left;">Moveset</h4>
            ${movesHtml}

            <br><br>
            <button onclick="document.getElementById('btn-dex').click()">Back to Pokedex</button>
        </div>
    `;

    showModal("Pokedex Entry", html);
};

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
        } else {
            storage.reset();
            switchView("PROF_OAK_LAB");
        }
    } else {
        switchView("PROF_OAK_LAB");
    }

    // Bind buttons
    document.getElementById('choose-bulbasaur').onclick = () => selectStarter(1);
    document.getElementById('choose-charmander').onclick = () => selectStarter(4);
    document.getElementById('choose-squirtle').onclick = () => selectStarter(7);

    // Bind Hub Buttons
    document.getElementById('btn-map').onclick = () => showMap();
    document.getElementById('btn-backpack').onclick = showBackpack;
    document.getElementById('btn-dex').onclick = showPokedex;
    document.getElementById('btn-stats').onclick = () => {
    let badgesHtml = '<div style="display: flex; gap: 10px; margin-top: 10px;">';
    for (let i = 1; i <= state.trainer.badges; i++) {
        badgesHtml += `<img src="./Assets/Badges/Badge Kanto ${i}.png" style="width: 40px; height: 40px;" title="Badge ${i}">`;
    }
    badgesHtml += '</div>';
    showModal("Statistics", `<p>Battles Won: ${state.stats.battlesWon}</p><p>Money: $${state.trainer.money}</p><h3>Badges:</h3>${badgesHtml}`);
};
    document.getElementById('btn-settings').onclick = () => {
        const speedValues = [0.5, 1, 2, 4, 8, 16, 32];
        const currentIndex = speedValues.indexOf(state.settings.gameSpeed) !== -1 ? speedValues.indexOf(state.settings.gameSpeed) : 1;
        const settingsHTML = `
            <div style="margin-bottom: 15px;">
                <label for="speed-slider">Game Speed: <span id="speed-display">${state.settings.gameSpeed}x</span></label><br>
                <input type="range" id="speed-slider" min="0" max="6" step="1" value="${currentIndex}" oninput="updateGameSpeed(this.value)">
            </div>

            <div style="margin-bottom: 15px;">
                <label for="add-money-input">Add Money:</label>
                <input type="number" id="add-money-input" placeholder="Amount">
                <button onclick="addMoney()">OK</button>
            </div>

            <div style="margin-bottom: 15px;">
                <label for="add-xp-input">Add XP (Trainer & Slot 1):</label>
                <input type="number" id="add-xp-input" placeholder="Amount">
                <button onclick="addXp()">OK</button>
            </div>

            <hr>

            <button onclick="exportLog()">Export Save Log</button>
        `;
        showModal("Settings", settingsHTML);
    };
}


window.showBackpack = function() {
    let rightCol = document.getElementById('modal-overlay');
    let contentPanel = document.getElementById('content-panel');
    rightCol.style.display = 'flex';

    const formatQuantity = (q) => {
        if (q >= 1000000) return Math.floor(q / 1000000) + 'm';
        if (q >= 1000) return Math.floor(q / 1000) + 'k';
        return q;
    };

    let html = `
        <div style="position: relative; background-image: url('./Assets/Extra/Backpack.png'); background-size: contain; background-repeat: no-repeat; background-position: center top; padding: 20px; border-radius: 8px; min-height: 600px; color: white;">

            <div onclick="document.getElementById('backpack-content-area').style.display='none'" style="position: absolute; top:0; left:0; width:100%; height:100%; z-index: 1;"></div>

            <!-- Close Button Overlay -->
            <div style="position: absolute; top: 10px; right: 10px; z-index: 10;">
                <button onclick="document.getElementById('modal-overlay').style.display='none'" style="background: #e74c3c; color: white; border: none; padding: 5px 10px; border-radius: 5px; cursor: pointer;">X</button>
            </div>

            <!-- Clickable Pockets Overlay -->
            <!-- Note: Exact coordinates might need fine-tuning based on actual image aspect ratio, but we place them generally to be responsive -->
            <div style="position: absolute; top: 0; left: 0; width: 100%; height: 100%; z-index: 2;">
                <!-- Purple Pokeballs Pocket -->
                <div onclick="renderBackpackTab('pokeballs')" style="position: absolute; top: 25%; left: 20%; width: 25%; height: 25%; cursor: pointer; border-radius: 50%;"></div>

                <!-- Yellow Pokemon Pocket -->
                <div onclick="renderBackpackTab('pokemon')" style="position: absolute; top: 25%; right: 20%; width: 25%; height: 25%; cursor: pointer; border-radius: 50%;"></div>

                <!-- Green Potions Pocket -->
                <div onclick="renderBackpackTab('potions')" style="position: absolute; top: 55%; left: 20%; width: 25%; height: 25%; cursor: pointer; border-radius: 50%;"></div>

                <!-- Cyan Stones Pocket -->
                <div onclick="renderBackpackTab('stones')" style="position: absolute; top: 55%; right: 20%; width: 25%; height: 25%; cursor: pointer; border-radius: 50%;"></div>
            </div>

            <!-- Content Area - We'll position it at the bottom with a solid background so it overlaps gracefully -->
            <div id="backpack-content-area" style="position: absolute; bottom: 20px; left: 5%; width: 90%; background: rgba(0,0,0,0.85); padding: 15px; border-radius: 5px; min-height: 250px; z-index: 5; display: none;">
                <button onclick="document.getElementById('backpack-content-area').style.display='none'" style="position: absolute; top: 5px; right: 5px; background: #e74c3c; color: white; border: none; padding: 2px 6px; border-radius: 3px; cursor: pointer;">X</button>
                <!-- Content gets rendered here -->
                <h3 style="text-align: center; margin-top: 0; color: #ddd;">Select a pocket to view items.</h3>
            </div>
        </div>
    `;
    contentPanel.innerHTML = html;
};

window.renderBackpackTab = function renderBackpackTab(tab) {
    const area = document.getElementById('backpack-content-area');
    if (!area) return;
    area.style.display = "block";

    const formatQuantity = (q) => {
        if (q >= 1000000) return Math.floor(q / 1000000) + 'm';
        if (q >= 1000) return Math.floor(q / 1000) + 'k';
        return q;
    };

    let content = '';

    if (tab === 'pokeballs') {
        content += '<div style="display: flex; flex-wrap: wrap; gap: 20px; justify-content: center;">';
        for (const [name, qty] of Object.entries(state.backpack.pokeballs)) {
            content += `
                <div style="text-align: center; width: 80px;">
                    <img src="./Assets/Items/Balls/${name}.png" style="width: 50px; height: 50px;" onerror="this.src='data:image/gif;base64,R0lGODlhAQABAAD/ACwAAAAAAQABAAACADs='">
                    <br><span style="font-size: 12px;">${name}</span>
                    <br><b>x${formatQuantity(qty)}</b>
                </div>
            `;
        }
        content += '</div>';
    } else if (tab === 'potions') {
        content += '<div style="display: flex; flex-wrap: wrap; gap: 20px; justify-content: center;">';
        for (const [name, qty] of Object.entries(state.backpack.potions)) {
            content += `
                <div style="text-align: center; width: 80px;">
                    <img src="./Assets/Items/Potions/${name}.png" style="width: 50px; height: 50px;" onerror="this.src='data:image/gif;base64,R0lGODlhAQABAAD/ACwAAAAAAQABAAACADs='">
                    <br><span style="font-size: 12px;">${name}</span>
                    <br><b>x${formatQuantity(qty)}</b>
                </div>
            `;
        }
        content += '</div>';
    } else if (tab === 'stones') {
        content += '<div style="display: flex; flex-wrap: wrap; gap: 20px; justify-content: center;">';
        for (const [name, qty] of Object.entries(state.backpack.stones)) {
            content += `
                <div style="text-align: center; width: 80px;">
                    <img src="./Assets/Items/Stones/${name}.png" style="width: 50px; height: 50px;" onerror="this.src='data:image/gif;base64,R0lGODlhAQABAAD/ACwAAAAAAQABAAACADs='">
                    <br><span style="font-size: 12px;">${name}</span>
                    <br><b>x${formatQuantity(qty)}</b>
                </div>
            `;
        }
        content += '</div>';
    } else if (tab === 'pokemon') {
        content += `
            <div style="display: flex; gap: 10px; width: 100%;">
                <!-- Column 1: Party (6 max normally, but 4x2 slots requested means 8 total slots here for Party, Breeding, Training) -->
                <div style="flex: 1; border: 1px solid #555; padding: 5px; min-height: 200px;">
                    <h4 style="text-align: center; margin-top:0;">Active (Party/Breed/Train)</h4>
                    <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 5px;">
        `;

        // Let's create an array of 8 slots for column 1
        const activePokemon = [];
        state.party.forEach((p, idx) => activePokemon.push({...p, _tag: 'Party', _origIndex: idx}));
        state.breeding.forEach((p, idx) => activePokemon.push({...p, _tag: 'Breeding', _origIndex: idx}));
        state.training.forEach((p, idx) => activePokemon.push({...p, _tag: 'Training', _origIndex: idx}));

        for (let i = 0; i < 8; i++) {
            if (i < activePokemon.length) {
                let p = activePokemon[i];
                let imgSrc = `Assets/Pokemon Sprites/${p.qualityName === 'Shiny' ? p.id + '_shiny' : p.id}.png`;
                let sumIV = p.ivs.hp + p.ivs.atk + p.ivs.def + p.ivs.spa + p.ivs.spd + p.ivs.spe;
                content += `
                    <div style="border: 1px solid #777; height: 60px; text-align: center; cursor: move; position: relative;" title="Q=${p.quality.toFixed(2)} & ∑IV=${sumIV}" draggable="true" ondragstart="dragStart(event, '${p._tag}', ${p._origIndex})">
                        <span style="position: absolute; top: 0; left: 0; font-size: 8px; background: black; padding: 1px;">${p._tag}</span>
                        <img src="${imgSrc}" style="max-height: 40px; max-width: 40px;" onerror="this.src='data:image/gif;base64,R0lGODlhAQABAAD/ACwAAAAAAQABAAACADs='">
                        <div style="font-size: 10px;">Lv.${p.level}</div>
                        <div onclick="event.stopPropagation(); window.showPokemonStats(${p._origIndex}, '${p._tag.toLowerCase()}')" style="position: absolute; top: 2px; right: 2px; cursor: pointer; background: #34495e; color: white; border-radius: 50%; width: 14px; height: 14px; text-align: center; line-height: 14px; font-size: 10px; font-weight: bold;" title="View Info">i</div>
                    </div>
                `;
            } else {
                content += `<div ondragover="dragOver(event)" ondrop="handleDrop(event, 'party')" style="border: 1px dashed #777; height: 60px;"></div>`;
            }
        }

        content += `
                    </div>
                </div>

                <!-- Column 2: Storage (6xn) -->
                <div ondragover="dragOver(event)" ondrop="handleDrop(event, 'storage')" style="flex: 1; border: 1px solid #555; padding: 5px; min-height: 200px;">
                    <h4 style="text-align: center; margin-top:0;">Storage</h4>
                    <div style="display: grid; grid-template-columns: repeat(2, 1fr); gap: 5px; max-height: 250px; overflow-y: auto;">
        `;

        // Show storage + 1 empty slot
        for (let i = 0; i <= state.storage.length; i++) {
            if (i < state.storage.length) {
                let p = state.storage[i];
                let imgSrc = `Assets/Pokemon Sprites/${p.qualityName === 'Shiny' ? p.id + '_shiny' : p.id}.png`;
                let sumIV = p.ivs.hp + p.ivs.atk + p.ivs.def + p.ivs.spa + p.ivs.spd + p.ivs.spe;
                content += `
                    <div style="border: 1px solid #777; height: 60px; text-align: center; cursor: move; position: relative;" title="Q=${p.quality.toFixed(2)} & ∑IV=${sumIV}" draggable="true" ondragstart="dragStart(event, 'storage', ${i})">
                        <img src="${imgSrc}" style="max-height: 40px; max-width: 40px;" onerror="this.src='data:image/gif;base64,R0lGODlhAQABAAD/ACwAAAAAAQABAAACADs='">
                        <div style="font-size: 10px;">Lv.${p.level}</div>
                        <div onclick="event.stopPropagation(); window.showPokemonStats(${i}, 'storage')" style="position: absolute; top: 2px; right: 2px; cursor: pointer; background: #34495e; color: white; border-radius: 50%; width: 14px; height: 14px; text-align: center; line-height: 14px; font-size: 10px; font-weight: bold;" title="View Info">i</div>
                    </div>
                `;
            } else {
                content += `<div style="border: 1px dashed #777; height: 60px; display: flex; align-items: center; justify-content: center; font-size: 20px;" title="Empty Slot">+</div>`;
            }
        }

        content += `
                    </div>
                </div>

                <!-- Column 3: Safe (6xn) -->
                <div ondragover="dragOver(event)" ondrop="handleDrop(event, 'safe')" style="flex: 1; border: 1px solid #555; padding: 5px; min-height: 200px;">
                    <h4 style="text-align: center; margin-top:0;">Safe</h4>
                    <div style="display: grid; grid-template-columns: repeat(2, 1fr); gap: 5px; max-height: 250px; overflow-y: auto;">
        `;

        // Show safe + 1 empty slot
        for (let i = 0; i <= state.safe.length; i++) {
            if (i < state.safe.length) {
                let p = state.safe[i];
                let imgSrc = `Assets/Pokemon Sprites/${p.qualityName === 'Shiny' ? p.id + '_shiny' : p.id}.png`;
                let sumIV = p.ivs.hp + p.ivs.atk + p.ivs.def + p.ivs.spa + p.ivs.spd + p.ivs.spe;
                content += `
                    <div style="border: 1px solid #777; height: 60px; text-align: center; cursor: move; position: relative;" title="Q=${p.quality.toFixed(2)} & ∑IV=${sumIV}" draggable="true" ondragstart="dragStart(event, 'safe', ${i})">
                        <img src="${imgSrc}" style="max-height: 40px; max-width: 40px;" onerror="this.src='data:image/gif;base64,R0lGODlhAQABAAD/ACwAAAAAAQABAAACADs='">
                        <div style="font-size: 10px;">Lv.${p.level}</div>
                        <div onclick="event.stopPropagation(); window.showPokemonStats(${i}, 'safe')" style="position: absolute; top: 2px; right: 2px; cursor: pointer; background: #34495e; color: white; border-radius: 50%; width: 14px; height: 14px; text-align: center; line-height: 14px; font-size: 10px; font-weight: bold;" title="View Info">i</div>
                    </div>
                `;
            } else {
                content += `<div style="border: 1px dashed #777; height: 60px; display: flex; align-items: center; justify-content: center; font-size: 20px; cursor: pointer;" title="Empty Slot">+</div>`;
            }
        }

        content += `
                    </div>
                </div>
            </div>
            <div style="font-size: 10px; text-align: center; margin-top: 5px; color: #ccc;">Click a Pokémon to move it.</div>
        `;
    }

    area.innerHTML = content;
};



window.setLeader = function(idx) {
    if (idx === 0) return;

    // Check if battle system exists
    if (battleSystem) {
        battleSystem.switchLeader(idx);
    } else {
        const newLeader = state.party.splice(idx, 1)[0];
        state.party.unshift(newLeader);
        updateUI();
    }
};

window.showPokemonStats = function(idx, location) {
    let p = null;
    if (location === 'party') p = state.party[idx];
    else if (location === 'breeding') p = state.breeding[idx];
    else if (location === 'training') p = state.training[idx];
    else if (location === 'storage') p = state.storage[idx];
    else if (location === 'safe') p = state.safe[idx];

    if (!p) return;

    const sumIV = p.ivs.hp + p.ivs.atk + p.ivs.def + p.ivs.spa + p.ivs.spd + p.ivs.spe;

    // Check for evolutions
    let evolveHtml = "";
    const pData = state.config.pokemonData.find(pd => pd.id === p.id);
    if (pData && pData.evolutions && pData.evolutions.length > 0) {
        let evolutionsList = pData.evolutions.map(evo => {
            const nextPData = state.config.pokemonData.find(pd => pd.id === evo.to);
            const canEvolve = p.level >= evo.level;
            return `
                <div style="margin-top: 10px;">
                    Evolution: <b>${nextPData ? nextPData.name : 'Unknown'}</b> (Level ${evo.level})
                    <button ${canEvolve ? '' : 'disabled'} onclick="window.evolvePokemon('${location}', ${idx}, ${evo.to})" style="${canEvolve ? 'background: #2ecc71;' : 'background: #7f8c8d; cursor: not-allowed;'} margin-left: 10px;">Evolve</button>
                </div>
            `;
        }).join('');
        evolveHtml = `<div style="margin-top: 15px; border-top: 1px solid #555; padding-top: 10px;">${evolutionsList}</div>`;
    }

    let html = `
        <div style="display: flex; justify-content: space-around;">
            <div>
                <img src="Assets/Pokemon Sprites/${p.qualityName === 'Shiny' ? p.id + '_shiny' : p.id}.png" style="width: 100px; height: 100px;"><br>
                <b>Quality:</b> ${p.qualityName} (Q=${p.quality.toFixed(2)})<br>
                <b>Sum IVs:</b> ${sumIV}<br>
            </div>
            <div style="text-align: left;">
                <h4>IV Distribution</h4>
                HP: ${p.ivs.hp}<br>
                ATK: ${p.ivs.atk}<br>
                DEF: ${p.ivs.def}<br>
                SPA: ${p.ivs.spa}<br>
                SPD: ${p.ivs.spd}<br>
                SPE: ${p.ivs.spe}<br>
            </div>
        </div>
        ${evolveHtml}
    `;

    showModal(`${p.name} (Lv. ${p.level})`, html);
};

window.evolvePokemon = function(location, idx, toId) {
    let list = null;
    if (location === 'party') list = state.party;
    else if (location === 'breeding') list = state.breeding;
    else if (location === 'training') list = state.training;
    else if (location === 'storage') list = state.storage;
    else if (location === 'safe') list = state.safe;

    if (!list || !list[idx]) return;

    let p = list[idx];
    const newBase = state.config.pokemonData.find(pd => pd.id === toId);
    if (!newBase) return;

    p.id = newBase.id;
    p.name = newBase.name;

    // Recalculate stats with new base
    p.maxHp = Math.floor((((2 * newBase.hp + p.ivs.hp) * p.level / 100) + p.level + 10) * p.quality);
    p.currentStats.atk = Math.floor((((2 * newBase.atk + p.ivs.atk) * p.level / 100) + 5) * p.quality);
    p.currentStats.def = Math.floor((((2 * newBase.def + p.ivs.def) * p.level / 100) + 5) * p.quality);
    p.currentStats.spa = Math.floor((((2 * newBase.spa + p.ivs.spa) * p.level / 100) + 5) * p.quality);
    p.currentStats.spd = Math.floor((((2 * newBase.spd + p.ivs.spd) * p.level / 100) + 5) * p.quality);
    p.currentStats.spe = Math.floor((((2 * newBase.spe + p.ivs.spe) * p.level / 100) + 5) * p.quality);

    // Heal to max hp when evolving
    p.currentHp = p.maxHp;

    // Evolving counts as catching for the pokedex
    if (!state.stats.caughtSpecies) state.stats.caughtSpecies = {};
    if (!state.stats.caughtSpecies[p.name]) {
        state.stats.caughtSpecies[p.name] = true;
        state.stats.caught++;
    }

    alert(`${p.name} evolved into ${newBase.name}!`);
    document.getElementById('modal-overlay').style.display = 'none'; // Close modal

    updateUI();
};

window.dragStart = function(event, sourceCol, index) {
    event.dataTransfer.setData('text/plain', JSON.stringify({ sourceCol, index }));
};

window.dragOver = function(event) {
    event.preventDefault(); // Necessary to allow dropping
};

window.handleDrop = function(event, targetCol) {
    event.preventDefault();
    const data = event.dataTransfer.getData('text/plain');
    if (!data) return;
    let sourceCol, index;
    try {
        const parsed = JSON.parse(data);
        sourceCol = parsed.sourceCol;
        index = parsed.index;
    } catch(e) { return; }

    // Normalize casings
    const sCol = sourceCol.toLowerCase();
    const tCol = targetCol.toLowerCase();

    if (sCol === tCol) return; // Dropping in same col doesn't do anything

    let p = null;
    if (sCol === 'party') p = state.party[index];
    else if (sCol === 'breeding') p = state.breeding[index];
    else if (sCol === 'training') p = state.training[index];
    else if (sCol === 'storage') p = state.storage[index];
    else if (sCol === 'safe') p = state.safe[index];

    if (!p) return;

    if (tCol === 'party' && state.party.length >= 6) {
        alert("Party is full!");
        return;
    }

    // We can't drag directly into Breeding/Training via UI drop zone currently, it goes to Party.

    // Remove from source
    if (sCol === 'party') state.party.splice(index, 1);
    else if (sCol === 'breeding') state.breeding.splice(index, 1);
    else if (sCol === 'training') state.training.splice(index, 1);
    else if (sCol === 'storage') state.storage.splice(index, 1);
    else if (sCol === 'safe') state.safe.splice(index, 1);

    // Add to target
    if (tCol === 'party') state.party.push(p);
    else if (tCol === 'storage') state.storage.push(p);
    else if (tCol === 'safe') state.safe.push(p);

    updateUI();
    renderBackpackTab('pokemon');
};


function switchView(viewName) {
    document.querySelectorAll('.game-view').forEach(el => el.style.display = 'none');

    if (viewName === 'PROF_OAK_LAB') {
        document.getElementById('view-prof-oak-lab').style.display = 'block';
    } else if (viewName === 'BATTLE_ARENA') {
        document.getElementById('view-battle-arena').style.display = 'flex';
        document.getElementById('view-battle-arena').style.flexDirection = 'column';
    } else if (viewName === 'POKEMON_CENTER_MARKET') {
        document.getElementById('view-center-market').style.display = 'block';
    } else if (viewName === 'GYM') {
        document.getElementById('view-gym').style.display = 'block';
    }
}

function showModal(title, htmlContent) {
    let rightCol = document.getElementById('modal-overlay');
    let contentPanel = document.getElementById('content-panel');
    rightCol.style.display = 'flex';
    contentPanel.innerHTML = `<h2>${title}</h2>${htmlContent}<br><br><button onclick="document.getElementById('modal-overlay').style.display='none'">Close</button>`;
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
    state.config.pokemonData = pokemonData;
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
    battleSystem = new BattleSystem(state, updateUI);
    updateUI();
    battleSystem.start();

    // Autosave loop
    setInterval(() => {
        storage.save(state);
    }, 60000);
}


function getChallengeText() {
    if (!state.config.unlocks) return "None";

    for (let unlock of state.config.unlocks) {
        let req = unlock.requirements;
        let isMet = true;
        let textParts = [];

        if (req.defeatCount) {
            if (state.stats.battlesWon < req.defeatCount) isMet = false;
            textParts.push(`Defeat ${req.defeatCount} Pokemons (${state.stats.battlesWon}/${req.defeatCount})`);
        }
        if (req.catchSpecies) {
            for (let spec of req.catchSpecies) {
                let caughtCount = state.stats.caughtSpecies ? (state.stats.caughtSpecies[spec.species] || 0) : 0;
                if (caughtCount < spec.count) isMet = false;
                textParts.push(`Catch ${spec.count} ${spec.species} (${caughtCount}/${spec.count})`);
            }
        }
        if (req.catchSpeciesAnyOf) {
             for (let specGroup of req.catchSpeciesAnyOf) {
                 let caughtCount = 0;
                 for (let s of specGroup.species) {
                     caughtCount += state.stats.caughtSpecies ? (state.stats.caughtSpecies[s] || 0) : 0;
                 }
                 if (caughtCount < specGroup.count) isMet = false;
                 textParts.push(`Catch ${specGroup.count} of ${specGroup.species.join('/')} (${caughtCount}/${specGroup.count})`);
             }
        }
        if (req.catchByRarityAndType) {
            let caughtCount = state.stats.caughtSpecific ? (state.stats.caughtSpecific[req.catchByRarityAndType.type] || 0) : 0;
            if (caughtCount < req.catchByRarityAndType.count) isMet = false;
            textParts.push(`Catch ${req.catchByRarityAndType.count} ${req.catchByRarityAndType.rarity} ${req.catchByRarityAndType.type}-types (${caughtCount}/${req.catchByRarityAndType.count})`);
        }
        if (req.defeatBoss) {
             isMet = false;
             textParts.push(`Defeat Boss ${req.defeatBoss.name}`);
        }
        if (req.defeatBossesSequential) {
             isMet = false;
             textParts.push(`Defeat Elite Four & Champion`);
        }
        if (req.reachPokemonLevel) {
             let highestLvl = 0;
             state.party.forEach(p => { if(p.level > highestLvl) highestLvl = p.level; });
             if (highestLvl < req.reachPokemonLevel.minLevel) isMet = false;
             textParts.push(`Reach Level ${req.reachPokemonLevel.minLevel} (${highestLvl}/${req.reachPokemonLevel.minLevel})`);
        }

        if (!isMet) {
            return textParts.join(" AND ");
        }
    }

    return "All Challenges Completed";
}

function updateUI() {
    // Top Nav
    document.getElementById('trainer-lvl').innerText = state.trainer.level;

    // Trainer XP relative to current level
    const currentTrainerXp = mathEngine.calculateTotalXP(state.trainer.level);
    const nextTrainerXp = mathEngine.calculateTotalXP(state.trainer.level + 1);
    const trainerXpProgress = Math.floor(state.trainer.xp) - currentTrainerXp;
    const trainerXpRequired = nextTrainerXp - currentTrainerXp;
    document.getElementById('trainer-xp').innerText = `${trainerXpProgress}/${trainerXpRequired}`;

    document.getElementById('trainer-money').innerText = state.trainer.money;
    document.getElementById('current-challenge-text').innerText = getChallengeText();

    // Party
    const partyDiv = document.getElementById('party-list');
    partyDiv.innerHTML = '';
    state.party.forEach((p, idx) => {
        const d = document.createElement('div');
        d.className = 'party-slot';
        d.style.position = 'relative';

        // Calculate XP relative to current level
        const currentLevelXp = mathEngine.calculateTotalXP(p.level);
        const nextLevelXp = mathEngine.calculateTotalXP(p.level + 1);
        const xpProgress = Math.floor(p.xp) - currentLevelXp;
        const xpRequired = nextLevelXp - currentLevelXp;

        const crownColor = idx === 0 ? '#f1c40f' : '#7f8c8d'; // Yellow for leader, Grey for others

        d.innerHTML = `
            <div onclick="window.setLeader(${idx})" style="position: absolute; top: 5px; right: 5px; cursor: pointer; color: ${crownColor}; font-size: 16px;" title="Set as Leader">👑</div>
            <img src="Assets/Pokemon Sprites/${p.qualityName === 'Shiny' ? p.id + '_shiny' : p.id}.png" onload="this.style.display='inline'" onerror="this.style.display='none'" style="width: 50px; height: 50px;">
            <div style="display: inline-block; vertical-align: top; width: calc(100% - 70px);">
                <b>${p.name}</b> Lv.${p.level}<br>
                HP: ${Math.floor(p.currentHp)}/${p.maxHp}
                <div style="width: 100%; height: 5px; background: #333; margin-top: 2px; margin-bottom: 4px;">
                    <div style="width: ${Math.min(100, (p.currentHp / p.maxHp) * 100)}%; height: 100%; background: #e74c3c;"></div>
                </div>
                XP: ${xpProgress}/${xpRequired}
                <div style="width: 100%; height: 5px; background: #333; margin-top: 2px;">
                    <div style="width: ${Math.min(100, (xpProgress / xpRequired) * 100)}%; height: 100%; background: #4caf50;"></div>
                </div>
            </div>
            <div onclick="event.stopPropagation(); window.showPokemonStats(${idx}, 'party')" style="position: absolute; bottom: 5px; right: 5px; cursor: pointer; background: #34495e; color: white; border-radius: 50%; width: 20px; height: 20px; text-align: center; line-height: 20px; font-weight: bold;" title="View Info">i</div>
        `;
        partyDiv.appendChild(d);
    });

    // Day Care UI updates
    if (state.dayCareRef) {
        document.getElementById('breed-prog').innerText = `${state.dayCareRef.slot1.battles}/${state.dayCareRef.slot1.requiredBattles}`;
        document.getElementById('train-prog').innerText = `${state.dayCareRef.slot2.battles}/${state.dayCareRef.slot2.requiredBattles}`;
    }

    // Combat Arena
    if (battleSystem && battleSystem.activeEncounter) {
        const enemy = battleSystem.activeEncounter;
        const enemyTotalIV = enemy.ivs.hp + enemy.ivs.atk + enemy.ivs.def + enemy.ivs.spa + enemy.ivs.spd + enemy.ivs.spe;
        document.getElementById('enemy-name').innerText = `${enemy.name} (Q=${enemy.quality.toFixed(2)} & ∑IV=${enemyTotalIV})`;
        document.getElementById('enemy-lvl').innerText = enemy.level;
        document.getElementById('enemy-hp').innerText = `${Math.floor(enemy.currentHp)}/${enemy.maxHp}`;
        document.getElementById('enemy-sprite').src = `Assets/Pokemon Sprites/${enemy.qualityName === 'Shiny' ? enemy.id + '_shiny' : enemy.id}.png`;
        document.getElementById('enemy-sprite').style.display = 'block';

        const leader = state.party[0];
        if (leader) {
            document.getElementById('player-name').innerText = leader.name;
            document.getElementById('player-lvl').innerText = leader.level;
            document.getElementById('player-hp').innerText = `${Math.floor(leader.currentHp)}/${leader.maxHp}`;
            document.getElementById('player-sprite').src = `Assets/Pokemon Sprites/${leader.qualityName === 'Shiny' ? leader.id + '_shiny' : leader.id}.png`;
            document.getElementById('player-sprite').style.display = 'block';
        }
    } else if (battleSystem && battleSystem.isSearching) {
        document.getElementById('enemy-name').innerText = "Searching...";
        document.getElementById('enemy-lvl').innerText = "?";
        document.getElementById('enemy-hp').innerText = "?/?";
        document.getElementById('enemy-sprite').src = "data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7";
        document.getElementById('enemy-sprite').style.display = 'block';

        const leader = state.party[0];
        if (leader) {
            document.getElementById('player-name').innerText = leader.name;
            document.getElementById('player-lvl').innerText = leader.level;
            document.getElementById('player-hp').innerText = `${Math.floor(leader.currentHp)}/${leader.maxHp}`;
            document.getElementById('player-sprite').src = `Assets/Pokemon Sprites/${leader.qualityName === 'Shiny' ? leader.id + '_shiny' : leader.id}.png`;
            document.getElementById('player-sprite').style.display = 'block';
        } else {
            document.getElementById('player-sprite').style.display = 'none';
        }
    } else {
         document.getElementById('enemy-sprite').style.display = 'none';
         document.getElementById('player-sprite').style.display = 'none';
    }
}

// Ensure the UI script runs
init();

function showMap() {
    let rightCol = document.getElementById('modal-overlay');
    let contentPanel = document.getElementById('content-panel');
    rightCol.style.display = 'flex';

    // Generate Interactive Map HTML
    let html = `
        <h2>Map</h2>
        <div id="interactive-map" style="position: relative; width: 100%; aspect-ratio: 16/11; background-image: url('./Assets/Map/Kanto Map.png'); background-size: contain; background-repeat: no-repeat; background-position: center; border: 2px solid #fff; border-radius: 8px;">
    `;

    for (const [locationId, locationData] of Object.entries(state.config.mapCoordinates)) {
        const locationName = locationData.name;
        const coords = locationData;

        // By request, all map spots are currently unlocked by default
        let isUnlocked = true;

        if (isUnlocked) {

            let markerImg = './Assets/Extra/Spot.png';
            let showCheckmark = false;
            if (locationId === 'professor_oak_lab') markerImg = './Assets/Extra/Spot_Oak.png';
            else if (locationId === 'pokemon_center___market') markerImg = './Assets/Extra/Spot_PCPM.png';
            else if (locationId === 'indigo_plateu') markerImg = './Assets/Extra/Spot_E4.png';
            else if (locationId === 'safari_zone') markerImg = './Assets/Extra/Spot_Safariball.png';
            else if (locationId === 'celadon_s_casino') markerImg = './Assets/Extra/Spot_Casino.png';
            else if (locationId === 'pewter_gym') { markerImg = './Assets/Badges/Badge Kanto 1.png'; if (state.trainer.badges >= 1) showCheckmark = true; }
            else if (locationId === 'cerulean_gym') { markerImg = './Assets/Badges/Badge Kanto 2.png'; if (state.trainer.badges >= 2) showCheckmark = true; }
            else if (locationId === 'vermilion_gym') { markerImg = './Assets/Badges/Badge Kanto 3.png'; if (state.trainer.badges >= 3) showCheckmark = true; }
            else if (locationId === 'celadon_gym') { markerImg = './Assets/Badges/Badge Kanto 4.png'; if (state.trainer.badges >= 4) showCheckmark = true; }
            else if (locationId === 'fuchsia_gym') { markerImg = './Assets/Badges/Badge Kanto 5.png'; if (state.trainer.badges >= 5) showCheckmark = true; }
            else if (locationId === 'saffron_gym') { markerImg = './Assets/Badges/Badge Kanto 6.png'; if (state.trainer.badges >= 6) showCheckmark = true; }
            else if (locationId === 'cinnabar_gym') { markerImg = './Assets/Badges/Badge Kanto 7.png'; if (state.trainer.badges >= 7) showCheckmark = true; }
            else if (locationId === 'viridian_gym') { markerImg = './Assets/Badges/Badge Kanto 8.png'; if (state.trainer.badges >= 8) showCheckmark = true; }

            // Increase size for special spots
            let markerWidth = "24px";
            let markerHeight = "24px";
            if (['professor_oak_lab', 'pokemon_center___market', 'indigo_plateu', 'safari_zone'].includes(locationId)) {
                markerWidth = "40px";
                markerHeight = "40px";
            }


            html += `
                <div class="map-marker"
                     data-location="${locationName}"
                     title="${locationName}"
                     style="position: absolute; left: ${coords.x}%; top: ${coords.y}%; width: ${markerWidth}; height: ${markerHeight}; background-image: url('${markerImg}'); background-size: contain; background-repeat: no-repeat; transform: translate(-50%, -50%); cursor: pointer;"
                     onclick="navigateToLocation('${locationName}')"
                     onmouseover="showMapTooltip(event, '${locationName}')"
                     onmouseout="hideMapTooltip()">
                     ${showCheckmark ? '<div style="position:absolute; top:-5px; right:-5px; background:green; color:white; border-radius:50%; width:15px; height:15px; font-size:10px; line-height:15px; text-align:center;">✓</div>' : ''}
                </div>
            `;
        }
    }

    html += `
        </div>
        <div id="map-tooltip" style="display:none; position:absolute; background:rgba(0,0,0,0.8); color:white; padding:5px; border-radius:5px; pointer-events:none; z-index: 100;"></div>
        <br><button onclick="document.getElementById('modal-overlay').style.display='none'">Close</button>
    `;

    contentPanel.innerHTML = html;
}

window.navigateToLocation = function(locationName) {
    state.currentRoute = locationName;
    document.getElementById('modal-overlay').style.display = 'none';

    if (locationName === "Professor Oak Lab") {
        switchView("PROF_OAK_LAB");
    } else if (locationName === "Pokemon Center & Market" || locationName.includes("Market")) {
        switchView("POKEMON_CENTER_MARKET");
        const vCenter = document.getElementById("view-center-market");
        vCenter.innerHTML = `
            <div style="background-color: rgba(0,0,0,0.8); display: inline-block; padding: 20px; margin-top: 50px; border-radius: 8px;">
                <h2>Pokemon Center & Market</h2>
                <div style="margin-top: 20px;">
                    <button id="btn-heal-all" style="padding: 10px 20px; font-size: 16px; margin-right: 10px;">Pokemon Center (Heal All)</button>
                    <button id="btn-market-buy" style="padding: 10px 20px; font-size: 16px;">Market (Buy Items)</button>
                </div>
                <div id="market-panel" style="margin-top: 20px; display: none; text-align: left;">
                    <h3>Buy Items</h3>
                    <div id="market-items"></div>
                </div>
            </div>
        `;
        // vCenter.style.backgroundImage = "url('./Assets/BG/BG-PC&M.png')"; // missing asset
        vCenter.style.backgroundSize = "cover";
        vCenter.style.height = "100%";
        vCenter.style.textAlign = "center";

        document.getElementById('btn-heal-all').onclick = () => {
            state.party.forEach(p => p.currentHp = p.maxHp);
            alert("All Pokemon have been healed!");
            updateUI();
        };

        document.getElementById('btn-market-buy').onclick = () => {
            const panel = document.getElementById('market-panel');
            panel.style.display = panel.style.display === 'none' ? 'block' : 'none';
            if(panel.style.display === 'block') {
                const itemsDiv = document.getElementById('market-items');
                let itemsHtml = '<h4>Pokeballs</h4>';

                // Pokeballs dynamically from config
                state.config.balance.items.pokeballs.forEach(b => {
                    if (state.backpack.pokeballs[b.name] !== undefined) {
                        itemsHtml += `<div style="margin-bottom: 5px;">
                            <span>${b.name} ($${b.price})</span>
                            <button onclick="window.buyItem('${b.name}', ${b.price}, 'pokeballs')">Buy</button>
                        </div>`;
                    }
                });

                itemsHtml += '<h4>Potions</h4>';

                // Potions dynamically from config
                state.config.balance.items.potions.forEach(p => {
                    let inventoryName = p.name;
                    // Map config names to inventory names where they differ slightly
                    if (p.name === 'Regular Potion') inventoryName = 'Regular Potion';
                    if (p.name === 'Big') inventoryName = 'Big Potion';
                    if (p.name === 'Max Potion') return; // Excluded from backpack initial state for now unless added

                    if (state.backpack.potions[inventoryName] !== undefined) {
                        itemsHtml += `<div style="margin-bottom: 5px;">
                            <span>${inventoryName} ($${p.price})</span>
                            <button onclick="window.buyItem('${inventoryName}', ${p.price}, 'potions')">Buy</button>
                        </div>`;
                    }
                });

                itemsHtml += '<h4>Stones</h4>';

                // Stones from config (only has price/sell, need to list all stones in backpack)
                const stonePrice = state.config.balance.items.stones.price;
                Object.keys(state.backpack.stones).forEach(stoneName => {
                    itemsHtml += `<div style="margin-bottom: 5px;">
                        <span>${stoneName} ($${stonePrice})</span>
                        <button onclick="window.buyItem('${stoneName}', ${stonePrice}, 'stones')">Buy</button>
                    </div>`;
                });

                itemsDiv.innerHTML = itemsHtml;
            }
        };

        window.buyItem = (itemId, cost, category) => {
            if (state.trainer.money >= cost) {
                state.trainer.money -= cost;
                state.backpack[category][itemId]++;
                updateUI();
                // Optionally show a quick visual feedback instead of an alert
            } else {
                alert("Not enough money!");
            }
        };
    } else if (locationName.includes("Gym")) {
        switchView("GYM");
        let bgImg = "";
        if (locationName.includes("Pewter")) bgImg = "BG-Gym-1-Pewter-Rock.png";
        else if (locationName.includes("Cerulean")) bgImg = "BG-Gym-2-Cerulean-Water.png";
        else if (locationName.includes("Vermilion")) bgImg = "BG-Gym-3-Vermilion-Electric.png";
        else if (locationName.includes("Celadon")) bgImg = "BG-Gym-4-Celadon-Grass.png";
        else if (locationName.includes("Fuchsia")) bgImg = "BG-Gym-5-Fuchsia-Poison.png";
        else if (locationName.includes("Saffron")) bgImg = "BG-Gym-6-Saffron-Psychic.png";
        else if (locationName.includes("Cinnabar")) bgImg = "BG-Gym-7-Cinnabar-Fire.png";
        else if (locationName.includes("Viridian Gym")) bgImg = "BG-Gym-8-Viridian-Ground.png";

        const vGym = document.getElementById("view-gym");
        vGym.innerHTML = `
            <div style="background-color: rgba(0,0,0,0.5); display: inline-block; padding: 10px; margin-top: 50px; border-radius: 8px;">
                <h2>${locationName}</h2>
                <p>Battle System idle. Implement gym logic in battleSystem.js.</p>
            </div>
        `;
        if (bgImg) {
            vGym.style.backgroundImage = `url('./Assets/BG/${bgImg}')`;
            vGym.style.backgroundSize = "cover";
            vGym.style.height = "100%";
            vGym.style.textAlign = "center";
        }
    } else {
        switchView("BATTLE_ARENA");
        if (battleSystem) {
             battleSystem.searchNext(); // Restart search if we moved
        }
    }
    updateUI();
};

window.showDamage = function(target, amount, isCrit, moveName = '') {
    let containerId = target === 'player' ? 'player-sprite' : 'enemy-sprite';
    let img = document.getElementById(containerId);
    if (!img) return;

    let dmgNode = document.createElement('div');
    dmgNode.innerText = (moveName ? moveName + ' ' : '') + '-' + amount + (isCrit ? ' (CRIT)' : '');
    dmgNode.style.position = 'absolute';
    dmgNode.style.color = isCrit ? '#f39c12' : '#e74c3c';
    dmgNode.style.fontSize = isCrit ? '24px' : '18px';
    dmgNode.style.fontWeight = 'bold';
    dmgNode.style.textShadow = '1px 1px 2px black';
    dmgNode.style.pointerEvents = 'none';
    dmgNode.style.transition = 'all 1s ease-out';

    // Position relatively to the parent container of the image
    const rect = img.getBoundingClientRect();
    const parentRect = img.parentElement.getBoundingClientRect();

    dmgNode.style.left = (rect.left - parentRect.left + (rect.width / 2)) + 'px';
    dmgNode.style.top = (rect.top - parentRect.top) + 'px';

    img.parentElement.appendChild(dmgNode);

    // Animate up and fade out
    setTimeout(() => {
        dmgNode.style.top = (parseFloat(dmgNode.style.top) - 30) + 'px';
        dmgNode.style.opacity = '0';
    }, 50);

    setTimeout(() => {
        if (dmgNode.parentElement) dmgNode.parentElement.removeChild(dmgNode);
    }, 1000);
};

window.updateGameSpeed = function(val) {
    const speedValues = [0.5, 1, 2, 4, 8, 16, 32];
    const speed = speedValues[parseInt(val)];
    state.settings.gameSpeed = speed;
    const display = document.getElementById('speed-display');
    if (display) display.innerText = speed + 'x';
};

window.addMoney = function() {
    const input = document.getElementById('add-money-input');
    if (!input) return;
    const amount = parseInt(input.value);
    if (!isNaN(amount) && amount > 0) {
        state.trainer.money += amount;
        input.value = '';
        updateUI();
    }
};

window.addXp = function() {
    const input = document.getElementById('add-xp-input');
    if (!input) return;
    const amount = parseInt(input.value);
    if (!isNaN(amount) && amount > 0) {
        state.trainer.xp += amount;
        if (state.party.length > 0) {
            state.party[0].xp += amount;
            // Note: In a full engine we'd trigger a level up check here.
            // For now, battle loop handles leveled stats when entering next battle.
        }
        input.value = '';
        updateUI();
    }
};

window.exportLog = function() {
    if (state.storageRef) {
        state.storageRef.exportLog(state);
    }
}

window.showMapTooltip = function(e, locationName) {
    const tooltip = document.getElementById('map-tooltip');
    if (!tooltip) return;

    let info = `<strong>${locationName}</strong><br>`;

    // Fetch info to show on tooltip
    if (locationName.includes("Gym") || locationName === "Elite 4") {
        let lookupName = locationName;
        if (lookupName === "Elite 4") lookupName = "Indigo Plateau";

        if (state.config.gyms) {
            const gym = state.config.gyms.find(g => g.name === lookupName);
            if (gym) {
                info += `Leader: ${gym.leader}<br>`;
                info += `Lvl Req: ${gym.levelRequirement}<br>`;
                info += `Trainers: ${gym.trainers.length - 1}<br>`;
            }
        }
    } else if (state.config.routes) {
        const route = state.config.routes.find(r => r.name === locationName);
        if (route) {
            // Find overall min and max level for the route
            let minLvl = 100;
            let maxLvl = 1;
            route.spawns.forEach(s => {
                if (s.minLevel < minLvl) minLvl = s.minLevel;
                if (s.maxLevel > maxLvl) maxLvl = s.maxLevel;
            });
            info += `Levels: ${minLvl}-${maxLvl}<br>`;
            info += `Spawns: ${route.spawns.length}<br>`;

            // Show top 3 spawns
            route.spawns.slice(0, 3).forEach(s => {
                let pName = "Unknown";
                if (state.config.pokemonData) {
                    const pd = state.config.pokemonData.find(p => p.id === s.pokemonId);
                    if (pd) pName = pd.name;
                }
                info += `- ${pName} (${Math.round(s.chance * 100)}%)<br>`;
            });
        } else {
            info += `Hub Area<br>`;
        }
    }

    tooltip.innerHTML = info;
    tooltip.style.display = 'block';

    // Fix tooltip positioning by using fixed position for the tooltip to avoid offset issues
    tooltip.style.position = 'fixed';
    tooltip.style.left = (e.clientX + 15) + 'px';
    tooltip.style.top = (e.clientY + 15) + 'px';
};

window.hideMapTooltip = function() {
    const tooltip = document.getElementById('map-tooltip');
    if (tooltip) tooltip.style.display = 'none';
};
