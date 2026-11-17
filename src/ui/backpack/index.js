import { state } from '../../state.js';
import { renderPokeballsTab } from './pokeballs.js';
import { renderPotionsTab } from './potions.js';
import { renderStonesTab } from './stones.js';
import { renderPokemonTab } from './pokemon.js';
import { renderVitaminsTab } from './vitamins.js';

window.closeBackpackPocket = function() {
    const overlay = document.getElementById('backpack-content-overlay');
    if (overlay) overlay.style.display = 'none';
    const area = document.getElementById('backpack-content-area');
    if (area) area.style.display = 'none';
    if (window.clearPokemonFilter) window.clearPokemonFilter();
};

window.closeBackpackModal = function() {
    if (window.closeBackpackPocket) window.closeBackpackPocket();
    if (window.closeModal) window.closeModal('window-backpack');
};

export function showBackpack() {
    let html = `
        <div class="backpack-stage">
            <style>
                .backpack-pocket {
                    cursor: pointer;
                    fill: transparent;
                    stroke: transparent;
                    stroke-width: 6;
                    transition: fill 0.2s ease-in-out, stroke 0.2s ease-in-out;
                }
                .backpack-pocket:hover {
                    stroke: rgba(56, 189, 248, 0.7);
                    fill: rgba(56, 189, 248, 0.14);
                }
            </style>

            <div onclick="window.closeBackpackModal()" style="position: absolute; inset: 0; z-index: 1;"></div>

            <div style="position: relative; width: 100%; height: 100%; display: flex; align-items: center; justify-content: center; cursor: default; pointer-events: none; z-index: 2; padding: 12px; box-sizing: border-box;">
                <div class="backpack-bag-wrap" onclick="event.stopPropagation(); window.closeBackpackPocket()" style="pointer-events: auto;">
                    <img src="./Assets/Extra/Backpack.png" style="width: 100%; height: 100%; display: block; pointer-events: none; filter: drop-shadow(0 10px 24px rgba(0, 0, 0, 0.6));">

                    <div style="position: absolute; inset: 0; z-index: 2;">
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
                </div>
            </div>

            <div id="backpack-content-overlay" class="backpack-content-overlay" onclick="if(event.target === this) { event.stopPropagation(); window.closeBackpackPocket(); }">
                <div id="backpack-content-area" class="backpack-content-panel" onclick="event.stopPropagation()" style="display: none;">
                    <div class="backpack-subbar">
                        <div id="backpack-pocket-title" class="backpack-subbar-title">Pocket</div>
                        <button type="button" class="backpack-back-btn" onclick="window.closeBackpackPocket()">Bag View</button>
                    </div>
                    <div id="backpack-inner-content" class="backpack-inner-scroll">
                        <h3 style="text-align: center; margin-top: 0; color: #ddd;">Select a pocket to view items.</h3>
                    </div>
                </div>
            </div>
        </div>
    `;

    if (window.showModal) {
        const titleHtml = `
            <div class="backpack-header-bar">
                <span>Backpack</span>
                <div id="backpack-main-nav" class="piw-tab-bar" onmousedown="event.stopPropagation()">
                    <button id="bp-nav-pokemon" onclick="window.renderBackpackTab('pokemon')" class="piw-tab-btn">Pokémons</button>
                    <button id="bp-nav-pokeballs" onclick="window.renderBackpackTab('pokeballs')" class="piw-tab-btn">Balls</button>
                    <button id="bp-nav-potions" onclick="window.renderBackpackTab('potions')" class="piw-tab-btn">Potions</button>
                    <button id="bp-nav-stones" onclick="window.renderBackpackTab('stones')" class="piw-tab-btn">Stones</button>
                    <button id="bp-nav-vitamins" onclick="window.renderBackpackTab('vitamins')" class="piw-tab-btn">Vitamins</button>
                </div>
            </div>
        `;
        window.showModal(titleHtml, html, 'window-backpack', '800px', 'auto');
        const win = document.getElementById('window-backpack');
        const contentContainer = win?.querySelector('.window-content-container');
        if (contentContainer) {
            contentContainer.style.minWidth = '560px';
            contentContainer.style.setProperty('padding', '0px', 'important');
        }
        if (win) {
            win.style.maxHeight = '86vh';
        }
    }
}

export function renderBackpackTab(tab) {
    const overlay = document.getElementById('backpack-content-overlay');
    const area = document.getElementById('backpack-content-area');
    const innerContent = document.getElementById('backpack-inner-content');
    const titleSpan = document.getElementById('backpack-pocket-title');
    if (!area || !innerContent || !titleSpan) return;

    if (overlay) overlay.style.display = "flex";
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
        pocketTitleHtml = 'Pokémon Storage';
        renderPokemonTab(innerContent);
    } else if (tab === 'stones' || tab === 'vitamins') {
        pocketTitleHtml = `
            <div style="display: flex; align-items: center; gap: 10px;">
                <span>Extra</span>
                <div class="piw-tab-bar" onmousedown="event.stopPropagation()">
                    <button onclick="window.renderBackpackTab('stones')" class="piw-tab-btn ${tab === 'stones' ? 'is-active' : ''}">Stones</button>
                    <button onclick="window.renderBackpackTab('vitamins')" class="piw-tab-btn ${tab === 'vitamins' ? 'is-active' : ''}">Vitamins</button>
                </div>
            </div>
        `;
        if (tab === 'stones') {
            renderStonesTab(innerContent);
        } else {
            renderVitaminsTab(innerContent);
        }
    }

    const titleDoc = new DOMParser().parseFromString(pocketTitleHtml, 'text/html');
    titleSpan.replaceChildren(...titleDoc.body.childNodes);

    // Update main nav buttons active state
    const navButtons = ['pokemon', 'pokeballs', 'potions', 'stones', 'vitamins'];
    navButtons.forEach(navId => {
        const btn = document.getElementById('bp-nav-' + navId);
        if (btn) {
            btn.classList.toggle('is-active', tab === navId);
        }
    });
}

export function setActiveItem(type, tierIdx) {
    if (type === 'ball') {
        state.settings.activeBallTier = tierIdx;
    } else if (type === 'potion') {
        state.settings.activePotionTier = tierIdx;
    }
    try {
        window.storageRef?.save(state);
    } catch (e) {}
    const area = document.getElementById('backpack-content-area');
    if (area && area.style.display !== 'none') {
        renderBackpackTab(type === 'ball' ? 'pokeballs' : 'potions');
    }
}

export function setAutoPotionThreshold(val) {
    let clamped = parseInt(val, 10);
    if (isNaN(clamped)) clamped = 1;
    clamped = Math.max(1, Math.min(90, clamped));
    state.settings.autoPotionThreshold = clamped;

    const slider = document.getElementById('potion-threshold-slider');
    if (slider) slider.value = clamped;
    const valEl = document.getElementById('potion-threshold-val');
    if (valEl) valEl.textContent = clamped + '%';

    // Attempt to manually save to ensure the threshold is preserved
    // since clicking outside the bag dismisses it without explicit save events
    try {
        if (window.storageRef) {
            window.storageRef.save(state);
        }
    } catch(e) {}
}
