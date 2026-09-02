const fs = require('fs');

let battleJs = fs.readFileSync('src/ui/battle.js', 'utf8');

const updateArenaFn = battleJs.match(/export function updateBattleArena\(\) \{[\s\S]*?\n\}\n/)[0];

const newUpdateArenaFn = updateArenaFn.replace(
    /const elEnemySprite = document.getElementById\('enemy-sprite'\);\n\s*if \(elEnemySprite\) \{\n\s*elEnemySprite.src = "data:image\/gif;base64,R0lGODlhAQABAIAAAAAAAP\/\/\/yH5BAEAAAAALAAAAAABAAEAAAIBRAA7";\n\s*elEnemySprite.style.display = 'block';\n\s*\}/g,
    `const elEnemySprite = document.getElementById('enemy-sprite');
            if (elEnemySprite) {
                elEnemySprite.src = "data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7";
                elEnemySprite.style.display = 'block';
                clearSpriteAnimation(elEnemySprite, 'enemy');
            }`
);

battleJs = battleJs.replace(updateArenaFn, newUpdateArenaFn);
fs.writeFileSync('src/ui/battle.js', battleJs);
console.log('Fixed searching clear animation!');
