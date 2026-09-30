const fs = require('fs');
const filepath = 'src/ui/battle.js';
let content = fs.readFileSync(filepath, 'utf8');

const sIdx = content.indexOf('export function triggerDefeatAnimation');
const eIdx = content.indexOf('export function showDamage');
const before = content.slice(0, sIdx);
const after = content.slice(eIdx);

const replace = `export function triggerDefeatAnimation(activeEncounter, ballResult, captureCallback) {
    const arena = document.getElementById('combat-arena');
    if (!arena) {
        captureCallback();
        return;
    }

    // Hide original enemy sprite container momentarily until next slide in
    const elEnemySide = document.getElementById('enemy-side');
    if (elEnemySide) {
         elEnemySide.style.opacity = '0';
         setTimeout(() => {
             if (elEnemySide) elEnemySide.style.opacity = '1';
         }, 5000);
    }

    // Also wipe out enemy HP container and stats
    const hpContainerEnemy = document.getElementById('enemy-battle-hp-container');
    if (hpContainerEnemy) {
        hpContainerEnemy.style.opacity = '0';
        setTimeout(() => {
            if (hpContainerEnemy) hpContainerEnemy.style.opacity = '1';
        }, 5000);
    }

    // Create a container for the ghost and ball to move together
    const ghostContainer = document.createElement('div');
    ghostContainer.style.position = 'absolute';
    ghostContainer.style.left = '35%';
    ghostContainer.style.bottom = '20%';
    ghostContainer.style.width = 'max-content';
    ghostContainer.style.height = 'max-content';
    ghostContainer.style.transform = 'none'; // We slide using left
    ghostContainer.style.zIndex = '50';
    ghostContainer.style.display = 'flex';
    ghostContainer.style.flexDirection = 'column';
    ghostContainer.style.justifyContent = 'flex-end';

    // Check if flying for proper snap
    const isFlying = activeEncounter.types && (activeEncounter.types.includes('Flying') || activeEncounter.types.includes('Wind'));
    if (isFlying) {
        ghostContainer.style.justifyContent = 'flex-start';
    }

    // Ghost sprite representing defeated wild pokemon
    const ghost = document.createElement('img');
    let enemyId = activeEncounter.isDisguisedDitto ? 132 : activeEncounter.id;
    let spriteSuffix = activeEncounter.qualityName === 'Shiny' ? '_shiny_Clean.png' : '_Clean.png';
    ghost.src = \`Assets/Pokemon Sprites/Clean/\${enemyId}\${spriteSuffix}\`;
    ghost.style.opacity = '1'; // "full opaque" as requested

    // Normally enemy-sprite-wrapper controls this, let's just make it max-height: 25vh like battle arena
    ghost.style.maxHeight = '25vh';
    ghost.style.objectFit = 'contain';

    ghostContainer.appendChild(ghost);

    // Determine ball to show
    let ballNameToShow = null;
    let isCaptureAttempt = false;

    if (ballResult && ballResult.used && ballResult.ballName) {
        ballNameToShow = ballResult.ballName;
        isCaptureAttempt = true;
    } else if (state.settings.activeBallTier >= 0) {
        const balls = state.config.balance.items.pokeballs;
        if (balls[state.settings.activeBallTier]) {
            ballNameToShow = balls[state.settings.activeBallTier].name;
        }
    }

    let ball = null;
    if (ballNameToShow) {
        ball = document.createElement('img');
        ball.src = \`Assets/Items/Balls/\${ballNameToShow}.png\`;
        ball.style.position = 'absolute';
        ball.style.left = '50%';
        ball.style.top = '50%';
        ball.style.transform = 'translate(-50%, -50%)';
        // Old ball code in triggerDefeatAnimation used '25%' of combat arena.
        // If we set 25% of ghostContainer width, it might be small.
        // We'll calculate a fixed size based on vw. Wait, original was 25% of combat arena width, let's use 25% relative to parent? No, position is absolute inside max-content container, so % of what? It will be % of ghostContainer, which might be tiny.
        // We will make it '15vw' to ensure a reasonable size compared to arena. Wait, 15vw might be smaller than 25% of arena. Arena is often full width, so 25vw is 25%.
        ball.style.width = '25vw';
        ball.style.height = '25vw';
        ball.style.objectFit = 'contain';
        ball.style.zIndex = '51';
        ghostContainer.appendChild(ball);
    }

    arena.appendChild(ghostContainer);

    // Force reflow
    void ghostContainer.offsetWidth;

    // Slide animation (5 seconds)
    ghostContainer.style.transition = 'left 5s linear';
    // left: -$ where $ is 0.5 * pokeball width. 0.5 * 25vw = 12.5vw.
    ghostContainer.style.left = '-12.5vw';

    // Call callback at 3 seconds, update ball graphic if it was a capture attempt
    setTimeout(() => {
        captureCallback();

        if (ball && isCaptureAttempt) {
            if (ballResult.caught) {
                ball.src = \`Assets/Items/Balls/\${ballNameToShow}Y.png\`;
            } else {
                ball.src = \`Assets/Items/Balls/\${ballNameToShow}N.png\`;
            }
        }
    }, 3000);

    // Final cleanup after 5 seconds
    setTimeout(() => {
        if (ghostContainer.parentElement) {
            ghostContainer.parentElement.removeChild(ghostContainer);
        }
    }, 5000);
}

`;

fs.writeFileSync(filepath, before + replace + after);
