import { state } from '../../state.js';
import { renderPokeballsTab } from './pokeballs.js';
import { renderPotionsTab } from './potions.js';
import { renderStonesTab } from './stones.js';
import { renderPokemonTab } from './pokemon.js';

export function showBackpack() {
    let html = `
        <div style="display: flex; flex-direction: column; align-items: center; justify-content: center; width: 100%; height: 100%; padding: 20px; box-sizing: border-box; color: white; overflow: hidden; position: relative;">
            <style>
                .backpack-pocket {
                    cursor: pointer;
                    fill: transparent;
                    stroke: transparent;
                    stroke-width: 5;
                    transition: fill 0.2s ease-in-out, stroke 0.2s ease-in-out;
                }
                .backpack-pocket:hover {
                    stroke: rgba(255, 255, 255, 0.5);
                    fill: rgba(255, 255, 255, 0.1);
                }
            </style>

            <div onclick="window.closeBackpackModal()" style="position: absolute; top: 0; left: 0; width: 100%; height: 100%; z-index: 1;"></div>

            <div style="position: relative; height: 100%; max-height: 100%; width: 100%; display: flex; align-items: center; justify-content: center; cursor: default; pointer-events: none; z-index: 2;">

                <!-- Inner container shrink-wrapped to exact dimensions so clicks outside the bag hit the overlay -->
                <div onclick="event.stopPropagation(); document.getElementById('backpack-pocket-window') ? document.getElementById('backpack-pocket-window').style.display='none' : null;" style="position: relative; height: 100%; width: 100%; max-height: 100%; max-width: max-content; aspect-ratio: 1279 / 1350; pointer-events: auto;">
                    <img src="./Assets/Extra/Backpack.png" style="height: 100%; width: 100%; display: block; pointer-events: none;">

                    <div style="position: absolute; top: 0; left: 0; width: 100%; height: 100%; z-index: 2;">
                        <!-- Use exact pixel dimensions of the image for the viewBox to ensure perfect circle scaling -->
                        <svg width="100%" height="100%" viewBox="0 0 1279 1350" preserveAspectRatio="none">
                            <!-- Purple Pokeballs Pocket -->
                            <circle class="backpack-pocket" onclick="event.stopPropagation(); window.renderBackpackTab('pokeballs')" cx="436.00" cy="659.21" r="186.13"></circle>
                            <!-- Yellow Pokemon Pocket -->
                            <circle class="backpack-pocket" onclick="event.stopPropagation(); window.renderBackpackTab('pokemon')" cx="839.61" cy="664.26" r="187.63"></circle>
                            <!-- Green Potions Pocket -->
                            <circle class="backpack-pocket" onclick="event.stopPropagation(); window.renderBackpackTab('potions')" cx="437.01" cy="1065.96" r="186.16"></circle>
                            <!-- Cyan Stones Pocket -->
                            <circle class="backpack-pocket" onclick="event.stopPropagation(); window.renderBackpackTab('stones')" cx="841.54" cy="1072.47" r="186.09"></circle>
                        </svg>
                    </div>

                    <div id="backpack-pocket-window" class="floating-window" onclick="event.stopPropagation()" style="position: absolute; bottom: 5%; left: 5%; width: 90%; height: auto; max-height: 90%; display: none; z-index: 5; flex-direction: column; cursor: default;">
                        <div id="backpack-pocket-header" class="window-header" style="position: relative; cursor: default;">
                            Pocket
                            <span onclick="document.getElementById('backpack-pocket-window').style.display='none'" style="position: absolute; right: 10px; cursor: pointer; color: white; font-weight: bold;">X</span>
                        </div>
                        <div class="window-content-container" style="flex: 1; overflow: hidden; display: flex; flex-direction: column;">
                            <div class="window-content-scaler" style="flex: 1; display: flex; flex-direction: column;">
                                <div id="backpack-content-area" style="flex: 1; overflow-y: auto; display: flex; flex-direction: column; padding: 15px; box-sizing: border-box;">
                                    <h3 style="text-align: center; margin-top: 0; color: #ddd;">Select a pocket to view items.</h3>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    `;

    if (window.showModal) {
        window.showModal('Backpack', html, 'window-backpack');
    }
}

export function renderBackpackTab(tab) {
    const win = document.getElementById('backpack-pocket-window');
    const area = document.getElementById('backpack-content-area');
    const header = document.getElementById('backpack-pocket-header');
    if (!win || !area || !header) return;

    win.style.display = "flex";

    if (tab === 'pokeballs') {
        header.innerHTML = \`Pokéballs<span onclick="document.getElementById('backpack-pocket-window').style.display='none'" style="position: absolute; right: 10px; cursor: pointer; color: white; font-weight: bold;">X</span>\`;
        renderPokeballsTab(area);
    } else if (tab === 'potions') {
        header.innerHTML = \`Potions<span onclick="document.getElementById('backpack-pocket-window').style.display='none'" style="position: absolute; right: 10px; cursor: pointer; color: white; font-weight: bold;">X</span>\`;
        renderPotionsTab(area);
    } else if (tab === 'stones') {
        header.innerHTML = \`Stones<span onclick="document.getElementById('backpack-pocket-window').style.display='none'" style="position: absolute; right: 10px; cursor: pointer; color: white; font-weight: bold;">X</span>\`;
        renderStonesTab(area);
    } else if (tab === 'pokemon') {
        header.innerHTML = \`Pokémon<span onclick="document.getElementById('backpack-pocket-window').style.display='none'" style="position: absolute; right: 10px; cursor: pointer; color: white; font-weight: bold;">X</span>\`;
        renderPokemonTab(area);
    }
}

export function setActiveItem(type, tierIdx) {
    if (type === 'ball') {
        state.settings.activeBallTier = tierIdx;
    } else if (type === 'potion') {
        state.settings.activePotionTier = tierIdx;
    }
    renderBackpackTab(type === 'ball' ? 'pokeballs' : 'potions');
}

export function setAutoPotionThreshold(val) {
    state.settings.autoPotionThreshold = val;

    // Attempt to manually save to ensure the threshold is preserved
    // since clicking outside the bag dismisses it without explicit save events
    try {
        if (window.storageRef) {
            window.storageRef.save(state);
        }
    } catch(e) {}
}
