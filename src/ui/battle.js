import { TYPE_COLORS } from '../ui.js';
import { state, globals } from '../state.js';


function applySpriteEffects(spriteContainerId, pokemon) {
    const container = document.getElementById(spriteContainerId);
    if (!container || !pokemon) return;

    // Reset classes
    container.className = 'sprite-container';

    // Apply idle moving if not currently in a duel
    // Or if we just want it to be added initially (we'll remove it when duel starts)
    if (!window.duelActive) {
        container.classList.add('sprite-walking');
    }

    // Check for flying
    if (pokemon.types && pokemon.types.includes('Flying')) {
        container.classList.remove('sprite-walking');
        container.classList.add('sprite-flying');
    }

    // Check for water splash
    const splashId = spriteContainerId === 'player-sprite-container' ? 'player-water-splash' : 'enemy-water-splash';
    const splash = document.getElementById(splashId);
    if (splash) {
        if (pokemon.types && pokemon.types.includes('Water')) {
            splash.style.display = 'block';
        } else {
            splash.style.display = 'none';
        }
    }
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
            applySpriteEffects('enemy-sprite-container', enemy);

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
                applySpriteEffects('player-sprite-container', leader);
            }
        } else if (battleSystem && battleSystem.isSearching) {
            const elEnemyName = document.getElementById('enemy-name');
            if (elEnemyName) elEnemyName.innerText = "Searching...";

            const elEnemyLvl = document.getElementById('enemy-lvl');
            if (elEnemyLvl) elEnemyLvl.innerText = "?";

            const elEnemyHp = document.getElementById('enemy-hp');
            if (elEnemyHp) elEnemyHp.innerText = "?/?";

            const elEnemySprite = document.getElementById('enemy-sprite');
            if (elEnemySprite) {
                elEnemySprite.src = "data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7";
                elEnemySprite.style.display = 'block';
            }
            const elEnemySplash = document.getElementById('enemy-water-splash');
            if (elEnemySplash) elEnemySplash.style.display = 'none';
            const eContainer = document.getElementById('enemy-sprite-container');
            if(eContainer) {
                eContainer.className = 'sprite-container'; // remove walking/flying
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
                applySpriteEffects('player-sprite-container', leader);
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
        dmgNode.style.opacity = '0';
    }, 50);

    setTimeout(() => {
        if (dmgNode.parentElement) dmgNode.parentElement.removeChild(dmgNode);
    }, 1000);
}

export function playCombatAnimations(attackerSide, moveType) {
    const pContainer = document.getElementById('player-sprite-container');
    const eContainer = document.getElementById('enemy-sprite-container');

    if (!pContainer || !eContainer) return;

    let source = attackerSide === 'player' ? pContainer : eContainer;
    let target = attackerSide === 'player' ? eContainer : pContainer;

    // Determine colors
    const color = TYPE_COLORS[moveType] || '#ffffff';

    // 1. Attacker animation (lunge)
    source.classList.add('anim-attack');
    setTimeout(() => {
        source.classList.remove('anim-attack');
    }, 300);

    // 2. Create Projectile
    const sRect = source.getBoundingClientRect();
    const tRect = target.getBoundingClientRect();
    const arenaRect = document.getElementById('combat-arena').getBoundingClientRect();

    const proj = document.createElement('div');
    proj.className = 'projectile';
    proj.style.color = color;
    proj.style.backgroundColor = color;

    // Start at center of source
    let startX = (sRect.left - arenaRect.left) + (sRect.width / 2) - 10;
    let startY = (sRect.top - arenaRect.top) + (sRect.height / 2) - 10;

    // Target at center of target
    let endX = (tRect.left - arenaRect.left) + (tRect.width / 2) - 10;
    let endY = (tRect.top - arenaRect.top) + (tRect.height / 2) - 10;

    proj.style.left = startX + 'px';
    proj.style.top = startY + 'px';

    document.getElementById('combat-arena').appendChild(proj);

    // 3. Move projectile
    setTimeout(() => {
        proj.style.left = endX + 'px';
        proj.style.top = endY + 'px';
    }, 10);

    // 4. On Impact (300ms later)
    setTimeout(() => {
        if(proj.parentElement) proj.parentElement.removeChild(proj);

        // Defender shake
        target.classList.add('anim-defend');
        setTimeout(() => target.classList.remove('anim-defend'), 300);

        // Create Splash
        const splash = document.createElement('div');
        splash.className = 'damage-splash';
        splash.style.color = color;
        splash.style.left = endX - 20 + 'px'; // Center 60x60 over 20x20
        splash.style.top = endY - 20 + 'px';

        document.getElementById('combat-arena').appendChild(splash);

        setTimeout(() => {
            if(splash.parentElement) splash.parentElement.removeChild(splash);
        }, 400);

    }, 310);
}

// Ensure it's globally available
window.playCombatAnimations = playCombatAnimations;

export function playCaptureAnimation(encounter, usedBall, caught) {
    const arena = document.getElementById('combat-arena');
    if (!arena) return;

    const eContainer = document.getElementById('enemy-sprite-container');
    if (!eContainer) return;

    // Create Ghost Container
    const ghost = document.createElement('div');
    ghost.className = 'capture-ghost-container';

    // It starts exactly where the enemy currently is (usually around 30% or 100%)
    // But logically, it's defeated, so let's start it at the enemy's current left value.
    const eLeft = eContainer.style.left || '30%';
    ghost.style.left = eLeft;

    const ghostImg = document.createElement('img');
    ghostImg.className = 'capture-ghost-img';
    ghostImg.src = `Assets/Pokemon Sprites/${encounter.qualityName === 'Shiny' ? encounter.id + '_shiny' : encounter.id}.png`;
    ghost.appendChild(ghostImg);

    // If a ball was used, add the ball shaking
    let ballImg = null;
    if (usedBall) {
        ballImg = document.createElement('img');
        ballImg.className = 'capture-ball';
        // Base name of ball, eg "Pokeball", "Greatball"
        let baseBallName = usedBall.split(' ')[0]; // E.g., "Pokeball" from "Pokeball"
        ballImg.src = `Assets/Items/Balls/${baseBallName}N.png`; // Fallback to N to start, or just base
        // Wait actually, we have Assets/Items/PokeballN.png because they were copied to Assets/Items/ directly based on my previous cp command
        ballImg.src = `Assets/Items/${baseBallName}N.png`;

        // Ensure the ball shakes for 3s
        ballImg.style.animation = 'shakePokeball 1s infinite linear';
        ghost.appendChild(ballImg);
    }

    arena.appendChild(ghost);

    // The enemy fades for 2s (handled by CSS animation `fadeOutGhost 2s forwards linear`)
    // The ball shakes for 3s. Let's wait 3s before sliding to x=15%
    setTimeout(() => {
        // Stop shaking
        if (ballImg) {
            ballImg.style.animation = 'none';
        }

        // Slide left to x=15% (Takes 1 second)
        ghost.style.transition = 'left 1s linear';
        ghost.style.left = '15%';

        setTimeout(() => {
            // Reached x=15%, decide capture visually
            if (usedBall && ballImg) {
                let baseBallName = usedBall.split(' ')[0];
                ballImg.src = caught ? `Assets/Items/${baseBallName}Y.png` : `Assets/Items/${baseBallName}N.png`;
            }

            // Keep sliding until it leaves the screen (left: -20%)
            setTimeout(() => {
                ghost.style.transition = 'left 1.5s linear';
                ghost.style.left = '-20%';

                // Cleanup
                setTimeout(() => {
                    if (ghost.parentElement) ghost.parentElement.removeChild(ghost);
                }, 1500);

            }, 500); // Wait 0.5s at 15% to show the Y/N swap

        }, 1000); // 1s to reach 15%

    }, 3000); // 3s of shaking in place

}
window.playCaptureAnimation = playCaptureAnimation;

export function triggerEnemySlideIn(durationMs) {
    const eContainer = document.getElementById('enemy-sprite-container');
    if (!eContainer) return;

    // Start at 100%
    eContainer.style.transition = 'none';
    eContainer.style.left = '100%';

    // Force reflow
    void eContainer.offsetWidth;

    // Animate to 40% (close to player at 25%) over durationMs
    eContainer.style.transition = `left ${durationMs}ms linear`;
    eContainer.style.left = '40%';

    // Keep walking animation while sliding
    eContainer.classList.add('sprite-walking');

    setTimeout(() => {
        // Stop walking once arrived, unless it's flying
        if (!eContainer.classList.contains('sprite-flying')) {
            eContainer.classList.remove('sprite-walking');
        }
    }, durationMs);
}
window.triggerEnemySlideIn = triggerEnemySlideIn;

window.duelActive = false; // Add a simple global toggle for duel active state
