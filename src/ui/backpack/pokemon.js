import { state } from '../../state.js';
import { updateUI } from '../../ui.js';
import { renderBackpackTab } from './index.js';

// Helper to render a consistent Pokemon slot UI
function renderSlotUI(p, listName, origIndex, isDraggable) {
    let imgSrc = `Assets/Pokemon Sprites/${p.qualityName === 'Shiny' ? p.id + '_shiny' : p.id}.png`;
    let sumIV = p.ivs.hp + p.ivs.atk + p.ivs.def + p.ivs.spa + p.ivs.spd + p.ivs.spe;
    let dragAttr = isDraggable ? `draggable="true" ondragstart="window.dragStart(event, '${listName}', ${origIndex})"` : '';
    let cursorStyle = isDraggable ? 'cursor: move;' : 'cursor: default;';
    let slotClass = '';
    let dataAttr = '';
    if (listName.toLowerCase() === 'storage') {
        slotClass = 'pokemon-storage-slot';
        dataAttr = `data-index="${origIndex}"`;
    } else if (listName.toLowerCase() === 'safe') {
        slotClass = 'pokemon-safe-slot';
        dataAttr = `data-index="${origIndex}"`;
    }

    return `
        <div class="${slotClass}" ${dataAttr} style="border: 1px solid #777; aspect-ratio: 1 / 1.3; display: flex; flex-direction: column; align-items: center; justify-content: space-between; padding: 4%; box-sizing: border-box; background: rgba(0,0,0,0.5); position: relative; container-type: inline-size; overflow: hidden; ${cursorStyle}" title="Q=${p.quality.toFixed(2)} & ∑IV=${sumIV}" ${dragAttr}>
            <span style="position: absolute; top: 0; left: 0; font-size: 12cqw; background: black; padding: 2cqw; z-index: 2;">${p._tag || ''}</span>
            <div onclick="event.stopPropagation(); window.showPokemonStats(${origIndex}, '${listName.toLowerCase()}')" style="position: absolute; top: 2cqw; right: 2cqw; cursor: pointer; background: #34495e; color: white; border-radius: 50%; width: 20cqw; height: 20cqw; text-align: center; display: flex; align-items: center; justify-content: center; font-size: 14cqw; font-weight: bold; z-index: 3;" title="View Info">i</div>

            <div style="flex: 1; width: 100%; display: flex; align-items: center; justify-content: center; position: relative;">
                <img src="${imgSrc}" style="height: 140%; width: 140%; max-height: 140%; object-fit: contain; z-index: 1;" onerror="this.src='data:image/gif;base64,R0lGODlhAQABAAD/ACwAAAAAAQABAAACADs='">
            </div>

            <div style="display: flex; flex-direction: column; align-items: center; justify-content: flex-end; font-size: 12cqw; line-height: 1.2; width: 100%; z-index: 2; text-shadow: 1px 1px 1px black, -1px -1px 1px black, 1px -1px 1px black, -1px 1px 1px black; pointer-events: none;">
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

        <div style="display: flex; gap: 10px; width: 100%; height: 100%; min-height: 0; overflow: hidden; flex-grow: 1;">
            <!-- Column 1: Active -->
            <div style="flex: 2; border: 1px solid #555; padding: 5px; display: flex; flex-direction: column; min-width: 0; min-height: 0;">
                <h4 style="text-align: center; margin-top:0;">Active</h4>
                <div id="active-scroll-container" style="display: grid; grid-template-columns: repeat(2, 1fr); gap: 5px; overflow-y: auto; align-content: start; flex-grow: 1; padding-bottom: 20px; min-height: 0;">
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
                <div id="storage-scroll-container" style="display: grid; grid-template-columns: repeat(4, 1fr); gap: 5px; overflow-y: auto; align-content: start; flex-grow: 1; padding-bottom: 20px; min-height: 0;">
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
                <div id="safe-scroll-container" style="display: grid; grid-template-columns: repeat(2, 1fr); gap: 5px; overflow-y: auto; align-content: start; flex-grow: 1; padding-bottom: 20px; min-height: 0;">
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
        const index = parseInt(slot.getAttribute('data-index'), 10);
        const p = state.storage[index];
        if (p) {
            slot.style.display = filterFn(p) ? 'flex' : 'none';
        }
    });

    // Filter Safe
    const safeSlots = document.querySelectorAll('.pokemon-safe-slot');
    safeSlots.forEach(slot => {
        const index = parseInt(slot.getAttribute('data-index'), 10);
        const p = state.safe[index];
        if (p) {
            slot.style.display = filterFn(p) ? 'flex' : 'none';
        }
    });
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

    // Daycare interaction constraints
    if (sCol === 'breeding' && state.dayCareRef && state.dayCareRef.slot1.isBreeding) {
        alert("Cannot move Pokémon while it is actively breeding!");
        return;
    }

    if (tCol === 'breeding' && state.dayCareRef && state.dayCareRef.slot1.isBreeding) {
        alert("Cannot replace Pokémon while breeding is in progress!");
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
        state.storage.unshift(p);
    }
    else if (tCol === 'safe') {
        state.safe.unshift(p);
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
            state.dayCareRef.slot2.battles = 0;
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
