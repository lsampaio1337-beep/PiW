const fs = require('fs');

let content = fs.readFileSync('src/ui/pokemonStats.js', 'utf8');

// The main issues are the layout problems and the evolve button text/cost bug.
// We'll regenerate the whole file text because it's easier to build the HTML strings correctly.

const newContent = `import { state } from '../state.js';
import { TYPE_COLORS, updateUI, showModal, showDexEntry } from '../ui.js';

export function showPokemonStats(location, idx) {
    let list = null;
    if (location === 'party') list = state.party;
    else if (location === 'breeding') list = state.breeding;
    else if (location === 'training') list = state.training;
    else if (location === 'storage') list = state.storage;
    else if (location === 'safe') list = state.safe;

    if (!list || !list[idx]) return;

    const p = list[idx];
    const pData = state.config.pokemonData.find(pd => pd.id === p.id);
    if (!pData) return;

    const sumIV = p.ivs.hp + p.ivs.atk + p.ivs.def + p.ivs.spa + p.ivs.spd + p.ivs.spe;

    const formatType = (type) => {
        const color = TYPE_COLORS[type] || '#fff';
        return \`<span style="color: \${color};"><img src="Assets/Extra/Type \${type}.png" style="height: 12px; vertical-align: middle;"> \${type}</span>\`;
    };

    const formatTypes = (typesObj) => {
        return Object.keys(typesObj).map(type => formatType(type)).join(', ');
    };

    // Calculate Evolution Stones Cost
    let canEvolve = false;
    let evolveButtonHtml = "";

    // In our logic, the cost is based on the REQUIRED LEVEL for evolution, not current level.
    // If we evolve at any level via stones, maybe the required level is evo.level.
    // "Cost of stones is faulty when pokemon is bellow level of evolution. Therefore remove the cost.
    // On 'Evolve' button, put inside button on a second row 'At least #&+$%' if pokemon is not at evolution level or just '#&+$%' if pokemon is at least at evolution level."

    if (pData.evolutions && pData.evolutions.length > 0) {
        let evo = pData.evolutions[0]; // Assume first for button
        const nextPData = state.config.pokemonData.find(pd => pd.id === evo.to);

        const baseCost = Math.ceil(evo.level * 0.1);
        const isDualTyped = p.types.length > 1;
        const stonesNeededType1 = isDualTyped ? baseCost : baseCost * 2;
        const stonesNeededType2 = isDualTyped ? baseCost : 0;

        const type1 = p.types[0];
        const type2 = isDualTyped ? p.types[1] : null;

        const stone1Name = type1 + ' Stone';
        const stone2Name = type2 ? type2 + ' Stone' : null;

        let playerStones1 = (state.inventory && state.inventory[stone1Name]) || 0;
        let playerStones2 = stone2Name ? ((state.inventory && state.inventory[stone2Name]) || 0) : 0;

        let hasStones = false;
        if (!isDualTyped) {
            hasStones = playerStones1 >= stonesNeededType1;
        } else {
            if (type1 === type2) { // Edge case fallback
                hasStones = playerStones1 >= (stonesNeededType1 + stonesNeededType2);
            } else {
                hasStones = playerStones1 >= stonesNeededType1 && playerStones2 >= stonesNeededType2;
            }
        }

        let isLevelOk = p.level >= evo.level;
        canEvolve = isLevelOk && hasStones;

        let costInnerHtml = "";
        if (!isDualTyped || type1 === type2) {
            let totalNeeded = isDualTyped ? (stonesNeededType1 + stonesNeededType2) : stonesNeededType1;
            costInnerHtml = \`\${totalNeeded} <img src="Assets/Items/\${stone1Name}.png" style="height: 16px; vertical-align: middle;">\`;
        } else {
            costInnerHtml = \`\${stonesNeededType1} <img src="Assets/Items/\${stone1Name}.png" style="height: 16px; vertical-align: middle;"> + \${stonesNeededType2} <img src="Assets/Items/\${stone2Name}.png" style="height: 16px; vertical-align: middle;">\`;
        }

        let buttonLabel = isLevelOk ? costInnerHtml : \`At least \${costInnerHtml}\`;

        evolveButtonHtml = \`
            <div style="text-align: center; margin-top: 10px;">
                Evolution: <b>\${nextPData ? nextPData.name : 'Unknown'}</b><br>
                <button \${canEvolve ? '' : 'disabled'} onclick="window.evolvePokemon('\${location}', \${idx}, \${evo.to}, \${evo.level})" style="\${canEvolve ? 'background: #2ecc71;' : 'background: #7f8c8d; cursor: not-allowed; opacity: 0.8;'} margin-top: 5px; padding: 5px 15px; display: flex; flex-direction: column; align-items: center; justify-content: center; width: 100%;">
                    <span>Evolve</span>
                    <span style="font-size: 10px; display: flex; align-items: center; gap: 3px;">\${buttonLabel}</span>
                </button>
            </div>
        \`;
    }

    // Evolution Line Display
    let evolutionLineHtml = "";
    // Find the root of the evolution tree by scanning backwards
    let root = pData;
    let foundRoot = false;
    while(!foundRoot) {
        let parent = state.config.pokemonData.find(pd => pd.evolutions && pd.evolutions.some(e => e.to === root.id));
        if(parent) {
            root = parent;
        } else {
            foundRoot = true;
        }
    }

    if(root) {
         evolutionLineHtml = \`<div style="display:flex; align-items:center; justify-content:center; gap: 10px; margin-top: 20px;">\`;

         let current = root;
         while(current) {
             evolutionLineHtml += \`
                <div style="text-align:center; cursor:pointer;" onclick="window.showDexEntry(\${current.id})">
                    <img src="Assets/Pokemon Sprites/\${current.id}.png" style="width: 50px; height: 50px;">
                    <div style="font-size: 10px;">\${current.name}</div>
                </div>
             \`;
             if(current.evolutions && current.evolutions.length > 0) {
                 let evo = current.evolutions[0]; // simplify for linear
                 evolutionLineHtml += \`
                    <div style="text-align:center; font-size:12px;">
                        &#8594;<br>Lvl \${evo.level}
                    </div>
                 \`;
                 current = state.config.pokemonData.find(pd => pd.id === evo.to);
             } else {
                 current = null;
             }
         }
         evolutionLineHtml += \`</div>\`;
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

    let movesHtml = \`
        <table style="width: 100%; border-collapse: collapse; text-align: left; margin-top: 10px; font-size: 12px;">
            <tr style="border-bottom: 1px solid #777;">
                <th>Lvl</th><th>Move Name</th><th>Type</th><th>Power</th><th>Category</th>
            </tr>
    \`;
    if (pData.learnset) {
        pData.learnset.forEach(m => {
            let mData = state.config.moves[m.move];
            movesHtml += \`<tr style="border-bottom: 1px solid #444;">
                <td>\${m.level}</td>
                <td>\${m.move}</td>
                <td>\${mData ? formatType(mData.type) : '?'}</td>
                <td>\${mData ? mData.power : '?'}</td>
                <td>\${mData ? mData.category : '?'}</td>
            </tr>\`;
        });
    }
    movesHtml += \`</table>\`;

    // Helper for Custom Progress Bar
    const renderStatBar = (label, val) => {
        return \`
            <div style="margin-bottom: 5px;">
                <div style="position: relative; background-color: #333; border-radius: 4px; height: 16px; width: 100%; overflow: hidden;">
                    <div style="background-color: #3498db; width: \${val}%; height: 100%;"></div>
                    <span style="position: absolute; top: 0; left: 0; width: 100%; height: 100%; display: flex; align-items: center; padding-left: 5px; font-size: 11px; color: #fff; text-shadow: 1px 1px 2px #000;">
                        \${label}: \${val}
                    </span>
                </div>
            </div>
        \`;
    };

    let html = \`
        <!-- Removed max-height here so the entire modal can handle scrolling gracefully -->
        <div style="display: flex; flex-direction: column; gap: 15px;">

            <div style="display: flex; gap: 20px; align-items: stretch; border-bottom: 1px solid #555; padding-bottom: 15px;">
                <div style="flex: 1; display: flex; flex-direction: column; align-items: center; justify-content: center;">
                    <img src="Assets/Pokemon Sprites/\${p.qualityName === 'Shiny' ? p.id + '_shiny' : p.id}.png" style="width: 100px; height: 100px;">
                    <div style="text-align: center;">
                        <b>Type:</b> \${p.types.map(t => formatType(t)).join(' / ')}<br>
                        <b>Quality:</b> \${p.qualityName} (Q=\${p.quality.toFixed(2)})<br>
                        <b>Sum IVs:</b> \${sumIV}<br>
                    </div>
                    \${evolveButtonHtml}
                </div>

                <div style="flex: 1; display: flex; flex-direction: column; justify-content: center;">
                    <div style="display: grid; grid-template-columns: 1fr 1fr; gap: x; column-gap: 15px;">
                        <h4 style="grid-column: 1 / -1; text-align: center; margin: 0 0 10px 0;">IV Distribution</h4>
                        <div>
                            \${renderStatBar('HP', p.ivs.hp)}
                            \${renderStatBar('ATK', p.ivs.atk)}
                            \${renderStatBar('DEF', p.ivs.def)}
                        </div>
                        <div>
                            \${renderStatBar('SPE', p.ivs.spe)}
                            \${renderStatBar('SPA', p.ivs.spa)}
                            \${renderStatBar('SPD', p.ivs.spd)}
                        </div>
                    </div>
                </div>
            </div>

            <div>
                <h4 style="margin-top:0;">Species Data</h4>
                <p><b>BST:</b> \${bst} (HP:\${pData.hp} A:\${pData.atk} D:\${pData.def} SA:\${pData.spa} SD:\${pData.spd} S:\${pData.spe})</p>

                <div style="text-align: left; margin: 15px 0; font-size: 14px; background: rgba(0,0,0,0.5); padding: 10px; border-radius: 5px;">
                    <h4 style="margin: 0 0 5px 0;">Defensive Effectiveness</h4>
                    \${Object.keys(weaknesses).length ? \`<b>Weak To (2x):</b> \${formatTypes(weaknesses)}<br>\` : ''}
                    \${Object.keys(resistances).length ? \`<b>Resists (0.5x):</b> \${formatTypes(resistances)}<br>\` : ''}
                    \${Object.keys(immunities).length ? \`<b>Immune To (0x):</b> \${formatTypes(immunities)}<br>\` : ''}

                    <h4 style="margin: 10px 0 5px 0;">Offensive Effectiveness</h4>
                    \${Object.keys(effective).length ? \`<b>Super Effective (2x):</b> \${formatTypes(effective)}<br>\` : ''}
                    \${Object.keys(notEffective).length ? \`<b>Not Very Effective (0.5x):</b> \${formatTypes(notEffective)}<br>\` : ''}
                    \${Object.keys(noEffect).length ? \`<b>No Effect (0x):</b> \${formatTypes(noEffect)}<br>\` : ''}
                </div>

                \${evolutionLineHtml}

                <h4 style="text-align: left;">Moveset</h4>
                \${movesHtml}
            </div>
        </div>
    \`;

    // Modals typically have their own internal overflow-y, but setting a class or style if needed:
    showModal(\`\${p.name} (Lv. \${p.level})\`, html);
}

export function evolvePokemon(location, idx, toId, requiredLevel) {
    let list = null;
    if (location === 'party') list = state.party;
    else if (location === 'breeding') list = state.breeding;
    else if (location === 'training') list = state.training;
    else if (location === 'storage') list = state.storage;
    else if (location === 'safe') list = state.safe;

    if (!list || !list[idx]) return;

    let p = list[idx];

    if (p.level < requiredLevel) return;

    const newBase = state.config.pokemonData.find(pd => pd.id === toId);
    if (!newBase) return;

    // Consume stones based on the evolution's required level!
    const baseCost = Math.ceil(requiredLevel * 0.1);
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

    if (!isDualTyped) {
        if(playerStones1 < stonesNeededType1) return;
    } else {
        if (type1 === type2) {
            if(playerStones1 < (stonesNeededType1 + stonesNeededType2)) return;
        } else {
            if(playerStones1 < stonesNeededType1 || playerStones2 < stonesNeededType2) return;
        }
    }

    state.inventory[stone1Name] -= stonesNeededType1;
    if(stone2Name && type1 !== type2) state.inventory[stone2Name] -= stonesNeededType2;
    else if (stone2Name && type1 === type2) state.inventory[stone1Name] -= stonesNeededType2;

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

    alert(\`\${p.name} evolved into \${newBase.name}!\`);
    document.getElementById('modal-overlay').style.display = 'none'; // Close modal

    updateUI();
}
`;

fs.writeFileSync('src/ui/pokemonStats.js', newContent);
