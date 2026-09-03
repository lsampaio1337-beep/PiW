const fs = require('fs');

let content = fs.readFileSync('src/ui/pokemonStats.js', 'utf8');

const newRender = `export function renderPokemonStats(index, source = 'party') {
    let list;
    if (source === 'party') list = state.party;
    else if (source === 'storage') list = state.backpack.pokemon;
    else if (source === 'safe') list = state.backpack.safe;
    else if (source === 'breed') list = [state.dayCareRef.slot1];
    else if (source === 'train') list = [state.dayCareRef.slot2];

    const p = list[index];
    if (!p) return;

    const dexData = state.config.pokemon[p.id];

    // Individual Information Top
    let html = \`
        <div style="font-size: 24px; font-weight: bold; text-align: center;">\${p.name} (Lvl \${p.level})</div>
        <div style="text-align: center; margin-bottom: 10px;">
            \${dexData.types.map(t => window.formatType ? window.formatType(t) : t).join(' ')}
        </div>
        <div style="display: flex; justify-content: center; margin-bottom: 20px;">
            <img src="Assets/Pokemon Sprites/\${p.id}.png" style="width: 100px; height: 100px;" onerror="this.src='Assets/Extra/Missing.png'">
        </div>
    \`;

    // Evolution logic and buttons
    if (dexData.evolutions && dexData.evolutions.length > 0) {
        html += \`<div style="text-align: center; margin-bottom: 20px;">\`;
        for (let i = 0; i < dexData.evolutions.length; i += 2) {
            const evId = dexData.evolutions[i];
            const evLevel = dexData.evolutions[i+1];

            // Calculate stone cost: 10% of level (rounded up) per type, doubled if single type
            let baseCost = Math.ceil(p.level * 0.1);
            if (dexData.types.length === 1) {
                baseCost *= 2;
            }

            let hasStones = true;
            let stoneStrArr = [];
            for(const type of dexData.types) {
                const stoneName = type + " Stone";
                const owned = state.backpack.stones[stoneName] || 0;
                stoneStrArr.push(\`\${baseCost} \${stoneName} (\${owned})\`);
                if (owned < baseCost) hasStones = false;
            }

            let costStr = stoneStrArr.join(" and ");

            if (p.level >= evLevel) {
                 if (hasStones) {
                    html += \`<button onclick="window.evolvePokemon('\${source}', \${index}, \${evId}, \${baseCost})">Evolve to \${state.config.pokemon[evId].name} (\${costStr})</button>\`;
                 } else {
                    html += \`<button disabled>Evolve to \${state.config.pokemon[evId].name} (Need \${costStr})</button>\`;
                 }
            } else {
                html += \`<button disabled>At least \${costStr} to evolve</button>\`;
            }
        }
        html += \`</div>\`;
    }

    // 2x3 Grid for IV Progress Bars
    html += \`
        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 10px; max-width: 400px; margin: 0 auto 20px;">
            \${createIvBar('HP', p.ivs.hp)}
            \${createIvBar('Speed', p.ivs.speed)}
            \${createIvBar('Atk', p.ivs.atk)}
            \${createIvBar('SpAtk', p.ivs.spAtk)}
            \${createIvBar('Def', p.ivs.def)}
            \${createIvBar('SpDef', p.ivs.spDef)}
        </div>
    \`;

    html += \`<div style="text-align: center; margin-bottom: 20px;">
        <div><strong>Q Value:</strong> \${p.qValue.toFixed(2)}</div>
        <div><strong>Sum IV:</strong> \${p.sumIV}</div>
    </div>\`;

    html += \`<hr style="border: 1px solid #444; margin: 20px 0;">\`;

    // Collective Information Bottom (Pokedex)
    html += \`<div style="font-size: 20px; font-weight: bold; text-align: center; margin-bottom: 10px;">Species Data (\${dexData.name})</div>\`;

    // BST
    const bst = dexData.baseStats.hp + dexData.baseStats.atk + dexData.baseStats.def + dexData.baseStats.spAtk + dexData.baseStats.spDef + dexData.baseStats.speed;
    html += \`<div style="text-align: center; margin-bottom: 15px;">
        <strong>BST: \${bst} (HP:\${dexData.baseStats.hp} | Speed:\${dexData.baseStats.speed} | Atk:\${dexData.baseStats.atk} SpAtk:\${dexData.baseStats.spAtk} | Def:\${dexData.baseStats.def} SpDef:\${dexData.baseStats.spDef})</strong>
    </div>\`;

    // Evolution Line Visuals
    if (window.buildEvolutionLineHtml) {
        html += \`<div style="margin-bottom: 20px;">
            <div style="text-align: center; font-weight: bold; margin-bottom: 5px;">Evolution Line</div>
            \${window.buildEvolutionLineHtml(p.id, state.config.pokemon)}
        </div>\`;
    }

    // Effectiveness
    if (window.calculateEffectiveness) {
        const effectivenessList = window.calculateEffectiveness(dexData.types, state.config.types);
        let effectivenessHtml = '';
        const multLabels = {4: '4x', 2: '2x', 0.5: '0.5x', 0.25: '0.25x', 0: '0x'};
        for (const [mult, label] of Object.entries(multLabels)) {
            if (effectivenessList[mult] && effectivenessList[mult].length > 0) {
                effectivenessHtml += \`<div style="margin-bottom: 5px;"><strong>\${label} Damage:</strong> \`;
                effectivenessHtml += effectivenessList[mult].map(t => window.formatType(t)).join(' ');
                effectivenessHtml += \`</div>\`;
            }
        }
        if (effectivenessHtml) {
            html += \`<div style="margin-bottom: 20px;">\${effectivenessHtml}</div>\`;
        }
    }

    // Moveset
    if (window.buildMovesetHtml) {
        html += \`<div style="margin-bottom: 20px;">
            <div style="text-align: center; font-weight: bold; margin-bottom: 5px;">Moveset</div>
            \${window.buildMovesetHtml(dexData, state.config.moves)}
        </div>\`;
    }

    const modalContent = document.getElementById('modal-content-box');
    modalContent.innerHTML = html;

    // Style modal for scrolling
    modalContent.dataset.originalStyles = modalContent.getAttribute('style');
    modalContent.style.cssText += \`
        max-width: 600px;
        max-height: 80vh;
        overflow-y: auto;
        padding: 20px;
        background-color: #2c3e50;
        color: white;
        border-radius: 10px;
    \`;

    document.getElementById('modal-overlay').style.display = 'flex';
}

function createIvBar(label, value) {
    const percentage = Math.min(100, Math.max(0, value)); // Ensure between 0 and 100
    return \`
        <div style="background-color: #333; border-radius: 5px; position: relative; height: 25px; overflow: hidden; border: 1px solid #555;">
            <div style="position: absolute; top: 0; left: 0; height: 100%; width: \${percentage}%; background-color: #4CAF50;"></div>
            <div style="position: absolute; top: 0; left: 0; height: 100%; width: 100%; display: flex; justify-content: space-between; align-items: center; padding: 0 10px; font-size: 12px; font-weight: bold; text-shadow: 1px 1px 2px black; box-sizing: border-box; z-index: 1;">
                <span>\${label}</span>
                <span>\${value}/100</span>
            </div>
        </div>
    \`;
}

export function evolvePokemon(source, index, newId, baseCost) {
    let list;
    if (source === 'party') list = state.party;
    else if (source === 'storage') list = state.backpack.pokemon;
    else if (source === 'safe') list = state.backpack.safe;
    else if (source === 'breed') list = [state.dayCareRef.slot1];
    else if (source === 'train') list = [state.dayCareRef.slot2];

    const p = list[index];
    const dexData = state.config.pokemon[p.id];

    // Deduct stones
    for(const type of dexData.types) {
        const stoneName = type + " Stone";
        if (state.backpack.stones[stoneName] >= baseCost) {
             state.backpack.stones[stoneName] -= baseCost;
        } else {
             return; // Should not happen due to disabled button, but safe-guard
        }
    }

    p.id = newId;
    p.name = state.config.pokemon[newId].name;

    // Auto-close modal to refresh view context
    window.closeModal();
    if (window.updateBackpackUI) window.updateBackpackUI();
    if (window.updateUI) window.updateUI();
}`;

content = content.replace(/export function renderPokemonStats[\s\S]*\}\n/m, newRender + '\n');
fs.writeFileSync('src/ui/pokemonStats.js', content, 'utf8');
