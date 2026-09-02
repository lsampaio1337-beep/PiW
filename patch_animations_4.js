const fs = require('fs');
let battleJs = fs.readFileSync('src/ui/battle.js', 'utf8');

const playEnemyDefeatAnim = `
export function playEnemyDefeatAnimation() {
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
}
`;

battleJs += '\n' + playEnemyDefeatAnim;

fs.writeFileSync('src/ui/battle.js', battleJs);
console.log('Added defeat and capture animations!');
