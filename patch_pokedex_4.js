const fs = require('fs');

let content = fs.readFileSync('src/ui/pokedex.js', 'utf8');

const regex = /export function showDexEntry\(id\) \{[\s\S]*?(?=export function buildEvolutionLineHtml)/;

const replacement = `export function showDexEntry(id) {
    const pData = state.config.pokemonData.find(p => p.id === id);
    if (!pData) return;

    const hasSeenShiny = state.stats.seenShiniesSpecies && state.stats.seenShiniesSpecies[pData.name];
    const buttonStyle = hasSeenShiny ? "display: inline-block;" : "display: none;";

    const speciesHtml = getSpeciesDataHtml(pData, state);
    const evoTreeHtml = buildEvolutionLineHtml(pData, state);

    const html = \`
        <div style="text-align:center; max-height: 80vh; overflow-y: auto; padding: 0 10px;">
            <h2>#\${pData.id} \${pData.name}</h2>
            <img id="dex-sprite" src="Assets/Pokemon Sprites/\${pData.id}.png" style="width: 100px; height: 100px;">
            <div style="margin-bottom: 10px;">
                <button style="\${buttonStyle}" onclick="document.getElementById('dex-sprite').src = 'Assets/Pokemon Sprites/\${pData.id}_shiny.png'">Shiny</button>
                <button style="\${buttonStyle}" onclick="document.getElementById('dex-sprite').src = 'Assets/Pokemon Sprites/\${pData.id}.png'">Normal</button>
            </div>

            <p><b>Type:</b> \${pData.types.map(t => formatType(t)).join(' ')}</p>

            \${speciesHtml}
            \${evoTreeHtml}

            <br>
            <button onclick="window.showPokedex()">Back to Pokedex</button>
        </div>
    \`;

    showModal("", html);
}

`;

content = content.replace(regex, replacement);
fs.writeFileSync('src/ui/pokedex.js', content);
