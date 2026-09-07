const fs = require('fs');
let content = fs.readFileSync('src/ui/battle.js', 'utf8');

// I am missing `const elPlayerContainer = document.getElementById('player-sprite-container');` at line 306 before `if (elPlayerContainer && leader) {`
content = content.replace(
    /const elPlayerSprite = document.getElementById\('player-sprite'\);\n\s*if \(elPlayerSprite\) \{\n\s*elPlayerSprite\.src = `Assets\/Pokemon Sprites\/\$\{leader\.qualityName === 'Shiny' \? leader\.id \+ '_shiny' : leader\.id\}\.png`;\n\s*elPlayerSprite\.style\.display = 'block';\n\s*\}\n\s*if \(elPlayerContainer && leader\) \{/g,
    `const elPlayerSprite = document.getElementById('player-sprite');
                const elPlayerContainer = document.getElementById('player-sprite-container');
                if (elPlayerSprite) {
                    elPlayerSprite.src = \`Assets/Pokemon Sprites/\${leader.qualityName === 'Shiny' ? leader.id + '_shiny' : leader.id}.png\`;
                    elPlayerSprite.style.display = 'block';
                }
                if (elPlayerContainer && leader) {`
);

fs.writeFileSync('src/ui/battle.js', content, 'utf8');
