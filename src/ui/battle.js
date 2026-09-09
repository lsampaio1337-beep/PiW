import { TYPE_COLORS } from '../ui.js';
import { state, globals } from '../state.js';

function applyWalkAnimations(pokemon, isEnemy) {
    const battleSystem = globals.battleSystem;
    const realPrefix = isEnemy ? 'enemy' : 'player';
    const animContainer = document.getElementById(realPrefix + '-anim-container');
    const bubbles = document.getElementById(realPrefix + '-water-bubbles');

    if (!animContainer) return;

    let walkClass = 'anim-walk-other';
    if (pokemon.types.includes('Water')) walkClass = 'anim-walk-water';
    else if (pokemon.types.includes('Flying') || pokemon.types.includes('Wind')) walkClass = 'anim-walk-flying';

    let shouldWalk = false;
    if (isEnemy) {
        shouldWalk = battleSystem.isSliding || battleSystem.isSearching;
    } else {
        shouldWalk = battleSystem.isPlayerSlidingIn || battleSystem.isPlayerPreSlidingIn || battleSystem.isSearching || battleSystem.isSliding;
    }

    if (shouldWalk) {
        animContainer.classList.remove('anim-walk-other', 'anim-walk-flying', 'anim-walk-water');
        animContainer.classList.add(walkClass);
        animContainer.dataset.stopping = 'false';
    } else if (animContainer.classList.contains(walkClass)) {
        if (animContainer.dataset.stopping !== 'true') {
            animContainer.dataset.stopping = 'true';
            const stopAnim = () => {
                if (animContainer.dataset.stopping === 'true') {
                    animContainer.classList.remove('anim-walk-other', 'anim-walk-flying', 'anim-walk-water');
                }
                animContainer.removeEventListener('animationiteration', stopAnim);
            };
            animContainer.addEventListener('animationiteration', stopAnim);
        }
    } else {
         animContainer.classList.remove('anim-walk-other', 'anim-walk-flying', 'anim-walk-water');
    }

    if (bubbles) {
         bubbles.style.display = pokemon.types.includes('Water') ? 'block' : 'none';
    }
}


export function updateBattleArena() {
    const battleSystem = globals.battleSystem;
    const inGym = battleSystem && battleSystem.gymState && battleSystem.gymState.isActive;
    const inGymCombat = inGym && battleSystem.gymState.inCombat;

    const combatArena = document.getElementById('combat-arena');
    if (combatArena) {
        if (inGymCombat) {
            const gym = battleSystem.gymState.gym;
            if (gym.name === "Indigo Plateau") {
                const trainerIndex = battleSystem.gymState.currentTrainerIndex;
                const trainerBGs = [
                    'BG-Elite4-1Lorelei.png',
                    'BG-Elite4-2Bruno.png',
                    'BG-Elite4-3Agatha.png',
                    'BG-Elite4-4Lance.png',
                    'BG-Elite4-5Champion.png'
                ];
                const bgImage = trainerBGs[trainerIndex] || 'BG.png';
                combatArena.style.backgroundImage = `url('./Assets/BG/${bgImage}')`;
            } else {
                const gymIndex = state.config.gyms.findIndex(g => g.name === gym.name);
                const gymBGs = [
                    'BG-Gym-1-Pewter-Rock.png',
                    'BG-Gym-2-Cerulean-Water.png',
                    'BG-Gym-3-Vermilion-Electric.png',
                    'BG-Gym-4-Celadon-Grass.png',
                    'BG-Gym-5-Fuchsia-Poison.png',
                    'BG-Gym-6-Saffron-Psychic.png',
                    'BG-Gym-7-Cinnabar-Fire.png',
                    'BG-Gym-8-Viridian-Ground.png'
                ];
                const bgImage = gymBGs[gymIndex] || 'BG.png';
                combatArena.style.backgroundImage = `url('./Assets/BG/${bgImage}')`;
            }
        } else if (state.currentRoute === 'Safari Zone') {
            combatArena.style.backgroundImage = `url('./Assets/BG/BG-SafariZone.png')`;
        } else if (state.currentRoute && state.currentRoute.startsWith('Casino')) {
             combatArena.style.backgroundImage = `url('./Assets/BG/BG-Cassino.jpg')`;
        } else {
            combatArena.style.backgroundImage = `url('./Assets/BG/BG.png')`;
        }
    }

    // Use standard combat arena for all battles
    if (battleSystem && battleSystem.activeEncounter) {
        const enemy = battleSystem.activeEncounter;

        // Enemy HP UI
            const hpContainerEnemy = document.getElementById('enemy-battle-hp-container');
            const hpBarEnemy = document.getElementById('enemy-battle-hp-bar');
            const hpTextEnemy = document.getElementById('enemy-battle-hp-text');
            const hpPctEnemy = document.getElementById('enemy-battle-hp-pct');

            if (hpContainerEnemy) hpContainerEnemy.style.display = 'flex';

            if (hpBarEnemy && hpTextEnemy && hpPctEnemy) {
                const pct = Math.min(100, (enemy.currentHp / enemy.maxHp) * 100);
                let color = '#3498db';
                if (pct <= 0) color = '#000000';
                else if (pct < 25) color = '#e74c3c';
                else if (pct < 50) color = '#e67e22';
                else if (pct < 75) color = '#f1c40f';
                else if (pct < 100) color = '#2ecc71';

                hpBarEnemy.style.width = `${pct}%`;
                hpBarEnemy.style.background = color;
                hpTextEnemy.innerText = `${Math.floor(enemy.currentHp)}/${enemy.maxHp}`;
                hpPctEnemy.innerText = `${Math.floor(pct)}%`;
            }

            const elEnemySprite = document.getElementById('enemy-sprite');
            const elEnemySide = document.getElementById('enemy-side');

            if (elEnemySprite && elEnemySide) {
                elEnemySprite.src = `Assets/Pokemon Sprites/${enemy.qualityName === 'Shiny' ? enemy.id + '_shiny' : enemy.id}.png`;
                elEnemySprite.style.display = 'block';
                applyWalkAnimations(enemy, true);

                let baseBottom = 15; // 100 - 85
                if (enemy.types.includes('Water')) baseBottom = 10; // 100 - 90
                if (enemy.types.includes('Flying') || enemy.types.includes('Wind')) baseBottom = 25; // 100 - 75

                elEnemySide.style.top = 'auto';
                elEnemySide.style.bottom = `${baseBottom}%`;

                if (battleSystem.isSliding) {
                    if (elEnemySide.dataset.sliding !== 'true') {
                        elEnemySide.dataset.sliding = 'true';
                        elEnemySide.style.transition = 'none';
                        elEnemySide.style.left = '100%';
                        if (hpContainerEnemy) {
                            hpContainerEnemy.style.transition = 'none';
                            hpContainerEnemy.style.left = '100%';
                        }
                        // Trigger reflow
                        void elEnemySide.offsetWidth;
                        requestAnimationFrame(() => {
                            requestAnimationFrame(() => {
                                elEnemySide.style.transition = `left ${battleSystem.slideDuration}ms linear`;
                                elEnemySide.style.left = '35%';
                                if (hpContainerEnemy) {
                                    hpContainerEnemy.style.transition = `left ${battleSystem.slideDuration}ms linear`;
                                    hpContainerEnemy.style.left = '35%';
                                }
                            });
                        });
                    }
                } else {
                    elEnemySide.dataset.sliding = 'false';
                    elEnemySide.style.transition = 'none';
                    elEnemySide.style.left = '35%';
                    if (hpContainerEnemy) {
                        hpContainerEnemy.style.transition = 'none';
                        hpContainerEnemy.style.left = '35%';
                    }
                }
            }

            const leader = state.party[0];
            const elPlayerSide = document.getElementById('player-side');
            if (leader && elPlayerSide) {

                let baseBottom = 15; // 100 - 85
                if (leader.types.includes('Water')) baseBottom = 10; // 100 - 90
                if (leader.types.includes('Flying') || leader.types.includes('Wind')) baseBottom = 25; // 100 - 75

                elPlayerSide.style.top = 'auto';
                elPlayerSide.style.bottom = `${baseBottom}%`;
                elPlayerSide.style.left = '20%';

                const hpContainerPlayer = document.getElementById('player-battle-hp-container');
                const hpBarPlayer = document.getElementById('player-battle-hp-bar');
                const hpTextPlayer = document.getElementById('player-battle-hp-text');
                const hpPctPlayer = document.getElementById('player-battle-hp-pct');

                if (hpContainerPlayer) hpContainerPlayer.style.display = 'flex';

                if (hpBarPlayer && hpTextPlayer && hpPctPlayer) {
                    const pct = Math.min(100, (leader.currentHp / leader.maxHp) * 100);
                    let color = '#3498db';
                    if (pct <= 0) color = '#000000';
                    else if (pct < 25) color = '#e74c3c';
                    else if (pct < 50) color = '#e67e22';
                    else if (pct < 75) color = '#f1c40f';
                    else if (pct < 100) color = '#2ecc71';

                    hpBarPlayer.style.width = `${pct}%`;
                    hpBarPlayer.style.background = color;
                    hpTextPlayer.innerText = `${Math.floor(leader.currentHp)}/${leader.maxHp}`;
                    hpPctPlayer.innerText = `${Math.floor(pct)}%`;
                }

                const elPlayerSprite = document.getElementById('player-sprite');
                if (elPlayerSprite) {
                    elPlayerSprite.src = `Assets/Pokemon Sprites/${leader.qualityName === 'Shiny' ? leader.id + '_shiny' : leader.id}.png`;
                    elPlayerSprite.style.display = 'block';
                    applyWalkAnimations(leader, false);

                    if (leader.currentHp <= 0) {
                        if (elPlayerSprite.parentElement.classList.contains('sprite-anim-container')) elPlayerSprite.parentElement.style.transition = 'opacity 2s linear'; else elPlayerSprite.style.transition = 'opacity 2s linear';
                        if (elPlayerSprite.parentElement.classList.contains('sprite-anim-container')) elPlayerSprite.parentElement.style.opacity = '0'; else elPlayerSprite.style.opacity = '0';
                    } else if (battleSystem && battleSystem.isPlayerSlidingIn) {
                        elPlayerSprite.style.transition = `left ${battleSystem.slideDuration}ms linear`;
                        elPlayerSprite.style.left = '25%';
                        if (elPlayerSprite.parentElement.classList.contains('sprite-anim-container')) elPlayerSprite.parentElement.style.transition = 'none';
                        if (elPlayerSprite.parentElement.classList.contains('sprite-anim-container')) elPlayerSprite.parentElement.style.opacity = '1';
                        elPlayerSprite.style.opacity = '1';
                    } else if (battleSystem && battleSystem.isFainting) {
                        // don't touch style while fading
                    } else if (battleSystem && battleSystem.isPlayerPreSlidingIn) {
                        elPlayerSprite.style.transition = 'none';
                        elPlayerSprite.style.left = '-30%';
                        if (elPlayerSprite.parentElement.classList.contains('sprite-anim-container')) elPlayerSprite.parentElement.style.transition = 'none';
                        if (elPlayerSprite.parentElement.classList.contains('sprite-anim-container')) elPlayerSprite.parentElement.style.opacity = '1';
                        elPlayerSprite.style.opacity = '1';
                    } else {
                        elPlayerSprite.style.transition = 'none';
                        elPlayerSprite.style.left = '25%';
                        if (elPlayerSprite.parentElement.classList.contains('sprite-anim-container')) elPlayerSprite.parentElement.style.transition = 'none';
                        if (elPlayerSprite.parentElement.classList.contains('sprite-anim-container')) elPlayerSprite.parentElement.style.opacity = '1';
                        elPlayerSprite.style.opacity = '1';
                    }
                }
            }
        } else if (battleSystem && battleSystem.isSearching) {

            const hpContainerEnemy = document.getElementById('enemy-battle-hp-container');
            if (hpContainerEnemy) hpContainerEnemy.style.display = 'none';

            const elEnemySprite = document.getElementById('enemy-sprite');
            const elEnemySide = document.getElementById('enemy-side');
            if (elEnemySprite && elEnemySide) {
                elEnemySprite.src = "data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7";
                elEnemySprite.style.display = 'block';
                elEnemySide.style.transition = 'none';
                elEnemySide.style.left = '35%'; // Matching active battle destination
                elEnemySide.style.top = 'auto';
                elEnemySide.style.bottom = '15%'; // default
                if (hpContainerEnemy) {
                    hpContainerEnemy.style.transition = 'none';
                    hpContainerEnemy.style.left = '35%';
                }
            }

            const leader = state.party[0];
            const elPlayerSide = document.getElementById('player-side');
            if (leader && elPlayerSide) {
                let baseBottom = 15; // 100 - 85
                if (leader.types.includes('Water')) baseBottom = 10; // 100 - 90
                if (leader.types.includes('Flying') || leader.types.includes('Wind')) baseBottom = 25; // 100 - 75

                elPlayerSide.style.top = 'auto';
                elPlayerSide.style.bottom = `${baseBottom}%`;
                elPlayerSide.style.left = '20%';

                const hpContainerPlayer = document.getElementById('player-battle-hp-container');
                const hpBarPlayer = document.getElementById('player-battle-hp-bar');
                const hpTextPlayer = document.getElementById('player-battle-hp-text');
                const hpPctPlayer = document.getElementById('player-battle-hp-pct');

                if (hpContainerPlayer) hpContainerPlayer.style.display = 'flex';

                if (hpBarPlayer && hpTextPlayer && hpPctPlayer) {
                    const pct = Math.min(100, (leader.currentHp / leader.maxHp) * 100);
                    let color = '#3498db';
                    if (pct <= 0) color = '#000000';
                    else if (pct < 25) color = '#e74c3c';
                    else if (pct < 50) color = '#e67e22';
                    else if (pct < 75) color = '#f1c40f';
                    else if (pct < 100) color = '#2ecc71';

                    hpBarPlayer.style.width = `${pct}%`;
                    hpBarPlayer.style.background = color;
                    hpTextPlayer.innerText = `${Math.floor(leader.currentHp)}/${leader.maxHp}`;
                    hpPctPlayer.innerText = `${Math.floor(pct)}%`;
                }

                const elPlayerSprite = document.getElementById('player-sprite');
                if (elPlayerSprite) {
                    elPlayerSprite.src = `Assets/Pokemon Sprites/${leader.qualityName === 'Shiny' ? leader.id + '_shiny' : leader.id}.png`;
                    elPlayerSprite.style.display = 'block';
                    applyWalkAnimations(leader, false);

                    if (leader.currentHp <= 0) {
                        if (elPlayerSprite.parentElement.classList.contains('sprite-anim-container')) elPlayerSprite.parentElement.style.transition = 'opacity 2s linear'; else elPlayerSprite.style.transition = 'opacity 2s linear';
                        if (elPlayerSprite.parentElement.classList.contains('sprite-anim-container')) elPlayerSprite.parentElement.style.opacity = '0'; else elPlayerSprite.style.opacity = '0';
                    } else if (battleSystem && battleSystem.isPlayerSlidingIn) {
                        elPlayerSprite.style.transition = `left ${battleSystem.slideDuration}ms linear`;
                        elPlayerSprite.style.left = '25%';
                        if (elPlayerSprite.parentElement.classList.contains('sprite-anim-container')) elPlayerSprite.parentElement.style.transition = 'none';
                        if (elPlayerSprite.parentElement.classList.contains('sprite-anim-container')) elPlayerSprite.parentElement.style.opacity = '1';
                        elPlayerSprite.style.opacity = '1';
                    } else if (battleSystem && battleSystem.isFainting) {
                        // don't touch style while fading
                    } else if (battleSystem && battleSystem.isPlayerPreSlidingIn) {
                        elPlayerSprite.style.transition = 'none';
                        elPlayerSprite.style.left = '-30%';
                        if (elPlayerSprite.parentElement.classList.contains('sprite-anim-container')) elPlayerSprite.parentElement.style.transition = 'none';
                        if (elPlayerSprite.parentElement.classList.contains('sprite-anim-container')) elPlayerSprite.parentElement.style.opacity = '1';
                        elPlayerSprite.style.opacity = '1';
                    } else {
                        elPlayerSprite.style.transition = 'none';
                        elPlayerSprite.style.left = '25%';
                        if (elPlayerSprite.parentElement.classList.contains('sprite-anim-container')) elPlayerSprite.parentElement.style.transition = 'none';
                        if (elPlayerSprite.parentElement.classList.contains('sprite-anim-container')) elPlayerSprite.parentElement.style.opacity = '1';
                        elPlayerSprite.style.opacity = '1';
                    }
                }
            } else {
                const elPlayerSprite = document.getElementById('player-sprite');
                if (elPlayerSprite) elPlayerSprite.style.display = 'none';
                const hpContainerPlayer = document.getElementById('player-battle-hp-container');
                if (hpContainerPlayer) hpContainerPlayer.style.display = 'none';
            }
        } else {
             const elEnemySprite = document.getElementById('enemy-sprite');
             if (elEnemySprite) elEnemySprite.style.display = 'none';
             const elPlayerSprite = document.getElementById('player-sprite');
             if (elPlayerSprite) elPlayerSprite.style.display = 'none';
             const hpContainerEnemy = document.getElementById('enemy-battle-hp-container');
             if (hpContainerEnemy) hpContainerEnemy.style.display = 'none';
             const hpContainerPlayer = document.getElementById('player-battle-hp-container');
             if (hpContainerPlayer) hpContainerPlayer.style.display = 'none';
        }
    }



/* removed TYPE_COLORS */


export function triggerDefeatAnimation(activeEncounter, ballResult, captureCallback) {
    const arena = document.getElementById('combat-arena');
    if (!arena) {
        captureCallback();
        return;
    }

    // Hide original enemy sprite container momentarily so ghost takes precedence until next slide in
    const elEnemySprite = document.getElementById('enemy-sprite');
    if (elEnemySprite) {
         // It will be replaced when searching/sliding starts
    }

    // 1. Create Ghost Enemy
    // Create a container to mirror the actual rendered sprite
    const ghostContainer = document.createElement('div');
    ghostContainer.style.position = 'absolute';
    ghostContainer.style.left = '35%';
    ghostContainer.style.transform = 'translateX(-50%)';
    ghostContainer.style.zIndex = '50';
    ghostContainer.style.opacity = '1';

    let baseBottom = 10;
    if (activeEncounter.types && activeEncounter.types.includes('Water')) baseBottom = 5;
    if (activeEncounter.types && (activeEncounter.types.includes('Flying') || activeEncounter.types.includes('Wind'))) baseBottom = 20;
    ghostContainer.style.bottom = `${baseBottom}%`;

    // The image itself
    const ghost = document.createElement('img');
    ghost.src = `Assets/Pokemon Sprites/${activeEncounter.qualityName === 'Shiny' ? activeEncounter.id + '_shiny' : activeEncounter.id}.png`;
    ghost.style.height = '35vh';
    ghostContainer.appendChild(ghost);

    // Recreate bubbles for ghost if it's water type
    if (activeEncounter.types && activeEncounter.types.includes('Water')) {
        const bubbles = document.createElement('div');
        bubbles.className = 'water-bubbles';
        bubbles.style.display = 'block';
        for(let i=1; i<=6; i++) {
            const b = document.createElement('div');
            b.className = 'bubble c' + i;
            bubbles.appendChild(b);
        }
        ghostContainer.appendChild(bubbles);
    }

    arena.appendChild(ghostContainer);

    // 2. Create Pokeball if used
    let ball = null;
    if (ballResult && ballResult.used && ballResult.ballName) {
        ball = document.createElement('img');
        ball.src = `Assets/Items/Balls/${ballResult.ballName}.png`;
        ball.style.position = 'absolute';
        ball.style.left = '35%';
        ball.style.bottom = `${baseBottom + 15}%`; // Hover above ghost
        ball.style.transform = 'translateX(-50%)';
        ball.style.width = '40px'; // fixed size for ball
        ball.style.height = '40px';
        ball.style.zIndex = '51';
        arena.appendChild(ball);
    }

    // Force reflow
    void ghost.offsetWidth;
    if (ball) void ball.offsetWidth;

    // Timeline Animations
    // Over 3 seconds, slide both to left: 15%
    ghostContainer.style.transition = 'left 3s linear, opacity 2s linear';
    ghostContainer.style.left = '15%';
    ghostContainer.style.opacity = '0'; // fades out in 2s while sliding

    if (ball) {
        ball.style.transition = 'left 3s linear';
        ball.style.left = '15%';

        // Add shake animation manually using setInterval since we need to slide too
        let shakeCount = 0;
        let shakeInterval = setInterval(() => {
            shakeCount++;
            let rotation = (shakeCount % 2 === 0) ? 15 : -15;
            if (shakeCount % 10 === 0) rotation = 0; // brief pause
            ball.style.transform = `translateX(-50%) rotate(${rotation}deg)`;
        }, 150);

        setTimeout(() => {
            clearInterval(shakeInterval);
            ball.style.transform = 'translateX(-50%) rotate(0deg)';

            // 3s mark: decide outcome
            if (ballResult.caught) {
                ball.src = `Assets/Items/Balls/${ballResult.ballName}Y.png`;
            } else {
                ball.src = `Assets/Items/Balls/${ballResult.ballName}N.png`;
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
        // No ball used, just wait for ghost to fade out then remove
        setTimeout(() => {
            captureCallback();
        }, 3000);
    }

    // Ghost should be removed after 3s (faded by 2s)
    setTimeout(() => {
        if (ghostContainer.parentElement) ghostContainer.parentElement.removeChild(ghostContainer);
    }, 3000);
}


export function showDamage(target, amount, isCrit, moveName = '', moveType = 'Normal', effectiveness = 1) {
    const battleSystem = globals.battleSystem;
    let containerId = target === 'player' ? 'player-sprite' : 'enemy-sprite';

    // Check if in gym battle
    if (battleSystem && battleSystem.gymState && battleSystem.gymState.isActive) {
        containerId = target === 'player' ? 'gym-player-sprite' : 'gym-enemy-sprite';

        // Log to gym combat log
        const log = document.getElementById('gym-combat-log');
        if (log) {
            const entry = document.createElement('div');
            entry.style.marginBottom = '2px';
            const attacker = target === 'player' ? 'Enemy' : 'You';
            const typeColor = TYPE_COLORS[moveType] || '#ffffff';
            entry.innerHTML = `${attacker} used <b style="color:${typeColor}">${moveName}</b> for <span style="color:${typeColor}">${amount}</span> dmg!`;
            log.appendChild(entry);

            // Keep only last 4 entries
            while(log.children.length > 4) {
                log.removeChild(log.firstChild);
            }
        }
    }

    let img = document.getElementById(containerId);
    if (!img) return;

    let dmgNode = document.createElement('div');

    const typeColor = TYPE_COLORS[moveType] || '#ffffff';
    let critText = isCrit ? ' Crit(1.5x)' : '';
    let effText = `${effectiveness}x`;
    let typeIconHtml = `<img src="Assets/Extra/Type ${moveType}.png" style="width: 20px; height: 20px; vertical-align: middle; margin: 0 4px;" />`;

    // Layout: [Amount] [Icon] [Name] [Effectiveness] [Crit]
    dmgNode.innerHTML = `<span style="font-weight: bold; font-style: ${isCrit ? 'italic' : 'normal'}; display: flex; align-items: center; justify-content: center; text-shadow: 1px 1px 2px black;">${amount} ${typeIconHtml} ${moveName} ${effText}${critText}</span>`;

    dmgNode.style.position = 'absolute';
    dmgNode.style.color = typeColor;
    dmgNode.style.fontSize = isCrit ? '24px' : '18px';
    dmgNode.style.fontWeight = 'bold';
    dmgNode.style.textShadow = '1px 1px 2px black';
    dmgNode.style.pointerEvents = 'none';
    dmgNode.style.transition = 'all 1s ease-out';
    dmgNode.style.zIndex = '100';
    dmgNode.style.whiteSpace = 'nowrap';

    // Position relatively to the parent container of the image
    const rect = img.getBoundingClientRect();
    const parentRect = img.parentElement.getBoundingClientRect();

    dmgNode.style.left = (rect.left - parentRect.left + (rect.width / 2) - 20) + 'px'; // -20 to center text slightly better
    dmgNode.style.top = (rect.top - parentRect.top) + 'px';

    img.parentElement.appendChild(dmgNode);

    // Animate up and fade out
    setTimeout(() => {
        dmgNode.style.top = (parseInt(dmgNode.style.top) - 40) + 'px';
    }, 50);

    setTimeout(() => {
        dmgNode.style.opacity = '0';
    }, 2000);

    setTimeout(() => {
        if (dmgNode.parentElement) dmgNode.parentElement.removeChild(dmgNode);
    }, 3000);
}

export function playCombatAnimations(targetSide, moveType, duration) {
    const battleSystem = globals.battleSystem;
    const isGym = battleSystem && battleSystem.gymState && battleSystem.gymState.isActive;

    let attackerId = targetSide === 'player' ? (isGym ? 'gym-enemy-sprite' : 'enemy-sprite') : (isGym ? 'gym-player-sprite' : 'player-sprite');
    if (!document.getElementById(attackerId)) attackerId = targetSide === 'player' ? 'enemy-sprite' : 'player-sprite';
    let defenderId = targetSide === 'player' ? (isGym ? 'gym-player-sprite' : 'player-sprite') : (isGym ? 'gym-enemy-sprite' : 'enemy-sprite');
    if (!document.getElementById(defenderId)) defenderId = targetSide === 'player' ? 'player-sprite' : 'enemy-sprite';

    const atkImg = document.getElementById(attackerId);
    const defImg = document.getElementById(defenderId);

    if (!atkImg || !defImg) return;

    const color = TYPE_COLORS[moveType] || '#ffffff';

    // We want to combine transforms without them overwriting each other.
    // Initialize base transform (e.g. scaleX(-1) for player) if not set
    if (!atkImg.dataset.baseTransform) {
        atkImg.dataset.baseTransform = atkImg.style.transform || (attackerId.includes('player') ? 'scaleX(-1)' : '');
    }
    if (!defImg.dataset.baseTransform) {
        defImg.dataset.baseTransform = defImg.style.transform || (defenderId.includes('player') ? 'scaleX(-1)' : '');
    }

    // Function to apply combined transforms safely
    const updateTransform = (img) => {
        const base = img.dataset.baseTransform || '';
        const atk = img.dataset.atkTransform || '';
        const def = img.dataset.defTransform || '';
        img.style.transform = `${base} ${atk} ${def}`.trim();
    };

    let atkTypes = [];
    if (attackerId.includes('player')) {
        atkTypes = state.party[0]?.types || [];
    } else if (battleSystem) {
        if (isGym && battleSystem.gymState && battleSystem.gymState.gym) {
             const gym = battleSystem.gymState.gym;
             const tIdx = battleSystem.gymState.currentTrainerIndex;
             const pIdx = battleSystem.gymState.currentPokemonIndex;
             if (gym.trainers[tIdx] && gym.trainers[tIdx].team && gym.trainers[tIdx].team[pIdx]) {
                 const pId = gym.trainers[tIdx].team[pIdx].id;
                 const baseData = state.config.pokemonData[pId];
                 if (baseData) {
                     atkTypes = baseData.types || [];
                 }
             }
        } else if (battleSystem.activeEncounter) {
             atkTypes = battleSystem.activeEncounter.types || [];
        }
    }

    const isPlayerAtk = attackerId.includes('player');
    const xDir = isPlayerAtk ? 15 : -15;
    const bt = atkImg.dataset.baseTransform || '';

    let attackKeyframes = [
        { transform: `${bt}` },
        { transform: `${bt} translateX(${xDir}px) scale(1.05)` },
        { transform: `${bt}` }
    ];

    if (atkTypes.includes('Flying') || atkTypes.includes('Wind')) {
        attackKeyframes = [
            { transform: `${bt}` },
            { transform: `${bt} translate(${xDir}px, 15px) scale(1.05)` },
            { transform: `${bt}` }
        ];
    }

    atkImg.animate(attackKeyframes, {
        duration: duration * 0.4,
        easing: 'ease-in-out'
    });

    // Create projectile
    const proj = document.createElement('div');
    proj.style.position = 'fixed';
    proj.style.width = '20px';
    proj.style.height = '10px';
    proj.style.backgroundColor = color;
    proj.style.borderRadius = '5px';
    proj.style.boxShadow = `0 0 10px 5px ${color}`;
    proj.style.zIndex = '999';
    proj.style.pointerEvents = 'none';

    const atkRect = atkImg.getBoundingClientRect();
    const defRect = defImg.getBoundingClientRect();

    // Start at attacker center
    const startX = atkRect.left + atkRect.width / 2;
    const startY = atkRect.top + atkRect.height / 2;

    // End at defender center
    const endX = defRect.left + defRect.width / 2;
    const endY = defRect.top + defRect.height / 2;

    proj.style.left = startX + 'px';
    proj.style.top = startY + 'px';

    document.body.appendChild(proj);

    // Animate projectile
    proj.style.transition = `all ${duration * 0.8}ms linear`;

    // Trigger reflow
    proj.getBoundingClientRect();

    proj.style.left = endX + 'px';
    proj.style.top = endY + 'px';

    setTimeout(() => {
        if (proj.parentElement) proj.parentElement.removeChild(proj);

        // Splash Effect
        const splash = document.createElement('div');
        splash.style.position = 'fixed';
        // Center the 0x0 div on the target
        splash.style.left = endX + 'px';
        splash.style.top = endY + 'px';
        splash.style.width = '0px';
        splash.style.height = '0px';
        splash.style.backgroundColor = color; // 100% solid color
        splash.style.borderRadius = '50%';
        splash.style.boxShadow = `0 0 10px 5px ${color}`;
        splash.style.zIndex = '999';
        splash.style.pointerEvents = 'none';

        // Phase 1: Grow to 25px
        splash.style.transition = `all ${duration * 0.15}ms linear`;

        document.body.appendChild(splash);

        // Trigger reflow
        splash.getBoundingClientRect();

        // Expand to 40x40 from the center
        splash.style.left = (endX - 20) + 'px';
        splash.style.top = (endY - 20) + 'px';
        splash.style.width = '40px';
        splash.style.height = '40px';
        splash.style.opacity = '1';

        // Phase 2: Grow to 80px and fade out
        setTimeout(() => {
            splash.style.transition = `all ${duration * 0.15}ms linear`;
            splash.style.left = (endX - 40) + 'px';
            splash.style.top = (endY - 40) + 'px';
            splash.style.width = '80px';
            splash.style.height = '80px';
            splash.style.opacity = '0';
        }, duration * 0.15);

        setTimeout(() => {
            if (splash.parentElement) splash.parentElement.removeChild(splash);
        }, duration * 0.3);

        // Defender Hit Animation (Shake) using transforms safely
        defImg.style.transition = 'transform 50ms ease-in-out';
        let shakeInterval = setInterval(() => {
            const shift = (Math.random() - 0.5) * 20;
            defImg.dataset.defTransform = `translateX(${shift}px)`;
            updateTransform(defImg);
        }, 50);

        setTimeout(() => {
            clearInterval(shakeInterval);
            defImg.dataset.defTransform = '';
            updateTransform(defImg);
        }, Math.min(500, duration * 0.3));

    }, duration * 0.8);
}