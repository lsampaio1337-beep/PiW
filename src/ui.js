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
    backpack: {
        pokeballs: { "Pokeball": 10, "Greatball": 0, "Ultraball": 0, "Masterball": 0 },
        potions: { "Tiny Potion": 500, "Small Potion": 0, "Regular Potion": 0, "Big": 0, "Hyper Potion": 0, "Ultimate Potion": 0, "Max Potion": 0 },
        stones: 0
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
                <img src="assets/Pokemon Sprites/${i}.png" style="width: 50px; height: 50px; filter: ${filter}; cursor: ${cursor};" ${onClick}>
            </div>`;
        }
    }

    html += `</div>`;
    showModal("Pokedex", html);
}

window.showDexEntry = (id) => {
    const pData = state.config.pokemonData.find(p => p.id === id);
    if (!pData) return;

    // Total BST is sum of base stats
    const bst = pData.hp + pData.atk + pData.def + pData.spa + pData.spd + pData.spe;

    // Check if shiny is unlocked/seen for this specific pokemon? The prompt says "button to see shiny version".
    // Let's just toggle the sprite.
    const html = `
        <div style="text-align:center;">
            <h2>#${pData.id} ${pData.name}</h2>
            <img id="dex-sprite" src="assets/Pokemon Sprites/${pData.id}.png" style="width: 100px; height: 100px;">
            <p>Type: ${pData.types.join('/')}</p>
            <p>BST: ${bst} (HP:${pData.hp} A:${pData.atk} D:${pData.def} SA:${pData.spa} SD:${pData.spd} S:${pData.spe})</p>
            <button onclick="document.getElementById('dex-sprite').src = 'assets/Pokemon Sprites/${pData.id}_shiny.png'">Show Shiny</button>
            <button onclick="document.getElementById('dex-sprite').src = 'assets/Pokemon Sprites/${pData.id}.png'">Show Normal</button>
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
            // We re-fetch configs because saved state overwrote it entirely (shallow assign)
            await loadConfigs();
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

    // Add quick testing route jump
    window.testJump = () => {
        state.currentRoute = "Route 1";
        switchView("BATTLE_ARENA");
        battleSystem.searchNext();
        updateUI();
    };

    // Bind Hub Buttons
    document.getElementById('btn-map').onclick = () => showMap();
    document.getElementById('btn-backpack').onclick = () => showModal("Backpack", `
        <h3>Pokeballs</h3>
        ${Object.keys(state.backpack.pokeballs).map(k => `${k}: ${state.backpack.pokeballs[k]}`).join('<br>')}
        <h3>Potions</h3>
        ${Object.keys(state.backpack.potions).map(k => `${k}: ${state.backpack.potions[k]}`).join('<br>')}
    `);
    document.getElementById('btn-dex').onclick = showPokedex;
    document.getElementById('btn-stats').onclick = () => showModal("Statistics", `<p>Battles Won: ${state.stats.battlesWon}</p><p>Money: $${state.trainer.money}</p>`);
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
    let rightCol = document.getElementById('right-col');
    let contentPanel = document.getElementById('content-panel');
    rightCol.style.display = 'block';
    contentPanel.innerHTML = `<h2>${title}</h2>${htmlContent}<br><br><button onclick="document.getElementById('right-col').style.display='none'">Close</button>`;
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

        // Calculate XP relative to current level
        const currentLevelXp = mathEngine.calculateTotalXP(p.level);
        const nextLevelXp = mathEngine.calculateTotalXP(p.level + 1);
        const xpProgress = Math.floor(p.xp) - currentLevelXp;
        const xpRequired = nextLevelXp - currentLevelXp;

        d.innerHTML = `
            <img src="assets/Pokemon Sprites/${p.qualityName === 'Shiny' ? p.id + '_shiny' : p.id}.png" onload="this.style.display='inline'" onerror="this.style.display='none'">
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
        `;
        d.onclick = () => {
            battleSystem.switchLeader(idx);
        };
        partyDiv.appendChild(d);
    });

    // Day Care UI updates
    if (state.dayCareRef) {
        document.getElementById('breed-prog').innerText = `${state.dayCareRef.slot1.battles}/${state.dayCareRef.slot1.requiredBattles}`;
        document.getElementById('train-prog').innerText = `${state.dayCareRef.slot2.battles}/${state.dayCareRef.slot2.requiredBattles}`;
    }

    // Combat Arena
    const combatArena = document.getElementById('combat-arena');

    if (battleSystem && battleSystem.activeEncounter) {
        if (combatArena) combatArena.classList.remove('scrolling');
        const enemy = battleSystem.activeEncounter;
        const enemyTotalIV = enemy.ivs.hp + enemy.ivs.atk + enemy.ivs.def + enemy.ivs.spa + enemy.ivs.spd + enemy.ivs.spe;
        document.getElementById('enemy-name').innerText = `${enemy.name} (Q=${enemy.quality.toFixed(2)} & ∑IV=${enemyTotalIV})`;
        document.getElementById('enemy-lvl').innerText = enemy.level;
        document.getElementById('enemy-hp').innerText = `${Math.floor(enemy.currentHp)}/${enemy.maxHp}`;
        document.getElementById('enemy-sprite').src = `assets/Pokemon Sprites/${enemy.qualityName === 'Shiny' ? enemy.id + '_shiny' : enemy.id}.png`;
        document.getElementById('enemy-sprite').style.display = 'block';
        document.getElementById('enemy-sprite').classList.add('sprite-bob');

        const leader = state.party[0];
        if (leader) {
            document.getElementById('player-name').innerText = leader.name;
            document.getElementById('player-lvl').innerText = leader.level;
            document.getElementById('player-hp').innerText = `${Math.floor(leader.currentHp)}/${leader.maxHp}`;
            document.getElementById('player-sprite').src = `assets/Pokemon Sprites/${leader.qualityName === 'Shiny' ? leader.id + '_shiny' : leader.id}.png`;
            document.getElementById('player-sprite').style.display = 'block';
            document.getElementById('player-sprite').classList.add('sprite-bob');
        }
    } else if (battleSystem && battleSystem.isSearching) {
        if (combatArena) combatArena.classList.add('scrolling');

        document.getElementById('enemy-name').innerText = "Searching...";
        document.getElementById('enemy-lvl').innerText = "?";
        document.getElementById('enemy-hp').innerText = "?/?";
        document.getElementById('enemy-sprite').src = "data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7";
        document.getElementById('enemy-sprite').style.display = 'block';
        document.getElementById('enemy-sprite').classList.remove('sprite-bob');

        const leader = state.party[0];
        if (leader) {
            document.getElementById('player-name').innerText = leader.name;
            document.getElementById('player-lvl').innerText = leader.level;
            document.getElementById('player-hp').innerText = `${Math.floor(leader.currentHp)}/${leader.maxHp}`;
            document.getElementById('player-sprite').src = `assets/Pokemon Sprites/${leader.qualityName === 'Shiny' ? leader.id + '_shiny' : leader.id}.png`;
            document.getElementById('player-sprite').style.display = 'block';
            document.getElementById('player-sprite').classList.add('sprite-bob');
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
    let rightCol = document.getElementById('right-col');
    let contentPanel = document.getElementById('content-panel');
    rightCol.style.display = 'block';

    // Generate Interactive Map HTML
    let html = `
        <h2>Map</h2>
        <div id="interactive-map" style="position: relative; width: 100%; aspect-ratio: 1/1; background-image: url('./assets/Extra/Kanto Map.png'); background-size: cover; border: 2px solid #fff; border-radius: 8px;">
    `;

    // Ensure we only show unlocked routes based on battle count
    const rCount = state.stats.battlesWon;
    const maxIdx = Math.floor(rCount / 50) + 1; // Unlocks every 50 battles
    const unlockedRoutes = new Set();
    if (state.config.routes) {
        for (let i = 0; i < Math.min(maxIdx, state.config.routes.length); i++) {
            unlockedRoutes.add(state.config.routes[i].name);
        }
    }

    for (const [locationId, locationData] of Object.entries(state.config.mapCoordinates)) {
        const locationName = locationData.name;
        const coords = locationData;

        // Simple filter logic for progression (only unlock routes that are allowed, plus gyms if route matches)
        let isUnlocked = false;

        if (locationName.includes("Gym") || locationName === "Elite 4") {
            isUnlocked = true;
        } else if (unlockedRoutes.has(locationName)) {
            isUnlocked = true;
        } else if (["Professor Oak Lab", "Viridian City", "Pewter City", "Cerulean City", "Vermilion City", "Lavender Town", "Saffron City", "Celadon City", "Fuchsia City", "Cinnabar Island", "Casino", "Small Fishing Spot", "Fighting Dojo", "Big Fishing Spot", "Fossil Revival Lab", "Trade with Friends Hub", "Unreachables Zone"].includes(locationName)) {
            isUnlocked = true;
        }

        if (isUnlocked) {
            html += `
                <div class="map-marker"
                     data-location="${locationName}"
                     title="${locationName}"
                     style="position: absolute; left: ${coords.x}%; top: ${coords.y}%; width: 24px; height: 24px; background-image: url('./assets/Extra/Spot.png'); background-size: contain; background-repeat: no-repeat; transform: translate(-50%, -50%); cursor: pointer;"
                     onclick="navigateToLocation('${locationName}')"
                     onmouseover="showMapTooltip(event, '${locationName}')"
                     onmouseout="hideMapTooltip()">
                </div>
            `;
        }
    }

    html += `
        </div>
        <div id="map-tooltip" style="display:none; position:absolute; background:rgba(0,0,0,0.8); color:white; padding:5px; border-radius:5px; pointer-events:none; z-index: 100;"></div>
        <br><button onclick="document.getElementById('right-col').style.display='none'">Close</button>
    `;

    contentPanel.innerHTML = html;
}

window.navigateToLocation = function(locationName) {
    state.currentRoute = locationName;
    document.getElementById('right-col').style.display = 'none';

    if (locationName === "Professor Oak Lab") {
        switchView("PROF_OAK_LAB");
    } else if (locationName === "Pokemon Center" || locationName.includes("Market")) {
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
        vCenter.style.backgroundImage = "url('./assets/backgrounds/BG-PC&M.png')";
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
                let itemsHtml = '';

                // Pokeballs
                const balls = [
                    {id: 'pokeball', name: 'Pokeball', cost: 5},
                    {id: 'greatball', name: 'Greatball', cost: 50},
                    {id: 'ultraball', name: 'Ultraball', cost: 600}
                ];

                balls.forEach(b => {
                    itemsHtml += `<div style="margin-bottom: 5px;">
                        <span>${b.name} ($${b.cost})</span>
                        <button onclick="window.buyItem('${b.id}', ${b.cost}, 'pokeballs')">Buy</button>
                    </div>`;
                });

                // Potions
                const potions = [
                    {id: 'tinyPotion', name: 'Tiny Potion', cost: 10},
                    {id: 'smallPotion', name: 'Small Potion', cost: 25},
                    {id: 'standardPotion', name: 'Standard Potion', cost: 75},
                    {id: 'superPotion', name: 'Super Potion', cost: 300},
                    {id: 'hyperPotion', name: 'Hyper Potion', cost: 1500},
                    {id: 'ultimatePotion', name: 'Ultimate Potion', cost: 9000}
                ];

                potions.forEach(p => {
                    itemsHtml += `<div style="margin-bottom: 5px;">
                        <span>${p.name} ($${p.cost})</span>
                        <button onclick="window.buyItem('${p.id}', ${p.cost}, 'potions')">Buy</button>
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
            vGym.style.backgroundImage = `url('./assets/backgrounds/${bgImg}')`;
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
