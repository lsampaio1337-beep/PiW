const fs = require('fs');

let battleJs = fs.readFileSync('src/ui/battle.js', 'utf8');
battleJs = battleJs.replace(
    /updateSpriteAnimation\(elEnemySprite, enemy, 'enemy'\);/g,
    `elEnemySprite.classList.remove('anim-fade-out');\n            updateSpriteAnimation(elEnemySprite, enemy, 'enemy');`
);
fs.writeFileSync('src/ui/battle.js', battleJs);
console.log('Fade out reset patched!');
