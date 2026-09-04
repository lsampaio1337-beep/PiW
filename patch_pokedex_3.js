const fs = require('fs');

let content = fs.readFileSync('src/ui/pokedex.js', 'utf8');

// Insert buildEvolutionLineHtml before getSpeciesDataHtml
const buildTreeStr = `
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
        let onClick = hasEncountered ? \`onclick="window.showDexEntry(\${pd.id})"\` : "";
        let displayName = hasEncountered ? pd.name : "???";

        let html = \`<div style="display: flex; flex-direction: column; align-items: center; margin: 5px;">
            <img src="Assets/Pokemon Sprites/\${pd.id}.png" style="width: 50px; height: 50px; filter: \${filter}; cursor: \${cursor};" \${onClick} title="\${displayName}">
            <span style="font-size: 10px; cursor: \${cursor};" \${onClick}>\${displayName}</span>
        </div>\`;

        if (pd.evolutions && pd.evolutions.length > 0) {
            html = \`<div style="display: flex; align-items: center;">\` + html;

            let evosHtml = \`<div style="display: flex; flex-direction: column; justify-content: center; margin-left: 10px;">\`;
            for (const evo of pd.evolutions) {
                evosHtml += \`<div style="display: flex; align-items: center; margin: 5px 0;">
                    <div style="font-size: 10px; color: #aaa; margin-right: 5px;">Lv.\${evo.level} ➔</div>
                    \${buildTree(evo.to)}
                </div>\`;
            }
            evosHtml += \`</div>\`;
            html += evosHtml + \`</div>\`;
        }

        return html;
    }

    let treeHtml = buildTree(baseId);
    return \`<div style="text-align: left; margin: 15px 0; font-size: 14px; background: rgba(0,0,0,0.5); padding: 10px; border-radius: 5px; overflow-x: auto;">
        <h4 style="margin: 0 0 10px 0;">Evolution Line</h4>
        <div style="display: flex; align-items: center; justify-content: center;">
            \${treeHtml}
        </div>
    </div>\`;
}
`;

content = content.replace('export function getSpeciesDataHtml', buildTreeStr + '\nexport function getSpeciesDataHtml');
fs.writeFileSync('src/ui/pokedex.js', content);
