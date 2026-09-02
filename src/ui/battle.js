import { TYPE_COLORS } from '../ui.js';
import { state, globals } from '../state.js';

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
            if (eSprite) eSprite.src = `Assets/Pokemon Sprites/${enemy.qualityName === 'Shiny' ? enemy.id + '_shiny' : enemy.id}.png`;

            const leader = state.party[0];
            if (leader) {
                const pNameGym = document.getElementById('gym-player-name');
                if (pNameGym) pNameGym.innerText = `Lv.${leader.level} ${leader.name}`;

                const pHpText = document.getElementById('gym-player-hp-text');
                if (pHpText) pHpText.innerText = `${Math.floor(leader.currentHp)}/${leader.maxHp}`;

                const pHpBar = document.getElementById('gym-player-hp-bar');
                if (pHpBar) pHpBar.style.width = `${Math.min(100, (leader.currentHp / leader.maxHp) * 100)}%`;

                const pSprite = document.getElementById('gym-player-sprite');
                if (pSprite) pSprite.src = `Assets/Pokemon Sprites/${leader.qualityName === 'Shiny' ? leader.id + '_shiny' : leader.id}.png`;
            }
        }
    } else {
        // Standard Combat Arena
        if (battleSystem && battleSystem.activeEncounter) {
            const enemy = battleSystem.activeEncounter;
            const enemyTotalIV = enemy.ivs.hp + enemy.ivs.atk + enemy.ivs.def + enemy.ivs.spa + enemy.ivs.spd + enemy.ivs.spe;

            const elEnemyName = document.getElementById('enemy-name');
            if (elEnemyName) elEnemyName.innerText = `${enemy.name} (Q=${enemy.quality.toFixed(2)} & ∑IV=${enemyTotalIV})`;

            const elEnemyLvl = document.getElementById('enemy-lvl');
            if (elEnemyLvl) elEnemyLvl.innerText = enemy.level;

            const elEnemyHp = document.getElementById('enemy-hp');
            if (elEnemyHp) elEnemyHp.innerText = `${Math.floor(enemy.currentHp)}/${enemy.maxHp}`;

            const elEnemySprite = document.getElementById('enemy-sprite');
            if (elEnemySprite) {
                elEnemySprite.src = `Assets/Pokemon Sprites/${enemy.qualityName === 'Shiny' ? enemy.id + '_shiny' : enemy.id}.png`;
                elEnemySprite.style.display = 'block';
            }
            elEnemySprite.classList.remove('anim-fade-out');
            // Only trigger entrance once when enemy spawns
            if (!elEnemySprite.dataset.spawnedId || elEnemySprite.dataset.spawnedId !== enemy.id.toString()) {
                elEnemySprite.dataset.spawnedId = enemy.id.toString();
                const enemySideEl = document.getElementById('enemy-side');
                if (enemySideEl) {
                    enemySideEl.style.display = 'flex';
                    enemySideEl.classList.remove('anim-slide-left', 'anim-fade-out'); // remove potential old corpse classes
                    enemySideEl.classList.add('anim-slide-in');
                    setTimeout(() => { enemySideEl.classList.remove('anim-slide-in'); }, 2000);
                }
            }
            updateSpriteAnimation(elEnemySprite, enemy, 'enemy');

            const leader = state.party[0];
            if (leader) {
                const playerTotalIV = leader.ivs.hp + leader.ivs.atk + leader.ivs.def + leader.ivs.spa + leader.ivs.spd + leader.ivs.spe;

                const elPlayerName = document.getElementById('player-name');
                if (elPlayerName) elPlayerName.innerText = `${leader.name} (Q=${leader.quality.toFixed(2)} & ∑IV=${playerTotalIV})`;

                const elPlayerLvl = document.getElementById('player-lvl');
                if (elPlayerLvl) elPlayerLvl.innerText = leader.level;

                const elPlayerHp = document.getElementById('player-hp');
                if (elPlayerHp) elPlayerHp.innerText = `${Math.floor(leader.currentHp)}/${leader.maxHp}`;

                const elPlayerSprite = document.getElementById('player-sprite');
                if (elPlayerSprite) {
                    elPlayerSprite.src = `Assets/Pokemon Sprites/${leader.qualityName === 'Shiny' ? leader.id + '_shiny' : leader.id}.png`;
                    elPlayerSprite.style.display = 'block';
                }
                    updateSpriteAnimation(elPlayerSprite, leader, 'player');
            }
        } else if (battleSystem && battleSystem.isSearching) {
            const elEnemyName = document.getElementById('enemy-name');
            if (elEnemyName) elEnemyName.innerText = "Searching...";

            const elEnemyLvl = document.getElementById('enemy-lvl');
            if (elEnemyLvl) elEnemyLvl.innerText = "?";

            const elEnemyHp = document.getElementById('enemy-hp');
            if (elEnemyHp) elEnemyHp.innerText = "?/?";

            const elEnemySide = document.getElementById('enemy-side');
            if (elEnemySide) elEnemySide.style.display = 'flex';

            const elEnemySprite = document.getElementById('enemy-sprite');
            if (elEnemySprite) {
                elEnemySprite.src = "data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7";
                elEnemySprite.style.display = 'block';
                clearSpriteAnimation(elEnemySprite, 'enemy');
            }

            const leader = state.party[0];
            if (leader) {
                const playerTotalIV = leader.ivs.hp + leader.ivs.atk + leader.ivs.def + leader.ivs.spa + leader.ivs.spd + leader.ivs.spe;

                const elPlayerName = document.getElementById('player-name');
                if (elPlayerName) elPlayerName.innerText = `${leader.name} (Q=${leader.quality.toFixed(2)} & ∑IV=${playerTotalIV})`;

                const elPlayerLvl = document.getElementById('player-lvl');
                if (elPlayerLvl) elPlayerLvl.innerText = leader.level;

                const elPlayerHp = document.getElementById('player-hp');
                if (elPlayerHp) elPlayerHp.innerText = `${Math.floor(leader.currentHp)}/${leader.maxHp}`;

                const elPlayerSprite = document.getElementById('player-sprite');
                if (elPlayerSprite) {
                    elPlayerSprite.src = `Assets/Pokemon Sprites/${leader.qualityName === 'Shiny' ? leader.id + '_shiny' : leader.id}.png`;
                    elPlayerSprite.style.display = 'block';
                }
            } else {
                const elPlayerSprite = document.getElementById('player-sprite');
                if (elPlayerSprite) elPlayerSprite.style.display = 'none';
            }
        } else {
             const elEnemySprite = document.getElementById('enemy-sprite');
             if (elEnemySprite) elEnemySprite.style.display = 'none';
             const elPlayerSprite = document.getElementById('player-sprite');
             if (elPlayerSprite) elPlayerSprite.style.display = 'none';
        }
    }
}


/* removed TYPE_COLORS */


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
    dmgNode.style.transition = 'top 3s linear, opacity 1s linear';
    dmgNode.style.zIndex = '100';
    dmgNode.style.whiteSpace = 'nowrap';

    // Position relatively to the parent container of the image
    const rect = img.getBoundingClientRect();
    const parentRect = img.parentElement.getBoundingClientRect();

    dmgNode.style.left = (rect.left - parentRect.left + (rect.width / 2) - 20) + 'px'; // -20 to center text slightly better
    dmgNode.style.top = (rect.top - parentRect.top) + 'px';

    img.parentElement.appendChild(dmgNode);

    // Set initial opacity explicit for transition
    dmgNode.style.opacity = '1';

    // Slide up constantly over 3s
    setTimeout(() => {
        dmgNode.style.top = (parseInt(dmgNode.style.top) - 40) + 'px';
    }, 50);

    // After 2s, start fading out over the last 1s
    setTimeout(() => {
        dmgNode.style.opacity = '0';
    }, 2050);

    setTimeout(() => {
        if (dmgNode.parentElement) dmgNode.parentElement.removeChild(dmgNode);
    }, 3050);
}


function updateSpriteAnimation(spriteEl, pokemon, side) {
    if (!spriteEl) return;

    // Clear existing idle classes
    const wrapper = side === 'player' ? document.getElementById('player-sprite-wrapper') : document.getElementById('enemy-sprite-wrapper');
    if (wrapper) wrapper.classList.remove('anim-idle-walk', 'anim-idle-walk-enemy', 'anim-idle-fly', 'anim-idle-fly-enemy', 'anim-idle-swim', 'anim-idle-swim-enemy');

    const types = pokemon.types || [];
    let animClass = side === 'player' ? 'anim-idle-walk' : 'anim-idle-walk-enemy';

    // Set base padding to 0 first
    if (wrapper) wrapper.style.paddingTop = '0';

    // Determine animation based on priority: Fly+Water -> Fly, Fly -> Fly, Water -> Swim, Else -> Walk
    if (types.includes('Flying')) {
        animClass = side === 'player' ? 'anim-idle-fly' : 'anim-idle-fly-enemy';
        if (wrapper) wrapper.style.paddingBottom = '60px'; // Fly higher
        if (wrapper) wrapper.style.paddingTop = '0px';
    } else if (types.includes('Water')) {
        animClass = side === 'player' ? 'anim-idle-swim' : 'anim-idle-swim-enemy';
        if (wrapper) wrapper.style.paddingTop = '60px'; // Swim lower
        if (wrapper) wrapper.style.paddingBottom = '0px';
    } else {
        if (wrapper) wrapper.style.paddingTop = '30px'; // Normal walk height
        if (wrapper) wrapper.style.paddingBottom = '0px';
    }

    // Don't override attack or entrance classes if they are active, just add it to classList
    if (wrapper) wrapper.classList.add(animClass);

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
    const wrapper = side === 'player' ? document.getElementById('player-sprite-wrapper') : document.getElementById('enemy-sprite-wrapper');
    if (wrapper) wrapper.classList.remove('anim-idle-walk', 'anim-idle-walk-enemy', 'anim-idle-fly', 'anim-idle-fly-enemy', 'anim-idle-swim', 'anim-idle-swim-enemy');

    const fakeWaterEl = document.getElementById(side + '-fake-water');
    if (fakeWaterEl) fakeWaterEl.style.display = 'none';
}


export function pauseIdleAnimation() {
    ['player-sprite', 'enemy-sprite'].forEach(id => {
        const el = document.getElementById(id);
        const wrapper = document.getElementById(id + '-wrapper');
        if (wrapper) {
            wrapper.style.animationPlayState = 'paused';
        }
    });
}

export function resumeIdleAnimation() {
    ['player-sprite', 'enemy-sprite'].forEach(id => {
        const el = document.getElementById(id);
        const wrapper = document.getElementById(id + '-wrapper');
        if (wrapper) {
            wrapper.style.animationPlayState = 'running';
        }
    });
}

export function playAttackAnimation(attackerSide) {
    const elId = attackerSide === 'player' ? 'player-sprite' : 'enemy-sprite';
    const el = document.getElementById(elId);
    if (!el) return;


    const attackClass = attackerSide === 'player' ? 'anim-attack' : 'anim-attack-enemy';
    el.classList.remove(attackClass);
    void el.offsetWidth; // trigger reflow
    el.classList.add(attackClass);

    setTimeout(() => {
        el.classList.remove(attackClass);
    }, 500);
}

export function playAttackedAnimation(defenderSide) {
    const elId = defenderSide === 'player' ? 'player-sprite' : 'enemy-sprite';
    const el = document.getElementById(elId);
    if (!el) return;

    const attackedClass = defenderSide === 'player' ? 'anim-attacked' : 'anim-attacked-enemy';
    el.classList.remove(attackedClass);
    void el.offsetWidth; // trigger reflow
    el.classList.add(attackedClass);

    setTimeout(() => {
        el.classList.remove(attackedClass);
    }, 400);
}

export function shootProjectile(attackerSide, moveType, onImpactCallback) {
    const color = TYPE_COLORS[moveType] || '#ffffff';

    const startId = attackerSide === 'player' ? 'player-sprite' : 'enemy-sprite';
    const targetId = attackerSide === 'player' ? 'enemy-sprite' : 'player-sprite';

    const startEl = document.getElementById(startId);
    const targetEl = document.getElementById(targetId);

    if (!startEl || !targetEl) {
        if(onImpactCallback) onImpactCallback();
        return;
    }

    const arena = document.getElementById('combat-arena');
    if (!arena) {
        if(onImpactCallback) onImpactCallback();
        return;
    }

    const startRect = startEl.getBoundingClientRect();
    const targetRect = targetEl.getBoundingClientRect();
    const arenaRect = arena.getBoundingClientRect();

    const startX = startRect.left - arenaRect.left + startRect.width / 2;
    const startY = startRect.top - arenaRect.top + startRect.height / 2;

    const endX = targetRect.left - arenaRect.left + targetRect.width / 2;
    const endY = targetRect.top - arenaRect.top + targetRect.height / 2;

    const projectile = document.createElement('div');
    projectile.style.position = 'absolute';
    projectile.style.width = '16px';
    projectile.style.height = '16px';
    projectile.style.borderRadius = '50%';
    projectile.style.backgroundColor = color;
    projectile.style.boxShadow = `0 0 10px ${color}, 0 0 20px ${color}`;
    projectile.style.left = startX + 'px';
    projectile.style.top = startY + 'px';
    projectile.style.transform = 'translate(-50%, -50%)';
    projectile.style.zIndex = '100';
    projectile.style.transition = 'left 0.4s cubic-bezier(0.25, 0.1, 0.25, 1), top 0.4s cubic-bezier(0.25, 0.1, 0.25, 1)';

    arena.appendChild(projectile);

    // Start animation next frame
    requestAnimationFrame(() => {
        requestAnimationFrame(() => {
            projectile.style.left = endX + 'px';
            projectile.style.top = endY + 'px';
        });
    });

    setTimeout(() => {
        if (projectile.parentElement) projectile.parentElement.removeChild(projectile);
        playSplash(endX, endY, color, arena);
        if(onImpactCallback) onImpactCallback();
    }, 400);


}

function playSplash(x, y, color, parent) {
    for (let i = 0; i < 8; i++) {
        const particle = document.createElement('div');
        particle.style.position = 'absolute';
        particle.style.width = '8px';
        particle.style.height = '8px';
        particle.style.borderRadius = '50%';
        particle.style.backgroundColor = color;
        particle.style.left = x + 'px';
        particle.style.top = y + 'px';
        particle.style.zIndex = '99';
        particle.style.transition = 'all 1s ease-out';

        parent.appendChild(particle);

        const angle = (Math.PI * 2 / 8) * i;
        const distance = 30 + Math.random() * 20;

        requestAnimationFrame(() => {
            requestAnimationFrame(() => {
                particle.style.transform = `translate(${Math.cos(angle) * distance}px, ${Math.sin(angle) * distance}px) scale(0)`;
                particle.style.opacity = '0';
            });
        });

        setTimeout(() => {
            if (particle.parentElement) particle.parentElement.removeChild(particle);
        }, 1000);
    }
}


export function playEnemyDefeatAnimation(ballName, success) {
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
            style.innerHTML = `
                @keyframes ball-shake {
                    0% { transform: translate(-50%, -50%) rotate(0deg); }
                    20% { transform: translate(-50%, -50%) rotate(-15deg); }
                    40% { transform: translate(-50%, -50%) rotate(15deg); }
                    60% { transform: translate(-50%, -50%) rotate(-15deg); }
                    80% { transform: translate(-50%, -50%) rotate(15deg); }
                    100% { transform: translate(-50%, -50%) rotate(0deg); }
                }
                .anim-ball-shake { animation: ball-shake 0.5s ease-in-out infinite; }
            `;
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
}
