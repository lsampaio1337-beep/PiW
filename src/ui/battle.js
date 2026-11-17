import { VITAMINS } from "../constants.js";
import { TYPE_COLORS } from '../ui.js';
import { state, globals } from '../state.js';
import { getCapacity } from '../mathEngine.js';
import { getTrimmedSpriteUrl, precacheRouteSprites } from '../utils/sprites.js';

let lastPrecachedRoute = null;




function updateActiveItemsUI() {
    const smartwatchTier = state.stats?.upgrades?.smartwatchTier || 0;

    const potionImg = document.getElementById('smartwatch-potion-img');
    const potionCount = document.getElementById('smartwatch-potion-count');
    const potionCard = document.getElementById('smartwatch-potion-card');

    const popup = document.getElementById('smartwatch-item-selection-popup');

    if (potionImg && potionCount && potionCard) {
        potionCard.style.display = smartwatchTier >= 2 ? 'flex' : 'none';
        const potionCfg = (state.settings?.activePotionTier >= 0)
            ? state.config?.balance?.items?.potions?.[state.settings.activePotionTier]
            : null;
        if (potionCfg) {
            potionCard.style.border = '2px solid #2ecc71'; // Green
            const rawName = potionCfg.name;
            const potionName = rawName === 'Big' ? 'Big Potion' : rawName;
            potionImg.src = `./Assets/Items/Potions/${potionName}.png`;
            potionCount.textContent = formatActiveItemQuantity(state.backpack?.potions?.[potionName] || 0);
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
        const ballCfg = (state.settings?.activeBallTier >= 0)
            ? state.config?.balance?.items?.pokeballs?.[state.settings.activeBallTier]
            : null;
        if (ballCfg) {
            ballCard.style.border = '2px solid #2ecc71'; // Green
            const ballName = ballCfg.name;
            ballImg.src = `./Assets/Items/Balls/${ballName}.png`;
            ballCount.textContent = formatActiveItemQuantity(state.backpack?.pokeballs?.[ballName] || 0);
            ballImg.style.display = 'block';
            ballCount.style.display = 'block';
        } else {
            ballCard.style.border = '2px solid #2ecc71'; // Green
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
                    <img src="./Assets/Extra/Icons/IconPokedex.png" style="width: 80%; height: 80%; object-fit: contain;">
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

    setSafeHTML(popup, html);
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

/** Look up Pokemon config using O(1) pokemonMap when available, falling back to pokemonData. */
function findPokemonConfig(id) {
    if (!state.config) return null;
    if (state.config.pokemonMap) {
        return state.config.pokemonMap.get(Number(id)) || state.config.pokemonMap.get(id);
    }
    return state.config.pokemonData ? state.config.pokemonData.find(p => p.id === id) : null;
}

/** Safely replace an element's contents using DOMParser. */
function setSafeHTML(element, html) {
    if (!element || typeof element.replaceChildren !== 'function') return;
    const doc = new DOMParser().parseFromString(html, 'text/html');
    element.replaceChildren(...doc.body.childNodes);
}

const PLAINS_ROUTES = ["Route 1","Route 2","Route 3","Route 4","Route 24","Route 25","Route 9","Route 10","Power Plant","Route 5","Fighting Dojo","Route 7","Route 6","Route 8","Route 11","Route 12","Cycling Road","Route 13","Route 14","Route 15","Pokémon Mansion","Pokemon Mansion","Trade With Friends Hub","Route 22","Route 23","Victory Road"];
const WATER_ROUTES = ["Small Fishing Spot","Sea Routes","Seafoam Islands","Big Fishing Spot"];
const CAVE_ROUTES = ["Mount Moon","Cerulean Cave","Pokémon Tower","Pokemon Tower","Digglett Cave","Rock Tunnel","Fossil Revival Lab","Temporal Sanctuary Spot","Mount Silver Apex"];
const SCROLLING_ROUTES = ["Viridian Forest"].concat(PLAINS_ROUTES, WATER_ROUTES, CAVE_ROUTES);


function updateGymBackground(combatArena, state, battleSystem) {
    const gym = battleSystem.gymState.gym;
    if (gym.name === "Kanto Pokemon League") {
        const trainerIndex = battleSystem.gymState.currentTrainerIndex;
        const trainerBGs = [
            'BG-Elite4-1Lorelei.png',
            'BG-Elite4-2Bruno.png',
            'BG-Elite4-3Agatha.png',
            'BG-Elite4-4Lance.png',
            'BG-Elite4-5Champion.png'
        ];
        const bgImage = trainerBGs[trainerIndex] || 'BattleMode/Test.png';
        combatArena.style.backgroundImage = `url('./Assets/BG/${bgImage}')`;
    } else {
        // Remove previous dynamic gym bg if it exists
        const existingDynamic = document.getElementById('dynamic-gym-bg-arena');
        if (existingDynamic) {
            existingDynamic.remove();
        }

        if (state.config.gymAssets && state.config.gymAssets[gym.leader]) {
            const assetConfig = state.config.gymAssets[gym.leader];
            const spritePath = `./Assets/Gym/GymLeaders/${assetConfig.sprite}`;
            const bgPath = `./Assets/Gym/BG/${assetConfig.background}`;

            const dynamicBg = document.createElement('div');
            dynamicBg.id = 'dynamic-gym-bg-arena';
            dynamicBg.style.position = 'absolute';
            dynamicBg.style.top = '0';
            dynamicBg.style.left = '0';
            dynamicBg.style.width = '100%';
            dynamicBg.style.height = '100%';
            dynamicBg.style.zIndex = '0'; // Behind combat elements but above raw background
            dynamicBg.style.backgroundImage = `url('${bgPath}')`;
            dynamicBg.style.backgroundSize = '100% 100%';
            dynamicBg.style.overflow = 'hidden';

            const imgNode = document.createElement('img');
            imgNode.src = spritePath;
            imgNode.style.position = 'absolute';
            imgNode.style.left = `${assetConfig.position.rel_x * 100}%`;
            imgNode.style.top = `${assetConfig.position.rel_y * 100}%`;
            imgNode.style.width = `${(assetConfig.size.px_width / 1800) * 100}%`;
            imgNode.style.transform = `rotate(${assetConfig.tilt.angle_deg}deg)`;
            imgNode.style.transformOrigin = assetConfig.tilt.origin;
            imgNode.style.pointerEvents = 'none';

            // Clear any existing children just in case, though it should be empty
            dynamicBg.replaceChildren(imgNode);

            combatArena.style.backgroundImage = 'none';
            combatArena.style.position = 'relative'; // Ensure relative positioning
            combatArena.insertBefore(dynamicBg, combatArena.firstChild);
        } else {
            const gymIndex = battleSystem.gymState.gymIndex;
            const gymBGs = [
                'BG-Gym-1-Pewter-Rock.png',
                'BG-Gym-2-Cerulean-Water.png',
                'BG-Gym-3-Vermilion-Electric.png',
                'BG-Gym-4-Celadon-Grass.png',
                'BG-Gym-5-Fuchsia-Poison.png',
                'BG-Gym-6-Saffron-Psychic.png',
                'BG-Gym-7-Cinnabar-Fire.png',
                'BG-Gym-8-Viridian-Ground.png',
                'IndigoPlateau.png',
                '../Gym/BG/BG_Gym_Flying.png',
                '../Gym/BG/BG_Gym_Bug.png',
                '../Gym/BG/BG_Gym_Normal.png',
                '../Gym/BG/BG_Gym_Ghost.png',
                '../Gym/BG/BG_Gym_Fighting.png',
                '../Gym/BG/BG_Gym_Steel.png',
                '../Gym/BG/BG_Gym_Ice.png',
                '../Gym/BG/BG_Gym_Dragon.png'
            ];
            const bgImage = gymBGs[gymIndex] || 'BattleMode/Test.png';
            combatArena.style.backgroundImage = `url('./Assets/BG/${bgImage}')`;
        }
    }
}

function getRouteBackgroundImage(route) {
    if (!route) return 'url(\'./Assets/BG/BattleMode/Test.png\')';
    route = route.replace(/\s*\([^)]+\)$/, '');

    if (route.toLowerCase().includes('safari')) {
        return `url('./Assets/BG/SafariZone.png')`;
    }
    if (route.startsWith('Celadon Casino')) {
        return `url('./Assets/BG/Casino.png')`;
    }
    if (route === 'Viridian Forest') {
        return `url('./Assets/BG/BattleMode/Forest.png')`;
    }
    if (PLAINS_ROUTES.includes(route)) {
        return `url('./Assets/BG/BattleMode/Plains.png')`;
    }
    if (WATER_ROUTES.includes(route)) {
        return `url('./Assets/BG/BattleMode/Water.png')`;
    }
    if (CAVE_ROUTES.includes(route)) {
        return `url('./Assets/BG/BattleMode/Cave.png')`;
    }

    // Determine region-specific or time-of-day logic here in the future
    return `url('./Assets/BG/BattleMode/Test.png')`;
}

function updateBattleBackground(combatArena, state, battleSystem, inGymCombat, inMultiplayer) {

    // Ensure we clean up dynamic gym background anytime we update backgrounds, except when handling gym combat explicitly
    if (!inGymCombat) {
        const existingDynamic = document.getElementById('dynamic-gym-bg-arena');
        if (existingDynamic) existingDynamic.remove();
    }

    if (inMultiplayer) {
        combatArena.style.backgroundImage = `url('./Assets/BG/Casino.png')`;
    } else if (inGymCombat) {
        updateGymBackground(combatArena, state, battleSystem);
    } else {
        combatArena.style.backgroundImage = getRouteBackgroundImage((state.currentRoute || "").replace(/\s*\([^)]+\)$/, ""));
    }
}

function updateBackgroundSliding(combatArena, state, battleSystem, inGymCombat) {

    let displayRoute = (state.currentRoute || '').replace(/\s*\([^)]+\)$/, '');
    if (SCROLLING_ROUTES.includes(displayRoute) && !inGymCombat) {
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
                    // Ensure the slideDelay used here matches what the battle system would use for slideDuration
                    // It uses exactly 1000 / gameSpeed
                    const slideDelay = battleSystem.searchDuration || (1000 / gameSpeed);
                    const moveDistance = 65;
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
                        combatArena.style.backgroundPositionX = `${pos + 65}%`;
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

function getHpColor(pct) {
    if (pct <= 0) return '#000000';
    if (pct < 25) return '#e74c3c';
    if (pct < 50) return '#e67e22';
    if (pct < 75) return '#f1c40f';
    return '#2ecc71';
}

function updateHpBarUI(hpBar, hpText, hpPct, currentHp, maxHp) {
    if (!hpBar || !hpText || !hpPct) return;
    const pct = Math.min(100, (currentHp / maxHp) * 100);
    hpBar.style.width = `${pct}%`;
    hpBar.style.background = getHpColor(pct);
    hpText.innerText = `${Math.floor(currentHp)}/${maxHp}`;
    hpPct.innerText = `${Math.floor(pct)}%`;
}

const BATTLE_SPRITE_SCALE = 0.43;
const BATTLE_SPRITE_MIN_HEIGHT = 29;
const BATTLE_SPRITE_FALLBACK_HEIGHT = 52;

export function getTargetSpriteHeight(pokemonId, spriteSizes) {
    if (!spriteSizes || pokemonId === undefined || pokemonId === null) {
        return BATTLE_SPRITE_FALLBACK_HEIGHT;
    }
    const rawStr = String(pokemonId);
    const dotIdx = rawStr.indexOf('.');
    const paddedId = dotIdx === -1
        ? rawStr.padStart(4, '0')
        : `${rawStr.slice(0, dotIdx).padStart(4, '0')}${rawStr.slice(dotIdx)}`;

    let rawSize = spriteSizes[paddedId];
    if (!rawSize && dotIdx !== -1) {
        const basePadded = rawStr.slice(0, dotIdx).padStart(4, '0');
        rawSize = spriteSizes[basePadded];
    }
    if (!rawSize) return BATTLE_SPRITE_FALLBACK_HEIGHT;
    return Math.max(BATTLE_SPRITE_MIN_HEIGHT, Math.round(rawSize * BATTLE_SPRITE_SCALE));
}

function updatePokemonSpriteUI(spriteWrapper, pokemonSprite, pokemon, battleSystem, isPlayer, shouldAnimateSliding) {
    if (!spriteWrapper || !pokemonSprite) return;

    if (state.currentRoute && state.currentRoute !== lastPrecachedRoute) {
        lastPrecachedRoute = state.currentRoute;
        precacheRouteSprites(state.currentRoute);
    }

    const pokemonId = pokemon.isDisguisedDitto ? 132 : pokemon.id;
    const isShiny = pokemon.qualityName === 'Shiny';
    const newSrc = getTrimmedSpriteUrl(pokemonId, isShiny, isPlayer);
    if (newSrc && pokemonSprite.getAttribute('src') !== newSrc) {
        pokemonSprite.src = newSrc;
    }

    const targetHeight = getTargetSpriteHeight(pokemonId, state.config?.spriteSizes);
    pokemonSprite.style.height = `${targetHeight}px`;
    pokemonSprite.style.width = 'auto';

    pokemonSprite.classList.toggle('is-player', Boolean(isPlayer));
    pokemonSprite.style.transform = '';

    const types = Array.isArray(pokemon.types) ? pokemon.types : [];
    const isFlying = types.includes('Flying') || types.includes('Wind');
    const isWater = types.includes('Water');

    const motionEl = spriteWrapper.querySelector('.battle-sprite-motion');
    if (motionEl) {
        motionEl.classList.toggle('is-flying', isFlying);
    }

    const waterEffectEl = spriteWrapper.querySelector('.battle-water-effect');
    if (waterEffectEl) {
        waterEffectEl.classList.toggle('is-active', isWater);
    }

    const animClass = isPlayer ? 'sliding-idle-anim-flipped' : 'sliding-idle-anim';
    const otherAnimClass = isPlayer ? 'sliding-idle-anim' : 'sliding-idle-anim-flipped';
    pokemonSprite.classList.remove(otherAnimClass);

    if (shouldAnimateSliding) {
        pokemonSprite.classList.add(animClass);
        const slideDuration = battleSystem?.slideDuration || 500;
        const numCycles = Math.max(1, Math.ceil(slideDuration / 500));
        const newDuration = slideDuration / numCycles;
        pokemonSprite.style.animationDuration = `${newDuration}ms`;
    } else {
        pokemonSprite.classList.remove(animClass);
        pokemonSprite.style.animationDuration = '';
    }
}

function updateEnemyUI(enemy, battleSystem, glassTier, isSearching = false) {
    const hpContainerEnemy = document.getElementById('enemy-battle-hp-container');
    const hpBarEnemy = document.getElementById('enemy-battle-hp-bar');
    const hpTextEnemy = document.getElementById('enemy-battle-hp-text');
    const hpPctEnemy = document.getElementById('enemy-battle-hp-pct');
    const enemyDataModals = document.getElementById('enemy-data-modals');
    const elEnemySide = document.getElementById('enemy-side');
    const enemySpriteWrapper = document.getElementById('enemy-sprite-wrapper');
    const enemyPokemonSprite = document.getElementById('enemy-pokemon-sprite');

    if (isSearching || !enemy) {
        if (hpContainerEnemy) hpContainerEnemy.style.display = 'none';
        if (enemyDataModals) enemyDataModals.style.display = 'none';
        if (elEnemySide) {
            elEnemySide.style.transition = 'none';
            elEnemySide.style.left = '100%';
            elEnemySide.style.opacity = '1';
        }
        if (enemyPokemonSprite && !enemy) {
            enemyPokemonSprite.classList.remove('sliding-idle-anim');
            enemyPokemonSprite.style.animationDuration = '';
        }
        return;
    }

    if (hpContainerEnemy) {
        hpContainerEnemy.style.display = glassTier >= 1 ? 'flex' : 'none';
        hpContainerEnemy.style.opacity = '1';
    }

    if (enemyDataModals) {
        enemyDataModals.style.display = glassTier >= 3 ? 'flex' : 'none';
        enemyDataModals.style.opacity = '1';

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

    if (enemy) {
        updateHpBarUI(hpBarEnemy, hpTextEnemy, hpPctEnemy, enemy.currentHp, enemy.maxHp);
        updatePokemonSpriteUI(enemySpriteWrapper, enemyPokemonSprite, enemy, battleSystem, false, battleSystem.isSliding);
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
}

function updatePlayerUI(leader, battleSystem, glassTier, isSearching = false) {
    const elPlayerSide = document.getElementById('player-side');
    const playerSpriteWrapper = document.getElementById('player-sprite-wrapper');
    const playerPokemonSprite = document.getElementById('player-pokemon-sprite');
    const hpContainerPlayer = document.getElementById('player-battle-hp-container');
    const hpBarPlayer = document.getElementById('player-battle-hp-bar');
    const hpTextPlayer = document.getElementById('player-battle-hp-text');
    const hpPctPlayer = document.getElementById('player-battle-hp-pct');

    if (!leader) {
        if (hpContainerPlayer) hpContainerPlayer.style.display = 'none';
        if (playerPokemonSprite) {
            playerPokemonSprite.classList.remove('sliding-idle-anim-flipped');
            playerPokemonSprite.style.animationDuration = '';
        }
        return;
    }

    if (elPlayerSide) {
        if (leader) {
            updatePokemonSpriteUI(playerSpriteWrapper, playerPokemonSprite, leader, battleSystem, true, battleSystem.isSliding || isSearching);
            updateHpBarUI(hpBarPlayer, hpTextPlayer, hpPctPlayer, leader.currentHp, leader.maxHp);
        }

        if (hpContainerPlayer) hpContainerPlayer.style.display = glassTier >= 1 ? 'flex' : 'none';

        if (leader && leader.currentHp <= 0) {
            elPlayerSide.style.transition = 'opacity 2s linear';
            elPlayerSide.style.opacity = '0';
        } else {
            elPlayerSide.style.transition = 'none';
            elPlayerSide.style.opacity = '1';
        }
    }
}

export function updateBattleArena() {
    updateActiveItemsUI();

    const glassTier = state.stats?.upgrades?.glassTier || 0;
    const battleSystem = globals.battleSystem;
    const inGymCombat = battleSystem?.gymState?.isActive && battleSystem?.gymState?.inCombat;
    const inMultiplayer = battleSystem?.multiplayerState?.isActive;

    const combatArena = document.getElementById('combat-arena');
    if (combatArena) {
        updateBattleBackground(combatArena, state, battleSystem, inGymCombat, inMultiplayer);
        updateBackgroundSliding(combatArena, state, battleSystem, inGymCombat);
    }

    if (battleSystem?.activeEncounter) {
        updateEnemyUI(battleSystem.activeEncounter, battleSystem, glassTier, false);
        updatePlayerUI(state.party[0], battleSystem, glassTier, false);
    } else if (battleSystem?.isSearching) {
        updateEnemyUI(null, battleSystem, glassTier, true);
        updatePlayerUI(state.party[0], battleSystem, glassTier, true);
    } else {
        updateEnemyUI(null, battleSystem, glassTier, false);
        updatePlayerUI(null, battleSystem, glassTier, false);
    }
}


/* removed TYPE_COLORS */



function getDefeatAnimationElements() {
    return {
        arena: document.getElementById('combat-arena'),
        elEnemySide: document.getElementById('enemy-side'),
        mainViewWindow: document.getElementById('main-view-window'),
        elPlayerSide: document.getElementById('player-side'),
        originalSpriteWrapper: document.getElementById('enemy-sprite-wrapper')
    };
}

export function triggerDefeatAnimation(activeEncounter, ballResult, captureCallback) {
    const { arena, elEnemySide, mainViewWindow, elPlayerSide, originalSpriteWrapper } = getDefeatAnimationElements();

    if (elPlayerSide) {
        elPlayerSide.style.zIndex = '60'; // Ensure player is above the sliding out enemy
    }

    if (!arena || !elEnemySide || !originalSpriteWrapper) {
        captureCallback();
        return;
    }

    const { cloneWrapper, defeatContainer } = setupDefeatClone(originalSpriteWrapper, elEnemySide, arena);

    temporarilyHideEnemyUI();

    const ballSizePx = mainViewWindow ? mainViewWindow.offsetHeight * 0.15 : 50;

    const { ball, shakeInterval } = createPokeballAnimation(ballResult, cloneWrapper, ballSizePx);

    const slideDuration = 5000;
    const captureCheckDelay = 3000;
    const targetLeft = `-${ballSizePx}px`;

    startDefeatAnimations(defeatContainer, cloneWrapper, targetLeft, slideDuration);

    scheduleDefeatCallbacks(ball, ballResult, shakeInterval, captureCallback, defeatContainer, captureCheckDelay, slideDuration);
}

function prepareCloneWrapper(originalSpriteWrapper, elEnemySide) {
    const cloneWrapper = originalSpriteWrapper.cloneNode(true);
    const clonedHpContainer = cloneWrapper.querySelector('#enemy-battle-hp-container');
    if (clonedHpContainer) {
        clonedHpContainer.remove();
    }
    const clonedModals = cloneWrapper.querySelector('#enemy-data-modals');
    if (clonedModals) {
        clonedModals.classList.add('cloned-enemy-data-modals');
    }
    cloneWrapper.removeAttribute('id');
    cloneWrapper.querySelectorAll('[id]').forEach(el => el.removeAttribute('id'));

    cloneWrapper.style.position = 'relative';

    const motionTarget = cloneWrapper.querySelector('.battle-sprite-motion') || cloneWrapper;
    const floatingDamages = elEnemySide.querySelectorAll('.floating-damage');
    floatingDamages.forEach(node => {
        node.dataset.fainting = 'true';
        motionTarget.appendChild(node);
    });

    return cloneWrapper;
}

function createDefeatContainer() {
    const defeatContainer = document.createElement('div');
    defeatContainer.className = 'battle-actor battle-actor-enemy';
    defeatContainer.style.position = 'absolute';
    defeatContainer.style.bottom = '20%';
    defeatContainer.style.left = '35%';
    defeatContainer.style.display = 'flex';
    defeatContainer.style.alignItems = 'flex-end';
    defeatContainer.style.justifyContent = 'center';
    defeatContainer.style.width = 'max-content';
    defeatContainer.style.height = 'max-content';
    defeatContainer.style.zIndex = '10'; // Behind player sprite

    return defeatContainer;
}

function setupDefeatClone(originalSpriteWrapper, elEnemySide, arena) {
    const cloneWrapper = prepareCloneWrapper(originalSpriteWrapper, elEnemySide);
    const defeatContainer = createDefeatContainer();

    defeatContainer.appendChild(cloneWrapper);

    const spritesContainer = document.getElementById('battle-sprites-container');
    if (spritesContainer) {
        spritesContainer.appendChild(defeatContainer);
    } else {
        arena.appendChild(defeatContainer);
    }

    // Force reflow
    void defeatContainer.offsetWidth;

    return { cloneWrapper, defeatContainer };
}

let hideEnemyUITimeout = null;

function temporarilyHideEnemyUI() {
    const hpContainerEnemy = document.getElementById('enemy-battle-hp-container');
    const enemyDataModals = document.getElementById('enemy-data-modals');
    if (hideEnemyUITimeout) {
        clearTimeout(hideEnemyUITimeout);
        hideEnemyUITimeout = null;
    }
    if (hpContainerEnemy) {
        hpContainerEnemy.style.opacity = '0';
    }
    if (enemyDataModals) {
        enemyDataModals.style.opacity = '0';
    }
    hideEnemyUITimeout = setTimeout(() => {
        if (hpContainerEnemy) hpContainerEnemy.style.opacity = '1';
        if (enemyDataModals) enemyDataModals.style.opacity = '1';
        hideEnemyUITimeout = null;
    }, 500);
}

function createPokeballAnimation(ballResult, cloneWrapper, ballSizePx) {
    let ball = null;
    let shakeInterval = null;

    if (ballResult && ballResult.used && ballResult.ballName) {
        ball = document.createElement('img');
        ball.src = `Assets/Items/Balls/${ballResult.ballName}.png`;
        ball.style.position = 'absolute';

        const motionTarget = cloneWrapper.querySelector('.battle-sprite-motion') || cloneWrapper;
        motionTarget.style.position = 'relative';
        ball.style.left = '50%';
        ball.style.top = '50%';
        ball.style.transform = 'translate(-50%, -50%)';
        ball.style.width = `${ballSizePx}px`;
        ball.style.height = `${ballSizePx}px`;
        ball.style.objectFit = 'contain';
        ball.style.zIndex = '51';
        motionTarget.appendChild(ball);

        let shakeCount = 0;
        shakeInterval = setInterval(() => {
            shakeCount++;
            let rotation = (shakeCount % 2 === 0) ? 15 : -15;
            if (shakeCount % 10 === 0) rotation = 0;
            ball.style.transform = `translate(-50%, -50%) rotate(${rotation}deg)`;
        }, 150);

        void ball.offsetWidth;
    }

    return { ball, shakeInterval };
}

function animateContainerSlide(defeatContainer, targetLeft, slideDuration) {
    defeatContainer.style.transition = `left ${slideDuration}ms linear`;
    defeatContainer.style.left = targetLeft;
}

function animatePokemonSprite(cloneWrapper) {
    const pokemonSprite = cloneWrapper.querySelector('.battle-pokemon-sprite') || cloneWrapper.querySelector('img:not([src*="Balls"])');
    if (pokemonSprite) {
        pokemonSprite.classList.remove('sliding-idle-anim', 'sliding-idle-anim-flipped');
        pokemonSprite.style.transition = 'opacity 2000ms linear, transform 2000ms linear';
        pokemonSprite.style.transformOrigin = 'center center';
        pokemonSprite.style.opacity = '0';
        pokemonSprite.style.transform = 'scale(0.25)';
    }

    const waterEffect = cloneWrapper.querySelector('.battle-water-effect');
    if (waterEffect) {
        waterEffect.style.transition = 'opacity 1000ms linear';
        waterEffect.style.opacity = '0';
    }
}

function animateModals(cloneWrapper) {
    const clonedModals = cloneWrapper.querySelector('.cloned-enemy-data-modals');
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
}

function animateDamageTexts(cloneWrapper) {
    const clonedDamages = cloneWrapper.querySelectorAll('.floating-damage');
    clonedDamages.forEach(dmg => {
        dmg.dataset.fainting = 'true';
        void dmg.offsetWidth;
        dmg.style.transition = 'opacity 2000ms linear, transform 2000ms linear, top 1200ms ease-in, left 1200ms ease-in';
        dmg.style.transformOrigin = 'center center';
        dmg.style.left = '50%';
        dmg.style.top = '50%';
        dmg.style.opacity = '0';
        dmg.style.transform = 'translate(-50%, -50%) scale(0.2)';
    });
}

function startDefeatAnimations(defeatContainer, cloneWrapper, targetLeft, slideDuration) {
    animateContainerSlide(defeatContainer, targetLeft, slideDuration);
    animatePokemonSprite(cloneWrapper);
    animateModals(cloneWrapper);
    animateDamageTexts(cloneWrapper);
}

function scheduleDefeatCallbacks(ball, ballResult, shakeInterval, captureCallback, defeatContainer, captureCheckDelay, slideDuration) {
    let callbackFired = false;

    setTimeout(() => {
        if (ball) {
            clearInterval(shakeInterval);
            ball.style.transform = 'translate(-50%, -50%)';
            if (ballResult.caught) {
                ball.src = `Assets/Items/Balls/${ballResult.ballName}Y.png`;
            } else {
                ball.src = `Assets/Items/Balls/${ballResult.ballName}N.png`;
            }
        }

        if (!callbackFired) {
            callbackFired = true;
            captureCallback();
        }
    }, captureCheckDelay);

    setTimeout(() => {
        if (defeatContainer && defeatContainer.parentNode) {
            defeatContainer.parentNode.removeChild(defeatContainer);
        }
        if (!callbackFired) {
            callbackFired = true;
            captureCallback();
        }
    }, slideDuration);
}






export function getGymCombatInfo(target, moveName, moveType, amount) {
    const attacker = target === 'player' ? 'Enemy' : 'You';
    const typeColor = TYPE_COLORS[moveType] || '#ffffff';
    return { attacker, typeColor, moveName, amount };
}

function createGymCombatNode(target, moveName, moveType, amount) {
    const info = getGymCombatInfo(target, moveName, moveType, amount);

    const entry = document.createElement('div');
    entry.style.marginBottom = '2px';

    // Mitigate XSS: Build inner node safely
    entry.textContent = `${info.attacker} used `;

    const bNode = document.createElement('b');
    bNode.style.color = info.typeColor;
    bNode.textContent = info.moveName;
    entry.appendChild(bNode);

    entry.appendChild(document.createTextNode(' for '));

    const spanNode = document.createElement('span');
    spanNode.style.color = info.typeColor;
    spanNode.textContent = info.amount;
    entry.appendChild(spanNode);

    entry.appendChild(document.createTextNode(' dmg!'));

    return entry;
}

function logGymCombat(target, moveName, moveType, amount) {
    const log = document.getElementById('gym-combat-log');
    if (!log) return;

    const entry = createGymCombatNode(target, moveName, moveType, amount);
    log.appendChild(entry);

    // Keep only last 4 entries
    while (log.children.length > 4) {
        log.removeChild(log.firstChild);
    }
}

export function getDamageInfo(amount, isCrit, moveName, moveType, effectiveness) {
    const typeColor = TYPE_COLORS[moveType] || '#ffffff';
    const critText = isCrit ? ' Crit(1.5x)' : '';
    const effText = `${effectiveness}x`;
    const iconSrc = `Assets/Extra/Types/Type ${moveType}.png`;
    const fontSize = isCrit ? '24px' : '18px';
    const fontStyle = isCrit ? 'italic' : 'normal';

    return {
        amount,
        isCrit,
        moveName,
        moveType,
        effectiveness,
        typeColor,
        critText,
        effText,
        iconSrc,
        fontSize,
        fontStyle
    };
}

function createDamageNode(amount, isCrit, moveName, moveType, effectiveness) {
    const info = getDamageInfo(amount, isCrit, moveName, moveType, effectiveness);
    let dmgNode = document.createElement('div');

    // Mitigate XSS: Build inner node safely
    const innerSpan = document.createElement('span');
    innerSpan.style.fontWeight = 'bold';
    innerSpan.style.fontStyle = info.fontStyle;
    innerSpan.style.display = 'flex';
    innerSpan.style.alignItems = 'center';
    innerSpan.style.justifyContent = 'center';
    innerSpan.style.textShadow = '1px 1px 2px black';

    // Layout: [Amount] [Icon] [Name] [Effectiveness] [Crit]
    innerSpan.appendChild(document.createTextNode(`${info.amount} `));

    const iconImg = document.createElement('img');
    iconImg.src = info.iconSrc;
    iconImg.style.width = '20px';
    iconImg.style.height = '20px';
    iconImg.style.verticalAlign = 'middle';
    iconImg.style.margin = '0 4px';
    innerSpan.appendChild(iconImg);

    innerSpan.appendChild(document.createTextNode(` ${info.moveName} ${info.effText}${info.critText}`));

    dmgNode.appendChild(innerSpan);

    dmgNode.classList.add('floating-damage');

    dmgNode.style.position = 'absolute';
    dmgNode.style.color = info.typeColor;
    dmgNode.style.fontSize = info.fontSize;
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

    return dmgNode;
}

export function showDamage(target, amount, isCrit, moveName = '', moveType = 'Normal', effectiveness = 1) {
    const glassTier = state.stats?.upgrades?.glassTier || 0;
    if (glassTier < 2) return;
    const battleSystem = globals.battleSystem;
    let containerId = target === 'player' ? 'player-side' : 'enemy-side';

    // Check if in gym battle
    if (battleSystem && battleSystem.gymState && battleSystem.gymState.isActive) {
        containerId = target === 'player' ? 'gym-player-sprite' : 'gym-enemy-sprite';

        // Log to gym combat log
        logGymCombat(target, moveName, moveType, amount);
    }

    let img = document.getElementById(containerId);
    if (!img) return;

    let dmgNode = createDamageNode(amount, isCrit, moveName, moveType, effectiveness);

    img.appendChild(dmgNode);

    // Animate up and fade out (unless pulled inside a fainting Pokemon)
    setTimeout(() => {
        if (dmgNode.dataset.fainting === 'true') return;
        dmgNode.style.top = '0%'; // Float up relative to the container
    }, 50);

    setTimeout(() => {
        dmgNode.style.opacity = '0';
    }, 2000);

    setTimeout(() => {
        if (dmgNode.parentElement) dmgNode.parentElement.removeChild(dmgNode);
    }, 3000);
}


function getCombatActors(targetSide, isGym) {
    let attackerId = targetSide === 'player' ? (isGym ? 'gym-enemy-sprite' : 'enemy-side') : (isGym ? 'gym-player-sprite' : 'player-side');
    if (!document.getElementById(attackerId)) attackerId = targetSide === 'player' ? 'enemy-side' : 'player-side';
    let defenderId = targetSide === 'player' ? (isGym ? 'gym-player-sprite' : 'player-side') : (isGym ? 'gym-enemy-sprite' : 'enemy-side');
    if (!document.getElementById(defenderId)) defenderId = targetSide === 'player' ? 'player-side' : 'enemy-side';

    const atkImg = document.getElementById(attackerId);
    const defImg = document.getElementById(defenderId);
    const atkMotion = atkImg ? (atkImg.querySelector('.battle-sprite-motion') || atkImg) : null;
    const defMotion = defImg ? (defImg.querySelector('.battle-sprite-motion') || defImg) : null;

    return { attackerId, defenderId, atkImg, defImg, atkMotion, defMotion };
}

function getAttackerTypes(attackerId, isGym, battleSystem, state) {
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
                 let pd = findPokemonConfig(tId);
                 if (pd) atkTypes = pd.types || [];
             }
        } else if (battleSystem.activeEncounter) {
             atkTypes = battleSystem.activeEncounter.types || [];
        }
    }
    return atkTypes;
}

function initBaseTransforms(atkMotion, defMotion) {
    if (atkMotion && atkMotion.dataset.baseTransform === undefined) {
        atkMotion.dataset.baseTransform = atkMotion.classList.contains('battle-sprite-motion')
            ? ''
            : (atkMotion.style.transform || '');
    }
    if (defMotion && defMotion.dataset.baseTransform === undefined) {
        defMotion.dataset.baseTransform = defMotion.classList.contains('battle-sprite-motion')
            ? ''
            : (defMotion.style.transform || '');
    }
}

function animateAttacker(atkMotion, atkTypes, isPlayerAtk, duration) {
    if (!atkMotion || typeof atkMotion.animate !== 'function') return;
    const xDir = isPlayerAtk ? 18 : -18;
    const bt = atkMotion.dataset.baseTransform || '';

    let attackKeyframes = [
        { transform: `${bt}`.trim() || 'none' },
        { transform: `${bt} translateX(${xDir}px) scale(1.06)`.trim() },
        { transform: `${bt}`.trim() || 'none' }
    ];

    if (atkTypes.includes('Flying') || atkTypes.includes('Wind')) {
        attackKeyframes = [
            { transform: `${bt}`.trim() || 'none' },
            { transform: `${bt} translate(${xDir}px, 14px) scale(1.06)`.trim() },
            { transform: `${bt}`.trim() || 'none' }
        ];
    }

    atkMotion.animate(attackKeyframes, {
        duration: Math.max(120, duration * 0.4),
        easing: 'ease-in-out'
    });
}

function calculateProjectileMetrics(atkImg, defImg) {
    const atkImgEl = atkImg ? (atkImg.querySelector('.battle-pokemon-sprite') || atkImg.querySelector('img')) : null;
    const defImgEl = defImg ? (defImg.querySelector('.battle-pokemon-sprite') || defImg.querySelector('img')) : null;

    const rawAtkRect = atkImgEl ? atkImgEl.getBoundingClientRect() : null;
    const rawDefRect = defImgEl ? defImgEl.getBoundingClientRect() : null;

    const atkRect = (rawAtkRect && rawAtkRect.width > 0 && rawAtkRect.height > 0)
        ? rawAtkRect
        : atkImg.getBoundingClientRect();
    const defRect = (rawDefRect && rawDefRect.width > 0 && rawDefRect.height > 0)
        ? rawDefRect
        : defImg.getBoundingClientRect();

    const container = document.getElementById('battle-sprites-container') || document.body;
    const containerRect = container.getBoundingClientRect();
    let scaleX = 1;
    let scaleY = 1;

    if (container.offsetWidth && containerRect.width > 0) {
        scaleX = containerRect.width / container.offsetWidth;
        scaleY = containerRect.height / container.offsetHeight;
    }

    const atkHeight = Math.max(48, atkRect.height / scaleY);
    const defHeight = Math.max(48, defRect.height / scaleY);
    const projHeight = Math.max(8, Math.min(20, atkHeight * 0.1));
    const projWidth = projHeight * 2.4;

    const atkCenterX = atkRect.left + atkRect.width / 2;
    const atkCenterY = atkRect.top + atkRect.height / 2;
    const startX = container === document.body ? atkCenterX : (atkCenterX - containerRect.left) / scaleX;
    const startY = container === document.body ? atkCenterY : (atkCenterY - containerRect.top) / scaleY;

    const defCenterX = defRect.left + defRect.width / 2;
    const defCenterY = defRect.top + defRect.height / 2;
    const endX = container === document.body ? defCenterX : (defCenterX - containerRect.left) / scaleX;
    const endY = container === document.body ? defCenterY : (defCenterY - containerRect.top) / scaleY;

    const angleDeg = Math.atan2(endY - startY, endX - startX) * (180 / Math.PI);

    return { container, projHeight, projWidth, startX, startY, endX, endY, angleDeg, defHeight };
}

function spawnSplashEffect(container, x, y, defHeight, color, duration) {
    const posType = container === document.body ? 'fixed' : 'absolute';
    const splashDuration = Math.max(220, duration * 0.65);
    const maxRadius = Math.max(32, Math.min(90, defHeight * 0.48));

    const splashHost = document.createElement('div');
    splashHost.style.position = posType;
    splashHost.style.left = `${x}px`;
    splashHost.style.top = `${y}px`;
    splashHost.style.width = '0px';
    splashHost.style.height = '0px';
    splashHost.style.pointerEvents = 'none';
    splashHost.style.zIndex = '999';

    // Central burst core
    const core = document.createElement('div');
    core.style.position = 'absolute';
    core.style.left = '0';
    core.style.top = '0';
    core.style.width = `${maxRadius * 0.45}px`;
    core.style.height = `${maxRadius * 0.45}px`;
    core.style.borderRadius = '50%';
    core.style.background = `radial-gradient(circle, #ffffff 0%, ${color} 55%, transparent 100%)`;
    core.style.boxShadow = `0 0 ${maxRadius * 0.35}px ${color}`;
    core.style.transform = 'translate(-50%, -50%) scale(0.4)';
    core.style.opacity = '1';
    core.style.transition = `transform ${splashDuration * 0.7}ms ease-out, opacity ${splashDuration * 0.7}ms ease-out`;
    splashHost.appendChild(core);

    // Expanding shockwave ring
    const ring = document.createElement('div');
    ring.style.position = 'absolute';
    ring.style.left = '0';
    ring.style.top = '0';
    ring.style.width = `${maxRadius * 1.3}px`;
    ring.style.height = `${maxRadius * 1.3}px`;
    ring.style.borderRadius = '50%';
    ring.style.border = `3px solid ${color}`;
    ring.style.boxShadow = `0 0 10px ${color}`;
    ring.style.transform = 'translate(-50%, -50%) scale(0.2)';
    ring.style.opacity = '0.95';
    ring.style.transition = `transform ${splashDuration}ms cubic-bezier(0.15, 0.85, 0.35, 1), opacity ${splashDuration}ms ease-out`;
    splashHost.appendChild(ring);

    // Radial splash droplets
    const dropletCount = 8;
    const droplets = [];
    for (let i = 0; i < dropletCount; i++) {
        const angle = (Math.PI * 2 * i) / dropletCount + (i % 2 === 0 ? 0.15 : -0.15);
        const dist = maxRadius * (0.65 + (i % 3) * 0.2);
        const dx = Math.cos(angle) * dist;
        const dy = Math.sin(angle) * dist;
        const dropSize = Math.max(5, maxRadius * (i % 2 === 0 ? 0.18 : 0.12));

        const drop = document.createElement('div');
        drop.style.position = 'absolute';
        drop.style.left = '0';
        drop.style.top = '0';
        drop.style.width = `${dropSize}px`;
        drop.style.height = `${dropSize}px`;
        drop.style.borderRadius = '50%';
        drop.style.backgroundColor = color;
        drop.style.boxShadow = `0 0 6px ${color}`;
        drop.style.transform = 'translate(-50%, -50%) scale(1)';
        drop.style.opacity = '1';
        drop.style.transition = `transform ${splashDuration}ms cubic-bezier(0.1, 0.8, 0.3, 1), opacity ${splashDuration}ms ease-out`;
        splashHost.appendChild(drop);
        droplets.push({ drop, dx, dy });
    }

    container.appendChild(splashHost);
    void splashHost.offsetWidth;

    core.style.transform = 'translate(-50%, -50%) scale(1.6)';
    core.style.opacity = '0';
    ring.style.transform = 'translate(-50%, -50%) scale(1.15)';
    ring.style.opacity = '0';
    for (const { drop, dx, dy } of droplets) {
        drop.style.transform = `translate(calc(-50% + ${dx}px), calc(-50% + ${dy}px)) scale(0.35)`;
        drop.style.opacity = '0';
    }

    setTimeout(() => {
        if (splashHost.parentElement) splashHost.parentElement.removeChild(splashHost);
    }, splashDuration + 40);
}

function createAndAnimateProjectile(color, duration, metrics, defMotion) {
    const { container, projHeight, projWidth, startX, startY, endX, endY, angleDeg, defHeight } = metrics;

    const proj = document.createElement('div');
    proj.style.position = container === document.body ? 'fixed' : 'absolute';
    proj.style.width = `${projWidth}px`;
    proj.style.height = `${projHeight}px`;
    proj.style.background = `linear-gradient(90deg, transparent 0%, ${color} 45%, #ffffff 100%)`;
    proj.style.borderRadius = '999px';
    proj.style.boxShadow = `0 0 ${projHeight}px ${projHeight * 0.45}px ${color}`;
    proj.style.zIndex = '999';
    proj.style.pointerEvents = 'none';
    proj.style.transform = `translate(-50%, -50%) rotate(${angleDeg}deg)`;
    proj.style.left = `${startX}px`;
    proj.style.top = `${startY}px`;

    container.appendChild(proj);

    proj.style.transition = `left ${duration}ms linear, top ${duration}ms linear`;
    proj.getBoundingClientRect();

    proj.style.left = `${endX}px`;
    proj.style.top = `${endY}px`;

    const updateTransform = (el) => {
        const base = el.dataset.baseTransform || '';
        const def = el.dataset.defTransform || '';
        el.style.transform = `${base} ${def}`.trim();
    };

    setTimeout(() => {
        if (proj.parentElement) proj.parentElement.removeChild(proj);

        spawnSplashEffect(container, endX, endY, defHeight, color, duration);

        if (defMotion) {
            defMotion.style.transition = 'transform 50ms ease-in-out';
            const shakeInterval = setInterval(() => {
                const shift = (Math.random() - 0.5) * 18;
                defMotion.dataset.defTransform = `translateX(${shift}px)`;
                updateTransform(defMotion);
            }, 50);

            setTimeout(() => {
                clearInterval(shakeInterval);
                defMotion.dataset.defTransform = '';
                updateTransform(defMotion);
            }, Math.min(450, Math.max(150, duration * 0.45)));
        }
    }, duration);
}

export function playCombatAnimations(targetSide, moveType, duration) {
    const battleSystem = globals.battleSystem;
    const isGym = battleSystem && battleSystem.gymState && battleSystem.gymState.isActive;

    const { attackerId, atkImg, defImg, atkMotion, defMotion } = getCombatActors(targetSide, isGym);
    if (!atkImg || !defImg) return;

    const color = TYPE_COLORS[moveType] || '#ffffff';

    initBaseTransforms(atkMotion, defMotion);

    const atkTypes = getAttackerTypes(attackerId, isGym, battleSystem, state);
    const isPlayerAtk = attackerId.includes('player');

    animateAttacker(atkMotion, atkTypes, isPlayerAtk, duration);

    const metrics = calculateProjectileMetrics(atkImg, defImg);
    createAndAnimateProjectile(color, duration, metrics, defMotion);
}

let levelUpQueue = [];
let isDisplayingLevelUp = false;

function processLevelUpQueue() {
    if (isDisplayingLevelUp || levelUpQueue.length === 0) return;

    isDisplayingLevelUp = true;
    const { pokemonName, newLvl, isDaycare } = levelUpQueue.shift();

    const arena = document.getElementById('combat-arena');
    if (!arena) {
        isDisplayingLevelUp = false;
        processLevelUpQueue();
        return;
    }

    const lvlUpNode = document.createElement('div');
    const msgText = isDaycare ? `Level Up in Daycare! Lv. ${newLvl}` : `Level Up! Lv. ${newLvl}`;

    lvlUpNode.innerText = msgText;
    lvlUpNode.classList.add('level-up-text-anim');

    arena.appendChild(lvlUpNode);

    // Clean up node and process next in queue after animation ends (3s)
    setTimeout(() => {
        if (lvlUpNode.parentElement) lvlUpNode.parentElement.removeChild(lvlUpNode);
        isDisplayingLevelUp = false;
        processLevelUpQueue();
    }, 3000);
}

export function showLevelUp(pokemonName, newLvl, isDaycare) {
    levelUpQueue.push({ pokemonName, newLvl, isDaycare });
    processLevelUpQueue();
}

export function showLoot(lootItems) {
    const container = document.getElementById('battle-loot-container');
    if (!container) return;

    const keys = Object.keys(lootItems);
    if (keys.length === 0) return;

    let html = '';
    for (let i = 0; i < keys.length; i++) {
        let itemName = keys[i];
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
    setSafeHTML(row, html);

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