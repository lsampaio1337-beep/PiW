import { state } from '../../state.js';
import { updateUI } from '../../ui.js';
import { renderBackpackTab } from './index.js';

window.sellModeActive = false;
window.selectedForSale = new Set();
import { calculateEV } from '../../mathEngine.js';

// Helper to render a consistent Pokemon slot UI
function renderSlotUI(p, listName, origIndex, isDraggable) {
    if (!p.uuid) p.uuid = Math.random().toString(36).substring(2, 15);
    let imgSrc = `Assets/Pokemon Sprites/${p.qualityName === 'Shiny' ? p.id + '_shiny' : p.id}.png`;
    let sumIV = p.ivs.hp + p.ivs.atk + p.ivs.def + p.ivs.spa + p.ivs.spd + p.ivs.spe;
    let dragAttr = isDraggable ? `draggable="true" ondragstart="window.dragStart(event, '${listName}', '${p.uuid}')"` : '';
    let cursorStyle = isDraggable ? 'cursor: move;' : 'cursor: default;';
    let slotClass = '';
    let dataAttr = '';
    if (listName.toLowerCase() === 'storage') {
        slotClass = 'pokemon-storage-slot';
        dataAttr = `data-uuid="${p.uuid}"`;
    } else if (listName.toLowerCase() === 'safe') {
        slotClass = 'pokemon-safe-slot';
        dataAttr = `data-uuid="${p.uuid}"`;
    }

    let selectionStyle = '';
    let clickHandler = '';
    if (window.sellModeActive) {
        dragAttr = ''; // Disable drag in sell mode everywhere
        cursorStyle = 'cursor: pointer;';
        clickHandler = `onclick="window.toggleSaleSelection('${p.uuid}')"`;
        if (window.selectedForSale.has(p.uuid)) {
            selectionStyle = 'outline: 3px solid #00ff00; outline-offset: -3px; background: rgba(0,255,0,0.2);';
        }
    }

    let glowClass = "glow-weak";
    if (p.qualityName === "Shiny") glowClass = "glow-shiny";
    else if (p.qualityName === "Epic") glowClass = "glow-epic";
    else if (p.qualityName === "Rare") glowClass = "glow-rare";
    else if (p.qualityName === "Uncommon") glowClass = "glow-uncommon";
    else if (p.qualityName === "Regular") glowClass = "glow-regular";

    return `
        <div class="${slotClass}" ${dataAttr} style="border: 1px solid #777; aspect-ratio: 1 / 1.3; display: flex; flex-direction: column; align-items: center; justify-content: space-between; padding: 4%; box-sizing: border-box; background: rgba(0,0,0,0.5); position: relative; container-type: inline-size; overflow: hidden; ${cursorStyle}; width: 100%; ${selectionStyle}" title="Q=${p.quality.toFixed(2)} & ∑IV=${sumIV}" ${dragAttr} ${clickHandler}>
            <span style="position: absolute; top: 0; left: 0; font-size: 12cqw; background: black; padding: 2cqw; z-index: 2;">${p._tag || ''}</span>
            <div onclick="event.stopPropagation(); window.showPokemonStatsByUuid('${p.uuid}')" style="position: absolute; top: 2cqw; right: 2cqw; cursor: pointer; background: #34495e; color: white; border-radius: 50%; width: 20cqw; height: 20cqw; text-align: center; display: flex; align-items: center; justify-content: center; font-size: 14cqw; font-weight: bold; z-index: 3;" title="View Info">i</div>

            <div style="flex: 1; width: 100%; display: flex; align-items: center; justify-content: center; position: relative;">
                <img src="${imgSrc}" class="${glowClass}" style="height: 140%; width: 140%; max-height: 140%; object-fit: contain; z-index: 1;" onerror="this.src='data:image/gif;base64,R0lGODlhAQABAAD/ACwAAAAAAQABAAACADs='">
            </div>
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
    name: '', minLvl: '', maxLvl: '', minQ: '', maxQ: '', minIV: '', maxIV: ''
};

export function renderPokemonTab(area) {
    const filters = window.pokemonFilters;

    let sellControlsHtml = '';
    if (window.sellModeActive) {
        let selectedEVTotal = 0;
        let selectedCount = 0;

        // Sum EV dynamically for selected items
        const allPokemonLists = [...state.storage, ...state.safe, ...state.party, ...state.breeding, ...state.training];
        window.selectedForSale.forEach(uuid => {
            const pkmn = allPokemonLists.find(p => p.uuid === uuid);
            if (pkmn) {
                selectedCount++;

                const totalIV = pkmn.ivs.hp + pkmn.ivs.atk + pkmn.ivs.def + pkmn.ivs.spa + pkmn.ivs.spd + pkmn.ivs.spe;
                const bst = pkmn.baseStats.hp + pkmn.baseStats.atk + pkmn.baseStats.def + pkmn.baseStats.spa + pkmn.baseStats.spd + pkmn.baseStats.spe;
                selectedEVTotal += calculateEV(bst, pkmn.level, pkmn.quality, totalIV);

            }
        });

        sellControlsHtml = `
            <div style="margin-bottom: 10px; text-align: center; background: #222; padding: 10px; border-radius: 8px;">
                <div style="margin-bottom: 10px; color: #f1c40f; font-weight: bold; font-size: 16px;">Selected: ${selectedCount} Pokemon - Value: ${Math.floor(selectedEVTotal).toLocaleString()}</div>
                <button onclick="window.selectAllVisibleStorage()" style="padding: 8px 15px; margin-right: 5px; background: #3498db; color: white; border: none; border-radius: 4px; cursor: pointer;">Select All Visible Storage</button>
                <button onclick="window.sellSelectedPokemon()" style="padding: 8px 15px; margin-right: 5px; background: #e74c3c; color: white; border: none; border-radius: 4px; cursor: pointer;">Sell Selected (${Math.floor(selectedEVTotal).toLocaleString()})</button>
                <button onclick="window.cancelSellMode()" style="padding: 8px 15px; background: #7f8c8d; color: white; border: none; border-radius: 4px; cursor: pointer;">Cancel Selling</button>
            </div>
        `;
    }

    let content = `
        <div style="text-align: center; margin-bottom: 5px;">
            <button onclick="document.getElementById('pokemon-filters').style.display = document.getElementById('pokemon-filters').style.display === 'none' ? 'block' : 'none';" style="background: none; border: 1px solid #777; color: white; cursor: pointer; border-radius: 4px; padding: 2px 5px;">🔍 Toggle Filters</button>
        </div>
        <div id="pokemon-filters" style="display: none; background: rgba(0,0,0,0.7); padding: 5px; border-radius: 5px; margin-bottom: 10px; font-size: 12px; text-align: center;">
            <input type="text" id="pfilter-name" placeholder="Name" value="${filters.name}" oninput="window.updatePokemonFilter('name', this.value)" style="width: 80px; margin: 2px;">
            <input type="number" id="pfilter-minLvl" placeholder="Min Lv" value="${filters.minLvl}" oninput="window.updatePokemonFilter('minLvl', this.value)" style="width: 50px; margin: 2px; -moz-appearance: textfield;">
            <input type="number" id="pfilter-maxLvl" placeholder="Max Lv" value="${filters.maxLvl}" oninput="window.updatePokemonFilter('maxLvl', this.value)" style="width: 50px; margin: 2px; -moz-appearance: textfield;">
            <input type="number" id="pfilter-minQ" placeholder="Min Q" value="${filters.minQ}" oninput="window.updatePokemonFilter('minQ', this.value)" style="width: 50px; margin: 2px; -moz-appearance: textfield;">
            <input type="number" id="pfilter-maxQ" placeholder="Max Q" value="${filters.maxQ}" oninput="window.updatePokemonFilter('maxQ', this.value)" style="width: 50px; margin: 2px; -moz-appearance: textfield;">
            <input type="number" id="pfilter-minIV" placeholder="Min ∑IV" value="${filters.minIV}" oninput="window.updatePokemonFilter('minIV', this.value)" style="width: 60px; margin: 2px; -moz-appearance: textfield;">
            <input type="number" id="pfilter-maxIV" placeholder="Max ∑IV" value="${filters.maxIV}" oninput="window.updatePokemonFilter('maxIV', this.value)" style="width: 60px; margin: 2px; -moz-appearance: textfield;">
            <style>#pokemon-filters input::-webkit-outer-spin-button, #pokemon-filters input::-webkit-inner-spin-button { -webkit-appearance: none; margin: 0; }</style>
        </div>
        ${sellControlsHtml}

        <div style="display: flex; gap: 10px; width: 100%; height: 100%; min-height: 0; overflow: hidden; flex-grow: 1;">
            <!-- Column 1: Active -->
            <div style="flex: 2; border: 1px solid #555; padding: 5px; display: flex; flex-direction: column; min-width: 0; min-height: 0;">
                <h4 style="text-align: center; margin-top:0;">Active</h4>
                <div id="active-scroll-container" style="display: grid; grid-template-columns: repeat(2, 1fr); grid-auto-rows: max-content; gap: 5px; overflow-y: auto; align-content: start; flex-grow: 1; padding-bottom: 20px; min-height: 0;">
    `;


    for (let i = 0; i < 8; i++) {
        let p = null;
        let tag = '';
        let listName = '';
        let origIndex = 0;

        if (i < 6) {
            if (i < state.party.length) {
                p = state.party[i];
                tag = 'Party';
                listName = 'party';
                origIndex = i;
            }
        } else if (i === 6) {
            if (state.breeding.length > 0) {
                p = state.breeding[0];
                tag = 'To Breed';
                listName = 'breeding';
                origIndex = 0;
            }
        } else if (i === 7) {
            if (state.training.length > 0) {
                p = state.training[0];
                tag = 'To Train';
                listName = 'training';
                origIndex = 0;
            }
        }

        if (p) {
            p._tag = tag;
            content += `<div ondragover="window.dragOver(event)" ondrop="window.handleDrop(event, '${listName}')" style="box-sizing: border-box; min-width: 0;">` + renderSlotUI(p, listName, origIndex, true) + `</div>`;
        } else {
            let label = i < 6 ? `Party #${i+1}` : (i === 6 ? 'To Breed' : 'To Train');
            let dropTarget = i < 6 ? 'party' : (i === 6 ? 'breeding' : 'training');
            content += `<div ondragover="window.dragOver(event)" ondrop="window.handleDrop(event, '${dropTarget}')" style="border: 1px dashed #777; aspect-ratio: 1 / 1.3; display: flex; align-items: center; justify-content: center; container-type: inline-size; color: #777; box-sizing: border-box;"><span style="font-size: 15cqw; text-align: center;">${label}</span></div>`;
        }
    }


    content += `
                </div>
            </div>

            <!-- Column 2: Storage -->
            <div ondragover="window.dragOver(event)" ondrop="window.handleDrop(event, 'storage')" style="flex: 4; border: 1px solid #555; padding: 5px; display: flex; flex-direction: column; min-width: 0; min-height: 0;">
                <h4 style="text-align: center; margin-top:0;">Storage</h4>
                <div id="storage-scroll-container" style="display: grid; grid-template-columns: repeat(4, 1fr); grid-auto-rows: max-content; gap: 5px; overflow-y: auto; align-content: start; flex-grow: 1; padding-bottom: 20px; min-height: 0;">
    `;

    for (let i = 0; i < state.storage.length; i++) {
        let p = state.storage[i];
        content += renderSlotUI(p, 'storage', i, true);
    }
    content += `<div style="border: 1px dashed #777; aspect-ratio: 1 / 1.3; display: flex; align-items: center; justify-content: center; font-size: 20px; box-sizing: border-box;" title="Empty Slot">+</div>`;

    content += `
                </div>
            </div>

            <!-- Column 3: Safe -->
            <div ondragover="window.dragOver(event)" ondrop="window.handleDrop(event, 'safe')" style="flex: 2; border: 1px solid #555; padding: 5px; display: flex; flex-direction: column; min-width: 0; min-height: 0;">
                <h4 style="text-align: center; margin-top:0;">Safe</h4>
                <div id="safe-scroll-container" style="display: grid; grid-template-columns: repeat(2, 1fr); grid-auto-rows: max-content; gap: 5px; overflow-y: auto; align-content: start; flex-grow: 1; padding-bottom: 20px; min-height: 0;">
    `;

    for (let i = 0; i < state.safe.length; i++) {
        let p = state.safe[i];
        content += renderSlotUI(p, 'safe', i, true);
    }
    content += `<div style="border: 1px dashed #777; aspect-ratio: 1 / 1.3; display: flex; align-items: center; justify-content: center; font-size: 20px; cursor: pointer; box-sizing: border-box;" title="Empty Slot">+</div>`;

    content += `
                </div>
            </div>
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

    area.innerHTML = content;

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
    const filterFn = (p) => {
        if (filters.name && !p.name.toLowerCase().includes(filters.name.toLowerCase())) return false;
        if (filters.minLvl !== '' && p.level < parseInt(filters.minLvl)) return false;
        if (filters.maxLvl !== '' && p.level > parseInt(filters.maxLvl)) return false;
        if (filters.minQ !== '' && p.quality < parseFloat(filters.minQ)) return false;
        if (filters.maxQ !== '' && p.quality > parseFloat(filters.maxQ)) return false;
        let sumIV = p.ivs.hp + p.ivs.atk + p.ivs.def + p.ivs.spa + p.ivs.spd + p.ivs.spe;
        if (filters.minIV !== '' && sumIV < parseInt(filters.minIV)) return false;
        if (filters.maxIV !== '' && sumIV > parseInt(filters.maxIV)) return false;
        return true;
    };

    // Filter Storage
    const storageSlots = document.querySelectorAll('.pokemon-storage-slot');
    storageSlots.forEach(slot => {
        const uuid = slot.getAttribute('data-uuid');
        const p = state.storage.find(x => x.uuid === uuid);
        if (p) {
            slot.style.display = filterFn(p) ? 'flex' : 'none';
        }
    });

    // Filter Safe
    const safeSlots = document.querySelectorAll('.pokemon-safe-slot');
    safeSlots.forEach(slot => {
        const uuid = slot.getAttribute('data-uuid');
        const p = state.safe.find(x => x.uuid === uuid);
        if (p) {
            slot.style.display = filterFn(p) ? 'flex' : 'none';
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

    // Clean lingering visual tags before it lands in a new area
    delete p._tag;

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
            state.dayCareRef.slot2.pokemon = p;

            const totalIV = p.ivs.hp + p.ivs.atk + p.ivs.def + p.ivs.spa + p.ivs.spd + p.ivs.spe;
            if (totalIV >= 600) {
                state.dayCareRef.slot2.battles = state.dayCareRef.slot2.requiredBattles;
            } else {
                state.dayCareRef.slot2.battles = 0;
            }
        }
    }
    else if (tCol === 'breeding') {
        if (state.breeding.length > 0) {
            const currentP = state.breeding[0];
            // Check breeding criteria
            if (currentP.id !== p.id || Math.abs(currentP.quality - p.quality) > 0.001) {
                // Fails criteria -> simple swap
                displacedPokemon = currentP;
                state.breeding[0] = p;
                if (state.dayCareRef) {
                    state.dayCareRef.slot1.pokemon = p;
                    state.dayCareRef.slot1.battles = 0;
                    state.dayCareRef.slot1.isBreeding = false;
                    state.dayCareRef.slot1.isFinished = false;
                }
                window.pokemonFilters.name = p.name;
                window.pokemonFilters.minQ = p.quality.toFixed(2);
                window.pokemonFilters.maxQ = p.quality.toFixed(2);
            } else {
                // Meets criteria -> Consume both, merge into highest IV
                const sumIV1 = currentP.ivs.hp + currentP.ivs.atk + currentP.ivs.def + currentP.ivs.spa + currentP.ivs.spd + currentP.ivs.spe;
                const sumIV2 = p.ivs.hp + p.ivs.atk + p.ivs.def + p.ivs.spa + p.ivs.spd + p.ivs.spe;
                const keptParent = (sumIV2 > sumIV1) ? p : currentP;

                state.breeding[0] = keptParent;
                if (state.dayCareRef) {
                    state.dayCareRef.slot1.pokemon = keptParent;
                    state.dayCareRef.slot1.battles = 0;
                    state.dayCareRef.slot1.isBreeding = true;
                    state.dayCareRef.slot1.isFinished = false;
                }
                // Clear filter as breed started
                window.pokemonFilters.name = '';
                window.pokemonFilters.minQ = '';
                window.pokemonFilters.maxQ = '';
            }
        } else {
            state.breeding.push(p);
            if (state.dayCareRef) {
                state.dayCareRef.slot1.pokemon = p;
                state.dayCareRef.slot1.battles = 0;
                state.dayCareRef.slot1.isBreeding = false;
                state.dayCareRef.slot1.isFinished = false;
            }
            window.pokemonFilters.name = p.name;
            window.pokemonFilters.minQ = p.quality.toFixed(2);
            window.pokemonFilters.maxQ = p.quality.toFixed(2);
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
                state.dayCareRef.slot2.pokemon = displacedPokemon;
                state.dayCareRef.slot2.battles = 0;
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
            window.pokemonFilters.minQ = displacedPokemon.quality.toFixed(2);
            window.pokemonFilters.maxQ = displacedPokemon.quality.toFixed(2);
        }
    }

    updateUI();
    renderBackpackTab('pokemon');
}

window.startSellMode = function() {
    window.sellModeActive = true;
    window.selectedForSale.clear();

    // Open backpack directly to pokemon tab
    window.showBackpack();
    window.renderBackpackTab('pokemon');
};

window.cancelSellMode = function() {
    window.sellModeActive = false;
    window.selectedForSale.clear();
    document.getElementById('backpack-modal').style.display = 'none';

    // Return to Market UI
    const pcButton = document.querySelector('img[src="Assets/UI/Menu/TopBar/Icon_Map.png"]');
    if (pcButton) {
        window.changeLocation("PokeCenter & PokeMarket");
    }
};

window.selectAllVisibleStorage = function() {
    // Only select things in Storage that are currently visible (not display: none)
    const storageSlots = document.querySelectorAll('.pokemon-storage-slot');
    storageSlots.forEach(slot => {
        if (slot.style.display !== 'none') {
            const uuid = slot.getAttribute('data-uuid');
            if (uuid) {
                window.selectedForSale.add(uuid);
            }
        }
    });
    renderBackpackTab('pokemon');
};

window.sellSelectedPokemon = function() {
    if (window.selectedForSale.size === 0) {
        alert("No Pokemon selected to sell!");
        return;
    }

    let totalEarned = 0;

    // We must process from back to front, or simply re-build arrays
    const allLists = [
        { array: state.party, name: 'party' },
        { array: state.breeding, name: 'breeding' },
        { array: state.training, name: 'training' },
        { array: state.storage, name: 'storage' },
        { array: state.safe, name: 'safe' }
    ];

    allLists.forEach(listInfo => {
        const arr = listInfo.array;
        for (let i = arr.length - 1; i >= 0; i--) {
            if (window.selectedForSale.has(arr[i].uuid)) {
                // If it's the last Pokemon in the party, prevent selling!
                if (listInfo.name === 'party' && arr.length === 1) {
                    alert("You cannot sell your last Pokemon in the party!");
                    window.selectedForSale.delete(arr[i].uuid);
                    continue;
                }

                // Clear daycare refs if we sell from breed/train
                if (listInfo.name === 'breeding') state.dayCareRef.slot1 = null;
                if (listInfo.name === 'training') state.dayCareRef.slot2 = null;

                const pkmn = arr[i];
                const totalIV = pkmn.ivs.hp + pkmn.ivs.atk + pkmn.ivs.def + pkmn.ivs.spa + pkmn.ivs.spd + pkmn.ivs.spe;
                const bst = pkmn.baseStats.hp + pkmn.baseStats.atk + pkmn.baseStats.def + pkmn.baseStats.spa + pkmn.baseStats.spd + pkmn.baseStats.spe;
                const ev = calculateEV(bst, pkmn.level, pkmn.quality, totalIV);

                totalEarned += Math.floor(ev);

                arr.splice(i, 1);
            }
        }
    });

    state.trainer.money += totalEarned;
    alert(`Sold selected Pokemon for ${totalEarned.toLocaleString()}!`);

    window.selectedForSale.clear();

    if (window.updateUI) window.updateUI();
    renderBackpackTab('pokemon');
};
