import { state } from '../../state.js';
import { renderPokeballsTab } from './pokeballs.js';
import { renderPotionsTab } from './potions.js';
import { renderStonesTab } from './stones.js';
import { renderPokemonTab } from './pokemon.js';

export function showBackpack() {
    let html = `
        <div style="display: flex; flex-direction: column; align-items: center; justify-content: center; width: 100%; box-sizing: border-box; color: white; position: relative;">
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

            <div style="position: relative; width: 100%; display: flex; align-items: center; justify-content: center; cursor: default; pointer-events: none; z-index: 2;">

                <!-- Inner container shrink-wrapped to exact dimensions so clicks outside the bag hit the overlay -->
                <div onclick="event.stopPropagation(); document.getElementById('backpack-content-area').style.display='none'" style="position: relative; width: 100%; aspect-ratio: 1279 / 1350; pointer-events: auto;">
                    <img src="./Assets/Extra/Backpack.png" style="width: 100%; display: block; pointer-events: none;">

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

                    <div id="backpack-content-area" onclick="event.stopPropagation()" class="floating-window" style="position: absolute; bottom: 5%; left: 5%; width: 90%; height: auto; max-height: 90%; display: flex; flex-direction: column; z-index: 5; display: none; overflow: hidden;">
                        <div class="window-header" style="position: relative; cursor: default;">
                            <span id="backpack-pocket-title">Pocket</span>
                            <button aria-label="Close" onclick="document.getElementById('backpack-content-area').style.display='none'" style="background: transparent; border: none; padding: 0; font: inherit; position: absolute; right: 10px; cursor: pointer; color: white; font-weight: bold;">X</button>
                        </div>
                        <div class="window-content-container" style="flex: 1; overflow-y: auto;">
                            <div id="backpack-inner-content" style="padding: 15px; box-sizing: border-box; width: 100%; height: 100%;">
                                <h3 style="text-align: center; margin-top: 0; color: #ddd;">Select a pocket to view items.</h3>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    `;

    if (window.showModal) {
        window.showModal('Backpack', html, 'window-backpack', '800px', 'auto');
        const win = document.getElementById('window-backpack');
        if (win) {
            // Apply maximum height logic for Backpack based on aspect ratio constraint (800 / 1279 * 1350 = ~844px)
            // We set it slightly larger so it triggers native app bounding constraints if it overflows screen
            win.style.maxHeight = '90vh';
        }
    }
}

export function renderBackpackTab(tab) {
    const area = document.getElementById('backpack-content-area');
    const innerContent = document.getElementById('backpack-inner-content');
    const titleSpan = document.getElementById('backpack-pocket-title');
    if (!area || !innerContent || !titleSpan) return;

    area.style.display = "flex";

    if (tab === 'pokeballs') {
        titleSpan.innerText = 'Pokéballs';
        renderPokeballsTab(innerContent);
    } else if (tab === 'potions') {
        titleSpan.innerText = 'Potions';
        renderPotionsTab(innerContent);
    } else if (tab === 'stones') {
        titleSpan.innerText = 'Stones';
        renderStonesTab(innerContent);
    } else if (tab === 'pokemon') {
        titleSpan.innerText = 'Pokémon';
        renderPokemonTab(innerContent);
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
