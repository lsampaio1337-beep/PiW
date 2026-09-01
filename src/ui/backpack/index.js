import { state } from '../../state.js';
import { renderPokeballsTab } from './pokeballs.js';
import { renderPotionsTab } from './potions.js';
import { renderStonesTab } from './stones.js';
import { renderPokemonTab } from './pokemon.js';

export function showBackpack() {
    let rightCol = document.getElementById('modal-overlay');
    let contentPanel = document.getElementById('content-panel');
    rightCol.style.display = 'flex';

    let html = `
        <div style="position: relative; display: flex; flex-direction: column; align-items: flex-start; justify-content: flex-start; width: 100%; height: 100%; padding: 20px; border-radius: 8px; color: white; overflow-x: auto; overflow-y: hidden;">

            <!-- Close Button Overlay -->
            <div style="position: fixed; top: 20px; right: 30px; z-index: 100;">
                <button onclick="document.getElementById('modal-overlay').style.display='none'" style="background: #e74c3c; color: white; border: none; padding: 5px 10px; border-radius: 5px; cursor: pointer;">X</button>
            </div>

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

            <div style="position: relative; height: 90vh; max-height: 1000px; min-width: max-content; margin: 0 auto;">
                <img src="./Assets/Extra/Backpack.png" style="height: 100%; width: auto; display: block; object-fit: contain;">

                <div onclick="document.getElementById('backpack-content-area').style.display='none'" style="position: absolute; top: 0; left: 0; width: 100%; height: 100%; z-index: 2;">
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

                <div id="backpack-content-area" onclick="event.stopPropagation()" style="position: absolute; bottom: 20px; left: 5%; width: 90%; background: rgba(0,0,0,0.85); padding: 15px; border-radius: 5px; z-index: 5; display: none;">
                    <h3 style="text-align: center; margin-top: 0; color: #ddd;">Select a pocket to view items.</h3>
                </div>
            </div>
        </div>
    `;
    contentPanel.innerHTML = html;
}

export function renderBackpackTab(tab) {
    const area = document.getElementById('backpack-content-area');
    if (!area) return;
    area.style.display = "block";

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
