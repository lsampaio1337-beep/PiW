const fs = require('fs');
let code = fs.readFileSync('src/ui/mainControl.js', 'utf8');

// Add defeatPaldeaChampion rendering
const patch1 = `
    if (req.defeatGalarChampion) {
        let beaten = state.stats.defeatedBosses && state.stats.defeatedBosses["Galar Champion"];
        if (!beaten) isMet = false;
        textParts.push(\`Win Galar Pokémon League\${getStatusHtml(beaten)}\`);
    }
    if (req.defeatPaldeaChampion) {
        let beaten = state.stats.defeatedBosses && state.stats.defeatedBosses["Paldea Champion"];
        if (!beaten) isMet = false;
        textParts.push(\`Win Paldea Pokémon League\${getStatusHtml(beaten)}\`);
    }
`;

code = code.replace(/if \(req\.defeatGalarChampion\) \{[\s\S]*?textParts\.push\(\`Win Galar Pokémon League\$\\{getStatusHtml\(beaten\)\\}\`\);\n    \}/, patch1.trim());


const patch2 = `
        if (req.defeatGalarChampion) {
            state.stats.defeatedBosses["Galar Champion"] = true;
        }
        if (req.defeatPaldeaChampion) {
            state.stats.defeatedBosses["Paldea Champion"] = true;
        }
`;

code = code.replace(/if \(req\.defeatGalarChampion\) \{\n            state\.stats\.defeatedBosses\["Galar Champion"\] = true;\n        \}/, patch2.trim());

fs.writeFileSync('src/ui/mainControl.js', code);
console.log('patched mainControl.js');
