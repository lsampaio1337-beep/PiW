const fs = require('fs');

let battleJs = fs.readFileSync('src/ui/battle.js', 'utf8');
battleJs = battleJs.replace(
    /updateSpriteAnimation\(elEnemySprite, enemy, 'enemy'\);/,
    `elEnemySprite.classList.add('anim-slide-in');\n            setTimeout(() => { elEnemySprite.classList.remove('anim-slide-in'); }, 2000);\n            updateSpriteAnimation(elEnemySprite, enemy, 'enemy');`
);
fs.writeFileSync('src/ui/battle.js', battleJs);
console.log('Entrance patched!');
