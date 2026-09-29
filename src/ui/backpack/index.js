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
                    <img src="${(state.stats && state.stats.upgrades && state.stats.upgrades.lootTier >= 4) ? './Assets/Extra/Backpack2.png' : './Assets/Extra/Backpack.png'}" style="width: 100%; display: block; pointer-events: none;">

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
                            <!-- Vitamins Pocket -->
                            <polygon class="backpack-pocket" onclick="event.stopPropagation(); window.renderBackpackTab('vitamins')" points="${(state.stats && state.stats.upgrades && state.stats.upgrades.lootTier >= 4) ? '1105.57,1208.12 1120.66,1204.34 1143.55,1197.99 1166.32,1185.30 1177.70,1172.75 1190.37,1158.70 1197.91,1146.15 1203.03,1124.55 1205.59,1104.30 1206.86,1078.92 1209.29,1058.67 1209.29,1038.42 1208.14,1016.95 1208.14,1000.49 1208.14,987.80 1208.14,970.11 1205.59,910.57 1205.59,897.88 1205.59,870.07 1205.59,852.25 1206.86,833.35 1199.19,820.66 1199.19,801.63 1201.75,776.25 1203.03,756.00 1208.14,726.98 1210.57,699.03 1211.85,672.43 1214.41,645.84 1215.69,614.25 1221.96,588.87 1220.81,564.84 1232.19,559.71 1234.62,553.37 1237.18,539.46 1235.90,521.77 1225.79,515.43 1216.97,510.30 1218.25,502.74 1220.81,490.05 1224.51,476.15 1219.53,469.80 1210.57,464.81 1205.59,459.68 1195.48,458.46 1185.25,454.68 1170.16,454.68 1156.22,453.33 1141.00,454.68 1124.50,457.11 1110.56,463.45 1113.11,498.96 1096.61,498.96 1091.63,510.30 1090.35,520.56 1090.35,542.02 1096.61,549.59 1097.89,571.18 1094.06,600.35 1090.35,626.94 1086.51,649.62 1087.79,676.22 1087.79,702.81 1086.51,731.97 1090.35,762.35 1092.91,788.94 1094.06,815.53 1095.34,847.26 1095.34,877.63 1096.61,909.23 1095.34,933.39 1095.34,959.98 1096.61,982.80 1096.61,1010.61 1096.61,1034.64 1096.61,1062.59 1096.61,1084.05 1096.61,1103.09 1095.34,1129.68 1095.34,1148.58 1094.06,1175.18 1092.91,1195.56 1091.63,1209.47' : '1111.96,469.66 1111.96,480.2 1111.96,489.11 1111.96,492.21 1107.49,501.26 1093.93,510.3 1089.45,520.83 1089.45,537.3 1098.41,544.86 1098.41,559.85 1098.41,576.45 1098.41,591.43 1093.93,611.01 1089.45,629.1 1084.98,647.19 1084.98,668.25 1084.98,680.26 1086.38,699.84 1087.92,716.44 1087.92,753.98 1090.99,772.06 1090.99,811.22 1097.0,833.76 1098.41,878.85 1098.41,898.42 1097.0,924.08 1097.0,946.62 1097.0,964.71 1098.41,1003.86 1093.93,1023.43 1093.93,1051.92 1098.41,1076.09 1098.41,1100.12 1098.41,1118.21 1098.41,1143.72 1097.0,1164.78 1097.0,1182.87 1095.46,1207.04 1115.03,1210.0 1139.08,1199.47 1157.11,1184.36 1175.15,1167.88 1190.24,1154.25 1199.32,1134.67 1205.33,1112.13 1205.33,1079.06 1206.74,1050.43 1206.74,1026.4 1206.74,1005.35 1209.81,994.82 1211.34,976.73 1211.34,969.16 1211.34,954.18 1208.27,936.09 1206.74,921.11 1202.26,904.5 1200.73,884.92 1200.73,859.41 1202.26,844.29 1202.26,830.79 1200.73,815.67 1200.73,793.12 1200.73,765.99 1200.73,746.55 1205.33,717.93 1211.34,699.84 1212.88,669.74 1215.82,647.19 1218.89,618.57 1220.29,601.97 1220.29,585.5 1224.9,572.0 1232.32,559.85 1239.86,549.31 1239.86,531.36 1232.32,525.28 1217.35,517.73 1215.82,510.3 1218.89,481.68 1218.89,469.66 1202.26,456.03 1178.21,451.58 1154.17,451.58 1139.08,451.58 1122.58,451.58'}"></polygon>
                         </svg>
                    </div>

                    <div id="backpack-content-area" onclick="event.stopPropagation()" class="floating-window" style="position: absolute; bottom: 5%; left: 5%; width: 90%; height: auto; max-height: 90%; display: flex; flex-direction: column; z-index: 5; display: none; overflow: hidden;">
                        <div class="window-header" style="position: relative; cursor: default;">
                            <span id="backpack-pocket-title">Pocket</span>
                            <span onclick="document.getElementById('backpack-content-area').style.display='none'" style="position: absolute; right: 10px; cursor: pointer; color: white; font-weight: bold;">X</span>
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
    } else if (tab === 'vitamins') {
        titleSpan.innerText = 'Vitamins';
        innerContent.innerHTML = '<h3 style="text-align: center; margin-top: 0; color: #ddd;">Pocket will be empty at the moment.</h3>';
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
