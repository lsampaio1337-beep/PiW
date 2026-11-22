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
    const dittoBase = baseData.id === 132 ? baseData : getPokemonConfig(132);
    const hpBase = dittoBase ? dittoBase.hp : baseData.hp;
    p.maxHp = calculateHP(hpBase, p.ivs.hp, p.level, p.quality, v.hp || 0);
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
    const listClass = listKey === 'storage' ? 'is-storage' : (listKey === 'safe' ? 'is-safe' : 'is-party');
    const qLower = (p.qualityName || 'weak').toLowerCase();
    const qClass = `is-qtier-${qLower}`;

    return `
        <div class="bp-poke-card ${listClass} ${qClass} ${slotClass}" ${dataAttr} style="aspect-ratio: 1 / 1.5; container-type: inline-size; overflow: hidden; ${cursorStyle}; width: 100%; ${selectionStyle}" title="Q=${p.quality.toFixed(2)} & ∑IV=${sumIV}" ${dragAttr} ${clickHandler}>
            <div onclick="event.stopPropagation(); window.showPokemonStatsByUuid('${safeUuid}')" style="position: absolute; top: 2cqw; right: 2cqw; cursor: pointer; background: rgba(15, 23, 42, 0.85); border: 1px solid rgba(148, 163, 184, 0.45); color: white; border-radius: 50%; width: 20cqw; height: 20cqw; text-align: center; display: flex; align-items: center; justify-content: center; font-size: 14cqw; font-weight: bold; z-index: 3;" title="View Info">i</div>

            <div style="font-size: 16cqw; font-weight: bold; margin-top: 10cqw; margin-bottom: 1cqw; display: flex; align-items: center; justify-content: center; text-align: center; line-height: 1.1; z-index: 1; color: var(--piw-text-primary);">${escapeHTML(p.name)}</div>

            <div style="flex: 1; min-height: 0; width: 100%; display: flex; align-items: center; justify-content: center; position: relative; margin-bottom: 1cqw;">
                ${imageHtml}
            </div>

            <div style="font-size: 13cqw; color: #cbd5e1; line-height: 1.1; z-index: 1;">Lv. ${p.level}</div>
            <div style="font-size: 13cqw; color: #fbbf24; line-height: 1.1; z-index: 1;">Q: ${p.quality.toFixed(2)}</div>
            <div style="font-size: 13cqw; color: #38bdf8; line-height: 1.1; z-index: 1; margin-bottom: 1cqw;">∑IV: ${sumIV}</div>
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
window.pokemonStorageSort = window.pokemonStorageSort || 'default';
window.showPokemonFilters = window.showPokemonFilters || false;
if (typeof window.showSafeSpots === 'undefined') {
    window.showSafeSpots = true;
}

window.setPokemonStorageSort = function(sortBy) {
    window.pokemonStorageSort = sortBy || 'default';
    renderBackpackTab('pokemon');
};

function getSortedPokemonEntries(list) {
    const entries = (list || []).map((p, idx) => ({ p, idx }));
    const mode = window.pokemonStorageSort || 'default';
    if (mode === 'default') return entries;
    const sumIV = (p) => p.ivs ? (p.ivs.hp + p.ivs.atk + p.ivs.def + p.ivs.spa + p.ivs.spd + p.ivs.spe) : 0;
    entries.sort((a, b) => {
        if (mode === 'level') return (b.p.level - a.p.level) || (b.p.quality - a.p.quality);
        if (mode === 'quality') return (b.p.quality - a.p.quality) || (b.p.level - a.p.level);
        if (mode === 'sumiv') return (sumIV(b.p) - sumIV(a.p)) || (b.p.quality - a.p.quality);
        if (mode === 'name') return String(a.p.name).localeCompare(String(b.p.name));
        if (mode === 'id') return (Number(a.p.id) - Number(b.p.id)) || (b.p.quality - a.p.quality);
        return a.idx - b.idx;
    });
    return entries;
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

    let content = `
        <div style="display: flex; flex-direction: column; height: 100%; min-height: 0; gap: 8px;">
        <div style="display: flex; justify-content: center; align-items: center; gap: 10px; flex-wrap: wrap; flex-shrink: 0;">
            <div class="piw-tab-bar">
                <button onclick="window.togglePokemonFilters()" class="piw-tab-btn ${window.showPokemonFilters ? 'is-active' : ''}">🔍 Filters</button>
                <button onclick="window.toggleSafeSpots()" class="piw-tab-btn ${window.showSafeSpots ? 'is-active' : ''}">🔒 Safe</button>
            </div>
            <select id="pfilter-sort" class="piw-select" style="padding: 4px 10px; font-size: 12px;" onchange="window.setPokemonStorageSort(this.value)">
                <option value="default" ${window.pokemonStorageSort === 'default' ? 'selected' : ''}>Sort: Default</option>
                <option value="level" ${window.pokemonStorageSort === 'level' ? 'selected' : ''}>Sort: Level ↓</option>
                <option value="quality" ${window.pokemonStorageSort === 'quality' ? 'selected' : ''}>Sort: Quality ↓</option>
                <option value="sumiv" ${window.pokemonStorageSort === 'sumiv' ? 'selected' : ''}>Sort: Sum IV ↓</option>
                <option value="name" ${window.pokemonStorageSort === 'name' ? 'selected' : ''}>Sort: Name A-Z</option>
                <option value="id" ${window.pokemonStorageSort === 'id' ? 'selected' : ''}>Sort: Dex #</option>
            </select>
        </div>
        <div id="pokemon-filters" class="piw-filter-bar" style="display: ${window.showPokemonFilters ? 'flex' : 'none'}; flex-shrink: 0;">
            <div class="piw-filter-group">
                <span class="piw-filter-label">Name</span>
                <input type="text" id="pfilter-name" placeholder="Search..." value="${escapeHTML(filters.name)}" oninput="window.updatePokemonFilter('name', this.value)" class="piw-filter-input pfilter-input" style="width: 85px;">
            </div>
            <div class="piw-filter-group">
                <span class="piw-filter-label">Lv</span>
                <input type="number" id="pfilter-minLvl" placeholder="Min" value="${escapeHTML(filters.minLvl)}" oninput="window.updatePokemonFilter('minLvl', this.value)" class="piw-filter-input pfilter-input" style="width: 42px;">
                <span style="color: #64748b;">-</span>
                <input type="number" id="pfilter-maxLvl" placeholder="Max" value="${escapeHTML(filters.maxLvl)}" oninput="window.updatePokemonFilter('maxLvl', this.value)" class="piw-filter-input pfilter-input" style="width: 42px;">
            </div>
            <div class="piw-filter-group">
                <span class="piw-filter-label">Q</span>
                <input type="number" id="pfilter-minQ" placeholder="Min" value="${escapeHTML(filters.minQ)}" oninput="window.updatePokemonFilter('minQ', this.value)" class="piw-filter-input pfilter-input" style="width: 42px;">
                <span style="color: #64748b;">-</span>
                <input type="number" id="pfilter-maxQ" placeholder="Max" value="${escapeHTML(filters.maxQ)}" oninput="window.updatePokemonFilter('maxQ', this.value)" class="piw-filter-input pfilter-input" style="width: 42px;">
            </div>
            <div class="piw-filter-group">
                <span class="piw-filter-label">∑IV</span>
                <input type="number" id="pfilter-minIV" placeholder="Min" value="${escapeHTML(filters.minIV)}" oninput="window.updatePokemonFilter('minIV', this.value)" class="piw-filter-input pfilter-input" style="width: 44px;">
                <span style="color: #64748b;">-</span>
                <input type="number" id="pfilter-maxIV" placeholder="Max" value="${escapeHTML(filters.maxIV)}" oninput="window.updatePokemonFilter('maxIV', this.value)" class="piw-filter-input pfilter-input" style="width: 44px;">
            </div>
            <button onclick="window.clearPokemonFilter(); window.renderBackpackTab('pokemon');" style="background: rgba(231, 76, 60, 0.2); color: #f87171; border: 1px solid rgba(231, 76, 60, 0.45); border-radius: 6px; padding: 4px 10px; font-size: 11px; font-weight: bold; cursor: pointer; transition: all 0.2s;">Clear</button>
            <style>
                #pokemon-filters .pfilter-input { -moz-appearance: textfield; }
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
    const gridCols = showSafe ? '2fr 3fr 2fr' : '2fr 5fr';
    const storageCols = showSafe ? 3 : 5;

    const basePanelStyle = 'box-sizing: border-box; border-radius: 10px; background: rgba(15, 23, 34, 0.65); box-shadow: inset 0 1px 0 rgba(255, 255, 255, 0.05), 0 2px 6px rgba(0, 0, 0, 0.25); padding: 8px; display: flex; flex-direction: column; min-width: 0; min-height: 0; overflow: hidden;';

    const daycareCount = (state.breeding ? state.breeding.length : 0) + (state.training ? state.training.length : 0);
    const activeCountText = state.stats?.hasSeenDaycare ? `${state.party.length}+${daycareCount}` : `${state.party.length}`;

    content += `
        <div style="display: grid; grid-template-columns: ${gridCols}; gap: 10px; width: 100%; flex: 1; min-height: 0; overflow: hidden; align-items: start;">
            <!-- Column 1: Active -->
            <div style="align-self: start; max-height: 100%; border: 1.5px solid rgba(56, 189, 248, 0.6); ${basePanelStyle}">
                <div class="backpack-col-header" style="color: #7dd3fc;">
                    <span>Active</span>
                    <span>${activeCountText}</span>
                </div>
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
            <div ondragover="window.dragOver(event)" ondrop="window.handleDrop(event, 'storage')" style="align-self: stretch; max-height: 100%; border: 1.5px solid rgba(148, 163, 184, 0.4); ${basePanelStyle}">
                <div class="backpack-col-header" style="color: #e2e8f0;">
                    <span>Storage</span>
                    <span>${state.storage.length}</span>
                </div>
                <div id="storage-scroll-container" style="display: grid; grid-template-columns: repeat(${storageCols}, 1fr); grid-auto-rows: max-content; gap: 5px; overflow-y: auto; overflow-x: hidden; align-content: start; flex-grow: 1; min-height: 0;">
    `;

    for (const { p, idx } of getSortedPokemonEntries(state.storage)) {
        content += renderSlotUI(p, 'storage', idx, true);
    }
    content += `<div style="border: 1px dashed rgba(255, 255, 255, 0.35); border-radius: 6px; aspect-ratio: 1 / 1.5; display: flex; align-items: center; justify-content: center; text-align: center; font-size: 14px; color: #aaa; box-sizing: border-box;" title="Empty Slot">Storage<br>+</div>`;

    content += `
                </div>
            </div>`;

    if (showSafe) {
        content += `
            <!-- Column 3: Safe -->
            <div id="safe-section" ondragover="window.dragOver(event)" ondrop="window.handleDrop(event, 'safe')" style="align-self: start; max-height: 100%; border: 1.5px solid rgba(251, 191, 36, 0.65); ${basePanelStyle}">
                <div class="backpack-col-header" style="color: #fde68a;">
                    <span>Safe</span>
                    <span>${state.safe.length}</span>
                </div>
                <div id="safe-scroll-container" style="display: grid; grid-template-columns: repeat(2, 1fr); grid-auto-rows: max-content; gap: 5px; overflow-y: auto; overflow-x: hidden; align-content: start; flex-grow: 1; min-height: 0;">
        `;

        for (const { p, idx } of getSortedPokemonEntries(state.safe)) {
            content += renderSlotUI(p, 'safe', idx, true);
        }
        content += `<div style="border: 1px dashed rgba(241, 196, 15, 0.75); border-radius: 6px; aspect-ratio: 1 / 1.5; display: flex; align-items: center; justify-content: center; text-align: center; font-size: 14px; color: #aaa; cursor: pointer; box-sizing: border-box;" title="Empty Slot">Safe<br>+</div>`;

        content += `
                </div>
            </div>`;
    }

    content += `
        </div>
        <div style="font-size: 11px; text-align: center; color: #94a3b8; flex-shrink: 0;">Drag and drop to move Pokémon.</div>
        </div>
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
                if (newPokemon.megaOriginalId !== undefined && newPokemon.megaOriginalId !== null) {
                    newPokemon.id = newPokemon.megaOriginalId;
                }
                delete newPokemon.megaOriginalId;
                delete newPokemon.megaExpiresAt;

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
            <div id="ditto-transform-option-${safeId}" class="piw-card is-interactive ditto-transform-option" onclick="window.selectDittoTransformTarget('${safeId}')" style="padding: 10px; text-align: center;">
                <img src="${imgSrc}" style="width: 50px; height: 50px; object-fit: contain;">
                <div style="color: var(--piw-text-primary); font-size: 12px; font-weight: 600; margin-top: 5px;">${escapeHTML(pd.name)}</div>
            </div>
        `;
    });

    const safeDittoUuid = escapeHTML(uuid);
    const html = `
        <div style="text-align: center; color: white; padding: 10px;">
            <h3 style="margin-top: 0; font-size: 15px; color: var(--piw-accent-teal);">Select a Pokemon to Transform into</h3>
            <div style="display: grid; grid-template-columns: repeat(auto-fill, minmax(85px, 1fr)); gap: 10px; max-height: 55vh; overflow-y: auto; padding: 8px;">
                ${allPokemonHtml}
            </div>
            <div style="margin-top: 14px; display: flex; justify-content: center; gap: 10px;">
                <button class="piw-btn piw-btn-success" onclick="window.transformDitto('${safeDittoUuid}')">Choose</button>
                <button class="piw-btn piw-btn-danger" onclick="if(window.windowManager) window.windowManager.closeDynamicWindow('window-ditto-transform')">Cancel</button>
                <button class="piw-btn piw-btn-warning" onclick="window.transformDitto('${safeDittoUuid}', 132)">Restore</button>
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
