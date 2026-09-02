const fs = require('fs');

let battleJs = fs.readFileSync('src/ui/battle.js', 'utf8');

// Ensure enemySideEl display is reset to block when a new encounter spawns
const oldSpawnReset = `            if (!elEnemySprite.dataset.spawnedId || elEnemySprite.dataset.spawnedId !== enemy.id.toString()) {
                elEnemySprite.dataset.spawnedId = enemy.id.toString();
                const enemySideEl = document.getElementById('enemy-side');
                if (enemySideEl) {
                    enemySideEl.classList.remove('anim-slide-left', 'anim-fade-out'); // remove potential old corpse classes`;

const newSpawnReset = `            if (!elEnemySprite.dataset.spawnedId || elEnemySprite.dataset.spawnedId !== enemy.id.toString()) {
                elEnemySprite.dataset.spawnedId = enemy.id.toString();
                const enemySideEl = document.getElementById('enemy-side');
                if (enemySideEl) {
                    enemySideEl.style.display = 'flex';
                    enemySideEl.classList.remove('anim-slide-left', 'anim-fade-out'); // remove potential old corpse classes`;

battleJs = battleJs.replace(oldSpawnReset, newSpawnReset);

// Also reset it when searching
const oldSearchReset = `            const elEnemySprite = document.getElementById('enemy-sprite');
            if (elEnemySprite) {
                elEnemySprite.src = "data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7";
                elEnemySprite.style.display = 'block';
                clearSpriteAnimation(elEnemySprite, 'enemy');
            }`;

const newSearchReset = `            const elEnemySide = document.getElementById('enemy-side');
            if (elEnemySide) elEnemySide.style.display = 'flex';

            const elEnemySprite = document.getElementById('enemy-sprite');
            if (elEnemySprite) {
                elEnemySprite.src = "data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7";
                elEnemySprite.style.display = 'block';
                clearSpriteAnimation(elEnemySprite, 'enemy');
            }`;

battleJs = battleJs.replace(oldSearchReset, newSearchReset);

fs.writeFileSync('src/ui/battle.js', battleJs);
console.log('Patched visibility reset for main element');
