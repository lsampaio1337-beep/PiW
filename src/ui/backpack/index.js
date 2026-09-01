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
        <div style="position: relative; background-image: url('./Assets/Extra/Backpack.png'); background-size: contain; background-repeat: no-repeat; background-position: center top; padding: 20px; border-radius: 8px; min-height: 600px; color: white;">



            <!-- Close Button Overlay -->
            <div style="position: absolute; top: 10px; right: 10px; z-index: 10;">
                <button onclick="document.getElementById('modal-overlay').style.display='none'" style="background: #e74c3c; color: white; border: none; padding: 5px 10px; border-radius: 5px; cursor: pointer;">X</button>
            </div>

            <style>
                .backpack-pocket {
                    cursor: pointer;
                    fill: transparent;
                    stroke: transparent;
                    stroke-width: 2;
                    transition: fill 0.2s ease-in-out, stroke 0.2s ease-in-out;
                }
                .backpack-pocket:hover {
                    stroke: rgba(255, 255, 255, 0.5);
                    fill: rgba(255, 255, 255, 0.1);
                }
            </style>
            <div onclick="document.getElementById('backpack-content-area').style.display='none'" style="position: absolute; top: 0; left: 0; width: 100%; height: 100%; z-index: 2;">
                <svg width="100%" height="100%" viewBox="0 0 100 100" preserveAspectRatio="none">
                    <!-- Purple Pokeballs Pocket -->
                    <circle class="backpack-pocket" onclick="event.stopPropagation(); window.renderBackpackTab('pokeballs')" cx="33.84" cy="48.65" r="14.18"></circle>
                    <!-- Yellow Pokemon Pocket -->
                    <circle class="backpack-pocket" onclick="event.stopPropagation(); window.renderBackpackTab('pokemon')" cx="64.80" cy="48.78" r="14.23"></circle>
                    <!-- Green Potions Pocket -->
                    <circle class="backpack-pocket" onclick="event.stopPropagation(); window.renderBackpackTab('potions')" cx="34.72" cy="77.60" r="14.09"></circle>
                    <!-- Cyan Stones Pocket -->
                    <circle class="backpack-pocket" onclick="event.stopPropagation(); window.renderBackpackTab('stones')" cx="65.79" cy="80.01" r="14.18"></circle>
                </svg>
            </div>

            <div id="backpack-content-area" onclick="event.stopPropagation()" style="position: absolute; bottom: 20px; left: 5%; width: 90%; background: rgba(0,0,0,0.85); padding: 15px; border-radius: 5px; min-height: 250px; z-index: 5; display: none;">
                <h3 style="text-align: center; margin-top: 0; color: #ddd;">Select a pocket to view items.</h3>
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
