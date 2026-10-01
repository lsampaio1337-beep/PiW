import { VITAMINS } from "../constants.js";
import { TYPE_COLORS } from '../ui.js';
import { state, globals } from '../state.js';
import { getCapacity } from '../mathEngine.js';




function updateActiveItemsUI() {
    const smartwatchTier = state.stats?.upgrades?.smartwatchTier || 0;

    const potionImg = document.getElementById('smartwatch-potion-img');
    const potionCount = document.getElementById('smartwatch-potion-count');
    const potionCard = document.getElementById('smartwatch-potion-card');

    const popup = document.getElementById('smartwatch-item-selection-popup');
    const openType = (popup && popup.style.display === 'flex') ? popup.dataset.type : null;

    if (potionImg && potionCount && potionCard) {
        potionCard.style.display = smartwatchTier >= 2 ? 'flex' : 'none';
        if (state.settings.activePotionTier >= 0) {
            potionCard.style.border = '2px solid #2ecc71'; // Green
            const potionName = state.config.balance.items.potions[state.settings.activePotionTier].name;
            potionImg.src = `./Assets/Items/Potions/${potionName}.png`;
            potionCount.textContent = formatActiveItemQuantity(state.backpack.potions[potionName] || 0);
            potionImg.style.display = 'block';
            potionCount.style.display = 'block';
        } else {
            potionCard.style.border = '2px solid #3498db'; // Blue
            potionImg.src = "./Assets/Extra/No.png";
            potionCount.textContent = '';
            potionImg.style.display = 'block';
            potionCount.style.display = 'none';
        }
    }

    const storageImg = document.getElementById('smartwatch-storage-img');
    const storageCount = document.getElementById('smartwatch-storage-count');
    const storageOverlay = document.getElementById('smartwatch-storage-full-overlay');
    const storageCard = document.getElementById('smartwatch-storage-card');

    if (storageImg && storageCount && storageOverlay && storageCard) {
        const boxTier = state.stats?.upgrades?.boxTier || 0;
        storageImg.src = `./Assets/Items/Upgrades/Storage${Math.max(1, boxTier)}.png`;

        const partyLength = state.party ? state.party.length : 0;
        const storageLength = state.storage ? state.storage.length : 0;
        const safeLength = state.safe ? state.safe.length : 0;
        const breedLength = state.breeding ? state.breeding.length : 0;
        const trainLength = state.training ? state.training.length : 0;
        const totalCount = partyLength + storageLength + safeLength + breedLength + trainLength;
        const maxBox = getCapacity(state, 'box');

        const maxAllowed = maxBox; // Base Box capacity handles all Pokemon
        storageCount.textContent = `${totalCount}/${maxAllowed}`;

        if (totalCount >= maxAllowed) {
            storageCard.style.border = '2px solid #e74c3c'; // Red
            storageOverlay.style.display = 'block';
        } else if (totalCount >= maxAllowed * 0.75) {
            storageCard.style.border = '2px solid orange'; // Orange
            storageOverlay.style.display = 'none';
        } else {
            storageCard.style.border = '2px solid #2ecc71'; // Green
            storageOverlay.style.display = 'none';
        }
    }

    const ballImg = document.getElementById('smartwatch-ball-img');
    const ballCount = document.getElementById('smartwatch-ball-count');
    const ballCard = document.getElementById('smartwatch-ball-card');

    if (ballImg && ballCount && ballCard) {
        ballCard.style.display = smartwatchTier >= 1 ? 'flex' : 'none';
        if (state.settings.activeBallTier >= 0) {
            ballCard.style.border = '2px solid #2ecc71'; // Green
            const ballName = state.config.balance.items.pokeballs[state.settings.activeBallTier].name;
            ballImg.src = `./Assets/Items/Balls/${ballName}.png`;
            ballCount.textContent = formatActiveItemQuantity(state.backpack.pokeballs[ballName] || 0);
            ballImg.style.display = 'block';
            ballCount.style.display = 'block';
        } else {
            ballCard.style.border = '2px solid #3498db'; // Blue
            ballImg.src = "./Assets/Extra/No.png";
            ballCount.textContent = '';
            ballImg.style.display = 'block';
            ballCount.style.display = 'none';
        }
    }

}

function formatActiveItemQuantity(q) {
    if (q >= 1000000) return Math.floor(q / 1000000) + 'm';
    if (q >= 1000) return Math.floor(q / 1000) + 'k';
    return q;
}

window.showActiveItemSelection = function(type) {
    const smartwatchTier = state.stats?.upgrades?.smartwatchTier || 0;
    const popup = document.getElementById('smartwatch-item-selection-popup');
    if (!popup) return;

    if (popup.style.display === 'flex' && popup.dataset.type === type) {
        popup.style.display = 'none';
        updateActiveItemsUI();
        return;
    }

    let html = '';

    if (type === 'potion') {
        const isNoActive = state.settings.activePotionTier === -1;
        const noBorderColor = isNoActive ? '#2ecc71' : '#3498db'; // Green if selected, blue otherwise
        html += `
            <div onclick="window.selectBattleActiveItem('potion', -1)" style="width: 30px; height: 30px; background: rgba(0, 0, 0, 0.6); border: 2px solid ${noBorderColor}; border-radius: 8px; position: relative; display: flex; align-items: center; justify-content: center; cursor: pointer;" title="No Potion">
                <img src="./Assets/Extra/No.png" style="width: 60%; height: 60%; object-fit: contain;">
            </div>
        `;

        const potions = state.config.balance.items.potions;
        for (let idx = 0; idx < potions.length; idx++) {
            let p = potions[idx];
            if (p.name === 'Max Potion') continue;
            let inventoryName = p.name;
            if (p.name === 'Regular Potion') inventoryName = 'Regular Potion';
            if (p.name === 'Big') inventoryName = 'Big Potion';

            const qty = state.backpack.potions[inventoryName] || 0;
            const isActive = state.settings.activePotionTier === idx;
            const borderColor = isActive ? '#2ecc71' : '#3498db'; // Green if selected, blue otherwise

            html += `
                <div onclick="window.selectBattleActiveItem('potion', ${idx})" style="width: 30px; height: 30px; background: rgba(0, 0, 0, 0.6); border: 2px solid ${borderColor}; border-radius: 8px; position: relative; display: flex; align-items: center; justify-content: center; cursor: pointer;">
                    <img src="./Assets/Items/Potions/${inventoryName}.png" style="width: 80%; height: 80%; object-fit: contain;">
                    <span style="position: absolute; bottom: 0px; right: 2px; color: white; font-size: 8px; font-weight: bold; text-shadow: 1px 1px 0 #000, -1px -1px 0 #000, 1px -1px 0 #000, -1px 1px 0 #000;">${formatActiveItemQuantity(qty)}</span>
                </div>
            `;
        }

        // Add Threshold Card at the end
        html += `
            <div id="smartwatch-potion-threshold-card" onclick="event.stopPropagation(); window.showActiveItemSelection('threshold')" style="width: 30px; height: 30px; background: rgba(0, 0, 0, 0.6); border: 2px solid #3498db; border-radius: 8px; position: relative; display: flex; align-items: center; justify-content: center; cursor: pointer;">
                <span id="smartwatch-threshold-val" style="color: white; font-size: 10px; font-weight: bold; text-shadow: 1px 1px 0 #000, -1px -1px 0 #000, 1px -1px 0 #000, -1px 1px 0 #000;">${state.settings.autoPotionThreshold}%</span>
            </div>
        `;
    } else if (type === 'ball') {
        const isNoActive = state.settings.activeBallTier === -1;
        const noBorderColor = isNoActive ? '#2ecc71' : '#3498db'; // Green if selected, blue otherwise
        html += `
            <div onclick="window.selectBattleActiveItem('ball', -1)" style="width: 30px; height: 30px; background: rgba(0, 0, 0, 0.6); border: 2px solid ${noBorderColor}; border-radius: 8px; position: relative; display: flex; align-items: center; justify-content: center; cursor: pointer;" title="No Ball">
                <img src="./Assets/Extra/No.png" style="width: 60%; height: 60%; object-fit: contain;">
            </div>
        `;

        const balls = state.config.balance.items.pokeballs;
        for (let idx = 0; idx < balls.length; idx++) {
            let b = balls[idx];
            const qty = state.backpack.pokeballs[b.name] || 0;
            const isActive = state.settings.activeBallTier === idx;
            const borderColor = isActive ? '#2ecc71' : '#3498db'; // Green if selected, blue otherwise

            html += `
                <div onclick="window.selectBattleActiveItem('ball', ${idx})" style="width: 30px; height: 30px; background: rgba(0, 0, 0, 0.6); border: 2px solid ${borderColor}; border-radius: 8px; position: relative; display: flex; align-items: center; justify-content: center; cursor: pointer;">
                    <img src="./Assets/Items/Balls/${b.name}.png" style="width: 80%; height: 80%; object-fit: contain;">
                    <span style="position: absolute; bottom: 0px; right: 2px; color: white; font-size: 8px; font-weight: bold; text-shadow: 1px 1px 0 #000, -1px -1px 0 #000, 1px -1px 0 #000, -1px 1px 0 #000;">${formatActiveItemQuantity(qty)}</span>
                </div>
            `;
        }

        // Add Pokedex icon for Smart Capture Mode
        if (smartwatchTier >= 3) {
            html += `
                <div onclick="window.showSmartCaptureMode(); document.getElementById('smartwatch-item-selection-popup').style.display = 'none';" style="width: 30px; height: 30px; background: rgba(0, 0, 0, 0.6); border: 2px solid #3498db; border-radius: 8px; position: relative; display: flex; align-items: center; justify-content: center; cursor: pointer;" title="Smart Capture Mode">
                    <img src="./Assets/Extra/IconPokedex.png" style="width: 80%; height: 80%; object-fit: contain;">
                </div>
            `;
        }
    } else if (type === 'threshold') {
        html += `
            <div style="display: flex; flex-direction: column; align-items: center; justify-content: center; padding: 5px; width: 120px;">
                <label style="color: white; font-size: 10px; margin-bottom: 8px; font-weight: bold;">
                    Auto-Heal: <span id="smartwatch-popup-threshold-val">${state.settings.autoPotionThreshold}%</span>
                </label>
                <div style="position: relative; width: 100%; height: 16px; display: flex; align-items: center;">
                    <input type="range" min="1" max="100" value="${state.settings.autoPotionThreshold}" id="smartwatch-popup-threshold-slider"
                        oninput="
                            let val = parseInt(this.value);
                            if (val > 90) { val = 90; this.value = 90; }
                            document.getElementById('smartwatch-popup-threshold-val').innerText = val + '%';
                            if (typeof window.setAutoPotionThreshold === 'function') window.setAutoPotionThreshold(val);
                            let cardVal = document.getElementById('smartwatch-threshold-val');
                            if (cardVal) cardVal.textContent = val + '%';
                        "
                        style="width: 100%; cursor: pointer; position: relative; z-index: 2; background: transparent; accent-color: #2ecc71; margin: 0;"
                    >
                    <!-- Background bar to show locked zone -->
                    <div style="position: absolute; top: 50%; left: 0; width: 100%; height: 4px; transform: translateY(-50%); background: #555; border-radius: 2px; z-index: 1; pointer-events: none;">
                        <div style="position: absolute; top: 0; left: 90%; width: 10%; height: 100%; background: #e74c3c; border-radius: 0 2px 2px 0;"></div>
                    </div>
                    <!-- 90% Marker Ball -->
                    <div style="position: absolute; top: 50%; left: 90%; transform: translate(-50%, -50%); width: 10px; height: 10px; background: #e74c3c; border-radius: 50%; z-index: 3; pointer-events: none; box-shadow: 0 0 2px rgba(0,0,0,0.5);"></div>
                </div>
            </div>
        `;
    }

    popup.innerHTML = html;
    popup.style.display = 'flex';
    popup.dataset.type = type;
    updateActiveItemsUI();
};

window.selectBattleActiveItem = function(type, idx) {
    if (type === 'potion') {
        state.settings.activePotionTier = idx;
    } else if (type === 'ball') {
        state.settings.activeBallTier = idx;
    }

    // Save state
    if (window.storageRef) {
        window.storageRef.save(state);
    }

    // Hide popup and update UI
    const popup = document.getElementById('smartwatch-item-selection-popup');
    if (popup) popup.style.display = 'none';

    updateActiveItemsUI();
};

// Close popup if clicked outside
document.addEventListener('click', (e) => {
    const popup = document.getElementById('smartwatch-item-selection-popup');
    if (popup && popup.style.display === 'flex') {
        const potionBtn = document.getElementById('smartwatch-potion-card');
        const ballBtn = document.getElementById('smartwatch-ball-card');
        const potionThresholdBtn = document.getElementById('smartwatch-potion-threshold-card');

        // Use e.composedPath() to check if the clicked element was inside the popup,
        // even if it was detached during the click event (like replacing innerHTML).
        const path = e.composedPath();
        const clickedInsidePopup = path.includes(popup);
        const clickedPotionBtn = potionBtn && path.includes(potionBtn);
        const clickedBallBtn = ballBtn && path.includes(ballBtn);
        const clickedPotionThresholdBtn = potionThresholdBtn && path.includes(potionThresholdBtn);

        if (!clickedInsidePopup && !clickedPotionBtn && !clickedBallBtn && !clickedPotionThresholdBtn) {
            popup.style.display = 'none';
        }
    }
});


export function updateBattleArena() {
    updateActiveItemsUI();

    const battleSystem = globals.battleSystem;
        const inGym = battleSystem && battleSystem.gymState && battleSystem.gymState.isActive;
    const inGymCombat = inGym && battleSystem.gymState.inCombat;
    const inMultiplayer = battleSystem && battleSystem.multiplayerState && battleSystem.multiplayerState.isActive;

    const combatArena = document.getElementById('combat-arena');
    if (combatArena) {
                if (inMultiplayer) {
            combatArena.style.backgroundImage = `url('./Assets/BG/BG-Cassino.jpg')`;
        } else if (inGymCombat) {
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
        } else if (state.currentRoute === 'Viridian Forest') {
            combatArena.style.backgroundImage = `url('./Assets/BG/BGForest.png')`;
        } else if (state.currentRoute === 'Route 1' || state.currentRoute === 'Victory Road') {
            combatArena.style.backgroundImage = `url('./Assets/BG/BGPlains.png')`;
        } else {
            combatArena.style.backgroundImage = `url('./Assets/BG/BG.png')`;
        }

        // Handle Viridian Forest BG sizing and positioning
        if ((state.currentRoute === 'Viridian Forest' || state.currentRoute === 'Route 1' || state.currentRoute === 'Victory Road') && !inGymCombat) {
            combatArena.style.backgroundSize = 'auto 100%';
            combatArena.style.backgroundRepeat = 'repeat-x';

            // Background sliding logic
            if (battleSystem && battleSystem.isSearching) {
                if (combatArena.dataset.slidingState !== 'searching') {
                    combatArena.dataset.slidingState = 'searching';
                    combatArena.style.transition = 'none';
                    if (combatArena.dataset.bgAnimationInterval) {
                        clearInterval(parseInt(combatArena.dataset.bgAnimationInterval));
                    }
                    let pos = parseFloat(combatArena.style.backgroundPositionX) || 0;
                    combatArena.dataset.bgAnimationInterval = setInterval(() => {
                        const gameSpeed = (state && state.settings && state.settings.gameSpeed) ? state.settings.gameSpeed : 1;
                        const slideDelay = 1000 / gameSpeed;
                        const moveDistance = 4.0625; // Reduced by 75%
                        const ticksPerSlide = slideDelay / 33;
                        const pctPerTick = moveDistance / ticksPerSlide;
                        pos += pctPerTick;
                        combatArena.style.backgroundPositionX = `${pos}%`;
                    }, 33);
                }
            } else if (battleSystem && battleSystem.isSliding) {
                if (combatArena.dataset.slidingState !== 'sliding') {
                    combatArena.dataset.slidingState = 'sliding';
                    if (combatArena.dataset.bgAnimationInterval) {
                        clearInterval(parseInt(combatArena.dataset.bgAnimationInterval));
                        combatArena.dataset.bgAnimationInterval = '';
                    }
                    let pos = parseFloat(combatArena.style.backgroundPositionX) || 0;
                    combatArena.style.transition = `background-position-x ${battleSystem.slideDuration}ms linear`;

                    // Trigger reflow
                    void combatArena.offsetWidth;
                    requestAnimationFrame(() => {
                        requestAnimationFrame(() => {
                            combatArena.style.backgroundPositionX = `${pos + 4.0625}%`;
                        });
                    });
                }
            } else {
                if (combatArena.dataset.slidingState !== 'idle') {
                    combatArena.dataset.slidingState = 'idle';
                    if (combatArena.dataset.bgAnimationInterval) {
                        clearInterval(parseInt(combatArena.dataset.bgAnimationInterval));
                        combatArena.dataset.bgAnimationInterval = '';
                    }
                    // Keep the current position but remove transition
                    combatArena.style.transition = 'none';
                }
            }
        } else {
            // Reset to default
            combatArena.style.backgroundSize = '100% 100%';
            combatArena.style.backgroundPositionX = 'center';
            combatArena.style.transition = 'none';
            if (combatArena.dataset.bgAnimationInterval) {
                clearInterval(parseInt(combatArena.dataset.bgAnimationInterval));
                combatArena.dataset.bgAnimationInterval = '';
            }
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


        const glassTier = state.stats?.upgrades?.glassTier || 0;
            if (hpContainerEnemy) hpContainerEnemy.style.display = glassTier >= 1 ? 'flex' : 'none';

            const enemyDataModals = document.getElementById('enemy-data-modals');
            if (enemyDataModals) {
                enemyDataModals.style.display = glassTier >= 3 ? 'flex' : 'none';

                const levelEl = document.getElementById('enemy-battle-level');
                if (levelEl) {
                    levelEl.innerText = `Lv. ${enemy.level}`;
                    levelEl.style.display = glassTier >= 3 ? 'block' : 'none';
                }

                const qtierEl = document.getElementById('enemy-battle-qtier');
                if (qtierEl && enemy.quality) {
                    qtierEl.innerText = `Q: ${enemy.quality.toFixed(2)}`;
                    qtierEl.style.display = glassTier >= 4 ? 'block' : 'none';
                }

                const sumivEl = document.getElementById('enemy-battle-sumiv');
                if (sumivEl && enemy.ivs) {
                    const sumIV = enemy.ivs.hp + enemy.ivs.atk + enemy.ivs.def + enemy.ivs.spa + enemy.ivs.spd + enemy.ivs.spe;
                    sumivEl.innerText = `SumIV: ${sumIV}`;
                    sumivEl.style.display = glassTier >= 5 ? 'block' : 'none';
                }
            }

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

            const elEnemySide = document.getElementById('enemy-side');

            const enemySpriteWrapper = document.getElementById('enemy-sprite-wrapper');
            const enemyPokemonSprite = document.getElementById('enemy-pokemon-sprite');
            if (enemySpriteWrapper && enemyPokemonSprite) {
                let enemyId = enemy.isDisguisedDitto ? 132 : enemy.id;
                let spriteSuffix = enemy.qualityName === 'Shiny' ? '_shiny_Clean.png' : '_Clean.png';
                enemyPokemonSprite.src = `Assets/Pokemon Sprites/Clean/${enemyId}${spriteSuffix}`;

                const isFlying = enemy.types && (enemy.types.includes('Flying') || enemy.types.includes('Wind'));
                enemySpriteWrapper.style.justifyContent = isFlying ? 'flex-start' : 'flex-end';
                enemySpriteWrapper.style.alignItems = 'flex-start';
                enemyPokemonSprite.style.transform = 'none';

                if (battleSystem.isSliding) {
                    enemyPokemonSprite.classList.add('sliding-idle-anim');
                    // Calculate and set animation duration based on slide duration (default 500ms cycle)
                    const numCycles = Math.ceil(battleSystem.slideDuration / 500);
                    const newDuration = battleSystem.slideDuration / numCycles;
                    enemyPokemonSprite.style.animationDuration = `${newDuration}ms`;
                } else {
                    enemyPokemonSprite.classList.remove('sliding-idle-anim');
                    enemyPokemonSprite.style.animationDuration = '';
                }
            }

            if (elEnemySide) {
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
                const playerSpriteWrapper = document.getElementById('player-sprite-wrapper');
                const playerPokemonSprite = document.getElementById('player-pokemon-sprite');
                if (playerSpriteWrapper && playerPokemonSprite) {
                    let spriteSuffix = leader.qualityName === 'Shiny' ? '_shiny_Clean.png' : '_Clean.png';
                    playerPokemonSprite.src = `Assets/Pokemon Sprites/Clean/${leader.id}${spriteSuffix}`;

                    const isFlying = leader.types && (leader.types.includes('Flying') || leader.types.includes('Wind'));
                    playerSpriteWrapper.style.justifyContent = isFlying ? 'flex-start' : 'flex-end';
                    playerSpriteWrapper.style.alignItems = 'flex-end';
                    playerPokemonSprite.style.transform = 'scaleX(-1)';

                    if (battleSystem.isSliding) {
                        playerPokemonSprite.classList.add('sliding-idle-anim-flipped');
                        // Calculate and set animation duration based on slide duration (default 500ms cycle)
                        const numCycles = Math.ceil(battleSystem.slideDuration / 500);
                        const newDuration = battleSystem.slideDuration / numCycles;
                        playerPokemonSprite.style.animationDuration = `${newDuration}ms`;
                    } else {
                        playerPokemonSprite.classList.remove('sliding-idle-anim-flipped');
                        playerPokemonSprite.style.animationDuration = '';
                    }
                }

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

                if (leader.currentHp <= 0) {
                    elPlayerSide.style.transition = 'opacity 2s linear';
                    elPlayerSide.style.opacity = '0';
                } else {
                    elPlayerSide.style.transition = 'none';
                    elPlayerSide.style.opacity = '1';
                }
            }
        } else if (battleSystem && battleSystem.isSearching) {
            const hpContainerEnemy = document.getElementById('enemy-battle-hp-container');
            if (hpContainerEnemy) hpContainerEnemy.style.display = 'none';
            const enemyDataModals = document.getElementById('enemy-data-modals');
            if (enemyDataModals) enemyDataModals.style.display = 'none';

            const elEnemySide = document.getElementById('enemy-side');
            if (elEnemySide) {
                elEnemySide.style.transition = 'none';
                elEnemySide.style.left = '100%';
                elEnemySide.style.opacity = '1';
            }

            const leader = state.party[0];
            const elPlayerSide = document.getElementById('player-side');
            if (leader && elPlayerSide) {
                const playerSpriteWrapper = document.getElementById('player-sprite-wrapper');
                const playerPokemonSprite = document.getElementById('player-pokemon-sprite');
                if (playerSpriteWrapper && playerPokemonSprite) {
                    let spriteSuffix = leader.qualityName === 'Shiny' ? '_shiny_Clean.png' : '_Clean.png';
                    playerPokemonSprite.src = `Assets/Pokemon Sprites/Clean/${leader.id}${spriteSuffix}`;

                    const isFlying = leader.types && (leader.types.includes('Flying') || leader.types.includes('Wind'));
                    playerSpriteWrapper.style.justifyContent = isFlying ? 'flex-start' : 'flex-end';
                    playerSpriteWrapper.style.alignItems = 'flex-end';
                    playerPokemonSprite.style.transform = 'scaleX(-1)';
                    playerPokemonSprite.classList.remove('sliding-idle-anim-flipped');
                    playerPokemonSprite.style.animationDuration = '';
                }

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

                if (leader.currentHp <= 0) {
                    elPlayerSide.style.transition = 'opacity 2s linear';
                    elPlayerSide.style.opacity = '0';
                } else {
                    elPlayerSide.style.transition = 'none';
                    elPlayerSide.style.opacity = '1';
                }
            } else {
                const hpContainerPlayer = document.getElementById('player-battle-hp-container');
                if (hpContainerPlayer) hpContainerPlayer.style.display = 'none';
            }
        } else {
             const elEnemySide = document.getElementById('enemy-side');
             if (elEnemySide) elEnemySide.style.left = '100%';
             const hpContainerEnemy = document.getElementById('enemy-battle-hp-container');
             if (hpContainerEnemy) hpContainerEnemy.style.display = 'none';
             const enemyDataModals = document.getElementById('enemy-data-modals');
             if (enemyDataModals) enemyDataModals.style.display = 'none';
             const hpContainerPlayer = document.getElementById('player-battle-hp-container');
             if (hpContainerPlayer) hpContainerPlayer.style.display = 'none';

             const enemyPokemonSprite = document.getElementById('enemy-pokemon-sprite');
             if (enemyPokemonSprite) {
                 enemyPokemonSprite.classList.remove('sliding-idle-anim');
                 enemyPokemonSprite.style.animationDuration = '';
             }

             const playerPokemonSprite = document.getElementById('player-pokemon-sprite');
             if (playerPokemonSprite) {
                 playerPokemonSprite.classList.remove('sliding-idle-anim-flipped');
                 playerPokemonSprite.style.animationDuration = '';
             }
        }
    }



/* removed TYPE_COLORS */


export function triggerDefeatAnimation(activeEncounter, ballResult, captureCallback) {
    const arena = document.getElementById('combat-arena');
    const elEnemySide = document.getElementById('enemy-side');
    const mainViewWindow = document.getElementById('main-view-window');
    const elPlayerSide = document.getElementById('player-side');

    if (elPlayerSide) {
        elPlayerSide.style.zIndex = '60'; // Ensure player is above the sliding out enemy
    }

    if (!arena || !elEnemySide) {
        captureCallback();
        return;
    }

    // Duplicate the enemy sprite wrapper for the defeat animation
    const originalSpriteWrapper = document.getElementById('enemy-sprite-wrapper');
    if (!originalSpriteWrapper) {
        captureCallback();
        return;
    }

    const cloneWrapper = originalSpriteWrapper.cloneNode(true);
    // Remove the cloned HP container so it doesn't show in the duplicate
    const clonedHpContainer = cloneWrapper.querySelector('#enemy-battle-hp-container');
    if (clonedHpContainer) {
        clonedHpContainer.remove();
    }

    // Create a new container to hold the cloned sprite for absolute positioning in arena
    const defeatContainer = document.createElement('div');
    defeatContainer.style.position = 'absolute';

    // Transfer any floating damage nodes to the clone wrapper so they slide out with it
    const floatingDamages = elEnemySide.querySelectorAll('.damage-text-node');
    floatingDamages.forEach(node => {
        cloneWrapper.appendChild(node);
    });

    defeatContainer.style.bottom = '20%';
    defeatContainer.style.left = '35%';
    defeatContainer.style.display = 'flex';
    defeatContainer.style.alignItems = 'center';
    defeatContainer.style.width = 'max-content';
    defeatContainer.style.height = 'max-content';
    defeatContainer.style.zIndex = '10'; // Behind player sprite

    // Copy frame border if we need it to look identical (optional but safe)
    const frameBorder = elEnemySide.querySelector('img[alt="Enemy Frame"]');
    if (frameBorder) {
        const frameClone = frameBorder.cloneNode(true);
        defeatContainer.appendChild(frameClone);
    }

    // Add the cloned sprite wrapper
    cloneWrapper.style.position = 'absolute';
    cloneWrapper.style.top = '0';
    cloneWrapper.style.left = '0';
    cloneWrapper.style.width = '100%';
    cloneWrapper.style.height = '100%';
    defeatContainer.appendChild(cloneWrapper);

    // Move any existing floating damage texts to the defeat container so they slide out
    const damageNodes = elEnemySide.querySelectorAll('.damage-text-node');
    damageNodes.forEach(node => {
        defeatContainer.appendChild(node);
    });

    // Ensure the container holding all battle sprites acts as parent, or arena if fallback
    const spritesContainer = document.getElementById('battle-sprites-container');
    if (spritesContainer) {
        spritesContainer.appendChild(defeatContainer);
    } else {
        arena.appendChild(defeatContainer);
    }

    // Force reflow
    void defeatContainer.offsetWidth;

    // Removing manual override of enemy-side to prevent conflict with generateEncounter's isSliding

    // Briefly hide the original HP container to prevent visual flash before next spawn
    const hpContainerEnemy = document.getElementById('enemy-battle-hp-container');
    const enemyDataModals = document.getElementById('enemy-data-modals');
    if (hpContainerEnemy) {
        hpContainerEnemy.style.opacity = '0';
        setTimeout(() => {
            if (hpContainerEnemy) hpContainerEnemy.style.opacity = '1';
        }, 500);
    }
    if (enemyDataModals) {
        enemyDataModals.style.opacity = '0';
        setTimeout(() => {
            if (enemyDataModals) enemyDataModals.style.opacity = '1';
        }, 500);
    }

    // Calculate ball size based on 15% of the main view window height
    let ballSizePx = 50; // fallback
    if (mainViewWindow) {
        ballSizePx = mainViewWindow.offsetHeight * 0.15;
    }

    // Animation variables
    const slideDuration = 5000;
    const captureCheckDelay = 3000;
    const targetLeft = `-${ballSizePx}px`; // target left: - ball width

    // 1. Create Pokeball if used
    let ball = null;
    let shakeInterval = null;
    if (ballResult && ballResult.used && ballResult.ballName) {
        ball = document.createElement('img');
        ball.src = `Assets/Items/Balls/${ballResult.ballName}.png`;
        ball.style.position = 'absolute';

        // Find the inner wrapper if it exists (usually the div inside #enemy-sprite-wrapper),
        // fallback to cloneWrapper itself to guarantee it renders safely.
        const innerWrapper = cloneWrapper.querySelector('div');
        const attachTarget = innerWrapper ? innerWrapper : cloneWrapper;

        // Ensure ball is relative to the pokemon sprite specifically (the div holding the img)
        if (innerWrapper) {
            const img = innerWrapper.querySelector('img');
            if (img) {
                // Ball goes on top of pokemon image
                attachTarget.style.position = 'relative';

                // Usually the img itself acts as the primary content, but attachTarget is the wrapper.
                // Centering inside attachTarget:
                ball.style.left = '50%';
                ball.style.top = '50%';
            } else {
                ball.style.left = '50%';
                ball.style.top = '50%';
            }
        } else {
            ball.style.left = '50%';
            ball.style.top = '50%';
        }

        ball.style.transform = 'translate(-50%, -50%)';
        ball.style.width = `${ballSizePx}px`;
        ball.style.height = `${ballSizePx}px`;
        ball.style.objectFit = 'contain';
        ball.style.zIndex = '51';
        attachTarget.appendChild(ball);

        // Add shake animation
        let shakeCount = 0;
        shakeInterval = setInterval(() => {
            shakeCount++;
            let rotation = (shakeCount % 2 === 0) ? 15 : -15;
            if (shakeCount % 10 === 0) rotation = 0; // brief pause
            ball.style.transform = `translate(-50%, -50%) rotate(${rotation}deg)`;
        }, 150);
    }

    // Force reflow again if ball added
    if (ball) void ball.offsetWidth;

    // Timeline Animations
    defeatContainer.style.transition = `left ${slideDuration}ms linear`;
    defeatContainer.style.left = targetLeft;

    // Pokemon Fade and Shrink Animation
    const pokemonSprite = cloneWrapper.querySelector('img:not([src*="Balls"])');
    if (pokemonSprite) {
        pokemonSprite.style.transition = 'opacity 2000ms linear, transform 2000ms linear';
        pokemonSprite.style.transformOrigin = 'center center';
        pokemonSprite.style.opacity = '0';
        pokemonSprite.style.transform = 'scale(0.3)';
    }


    // Shrink any floating damages too, so they collapse with the pokemon
    const clonedDamages = cloneWrapper.querySelectorAll('.damage-text-node');

    const clonedModals = cloneWrapper.querySelector('#enemy-data-modals');
    if (clonedModals) {
        clonedModals.style.transition = 'all 2000ms linear';
        clonedModals.style.transformOrigin = 'center center';
        clonedModals.style.left = '50%';
        clonedModals.style.opacity = '0';
        clonedModals.style.transform = 'translate(-50%, -50%) scale(0)';

        setTimeout(() => {
            if (clonedModals && clonedModals.parentNode) {
                clonedModals.parentNode.removeChild(clonedModals);
            }
        }, 2000);
    }

    clonedDamages.forEach(dmg => {
        dmg.style.transition = 'opacity 2000ms linear, transform 2000ms linear';
        dmg.style.transformOrigin = 'center center';
        dmg.style.opacity = '0';
        // Combining with its existing translate
        dmg.style.transform = 'translate(-50%, -50%) scale(0.3)';
    });


    let callbackFired = false;

    // 2. Change ball sprite at 3 seconds and trigger capture logic
    setTimeout(() => {
        if (ball) {
            clearInterval(shakeInterval);
            ball.style.transform = 'translate(-50%, -50%)'; // Reset rotation
            if (ballResult.caught) {
                ball.src = `Assets/Items/Balls/${ballResult.ballName}Y.png`;
            } else {
                ball.src = `Assets/Items/Balls/${ballResult.ballName}N.png`;
            }
        }

        // Trigger capture callback early to process game logic, UI handles itself independently
        if (!callbackFired) {
            callbackFired = true;
            captureCallback();
        }
    }, captureCheckDelay);

    // 3. Remove clone wrapper after animation
    setTimeout(() => {
        if (defeatContainer && defeatContainer.parentNode) {
            defeatContainer.parentNode.removeChild(defeatContainer);
        }
        // Safety callback fallback
        if (!callbackFired) {
            callbackFired = true;
            captureCallback();
        }
    }, slideDuration);
}






export function showDamage(target, amount, isCrit, moveName = '', moveType = 'Normal', effectiveness = 1) {
    if (target === 'enemy') {
        const glassTier = state.stats?.upgrades?.glassTier || 0;
        if (glassTier < 2) return;
    }
    const battleSystem = globals.battleSystem;
    let containerId = target === 'player' ? 'player-side' : 'enemy-side';

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


    dmgNode.classList.add('floating-damage');

    dmgNode.style.position = 'absolute';
    dmgNode.style.color = typeColor;
    dmgNode.style.fontSize = isCrit ? '24px' : '18px';
    dmgNode.style.fontWeight = 'bold';
    dmgNode.style.textShadow = '1px 1px 2px black';
    dmgNode.style.pointerEvents = 'none';
    dmgNode.style.transition = 'all 1s ease-out';
    dmgNode.style.zIndex = '100';
    dmgNode.style.whiteSpace = 'nowrap';

    // Position relatively to the parent container of the image using percentages
    dmgNode.style.left = '50%'; // Center horizontally
    dmgNode.style.top = '20%'; // Top of the image (relative to sprite container)
    dmgNode.style.transform = 'translate(-50%, -50%)'; // Ensure exact centering

    img.appendChild(dmgNode);

    // Animate up and fade out
    setTimeout(() => {
        dmgNode.style.top = '0%'; // Float up relative to the container
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

    let attackerId = targetSide === 'player' ? (isGym ? 'gym-enemy-sprite' : 'enemy-side') : (isGym ? 'gym-player-sprite' : 'player-side');
    if (!document.getElementById(attackerId)) attackerId = targetSide === 'player' ? 'enemy-side' : 'player-side';
    let defenderId = targetSide === 'player' ? (isGym ? 'gym-player-sprite' : 'player-side') : (isGym ? 'gym-enemy-sprite' : 'enemy-side');
    if (!document.getElementById(defenderId)) defenderId = targetSide === 'player' ? 'player-side' : 'enemy-side';

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
                 let tId = gym.trainers[tIdx].team[pIdx].id;
                 let pd = state.config.pokemonData.find(p => p.id === tId);
                 if (pd) atkTypes = pd.types || [];
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

    // Determine the exact clean sprites for precise projectile start and end coordinates
    // We look for the pokemon image inside the wrapper, specifically skipping the FrameBorder img
    const atkImgEl = atkImg ? atkImg.querySelector('img:not([src*="FrameBorder"])') : null;
    const defImgEl = defImg ? defImg.querySelector('img:not([src*="FrameBorder"])') : null;

    const atkSpriteImg = atkImgEl || atkImg;
    const defSpriteImg = defImgEl || defImg;

    const atkRect = atkSpriteImg.getBoundingClientRect();
    const defRect = defSpriteImg.getBoundingClientRect();
    const container = document.getElementById('battle-sprites-container') || document.body;

    let containerRect = container.getBoundingClientRect();
    let scaleX = 1;
    let scaleY = 1;

    if (container.offsetWidth) {
        scaleX = containerRect.width / container.offsetWidth;
        scaleY = containerRect.height / container.offsetHeight;
    }

    // Instead of vh, use the scale of the images to determine projectile size roughly
    const projHeight = (atkRect.height / scaleY) * 0.07;
    const projWidth = projHeight * 2;

    const atkCenterX = atkRect.left + atkRect.width / 2;
    const atkCenterY = atkRect.top + atkRect.height / 2;
    const startX = container === document.body ? atkCenterX : (atkCenterX - containerRect.left) / scaleX;
    const startY = container === document.body ? atkCenterY : (atkCenterY - containerRect.top) / scaleY;

    const defCenterX = defRect.left + defRect.width / 2;
    const defCenterY = defRect.top + defRect.height / 2;
    const endX = container === document.body ? defCenterX : (defCenterX - containerRect.left) / scaleX;
    const endY = container === document.body ? defCenterY : (defCenterY - containerRect.top) / scaleY;

    // Create projectile
    const proj = document.createElement('div');
    proj.style.position = container === document.body ? 'fixed' : 'absolute';
    proj.style.width = projWidth + 'px';
    proj.style.height = projWidth + 'px';
    proj.style.backgroundColor = color;
    proj.style.borderRadius = '50%';
    proj.style.boxShadow = `0 0 ${projHeight}px ${projHeight/2}px ${color}`;
    proj.style.zIndex = '999';
    proj.style.pointerEvents = 'none';
    proj.style.transform = 'translate(-50%, -50%)';

    proj.style.left = startX + 'px';
    proj.style.top = startY + 'px';

    container.appendChild(proj);

    // Animate projectile
    proj.style.transition = `all ${duration}ms linear`;

    // Trigger reflow
    proj.getBoundingClientRect();

    proj.style.left = endX + 'px';
    proj.style.top = endY + 'px';

    setTimeout(() => {
        if (proj.parentElement) proj.parentElement.removeChild(proj);

        // Splash Effect
        const splash = document.createElement('div');
        splash.style.position = container === document.body ? 'fixed' : 'absolute';

        // Center the 0x0 div on the target
        splash.style.left = endX + 'px';
        splash.style.top = endY + 'px';
        splash.style.width = '0px';
        splash.style.height = '0px';
        splash.style.backgroundColor = color; // 100% solid color
        splash.style.borderRadius = '50%';
        splash.style.boxShadow = `0 0 ${projHeight}px ${projHeight/2}px ${color}`;
        splash.style.zIndex = '999';
        splash.style.pointerEvents = 'none';
        splash.style.transform = 'translate(-50%, -50%)';

        // Phase 1: Grow to 50% of sprite height
        splash.style.transition = `all ${duration * 0.3}ms linear`;

        container.appendChild(splash);

        // Trigger reflow
        splash.getBoundingClientRect();

        // Expand to 50% height of sprite from the center
        const sSize1 = (defRect.height / scaleY) * 0.50;
        splash.style.width = sSize1 + 'px';
        splash.style.height = sSize1 + 'px';
        splash.style.opacity = '1';

        // Phase 2: Grow to 100% height and fade out
        setTimeout(() => {
            splash.style.transition = `all ${duration * 0.3}ms linear`;
            const sSize2 = (defRect.height / scaleY) * 1.0;
            splash.style.width = sSize2 + 'px';
            splash.style.height = sSize2 + 'px';
            splash.style.opacity = '0';
        }, duration * 0.3);

        setTimeout(() => {
            if (splash.parentElement) splash.parentElement.removeChild(splash);
        }, duration * 0.6);

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

    }, duration);
}

export function showLoot(lootItems) {
    const container = document.getElementById('battle-loot-container');
    if (!container) return;

    const keys = Object.keys(lootItems);
    if (keys.length === 0) return;

    let html = '';
    for (let i = 0; i < keys.length; i++) {
        let itemName = keys[i];
        const count = lootItems[itemName];
        const isMissed = itemName.endsWith('_missed');
        if (isMissed) {
            itemName = itemName.replace('_missed', '');
        }

        let imgFolder = 'Balls';
        if (itemName.includes('Potion')) imgFolder = 'Potions';
        else if (itemName.includes('Stone')) imgFolder = 'Stones';
        else if (VITAMINS.includes(itemName)) imgFolder = 'Vitamins';

        html += `
            <div style="width: 30px; height: 30px; background: rgba(0, 0, 0, 0.6); border: 1px solid #f1c40f; border-radius: 4px; position: relative; display: flex; align-items: center; justify-content: center;">
                <img src="Assets/Items/${imgFolder}/${itemName}.png" style="width: 80%; height: 80%; object-fit: contain;">
                ${isMissed ? `<img src="Assets/Extra/No.png" style="position: absolute; top: 0; left: 0; width: 100%; height: 100%; object-fit: contain; z-index: 2;">` : ''}
            </div>
        `;
    }

    const row = document.createElement('div');
    row.style.display = 'flex';
    row.style.gap = '5px';
    row.style.transition = 'opacity 0.5s ease-in-out';
    row.style.opacity = '1';
    row.innerHTML = html;

    container.prepend(row);
    container.style.display = 'flex';
    container.style.opacity = '1';

    // Keep maximum 5 rows visible
    while (container.children.length > 5) {
        container.removeChild(container.lastChild);
    }

    setTimeout(() => {
        row.style.opacity = '0';
        setTimeout(() => {
            if (row.parentElement) {
                row.parentElement.removeChild(row);
            }
            if (container.children.length === 0) {
                container.style.display = 'none';
            }
        }, 500); // Wait for transition
    }, 5000);
}