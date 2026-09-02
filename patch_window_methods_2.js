const fs = require('fs');
let uiJs = fs.readFileSync('src/ui.js', 'utf8');

uiJs = uiJs.replace(
    "import { updateBattleArena, showDamage, playAttackAnimation, playAttackedAnimation, shootProjectile } from './ui/battle.js';",
    "import { updateBattleArena, showDamage, playAttackAnimation, playAttackedAnimation, shootProjectile, playEnemyDefeatAnimation, playPokeballAnimation } from './ui/battle.js';"
);

uiJs = uiJs.replace(
    "window.shootProjectile = shootProjectile;",
    "window.shootProjectile = shootProjectile;\nwindow.playEnemyDefeatAnimation = playEnemyDefeatAnimation;\nwindow.playPokeballAnimation = playPokeballAnimation;"
);

fs.writeFileSync('src/ui.js', uiJs);
console.log('Window methods patched again!');
