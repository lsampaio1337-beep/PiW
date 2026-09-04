import { state } from '../../state.js';
import { renderPokeballsTab } from './pokeballs.js';
import { renderPotionsTab } from './potions.js';
import { renderStonesTab } from './stones.js';
import { renderPokemonTab } from './pokemon.js';

export function showBackpack() {
    let rightCol = document.getElementById('modal-overlay');
    let contentPanel = document.getElementById('content-panel');
    rightCol.style.display = 'flex';

    // Remove any hardcoded modal width restrictions specifically for the backpack so it can scale
    const modalBox = document.getElementById('modal-content-box');
    if (modalBox) {
        // Temporarily clear inline styles that might restrict backpack size. We add a cleanup on close.
        modalBox.dataset.originalStyles = modalBox.getAttribute('style') || '';

        modalBox.style.width = '100%';
        modalBox.style.maxWidth = '100%';
        modalBox.style.height = '100%';
        modalBox.style.maxHeight = '100%';
        modalBox.style.background = 'transparent'; // Remove white background box
        modalBox.style.border = 'none';
        modalBox.style.boxShadow = 'none';

    }

    let html = `
        <div onclick="if(window.closeModal) window.closeModal()" style="position: fixed; top: 0; left: 0; display: flex; flex-direction: column; align-items: center; justify-content: center; width: 100vw; height: 100vh; padding: 20px; box-sizing: border-box; color: white; overflow: hidden; z-index: 9999;">
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
                <div onclick="event.stopPropagation(); document.getElementById('backpack-content-area').style.display='none'" style="position: relative; height: 100%; width: 100%; max-height: 100%; max-width: max-content; aspect-ratio: 1279 / 1350; pointer-events: auto;">
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

                    ${window.sellModeActive ? `<div style="position: absolute; top: 2%; left: 50%; transform: translateX(-50%); font-size: 32px; font-weight: bold; color: #ffeb3b; text-shadow: 0 0 10px red; background: rgba(0,0,0,0.7); padding: 10px 30px; border-radius: 12px; z-index: 10; pointer-events: none;">SELLING MODE</div>` : ''}

                    <div id="backpack-content-area" onclick="event.stopPropagation()" style="position: absolute; bottom: 5%; left: 5%; width: 90%; height: 80%; max-height: 80%; display: flex; flex-direction: column; background: rgba(0,0,0,0.85); padding: 15px; box-sizing: border-box; border-radius: 5px; z-index: 5; display: none;">

                        <h3 style="text-align: center; margin-top: 0; color: #ddd;">Select a pocket to view items.</h3>
                    </div>
                </div>
            </div>
        </div>
    `;
    contentPanel.innerHTML = html;
}

export function renderBackpackTab(tab) {
    const area = document.getElementById('backpack-content-area');
    if (!area) return;
    area.style.display = "flex";
    if (window.sellModeActive && tab !== 'pokemon') {
        area.style.height = 'auto';
    } else {
        area.style.height = '80%';
    }

    if (tab === 'pokeballs') {
        renderPokeballsTab(area);
    } else if (tab === 'potions') {
        renderPotionsTab(area);
    } else if (tab === 'stones') {
        renderStonesTab(area);
    } else if (tab === 'pokemon') {
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

window.startSellMode = function() {
    window.sellModeActive = true;
    if (window.selectedForSale) window.selectedForSale.clear();

    const modalBox = document.getElementById('backpack-modal');
    if (modalBox) modalBox.style.display = 'block';

    window.showBackpack();
};
