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
        <div style="position: relative; display: flex; flex-direction: column; align-items: center; padding: 20px; border-radius: 8px; color: white;">

            <!-- Close Button Overlay -->
            <div style="position: absolute; top: 10px; right: 10px; z-index: 10;">
                <button onclick="document.getElementById('modal-overlay').style.display='none'" style="background: #e74c3c; color: white; border: none; padding: 5px 10px; border-radius: 5px; cursor: pointer;">X</button>
            </div>

            <style>
                .backpack-pocket {
                    cursor: pointer;
                    fill: transparent;
                    stroke: transparent;
                    stroke-width: 0.5;
                    transition: fill 0.2s ease-in-out, stroke 0.2s ease-in-out;
                }
                .backpack-pocket:hover {
                    stroke: rgba(255, 255, 255, 0.5);
                    fill: rgba(255, 255, 255, 0.1);
                }
            </style>

            <div style="position: relative; width: 100%; max-width: 500px;">
                <img src="./Assets/Extra/Backpack.png" style="width: 100%; height: auto; display: block;">

                <div onclick="document.getElementById('backpack-content-area').style.display='none'" style="position: absolute; top: 0; left: 0; width: 100%; height: 100%; z-index: 2;">
                    <svg width="100%" height="100%" viewBox="0 0 100 100" preserveAspectRatio="none">
                        <!-- Purple Pokeballs Pocket -->
                        <polygon class="backpack-pocket" onclick="event.stopPropagation(); window.renderBackpackTab('pokeballs')" points="20.68,43.95 30.88,35.24 45.41,40.2 48.07,52.48 35.39,62.58 22.61,57.45"></polygon>
                        <!-- Yellow Pokemon Pocket -->
                        <polygon class="backpack-pocket" onclick="event.stopPropagation(); window.renderBackpackTab('pokemon')" points="55.06,39.77 68.11,35.42 79.14,43.6 75.09,59.62 60.11,62.24 51.29,52.05"></polygon>
                        <!-- Green Potions Pocket -->
                        <polygon class="backpack-pocket" onclick="event.stopPropagation(); window.renderBackpackTab('potions')" points="21.78,71.73 32.54,65.2 43.66,68.42 48.25,75.91 46.42,86.36 29.87,92.28 20.5,83.31"></polygon>
                        <!-- Cyan Stones Pocket -->
                        <polygon class="backpack-pocket" onclick="event.stopPropagation(); window.renderBackpackTab('stones')" points="54.69,70.33 71.69,67.02 80.42,78.17 75.09,90.01 61.31,92.54 51.56,82"></polygon>
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
