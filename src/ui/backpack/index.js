import { state } from '../../state.js';
import { renderPokeballsTab } from './pokeballs.js';
import { renderPotionsTab } from './potions.js';
import { renderStonesTab } from './stones.js';
import { renderPokemonTab } from './pokemon.js';

window.closeBackpackPocket = function() {
    document.getElementById('backpack-content-area').style.display='none';
    if (window.clearPokemonFilter) window.clearPokemonFilter();
};

window.closeBackpackModal = function() {
    if (window.closeBackpackPocket) window.closeBackpackPocket();
    if (window.closeModal) window.closeModal('window-backpack');
};

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
                <div onclick="event.stopPropagation(); window.closeBackpackPocket()" style="position: relative; width: 100%; aspect-ratio: 1279 / 1350; pointer-events: auto;">
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
                            <!-- Cyan Extra Pocket -->
                            <circle class="backpack-pocket" onclick="event.stopPropagation(); window.renderBackpackTab('stones')" cx="841.54" cy="1072.47" r="186.09"></circle>
                        </svg>
                    </div>

                    <div id="backpack-content-area" onclick="event.stopPropagation()" class="floating-window" style="position: absolute; bottom: 5%; left: 0%; width: 100%; height: auto; max-height: 90%; display: flex; flex-direction: column; z-index: 5; display: none; overflow: hidden;">
                        <div class="window-header" style="position: relative; cursor: default;">
                            <span id="backpack-pocket-title">Pocket</span>
                            <span onclick="window.closeBackpackPocket()" style="position: absolute; top: 5px; right: 5px; font-size: 14px; font-weight: normal; line-height: 1; padding: 0; cursor: pointer; color: white;">X</span>
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
        const titleHtml = `
            <div style="display: flex; flex-direction: column; width: 100%; text-align: center;">
                <div>Backpack</div>
                <div id="backpack-main-nav" style="display: inline-flex; justify-content: center; background: rgba(0, 0, 0, 0.2); border-radius: 20px; padding: 3px; gap: 5px; margin: 5px auto 0 auto;" onmousedown="event.stopPropagation()">
                    <button id="bp-nav-pokemon" onclick="window.renderBackpackTab('pokemon')" style="background: transparent; color: rgba(255, 255, 255, 0.7); border: 1px solid transparent; border-radius: 15px; padding: 5px 15px; font-weight: bold; cursor: pointer; font-size: 14px; transition: all 0.2s;">Pokémons</button>
                    <button id="bp-nav-pokeballs" onclick="window.renderBackpackTab('pokeballs')" style="background: transparent; color: rgba(255, 255, 255, 0.7); border: 1px solid transparent; border-radius: 15px; padding: 5px 15px; font-weight: bold; cursor: pointer; font-size: 14px; transition: all 0.2s;">Balls</button>
                    <button id="bp-nav-potions" onclick="window.renderBackpackTab('potions')" style="background: transparent; color: rgba(255, 255, 255, 0.7); border: 1px solid transparent; border-radius: 15px; padding: 5px 15px; font-weight: bold; cursor: pointer; font-size: 14px; transition: all 0.2s;">Potions</button>
                    <button id="bp-nav-stones" onclick="window.renderBackpackTab('stones')" style="background: transparent; color: rgba(255, 255, 255, 0.7); border: 1px solid transparent; border-radius: 15px; padding: 5px 15px; font-weight: bold; cursor: pointer; font-size: 14px; transition: all 0.2s;">Stones</button>
                    <button id="bp-nav-vitamins" onclick="window.renderBackpackTab('vitamins')" style="background: transparent; color: rgba(255, 255, 255, 0.7); border: 1px solid transparent; border-radius: 15px; padding: 5px 15px; font-weight: bold; cursor: pointer; font-size: 14px; transition: all 0.2s;">Vitamins</button>
                </div>
            </div>
        `;
        window.showModal(titleHtml, html, 'window-backpack', '800px', 'auto');
        const win = document.getElementById('window-backpack');
        if (win) {
            // Apply maximum height logic for Backpack based on aspect ratio constraint (800 / 1279 * 1350 = ~844px)
            // We set it slightly larger so it triggers native app bounding constraints if it overflows screen
            win.style.maxHeight = '90vh';
        }
    }
}

import { renderVitaminsTab } from './vitamins.js';

export function renderBackpackTab(tab) {
    const area = document.getElementById('backpack-content-area');
    const innerContent = document.getElementById('backpack-inner-content');
    const titleSpan = document.getElementById('backpack-pocket-title');
    if (!area || !innerContent || !titleSpan) return;

    area.style.display = "flex";

    if (tab !== 'pokemon') {
        if (window.clearPokemonFilter) window.clearPokemonFilter();
    }

    // Default simple titles
    let pocketTitleHtml = '';

    if (tab === 'pokeballs') {
        pocketTitleHtml = 'Pokéballs';
        renderPokeballsTab(innerContent);
    } else if (tab === 'potions') {
        pocketTitleHtml = 'Potions';
        renderPotionsTab(innerContent);
    } else if (tab === 'pokemon') {
        pocketTitleHtml = 'Pokémon';
        renderPokemonTab(innerContent);
    } else if (tab === 'stones' || tab === 'vitamins') {
        pocketTitleHtml = `
            <div style="display: flex; flex-direction: column; width: 100%; text-align: center;">
                <div>Extra</div>
                <div style="display: inline-flex; justify-content: center; background: rgba(0, 0, 0, 0.2); border-radius: 20px; padding: 3px; gap: 5px; margin: 5px auto 0 auto;" onmousedown="event.stopPropagation()">
                    <button onclick="window.renderBackpackTab('stones')" style="${tab === 'stones' ? 'background: linear-gradient(to bottom, #3498db, #2980b9); color: white; border: 1px solid #3498db; box-shadow: 0 2px 4px rgba(0,0,0,0.2);' : 'background: transparent; color: rgba(255, 255, 255, 0.7); border: 1px solid transparent;'} border-radius: 15px; padding: 5px 15px; font-weight: bold; cursor: pointer; font-size: 14px; transition: all 0.2s;">Stones</button>
                    <button onclick="window.renderBackpackTab('vitamins')" style="${tab === 'vitamins' ? 'background: linear-gradient(to bottom, #3498db, #2980b9); color: white; border: 1px solid #3498db; box-shadow: 0 2px 4px rgba(0,0,0,0.2);' : 'background: transparent; color: rgba(255, 255, 255, 0.7); border: 1px solid transparent;'} border-radius: 15px; padding: 5px 15px; font-weight: bold; cursor: pointer; font-size: 14px; transition: all 0.2s;">Vitamins</button>
                </div>
            </div>
        `;
        if (tab === 'stones') {
            renderStonesTab(innerContent);
        } else {
            renderVitaminsTab(innerContent);
        }
    }

    titleSpan.innerHTML = pocketTitleHtml;

    // Update main nav buttons active state
    const navButtons = ['pokemon', 'pokeballs', 'potions', 'stones', 'vitamins'];
    navButtons.forEach(navId => {
        const btn = document.getElementById('bp-nav-' + navId);
        if (btn) {
            if (tab === navId) {
                btn.style.cssText = 'background: linear-gradient(to bottom, #3498db, #2980b9); color: white; border: 1px solid #3498db; box-shadow: 0 2px 4px rgba(0,0,0,0.2); border-radius: 15px; padding: 5px 15px; font-weight: bold; cursor: pointer; font-size: 14px; transition: all 0.2s;';
            } else {
                btn.style.cssText = 'background: transparent; color: rgba(255, 255, 255, 0.7); border: 1px solid transparent; border-radius: 15px; padding: 5px 15px; font-weight: bold; cursor: pointer; font-size: 14px; transition: all 0.2s;';
            }
        }
    });
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
