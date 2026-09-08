import { TYPE_COLORS } from '../ui.js';
import { state, globals } from '../state.js';

function startSpriteAnimation(container, types, id) {
    if (!container) return;
    if (container.dataset.activeAnimId === String(id) && container.dataset.stopping !== 'true') {
        return;
    }

    container.dataset.activeAnimId = String(id);
    container.dataset.stopping = 'false';
    container.classList.remove('anim-flying', 'anim-water', 'anim-standard');

    // Remove any previous animation listener to avoid conflicts
    const newContainer = container.cloneNode(true);
    container.parentNode.replaceChild(newContainer, container);
    container = newContainer;

    let isFlying = types.includes('Flying') || types.includes('Wind');
    let isWater = types.includes('Water');

    let animClass = 'anim-standard';
    if (isFlying && isWater) {
        animClass = Math.random() < 0.5 ? 'anim-flying' : 'anim-water';
    } else if (isFlying) {
        animClass = 'anim-flying';
    } else if (isWater) {
        animClass = 'anim-water';
    }

    container.classList.add(animClass);
}

function stopSpriteAnimation(containerId) {
    let container = document.getElementById(containerId);
    if (!container) return;
    if (container.dataset.stopping === 'true' || !container.dataset.activeAnimId) return;

    container.dataset.stopping = 'true';

    container.addEventListener('animationiteration', function onAnimEnd() {
        if (container.dataset.stopping === 'true') {
            container.classList.remove('anim-flying', 'anim-water', 'anim-standard');
            container.dataset.activeAnimId = '';
        }
        container.removeEventListener('animationiteration', onAnimEnd);
    });
}

export function updateBattleArena() {
    const battleSystem = globals.battleSystem;
    const inGym = battleSystem && battleSystem.gymState && battleSystem.gymState.isActive;

    if (inGym) {
        // Update live gym battle UI elements if they exist
        const eNameGym = document.getElementById('gym-enemy-name');
        if (eNameGym && battleSystem && battleSystem.activeEncounter) {
            const enemy = battleSystem.activeEncounter;
            eNameGym.innerText = `Lv.${enemy.level} ${enemy.name}`;

            const eHpText = document.getElementById('gym-enemy-hp-text');
            if (eHpText) eHpText.innerText = `${Math.floor(enemy.currentHp)}/${enemy.maxHp}`;

            const eHpBar = document.getElementById('gym-enemy-hp-bar');
            if (eHpBar) eHpBar.style.width = `${Math.min(100, (enemy.currentHp / enemy.maxHp) * 100)}%`;

            const eSprite = document.getElementById('gym-enemy-sprite');
            const eSpriteContainer = document.getElementById('gym-enemy-side');
            if (eSprite) eSprite.src = `Assets/Pokemon Sprites/${enemy.qualityName === 'Shiny' ? enemy.id + '_shiny' : enemy.id}.png`;

            if (eSpriteContainer) {
                if (battleSystem.isSliding) {
                    if (eSpriteContainer.dataset.sliding !== 'true') {
                        eSpriteContainer.dataset.sliding = 'true';
                        eSpriteContainer.style.transition = 'none';
                        eSpriteContainer.style.left = '100%';
                        eSpriteContainer.style.opacity = '1';
                        // Trigger reflow
                        void eSpriteContainer.offsetWidth;
                        requestAnimationFrame(() => {
                            requestAnimationFrame(() => {
                                eSpriteContainer.style.transition = `left ${battleSystem.slideDuration}ms linear`;
                                eSpriteContainer.style.left = '50%';
                            });
                        });
                    }
                } else {
                    eSpriteContainer.dataset.sliding = 'false';
                    eSpriteContainer.style.transition = 'none';
                    eSpriteContainer.style.left = '50%';
                }
            }

            const leader = state.party[0];
            if (leader) {
                const pNameGym = document.getElementById('gym-player-name');
                if (pNameGym) pNameGym.innerText = `Lv.${leader.level} ${leader.name}`;

                const pHpText = document.getElementById('gym-player-hp-text');
                if (pHpText) pHpText.innerText = `${Math.floor(leader.currentHp)}/${leader.maxHp}`;

                const pHpBar = document.getElementById('gym-player-hp-bar');
                if (pHpBar) pHpBar.style.width = `${Math.min(100, (leader.currentHp / leader.maxHp) * 100)}%`;

                const pSprite = document.getElementById('gym-player-sprite');
                if (pSprite) {
                    pSprite.src = `Assets/Pokemon Sprites/${leader.qualityName === 'Shiny' ? leader.id + '_shiny' : leader.id}.png`;
                    if (leader.currentHp <= 0) {
                        pSprite.style.transition = 'opacity 2s linear';
                        pSprite.style.opacity = '0';
                    } else if (battleSystem && battleSystem.isPlayerSlidingIn) {
                        pSprite.style.transition = `left ${battleSystem.slideDuration}ms linear`;
                        pSprite.style.left = '25%';
                        pSprite.style.opacity = '1';
                    } else if (battleSystem && battleSystem.isFainting) {
                        // don't touch style while fading
                    } else if (battleSystem && battleSystem.isPlayerPreSlidingIn) {
                        pSprite.style.transition = 'none';
                        pSprite.style.left = '-30%';
                        pSprite.style.opacity = '1';
                    } else {
                        pSprite.style.transition = 'none';
                        pSprite.style.left = '25%';
                        pSprite.style.opacity = '1';
                    }
                }
            }
        }
    } else {
        // Standard Combat Arena
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

                let baseBottom = 15; // 100 - 85
                if (enemy.types.includes('Water')) baseBottom = 10; // 100 - 90
                if (enemy.types.includes('Flying') || enemy.types.includes('Wind')) baseBottom = 25; // 100 - 75

                elEnemySide.style.top = 'auto';
                elEnemySide.style.bottom = `${baseBottom}%`;

                if (battleSystem.isSliding) {
                    startSpriteAnimation(document.getElementById('enemy-sprite-anim-container'), enemy.types, enemy.id);
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
                    stopSpriteAnimation('enemy-sprite-anim-container');
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

                    if (battleSystem && (battleSystem.isSearching || battleSystem.isSliding || battleSystem.isPlayerSlidingIn || battleSystem.isPlayerPreSlidingIn)) {
                        startSpriteAnimation(document.getElementById('player-sprite-anim-container'), leader.types, leader.id);
                    } else {
                        stopSpriteAnimation('player-sprite-anim-container');
                    }

                    if (leader.currentHp <= 0) {
                        elPlayerSprite.style.transition = 'opacity 2s linear';
                        elPlayerSprite.style.opacity = '0';
                    } else if (battleSystem && battleSystem.isPlayerSlidingIn) {
                        elPlayerSprite.style.transition = `left ${battleSystem.slideDuration}ms linear`;
                        elPlayerSprite.style.left = '25%';
                        elPlayerSprite.style.opacity = '1';
                    } else if (battleSystem && battleSystem.isFainting) {
                        // don't touch style while fading
                    } else if (battleSystem && battleSystem.isPlayerPreSlidingIn) {
                        elPlayerSprite.style.transition = 'none';
                        elPlayerSprite.style.left = '-30%';
                        elPlayerSprite.style.opacity = '1';
                    } else {
                        elPlayerSprite.style.transition = 'none';
                        elPlayerSprite.style.left = '25%';
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

                    if (battleSystem && (battleSystem.isSearching || battleSystem.isSliding || battleSystem.isPlayerSlidingIn || battleSystem.isPlayerPreSlidingIn)) {
                        startSpriteAnimation(document.getElementById('player-sprite-anim-container'), leader.types, leader.id);
                    } else {
                        stopSpriteAnimation('player-sprite-anim-container');
                    }

                    if (leader.currentHp <= 0) {
                        elPlayerSprite.style.transition = 'opacity 2s linear';
                        elPlayerSprite.style.opacity = '0';
                    } else if (battleSystem && battleSystem.isPlayerSlidingIn) {
                        elPlayerSprite.style.transition = `left ${battleSystem.slideDuration}ms linear`;
                        elPlayerSprite.style.left = '25%';
                        elPlayerSprite.style.opacity = '1';
                    } else if (battleSystem && battleSystem.isFainting) {
                        // don't touch style while fading
                    } else if (battleSystem && battleSystem.isPlayerPreSlidingIn) {
                        elPlayerSprite.style.transition = 'none';
                        elPlayerSprite.style.left = '-30%';
                        elPlayerSprite.style.opacity = '1';
                    } else {
                        elPlayerSprite.style.transition = 'none';
                        elPlayerSprite.style.left = '25%';
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
    const ghost = document.createElement('img');
    ghost.src = `Assets/Pokemon Sprites/${activeEncounter.qualityName === 'Shiny' ? activeEncounter.id + '_shiny' : activeEncounter.id}.png`;
    ghost.style.position = 'absolute';
    ghost.style.left = '35%';
    ghost.style.transform = 'translateX(-50%)';

    let baseBottom = 10;
    if (activeEncounter.types && activeEncounter.types.includes('Water')) baseBottom = 5;
    if (activeEncounter.types && (activeEncounter.types.includes('Flying') || activeEncounter.types.includes('Wind'))) baseBottom = 20;

    ghost.style.bottom = `${baseBottom}%`;
    ghost.style.height = '35vh';
    ghost.style.zIndex = '50';
    ghost.style.opacity = '1';

    arena.appendChild(ghost);

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
    ghost.style.transition = 'left 3s linear, opacity 2s linear';
    ghost.style.left = '15%';
    ghost.style.opacity = '0'; // fades out in 2s while sliding

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
        if (ghost.parentElement) ghost.parentElement.removeChild(ghost);
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
    let defenderId = targetSide === 'player' ? (isGym ? 'gym-player-sprite' : 'player-sprite') : (isGym ? 'gym-enemy-sprite' : 'enemy-sprite');

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

    // Attacker launch animation
    atkImg.style.transition = `transform ${duration * 0.2}ms ease-out`;

    // For attack we just scale up slightly
    atkImg.dataset.atkTransform = 'scale(1.2)';
    updateTransform(atkImg);

    setTimeout(() => {
        atkImg.dataset.atkTransform = '';
        updateTransform(atkImg);
    }, duration * 0.4);

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