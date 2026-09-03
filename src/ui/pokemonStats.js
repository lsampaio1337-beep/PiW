import { state } from '../state.js';
import { updateUI, showModal } from '../ui.js';
import { formatType, formatTypes } from './pokedex.js';


function buildEvolutionLineHtml(pData, state) {
    let baseId = pData.id;
    let foundPrev = true;
    while(foundPrev) {
        foundPrev = false;
        for (const pd of state.config.pokemonData) {
            if (pd.evolutions && pd.evolutions.some(e => e.to === baseId)) {
                baseId = pd.id;
                foundPrev = true;
                break;
            }
        }
    }

    function buildTree(currentId) {
        const pd = state.config.pokemonData.find(p => p.id === currentId);
        if (!pd) return "";

        let html = `<div style="display: flex; flex-direction: column; align-items: center; margin: 5px;">
            <img src="Assets/Pokemon Sprites/${pd.id}.png" style="width: 50px; height: 50px; cursor: pointer;" onclick="window.showDexEntry(${pd.id})" title="${pd.name}">
            <span style="font-size: 10px; cursor: pointer;" onclick="window.showDexEntry(${pd.id})">${pd.name}</span>
        </div>`;

        if (pd.evolutions && pd.evolutions.length > 0) {
            html = `<div style="display: flex; align-items: center;">` + html;

            let evosHtml = `<div style="display: flex; flex-direction: column; justify-content: center; margin-left: 10px;">`;
            for (const evo of pd.evolutions) {
                evosHtml += `<div style="display: flex; align-items: center; margin: 5px 0;">
                    <div style="font-size: 10px; color: #aaa; margin-right: 5px;">Lv.${evo.level} ➔</div>
                    ${buildTree(evo.to)}
                </div>`;
            }
            evosHtml += `</div>`;
            html += evosHtml + `</div>`;
        }

        return html;
    }

    let treeHtml = buildTree(baseId);
    return `<div style="text-align: left; margin: 15px 0; font-size: 14px; background: rgba(0,0,0,0.5); padding: 10px; border-radius: 5px; overflow-x: auto;">
        <h4 style="margin: 0 0 10px 0;">Evolution Line</h4>
        <div style="display: flex; align-items: center; justify-content: center;">
            ${treeHtml}
        </div>
    </div>`;
}

function getEvolveRequirements(p, evo, state) {
    const requiredLevel = evo.level;
    const baseStones = Math.ceil(p.level * 0.1);
    const stonesReq = p.types.length === 1 ? baseStones * 2 : baseStones;

    let hasStones = true;
    let missingStonesHtml = "";

    for (const type of p.types) {
        const stoneName = type + " Stone";
        state.backpack.stones[stoneName] = state.backpack.stones[stoneName] || 0; // safe fallback
        const hasCount = state.backpack.stones[stoneName];
        if (hasCount < stonesReq) {
            hasStones = false;
        }
        missingStonesHtml += `${stonesReq}<img src="Assets/Items/Stones/${stoneName}.png" style="width: 16px; height: 16px; vertical-align: middle; margin-left: 2px; margin-right: 5px;" title="${stoneName}">`;
    }

    const hasLevel = p.level >= requiredLevel;

    return {
        canEvolve: hasLevel && hasStones,
        hasLevel,
        hasStones,
        requiredLevel,
        stonesReq,
        missingStonesHtml: missingStonesHtml.trim()
    };
}

export function showPokemonStatsByUuid(uuid) {
    let p = null;
    let location = '';
    let idx = state.party.findIndex(x => x.uuid === uuid);
    if (idx !== -1) { p = state.party[idx]; location = 'party'; }
    else {
        idx = state.breeding.findIndex(x => x.uuid === uuid);
        if (idx !== -1) { p = state.breeding[idx]; location = 'breeding'; }
        else {
            idx = state.training.findIndex(x => x.uuid === uuid);
            if (idx !== -1) { p = state.training[idx]; location = 'training'; }
            else {
                idx = state.storage.findIndex(x => x.uuid === uuid);
                if (idx !== -1) { p = state.storage[idx]; location = 'storage'; }
                else {
                    idx = state.safe.findIndex(x => x.uuid === uuid);
                    if (idx !== -1) { p = state.safe[idx]; location = 'safe'; }
                }
            }
        }
    }

    if (!p) return;
    showPokemonStats(idx, location);
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

    // --- Individual Data ---

    // Progress bar helper for IVs (1 to 100)
    const ivBar = (val) => `
        <div style="background: #333; width: 100%; height: 14px; border-radius: 7px; overflow: hidden; position: relative;">
            <div style="background: #3498db; width: ${val}%; height: 100%;"></div>
            <div style="position: absolute; top: 0; left: 0; width: 100%; text-align: center; font-size: 10px; line-height: 14px; color: white; text-shadow: 1px 1px 1px black;">${val}</div>
        </div>
    `;

    // Evolution Check
    let evolveHtml = "";
    if (pData.evolutions && pData.evolutions.length > 0) {
        let evolutionsList = pData.evolutions.map(evo => {
            const nextPData = state.config.pokemonData.find(pd => pd.id === evo.to);
            const req = getEvolveRequirements(p, evo, state);

            let btnText = "Evolve";
            if (!req.canEvolve) {
                if (!req.hasLevel && !req.hasStones) {
                    btnText = `<span style="line-height:1.2;">Need Lv. ${req.requiredLevel}</span><span style="line-height:1.2; display:flex; align-items:center;">Need ${req.missingStonesHtml} to evolve</span>`;
                } else if (!req.hasLevel) {
                    btnText = `Need Lv. ${req.requiredLevel} to evolve`;
                } else if (!req.hasStones) {
                    btnText = `<span style="display:flex; align-items:center;">Need ${req.missingStonesHtml} to evolve</span>`;
                }
            }

            return `
                <div style="margin-top: 10px;">
                    Evolution: <b>${nextPData ? nextPData.name : 'Unknown'}</b>
                    <button ${req.canEvolve ? '' : 'disabled'} onclick="window.evolvePokemon('${location}', ${idx}, ${evo.to})" style="${req.canEvolve ? 'background: #2ecc71;' : 'background: #7f8c8d; cursor: not-allowed;'} margin-left: 10px; vertical-align: middle; width: max-content; min-width: 200px; height: 40px; font-size: 12px; line-height: 1.2; padding: 5px 10px; text-align: center; display: inline-flex; align-items: center; justify-content: center; flex-direction: column;">${btnText}</button>
                </div>
            `;
        }).join('');
        evolveHtml = `<div style="margin-top: 15px; border-top: 1px solid #555; padding-top: 10px;">${evolutionsList}</div>`;
    }

    let individualHtml = `
        <div style="display: flex; justify-content: space-around; flex-wrap: wrap;">
            <div style="text-align: center;">
                <img src="Assets/Pokemon Sprites/${p.qualityName === 'Shiny' ? p.id + '_shiny' : p.id}.png" style="width: 100px; height: 100px;"><br>
                <p style="margin: 5px 0;"><b>Type:</b> ${p.types.map(t => formatType(t)).join(' ')}</p>
                <b>Quality:</b> ${p.qualityName} (Q=${p.quality.toFixed(2)})<br>
                <b>Sum IVs:</b> ${sumIV}<br>
            </div>
            <div style="text-align: left; min-width: 200px;">
                <h4 style="margin-bottom: 5px;">IV Distribution</h4>
                <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 10px; font-size: 12px; text-align: center;">
                    <div>HP<br>${ivBar(p.ivs.hp)}</div>
                    <div>Speed<br>${ivBar(p.ivs.spe)}</div>
                    <div>Atk<br>${ivBar(p.ivs.atk)}</div>
                    <div>SpAtk<br>${ivBar(p.ivs.spa)}</div>
                    <div>Def<br>${ivBar(p.ivs.def)}</div>
                    <div>SpDef<br>${ivBar(p.ivs.spd)}</div>
                </div>
            </div>
        </div>
        ${evolveHtml}
    `;

    // --- Collective Data (Pokedex info) ---
    const bst = pData.hp + pData.atk + pData.def + pData.spa + pData.spd + pData.spe;
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

    const fullEvoTreeHtml = buildEvolutionLineHtml(pData, state);

    let collectiveHtml = `
        <div style="margin-top: 20px; border-top: 2px solid #fff; padding-top: 15px;">
            <h3 style="margin-top: 0;">Species Data</h3>
            <p><b>BST:</b> ${bst} (HP:${pData.hp} | Speed:${pData.spe} | Atk:${pData.atk} SpAtk:${pData.spa} | Def:${pData.def} SpDef:${pData.spd})</p>

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

            ${fullEvoTreeHtml}

            <h4 style="text-align: left;">Moveset</h4>
            ${movesHtml}
        </div>
    `;

    let html = `<div style="max-height: 80vh; overflow-y: auto; overflow-x: hidden;">
        ${individualHtml}
        ${collectiveHtml}
    </div>`;

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

    // Re-verify requirements and consume stones
    const oldPData = state.config.pokemonData.find(pd => pd.id === p.id);
    const evoObj = oldPData ? oldPData.evolutions.find(e => e.to === toId) : null;
    if (evoObj) {
        const req = getEvolveRequirements(p, evoObj, state);
        if (!req.canEvolve) {
            alert("Requirements not met!");
            return;
        }
        // Deduct stones
        for (const type of p.types) {
            const stoneName = type + " Stone";
            state.backpack.stones[stoneName] -= req.stonesReq;
        }
    }


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
