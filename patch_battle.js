const fs = require('fs');
const filepath = 'src/ui/battle.js';
let content = fs.readFileSync(filepath, 'utf8');

const search = `export function triggerDefeatAnimation(activeEncounter, ballResult, captureCallback) {
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
         }, 3000);
    }

    // Also wipe out enemy HP container and stats
    const hpContainerEnemy = document.getElementById('enemy-battle-hp-container');
    if (hpContainerEnemy) {
        hpContainerEnemy.style.opacity = '0';
        setTimeout(() => {
            if (hpContainerEnemy) hpContainerEnemy.style.opacity = '1';
        }, 3000);
    }

    // 1. Create Pokeball if used
    let ball = null;
    if (ballResult && ballResult.used && ballResult.ballName) {
        ball = document.createElement('img');
        ball.src = \`Assets/Items/Balls/\${ballResult.ballName}.png\`;
        ball.style.position = 'absolute';
        ball.style.left = '35%';
        ball.style.top = \`50%\`;
        ball.style.bottom = 'auto'; // Reset bottom
        ball.style.transform = 'translate(-50%, -50%)';
        ball.style.width = '25%';
        ball.style.height = '25%';
        ball.style.objectFit = 'contain';
        ball.style.zIndex = '51';
        arena.appendChild(ball);
    }

    // Force reflow
    if (ball) void ball.offsetWidth;

    // Timeline Animations
    if (ball) {
        ball.style.transition = 'left 3s linear';
        ball.style.left = '15%';

        // Add shake animation manually using setInterval since we need to slide too
        let shakeCount = 0;
        let shakeInterval = setInterval(() => {
            shakeCount++;
            let rotation = (shakeCount % 2 === 0) ? 15 : -15;
            if (shakeCount % 10 === 0) rotation = 0; // brief pause
            ball.style.transform = \`translate(-50%, -50%) rotate(\${rotation}deg)\`;
        }, 150);

        setTimeout(() => {
            clearInterval(shakeInterval);
            ball.style.transform = 'translate(-50%, -50%) rotate(0deg)';

            // 3s mark: decide outcome
            if (ballResult.caught) {
                ball.src = \`Assets/Items/Balls/\${ballResult.ballName}Y.png\`;
            } else {
                ball.src = \`Assets/Items/Balls/\${ballResult.ballName}N.png\`;
            }

            // Execute capture logic
            captureCallback();

            // Slide off screen for the next 1.5s
            ball.style.transition = 'left 1.5s linear';
            ball.style.left = '-10%';

            setTimeout(() => {
                if (ball.parentElement) ball.parentElement.removeChild(ball);
            }, 1500);

        }, 3000);
    } else {
        // No ball used, just wait 3s before triggering captureCallback
        setTimeout(() => {
            captureCallback();
        }, 3000);
    }
}`;

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
        // The user said "-$ where $ is 0.5 * pokeball.png width". The pokeball is normally 25vw of arena width, wait, it's 25% of combat arena or 25vw.
        // Actually earlier the code was \`ball.style.width = '25%'\`. But '25%' of max-content (the ghostContainer) would be small.
        // We'll set the ball size relative to viewport width (vw) since that is typically how large the arena is. Wait, earlier code was:
        // ball.style.width = '25%'; inside #combat-arena. Let's make it 15vw which is standard for battle items, or check what '25%' of combat arena is.
        ball.style.width = '15vw'; // Healthbars are 15vw, 15-20vw is reasonable for the ball. Let's keep it decently sized. Wait, standard frame is 96px width, 25% of combat arena is big. The old code had \`ball.style.width = '25%'\` of arena. Let's make it 25vw.
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
    ghostContainer.style.left = '-12.5%';

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
}`;

content = content.replace(search, replace);
fs.writeFileSync(filepath, content);
