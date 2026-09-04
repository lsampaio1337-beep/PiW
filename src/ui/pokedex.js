import { state } from '../state.js';
import { showModal, TYPE_COLORS } from '../ui.js';

export function formatType(typeStr) {
    if (!typeStr || !TYPE_COLORS[typeStr]) return typeStr;
    const color = TYPE_COLORS[typeStr];
    return `<span style="color: ${color}; display: inline-flex; align-items: center; gap: 4px;">
                <img src="Assets/Extra/Type ${typeStr}.png" style="height: 14px;"> ${typeStr}
            </span>`;
}

export function formatTypes(obj) {
    return Object.keys(obj).length ? Object.keys(obj).map(t => formatType(t)).join(', ') : 'None';
}


export function hasEncounteredSpecies(id, state) {
    const pData = state.config.pokemonData.find(p => p.id === id);
    if (!pData) return false;
    return (state.stats.seenSpecies && state.stats.seenSpecies[pData.name]) ||
           (state.stats.caughtSpecies && state.stats.caughtSpecies[pData.name]) ||
           state.party.some(p => p.id === id) ||
           state.storage.some(p => p.id === id) ||
           state.safe.some(p => p.id === id) ||
           state.breeding.some(p => p.id === id) ||
           state.training.some(p => p.id === id) ||
           false;
}

export function showPokedex() {
    let uniqueSpeciesCaught = 0;
    if (state.stats.caughtSpecies) {
        uniqueSpeciesCaught = Object.keys(state.stats.caughtSpecies).length;
    }

    let html = `<p>Caught: ${uniqueSpeciesCaught} / 150</p><div style="display:flex; flex-wrap:wrap; max-height:400px; overflow-y:auto; gap:10px;">`;

    if (!state.config.pokemonData) {
        html += "<p>Loading Pokedex data...</p>";
    } else {
        // Iterate up to 150
        for(let i = 1; i <= 150; i++) {
            const pData = state.config.pokemonData.find(p => p.id === i);
            if (!pData) continue;

            const hasEncountered = hasEncounteredSpecies(i, state);

            let filter = hasEncountered ? "none" : "brightness(0)";
            let cursor = hasEncountered ? "pointer" : "default";
            let onClick = hasEncountered ? `onclick="window.showDexEntry(${i})"` : "";

            html += `<div style="width: 60px; text-align: center; font-size: 10px;">
                <div style="font-weight:bold;">#${i}</div>
                <img src="Assets/Pokemon Sprites/${i}.png" style="width: 50px; height: 50px; filter: ${filter}; cursor: ${cursor};" ${onClick}>
            </div>`;
        }
    }

    html += `</div>`;
    showModal("", html);
}

export function showDexEntry(id) {
    const pData = state.config.pokemonData.find(p => p.id === id);
    if (!pData) return;

    const hasSeenShiny = state.stats.seenShiniesSpecies && state.stats.seenShiniesSpecies[pData.name];
    const buttonStyle = hasSeenShiny ? "display: inline-block;" : "display: none;";

    const speciesHtml = getSpeciesDataHtml(pData, state);
    const evoTreeHtml = buildEvolutionLineHtml(pData, state);

    const html = `
        <div style="text-align:center; max-height: 80vh; overflow-y: auto; padding: 0 10px;">
            <h2>#${pData.id} ${pData.name}</h2>
            <img id="dex-sprite" src="Assets/Pokemon Sprites/${pData.id}.png" style="width: 100px; height: 100px;">
            <div style="margin-bottom: 10px;">
                <button style="${buttonStyle}" onclick="document.getElementById('dex-sprite').src = 'Assets/Pokemon Sprites/${pData.id}_shiny.png'">Shiny</button>
                <button style="${buttonStyle}" onclick="document.getElementById('dex-sprite').src = 'Assets/Pokemon Sprites/${pData.id}.png'">Normal</button>
            </div>

            <p><b>Type:</b> ${pData.types.map(t => formatType(t)).join(' ')}</p>

            ${speciesHtml}
            ${evoTreeHtml}

            <br>
            <button onclick="window.showPokedex()">Back to Pokedex</button>
        </div>
    `;

    showModal("", html);
}

export function buildEvolutionLineHtml(pData, state) {
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

        const hasEncountered = hasEncounteredSpecies(currentId, state);
        let filter = hasEncountered ? "none" : "brightness(0)";
        let cursor = hasEncountered ? "pointer" : "default";
        let onClick = hasEncountered ? `onclick="window.showDexEntry(${pd.id})"` : "";
        let displayName = hasEncountered ? pd.name : "???";

        let html = `<div style="display: flex; flex-direction: column; align-items: center; margin: 5px;">
            <img src="Assets/Pokemon Sprites/${pd.id}.png" style="width: 50px; height: 50px; filter: ${filter}; cursor: ${cursor};" ${onClick} title="${displayName}">
            <span style="font-size: 10px; cursor: ${cursor};" ${onClick}>${displayName}</span>
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

export function getSpeciesDataHtml(pData, state) {
    const bst = pData.hp + pData.atk + pData.def + pData.spa + pData.spd + pData.spe;

    // Calculate Type Effectiveness
    const tConfig = state.config.types;
    let defMatchups = {};
    let offMatchups = {};

    // Defending Matchups
    for (const atkType in tConfig) {
        let multiplier = 1;
        for (const defType of pData.types) {
            if (tConfig[atkType] && tConfig[atkType][defType] !== undefined) {
                multiplier *= tConfig[atkType][defType];
            }
        }
        if (multiplier !== 1) defMatchups[atkType] = multiplier;
    }

    // Attacking Matchups
    for (const defType in tConfig) {
        let maxMult = 0;
        for (const atkType of pData.types) {
            let m = 1;
            if (tConfig[atkType] && tConfig[atkType][defType] !== undefined) {
                m = tConfig[atkType][defType];
            }
            if (m > maxMult) maxMult = m;
        }
        if (maxMult !== 1) offMatchups[defType] = maxMult;
    }

    const def4x = {}, def2x = {}, def05x = {}, def025x = {}, def0x = {};
    for (const t in defMatchups) {
        if (defMatchups[t] === 4) def4x[t] = 4;
        else if (defMatchups[t] === 2) def2x[t] = 2;
        else if (defMatchups[t] === 0.5) def05x[t] = 0.5;
        else if (defMatchups[t] === 0.25) def025x[t] = 0.25;
        else if (defMatchups[t] === 0) def0x[t] = 0;
    }

    const off2x = {}, off05x = {}, off0x = {};
    for (const t in offMatchups) {
        if (offMatchups[t] === 2) off2x[t] = 2;
        else if (offMatchups[t] === 0.5) off05x[t] = 0.5;
        else if (offMatchups[t] === 0) off0x[t] = 0;
    }

    let movesHtml = `
        <table style="width: 100%; text-align: left; font-size: 14px; border-collapse: collapse;">
            <tr style="border-bottom: 1px solid #fff;">
                <th style="padding-bottom: 5px;">Lvl</th>
                <th style="padding-bottom: 5px;">Move</th>
                <th style="padding-bottom: 5px;">Type</th>
                <th style="padding-bottom: 5px;">Pwr</th>
                <th style="padding-bottom: 5px;">Cat</th>
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

    return `
        <p><b>BST:</b> ${bst} (HP:${pData.hp} | Speed:${pData.spe} | Atk:${pData.atk} | SpAtk:${pData.spa} | Def:${pData.def} | SpDef:${pData.spd})</p>

        <div style="text-align: left; margin: 15px 0; font-size: 14px; background: rgba(0,0,0,0.5); padding: 10px; border-radius: 5px;">
            <h4 style="margin: 0 0 5px 0;">Defensive Effectiveness</h4>
            ${Object.keys(def4x).length ? `<b>Very Weak To (4x):</b> ${formatTypes(def4x)}<br>` : ''}
            ${Object.keys(def2x).length ? `<b>Weak To (2x):</b> ${formatTypes(def2x)}<br>` : ''}
            ${Object.keys(def05x).length ? `<b>Resists (0.5x):</b> ${formatTypes(def05x)}<br>` : ''}
            ${Object.keys(def025x).length ? `<b>Strongly Resists (0.25x):</b> ${formatTypes(def025x)}<br>` : ''}
            ${Object.keys(def0x).length ? `<b>Immune To (0x):</b> ${formatTypes(def0x)}<br>` : ''}

            <h4 style="margin: 10px 0 5px 0;">Offensive Effectiveness</h4>
            ${Object.keys(off2x).length ? `<b>Super Effective (2x):</b> ${formatTypes(off2x)}<br>` : ''}
            ${Object.keys(off05x).length ? `<b>Not Very Effective (0.5x):</b> ${formatTypes(off05x)}<br>` : ''}
            ${Object.keys(off0x).length ? `<b>No Effect (0x):</b> ${formatTypes(off0x)}<br>` : ''}
        </div>

        <h4 style="text-align: left;">Moveset</h4>
        ${movesHtml}
    `;
}
