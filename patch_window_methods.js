const fs = require('fs');

let uiJs = fs.readFileSync('src/ui.js', 'utf8');

// import the new methods
uiJs = uiJs.replace(
    "import { updateBattleArena, showDamage } from './ui/battle.js';",
    "import { updateBattleArena, showDamage, playAttackAnimation, playAttackedAnimation, shootProjectile } from './ui/battle.js';"
);

// export to window
uiJs = uiJs.replace(
    "window.showDamage = showDamage;",
    "window.showDamage = showDamage;\nwindow.playAttackAnimation = playAttackAnimation;\nwindow.playAttackedAnimation = playAttackedAnimation;\nwindow.shootProjectile = shootProjectile;"
);

fs.writeFileSync('src/ui.js', uiJs);
console.log('Window methods patched!');
