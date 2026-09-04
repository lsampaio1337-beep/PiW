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

                let baseBottom = 10;
                if (enemy.types.includes('Water')) baseBottom = 5;
                if (enemy.types.includes('Flying') || enemy.types.includes('Wind')) baseBottom = 20;

                elEnemySide.style.bottom = `${baseBottom}%`;

                if (battleSystem.isSliding) {
                    if (elEnemySide.dataset.sliding !== 'true') {
                        elEnemySide.dataset.sliding = 'true';
                        elEnemySide.style.transition = 'none';
                        elEnemySide.style.left = '100%';
                        // Trigger reflow
                        void elEnemySide.offsetWidth;
                        requestAnimationFrame(() => {
                            requestAnimationFrame(() => {
                                elEnemySide.style.transition = `left ${battleSystem.slideDuration}ms linear`;
                                elEnemySide.style.left = '35%';
                            });
                        });
                    }
                } else {
                    elEnemySide.dataset.sliding = 'false';
                    elEnemySide.style.transition = 'none';
                    elEnemySide.style.left = '35%';
                }
            }

            const leader = state.party[0];
            const elPlayerSide = document.getElementById('player-side');
            if (leader && elPlayerSide) {

                let baseBottom = 10;
                if (leader.types.includes('Water')) baseBottom = 5;
                if (leader.types.includes('Flying') || leader.types.includes('Wind')) baseBottom = 20;

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
                elEnemySide.style.bottom = '10%'; // default
            }

            const leader = state.party[0];
            const elPlayerSide = document.getElementById('player-side');
            if (leader && elPlayerSide) {
                let baseBottom = 10;
                if (leader.types.includes('Water')) baseBottom = 5;
                if (leader.types.includes('Flying') || leader.types.includes('Wind')) baseBottom = 20;

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
