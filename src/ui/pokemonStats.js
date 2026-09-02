import { state } from '../state.js';
import { updateUI, showModal, TYPE_COLORS } from '../ui.js';

function formatType(typeStr) {
    if (!typeStr || !TYPE_COLORS[typeStr]) return typeStr;
    const color = TYPE_COLORS[typeStr];
    return `<span style="color: ${color}; display: inline-flex; align-items: center; gap: 4px;">\n                <img src="Assets/Extra/Type ${typeStr}.png" style="height: 14px;"> ${typeStr}\n            </span>`;
}

function formatTypes(obj) {
    return Object.keys(obj).length ? Object.keys(obj).map(t => formatType(t)).join(', ') : 'None';
}

export function showPokemonStats(idx, location) {
    let p = null;
    if (location === 'party') p = state.party[idx];
    else if (location === 'breeding') p = state.breeding[idx];
    else if (location === 'training') p = state.training[idx];
    else if (location === 'storage') p = state.storage[idx];
    else if (location === 'safe') p = state.safe[idx];

    if (!p) return;

    const sumIV = p.ivs.hp + p.ivs.atk + p.ivs.def + p.ivs.spa + p.ivs.spd + p.ivs.spe;

    const pData = state.config.pokemonData.find(pd => pd.id === p.id);
    if (!pData) return;

    // Base Cost = Ceiling(Level * 0.1)
    const baseCost = Math.ceil(p.level * 0.1);
    const isDualTyped = p.types.length > 1;
    const stonesNeededType1 = isDualTyped ? baseCost : baseCost * 2;
    const stonesNeededType2 = isDualTyped ? baseCost : 0;

    const type1 = p.types[0];
    const type2 = isDualTyped ? p.types[1] : null;

    const stone1Name = type1 + ' Stone';
    const stone2Name = type2 ? type2 + ' Stone' : null;

    let playerStones1 = state.inventory && state.inventory[stone1Name] ? state.inventory[stone1Name] : 0;
    let playerStones2 = stone2Name && state.inventory && state.inventory[stone2Name] ? state.inventory[stone2Name] : 0;

    const canEvolve = playerStones1 >= stonesNeededType1 && (!stone2Name || playerStones2 >= stonesNeededType2);

    let evolutionLineHtml = "";
    // Helper to find base pokemon of the line
    let basePData = state.config.pokemonData.find(pd => {
         if(pd.id === p.id) return false;
         return (pd.evolutions && pd.evolutions.some(evo => evo.to === p.id)) ||
                (pd.evolutions && pd.evolutions.some(evo => state.config.pokemonData.find(p2 => p2.id === evo.to && p2.evolutions && p2.evolutions.some(e3 => e3.to === p.id))));
    });

    if(!basePData && pData.evolutions && pData.evolutions.length > 0) basePData = pData;

    if(basePData) {
         let root = pData;
         for(let i=0; i<3; i++) {
             let parent = state.config.pokemonData.find(pd => pd.evolutions && pd.evolutions.some(e => e.to === root.id));
             if(parent) root = parent;
             else break;
         }

         evolutionLineHtml += `<div style="display:flex; align-items:center; justify-content:center; gap: 10px; margin-top: 20px;">`;

         let current = root;
         while(current) {
             evolutionLineHtml += `
                <div style="text-align:center; cursor:pointer;" onclick="window.showDexEntry(${current.id})">
                    <img src="Assets/Pokemon Sprites/${current.id}.png" style="width: 50px; height: 50px;">
                    <div style="font-size: 10px;">${current.name}</div>
                </div>
             `;
             if(current.evolutions && current.evolutions.length > 0) {
                 let evo = current.evolutions[0]; // simplify for linear
                 evolutionLineHtml += `
                    <div style="text-align:center; font-size:12px;">
                        &#8594;<br>Lvl ${evo.level}
                    </div>
                 `;
                 current = state.config.pokemonData.find(pd => pd.id === evo.to);
             } else {
                 current = null;
             }
         }
         evolutionLineHtml += `</div>`;
    }

    let evolveButtonHtml = "";
    if (pData.evolutions && pData.evolutions.length > 0) {
        let evo = pData.evolutions[0]; // Assume first for button
        const nextPData = state.config.pokemonData.find(pd => pd.id === evo.to);

        let costText = `${stonesNeededType1} ${stone1Name}`;
        if (isDualTyped) costText += ` & ${stonesNeededType2} ${stone2Name}`;

        evolveButtonHtml = `
            <div style="text-align: center; margin-top: 10px;">
                Evolution: <b>${nextPData ? nextPData.name : 'Unknown'}</b><br>
                <span style="font-size: 12px;">Cost: ${costText}</span><br>
                <button ${canEvolve ? '' : 'disabled'} onclick="window.evolvePokemon('${location}', ${idx}, ${evo.to})" style="${canEvolve ? 'background: #2ecc71;' : 'background: #7f8c8d; cursor: not-allowed;'} margin-top: 5px; padding: 5px 15px;">Evolve</button>
            </div>
        `;
    }

    const bst = pData.hp + pData.atk + pData.def + pData.spa + pData.spd + pData.spe;

    // Calculate Type Effectiveness
    const tConfig = state.config.types;
    let weaknesses = {};
    let resistances = {};
    let immunities = {};
    let effective = {};
    let notEffective = {};
    let noEffect = {};

    for (const atkType in tConfig) {
        let multiplier = 1;
        for (const defType of pData.types) {
            if (tConfig[atkType] && tConfig[atkType][defType] !== undefined) multiplier *= tConfig[atkType][defType];
        }
        if (multiplier > 1) weaknesses[atkType] = multiplier;
        else if (multiplier < 1 && multiplier > 0) resistances[atkType] = multiplier;
        else if (multiplier === 0) immunities[atkType] = multiplier;
    }

    for (const defType in tConfig) {
        let maxMult = 0;
        for (const atkType of pData.types) {
            let m = 1;
            if (tConfig[atkType] && tConfig[atkType][defType] !== undefined) m = tConfig[atkType][defType];
            if (m > maxMult) maxMult = m;
        }
        if (maxMult > 1) effective[defType] = maxMult;
        else if (maxMult < 1 && maxMult > 0) notEffective[defType] = maxMult;
        else if (maxMult === 0) noEffect[defType] = maxMult;
    }

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
                <td>${mData ? formatType(mData.type) : '?'}</td>
                <td>${mData ? mData.power : '?'}</td>
                <td>${mData ? mData.category : '?'}</td>
            </tr>`;
        });
    }
    movesHtml += `</table>`;

    let html = `
        <div style="display: flex; justify-content: space-around; border-bottom: 1px solid #555; padding-bottom: 15px;">
            <div>
                <img src="Assets/Pokemon Sprites/${p.qualityName === 'Shiny' ? p.id + '_shiny' : p.id}.png" style="width: 100px; height: 100px;"><br>
                <b>Type:</b> ${p.types.map(t => formatType(t)).join(' / ')}<br>
                <b>Quality:</b> ${p.qualityName} (Q=${p.quality.toFixed(2)})<br>
                <b>Sum IVs:</b> ${sumIV}<br>
                ${evolveButtonHtml}
            </div>
            <div style="text-align: left; width: 50%;">
                <h4 style="margin-top:0;">IV Distribution</h4>
                <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 10px;">
                    <div>HP: ${p.ivs.hp} <progress value="${p.ivs.hp}" max="100" style="width:100%; height:8px;"></progress></div>
                    <div>SPE: ${p.ivs.spe} <progress value="${p.ivs.spe}" max="100" style="width:100%; height:8px;"></progress></div>
                    <div>ATK: ${p.ivs.atk} <progress value="${p.ivs.atk}" max="100" style="width:100%; height:8px;"></progress></div>
                    <div>SPA: ${p.ivs.spa} <progress value="${p.ivs.spa}" max="100" style="width:100%; height:8px;"></progress></div>
                    <div>DEF: ${p.ivs.def} <progress value="${p.ivs.def}" max="100" style="width:100%; height:8px;"></progress></div>
                    <div>SPD: ${p.ivs.spd} <progress value="${p.ivs.spd}" max="100" style="width:100%; height:8px;"></progress></div>
                </div>
            </div>
        </div>
        <div style="padding-top: 15px; max-height: 400px; overflow-y: auto;">
            <h4 style="margin-top:0;">Species Data</h4>
            <p><b>BST:</b> ${bst} (HP:${pData.hp} A:${pData.atk} D:${pData.def} SA:${pData.spa} SD:${pData.spd} S:${pData.spe})</p>

            <div style="text-align: left; margin: 15px 0; font-size: 14px; background: rgba(0,0,0,0.5); padding: 10px; border-radius: 5px;">
                <h4 style="margin: 0 0 5px 0;">Defensive Effectiveness</h4>
                ${Object.keys(weaknesses).length ? `<b>Weak To (2x):</b> ${formatTypes(weaknesses)}<br>` : ''}
                ${Object.keys(resistances).length ? `<b>Resists (0.5x):</b> ${formatTypes(resistances)}<br>` : ''}
                ${Object.keys(immunities).length ? `<b>Immune To (0x):</b> ${formatTypes(immunities)}<br>` : ''}

                <h4 style="margin: 10px 0 5px 0;">Offensive Effectiveness</h4>
                ${Object.keys(effective).length ? `<b>Super Effective (2x):</b> ${formatTypes(effective)}<br>` : ''}
                ${Object.keys(notEffective).length ? `<b>Not Very Effective (0.5x):</b> ${formatTypes(notEffective)}<br>` : ''}
                ${Object.keys(noEffect).length ? `<b>No Effect (0x):</b> ${formatTypes(noEffect)}<br>` : ''}
            </div>

            ${evolutionLineHtml}

            <h4 style="text-align: left;">Moveset</h4>
            ${movesHtml}
        </div>
    `;

    showModal(`${p.name} (Lv. ${p.level})`, html);
}

export function evolvePokemon(location, idx, toId) {
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

    // Consume stones
    const baseCost = Math.ceil(p.level * 0.1);
    const isDualTyped = p.types.length > 1;
    const stonesNeededType1 = isDualTyped ? baseCost : baseCost * 2;
    const stonesNeededType2 = isDualTyped ? baseCost : 0;

    const type1 = p.types[0];
    const type2 = isDualTyped ? p.types[1] : null;

    const stone1Name = type1 + ' Stone';
    const stone2Name = type2 ? type2 + ' Stone' : null;

    if(!state.inventory) state.inventory = {};

    let playerStones1 = state.inventory[stone1Name] || 0;
    let playerStones2 = stone2Name ? (state.inventory[stone2Name] || 0) : 0;

    if(playerStones1 < stonesNeededType1 || (stone2Name && playerStones2 < stonesNeededType2)) {
        return; // Shouldn't happen since button is disabled, but safeguard
    }

    state.inventory[stone1Name] -= stonesNeededType1;
    if(stone2Name) state.inventory[stone2Name] -= stonesNeededType2;

    p.id = newBase.id;
    p.name = newBase.name;
    p.types = newBase.types;
    p.bst = newBase.hp + newBase.atk + newBase.def + newBase.spa + newBase.spd + newBase.spe;

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
}
