const fs = require('fs');
let battleJs = fs.readFileSync('src/ui/battle.js', 'utf8');

battleJs = battleJs.replace(/                clearSpriteAnimation\(elEnemySprite, 'enemy'\);\n            \}\n                clearSpriteAnimation\(elEnemySprite, 'enemy'\);/g, "                clearSpriteAnimation(elEnemySprite, 'enemy');\n            }");

fs.writeFileSync('src/ui/battle.js', battleJs);
console.log('Fixed searching clear animation duplicate!');
