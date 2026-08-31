import { state } from '../../state.js';
import { updateUI } from '../../ui.js';
import { renderBackpackTab } from './index.js';

export function renderPokemonTab(area) {
    let content = `
        <div style="display: flex; gap: 10px; width: 100%;">
            <!-- Column 1: Party (6 max normally, but 4x2 slots requested means 8 total slots here for Party, Breeding, Training) -->
            <div style="flex: 1; border: 1px solid #555; padding: 5px; min-height: 200px;">
                <h4 style="text-align: center; margin-top:0;">Active (Party/Breed/Train)</h4>
                <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 5px;">
    `;

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
                <div style="border: 1px solid #777; height: 60px; text-align: center; cursor: move; position: relative;" title="Q=${p.quality.toFixed(2)} & ∑IV=${sumIV}" draggable="true" ondragstart="window.dragStart(event, '${p._tag}', ${p._origIndex})">
                    <span style="position: absolute; top: 0; left: 0; font-size: 8px; background: black; padding: 1px;">${p._tag}</span>
                    <img src="${imgSrc}" style="max-height: 40px; max-width: 40px;" onerror="this.src='data:image/gif;base64,R0lGODlhAQABAAD/ACwAAAAAAQABAAACADs='">
                    <div style="font-size: 10px;">Lv.${p.level}</div>
                    <div onclick="event.stopPropagation(); window.showPokemonStats(${p._origIndex}, '${p._tag.toLowerCase()}')" style="position: absolute; top: 2px; right: 2px; cursor: pointer; background: #34495e; color: white; border-radius: 50%; width: 14px; height: 14px; text-align: center; line-height: 14px; font-size: 10px; font-weight: bold;" title="View Info">i</div>
                </div>
            `;
        } else {
            content += `<div ondragover="window.dragOver(event)" ondrop="window.handleDrop(event, 'party')" style="border: 1px dashed #777; height: 60px;"></div>`;
        }
    }

    content += `
                </div>
            </div>

            <!-- Column 2: Storage (6xn) -->
            <div ondragover="window.dragOver(event)" ondrop="window.handleDrop(event, 'storage')" style="flex: 1; border: 1px solid #555; padding: 5px; min-height: 200px;">
                <h4 style="text-align: center; margin-top:0;">Storage</h4>
                <div style="display: grid; grid-template-columns: repeat(2, 1fr); gap: 5px; max-height: 250px; overflow-y: auto;">
    `;

    for (let i = 0; i <= state.storage.length; i++) {
        if (i < state.storage.length) {
            let p = state.storage[i];
            let imgSrc = `Assets/Pokemon Sprites/${p.qualityName === 'Shiny' ? p.id + '_shiny' : p.id}.png`;
            let sumIV = p.ivs.hp + p.ivs.atk + p.ivs.def + p.ivs.spa + p.ivs.spd + p.ivs.spe;
            content += `
                <div style="border: 1px solid #777; height: 60px; text-align: center; cursor: move; position: relative;" title="Q=${p.quality.toFixed(2)} & ∑IV=${sumIV}" draggable="true" ondragstart="window.dragStart(event, 'storage', ${i})">
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
            <div ondragover="window.dragOver(event)" ondrop="window.handleDrop(event, 'safe')" style="flex: 1; border: 1px solid #555; padding: 5px; min-height: 200px;">
                <h4 style="text-align: center; margin-top:0;">Safe</h4>
                <div style="display: grid; grid-template-columns: repeat(2, 1fr); gap: 5px; max-height: 250px; overflow-y: auto;">
    `;

    for (let i = 0; i <= state.safe.length; i++) {
        if (i < state.safe.length) {
            let p = state.safe[i];
            let imgSrc = `Assets/Pokemon Sprites/${p.qualityName === 'Shiny' ? p.id + '_shiny' : p.id}.png`;
            let sumIV = p.ivs.hp + p.ivs.atk + p.ivs.def + p.ivs.spa + p.ivs.spd + p.ivs.spe;
            content += `
                <div style="border: 1px solid #777; height: 60px; text-align: center; cursor: move; position: relative;" title="Q=${p.quality.toFixed(2)} & ∑IV=${sumIV}" draggable="true" ondragstart="window.dragStart(event, 'safe', ${i})">
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

    area.innerHTML = content;
}

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
    else if (tCol === 'storage') state.storage.push(p);
    else if (tCol === 'safe') state.safe.push(p);

    updateUI();
    renderBackpackTab('pokemon');
}
