const fs = require('fs');

let battleJs = fs.readFileSync('src/ui/battle.js', 'utf8');

// Stop idle animation when entering combat
const projectileUpdate = `export function playAttackAnimation(attackerSide) {`;
const newProjectileUpdate = `export function pauseIdleAnimation() {
    ['player-sprite', 'enemy-sprite'].forEach(id => {
        const el = document.getElementById(id);
        if (el) {
            el.style.animationPlayState = 'paused';
        }
    });
}

export function resumeIdleAnimation() {
    ['player-sprite', 'enemy-sprite'].forEach(id => {
        const el = document.getElementById(id);
        if (el) {
            el.style.animationPlayState = 'running';
        }
    });
}

export function playAttackAnimation(attackerSide) {`;

battleJs = battleJs.replace(projectileUpdate, newProjectileUpdate);
fs.writeFileSync('src/ui/battle.js', battleJs);

let uiJs = fs.readFileSync('src/ui.js', 'utf8');
uiJs = uiJs.replace(
    "import { updateBattleArena, showDamage, playAttackAnimation, playAttackedAnimation, shootProjectile, playEnemyDefeatAnimation, playPokeballAnimation } from './ui/battle.js';",
    "import { updateBattleArena, showDamage, playAttackAnimation, playAttackedAnimation, shootProjectile, playEnemyDefeatAnimation, playPokeballAnimation, pauseIdleAnimation, resumeIdleAnimation } from './ui/battle.js';"
);
uiJs += "\nwindow.pauseIdleAnimation = pauseIdleAnimation;\nwindow.resumeIdleAnimation = resumeIdleAnimation;";
fs.writeFileSync('src/ui.js', uiJs);

let sysJs = fs.readFileSync('src/battleSystem.js', 'utf8');
sysJs = sysJs.replace(
    /        \/\/ Wait 2s for slide in animation before starting combat turns\n        this.combatLoop = setTimeout\(\(\) => \{\n            this.scheduleTurn\(\);\n        \}, 2000\);/g,
    `        // Wait 2s for slide in animation before starting combat turns
        if (window.resumeIdleAnimation) window.resumeIdleAnimation();
        this.combatLoop = setTimeout(() => {
            if (window.pauseIdleAnimation) window.pauseIdleAnimation();
            this.scheduleTurn();
        }, 2000);`
);

sysJs = sysJs.replace(
    /        if \(typeof window.playEnemyDefeatAnimation === 'function'\) \{\n            window.playEnemyDefeatAnimation\(\);\n        \}/,
    `        if (typeof window.playEnemyDefeatAnimation === 'function') {
            window.playEnemyDefeatAnimation();
        }
        if (window.pauseIdleAnimation) window.pauseIdleAnimation(); // ensure paused during fade/capture sequence`
);
fs.writeFileSync('src/battleSystem.js', sysJs);

console.log('Pause idle patched!');
