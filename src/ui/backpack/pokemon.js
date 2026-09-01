import { state } from '../../state.js';
import { updateUI } from '../../ui.js';
import { renderBackpackTab } from './index.js';

// Helper to render a consistent Pokemon slot UI
function renderSlotUI(p, listName, origIndex, isDraggable) {
    let imgSrc = `Assets/Pokemon Sprites/${p.qualityName === 'Shiny' ? p.id + '_shiny' : p.id}.png`;
    let sumIV = p.ivs.hp + p.ivs.atk + p.ivs.def + p.ivs.spa + p.ivs.spd + p.ivs.spe;
    let dragAttr = isDraggable ? `draggable="true" ondragstart="window.dragStart(event, '${listName}', ${origIndex})"` : '';
    let cursorStyle = isDraggable ? 'cursor: move;' : 'cursor: default;';

    // Remove "i" button and place onClick event directly on the whole card to mimic info button functionality.
    return `
        <div onclick="window.showPokemonStats(${origIndex}, '${listName.toLowerCase()}')" style="border: 1px solid #888; height: 85px; display: flex; align-items: center; padding: 4px; box-sizing: border-box; background: rgba(0,0,0,0.6); position: relative; ${cursorStyle} border-radius: 4px;" title="Q=${p.quality.toFixed(2)} & ∑IV=${sumIV}" ${dragAttr}>
            <span style="position: absolute; top: 0; left: 0; font-size: 9px; background: rgba(0,0,0,0.8); padding: 1px 3px; border-bottom-right-radius: 4px; z-index: 2;">${p._tag || ''}</span>
            <div style="display: flex; flex-direction: column; align-items: center; width: 50px; margin-right: 5px;">
                <img src="${imgSrc}" style="max-height: 55px; max-width: 55px; object-fit: contain;" onerror="this.src='data:image/gif;base64,R0lGODlhAQABAAD/ACwAAAAAAQABAAACADs='">
            </div>
            <div style="display: flex; flex-direction: column; justify-content: center; font-size: 11px; line-height: 1.3;">
                <div style="white-space: nowrap; overflow: hidden; text-overflow: ellipsis; max-width: 65px; font-weight: bold; color: #f1c40f;" title="${p.name}">${p.name}</div>
                <div>Lv.${p.level}</div>
                <div>Q:${p.quality.toFixed(2)}</div>
                <div>∑IV:${sumIV}</div>
            </div>
        </div>
    `;
}


// Global filter state
window.pokemonFilters = window.pokemonFilters || {
    name: '', minLvl: '', maxLvl: '', minQ: '', maxQ: '', minIV: '', maxIV: ''
};

export function renderPokemonTab(area) {
    const filters = window.pokemonFilters;

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


        <div style="display: flex; flex-direction: column; gap: 10px; width: 100%;">
            <!-- Top Row: Active -->
            <div style="border: 1px solid #555; padding: 5px; min-height: 80px;">
                <h4 style="text-align: center; margin: 0 0 5px 0;">Active</h4>
                <div style="display: grid; grid-template-columns: repeat(8, 1fr); gap: 5px;">
    `;

    const activePokemon = [];
    state.party.forEach((p, idx) => activePokemon.push({...p, _tag: "Party", _origIndex: idx}));
    state.breeding.forEach((p, idx) => activePokemon.push({...p, _tag: "Breed", _origIndex: idx}));
    state.training.forEach((p, idx) => activePokemon.push({...p, _tag: "Train", _origIndex: idx}));

    for (let i = 0; i < 8; i++) {
        if (i < activePokemon.length) {
            let p = activePokemon[i];
            content += renderSlotUI(p, p._tag, p._origIndex, true);
        } else {
            let label = i < 6 ? `Party #${i+1}` : (i === 6 ? "Breed" : "Training");
            content += `<div ondragover="window.dragOver(event)" ondrop="window.handleDrop(event, "party")" style="border: 1px dashed #777; height: 85px; display: flex; align-items: center; justify-content: center; font-size: 10px; color: #777; text-align: center;">${label}</div>`;
        }
    }

    content += `
                </div>
            </div>

            <!-- Bottom Row: Storage & Safe -->
            <div style="display: flex; gap: 10px; width: 100%;">
                <!-- Storage -->
                <div ondragover="window.dragOver(event)" ondrop="window.handleDrop(event, "storage")" style="flex: 1; border: 1px solid #555; padding: 5px; display: flex; flex-direction: column;">
                    <h4 style="text-align: center; margin: 0 0 5px 0;">Storage</h4>
                    <div id="storage-scroll-container" style="display: grid; grid-template-columns: repeat(4, 1fr); gap: 5px; max-height: 250px; overflow-y: auto; align-content: start; flex-grow: 1;">
    `;

    const filterFn = (p) => {
        if (filters.name && !p.name.toLowerCase().includes(filters.name.toLowerCase())) return false;
        if (filters.minLvl !== "" && p.level < parseInt(filters.minLvl)) return false;
        if (filters.maxLvl !== "" && p.level > parseInt(filters.maxLvl)) return false;
        if (filters.minQ !== "" && p.quality < parseFloat(filters.minQ)) return false;
        if (filters.maxQ !== "" && p.quality > parseFloat(filters.maxQ)) return false;
        let sumIV = p.ivs.hp + p.ivs.atk + p.ivs.def + p.ivs.spa + p.ivs.spd + p.ivs.spe;
        if (filters.minIV !== "" && sumIV < parseInt(filters.minIV)) return false;
        if (filters.maxIV !== "" && sumIV > parseInt(filters.maxIV)) return false;
        return true;
    };

    let displayedStorage = 0;
    for (let i = 0; i < state.storage.length; i++) {
        let p = state.storage[i];
        if (filterFn(p)) {
            content += renderSlotUI(p, "storage", i, true);
            displayedStorage++;
        }
    }
    content += `<div style="border: 1px dashed #777; height: 85px; display: flex; align-items: center; justify-content: center; font-size: 20px;" title="Empty Slot">+</div>`;

    content += `
                    </div>
                </div>

                <!-- Safe -->
                <div ondragover="window.dragOver(event)" ondrop="window.handleDrop(event, "safe")" style="flex: 1; border: 1px solid #555; padding: 5px; display: flex; flex-direction: column;">
                    <h4 style="text-align: center; margin: 0 0 5px 0;">Safe</h4>
                    <div id="safe-scroll-container" style="display: grid; grid-template-columns: repeat(4, 1fr); gap: 5px; max-height: 250px; overflow-y: auto; align-content: start; flex-grow: 1;">
    `;

    let displayedSafe = 0;
    for (let i = 0; i < state.safe.length; i++) {
        let p = state.safe[i];
        if (filterFn(p)) {
            content += renderSlotUI(p, "safe", i, true);
            displayedSafe++;
        }
    }
    content += `<div style="border: 1px dashed #777; height: 85px; display: flex; align-items: center; justify-content: center; font-size: 20px; cursor: pointer;" title="Empty Slot">+</div>`;

    content += `
                    </div>
                </div>
            </div>
        </div></div>
        <div style="font-size: 10px; text-align: center; margin-top: 5px; color: #ccc;">Drag and Drop to move Pokémon.</div>
    `;


    // Capture focus state
    let activeElementId = document.activeElement ? document.activeElement.id : null;
    let selectionStart = 0;
    let selectionEnd = 0;
    if (activeElementId && document.activeElement.tagName === 'INPUT') {
        try {
            if (document.activeElement.type === 'text') {
                selectionStart = document.activeElement.selectionStart;
                selectionEnd = document.activeElement.selectionEnd;
            }
        } catch(e) {}
    }

    // Capture previous scroll positions
    let prevStorageScroll = 0;
    let prevSafeScroll = 0;
    const oldStorage = document.getElementById('storage-scroll-container');
    const oldSafe = document.getElementById('safe-scroll-container');
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
                    if (el.type === 'text') {
                        el.setSelectionRange(selectionStart, selectionEnd);
                    } else if (el.type === 'number') {
                        // Workaround for number inputs where setSelectionRange is not allowed
                        let val = el.value;
                        el.value = '';
                        el.value = val;
                    }
                } catch(e) {}
            }
        }
    }

    // Restore scroll positions
    const newStorage = document.getElementById('storage-scroll-container');
    const newSafe = document.getElementById('safe-scroll-container');
    if (newStorage) newStorage.scrollTop = prevStorageScroll;
    if (newSafe) newSafe.scrollTop = prevSafeScroll;
}

window.updatePokemonFilter = function(key, val) {
    window.pokemonFilters[key] = val;
    // Debounce re-render slightly or direct call
    renderBackpackTab('pokemon');
};

export function dragStart(event, sourceCol, index) {
    event.dataTransfer.setData('text/plain', JSON.stringify({ sourceCol, index }));
}

export function dragOver(event) {
    event.preventDefault();
}

export function handleDrop(event, targetCol) {
    event.preventDefault();
    const data = event.dataTransfer.getData('text/plain');
    if (!data) return;
    let sourceCol, index;
    try {
        const parsed = JSON.parse(data);
        sourceCol = parsed.sourceCol;
        index = parsed.index;
    } catch(e) { return; }

    const sCol = sourceCol.toLowerCase();
    const tCol = targetCol.toLowerCase();

    if (sCol === tCol) return;

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

    if (sCol === 'party' && state.party.length <= 1 && tCol !== 'party') {
        alert("You must have at least one Pokémon in your party!");
        return;
    }

    if (sCol === 'party') state.party.splice(index, 1);
    else if (sCol === 'breeding') state.breeding.splice(index, 1);
    else if (sCol === 'training') state.training.splice(index, 1);
    else if (sCol === 'storage') state.storage.splice(index, 1);
    else if (sCol === 'safe') state.safe.splice(index, 1);

    if (tCol === 'party') state.party.push(p);
    else if (tCol === 'storage') state.storage.unshift(p);
    else if (tCol === 'safe') state.safe.unshift(p);

    updateUI();
    renderBackpackTab('pokemon');
}
