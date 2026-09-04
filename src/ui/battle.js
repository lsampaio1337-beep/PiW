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

    const isPlayerAtk = attackerId.includes('player');
    // For attack we just scale up slightly
    atkImg.dataset.atkTransform = isPlayerAtk ? 'scaleY(1.2)' : 'scale(1.2)';
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

        // Expand to 25x25 from the center
        splash.style.left = (endX - 12.5) + 'px';
        splash.style.top = (endY - 12.5) + 'px';
        splash.style.width = '25px';
        splash.style.height = '25px';
        splash.style.opacity = '1';

        // Phase 2: Grow to 50px and fade out
        setTimeout(() => {
            splash.style.transition = `all ${duration * 0.15}ms linear`;
            splash.style.left = (endX - 25) + 'px';
            splash.style.top = (endY - 25) + 'px';
            splash.style.width = '50px';
            splash.style.height = '50px';
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