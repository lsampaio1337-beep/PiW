const fs = require('fs');
let battleJs = fs.readFileSync('src/ui/battle.js', 'utf8');

const oldDefeatAndCapture = `export function playEnemyDefeatAnimation() {
    const el = document.getElementById('enemy-sprite');
    if (el) {
        el.classList.add('anim-fade-out');
    }
}

export function playPokeballAnimation(ballName, success, onComplete) {
    const arena = document.getElementById('combat-arena');
    const el = document.getElementById('enemy-sprite');
    if (!arena || !el) {
        if(onComplete) onComplete();
        return;
    }

    const rect = el.getBoundingClientRect();
    const parentRect = arena.getBoundingClientRect();

    const pokeball = document.createElement('img');
    pokeball.src = 'Assets/Items/Balls/' + ballName + '.png';
    pokeball.style.position = 'absolute';
    pokeball.style.width = '40px';
    pokeball.style.height = '40px';
    pokeball.style.left = (rect.left - parentRect.left + rect.width / 2) + 'px';
    pokeball.style.top = (rect.top - parentRect.top + rect.height / 2) + 'px';
    pokeball.style.transform = 'translate(-50%, -50%)';
    pokeball.style.zIndex = '100';

    // Keyframe for shake
    if (!document.getElementById('shake-style')) {
        const style = document.createElement('style');
        style.id = 'shake-style';
        style.innerHTML = \`
            @keyframes ball-shake {
                0% { transform: translate(-50%, -50%) rotate(0deg); }
                20% { transform: translate(-50%, -50%) rotate(-15deg); }
                40% { transform: translate(-50%, -50%) rotate(15deg); }
                60% { transform: translate(-50%, -50%) rotate(-15deg); }
                80% { transform: translate(-50%, -50%) rotate(15deg); }
                100% { transform: translate(-50%, -50%) rotate(0deg); }
            }
            .anim-ball-shake {
                animation: ball-shake 0.5s ease-in-out infinite;
            }
        \`;
        document.head.appendChild(style);
    }

    arena.appendChild(pokeball);
    pokeball.classList.add('anim-ball-shake');

    // Shake for 3 seconds
    setTimeout(() => {
        pokeball.classList.remove('anim-ball-shake');
        pokeball.src = 'Assets/Items/Balls/' + ballName + (success ? 'Y' : 'N') + '.png';

        // Show result for 2 seconds
        setTimeout(() => {
            if (pokeball.parentElement) pokeball.parentElement.removeChild(pokeball);
            if(onComplete) onComplete();
        }, 2000);

    }, 3000);
}`;

const newDefeatAndCapture = `export function playEnemyDefeatAnimation(ballName, success) {
    const arena = document.getElementById('combat-arena');
    const enemySide = document.getElementById('enemy-side');
    if (!arena || !enemySide) return;

    // Clone the entire enemy container to act as the "corpse"
    const corpse = enemySide.cloneNode(true);
    corpse.id = 'enemy-corpse-' + Date.now();
    corpse.style.position = 'absolute';
    corpse.style.right = '40%';
    corpse.style.top = '20px';
    corpse.style.zIndex = '2'; // slightly behind active sprite

    // Reset/hide the real enemy side immediately for the next encounter
    enemySide.style.display = 'none';

    // Start fading out the corpse image (2s fade out)
    const corpseImg = corpse.querySelector('img');
    if (corpseImg) {
        corpseImg.classList.add('anim-fade-corpse');
    }

    // Attach pokeball to the corpse if applicable
    if (ballName) {
        const pokeball = document.createElement('img');
        pokeball.src = 'Assets/Items/Balls/' + ballName + '.png';
        pokeball.style.position = 'absolute';
        pokeball.style.width = '40px';
        pokeball.style.height = '40px';
        pokeball.style.left = '50%';
        pokeball.style.top = '50%';
        pokeball.style.transform = 'translate(-50%, -50%)';
        pokeball.style.zIndex = '100';

        if (!document.getElementById('shake-style')) {
            const style = document.createElement('style');
            style.id = 'shake-style';
            style.innerHTML = \`
                @keyframes ball-shake {
                    0% { transform: translate(-50%, -50%) rotate(0deg); }
                    20% { transform: translate(-50%, -50%) rotate(-15deg); }
                    40% { transform: translate(-50%, -50%) rotate(15deg); }
                    60% { transform: translate(-50%, -50%) rotate(-15deg); }
                    80% { transform: translate(-50%, -50%) rotate(15deg); }
                    100% { transform: translate(-50%, -50%) rotate(0deg); }
                }
                .anim-ball-shake { animation: ball-shake 0.5s ease-in-out infinite; }
            \`;
            document.head.appendChild(style);
        }

        pokeball.classList.add('anim-ball-shake');

        const wrapper = corpse.querySelector('#enemy-sprite-wrapper') || corpse;
        wrapper.appendChild(pokeball);

        setTimeout(() => {
            pokeball.classList.remove('anim-ball-shake');
            pokeball.src = 'Assets/Items/Balls/' + ballName + (success ? 'Y' : 'N') + '.png';
        }, 3000);
    }

    arena.appendChild(corpse);

    // Apply the 5s slide out to the left for the entire corpse container
    corpse.classList.add('anim-slide-out-corpse');

    // Clean up corpse after 5s
    setTimeout(() => {
        if (corpse.parentElement) corpse.parentElement.removeChild(corpse);
    }, 5000);
}

export function playPokeballAnimation(ballName, success, onComplete) {
    // Legacy mapping in case it's still called directly.
    // The visual logic has been moved to playEnemyDefeatAnimation.
    if(onComplete) onComplete();
}`;

battleJs = battleJs.replace(oldDefeatAndCapture, newDefeatAndCapture);

fs.writeFileSync('src/ui/battle.js', battleJs);
console.log('Patched corpse creation logic');
