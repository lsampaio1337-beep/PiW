const fs = require('fs');

let battleJs = fs.readFileSync('src/ui/battle.js', 'utf8');

// The CSS anim-slide-in animates "right", but it was added to "elEnemySprite" which is just the <img> tag!
// The position: absolute; right: ... is set on #enemy-side (the wrapper).
// Let's modify the JS to apply anim-slide-in to the parent #enemy-side wrapper!

battleJs = battleJs.replace(
    /if \(!elEnemySprite.dataset.spawnedId \|\| elEnemySprite.dataset.spawnedId !== enemy.id.toString\(\)\) \{\n                elEnemySprite.dataset.spawnedId = enemy.id.toString\(\);\n                elEnemySprite.classList.add\('anim-slide-in'\);\n                setTimeout\(\(\) => \{ elEnemySprite.classList.remove\('anim-slide-in'\); \}, 2000\);\n            \}/,
    `if (!elEnemySprite.dataset.spawnedId || elEnemySprite.dataset.spawnedId !== enemy.id.toString()) {
                elEnemySprite.dataset.spawnedId = enemy.id.toString();
                const enemySideEl = document.getElementById('enemy-side');
                if (enemySideEl) {
                    enemySideEl.classList.remove('anim-slide-left', 'anim-fade-out'); // remove potential old corpse classes
                    enemySideEl.classList.add('anim-slide-in');
                    setTimeout(() => { enemySideEl.classList.remove('anim-slide-in'); }, 2000);
                }
            }`
);

fs.writeFileSync('src/ui/battle.js', battleJs);
console.log('Patched entrance target element!');
