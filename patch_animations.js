const fs = require('fs');

let battleJs = fs.readFileSync('src/ui/battle.js', 'utf8');

const updateArenaFn = battleJs.match(/export function updateBattleArena\(\) \{[\s\S]*?\n\}\n/)[0];

const newUpdateArenaFn = updateArenaFn.replace(
    /(const elEnemySprite = document.getElementById\('enemy-sprite'\);\s*if \(elEnemySprite\) \{[\s\S]*?elEnemySprite.style.display = 'block';\s*\})/m,
    `$1\n            updateSpriteAnimation(elEnemySprite, enemy, 'enemy');`
).replace(
    /(const elPlayerSprite = document.getElementById\('player-sprite'\);\s*if \(elPlayerSprite\) \{[\s\S]*?elPlayerSprite.style.display = 'block';\s*\})/m,
    `$1\n                    updateSpriteAnimation(elPlayerSprite, leader, 'player');`
).replace(
    /(const elEnemySprite = document.getElementById\('enemy-sprite'\);\s*if \(elEnemySprite\) \{[\s\S]*?elEnemySprite.src = "data:image\/gif;base64,R0lGODlhAQABAIAAAAAAAP\/\/\/yH5BAEAAAAALAAAAAABAAEAAAIBRAA7";\s*elEnemySprite.style.display = 'block';\s*\})/m,
    `$1\n                clearSpriteAnimation(elEnemySprite, 'enemy');`
).replace(
    /(const elPlayerSprite = document.getElementById\('player-sprite'\);\s*if \(elPlayerSprite\) \{[\s\S]*?elPlayerSprite.src = [^;]*;\s*elPlayerSprite.style.display = 'block';\s*\})/m,
    `$1\n                    updateSpriteAnimation(elPlayerSprite, leader, 'player');`
);

battleJs = battleJs.replace(updateArenaFn, newUpdateArenaFn);

const utilsHtml = `
function updateSpriteAnimation(spriteEl, pokemon, side) {
    if (!spriteEl) return;

    // Clear existing idle classes
    spriteEl.classList.remove('anim-idle-walk', 'anim-idle-walk-enemy', 'anim-idle-fly', 'anim-idle-fly-enemy', 'anim-idle-swim', 'anim-idle-swim-enemy');

    const types = pokemon.types || [];
    let animClass = side === 'player' ? 'anim-idle-walk' : 'anim-idle-walk-enemy';

    // Determine animation based on priority: Fly+Water -> Fly, Fly -> Fly, Water -> Swim, Else -> Walk
    if (types.includes('Flying')) {
        animClass = side === 'player' ? 'anim-idle-fly' : 'anim-idle-fly-enemy';
    } else if (types.includes('Water')) {
        animClass = side === 'player' ? 'anim-idle-swim' : 'anim-idle-swim-enemy';
    }

    // Don't override attack or entrance classes if they are active, just add it to classList
    spriteEl.classList.add(animClass);

    // Handle fake water display
    const fakeWaterEl = document.getElementById(side + '-fake-water');
    if (fakeWaterEl) {
        if (animClass.includes('swim')) {
            fakeWaterEl.style.display = 'block';
        } else {
            fakeWaterEl.style.display = 'none';
        }
    }
}

function clearSpriteAnimation(spriteEl, side) {
    if (!spriteEl) return;
    spriteEl.classList.remove('anim-idle-walk', 'anim-idle-walk-enemy', 'anim-idle-fly', 'anim-idle-fly-enemy', 'anim-idle-swim', 'anim-idle-swim-enemy');

    const fakeWaterEl = document.getElementById(side + '-fake-water');
    if (fakeWaterEl) fakeWaterEl.style.display = 'none';
}
`;

battleJs += '\n' + utilsHtml;

fs.writeFileSync('src/ui/battle.js', battleJs);
console.log('Done!');
