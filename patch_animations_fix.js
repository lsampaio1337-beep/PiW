const fs = require('fs');
let battleJs = fs.readFileSync('src/ui/battle.js', 'utf8');

battleJs = battleJs.replace(/                    updateSpriteAnimation\(elPlayerSprite, leader, 'player'\);\n                    updateSpriteAnimation\(elPlayerSprite, leader, 'player'\);/g, "                    updateSpriteAnimation(elPlayerSprite, leader, 'player');");

fs.writeFileSync('src/ui/battle.js', battleJs);
console.log('Fixed duplicates!');
