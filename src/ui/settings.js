import { VITAMINS } from "../constants.js";
import { state, globals } from '../state.js';
import { showModal } from '../ui.js';
import * as mathEngine from '../mathEngine.js';
import { showCheatControlModal } from './cheatControl.js';
import { clearAllSpriteCaches } from '../utils/sprites.js';
import { encryptSaveText, decryptSaveText } from '../utils/saveCrypto.js';

export function toggleLegacySprites(value) {
    state.settings.legacySprites = (value === 'true' || value === true);
    clearAllSpriteCaches();
    if (window.updateUI) window.updateUI();
}
window.toggleLegacySprites = toggleLegacySprites;

export function resetWindowLayout() {
    if (!state.settings) state.settings = {};
    const prevKeys = state.settings.windowSettings ? Object.keys(state.settings.windowSettings) : [];
    state.settings.windowSettings = {};
    prevKeys.forEach((winId) => {
        const winEl = document.getElementById(winId);
        if (winEl && winEl.style) {
            winEl.style.removeProperty('width');
            winEl.style.removeProperty('height');
            winEl.style.removeProperty('left');
            winEl.style.removeProperty('top');
            winEl.style.removeProperty('transform');
        }
    });
    const storage = state.storageRef || (typeof window !== 'undefined' ? window.storageRef : null);
    if (storage && typeof storage.save === 'function') {
        storage.save(state);
    }
    if (typeof window !== 'undefined' && typeof window.showGameAlert === 'function') {
        window.showGameAlert('Window positions and sizes reset to defaults!');
    }
}
window.resetWindowLayout = resetWindowLayout;

export function showSettings() {
    const battleSystem = globals.battleSystem;
    if (battleSystem && battleSystem.gymState && battleSystem.gymState.isActive) return;

    const isLegacy = !!state.settings?.legacySprites;
    const settingsHTML = `
        <div class="settings-container">
            <div class="settings-section">
                <div class="settings-section-title">Display &amp; Graphics</div>
                <div class="settings-card">
                    <div class="settings-row">
                        <div class="settings-info">
                            <div class="settings-label">Legacy Sprites</div>
                            <div class="settings-desc">Use classic sprites instead of modern sprites across battles and menus.</div>
                        </div>
                        <label class="settings-switch" for="legacy-sprites-checkbox" title="Toggle Legacy Sprites">
                            <input type="checkbox" id="legacy-sprites-checkbox" ${isLegacy ? 'checked' : ''}>
                            <span class="settings-slider"></span>
                        </label>
                    </div>
                </div>
                <div class="settings-card">
                    <div class="settings-row">
                        <div class="settings-info">
                            <div class="settings-label">Window Layout</div>
                            <div class="settings-desc">Reset saved positions and dimensions of floating windows back to defaults.</div>
                        </div>
                        <button type="button" class="settings-btn settings-btn-primary" onclick="window.resetWindowLayout()">Reset Layout</button>
                    </div>
                </div>
            </div>

            <div class="settings-section">
                <div class="settings-section-title">Data &amp; Save Management</div>
                <div class="settings-card">
                    <div class="settings-row">
                        <div class="settings-info">
                            <div class="settings-label">Data</div>
                            <div class="settings-desc">Download or Restore data for a profile</div>
                        </div>
                        <div style="display: flex; gap: 8px; flex-shrink: 0;">
                            <button type="button" class="settings-btn settings-btn-primary" onclick="window.exportData()">Download</button>
                            <button type="button" class="settings-btn settings-btn-primary" onclick="window.triggerImportData()">Restore</button>
                        </div>
                        <input type="file" id="import-data-file-input" accept=".txt" style="display: none;">
                    </div>
                </div>
            </div>

            <div class="settings-section">
                <div class="settings-section-title settings-section-title-danger">Developer &amp; Debug</div>
                <div class="settings-card settings-card-danger">
                    <div class="settings-row">
                        <div class="settings-info">
                            <div class="settings-label">Cheat &amp; Debug Tools</div>
                            <div class="settings-desc">Open developer controls for testing encounters, items, and progression.</div>
                        </div>
                        <button type="button" class="settings-btn settings-btn-danger" onclick="window.activateCheat()">Open Cheats</button>
                    </div>
                </div>
            </div>
        </div>
    `;
    showModal("Settings", settingsHTML, "window-settings");
    const checkboxEl = document.getElementById('legacy-sprites-checkbox');
    if (checkboxEl) {
        checkboxEl.addEventListener('change', (e) => toggleLegacySprites(e.target.checked));
    }
}

export function showTimeLapseModal() {
    const html = `
        <div class="piw-card" style="display: flex; flex-direction: column; gap: 12px;">
            <div style="font-size: 0.9rem; color: var(--piw-text-muted); line-height: 1.45;">
                Simulate offline hunting, captures, loot drops, and passive EXP at your current route.
            </div>
            <div style="display: flex; align-items: center; gap: 8px; flex-wrap: wrap;">
                <label for="timelapse-duration-input" style="font-weight: 600; color: var(--piw-text-main);">Duration:</label>
                <input type="number" id="timelapse-duration-input" class="piw-input" value="1" min="1" style="width: 90px;">
                <select id="timelapse-unit-input" class="piw-select" style="flex: 1; min-width: 110px;">
                    <option value="hours">Hours</option>
                    <option value="minutes">Minutes</option>
                </select>
            </div>
            <button type="button" class="piw-btn piw-btn-primary" onclick="window.runTimeLapse()" style="width: 100%;">Start TimeLapse</button>
        </div>
    `;
    showModal("TimeLapse", html, "window-timelapse", "360px");
}

export function runTimeLapse() {
    const inputEl = document.getElementById('timelapse-duration-input');
    const unitEl = document.getElementById('timelapse-unit-input');
    if (!inputEl || !unitEl) return;

    const duration = parseFloat(inputEl.value);
    const unit = unitEl.value;

    if (!isNaN(duration) && duration > 0) {
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

            state.globalStats.playtime = (state.globalStats.playtime || 0) + simulatedSeconds;
            state.stats.battleModeTimer = (state.stats.battleModeTimer || 0) + simulatedSeconds;

            if (window.updateMainControl) window.updateMainControl();

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

            let pokeballObj = state.config.balance.items.pokeballs.find(b => b.name === itemName);
            let potionObj = !pokeballObj ? state.config.balance.items.potions.find(p => p.name === itemName || (p.name === 'Big' && itemName === 'Big Potion')) : null;

            let displayItemName = itemName;
            if (pokeballObj) {
                imgFolder = "Balls";
                basePrice = pokeballObj.price;
            } else if (potionObj) {
                imgFolder = "Potions";
                basePrice = potionObj.price;
                displayItemName = itemName === 'Big' ? 'Big Potion' : itemName;
            } else if (VITAMINS.includes(itemName)) {
                imgFolder = "Vitamins";
                const badges = state.trainer.badges || 0;
                let vitaminPrice = Math.max(2500, 2500 * badges); // default
                switch (itemName) {
                    case 'HP Up': vitaminPrice = Math.max(2500, 2500 * badges); break;
                    case 'Carbo Speed': vitaminPrice = Math.max(1250, 1250 * badges); break;
                    case 'Protein Atk': vitaminPrice = Math.max(1875, 1875 * badges); break;
                    case 'Calcium SpAtk': vitaminPrice = Math.max(1875, 1875 * badges); break;
                    case 'Iron Def': vitaminPrice = Math.max(1563, Math.ceil(1562.5 * badges)); break;
                    case 'Zinc SpDef': vitaminPrice = Math.max(1563, Math.ceil(1562.5 * badges)); break;
                }
                basePrice = vitaminPrice;
            } else {
                imgFolder = "Stones";
                const badges = state.trainer.badges || 0;
                basePrice = Math.max(2500, 2500 * badges);
            }

            itemsLootedHtml += `<span class="zzz-loot-chip"><img src="Assets/Items/${imgFolder}/${displayItemName}.png" class="zzz-loot-icon" title="${displayItemName}"> <b>${count.toLocaleString('en-US')}x</b> ${displayItemName}</span>`;

            valItemsLootedBuy += basePrice * count;
            valItemsLootedSold += (imgFolder === "Stones" || imgFolder === "Vitamins") ? Math.floor(basePrice * 0.1) * count : Math.floor(basePrice * 0.5) * count;
        }
    }
    if (!itemsLootedHtml) itemsLootedHtml = `<span class="zzz-empty-note">None</span>`;

    // Process Items Used
    let itemsUsedHtml = "";
    let valItemsUsedBuy = 0;

    if (results.ballsUsed > 0 && state.settings.activeBallTier >= 0) {
        const activeBall = state.config?.balance?.items?.pokeballs?.[state.settings.activeBallTier];
        if (activeBall) {
            const ballName = activeBall.name;
            const ballPrice = activeBall.price;
            itemsUsedHtml += `<span class="zzz-loot-chip"><img src="Assets/Items/Balls/${ballName}.png" class="zzz-loot-icon" title="${ballName}"> <b>${results.ballsUsed.toLocaleString('en-US')}x</b> ${ballName}</span>`;
            valItemsUsedBuy += ballPrice * results.ballsUsed;
        }
    }
    if (results.potionsUsed > 0 && state.settings.activePotionTier >= 0) {
        const activePotion = state.config?.balance?.items?.potions?.[state.settings.activePotionTier];
        if (activePotion) {
            const potionName = activePotion.name === 'Big' ? 'Big Potion' : activePotion.name;
            const potionPrice = activePotion.price;
            itemsUsedHtml += `<span class="zzz-loot-chip"><img src="Assets/Items/Potions/${potionName}.png" class="zzz-loot-icon" title="${potionName}"> <b>${results.potionsUsed.toLocaleString('en-US')}x</b> ${potionName}</span>`;
            valItemsUsedBuy += potionPrice * results.potionsUsed;
        }
    }
    if (!itemsUsedHtml) itemsUsedHtml = `<span class="zzz-empty-note">None</span>`;

    // Profit Calculations
    let profitSell = results.money + valItemsLootedSold + valPokemonsSold + valShiniesSold - valItemsUsedBuy;
    let profitBuy = results.money + valItemsLootedBuy + valPokemonsSold + valShiniesSold - valItemsUsedBuy;

    const html = `
        <div class="zzz-results-panel">
            <div class="zzz-results-header">
                <span class="zzz-status-pill zzz-status-success">TimeLapse Complete</span>
                <div class="zzz-meta-row">
                    <span><b>Time on hunt:</b> ${timeStr}</span>
                    <span><b>Battles:</b> ${results.encounters.toLocaleString('en-US')}</span>
                </div>
            </div>
            <div class="zzz-kpi-grid">
                <div class="zzz-kpi-card zzz-kpi-xp">
                    <div class="zzz-kpi-label">XP earned</div>
                    <div class="zzz-kpi-value">${Math.floor(results.xpEarned).toLocaleString('en-US')}</div>
                </div>
                <div class="zzz-kpi-card zzz-kpi-money">
                    <div class="zzz-kpi-label">Money earned</div>
                    <div class="zzz-kpi-value">$${Math.floor(results.money).toLocaleString('en-US')}</div>
                </div>
                <div class="zzz-kpi-card zzz-kpi-caught">
                    <div class="zzz-kpi-label">Pokemons caught</div>
                    <div class="zzz-kpi-value">${results.caught.toLocaleString('en-US')}</div>
                    <div class="zzz-kpi-sub">Value if sold: $${Math.floor(valPokemonsSold).toLocaleString('en-US')}</div>
                </div>
                <div class="zzz-kpi-card ${results.shinies > 0 ? 'zzz-kpi-shiny zzz-kpi-shiny-hit' : 'zzz-kpi-shiny'}">
                    <div class="zzz-kpi-label">Shiny caught</div>
                    <div class="zzz-kpi-value">${results.shinies.toLocaleString('en-US')}</div>
                    <div class="zzz-kpi-sub">Value if sold: $${Math.floor(valShiniesSold).toLocaleString('en-US')}</div>
                </div>
            </div>
            <div class="zzz-section-card">
                <div class="zzz-section-title">Items used</div>
                <div class="zzz-loot-grid">${itemsUsedHtml}</div>
            </div>
            <div class="zzz-section-card">
                <div class="zzz-section-title">Items collected</div>
                <div class="zzz-loot-grid">${itemsLootedHtml}</div>
            </div>
            <div class="zzz-kpi-grid" style="grid-template-columns: repeat(2, 1fr);">
                <div class="zzz-kpi-card">
                    <div class="zzz-kpi-label">Hunt Profit Sell</div>
                    <div class="zzz-kpi-value" style="color: ${profitSell >= 0 ? 'var(--piw-green)' : 'var(--piw-red)'};">$${Math.floor(profitSell).toLocaleString('en-US')}</div>
                </div>
                <div class="zzz-kpi-card">
                    <div class="zzz-kpi-label">Hunt Profit Buy</div>
                    <div class="zzz-kpi-value" style="color: ${profitBuy >= 0 ? 'var(--piw-green)' : 'var(--piw-red)'};">$${Math.floor(profitBuy).toLocaleString('en-US')}</div>
                </div>
            </div>
        </div>
    `;
    showModal("TimeLapse Results", html, "window-timelapse-results", "600px");
};

export function applyForceEncounterPreset(presetKey) {
    const presets = {
        weak: { q: 0.85, iv: 100 },
        regular: { q: 1.05, iv: 300 },
        uncommon: { q: 1.25, iv: 400 },
        rare: { q: 1.45, iv: 480 },
        epic: { q: 1.65, iv: 540 },
        legendary: { q: 1.85, iv: 570 },
        shiny: { q: 2.1, iv: 600 }
    };
    const preset = presets[presetKey];
    if (!preset) return;
    const qInput = document.getElementById('force-enc-q');
    const ivInput = document.getElementById('force-enc-sumiv');
    if (qInput) qInput.value = preset.q;
    if (ivInput) ivInput.value = preset.iv;
}
window.applyForceEncounterPreset = applyForceEncounterPreset;

export function showAddPokemonModal() {
    const html = `
        <div class="piw-card" style="display: flex; flex-direction: column; gap: 10px;">
            <div style="display: grid; grid-template-columns: 115px 1fr; align-items: center; gap: 8px;">
                <label for="force-enc-preset" style="font-size: 0.85rem; color: var(--piw-text-muted);">Quality Preset:</label>
                <select id="force-enc-preset" class="piw-select" onchange="window.applyForceEncounterPreset(this.value)">
                    <option value="">Custom</option>
                    <option value="weak">Weak (0.85x / 100 IV)</option>
                    <option value="regular">Regular (1.05x / 300 IV)</option>
                    <option value="uncommon">Uncommon (1.25x / 400 IV)</option>
                    <option value="rare">Rare (1.45x / 480 IV)</option>
                    <option value="epic">Epic (1.65x / 540 IV)</option>
                    <option value="legendary">Legendary (1.85x / 570 IV)</option>
                    <option value="shiny">Shiny (2.10x / 600 IV)</option>
                </select>

                <label for="force-enc-id" style="font-size: 0.85rem; color: var(--piw-text-muted);">Pokemon ID:</label>
                <input type="number" id="force-enc-id" class="piw-input" value="1" min="1" max="1025">

                <label for="force-enc-level" style="font-size: 0.85rem; color: var(--piw-text-muted);">Level:</label>
                <input type="number" id="force-enc-level" class="piw-input" value="5" min="1" max="100">

                <label for="force-enc-q" style="font-size: 0.85rem; color: var(--piw-text-muted);">QValue:</label>
                <input type="number" id="force-enc-q" class="piw-input" value="1.0" step="0.01" min="0.1">

                <label for="force-enc-sumiv" style="font-size: 0.85rem; color: var(--piw-text-muted);">SumIV:</label>
                <input type="number" id="force-enc-sumiv" class="piw-input" value="300" min="0" max="600">
            </div>
            <div style="display: flex; gap: 10px; margin-top: 6px;">
                <button type="button" class="piw-btn piw-btn-teal" onclick="window.forceNextEncounter()" style="flex: 1;">Fight Pokemon</button>
                <button type="button" class="piw-btn piw-btn-success" onclick="window.forceNextCapture()" style="flex: 1;">Capture Pokemon</button>
            </div>
        </div>
    `;
    showModal("Fight / Capture Pokemon", html, "window-force-encounter", "380px");
}

function getForceEncounterInputs() {
    const id = Math.max(1, parseInt(document.getElementById('force-enc-id')?.value, 10) || 1);
    const level = Math.max(1, parseInt(document.getElementById('force-enc-level')?.value, 10) || 1);
    const parsedQ = parseFloat(document.getElementById('force-enc-q')?.value);
    const qValue = isNaN(parsedQ) ? 1.0 : Math.max(0.1, parsedQ);
    const parsedSumIV = parseInt(document.getElementById('force-enc-sumiv')?.value, 10);
    const sumIV = isNaN(parsedSumIV) ? 300 : Math.min(600, Math.max(0, parsedSumIV));
    return { id, level, qValue, sumIV };
}

export function forceNextEncounter() {
    const { id, level, qValue, sumIV } = getForceEncounterInputs();

    state.nextForcedEncounter = {
        id,
        level,
        qValue,
        sumIV
    };
}

export function forceNextCapture() {
    const { id, level, qValue, sumIV } = getForceEncounterInputs();

    const pokemonBase = state.config?.pokemonMap
        ? (state.config.pokemonMap.get(Number(id)) || state.config.pokemonMap.get(id))
        : state.config?.pokemonData?.find(p => p && p.id === id);
    const resolvedBase = pokemonBase || state.config?.pokemonData?.[1];
    if (!resolvedBase) return;

    let qName = "Custom";
    if (qValue >= 2.0) qName = "Shiny";
    else if (qValue >= 1.81) qName = "Legendary";
    else if (qValue >= 1.6) qName = "Epic";
    else if (qValue >= 1.4) qName = "Rare";
    else if (qValue >= 1.2) qName = "Uncommon";
    else if (qValue >= 1.0) qName = "Regular";
    else qName = "Weak";

    const q = { name: qName, q: qValue };

    // Distribute SumIV randomly
    let remainingIV = sumIV;
    let ivs = { hp: 0, atk: 0, def: 0, spa: 0, spd: 0, spe: 0 };
    const statKeys = ['hp', 'atk', 'def', 'spa', 'spd', 'spe'];

    while (remainingIV > 0) {
        const availableStats = statKeys.filter(s => ivs[s] < 100);
        if (availableStats.length === 0) break; // All maxed out
        const randomStat = availableStats[Math.floor(Math.random() * availableStats.length)];
        ivs[randomStat]++;
        remainingIV--;
    }

    const currentStats = {
        hp: mathEngine.calculateHP(resolvedBase.hp, ivs.hp, level, q.q),
        atk: mathEngine.calculateStat(resolvedBase.atk, ivs.atk, level, q.q),
        def: mathEngine.calculateStat(resolvedBase.def, ivs.def, level, q.q),
        spa: mathEngine.calculateStat(resolvedBase.spa, ivs.spa, level, q.q),
        spd: mathEngine.calculateStat(resolvedBase.spd, ivs.spd, level, q.q),
        spe: mathEngine.calculateStat(resolvedBase.spe, ivs.spe, level, q.q),
    };

    const bst = resolvedBase.hp + resolvedBase.atk + resolvedBase.def + resolvedBase.spa + resolvedBase.spd + resolvedBase.spe;
    const totalIV = ivs.hp + ivs.atk + ivs.def + ivs.spa + ivs.spd + ivs.spe;

    let learned = [];
    if (resolvedBase.learnset) {
        for (const ls of resolvedBase.learnset) {
            if (level >= ls.level) {
                if (state.config.moves[ls.move]) {
                    learned.push({ ...state.config.moves[ls.move], name: ls.move });
                }
            }
        }
    }
    const moves = learned.slice(-4);

    let caughtPokemon = {
        id: resolvedBase.id,
        name: resolvedBase.name,
        types: [...resolvedBase.types],
        level: level,
        qualityName: qName,
        quality: q.q,
        ivs: ivs,
        currentStats: currentStats,
        maxHp: currentStats.hp,
        currentHp: currentStats.hp,
        evxp: mathEngine.calculateEVXP(bst, level, q.q, totalIV),
        evm: mathEngine.calculateEVM(bst, level, q.q, totalIV),
        pp: mathEngine.calculatePP(bst, level, q.q, totalIV),
        bst: bst,
        moves: moves,
        xp: mathEngine.calculateTotalXP(level),
        uuid: crypto.randomUUID()
    };

    // Tracking
    if (!state.stats.caughtSpecies) state.stats.caughtSpecies = {};
    if (!state.stats.caughtSpecies[resolvedBase.name]) {
        state.stats.caughtSpeciesCount = (state.stats.caughtSpeciesCount || 0) + 1;
    }
    state.stats.caughtSpecies[resolvedBase.name] = (state.stats.caughtSpecies[resolvedBase.name] || 0) + 1;

    if (!state.stats.seenSpecies) state.stats.seenSpecies = {};
    state.stats.seenSpecies[resolvedBase.name] = true;

    if (!state.stats.challengeCaughtSpecific) state.stats.challengeCaughtSpecific = {};
    state.stats.challengeCaughtSpecific[resolvedBase.name] = (state.stats.challengeCaughtSpecific[resolvedBase.name] || 0) + 1;
    state.stats.challengeCaughtSpecific[`${resolvedBase.name}_${qName}`] = (state.stats.challengeCaughtSpecific[`${resolvedBase.name}_${qName}`] || 0) + 1;

    if (qName === "Shiny") {
        state.stats.shiniesCaught = (state.stats.shiniesCaught || 0) + 1;
        state.stats.shiniesSeen = (state.stats.shiniesSeen || 0) + 1;
        if (!state.stats.caughtShiniesSpecies) state.stats.caughtShiniesSpecies = {};
        if (!state.stats.seenShiniesSpecies) state.stats.seenShiniesSpecies = {};
        state.stats.caughtShiniesSpecies[resolvedBase.name] = true;
        state.stats.seenShiniesSpecies[resolvedBase.name] = true;
    }

    if (!state.storage) state.storage = [];
    state.storage.push(caughtPokemon);
    state.stats.caught = (state.stats.caught || 0) + 1;

    // Track Professor Tasks
    let qN = qName || "Regular";
    if (["Weak", "Regular", "Uncommon", "Rare", "Epic", "Shiny", "Legendary", "Boss"].includes(qN)) {
        state.stats.weakPlusCaptures = (state.stats.weakPlusCaptures || 0) + 1;
    }
    if (["Regular", "Uncommon", "Rare", "Epic", "Shiny", "Legendary", "Boss"].includes(qN)) {
        state.stats.regularPlusCaptures = (state.stats.regularPlusCaptures || 0) + 1;
    }
    if (["Uncommon", "Rare", "Epic", "Shiny", "Legendary", "Boss"].includes(qN)) {
        state.stats.uncommonPlusCaptures = (state.stats.uncommonPlusCaptures || 0) + 1;
    }
    if (["Rare", "Epic", "Shiny", "Legendary", "Boss"].includes(qN)) {
        state.stats.rarePlusCaptures = (state.stats.rarePlusCaptures || 0) + 1;
    }
    if (["Epic", "Shiny", "Legendary", "Boss"].includes(qN)) {
        state.stats.epicPlusCaptures = (state.stats.epicPlusCaptures || 0) + 1;
    }

    if (level > (state.stats.highestLevelCaptured || 0)) state.stats.highestLevelCaptured = level;
    if (qValue > (state.stats.highestQualityCaptured || 0)) state.stats.highestQualityCaptured = qValue;
    if (totalIV > (state.stats.highestSumIVCaptured || 0)) state.stats.highestSumIVCaptured = totalIV;

    if (typeof window !== 'undefined' && typeof window.trackDailyChallenge === 'function') {
        window.trackDailyChallenge('catch_sum_iv', { sumIv: totalIV });
        window.trackDailyChallenge('catch_level', { level: level });
        window.trackDailyChallenge('catch_different_species', { species: resolvedBase.name });
        window.trackDailyChallenge('catch_rare', { quality: qName });
        window.trackDailyChallenge('catch_weak', { quality: qName });
        window.trackDailyChallenge('catch_species', { species: resolvedBase.name });
        window.trackDailyChallenge('catch_type', { types: resolvedBase.types });
    }

    if (window.updateUI) window.updateUI();
}

export function exportLog() {
    if (state.storageRef) {
        state.storageRef.exportLog(state);
    }
}

export function exportData() {
    try {
        const jsonString = JSON.stringify(state, (key, value) => {
            if (key === 'config' || key === 'dayCareRef' || key === 'storageRef') return undefined;
            return value;
        });
        const encrypted = encryptSaveText(jsonString);
        const safeName = (state.profileName || 'profile').replace(/[^a-zA-Z0-9_-]/g, '_');
        const blob = new Blob([encrypted], { type: 'text/plain' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `piw_save_${safeName}.txt`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    } catch (e) {
        console.error('Data export failed:', e);
        if (window.showGameAlert) {
            window.showGameAlert('Failed to export save data.');
        }
    }
}

export function triggerImportData() {
    const fileInput = document.getElementById('import-data-file-input');
    if (!fileInput) return;

    fileInput.onchange = async (e) => {
        const file = e.target.files && e.target.files[0];
        if (!file) return;

        try {
            const encryptedText = await file.text();
            const plainJson = decryptSaveText(encryptedText);
            const parsed = JSON.parse(plainJson);
            if (!parsed || typeof parsed !== 'object' || Array.isArray(parsed)) {
                throw new Error('Invalid save data structure.');
            }

            if (state.storageRef) {
                const storage = state.storageRef;
                const profileId = storage.currentProfileId || storage.createNewProfile();
                const serialized = JSON.stringify(parsed);
                storage._writeLocalStorageSafe(profileId, serialized);
                const disk = storage._getDiskStorage();
                if (disk) {
                    disk.writeProfile(profileId, serialized);
                }
                const res = storage.loadProfileIntoState(profileId, state);
                if (!res || !res.ok) {
                    throw new Error((res && res.error) || 'Failed to load restored profile.');
                }
                storage.save(state);
            }

            if (window.updateMainControl) window.updateMainControl();
            if (window.updateUI) window.updateUI();
            if (window.showGameAlert) {
                window.showGameAlert('Save data restored successfully!');
            }
        } catch (err) {
            console.error('Data restore failed:', err);
            if (window.showGameAlert) {
                window.showGameAlert(`Restore failed: ${err.message || 'Invalid save file.'}`);
            }
        } finally {
            fileInput.value = '';
        }
    };

    fileInput.value = '';
    fileInput.click();
}

export function activateCheat() {
    showCheatControlModal();
}