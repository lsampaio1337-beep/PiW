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

                // Add specific type classes for CSS styling
                elEnemySprite.className = '';
                if (enemy.types && enemy.types.includes('Flying')) elEnemySprite.classList.add('type-flying');
                if (enemy.types && enemy.types.includes('Water')) elEnemySprite.classList.add('type-water');

                // Add idle animations
                if (enemy.types && enemy.types.includes('Flying')) {
                    elEnemySprite.classList.add('anim-idle-flying');
                } else {
                    elEnemySprite.classList.add('anim-idle-ground');
                }

                // Handle search transition (Slide in)
                if (elEnemySprite.style.left === '100%') {
                    // Transition to battle position
                    elEnemySprite.style.transition = `left ${battleSystem.currentSearchDelay / 1000}s linear`;
                    elEnemySprite.style.left = '45%';
                } else {
                     // Keep at battle pos
                     elEnemySprite.style.transition = 'none';
                     elEnemySprite.style.left = '45%';
                }

                elEnemySprite.style.display = 'block';
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

                    // Add specific type classes
                    elPlayerSprite.className = '';
                    if (leader.types && leader.types.includes('Flying')) elPlayerSprite.classList.add('type-flying');
                    if (leader.types && leader.types.includes('Water')) elPlayerSprite.classList.add('type-water');

                    // Add idle animations
                    if (leader.types && leader.types.includes('Flying')) {
                        elPlayerSprite.classList.add('anim-idle-flying');
                    } else {
                        elPlayerSprite.classList.add('anim-idle-ground');
                    }

                    // Stop animations dynamically by letting them finish their iteration
                    const stopAnim = () => {
                        elPlayerSprite.style.animationIterationCount = "1";
                        elPlayerSprite.removeEventListener("animationiteration", stopAnim);
                    };

                    if (battleSystem.isSearching) {
                        elPlayerSprite.style.animationIterationCount = "infinite";
                    } else {
                        elPlayerSprite.addEventListener("animationiteration", stopAnim);
                    }

                    elPlayerSprite.style.display = 'block';
                }
            }
        } else if (battleSystem && battleSystem.isSearching) {
            const elEnemyName = document.getElementById('enemy-name');
            if (elEnemyName) elEnemyName.innerText = "Searching...";
            if (elEnemySprite) {
                // Keep enemy sprite invisible and at 100% left until an encounter spawns
                elEnemySprite.style.transition = 'none';
                elEnemySprite.style.left = '100%';
                elEnemySprite.style.display = 'none';
            }

            const elEnemyLvl = document.getElementById('enemy-lvl');
            if (elEnemyLvl) elEnemyLvl.innerText = "?";

            const elEnemyHp = document.getElementById('enemy-hp');
            if (elEnemyHp) elEnemyHp.innerText = "?/?";

            const elEnemySprite = document.getElementById('enemy-sprite');
            if (elEnemySprite) {
                elEnemySprite.src = "data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7";
                elEnemySprite.style.display = 'block';
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

export function playCombatAnimations(attackerSide, defenderSide, moveType) {
    let attackerId = attackerSide === 'player' ? 'player-sprite' : 'enemy-sprite';
    let defenderId = defenderSide === 'player' ? 'player-sprite' : 'enemy-sprite';

    // Gym variants
    const battleSystem = globals.battleSystem;
    if (battleSystem && battleSystem.gymState && battleSystem.gymState.isActive) {
        attackerId = attackerSide === 'player' ? 'gym-player-sprite' : 'gym-enemy-sprite';
        defenderId = defenderSide === 'player' ? 'gym-player-sprite' : 'gym-enemy-sprite';
    }

    const attackerEl = document.getElementById(attackerId);
    const defenderEl = document.getElementById(defenderId);
    if (!attackerEl || !defenderEl) return;

    const typeColor = TYPE_COLORS[moveType] || '#ffffff';

    // 1. Attacker Animation (Thrust)
    attackerEl.classList.remove('anim-attack-player', 'anim-attack-enemy');
    void attackerEl.offsetWidth; // trigger reflow
    attackerEl.classList.add(attackerSide === 'player' ? 'anim-attack-player' : 'anim-attack-enemy');

    // 2. Projectile
    const arena = document.getElementById(battleSystem && battleSystem.gymState && battleSystem.gymState.isActive ? 'gym-battle-area' : 'combat-arena');
    const projectile = document.createElement('div');
    projectile.className = 'projectile';
    projectile.style.color = typeColor;

    const aRect = attackerEl.getBoundingClientRect();
    const dRect = defenderEl.getBoundingClientRect();
    const arenaRect = arena.getBoundingClientRect();

    // Start pos
    const startX = aRect.left - arenaRect.left + aRect.width/2;
    const startY = aRect.top - arenaRect.top + aRect.height/2;
    // End pos
    const endX = dRect.left - arenaRect.left + dRect.width/2;
    const endY = dRect.top - arenaRect.top + dRect.height/2;

    projectile.style.left = startX + 'px';
    projectile.style.top = startY + 'px';
    projectile.style.transition = 'all 0.3s ease-in';

    arena.appendChild(projectile);

    // Animate Projectile
    setTimeout(() => {
        projectile.style.left = endX + 'px';
        projectile.style.top = endY + 'px';
    }, 50);

    // 3. Splash & Defender Hit Animation
    setTimeout(() => {
        projectile.remove();

        // Splash
        const splash = document.createElement('div');
        splash.className = 'splash';
        splash.style.color = typeColor;
        splash.style.left = (endX - 30) + 'px'; // center splash
        splash.style.top = (endY - 30) + 'px';
        arena.appendChild(splash);

        setTimeout(() => splash.remove(), 400); // splash animation duration

        // Defender Hit
        defenderEl.classList.remove('anim-hit');
        void defenderEl.offsetWidth; // trigger reflow
        defenderEl.classList.add('anim-hit');

    }, 350);
}

export function playDefeatAndCaptureAnimation(enemyData, throwSuccess, ballName) {
    const arena = document.getElementById('combat-arena');
    const originalSprite = document.getElementById('enemy-sprite');
    if (!arena || !originalSprite) return;

    // Clone the original sprite to animate independently
    const clone = originalSprite.cloneNode(true);
    clone.id = 'enemy-sprite-clone';
    clone.style.transition = 'opacity 2s ease-out, left 3s linear';
    arena.appendChild(clone);

    // The original sprite is now freed to be reused for the next search/spawn

    // Create the Pokeball
    const ball = document.createElement('img');
    ball.src = `Assets/Items/Balls/${ballName}.png`;
    ball.style.position = 'absolute';
    ball.style.width = '30px';
    ball.style.height = '30px';
    ball.style.left = clone.style.left || '45%';
    ball.style.top = '120px'; // Overlap on the enemy
    ball.style.zIndex = '30';
    ball.style.transition = 'left 3s linear';
    // Shake animation
    ball.animate([
        { transform: 'rotate(0deg)' },
        { transform: 'rotate(-20deg)' },
        { transform: 'rotate(20deg)' },
        { transform: 'rotate(0deg)' }
    ], { duration: 500, iterations: 6 }); // Shakes for 3s

    arena.appendChild(ball);

    // Fade out enemy and slide left
    setTimeout(() => {
        clone.style.opacity = '0';
        clone.style.left = '15%';
        ball.style.left = '15%';
    }, 50);

    // After 3 seconds (when they hit 15%), decide capture and continue slide
    setTimeout(() => {
        // Remove enemy clone
        clone.remove();

        // Swap ball image based on success
        const suffix = throwSuccess ? 'Y.png' : 'N.png';
        ball.src = `Assets/Items/Balls/${ballName}${suffix}`;

        // Keep sliding off screen
        ball.style.transition = 'left 1.5s linear'; // keep same rough speed (30% distance in 1.5s is similar to 30% in 3s)
        ball.style.left = '-15%';

        setTimeout(() => {
            ball.remove();
        }, 1500);

    }, 3050);
}
