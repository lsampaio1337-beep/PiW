const fs = require('fs');

let content = fs.readFileSync('src/ui/pokedex.js', 'utf8');

// 1. Export formatType, calculateEffectiveness, buildMovesetHtml, buildEvolutionLineHtml
content = content.replace('function showDexEntry', `function formatType(type) {
    if (!type) return '';
    const color = window.TYPE_COLORS[type] || '#FFFFFF';
    return \`<span style="background-color: \${color}; padding: 2px 5px; border-radius: 5px; color: black; border: 1px solid black;">\${type}</span>\`;
}

function calculateEffectiveness(types, configTypes) {
    const effectivenessList = {
        4: [],
        2: [],
        0.5: [],
        0.25: [],
        0: []
    };

    const allTypes = Object.keys(configTypes);

    for (const attackType of allTypes) {
        let effectiveness = 1.0;
        for (const defType of types) {
            if (configTypes[attackType][defType] !== undefined) {
                effectiveness *= configTypes[attackType][defType];
            }
        }
        if (effectiveness !== 1.0 && effectivenessList[effectiveness]) {
            effectivenessList[effectiveness].push(attackType);
        }
    }
    return effectivenessList;
}

function buildMovesetHtml(pokemon, allMoves) {
    let movesHtml = \`<div style="display: flex; flex-wrap: wrap; justify-content: center;">\`;
    const sortedLevels = Object.keys(pokemon.moves).map(Number).sort((a, b) => a - b);

    for (const level of sortedLevels) {
        const moveName = pokemon.moves[level];
        const moveData = allMoves[moveName];
        if (moveData) {
            movesHtml += \`
                <div style="margin: 5px; padding: 5px; border: 1px solid #ccc; text-align: center;">
                    <div>Level \${level}</div>
                    <div style="font-weight: bold;">\${moveName}</div>
                    <div>\${formatType(moveData.type)}</div>
                    <div>Pwr: \${moveData.power}, Acc: \${moveData.accuracy}</div>
                </div>\`;
        }
    }
    movesHtml += \`</div>\`;
    return movesHtml;
}

function buildEvolutionLineHtml(dexNumber, allPokemon) {
    // Find the root of the evolution tree
    let rootNum = dexNumber;
    let foundParent = true;
    while(foundParent) {
        foundParent = false;
        for (let num = 1; num <= 150; num++) {
            const p = allPokemon[num];
            if (p && p.evolutions) {
                for (let i = 0; i < p.evolutions.length; i+=2) {
                    if (p.evolutions[i] === rootNum) {
                        rootNum = num;
                        foundParent = true;
                        break;
                    }
                }
            }
            if (foundParent) break;
        }
    }

    // Recursive function to build tree
    function buildTreeHtml(currentNum, levelReq = null) {
        const p = allPokemon[currentNum];
        if (!p) return '';

        let html = \`<div style="display: flex; align-items: center;">\`;

        // Render arrow if not root
        if (levelReq !== null) {
            html += \`
                <div style="display: flex; flex-direction: column; align-items: center; margin: 0 10px;">
                    <div style="font-size: 24px;">\u2192</div>
                    <div style="font-size: 12px; color: #888;">Lvl \${levelReq}</div>
                </div>
            \`;
        }

        // Render current pokemon
        html += \`
            <div style="display: flex; flex-direction: column; align-items: center; cursor: pointer;" onclick="window.showDexEntry(\${currentNum})">
                <img src="Assets/Pokemon Sprites/\${currentNum}.png" style="width: 50px; height: 50px;" onerror="this.src='Assets/Extra/Missing.png'">
                <div style="font-size: 12px;">\${p.name}</div>
            </div>
        \`;

        // Render children
        if (p.evolutions && p.evolutions.length > 0) {
            html += \`<div style="display: flex; flex-direction: column; margin-left: 10px;">\`;
            for (let i = 0; i < p.evolutions.length; i += 2) {
                const nextNum = p.evolutions[i];
                const nextLvlReq = p.evolutions[i+1];
                html += buildTreeHtml(nextNum, nextLvlReq);
            }
            html += \`</div>\`;
        }

        html += \`</div>\`;
        return html;
    }

    let resultHtml = \`<div style="display: flex; justify-content: center; margin-top: 10px; overflow-x: auto;">\`;
    resultHtml += buildTreeHtml(rootNum);
    resultHtml += \`</div>\`;
    return resultHtml;
}

window.formatType = formatType;
window.calculateEffectiveness = calculateEffectiveness;
window.buildMovesetHtml = buildMovesetHtml;
window.buildEvolutionLineHtml = buildEvolutionLineHtml;

function showDexEntry`);

// 2. Remove internal formatType
content = content.replace(/function formatType[\s\S]*?border: 1px solid black;">\$\{type\}<\/span>\`;\n    \}/, '');

// 3. Update BST formatting
content = content.replace(
    /BST: \$\{bst\} \(HP:\$\{pokemon\.baseStats\.hp\} A:\$\{pokemon\.baseStats\.atk\} D:\$\{pokemon\.baseStats\.def\} SA:\$\{pokemon\.baseStats\.spAtk\} SD:\$\{pokemon\.baseStats\.spDef\} S:\$\{pokemon\.baseStats\.speed\}\)/,
    'BST: ${bst} (HP:${pokemon.baseStats.hp} | Speed:${pokemon.baseStats.speed} | Atk:${pokemon.baseStats.atk} SpAtk:${pokemon.baseStats.spAtk} | Def:${pokemon.baseStats.def} SpDef:${pokemon.baseStats.spDef})'
);

// 4. Update Effectiveness generation
content = content.replace(/const effectivenessList = {[\s\S]*?return result;/m, `const effectivenessList = calculateEffectiveness(pokemon.types, state.config.types);
    let effectivenessHtml = '';
    const multLabels = {4: '4x', 2: '2x', 0.5: '0.5x', 0.25: '0.25x', 0: '0x'};

    for (const [mult, label] of Object.entries(multLabels)) {
        if (effectivenessList[mult] && effectivenessList[mult].length > 0) {
            effectivenessHtml += \`<div style="margin-bottom: 5px;"><strong>\${label} Damage:</strong> \`;
            effectivenessHtml += effectivenessList[mult].map(t => formatType(t)).join(' ');
            effectivenessHtml += \`</div>\`;
        }
    }
    return effectivenessHtml;`);

// 5. Update Moveset generation
content = content.replace(/let movesHtml = \`<div style="display: flex; flex-wrap: wrap; justify-content: center;">\`;[\s\S]*?return movesHtml;/m, `return buildMovesetHtml(pokemon, state.config.moves);`);

fs.writeFileSync('src/ui/pokedex.js', content, 'utf8');
