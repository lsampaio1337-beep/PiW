import { state } from '../state.js';
import { updateUI, showModal } from '../ui.js';

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

    // Check for evolutions
    let evolveHtml = "";
    const pData = state.config.pokemonData.find(pd => pd.id === p.id);
    if (pData && pData.evolutions && pData.evolutions.length > 0) {
        let evolutionsList = pData.evolutions.map(evo => {
            const nextPData = state.config.pokemonData.find(pd => pd.id === evo.to);
            const canEvolve = p.level >= evo.level;
            return `
                <div style="margin-top: 10px;">
                    Evolution: <b>${nextPData ? nextPData.name : 'Unknown'}</b> (Level ${evo.level})
                    <button ${canEvolve ? '' : 'disabled'} onclick="window.evolvePokemon('${location}', ${idx}, ${evo.to})" style="${canEvolve ? 'background: #2ecc71;' : 'background: #7f8c8d; cursor: not-allowed;'} margin-left: 10px;">Evolve</button>
                </div>
            `;
        }).join('');
        evolveHtml = `<div style="margin-top: 15px; border-top: 1px solid #555; padding-top: 10px;">${evolutionsList}</div>`;
    }

    let html = `
        <div style="display: flex; justify-content: space-around;">
            <div>
                <img src="Assets/Pokemon Sprites/${p.qualityName === 'Shiny' ? p.id + '_shiny' : p.id}.png" style="width: 100px; height: 100px;"><br>
                <b>Quality:</b> ${p.qualityName} (Q=${p.quality.toFixed(2)})<br>
                <b>Sum IVs:</b> ${sumIV}<br>
            </div>
            <div style="text-align: left;">
                <h4>IV Distribution</h4>
                HP: ${p.ivs.hp}<br>
                ATK: ${p.ivs.atk}<br>
                DEF: ${p.ivs.def}<br>
                SPA: ${p.ivs.spa}<br>
                SPD: ${p.ivs.spd}<br>
                SPE: ${p.ivs.spe}<br>
            </div>
        </div>
        ${evolveHtml}
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
