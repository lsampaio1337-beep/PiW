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

            const hasEncountered = (state.stats.seenSpecies && state.stats.seenSpecies[pData.name]) || (state.stats.caughtSpecies && state.stats.caughtSpecies[pData.name]) ||
                                   state.party.some(p => p.id === i) ||
                                   state.storage.some(p => p.id === i) ||
                                   false;

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

    const bst = pData.hp + pData.atk + pData.def + pData.spa + pData.spd + pData.spe;

    // Calculate Type Effectiveness
    const tConfig = state.config.types;
    let weaknesses = {};
    let resistances = {};
    let immunities = {};
    let effective = {};
    let notEffective = {};
    let noEffect = {};

    // Defending Matchups (Weakness, Resistance, Immune)
    for (const atkType in tConfig) {
        let multiplier = 1;
        for (const defType of pData.types) {
            if (tConfig[atkType] && tConfig[atkType][defType] !== undefined) {
                multiplier *= tConfig[atkType][defType];
            }
        }
        if (multiplier > 1) weaknesses[atkType] = multiplier;
        else if (multiplier < 1 && multiplier > 0) resistances[atkType] = multiplier;
        else if (multiplier === 0) immunities[atkType] = multiplier;
    }

    // Attacking Matchups (Effective, Not Effective, No Effect)
    for (const defType in tConfig) {
        let maxMult = 0;
        for (const atkType of pData.types) {
            let m = 1;
            if (tConfig[atkType] && tConfig[atkType][defType] !== undefined) {
                m = tConfig[atkType][defType];
            }
            if (m > maxMult) maxMult = m;
        }
        if (maxMult > 1) effective[defType] = maxMult;
        else if (maxMult < 1 && maxMult > 0) notEffective[defType] = maxMult;
        else if (maxMult === 0) noEffect[defType] = maxMult;
    }

    // Evolution Line
    let evolveHtml = "";
    if (pData.evolutions && pData.evolutions.length > 0) {
        let evolutionsList = pData.evolutions.map(evo => {
            const nextPData = state.config.pokemonData.find(pd => pd.id === evo.to);
            return `Evolves into <b>${nextPData ? nextPData.name : 'Unknown'}</b> at level ${evo.level}`;
        }).join('<br>');
        evolveHtml = `<div style="text-align: left; margin: 15px 0; font-size: 14px; background: rgba(0,0,0,0.5); padding: 10px; border-radius: 5px;">
            <h4 style="margin: 0 0 5px 0;">Evolution</h4>
            ${evolutionsList}
        </div>`;
    }

    // Moveset Table
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

    const hasSeenShiny = state.stats.seenShiniesSpecies && state.stats.seenShiniesSpecies[pData.name];
    const buttonStyle = hasSeenShiny ? "display: inline-block;" : "display: none;";

    const html = `
        <div style="text-align:center; max-height: 80vh; overflow-y: auto;">
            <h2>#${pData.id} ${pData.name}</h2>
            <img id="dex-sprite" src="Assets/Pokemon Sprites/${pData.id}.png" style="width: 100px; height: 100px;">
            <div>
                <button style="${buttonStyle}" onclick="document.getElementById('dex-sprite').src = 'Assets/Pokemon Sprites/${pData.id}_shiny.png'">Shiny</button>
                <button style="${buttonStyle}" onclick="document.getElementById('dex-sprite').src = 'Assets/Pokemon Sprites/${pData.id}.png'">Normal</button>
            </div>

            <p><b>Type:</b> ${pData.types.map(t => formatType(t)).join(' / ')}</p>
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

            ${evolveHtml}

            <h4 style="text-align: left;">Moveset</h4>
            ${movesHtml}

            <br><br>
            <button onclick="window.showPokedex()">Back to Pokedex</button>
        </div>
    `;

    showModal("", html);
}


export function getSpeciesDataHtml(pData, state) {
    const bst = pData.hp + pData.atk + pData.def + pData.spa + pData.spd + pData.spe;

    // Calculate Type Effectiveness
    const tConfig = state.config.types;
    let weaknesses = {};
    let resistances = {};
    let immunities = {};
    let effective = {};
    let notEffective = {};
    let noEffect = {};

    // Defending Matchups (Weakness, Resistance, Immune)
    for (const atkType in tConfig) {
        let multiplier = 1;
        for (const defType of pData.types) {
            if (tConfig[atkType] && tConfig[atkType][defType] !== undefined) {
                multiplier *= tConfig[atkType][defType];
            }
        }
        if (multiplier > 1) weaknesses[atkType] = multiplier;
        else if (multiplier < 1 && multiplier > 0) resistances[atkType] = multiplier;
        else if (multiplier === 0) immunities[atkType] = multiplier;
    }

    // Attacking Matchups (Effective, Not Effective, No Effect)
    for (const defType in tConfig) {
        let maxMult = 0;
        for (const atkType of pData.types) {
            let m = 1;
            if (tConfig[atkType] && tConfig[atkType][defType] !== undefined) {
                m = tConfig[atkType][defType];
            }
            if (m > maxMult) maxMult = m;
        }
        if (maxMult > 1) effective[defType] = maxMult;
        else if (maxMult < 1 && maxMult > 0) notEffective[defType] = maxMult;
        else if (maxMult === 0) noEffect[defType] = maxMult;
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

        <h4 style="text-align: left;">Moveset</h4>
        ${movesHtml}
    `;
}
