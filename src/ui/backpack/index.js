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

            <div onclick="document.getElementById('backpack-content-area').style.display='none'" style="position: absolute; top:0; left:0; width:100%; height:100%; z-index: 1;"></div>

            <!-- Close Button Overlay -->
            <div style="position: absolute; top: 10px; right: 10px; z-index: 10;">
                <button onclick="document.getElementById('modal-overlay').style.display='none'" style="background: #e74c3c; color: white; border: none; padding: 5px 10px; border-radius: 5px; cursor: pointer;">X</button>
            </div>

            <style>
                .backpack-pocket {
                    position: absolute;
                    cursor: pointer;
                    border-radius: 50%;
                    border: 3px solid transparent;
                    transition: border 0.2s ease-in-out, background 0.2s ease-in-out;
                }
                .backpack-pocket:hover {
                    border-color: rgba(255, 255, 255, 0.5);
                    background: rgba(255, 255, 255, 0.1);
                }
            </style>
            <div style="position: absolute; top: 0; left: 0; width: 100%; height: 100%; z-index: 2;">
                <!-- Purple Pokeballs Pocket -->
                <div class="backpack-pocket" onclick="window.renderBackpackTab('pokeballs')" style="top: 28%; left: 9.5%; width: 29%; height: 24%; border-radius: 50%;"></div>

                <!-- Yellow Pokemon Pocket -->
                <div class="backpack-pocket" onclick="window.renderBackpackTab('pokemon')" style="top: 31%; right: 14%; width: 28%; height: 24%; border-radius: 50%;"></div>

                <!-- Green Potions Pocket -->
                <div class="backpack-pocket" onclick="window.renderBackpackTab('potions')" style="top: 61.5%; left: 11%; width: 28%; height: 24%; border-radius: 50%;"></div>

                <!-- Cyan Stones Pocket -->
                <div class="backpack-pocket" onclick="window.renderBackpackTab('stones')" style="top: 62.5%; right: 17%; width: 27%; height: 23%; border-radius: 50%;"></div>
            </div>

            <div id="backpack-content-area" style="position: absolute; bottom: 20px; left: 5%; width: 90%; background: rgba(0,0,0,0.85); padding: 15px; border-radius: 5px; min-height: 250px; z-index: 5; display: none;">
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
