import { state } from '../../state.js';
import { updateUI } from '../../ui.js';
import { renderBackpackTab, showBackpack } from './index.js';
import { escapeHTML } from '../../utils/stringUtils.js';
import { calculateHP, calculateStat, calculatePP, calculateEVXP, calculateEVM, calculateTotalXP } from '../../mathEngine.js';

window.sellModeActive = false;
window.selectedForSale = new Set();

function getPokemonConfig(id) {
    return state.config?.pokemonMap
        ? (state.config.pokemonMap.get(Number(id)) || state.config.pokemonMap.get(id))
        : state.config?.pokemonData?.find(d => d.id === id);
}

function getLearnsetMoves(pokemonBase, level) {
    if (!pokemonBase?.learnset) return [];
    const learned = [];
    const learnedSet = new Set();
    for (const ls of pokemonBase.learnset) {
        if (level >= ls.level) {
            const moveName = ls.move;
            if (state.config?.moves?.[moveName] && !learnedSet.has(moveName)) {
                learnedSet.add(moveName);
                const moveData = { ...state.config.moves[moveName] };
                moveData.name = moveName;
                learned.push(moveData);
            }
        }
    }
    return learned.slice(-4);
}

function assignTrainingSlot(pkmn) {
    if (!state.dayCareRef) return;
    state.dayCareRef.slot2.pokemon = pkmn;

    const totalIV = pkmn.ivs.hp + pkmn.ivs.atk + pkmn.ivs.def + pkmn.ivs.spa + pkmn.ivs.spd + pkmn.ivs.spe;
    state.dayCareRef.slot2.requiredBattles = (pkmn.quality >= 2.0) ? totalIV * 2 : totalIV;
    if (state.dayCareRef.slot2.requiredBattles === 0) state.dayCareRef.slot2.requiredBattles = 1;

    if (totalIV >= 600) {
        state.dayCareRef.slot2.battles = state.dayCareRef.slot2.requiredBattles;
    } else {
        state.dayCareRef.slot2.battles = 0;
    }
}

function applyDittoBaseStats(p, baseData) {
    p.types = [...(baseData.types || [])];
    p.bst = baseData.hp + baseData.atk + baseData.def + baseData.spa + baseData.spd + baseData.spe;

    const v = p.vitamins || {};
    p.maxHp = calculateHP(baseData.hp, p.ivs.hp, p.level, p.quality, v.hp || 0);
    p.currentStats.hp = p.maxHp;
    p.currentStats.atk = calculateStat(baseData.atk, p.ivs.atk, p.level, p.quality, v.atk || 0);
    p.currentStats.def = calculateStat(baseData.def, p.ivs.def, p.level, p.quality, v.def || 0);
    p.currentStats.spa = calculateStat(baseData.spa, p.ivs.spa, p.level, p.quality, v.spa || 0);
    p.currentStats.spd = calculateStat(baseData.spd, p.ivs.spd, p.level, p.quality, v.spd || 0);
    p.currentStats.spe = calculateStat(baseData.spe, p.ivs.spe, p.level, p.quality, v.spe || 0);

    p.currentHp = Math.min(p.currentHp, p.maxHp);

    const totalIV = p.ivs.hp + p.ivs.atk + p.ivs.def + p.ivs.spa + p.ivs.spd + p.ivs.spe;
    p.evxp = calculateEVXP(p.bst, p.level, p.quality, totalIV);
    p.evm = calculateEVM(p.bst, p.level, p.quality, totalIV);
    p.pp = calculatePP(p.bst, p.level, p.quality, totalIV);

    p.moves = getLearnsetMoves(baseData, p.level);
}

// Helper to render a consistent Pokemon slot UI
function renderSlotUI(p, listName, origIndex, isDraggable) {
    if (!p.uuid) p.uuid = crypto.randomUUID();
    const safeUuid = escapeHTML(p.uuid);
    let sumIV = p.ivs.hp + p.ivs.atk + p.ivs.def + p.ivs.spa + p.ivs.spd + p.ivs.spe;
    let dragAttr = isDraggable ? `draggable="true" ondragstart="window.dragStart(event, '${listName}', '${safeUuid}')"` : '';
    let cursorStyle = isDraggable ? 'cursor: move;' : 'cursor: default;';
    let slotClass = '';
    let dataAttr = '';
    if (listName.toLowerCase() === 'storage') {
        slotClass = 'pokemon-storage-slot';
        dataAttr = `data-uuid="${safeUuid}"`;
    } else if (listName.toLowerCase() === 'safe') {
        slotClass = 'pokemon-safe-slot';
        dataAttr = `data-uuid="${safeUuid}"`;
    }

    let selectionStyle = '';
    let clickHandler = '';
    if (window.sellModeActive && listName.toLowerCase() === 'storage') {
        dragAttr = ''; // Disable drag in sell mode
        cursorStyle = 'cursor: pointer;';
        clickHandler = `onclick="window.toggleSaleSelection('${safeUuid}')"`;
        if (window.selectedForSale.has(p.uuid)) {
            selectionStyle = 'outline: 3px solid #00ff00; outline-offset: -3px; background: rgba(0,255,0,0.2);';
        }
    }

    let glowClass = "glow-weak";
    if (p.qualityName === "Shiny") glowClass = "glow-shiny";
    else if (p.qualityName === "Legendary") glowClass = "glow-legendary";
    else if (p.qualityName === "Epic") glowClass = "glow-epic";
    else if (p.qualityName === "Rare") glowClass = "glow-rare";
    else if (p.qualityName === "Uncommon") glowClass = "glow-uncommon";
    else if (p.qualityName === "Regular") glowClass = "glow-regular";

    let transformBtn = '';
    if (p.name === 'Ditto') {
        transformBtn = `<div onclick="event.stopPropagation(); window.openDittoTransformModal('${safeUuid}')" style="position: absolute; bottom: 2cqw; right: 2cqw; cursor: pointer; background: #9b59b6; color: white; border-radius: 50%; width: 20cqw; height: 20cqw; text-align: center; display: flex; align-items: center; justify-content: center; font-size: 14cqw; font-weight: bold; z-index: 3;" title="Transform">T</div>`;
    }

    let finalId = p.transformedIntoId || p.id;
    let finalImgSrc = window.getSpriteUrl(finalId, p.qualityName === 'Shiny');
    let imageHtml = `<img src="${finalImgSrc}" class="${glowClass}" style="height: 100%; width: 100%; object-fit: contain; z-index: 1;" onerror="this.src='data:image/gif;base64,R0lGODlhAQABAAD/ACwAAAAAAQABAAACADs='">`;

    const listKey = listName.toLowerCase();
    const cardBorderColor = listKey === 'storage'
        ? 'rgba(255, 255, 255, 0.35)'
        : (listKey === 'safe' ? 'rgba(241, 196, 15, 0.75)' : 'rgba(52, 152, 219, 0.75)');

    return `
        <div class="${slotClass}" ${dataAttr} style="background: #2c3e50; border: 2px solid ${cardBorderColor}; border-radius: 10px; aspect-ratio: 1 / 1.5; display: flex; flex-direction: column; align-items: center; justify-content: space-between; padding: 4%; box-sizing: border-box; position: relative; container-type: inline-size; overflow: hidden; ${cursorStyle}; width: 100%; ${selectionStyle}" title="Q=${p.quality.toFixed(2)} & ∑IV=${sumIV}" ${dragAttr} ${clickHandler}>
            <div onclick="event.stopPropagation(); window.showPokemonStatsByUuid('${safeUuid}')" style="position: absolute; top: 2cqw; right: 2cqw; cursor: pointer; background: #34495e; color: white; border-radius: 50%; width: 20cqw; height: 20cqw; text-align: center; display: flex; align-items: center; justify-content: center; font-size: 14cqw; font-weight: bold; z-index: 3;" title="View Info">i</div>

            <div style="font-size: 16cqw; font-weight: bold; margin-top: 10cqw; margin-bottom: 1cqw; display: flex; align-items: center; justify-content: center; text-align: center; line-height: 1.1; z-index: 1; color: white;">${escapeHTML(p.name)}</div>

            <div style="flex: 1; min-height: 0; width: 100%; display: flex; align-items: center; justify-content: center; position: relative; margin-bottom: 1cqw;">
                ${imageHtml}
            </div>

            <div style="font-size: 13cqw; color: #bdc3c7; line-height: 1.1; z-index: 1;">Lv. ${p.level}</div>
            <div style="font-size: 13cqw; color: #f1c40f; line-height: 1.1; z-index: 1;">Q: ${p.quality.toFixed(2)}</div>
            <div style="font-size: 13cqw; color: #3498db; line-height: 1.1; z-index: 1; margin-bottom: 1cqw;">∑IV: ${sumIV}</div>
            ${transformBtn}
        </div>
    `;
}

window.toggleSaleSelection = function(uuid) {
    if (window.selectedForSale.has(uuid)) {
        window.selectedForSale.delete(uuid);
    } else {
        window.selectedForSale.add(uuid);
    }
    renderBackpackTab('pokemon');
};

// Global filter state
window.pokemonFilters = window.pokemonFilters || {
    name: '', minLvl: '', maxLvl: '', minQ: '', maxQ: '', minIV: '', maxIV: '', breedableOnly: false
};
window.showPokemonFilters = window.showPokemonFilters || false;
if (typeof window.showSafeSpots === 'undefined') {
    window.showSafeSpots = true;
}

window.togglePokemonFilters = function() {
    window.showPokemonFilters = !window.showPokemonFilters;
    renderBackpackTab('pokemon');
};

window.toggleSafeSpots = function() {
    if (!state.settings) state.settings = {};
    const current = state.settings.showSafeSpots ?? true;
    state.settings.showSafeSpots = !current;
    window.showSafeSpots = state.settings.showSafeSpots;
    renderBackpackTab('pokemon');
};

window.clearPokemonFilter = function() {
    window.pokemonFilters = { name: '', minLvl: '', maxLvl: '', minQ: '', maxQ: '', minIV: '', maxIV: '', breedableOnly: false };
};

window.clickEmptyBreedSlot = function() {
    if (window.pokemonFilters.breedableOnly) {
        window.clearPokemonFilter();
    } else {
        window.clearPokemonFilter();
        window.pokemonFilters.breedableOnly = true;
    }
    renderBackpackTab('pokemon');
};

export function renderPokemonTab(area) {
    const filters = window.pokemonFilters;

    let sellControlsHtml = '';
    if (window.sellModeActive) {
        sellControlsHtml = `
            <div style="margin-bottom: 10px; text-align: center;">
                <button onclick="window.selectAllForSale()" style="padding: 5px 15px; margin-right: 5px; background: #3498db; color: white; border: none; border-radius: 4px; cursor: pointer;">Select All in Storage</button>
                <button onclick="window.sellSelectedPokemon()" style="padding: 5px 15px; margin-right: 5px; background: #e74c3c; color: white; border: none; border-radius: 4px; cursor: pointer;">Sell Selected</button>
                <button onclick="window.cancelSellMode()" style="padding: 5px 15px; background: #7f8c8d; color: white; border: none; border-radius: 4px; cursor: pointer;">Cancel</button>
            </div>
        `;
    }

    const activeTabStyle = 'background: linear-gradient(to bottom, #3498db, #2980b9); color: white; border: 1px solid #3498db; box-shadow: 0 2px 4px rgba(0,0,0,0.2);';
    const inactiveTabStyle = 'background: transparent; color: rgba(255, 255, 255, 0.7); border: 1px solid rgba(255, 255, 255, 0.2);';

    let content = `
        <div style="display: flex; justify-content: center; gap: 8px; margin-bottom: 5px;">
            <button onclick="window.togglePokemonFilters()" style="${window.showPokemonFilters ? activeTabStyle : inactiveTabStyle} border-radius: 15px; padding: 5px 15px; font-weight: bold; cursor: pointer; font-size: 13px; transition: all 0.2s;">🔍 Filters</button>
            <button onclick="window.toggleSafeSpots()" style="${window.showSafeSpots ? activeTabStyle : inactiveTabStyle} border-radius: 15px; padding: 5px 15px; font-weight: bold; cursor: pointer; font-size: 13px; transition: all 0.2s;">🔒 Safe</button>
        </div>
        <div id="pokemon-filters" style="display: ${window.showPokemonFilters ? 'flex' : 'none'}; flex-wrap: wrap; align-items: center; justify-content: center; gap: 6px; background: rgba(20, 28, 38, 0.92); border: 1px solid #3498db; border-radius: 10px; padding: 8px 10px; margin-bottom: 10px; box-shadow: 0 4px 12px rgba(0,0,0,0.45); font-size: 12px; color: #ecf0f1;">
            <div style="display: flex; align-items: center; gap: 4px;">
                <span style="color: #95a5a6; font-weight: bold;">Name</span>
                <input type="text" id="pfilter-name" placeholder="Search..." value="${escapeHTML(filters.name)}" oninput="window.updatePokemonFilter('name', this.value)" class="pfilter-input" style="width: 75px;">
            </div>
            <div style="display: flex; align-items: center; gap: 3px;">
                <span style="color: #95a5a6; font-weight: bold;">Lv</span>
                <input type="number" id="pfilter-minLvl" placeholder="Min" value="${escapeHTML(filters.minLvl)}" oninput="window.updatePokemonFilter('minLvl', this.value)" class="pfilter-input" style="width: 38px;">
                <span style="color: #7f8c8d;">-</span>
                <input type="number" id="pfilter-maxLvl" placeholder="Max" value="${escapeHTML(filters.maxLvl)}" oninput="window.updatePokemonFilter('maxLvl', this.value)" class="pfilter-input" style="width: 38px;">
            </div>
            <div style="display: flex; align-items: center; gap: 3px;">
                <span style="color: #95a5a6; font-weight: bold;">Q</span>
                <input type="number" id="pfilter-minQ" placeholder="Min" value="${escapeHTML(filters.minQ)}" oninput="window.updatePokemonFilter('minQ', this.value)" class="pfilter-input" style="width: 38px;">
                <span style="color: #7f8c8d;">-</span>
                <input type="number" id="pfilter-maxQ" placeholder="Max" value="${escapeHTML(filters.maxQ)}" oninput="window.updatePokemonFilter('maxQ', this.value)" class="pfilter-input" style="width: 38px;">
            </div>
            <div style="display: flex; align-items: center; gap: 3px;">
                <span style="color: #95a5a6; font-weight: bold;">∑IV</span>
                <input type="number" id="pfilter-minIV" placeholder="Min" value="${escapeHTML(filters.minIV)}" oninput="window.updatePokemonFilter('minIV', this.value)" class="pfilter-input" style="width: 40px;">
                <span style="color: #7f8c8d;">-</span>
                <input type="number" id="pfilter-maxIV" placeholder="Max" value="${escapeHTML(filters.maxIV)}" oninput="window.updatePokemonFilter('maxIV', this.value)" class="pfilter-input" style="width: 40px;">
            </div>
            <button onclick="window.clearPokemonFilter(); window.renderBackpackTab('pokemon');" style="background: rgba(231, 76, 60, 0.2); color: #e74c3c; border: 1px solid rgba(231, 76, 60, 0.5); border-radius: 6px; padding: 4px 8px; font-size: 11px; font-weight: bold; cursor: pointer; transition: all 0.2s;">Clear</button>
            <style>
                #pokemon-filters .pfilter-input {
                    background: #16202a;
                    color: #ecf0f1;
                    border: 1px solid #34495e;
                    border-radius: 6px;
                    padding: 4px 6px;
                    font-size: 12px;
                    outline: none;
                    -moz-appearance: textfield;
                    transition: border-color 0.2s;
                }
                #pokemon-filters .pfilter-input:focus {
                    border-color: #3498db;
                }
                #pokemon-filters input::-webkit-outer-spin-button,
                #pokemon-filters input::-webkit-inner-spin-button {
                    -webkit-appearance: none;
                    margin: 0;
                }
            </style>
        </div>
        ${sellControlsHtml}
    `;

    window.showSafeSpots = state.settings?.showSafeSpots ?? true;
    const showSafe = window.showSafeSpots;
    const activeFlex = showSafe
        ? 'flex: 0 0 calc((100% - 76px) * 2 / 7 + 17px);'
        : 'flex: 0 0 calc((100% - 59px) * 2 / 7 + 17px);';
    const storageFlex = showSafe
        ? 'flex: 0 0 calc((100% - 76px) * 3 / 7 + 22px);'
        : 'flex: 0 0 calc((100% - 59px) * 5 / 7 + 32px);';
    const storageCols = showSafe ? 3 : 5;
    const safeFlex = 'flex: 0 0 calc((100% - 76px) * 2 / 7 + 17px);';

    const basePanelStyle = 'box-sizing: border-box; border-radius: 8px; background: rgba(0, 0, 0, 0.22); box-shadow: inset 0 1px 0 rgba(255, 255, 255, 0.05), 0 2px 6px rgba(0, 0, 0, 0.25); padding: 6px; display: flex; flex-direction: column; min-width: 0; min-height: 0; overflow-x: hidden;';

    content += `
        <div style="display: flex; gap: 10px; width: 100%; height: 100%; min-height: 0; overflow-x: hidden; flex-grow: 1;">
            <!-- Column 1: Active -->
            <div style="${activeFlex} align-self: flex-start; max-height: 100%; border: 2px solid rgba(52, 152, 219, 0.75); ${basePanelStyle}">
                <div id="active-scroll-container" style="display: grid; grid-template-columns: repeat(2, 1fr); grid-auto-rows: max-content; gap: 5px; overflow-y: auto; overflow-x: hidden; align-content: start; flex-grow: 1; min-height: 0;">
    `;


    for (let i = 0; i < 8; i++) {
        let p = null;
        let listName = '';
        let origIndex = 0;

        if (i < 6) {
            if (i < state.party.length) {
                p = state.party[i];
                listName = 'party';
                origIndex = i;
            }
        } else if (i === 6) {
            if (!state.stats.hasSeenDaycare) continue; // Hide if Daycare hasn't been opened
            if (state.breeding.length > 0) {
                p = state.breeding[0];
                listName = 'breeding';
                origIndex = 0;
            }
        } else if (i === 7) {
            if (!state.stats.hasSeenDaycare) continue; // Hide if Daycare hasn't been opened
            if (state.training.length > 0) {
                p = state.training[0];
                listName = 'training';
                origIndex = 0;
            }
        }

        if (p) {
            content += `<div ondragover="window.dragOver(event)" ondrop="window.handleDrop(event, '${listName}')" style="box-sizing: border-box; min-width: 0;">` + renderSlotUI(p, listName, origIndex, true) + `</div>`;
        } else {
            let label = i < 6 ? `Party<br>#${i+1}` : (i === 6 ? 'Breeding<br>Spot' : 'Training<br>Spot');
            let dropTarget = i < 6 ? 'party' : (i === 6 ? 'breeding' : 'training');
            let activeBreedStyle = '';
            if (i === 6 && window.pokemonFilters.breedableOnly) {
                activeBreedStyle = ' border: 2px solid #00ff00; background: rgba(0, 255, 0, 0.2); font-weight: bold; color: #fff;';
            }
            let extraAttrs = (i === 6) ? `onclick="window.clickEmptyBreedSlot()" style="border: 1px dashed #3498db; aspect-ratio: 1 / 1.5; display: flex; align-items: center; justify-content: center; container-type: inline-size; color: #777; box-sizing: border-box; cursor: pointer;${activeBreedStyle}"` : `style="border: 1px dashed #3498db; aspect-ratio: 1 / 1.5; display: flex; align-items: center; justify-content: center; container-type: inline-size; color: #777; box-sizing: border-box;"`;
            content += `<div ondragover="window.dragOver(event)" ondrop="window.handleDrop(event, '${dropTarget}')" ${extraAttrs}><span style="font-size: 15cqw; text-align: center;">${label}</span></div>`;
        }
    }


    content += `
                </div>
            </div>

            <!-- Column 2: Storage -->
            <div ondragover="window.dragOver(event)" ondrop="window.handleDrop(event, 'storage')" style="${storageFlex} border: 2px solid rgba(255, 255, 255, 0.35); ${basePanelStyle}">
                <div id="storage-scroll-container" style="display: grid; grid-template-columns: repeat(${storageCols}, 1fr); grid-auto-rows: max-content; gap: 5px; overflow-y: auto; overflow-x: hidden; align-content: start; flex-grow: 1; min-height: 0;">
    `;

    for (let i = 0; i < state.storage.length; i++) {
        let p = state.storage[i];
        content += renderSlotUI(p, 'storage', i, true);
    }
    content += `<div style="border: 1px dashed rgba(255, 255, 255, 0.35); border-radius: 6px; aspect-ratio: 1 / 1.5; display: flex; align-items: center; justify-content: center; text-align: center; font-size: 14px; color: #aaa; box-sizing: border-box;" title="Empty Slot">Storage<br>+</div>`;

    content += `
                </div>
            </div>`;

    if (showSafe) {
        content += `
            <!-- Column 3: Safe -->
            <div id="safe-section" ondragover="window.dragOver(event)" ondrop="window.handleDrop(event, 'safe')" style="${safeFlex} align-self: flex-start; max-height: 100%; border: 2px solid rgba(241, 196, 15, 0.75); ${basePanelStyle}">
                <div id="safe-scroll-container" style="display: grid; grid-template-columns: repeat(2, 1fr); grid-auto-rows: max-content; gap: 5px; overflow-y: auto; overflow-x: hidden; align-content: start; flex-grow: 1; min-height: 0;">
        `;

        for (let i = 0; i < state.safe.length; i++) {
            let p = state.safe[i];
            content += renderSlotUI(p, 'safe', i, true);
        }
        content += `<div style="border: 1px dashed rgba(241, 196, 15, 0.75); border-radius: 6px; aspect-ratio: 1 / 1.5; display: flex; align-items: center; justify-content: center; text-align: center; font-size: 14px; color: #aaa; cursor: pointer; box-sizing: border-box;" title="Empty Slot">Safe<br>+</div>`;

        content += `
                </div>
            </div>`;
    }

    content += `
        </div>
        <div style="font-size: 10px; text-align: center; margin-top: 5px; color: #ccc;">Drag and Drop to move Pokémon.</div>
    `;


    // Capture focus state
    let activeElementId = document.activeElement ? document.activeElement.id : null;
    let selectionStart = 0;
    let selectionEnd = 0;
    if (activeElementId && document.activeElement.tagName === 'INPUT') {
        try {
            selectionStart = document.activeElement.selectionStart;
            selectionEnd = document.activeElement.selectionEnd;
        } catch(e) {}
    }

    // Capture previous scroll positions
    let prevActiveScroll = 0;
    let prevStorageScroll = 0;
    let prevSafeScroll = 0;
    const oldActive = document.getElementById('active-scroll-container');
    const oldStorage = document.getElementById('storage-scroll-container');
    const oldSafe = document.getElementById('safe-scroll-container');
    if (oldActive) prevActiveScroll = oldActive.scrollTop;
    if (oldStorage) prevStorageScroll = oldStorage.scrollTop;
    if (oldSafe) prevSafeScroll = oldSafe.scrollTop;

    const doc = new DOMParser().parseFromString(content, 'text/html');
    area.replaceChildren(...doc.body.childNodes);

    // Restore focus state
    if (activeElementId) {
        let el = document.getElementById(activeElementId);
        if (el) {
            el.focus();
            if (el.tagName === 'INPUT') {
                try {
                    el.setSelectionRange(selectionStart, selectionEnd);
                } catch(e) {}
            }
        }
    }

    // Restore scroll positions
    const newActive = document.getElementById('active-scroll-container');
    const newStorage = document.getElementById('storage-scroll-container');
    const newSafe = document.getElementById('safe-scroll-container');
    if (newActive) newActive.scrollTop = prevActiveScroll;
    if (newStorage) newStorage.scrollTop = prevStorageScroll;
    if (newSafe) newSafe.scrollTop = prevSafeScroll;

    // Apply filters immediately to initial render
    setTimeout(() => window.applyPokemonFilters(), 0);
}

window.updatePokemonFilter = function(key, val) {
    window.pokemonFilters[key] = val;
    window.applyPokemonFilters();
};

window.applyPokemonFilters = function() {
    const filters = window.pokemonFilters;

    // Compute breedable set if needed
    let breedableSet = null;
    if (filters.breedableOnly) {
        breedableSet = new Set();
        const bySpecies = new Map();
        const allMons = [...state.storage, ...state.safe];
        for (const p of allMons) {
            if (p.quality < 1.99) {
                let list = bySpecies.get(p.id);
                if (!list) {
                    list = [];
                    bySpecies.set(p.id, list);
                }
                list.push(p);
            }
        }
        for (const list of bySpecies.values()) {
            if (list.length < 2) continue;
            list.sort((a, b) => a.quality - b.quality);
            for (let i = 0; i < list.length; i++) {
                const prevMatches = i > 0 && Math.round(Math.abs(list[i].quality - list[i - 1].quality) * 100) <= 5;
                const nextMatches = i < list.length - 1 && Math.round(Math.abs(list[i + 1].quality - list[i].quality) * 100) <= 5;
                if (prevMatches || nextMatches) {
                    breedableSet.add(list[i]);
                }
            }
        }
    }

    const nameFilter = filters.name ? filters.name.toLowerCase() : '';
    const minLvl = filters.minLvl !== '' && filters.minLvl !== undefined && filters.minLvl !== null ? parseInt(filters.minLvl, 10) : null;
    const maxLvl = filters.maxLvl !== '' && filters.maxLvl !== undefined && filters.maxLvl !== null ? parseInt(filters.maxLvl, 10) : null;
    const minQ = filters.minQ !== '' && filters.minQ !== undefined && filters.minQ !== null ? parseFloat(filters.minQ) : null;
    const maxQ = filters.maxQ !== '' && filters.maxQ !== undefined && filters.maxQ !== null ? parseFloat(filters.maxQ) : null;
    const minIV = filters.minIV !== '' && filters.minIV !== undefined && filters.minIV !== null ? parseInt(filters.minIV, 10) : null;
    const maxIV = filters.maxIV !== '' && filters.maxIV !== undefined && filters.maxIV !== null ? parseInt(filters.maxIV, 10) : null;

    const filterFn = (p) => {
        if (nameFilter && !p.name.toLowerCase().includes(nameFilter)) return false;
        if (minLvl !== null && !isNaN(minLvl) && p.level < minLvl) return false;
        if (maxLvl !== null && !isNaN(maxLvl) && p.level > maxLvl) return false;
        if (minQ !== null && !isNaN(minQ) && p.quality < minQ) return false;
        if (maxQ !== null && !isNaN(maxQ) && p.quality > maxQ) return false;
        let sumIV = p.ivs.hp + p.ivs.atk + p.ivs.def + p.ivs.spa + p.ivs.spd + p.ivs.spe;
        if (minIV !== null && !isNaN(minIV) && sumIV < minIV) return false;
        if (maxIV !== null && !isNaN(maxIV) && sumIV > maxIV) return false;

        if (filters.breedableOnly) {
            if (p.quality >= 1.99 || !breedableSet || !breedableSet.has(p)) return false;
        }

        return true;
    };

    const displayedBreedableKeys = new Set();
    const storageMap = new Map(state.storage.map(x => [x.uuid, x]));
    const safeMap = new Map(state.safe.map(x => [x.uuid, x]));

    // Filter Storage
    const storageSlots = document.querySelectorAll('.pokemon-storage-slot');
    storageSlots.forEach(slot => {
        const uuid = slot.getAttribute('data-uuid');
        const p = storageMap.get(uuid);
        if (p) {
            let show = filterFn(p);
            if (show && filters.breedableOnly) {
                const key = p.id + '_' + p.quality.toFixed(2);
                if (displayedBreedableKeys.has(key)) show = false;
                else displayedBreedableKeys.add(key);
            }
            slot.style.display = show ? 'flex' : 'none';
        }
    });

    // Filter Safe
    const safeSlots = document.querySelectorAll('.pokemon-safe-slot');
    safeSlots.forEach(slot => {
        const uuid = slot.getAttribute('data-uuid');
        const p = safeMap.get(uuid);
        if (p) {
            let show = filterFn(p);
            if (show && filters.breedableOnly) {
                const key = p.id + '_' + p.quality.toFixed(2);
                if (displayedBreedableKeys.has(key)) show = false;
                else displayedBreedableKeys.add(key);
            }
            slot.style.display = show ? 'flex' : 'none';
        }
    });
};

export function dragStart(event, sourceCol, uuid) {
    event.dataTransfer.setData('text/plain', JSON.stringify({ sourceCol, uuid }));
}

export function dragOver(event) {
    event.preventDefault();
}

export function handleDrop(event, targetCol) {
    event.preventDefault();
    const data = event.dataTransfer.getData('text/plain');
    if (!data) return;
    let sourceCol, uuid;
    try {
        const parsed = JSON.parse(data);
        sourceCol = parsed.sourceCol;
        uuid = parsed.uuid;
    } catch(e) { return; }

    const sCol = sourceCol.toLowerCase();
    const tCol = targetCol.toLowerCase();

    if (sCol === tCol) return;

    let p = null;
    let index = -1;
    if (sCol === 'party') { index = state.party.findIndex(x => x.uuid === uuid); p = state.party[index]; }
    else if (sCol === 'breeding') { index = state.breeding.findIndex(x => x.uuid === uuid); p = state.breeding[index]; }
    else if (sCol === 'training') { index = state.training.findIndex(x => x.uuid === uuid); p = state.training[index]; }
    else if (sCol === 'storage') { index = state.storage.findIndex(x => x.uuid === uuid); p = state.storage[index]; }
    else if (sCol === 'safe') { index = state.safe.findIndex(x => x.uuid === uuid); p = state.safe[index]; }

    if (!p) return;

    // Daycare interaction constraints
    if (sCol === 'breeding' && state.dayCareRef && state.dayCareRef.slot1.isBreeding) {
        alert("Cannot move Pokémon while it is actively breeding!");
        return;
    }

    if (tCol === 'breeding' && state.dayCareRef && state.dayCareRef.slot1.isBreeding) {
        alert("Cannot replace Pokémon while breeding is in progress!");
        return;
    }

    if (tCol === 'breeding' && p.quality >= 1.99) {
        alert("Cannot breed a Pokémon with Q >= 1.99!");
        return;
    }

    if (tCol === 'party' && state.party.length >= 6) {
        alert("Party is full!");
        return;
    }

    if (sCol === 'party' && state.party.length <= 1 && tCol !== 'party') {
        alert("You must have at least one Pokémon in your party!");
        return;
    }

    // --- Phase 1: Remove from source ---
    if (sCol === 'party') state.party.splice(index, 1);
    else if (sCol === 'breeding') {
        state.breeding.splice(index, 1);
        if (state.dayCareRef) {
            state.dayCareRef.slot1.pokemon = null;
            state.dayCareRef.slot1.battles = 0;
            state.dayCareRef.slot1.isBreeding = false;
            state.dayCareRef.slot1.isFinished = false;
        }
        window.pokemonFilters.name = '';
        window.pokemonFilters.minQ = '';
        window.pokemonFilters.maxQ = '';
    }
    else if (sCol === 'training') {
        state.training.splice(index, 1);
        if (state.dayCareRef) {
            state.dayCareRef.slot2.pokemon = null;
            state.dayCareRef.slot2.battles = 0;
        }
    }
    else if (sCol === 'storage') state.storage.splice(index, 1);
    else if (sCol === 'safe') state.safe.splice(index, 1);

    // --- Phase 2: Insert to target and handle potential swaps ---

    let displacedPokemon = null;

    if (tCol === 'party') {
        state.party.push(p);
    }
    else if (tCol === 'storage') {
        state.storage.push(p);
    }
    else if (tCol === 'safe') {
        state.safe.push(p);
    }
    else if (tCol === 'training') {
        if (state.training.length > 0) {
            displacedPokemon = state.training[0]; // Will need to send back to source
            state.training[0] = p;
        } else {
            state.training.push(p);
        }
        if (state.dayCareRef) {
            assignTrainingSlot(p);
        }
    }
    else if (tCol === 'breeding') {
        if (state.breeding.length > 0) {
            const currentP = state.breeding[0];
            // Check breeding criteria
            if (currentP.id !== p.id || Math.round(Math.abs(currentP.quality - p.quality) * 100) > 5) {
                // Fails criteria -> simple swap
                displacedPokemon = currentP;
                state.breeding[0] = p;
                if (state.dayCareRef) {
                    state.dayCareRef.slot1.pokemon = p;
                    state.dayCareRef.slot1.battles = 0;
                    state.dayCareRef.slot1.isBreeding = false;
                    state.dayCareRef.slot1.isFinished = false;
                }
                if (window.clearPokemonFilter) window.clearPokemonFilter();
                window.pokemonFilters.name = p.name;
                window.pokemonFilters.minQ = Math.max(0.8, p.quality - 0.05).toFixed(2);
                window.pokemonFilters.maxQ = (p.quality + 0.05).toFixed(2);
            } else {
                // Meets criteria -> Consume both, merge into highest IV
                const sumIV_p = p.ivs.hp + p.ivs.atk + p.ivs.def + p.ivs.spa + p.ivs.spd + p.ivs.spe;
                const sumIV_currentP = currentP.ivs.hp + currentP.ivs.atk + currentP.ivs.def + currentP.ivs.spa + currentP.ivs.spd + currentP.ivs.spe;
                const parentWithBestIVs = (sumIV_p > sumIV_currentP) ? p : currentP;

                // Reconstruct official baby by shallow cloning + nested spreads per AGENTS.md
                const newPokemon = {
                    ...parentWithBestIVs,
                    types: [...(parentWithBestIVs.types || [])],
                    ivs: { ...parentWithBestIVs.ivs },
                    ...(parentWithBestIVs.evs ? { evs: { ...parentWithBestIVs.evs } } : {}),
                    currentStats: parentWithBestIVs.currentStats ? { ...parentWithBestIVs.currentStats } : {},
                    vitamins: { hp: 0, atk: 0, def: 0, spa: 0, spd: 0, spe: 0 },
                    moves: (parentWithBestIVs.moves || []).map(m => ({ ...m })),
                    uuid: crypto.randomUUID(),
                    lastQBonus: 0,
                    trainingCyclesCompleted: 0
                };

                // Check for pre-evolution based on current region, stepping back to base stage
                const regionName = state.currentRegionName || 'Kanto';
                const regionIdField = regionName.toLowerCase() + '_id';
                const visitedEvoIds = new Set([newPokemon.id]);
                while (state.config.evolutionParents && state.config.evolutionParents[newPokemon.id] !== undefined) {
                    const parentId = state.config.evolutionParents[newPokemon.id];
                    if (visitedEvoIds.has(parentId)) break;
                    visitedEvoIds.add(parentId);
                    const parentBaseData = getPokemonConfig(parentId);

                    if (parentBaseData && parentBaseData[regionIdField] !== undefined) {
                        newPokemon.id = parentBaseData.id;
                        newPokemon.name = parentBaseData.name;
                        newPokemon.types = [...(parentBaseData.types || [])];
                    } else {
                        break;
                    }
                }

                // Keep the max Q Value
                newPokemon.quality = Math.max(p.quality, currentP.quality);

                // Map Quality Tier if Q >= 1.5, 1.25, etc.
                if (newPokemon.quality >= 1.81) newPokemon.qualityName = "Legendary";
                else if (newPokemon.quality >= 1.60) newPokemon.qualityName = "Epic";
                else if (newPokemon.quality >= 1.40) newPokemon.qualityName = "Rare";
                else if (newPokemon.quality >= 1.20) newPokemon.qualityName = "Uncommon";
                else if (newPokemon.quality >= 1.00) newPokemon.qualityName = "Regular";
                else newPokemon.qualityName = "Weak";

                // Shinies keep shiny Q name if applicable, but only if Shiny Breeder upgrade is bought
                if (p.qualityName === "Shiny" || currentP.qualityName === "Shiny") {
                    if (state.stats.upgrades && state.stats.upgrades.daycareTier >= 5) {
                        newPokemon.qualityName = "Shiny";
                    }
                }

                // Penalty of 10% on the highest level rounded up
                const highestLevel = Math.max(p.level, currentP.level);
                const levelPenalty = Math.ceil(highestLevel * 0.1);
                newPokemon.level = highestLevel - levelPenalty;
                if (newPokemon.level < 1) newPokemon.level = 1;

                // Fetch pokemon base to reconstruct stats
                const pBase = getPokemonConfig(newPokemon.id);
                if (pBase) {
                    newPokemon.bst = pBase.hp + pBase.atk + pBase.def + pBase.spa + pBase.spd + pBase.spe;

                    // Stats
                    newPokemon.maxHp = calculateHP(pBase.hp, newPokemon.ivs.hp, newPokemon.level, newPokemon.quality, 0);
                    newPokemon.currentStats = {
                        hp: newPokemon.maxHp,
                        atk: calculateStat(pBase.atk, newPokemon.ivs.atk, newPokemon.level, newPokemon.quality, 0),
                        def: calculateStat(pBase.def, newPokemon.ivs.def, newPokemon.level, newPokemon.quality, 0),
                        spa: calculateStat(pBase.spa, newPokemon.ivs.spa, newPokemon.level, newPokemon.quality, 0),
                        spd: calculateStat(pBase.spd, newPokemon.ivs.spd, newPokemon.level, newPokemon.quality, 0),
                        spe: calculateStat(pBase.spe, newPokemon.ivs.spe, newPokemon.level, newPokemon.quality, 0)
                    };
                    newPokemon.currentHp = newPokemon.maxHp;

                    // Moves
                    newPokemon.moves = getLearnsetMoves(pBase, newPokemon.level);
                }

                // Calculate EVXP, EVM, PP, and XP
                const newTotalIV = newPokemon.ivs.hp + newPokemon.ivs.atk + newPokemon.ivs.def + newPokemon.ivs.spa + newPokemon.ivs.spd + newPokemon.ivs.spe;

                newPokemon.evxp = calculateEVXP(newPokemon.bst, newPokemon.level, newPokemon.quality, newTotalIV);
                newPokemon.evm = calculateEVM(newPokemon.bst, newPokemon.level, newPokemon.quality, newTotalIV);
                newPokemon.pp = calculatePP(newPokemon.bst, newPokemon.level, newPokemon.quality, newTotalIV);
                newPokemon.xp = calculateTotalXP(newPokemon.level);

                state.breeding[0] = newPokemon;
                if (state.dayCareRef) {
                    state.dayCareRef.slot1.pokemon = newPokemon;
                    state.dayCareRef.slot1.battles = 0;
                    state.dayCareRef.slot1.isBreeding = true;
                    state.dayCareRef.slot1.isFinished = false;
                }
                // Clear filter as breed started
                if (window.clearPokemonFilter) window.clearPokemonFilter();
            }
        } else {
            // Do not auto-start breeding. Just insert the first pokemon.
            state.breeding.push(p);
            if (state.dayCareRef) {
                state.dayCareRef.slot1.pokemon = p;
                state.dayCareRef.slot1.battles = 0;
                state.dayCareRef.slot1.isBreeding = false;
                state.dayCareRef.slot1.isFinished = false;
            }
            if (window.clearPokemonFilter) window.clearPokemonFilter();
            window.pokemonFilters.name = p.name;

            // Allow a range of +- 0.05 around the quality
            let minQ = Math.max(0.8, p.quality - 0.05).toFixed(2);
            let maxQ = (p.quality + 0.05).toFixed(2);
            window.pokemonFilters.minQ = minQ;
            window.pokemonFilters.maxQ = maxQ;
        }
    }

    // --- Phase 3: Handle displaced (swapped) pokemon ---
    if (displacedPokemon) {
        if (sCol === 'party') {
            state.party.splice(index, 0, displacedPokemon);
        } else if (sCol === 'storage') {
            state.storage.splice(index, 0, displacedPokemon);
        } else if (sCol === 'safe') {
            state.safe.splice(index, 0, displacedPokemon);
        } else if (sCol === 'training') {
            state.training.push(displacedPokemon);
            if (state.dayCareRef) {
                assignTrainingSlot(displacedPokemon);
            }
        } else if (sCol === 'breeding') {
            state.breeding.push(displacedPokemon);
            if (state.dayCareRef) {
                state.dayCareRef.slot1.pokemon = displacedPokemon;
                state.dayCareRef.slot1.battles = 0;
                state.dayCareRef.slot1.isBreeding = false; // reset state
                state.dayCareRef.slot1.isFinished = false;
            }
            window.pokemonFilters.name = displacedPokemon.name;
            window.pokemonFilters.minQ = Math.max(0.8, displacedPokemon.quality - 0.05).toFixed(2);
            window.pokemonFilters.maxQ = (displacedPokemon.quality + 0.05).toFixed(2);
        }
    }

    updateUI();
    renderBackpackTab('pokemon');
}

window.startSellMode = function() {
    window.sellModeActive = true;
    window.selectedForSale.clear();

    // Open backpack directly to pokemon tab
    state.backpack.activePocket = 'pokemon';
    if (typeof window.showBackpackAndFocus === 'function') {
        window.showBackpackAndFocus('pokemon');
    } else {
        const backpackWin = document.getElementById('window-backpack') || document.getElementById('backpack-modal');
        if (backpackWin) {
            backpackWin.style.display = backpackWin.id === 'window-backpack' ? 'flex' : 'block';
        } else {
            showBackpack();
        }
        renderBackpackTab('pokemon');
    }
};

window.cancelSellMode = function() {
    window.sellModeActive = false;
    window.selectedForSale.clear();
    if (typeof window.closeBackpackModal === 'function') {
        window.closeBackpackModal();
    } else {
        if (typeof window.closeModal === 'function') window.closeModal('window-backpack');
        const backpackWin = document.getElementById('window-backpack') || document.getElementById('backpack-modal');
        if (backpackWin) backpackWin.style.display = 'none';
    }

    // Return to Market UI
    if (typeof window.navigateToLocation === 'function') {
        window.navigateToLocation("PokeCenter & PokeMarket");
    }
};

window.selectAllForSale = function() {
    const storageMons = state.storage || [];
    const filters = window.pokemonFilters || {};
    const nameFilter = filters.name ? filters.name.toLowerCase() : '';
    let minLvl = filters.minLvl !== '' && filters.minLvl !== undefined ? parseFloat(filters.minLvl) : null;
    let maxLvl = filters.maxLvl !== '' && filters.maxLvl !== undefined ? parseFloat(filters.maxLvl) : null;
    let minQ = filters.minQ !== '' && filters.minQ !== undefined ? parseFloat(filters.minQ) : null;
    let maxQ = filters.maxQ !== '' && filters.maxQ !== undefined ? parseFloat(filters.maxQ) : null;
    let minIV = filters.minIV !== '' && filters.minIV !== undefined ? parseFloat(filters.minIV) : null;
    let maxIV = filters.maxIV !== '' && filters.maxIV !== undefined ? parseFloat(filters.maxIV) : null;

    storageMons.forEach(p => {
        let sumIV = p.ivs.hp + p.ivs.atk + p.ivs.def + p.ivs.spa + p.ivs.spd + p.ivs.spe;
        let isVisible = true;

        if (nameFilter && !(p.name || String(p.id)).toLowerCase().includes(nameFilter)) isVisible = false;
        if (minLvl !== null && !isNaN(minLvl) && p.level < minLvl) isVisible = false;
        if (maxLvl !== null && !isNaN(maxLvl) && p.level > maxLvl) isVisible = false;
        if (minQ !== null && !isNaN(minQ) && p.quality < minQ) isVisible = false;
        if (maxQ !== null && !isNaN(maxQ) && p.quality > maxQ) isVisible = false;
        if (minIV !== null && !isNaN(minIV) && sumIV < minIV) isVisible = false;
        if (maxIV !== null && !isNaN(maxIV) && sumIV > maxIV) isVisible = false;

        if (isVisible && !window.selectedForSale.has(p.uuid)) {
            window.selectedForSale.add(p.uuid);
        }
    });

    renderBackpackTab('pokemon');
};

window.sellSelectedPokemon = function() {
    if (window.selectedForSale.size === 0) return;

    let totalGain = 0;
    let numSold = 0;

    state.storage = (state.storage || []).filter(p => {
        if (window.selectedForSale.has(p.uuid)) {
            let val = Math.floor(calculatePP(p.bst, p.level, p.quality, p.ivs.hp + p.ivs.atk + p.ivs.def + p.ivs.spa + p.ivs.spd + p.ivs.spe));
            totalGain += val;
            numSold++;
            return false; // Remove
        }
        return true; // Keep
    });

    state.trainer.money += totalGain;
    updateUI();
    alert(`Sold ${numSold} Pokemon for $${totalGain}!`);

    window.cancelSellMode();
};

window.selectDittoTransformTarget = function(idStr) {
    // Un-highlight all
    const allItems = document.querySelectorAll('.ditto-transform-option');
    allItems.forEach(el => {
        el.style.outline = 'none';
        el.style.background = '#2c3e50';
    });

    // Highlight selected
    const selected = document.getElementById('ditto-transform-option-' + idStr);
    if (selected) {
        selected.style.outline = '3px solid #00ff00';
        selected.style.background = 'rgba(0, 255, 0, 0.2)';
    }

    // Update global state
    window.dittoSelectedTransformId = parseInt(idStr);
};

window.openDittoTransformModal = function(uuid) {
    let p = null;
    let idx = state.party.findIndex(x => x.uuid === uuid);
    if (idx !== -1) { p = state.party[idx]; }
    else {
        idx = state.breeding.findIndex(x => x.uuid === uuid);
        if (idx !== -1) { p = state.breeding[idx]; }
        else {
            idx = state.training.findIndex(x => x.uuid === uuid);
            if (idx !== -1) { p = state.training[idx]; }
            else {
                idx = state.storage.findIndex(x => x.uuid === uuid);
                if (idx !== -1) { p = state.storage[idx]; }
                else {
                    idx = state.safe.findIndex(x => x.uuid === uuid);
                    if (idx !== -1) { p = state.safe[idx]; }
                }
            }
        }
    }

    if (!p) return;

    // Reset global selected target
    window.dittoSelectedTransformId = null;

    let allPokemonHtml = '';

    // Combine all arrays
    const allArrays = [
        ...state.party,
        ...state.breeding,
        ...state.training,
        ...state.storage,
        ...state.safe
    ];

    // Deduplicate and collect IDs
    const uniqueIds = new Set();
    allArrays.forEach(targetP => {
        uniqueIds.add(targetP.id);
    });

    const sortedIds = Array.from(uniqueIds).sort((a, b) => a - b);

    sortedIds.forEach(id => {
        const pd = getPokemonConfig(id);
        if(!pd) return;

        let imgSrc = window.getSpriteUrl(id, p.qualityName === 'Shiny');
        const safeId = escapeHTML(id);
        allPokemonHtml += `
            <div id="ditto-transform-option-${safeId}" class="ditto-transform-option" onclick="window.selectDittoTransformTarget('${safeId}')" style="cursor: pointer; background: #2c3e50; border: 2px solid #3498db; border-radius: 10px; padding: 10px; text-align: center; transition: all 0.1s;">
                <img src="${imgSrc}" style="width: 50px; height: 50px; object-fit: contain;">
                <div style="color: white; font-size: 12px; margin-top: 5px;">${escapeHTML(pd.name)}</div>
            </div>
        `;
    });

    const safeDittoUuid = escapeHTML(uuid);
    const html = `
        <div style="text-align: center; color: white;">
            <h3>Select a Pokemon to Transform into</h3>
            <div style="display: grid; grid-template-columns: repeat(auto-fill, minmax(80px, 1fr)); gap: 10px; max-height: 60vh; overflow-y: auto; padding: 10px;">
                ${allPokemonHtml}
            </div>
            <div style="margin-top: 20px; display: flex; justify-content: center; gap: 10px;">
                <button onclick="window.transformDitto('${safeDittoUuid}')" style="padding: 10px 20px; background: #2ecc71; color: white; border: none; border-radius: 4px; cursor: pointer; font-weight: bold;">Choose</button>
                <button onclick="if(window.windowManager) window.windowManager.closeDynamicWindow('window-ditto-transform')" style="padding: 10px 20px; background: #e74c3c; color: white; border: none; border-radius: 4px; cursor: pointer;">Cancel</button>
                <button onclick="window.transformDitto('${safeDittoUuid}', 132)" style="padding: 10px 20px; background: #f39c12; color: white; border: none; border-radius: 4px; cursor: pointer;">Restore</button>
            </div>
        </div>
    `;

    if (window.showModal) {
        window.showModal('Ditto Transform', html, 'window-ditto-transform', '50%', '60%');
    }
};

window.transformDitto = function(dittoUuid, targetIdOverride) {
    if(window.windowManager) window.windowManager.closeDynamicWindow('window-ditto-transform');

    let targetId = targetIdOverride || window.dittoSelectedTransformId;
    if (!targetId) return; // No selection made

    let p = null;
    const allArrays = [
        state.party,
        state.breeding,
        state.training,
        state.storage,
        state.safe
    ];

    for (let arr of allArrays) {
        let found = arr.find(x => x.uuid === dittoUuid);
        if (found) { p = found; break; }
    }

    if (!p) return;

    if (Number(targetId) === 132) {
        // Revert transformation
        if (p.isTransformed) {
            p.isTransformed = false;
            p.transformedIntoId = null;
            p.transformedIntoName = null;
            p.id = 132;
            p.name = 'Ditto';

            const newBase = getPokemonConfig(132);
            if (newBase) {
                applyDittoBaseStats(p, newBase);
            }
        }
    } else {
        // Transform
        const targetBase = getPokemonConfig(targetId);
        if (!targetBase) return;

        p.isTransformed = true;
        p.transformedIntoId = targetBase.id;
        p.transformedIntoName = targetBase.name;

        applyDittoBaseStats(p, targetBase);
    }

    // Attempt to manually save
    try {
        if (window.storageRef) {
            window.storageRef.save(state);
        }
    } catch(e) {}

    updateUI();
    renderBackpackTab('pokemon');
};
