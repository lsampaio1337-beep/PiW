import { getSpeciesDataHtml, buildEvolutionLineHtml } from "./pokedex.js";
import { state } from '../state.js';
import { updateUI, showModal } from '../ui.js';
import { formatType, formatTypes } from './pokedex.js';


function getEvolveRequirements(p, evo, state) {
    const requiredLevel = evo.level;
    const baseStones = Math.ceil(p.level * 0.2);
    const stonesReq = p.types.length === 1 ? baseStones : Math.ceil(baseStones / 2);

    let hasStones = true;
    let missingStonesHtml = "";

    for (const type of p.types) {
        const stoneName = type + " Stone";
        state.backpack.stones[stoneName] = state.backpack.stones[stoneName] || 0; // safe fallback
        const hasCount = state.backpack.stones[stoneName];
        if (hasCount < stonesReq) {
            hasStones = false;
        }
        missingStonesHtml += `${missingStonesHtml ? ' and ' : ''}${stonesReq}<img src="Assets/Items/Stones/${stoneName}.png" style="width: 16px; height: 16px; vertical-align: middle; margin-left: 2px; margin-right: 5px;" title="${stoneName}">`;
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
        <div style="background: #333; width: 100%; height: 16px; border-radius: 8px; overflow: hidden; position: relative;">
            <div style="background: #3498db; width: ${val}%; height: 100%;"></div>
            <div style="position: absolute; top: 0; left: 0; width: 100%; text-align: center; font-size: 12px; line-height: 16px; font-weight: bold; color: white; text-shadow: 1px 1px 1px black;">${val}</div>
        </div>
    `;

    // Actions Check
    let evolveHtml = "";
    if (pData.evolutions && pData.evolutions.length > 0) {
        let evolutionsList = pData.evolutions.map(evo => {
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
                <div>
                    <button ${req.canEvolve ? '' : 'disabled'} onclick="window.evolvePokemon('${location}', ${idx}, ${evo.to})" style="${req.canEvolve ? 'background: #2ecc71;' : 'background: #7f8c8d; cursor: not-allowed;'} vertical-align: middle; width: max-content; min-width: 200px; height: 40px; font-size: 12px; line-height: 1.2; padding: 5px 10px; text-align: center; display: inline-flex; align-items: center; justify-content: center; flex-direction: column;">${btnText}</button>
                </div>
            `;
        }).join('');
        evolveHtml = evolutionsList;
    }

    let actionsHtml = `<div style="margin-top: 15px; border-top: 1px solid #555; padding-top: 10px; display: flex; justify-content: center; gap: 10px;">
        ${evolveHtml}
        <div>
            <button onclick="window.showVitaminsModal('${location}', ${idx})" style="background: #e67e22; cursor: pointer; vertical-align: middle; width: max-content; min-width: 100px; height: 40px; font-size: 14px; font-weight: bold; line-height: 1.2; padding: 5px 10px; text-align: center; display: inline-flex; align-items: center; justify-content: center; flex-direction: column; border: none; border-radius: 5px; color: white;">Vitamins</button>
        </div>
    </div>`;

    const v = p.vitamins || {};
    const getVitHtml = (count, imgName) => {
        if (!count || count <= 0) return '';
        return ` <span style="font-size: 12px; margin-left: 2px;">${count}x<img src="Assets/Items/Vitamins/${imgName}.png" style="width: 12px; height: 12px; vertical-align: middle;"></span>`;
    };

    let individualHtml = `
        <div style="display: flex; justify-content: space-around; flex-wrap: wrap; align-items: stretch; gap: 10px;">
            <div style="background: rgba(0,0,0,0.5); padding: 15px; border-radius: 8px; text-align: left; min-width: 150px; flex: 1; display: flex; flex-direction: column;">
                <h3 style="margin: 0 0 15px 0; text-align: center; border-bottom: 1px solid #555; padding-bottom: 5px;">Actual Stats</h3>
                <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 15px 10px; font-size: 14px; text-align: center; flex: 1; align-content: center;">
                    <div>HP<br><b>${p.maxHp}</b>${getVitHtml(v.hp, 'HP Up')}</div>
                    <div>Speed<br><b>${p.currentStats ? p.currentStats.spe : '?'}</b>${getVitHtml(v.spe, 'Carbo Speed')}</div>
                    <div>Atk<br><b>${p.currentStats ? p.currentStats.atk : '?'}</b>${getVitHtml(v.atk, 'Protein Atk')}</div>
                    <div>SpAtk<br><b>${p.currentStats ? p.currentStats.spa : '?'}</b>${getVitHtml(v.spa, 'Calcium SpAtk')}</div>
                    <div>Def<br><b>${p.currentStats ? p.currentStats.def : '?'}</b>${getVitHtml(v.def, 'Iron Def')}</div>
                    <div>SpDef<br><b>${p.currentStats ? p.currentStats.spd : '?'}</b>${getVitHtml(v.spd, 'Zinc SpDef')}</div>
                </div>
            </div>

            <div style="background: rgba(0,0,0,0.5); padding: 15px; border-radius: 8px; text-align: center; flex: 1; font-size: 14px; display: flex; flex-direction: column; justify-content: center; align-items: center;">
                <img src="Assets/Pokemon Sprites/Natural/${p.qualityName === 'Shiny' ? p.id + '_shiny' : p.id}.png" style="width: 100px; height: 100px;"><br>
                <p style="margin: 5px 0;"><b>Type:</b> ${p.types.map(t => formatType(t)).join(' ')}</p>
                <b>Quality:</b> ${p.qualityName} (Q=${p.quality.toFixed(2)})<br>
                <b>Sum IVs:</b> ${sumIV}<br>
            </div>

            <div style="background: rgba(0,0,0,0.5); padding: 15px; border-radius: 8px; text-align: left; min-width: 200px; flex: 1; display: flex; flex-direction: column;">
                <h3 style="margin: 0 0 15px 0; text-align: center; border-bottom: 1px solid #555; padding-bottom: 5px;">IV Distribution</h3>
                <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 15px 10px; font-size: 14px; text-align: center; flex: 1; align-content: center;">
                    <div>HP<br>${ivBar(p.ivs.hp)}</div>
                    <div>Speed<br>${ivBar(p.ivs.spe)}</div>
                    <div>Atk<br>${ivBar(p.ivs.atk)}</div>
                    <div>SpAtk<br>${ivBar(p.ivs.spa)}</div>
                    <div>Def<br>${ivBar(p.ivs.def)}</div>
                    <div>SpDef<br>${ivBar(p.ivs.spd)}</div>
                </div>
            </div>
        </div>
        ${actionsHtml}
    `;

    // --- Collective Data (Pokedex info) ---



    const fullEvoTreeHtml = buildEvolutionLineHtml(pData, state);

    let collectiveHtml = `
        <div style="margin-top: 20px; border-top: 2px solid #fff; padding-top: 15px;">
            <h3 style="margin-top: 0;">Species Data</h3>
            ${getSpeciesDataHtml(pData, state)}
            ${fullEvoTreeHtml}
        </div>
    `;

    let html = `
        <div class="content-panel" style="max-height: 80vh; overflow-y: auto; overflow-x: hidden;">
            ${individualHtml}
            ${collectiveHtml}
        </div>
    `;

    showModal(`${p.name} (Lv. ${p.level})`, html, "window-pokemon-stats");
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
    const v = p.vitamins || {};
    p.maxHp = mathEngine.calculateHP(newBase.hp, p.ivs.hp, p.level, p.quality, v.hp || 0);
    p.currentStats.atk = mathEngine.calculateStat(newBase.atk, p.ivs.atk, p.level, p.quality, v.atk || 0);
    p.currentStats.def = mathEngine.calculateStat(newBase.def, p.ivs.def, p.level, p.quality, v.def || 0);
    p.currentStats.spa = mathEngine.calculateStat(newBase.spa, p.ivs.spa, p.level, p.quality, v.spa || 0);
    p.currentStats.spd = mathEngine.calculateStat(newBase.spd, p.ivs.spd, p.level, p.quality, v.spd || 0);
    p.currentStats.spe = mathEngine.calculateStat(newBase.spe, p.ivs.spe, p.level, p.quality, v.spe || 0);

    // Heal to max hp when evolving
    p.currentHp = p.maxHp;

    // Evolving counts as catching for the pokedex
    if (!state.stats.caughtSpecies) state.stats.caughtSpecies = {};
    if (!state.stats.caughtSpecies[newBase.name]) {
        state.stats.caughtSpecies[newBase.name] = true;
        state.stats.caught++;
    }

    if (p.quality >= 2) {
        if (!state.stats.caughtShiniesSpecies) state.stats.caughtShiniesSpecies = {};
        state.stats.caughtShiniesSpecies[newBase.name] = true;
    }

    alert(`${p.name} evolved into ${newBase.name}!`);
    document.getElementById('modal-overlay').style.display = 'none'; // Close modal

    updateUI();
}

window.showVitaminsModal = function(location, idx) {
    let list = null;
    if (location === 'party') list = state.party;
    else if (location === 'breeding') list = state.breeding;
    else if (location === 'training') list = state.training;
    else if (location === 'storage') list = state.storage;
    else if (location === 'safe') list = state.safe;

    if (!list || !list[idx]) return;
    const p = list[idx];

    const vitamins = [
        { name: "HP Up", stat: "hp", displayName: "HP Up", shortName: "HP" },
        { name: "Carbo Speed", stat: "spe", displayName: "Carbo Speed", shortName: "Speed" },
        { name: "Protein Atk", stat: "atk", displayName: "Protein Atk", shortName: "Atk" },
        { name: "Calcium SpAtk", stat: "spa", displayName: "Calcium SpAtk", shortName: "SpAtk" },
        { name: "Iron Def", stat: "def", displayName: "Iron Def", shortName: "Def" },
        { name: "Zinc SpDef", stat: "spd", displayName: "Zinc SpDef", shortName: "SpDef" }
    ];

    if (!p.vitamins) p.vitamins = {};

    let html = `
        <div class="content-panel" style="text-align: center; color: white;">
            <p style="margin-top: 0; font-size: 14px; color: #ccc;">Each vitamin increases its stat by 1% of the final base stat (Max 20 per stat).</p>
            <div style="display: grid; grid-template-columns: repeat(2, 1fr); gap: 15px; margin-top: 20px;">
    `;

    for (const v of vitamins) {
        const owned = state.backpack.stones[v.name] || 0;
        const applied = p.vitamins[v.stat] || 0;
        const isMaxed = applied >= 20;
        const canUse = owned > 0 && !isMaxed;

        let btnHtml = '';
        if (isMaxed) {
            btnHtml = `<button disabled style="background: #7f8c8d; cursor: not-allowed; padding: 5px 10px; border: none; border-radius: 4px; color: white; width: 100%;">Maxed (20/20)</button>`;
        } else {
            btnHtml = `<button ${canUse ? '' : 'disabled'} onclick="window.useVitamin('${location}', ${idx}, '${v.name}', '${v.stat}')" style="${canUse ? 'background: #2ecc71; cursor: pointer;' : 'background: #7f8c8d; cursor: not-allowed;'} padding: 5px 10px; border: none; border-radius: 4px; color: white; width: 100%;">Use Vitamin (Owned: ${owned})</button>`;
        }

        html += `
            <div style="background: rgba(0,0,0,0.4); border: 1px solid #555; border-radius: 8px; padding: 10px; display: flex; flex-direction: column; align-items: center;">
                <img src="./Assets/Items/Vitamins/${v.name}.png" style="width: 40px; height: 40px; margin-bottom: 5px;">
                <div style="font-weight: bold; margin-bottom: 5px;">${v.displayName} (+${applied}% ${v.shortName})</div>
                ${btnHtml}
            </div>
        `;
    }

    html += `
            </div>
        </div>
    `;

    showModal(`Vitamins for ${p.name}`, html, "window-vitamins", "500px");
};

import * as mathEngine from '../mathEngine.js';

window.useVitamin = function(location, idx, vitaminName, statKey) {
    let list = null;
    if (location === 'party') list = state.party;
    else if (location === 'breeding') list = state.breeding;
    else if (location === 'training') list = state.training;
    else if (location === 'storage') list = state.storage;
    else if (location === 'safe') list = state.safe;

    if (!list || !list[idx]) return;
    const p = list[idx];

    if (!p.vitamins) p.vitamins = {};
    if (!state.backpack.stones[vitaminName] || state.backpack.stones[vitaminName] <= 0) return;
    if ((p.vitamins[statKey] || 0) >= 20) return;

    // Consume vitamin
    state.backpack.stones[vitaminName]--;
    p.vitamins[statKey] = (p.vitamins[statKey] || 0) + 1;

    // Recalculate stats
    const pBase = state.config.pokemonData.find(pd => pd.id === p.id);
    if (pBase) {
        if (statKey === 'hp') {
            const oldMax = p.maxHp;
            p.maxHp = mathEngine.calculateHP(pBase.hp, p.ivs.hp, p.level, p.quality, p.vitamins.hp);
            p.currentHp = Math.min(p.maxHp, p.currentHp + (p.maxHp - oldMax)); // Heal by difference
        } else {
            p.currentStats[statKey] = mathEngine.calculateStat(pBase[statKey], p.ivs[statKey], p.level, p.quality, p.vitamins[statKey]);
        }
    }

    updateUI();

    // Refresh modals
    window.showVitaminsModal(location, idx);
};
