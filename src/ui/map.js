import { state, globals, swapRegion } from '../state.js';
import { updateUI, switchView } from '../ui.js';
import { setupMarket } from './market.js';
import { getBadgeFileName as fallbackGetBadgeFileName } from '../utils/badges.js';

/** Resolve badge filename via window override when present, falling back to module helper. */
function resolveBadgeFileName(region, number) {
    const fn = (typeof window !== 'undefined' && typeof window.getBadgeFileName === 'function')
        ? window.getBadgeFileName
        : fallbackGetBadgeFileName;
    return fn(region, number);
}

/** Safely replace an element's contents using DOMParser. */
function setSafeHTML(element, html) {
    if (!element || typeof element.replaceChildren !== 'function') return;
    const doc = new DOMParser().parseFromString(html, 'text/html');
    element.replaceChildren(...doc.body.childNodes);
}

const parseAreaNames = (id) => {
    let result = [];
    if (id.includes(",")) {
        let parts = id.split(",");
        let baseRoute = parts[0].replace(/[0-9]+$/, "").trim();
        result.push(parts[0].replace(/\s*\(.*?\)/, "").trim());
        for (let i = 1; i < parts.length; i++) {
            let num = parts[i].trim();
            if (!isNaN(num)) {
                result.push((baseRoute + " " + num).replace(/\s*\(.*?\)/, "").trim());
            } else {
                result.push(num.replace(/\s*\(.*?\)/, "").trim());
            }
        }
    } else {
        result.push(id.replace(/\s*\(.*?\)/, "").trim());
    }

    // Also include regional suffix variations so they match mapCoordinates names
    let expanded = [];
    result.forEach(area => {
        expanded.push(area);
        if (window.currentMapRegion) {
            expanded.push(`${area} (${window.currentMapRegion})`);
        }
    });

    return expanded;
};

window.currentMapRegion = 'Kanto';

window.switchMapRegion = function(region) {
    if (region === 'Johto' && !state.globalStats.hasSeenJohtoMap) {
        state.globalStats.hasSeenJohtoMap = true;
    }

    window.currentMapRegion = region;

    updateUI();
    showMap();
};



const GYM_BADGE_MAP = {
    // Johto
    violet_gym: ['Johto', 1], azalea_gym: ['Johto', 2], goldenrod_gym: ['Johto', 3], ecruteak_gym: ['Johto', 4],
    cianwood_gym: ['Johto', 5], olivine_gym: ['Johto', 6], mahogany_gym: ['Johto', 7], blackthorn_gym: ['Johto', 8],
    // Hoenn
    rustboro_gym: ['Hoenn', 1], dewford_gym: ['Hoenn', 2], mauville_gym: ['Hoenn', 3], lavaridge_gym: ['Hoenn', 4],
    petalburg_gym: ['Hoenn', 5], fortree_gym: ['Hoenn', 6], mossdeep_gym: ['Hoenn', 7], sootopolis_gym: ['Hoenn', 8],
    // Kanto
    pewter_gym: ['Kanto', 1], cerulean_gym: ['Kanto', 2], vermilion_gym: ['Kanto', 3], celadon_gym: ['Kanto', 4],
    saffron_gym: ['Kanto', 5], fuchsia_gym: ['Kanto', 6], cinnabar_gym: ['Kanto', 7], viridian_gym: ['Kanto', 8],
    // Sinnoh
    oreburgh_gym: ['Sinnoh', 1], eterna_gym: ['Sinnoh', 2], hearthome_gym: ['Sinnoh', 3], veilstone_gym: ['Sinnoh', 4],
    pastoria_gym: ['Sinnoh', 5], canalave_gym: ['Sinnoh', 6], snowpoint_gym: ['Sinnoh', 7], sunyshore_gym: ['Sinnoh', 8],
    // Unova2
    aspertia_gym: ['Unova2', 1], virbank_gym: ['Unova2', 2], castelia_gym: ['Unova2', 3], nimbasa_gym: ['Unova2', 4],
    driftveil_gym: ['Unova2', 5], mistralton_gym: ['Unova2', 6], opelucid_gym: ['Unova2', 7], humilau_gym: ['Unova2', 8],
    // Kalos
    santalunecitygym: ['Kalos', 1], cyllagecitygym: ['Kalos', 2], 'Cyllage Gym': ['Kalos', 2],
    shalourcitygym: ['Kalos', 3], coumarinecitygym: ['Kalos', 4], lumiosecitygym: ['Kalos', 5],
    laverrecitygym: ['Kalos', 6], anistarcitygym: ['Kalos', 7], snowbellecitygym: ['Kalos', 8]
};

export function isSafariLocation(locationName) {
    if (!locationName || typeof locationName !== 'string') return false;
    return locationName.toLowerCase().includes('safari');
}

function generateMarkerHtml(locationId, locationName, coords, isUnlocked, hasNewNotification, showCheckmark) {
    if (!isUnlocked) return '';

    let markerImg = './Assets/Map/Spots/Spot.png';
    let isClickable = true;

    if (locationId === 'professor_lab' || locationId === 'johto_professor_lab') {
        markerImg = './Assets/Map/Spots/Spot_Lab.png';
    } else if (locationId === 'pokemon_center___market' || locationId === 'pokecenter_pokemarket') {
        markerImg = './Assets/Map/Spots/Spot_PCPM.png';
    } else if ((locationId === 'safari_zone' || locationId === 'kanto_safari_zone' || locationId.includes('safari') || isSafariLocation(locationName)) && locationName !== 'Friend Safari Surroundings') {
        markerImg = './Assets/Map/Spots/Spot_Safariball.png';
    } else if (locationId === 'casino' || locationId === 'goldenrod_game_corner') {
        markerImg = './Assets/Map/Spots/Spot_Casino.png';
    } else if (locationId === 'daycare') {
        markerImg = './Assets/Map/Spots/Spot_Daycare.png';
    } else if (locationId === 'battle_stadium') {
        markerImg = './Assets/Map/Spots/Spot_BattleStadium.png';
    } else if (GYM_BADGE_MAP[locationId]) {
        const [badgeRegion, badgeNum] = GYM_BADGE_MAP[locationId];
        markerImg = `./Assets/Gym/Badges/${resolveBadgeFileName(badgeRegion, badgeNum)}`;
    }

    // Standardize spot sizes
    let markerWidth = "24px";
    let markerHeight = "24px";
    let dropShadow = "none";

    if (locationId === 'pokemon_center___market' || locationId === 'pokecenter_pokemarket') {
        markerWidth = "32px";
        markerHeight = "32px";
    } else if (['professor_oak_lab', 'johto_oak_lab', 'professor_lab', 'indigo_plateu', 'safari_zone', 'kanto_safari_zone', 'casino', 'goldenrod_game_corner', 'daycare', 'battle_stadium', 'trade_with_friends_hub'].includes(locationId) || locationId.includes('safari') || isSafariLocation(locationName)) {
        markerWidth = "28px";
        markerHeight = "28px";
    }

    if (markerImg !== './Assets/Extra/Spot.png') {
        // Solid black outline (4-axis) and a larger soft white glow
        dropShadow = "drop-shadow(1px 0px 0 #000) drop-shadow(-1px 0px 0 #000) drop-shadow(0px 1px 0 #000) drop-shadow(0px -1px 0 #000) drop-shadow(0px 0px 5px rgba(255, 255, 255, 0.8))";
    }

    let markerClass = hasNewNotification ? 'map-marker pulse-marker' : 'map-marker';
    let displayLocationName = locationName.replace(/\s*\([^)]+\)$/, '');
    let safeLocationName = displayLocationName.replace(/'/g, "&#39;");
    let jsLocationName = locationName.replace(/'/g, "\\'");

    return `
        <div class="${markerClass}"
             data-location="${safeLocationName}"
             title="${safeLocationName}"
             style="position: absolute; left: ${coords.x}%; top: ${coords.y}%; width: ${markerWidth}; height: ${markerHeight}; background-image: url('${markerImg}'); background-size: contain; background-repeat: no-repeat; transform: translate(-50%, -50%); filter: ${dropShadow}; cursor: ${isClickable ? 'pointer' : 'default'};"
             ${isClickable ? `onclick="window.navigateToLocation('${jsLocationName}')"` : ''}
             onmousemove="window.showMapTooltip(event, '${jsLocationName}')"
             onmouseout="window.hideMapTooltip()">
             ${showCheckmark ? '<div style="position:absolute; top:-5px; right:-5px; background:green; color:white; border-radius:50%; width:15px; height:15px; font-size:10px; line-height:15px; text-align:center;">✓</div>' : ''}
        </div>
    `;
}

function generateRegionButtonsHtml(unlockedRegions, allRegions) {
    if (!unlockedRegions || unlockedRegions.length <= 1) return '';

    let exclamationHtml = !state.globalStats.hasSeenJohtoMap ? `<img src="Assets/Extra/Icons/ExclamationMark.png" style="position: absolute; top: -5px; right: -5px; width: 15px; height: auto; pointer-events: none; z-index: 10;">` : '';

    let buttonsHtml = unlockedRegions.map(rName => {
        let extra = rName === 'Johto' ? exclamationHtml : '';
        let style = window.currentMapRegion === rName
            ? 'background: linear-gradient(to bottom, #3498db, #2980b9); color: white; border: 1px solid #3498db; box-shadow: 0 2px 4px rgba(0,0,0,0.2);'
            : 'background: transparent; color: rgba(255, 255, 255, 0.7); border: 1px solid transparent;';
        return `<button onclick="window.switchMapRegion('${rName}')" style="${style} border-radius: 15px; padding: 5px 15px; font-weight: bold; cursor: pointer; font-size: 14px; transition: all 0.2s; position: relative;" onmousedown="event.stopPropagation()">${rName}${extra}</button>`;
    }).join('');

    return `
        <div style="display: flex; flex-wrap: wrap; justify-content: center; background: rgba(0, 0, 0, 0.2); border-radius: 20px; padding: 3px; gap: 5px;">
            ${buttonsHtml}
        </div>
    `;
}

function getRegionStats(regionName) {
    if (regionName === state.currentRegionName) {
        return state.stats;
    }
    if (state.regions && state.regions[regionName] && state.regions[regionName].stats) {
        return state.regions[regionName].stats;
    }
    return null;
}

function getRegionTrainer(regionName) {
    if (regionName === state.currentRegionName) {
        return state.trainer;
    }
    if (state.regions && state.regions[regionName] && state.regions[regionName].trainer) {
        return state.regions[regionName].trainer;
    }
    return null;
}

const REGION_GYM_BADGE_REQUIREMENTS = {
    Kanto: {
        pewter_gym: 1, cerulean_gym: 2, vermilion_gym: 3, celadon_gym: 4,
        fuchsia_gym: 5, saffron_gym: 6, cinnabar_gym: 7, viridian_gym: 8
    },
    Sinnoh: {
        oreburgh_gym: 1, eterna_gym: 2, hearthome_gym: 3, veilstone_gym: 4,
        pastoria_gym: 5, canalave_gym: 6, snowpoint_gym: 7, sunyshore_gym: 8
    },
    Johto: {
        violet_gym: 1, azalea_gym: 2, goldenrod_gym: 3, ecruteak_gym: 4,
        cianwood_gym: 5, olivine_gym: 6, mahogany_gym: 7, blackthorn_gym: 8,
        pewter_gym: 9, cerulean_gym: 10, vermilion_gym: 11, celadon_gym: 12,
        saffron_gym: 13, fuchsia_gym: 14, cinnabar_gym: 15, viridian_gym: 16
    },
    Hoenn: {
        rustboro_gym: 1, dewford_gym: 2, mauville_gym: 3, lavaridge_gym: 4,
        petalburg_gym: 5, fortree_gym: 6, mossdeep_gym: 7, sootopolis_gym: 8
    },
    Kalos: {
        santalunecitygym: 1, cyllagecitygym: 2, 'Cyllage Gym': 2, shalourcitygym: 3,
        coumarinecitygym: 4, lumiosecitygym: 5, laverrecitygym: 6, anistarcitygym: 7, snowbellecitygym: 8
    },
    Unova: {
        aspertia_gym: 1, virbank_gym: 2, castelia_gym: 3, nimbasa_gym: 4,
        driftveil_gym: 5, mistralton_gym: 6, opelucid_gym: 7, humilau_gym: 8
    }
};

function getRegionCoordinatesMap(region) {
    const configKeyByRegion = {
        Kanto: 'mapCoordinates',
        Sinnoh: 'sinnohMapCoordinates',
        Johto: 'johtoMapCoordinates',
        Hoenn: 'hoennMapCoordinates',
        Kalos: 'kalosMapCoordinates',
        Unova: 'unovaMapCoordinates'
    };
    const key = configKeyByRegion[region];
    return key ? (state.config?.[key] || {}) : null;
}

function getUnlockedAreas() {
    let unlockedAreas = new Set();
    unlockedAreas.add("Kanto Professor Lab");
    unlockedAreas.add("Johto Professor Lab");
    unlockedAreas.add("Hoenn Professor Lab");
    unlockedAreas.add("Sinnoh Professor Lab");
    unlockedAreas.add("Unova Professor Lab");
    unlockedAreas.add("Kalos Professor Lab");

    let targetStats = getRegionStats(window.currentMapRegion);

    if (!targetStats) {
        return unlockedAreas;
    }

    // Determine if the player has no pokemon *in the targeted region*
    // For the current region, we check state.party and state.storage.
    // For other regions, we need to check state.regions[...].party and state.regions[...].storage.
    let targetParty = state.party;
    let targetStorage = state.storage;
    if (window.currentMapRegion !== state.currentRegionName && state.regions && state.regions[window.currentMapRegion]) {
        targetParty = state.regions[window.currentMapRegion].party || [];
        targetStorage = state.regions[window.currentMapRegion].storage || [];
    }

    const noPokemon = targetParty.length === 0 && targetStorage.length === 0;
    const isStarterPending = !targetStats.hasPickedStarter && noPokemon;

    if (isStarterPending) {
        return unlockedAreas;
    }

    unlockedAreas.add("PokeCenter & PokeMarket");

    if (window.currentMapRegion === "Kanto") {
        unlockedAreas.add("Route 1 (Kanto)");
    }
    if (window.currentMapRegion === "Johto") {
        unlockedAreas.add("Route 29");
    }
    if (window.currentMapRegion === "Hoenn") {
        unlockedAreas.add("Route 101");
    }
    if (window.currentMapRegion === "Sinnoh") {
        unlockedAreas.add("Route 201");
    }
    if (window.currentMapRegion === "Unova") {
        unlockedAreas.add("Route 19");
    }
    if (window.currentMapRegion === "Kalos") {
        unlockedAreas.add("Route 2");
    }

    if (targetStats.completed150Challenge || (targetStats.completedChallengeIds && targetStats.completedChallengeIds.includes("Extra Challenge B"))) {
        unlockedAreas.add("Temporal Sanctuary Spot");
    }

    if (targetStats.completedChallengeIds) {
        targetStats.completedChallengeIds.forEach(id => {
            parseAreaNames(id).forEach(area => unlockedAreas.add(area));
        });
    }
    if (targetStats.activeChallenges) {
        targetStats.activeChallenges.forEach(id => {
            parseAreaNames(id).forEach(area => unlockedAreas.add(area));
        });
    }

    if (unlockedAreas.has("Ilex Forest 2")) {
        unlockedAreas.delete("Ilex Forest");
    }

    return unlockedAreas;
}

function generateMarkersForRegion(region, unlockedAreas) {
    let isSleeping = false;
    if (state.currentRegionName === region) {
        isSleeping = state.isZzZMode;
    } else if (state.regions && state.regions[region]) {
        isSleeping = state.regions[region].isZzZMode;
    }

    if (isSleeping) {
        return `
            <div style="position: absolute; top: 50%; left: 50%; transform: translate(-50%, -50%); cursor: pointer; text-align: center; z-index: 1000;" onclick="window.promptWakeUpRegion('${region}')" title="Wake Up ${region}">
                <img src="./Assets/Extra/Jigglypuff Dust.png" style="width: 150px; height: auto; filter: drop-shadow(0 0 15px rgba(255, 192, 203, 0.8)); animation: pulse 2s infinite;">
                <div style="color: white; font-weight: bold; margin-top: 10px; font-size: 18px; text-shadow: 0 2px 4px black;">ZzZ Mode</div>
                <div style="color: #fbcfe8; font-size: 14px; text-shadow: 0 1px 2px black;">Click to Wake Up</div>
            </div>
        `;
    }

    let html = '';
    const coordsMap = getRegionCoordinatesMap(region);
    if (!coordsMap) {
        // Fallback for new regions
        let coords = { x: 50, y: 50 };
        let locationName = "Professor Lab";
        html += generateMarkerHtml("professor_lab", locationName, coords, true, false, false);
        return html;
    }

    const fallbackToActive = !state.currentRegionName;
    const targetStats = getRegionStats(region) || (fallbackToActive ? state.stats : null) || {};
    const targetTrainer = getRegionTrainer(region) || (fallbackToActive ? state.trainer : null) || { badges: 0 };
    const badgeCount = targetTrainer.badges || 0;
    const gymBadgeReqs = REGION_GYM_BADGE_REQUIREMENTS[region] || {};

    for (const [locationId, locationData] of Object.entries(coordsMap)) {
        const locationName = locationData.name;
        const coords = locationData;
        if (!unlockedAreas.has(locationName)) continue;

        let hasNewNotification = false;
        let showCheckmark = false;

        if (targetStats.newRoutes && targetStats.newRoutes.some(r => parseAreaNames(r).includes(locationName))) {
            hasNewNotification = true;
        }
        if (region === 'Kanto' && locationId === 'professor_lab' && targetStats.showProfMarkerPulse) {
            hasNewNotification = true;
        }

        const requiredBadges = gymBadgeReqs[locationId];
        if (requiredBadges !== undefined && badgeCount >= requiredBadges) {
            showCheckmark = true;
        }

        html += generateMarkerHtml(locationId, locationName, coords, true, hasNewNotification, showCheckmark);
    }
    return html;
}

function setupMapWindowDimensions(currentRegionObj, targetWidth) {
    if (window.windowManager) {
        const winEl = document.getElementById('window-map');
        if (winEl) {
            const contentPanel = winEl.querySelector('.content-panel');
            if (contentPanel) { contentPanel.style.padding = '0'; }
            const header = winEl.querySelector('.window-header');
            const headerH = header ? header.offsetHeight : 30;
            const savedWidth = state.settings?.windowSettings?.['window-map']?.width;
            const widthVal = parseFloat(savedWidth || winEl.style.width || targetWidth);
            const aspectRatio = currentRegionObj.width / currentRegionObj.height;
            const targetHeight = (widthVal / aspectRatio) + headerH;
            if (!savedWidth) {
                winEl.style.width = widthVal + 'px';
            }
            winEl.style.height = targetHeight + 'px';
            winEl._mapAspectRatio = aspectRatio;
            const scaler = winEl.querySelector('.window-content-scaler');
            if (scaler) {
                scaler.style.height = '100%';
                scaler.style.width = '100%';
                scaler.style.transform = 'none';
            }
        }
    }
}

export function showMap() {
    if (state.stats.hasUnseenMap || state.stats.showMapProfNotification) {
        state.stats.hasUnseenMap = false;
        state.stats.showMapProfNotification = false;
        updateUI();
    }

    let unlockedAreas = getUnlockedAreas();

    const regions = [
        { name: 'Kanto', mapFile: '1 Kanto Map.png', width: 2571, height: 1818 },
        { name: 'Johto', mapFile: '2 Johto Map.png', width: 1500, height: 658 },
        { name: 'Hoenn', mapFile: '3 Hoenn Map.png', width: 1250, height: 884 },
        { name: 'Sinnoh', mapFile: '4 Sinnoh Map.png', width: 1024, height: 724 },
        { name: 'Unova', mapFile: '5 Unova Map.png', width: 1280, height: 837 },
        { name: 'Kalos', mapFile: '6 Kalos Map.png', width: 1032, height: 676 },
        { name: 'Alola', mapFile: '7 1 Alola Map.png', width: 1280, height: 905 },
        { name: 'Galar', mapFile: '8 Galar Map.png', width: 1554, height: 2198 },
        { name: 'Hisui', mapFile: '9 Hisui Map.png', width: 1280, height: 711 },
        { name: 'Paldea', mapFile: '10 Paldea Map.png', width: 1280, height: 905 }
    ];

    let unlockedRegions = regions.map(r => r.name);

    if (unlockedRegions.includes('Johto')) { state.globalStats.hasSeenJohtoMap = true; }

    let regionButtonsHtml = generateRegionButtonsHtml(unlockedRegions, regions);

    const currentRegionObj = regions.find(r => r.name === window.currentMapRegion) || regions[0];
    let mapImage = `./Assets/Map/${currentRegionObj.mapFile}`;
    let aspectRatio = `${currentRegionObj.width} / ${currentRegionObj.height}`;

    let html = `
        <div id="interactive-map" style="position: relative; width: 100%; aspect-ratio: ${aspectRatio}; background-image: url('${mapImage}'); background-size: 100% 100%; background-repeat: no-repeat; background-position: center;">
    `;

    html += generateMarkersForRegion(window.currentMapRegion, unlockedAreas);

    // Inner modal for gym overlays natively locked to the map
    html += `
            <div id="map-inner-modal-overlay" onclick="window.handleMapInnerModalBackdropClick(event)" style="display: none; position: absolute; top: 0; left: 0; width: 100%; height: 100%; background: rgba(2, 6, 23, 0.72); backdrop-filter: blur(3px); z-index: 1000; align-items: center; justify-content: center; box-sizing: border-box; padding: 2%; /* Fallback padding */">
                <div id="map-inner-modal" class="floating-window" onclick="event.stopPropagation()" onmousedown="event.stopPropagation()" style="box-sizing: border-box; display: flex; flex-direction: column; overflow: hidden; /* Dynamic sizing will be applied via JS */ max-width: 100%; max-height: 100%;">
                    <div class="window-header" style="position: relative; cursor: default;">
                        <span id="map-inner-modal-title">Gym</span>
                        <span id="btn-close-map-inner-modal" class="window-ctrl-btn is-close" onclick="window.closeMapInnerModal()" style="position: absolute; top: 50%; transform: translateY(-50%); right: 8px;">X</span>
                    </div>
                    <div class="window-content-container" style="flex: 1; display: flex; height: 100%; min-height: 0;">
                        <div id="map-inner-modal-content" class="content-panel" style="width: 100%; height: 100%; overflow-y: auto; position: relative;">
                            <!-- Content injected via JS -->
                        </div>
                    </div>
                </div>
            </div>
        </div>
    `;

    let titleHtml = `
        <div style="display: flex; flex-direction: column; align-items: center; gap: 5px;">
            <div style="font-weight: bold; font-size: 18px; color: white;">Map</div>
            ${regionButtonsHtml}
        </div>
    `;

    if (window.showModal) {
        // Calculate max width for typical screens
        const ar = currentRegionObj.width / currentRegionObj.height;
        const targetWidth = Math.min(1000, window.innerHeight * 0.8 * ar) + "px";

        if (unlockedRegions.length > 1 || state.globalStats.hasSeenJohtoMap) {
            window.showModal(titleHtml, html, 'window-map', targetWidth);
        } else {
            window.showModal('Map', html, 'window-map', targetWidth);
        }

        setupMapWindowDimensions(currentRegionObj, targetWidth);
    }
}

window.handleMapInnerModalBackdropClick = function(event) {
    const overlay = document.getElementById('map-inner-modal-overlay');
    const modal = document.getElementById('map-inner-modal');
    if (!overlay || overlay.style.display === 'none') return;

    // Only close if clicked directly on the overlay backdrop outside the inner modal
    if (event && event.target !== overlay) {
        return;
    }

    const gymContentArea = document.getElementById('gym-content-area');
    if (gymContentArea && (gymContentArea.isConnected ?? true)) {
        // Gym modal: only close in first phase (when enter button is displayed)
        const isGymActive = globals.battleSystem?.gymState?.isActive;
        const enterBtn = gymContentArea.querySelector('#btn-enter-gym') ||
            Array.from(gymContentArea.querySelectorAll('button')).find(b => b.textContent.trim().toLowerCase() === 'enter');

        if (!isGymActive && enterBtn && enterBtn.style.display !== 'none') {
            window.closeMapInnerModal();
        }
        return;
    }

    // For other map inner modals (Safari Zone, Casino), clicking backdrop closes it
    window.closeMapInnerModal();
};

window.closeMapInnerModal = function() {
    const overlay = document.getElementById('map-inner-modal-overlay');
    if (overlay) {
        overlay.style.display = 'none';
        const content = document.getElementById('map-inner-modal-content');
        if (content && typeof content.replaceChildren === 'function') content.replaceChildren();
    }

    if (globals.battleSystem && globals.battleSystem.gymState && globals.battleSystem.gymState.isActive) {
        globals.battleSystem.stopGymBattle();
    }
};

export function navigateToLocation(locationName) {
    if (globals.battleSystem && globals.battleSystem.gymState && globals.battleSystem.gymState.isActive) {
        if (window.closeModal) {
            window.closeModal('window-map');
            window.closeModal();
        } else if (window.windowManager) {
            window.windowManager.closeDynamicWindow('window-map');
        }
        return;
    }

    if (window.currentMapRegion && window.currentMapRegion !== state.currentRegionName) {
        // Stop battle completely before swapping
        if (globals.battleSystem) {
             globals.battleSystem.stop();
             globals.battleSystem.activeEncounter = null;
             globals.battleSystem.isSearching = false;
             if (globals.battleSystem.gymState) globals.battleSystem.gymState.isActive = false;
        }
        swapRegion(window.currentMapRegion);
        if (window.updateZzZModeUI) window.updateZzZModeUI();
    }

    if (state.stats.newRoutes && state.stats.newRoutes.some(r => parseAreaNames(r).includes(locationName))) {
        state.stats.newRoutes = state.stats.newRoutes.filter(r => !parseAreaNames(r).includes(locationName));
    }

    const battleSystem = globals.battleSystem;

    const isGymLocation = locationName.includes("Gym") || locationName.includes("Pokemon League");

    // Do not set currentRoute to Gym, Pokemon League, or Safari to keep player fighting on current route until explicitly entering
    if (!isGymLocation && !isSafariLocation(locationName)) {
        state.currentRoute = locationName;
    }

    if (!isGymLocation) {
        if (window.closeModal) window.closeModal();

        // Ensure main view and party windows are open when navigating, especially to places like Professor Lab
        if (window.windowManager) {
            window.windowManager.toggleWindow('main-view-window', true);
            window.windowManager.toggleWindow('party-window', true);
        }
    } else {
        // Keep focus on map window when opening a gym so main-view is not brought to top
        if (window.windowManager) {
            const mapWin = document.getElementById('window-map');
            if (mapWin) window.windowManager.focusWindow(mapWin);
        }
    }

    if (locationName === "Battle Stadium") {
        if (battleSystem) {
             battleSystem.stop();
             battleSystem.activeEncounter = null;
             battleSystem.isSearching = false;
             if (battleSystem.gymState) battleSystem.gymState.isActive = false;
        }
        switchView("BATTLE_STADIUM");
    } else if (locationName.endsWith("Professor Lab") || locationName === "Professor Lab") {
        if (battleSystem) {
             battleSystem.stop();
             battleSystem.activeEncounter = null;
             battleSystem.isSearching = false;
             if (battleSystem.gymState) battleSystem.gymState.isActive = false;
        }
        if (state.currentRegionName === 'Hoenn') {
            switchView("HOENN_PROFESSOR_LAB");
        } else if (state.currentRegionName === 'Johto') {
            switchView("JOHTO_PROFESSOR_LAB");
        } else {
            switchView("PROFESSOR_LAB");
        }
    } else if (isSafariLocation(locationName)) {
        if (battleSystem) {
            battleSystem.stop();
        }
        window.currentSafariZone = locationName;

        const vGym = document.getElementById("map-inner-modal-content");
        const vGymTitle = document.getElementById("map-inner-modal-title");
        if (vGymTitle) vGymTitle.innerText = locationName;
        if (vGym) {
            vGym.replaceChildren();
            vGym.style.position = "relative";
            vGym.style.height = "100%";
            vGym.style.backgroundImage = "url('./Assets/BG/SafariZone.png')";
            vGym.style.backgroundSize = "cover";
            vGym.style.backgroundPosition = "center";

            let html = `
                <div style="position: absolute; top: 30%; left: 50%; transform: translateX(-50%); text-align: center; color: white; background: rgba(0,0,0,0.8); padding: 20px; border-radius: 10px; border: 2px solid #1abc9c; box-shadow: 0 8px 24px rgba(0, 0, 0, 0.65), 0 0 14px rgba(26, 188, 156, 0.25); font-size: 20px; width: 60%; font-family: monospace;">
                  <p id="safari-welcome-msg">Welcome to ${locationName}! Here we charge a fee per battle you have and you can use our SafariBalls at will.<br><br>Do you wanna enter ${locationName}?</p>
                  <button id="btn-enter-safari" style="margin-top: 20px; padding: 10px 20px; font-size: 18px; cursor: pointer; background: #ffcc00; border: none; border-radius: 5px; color: black; font-weight: bold;">Enter ($${state.config.balance.safariZonePrice || 500})</button>
                </div>
            `;
            setSafeHTML(vGym, html);

            const btn = document.getElementById('btn-enter-safari');
            if (btn) {
                btn.onclick = () => { if (window.enterSafariZone) window.enterSafariZone(); };
            }
        }

        const overlay = document.getElementById('map-inner-modal-overlay');
        const modal = document.getElementById('map-inner-modal');
        if (overlay && modal) {
            overlay.style.display = 'flex';

            const mapWin = document.getElementById('interactive-map');
            if (mapWin) {
                const applyPaddingAndAspect = (aspectRatio) => {
                    const mapW = mapWin.offsetWidth;
                    const mapH = mapWin.offsetHeight;
                    const maxDim = Math.max(mapW, mapH);
                    const padding = maxDim * 0.02;
                    overlay.style.padding = `${padding}px`;

                    modal.style.aspectRatio = aspectRatio ? aspectRatio.toString() : 'auto';
                    modal.style.maxHeight = '100%';
                    modal.style.maxWidth = '100%';
                };

                const img = new Image();
                img.onload = () => applyPaddingAndAspect(img.naturalWidth / img.naturalHeight);
                img.src = './Assets/BG/SafariZone.png';
            }
        }
    } else if (locationName === "Celadon Casino" || locationName === "Goldenrod Game Corner") {
        window.currentCasinoHub = locationName;
        if (battleSystem) {
             battleSystem.stop();
             battleSystem.activeEncounter = null;
             battleSystem.isSearching = false;
             if (battleSystem.gymState) battleSystem.gymState.isActive = false;
        }

        const vGym = document.getElementById("map-inner-modal-content");
        const vGymTitle = document.getElementById("map-inner-modal-title");
        if (vGymTitle) vGymTitle.innerText = locationName;

        if (vGym) {
            vGym.replaceChildren();
            vGym.style.position = "relative";
            vGym.style.height = "100%";
            vGym.style.backgroundImage = "url('./Assets/BG/Casino.png')";
            vGym.style.backgroundSize = "cover";
            vGym.style.backgroundPosition = "center";

            const casinoContent = document.createElement("div");
            casinoContent.id = "casino-content-inner";
            casinoContent.style.width = '100%';
            casinoContent.style.height = '100%';
            casinoContent.style.display = 'flex';
            casinoContent.style.alignItems = 'center';
            casinoContent.style.justifyContent = 'center';

            const btnContainer = document.createElement("div");
            btnContainer.style.display = 'flex';
            btnContainer.style.flexDirection = 'row';
            btnContainer.style.gap = '10px';
            btnContainer.style.width = '100%';
            btnContainer.style.height = '100%';
            casinoContent.appendChild(btnContainer);
            vGym.appendChild(casinoContent);

            const completedChallenges = state.stats.completedChallengeIds || [];
            const isUnlockedByAreaId = (areaId) => completedChallenges.some(id => parseAreaNames(id).includes(areaId));

            let machinesHtml = `
                <div style="position: absolute; top: 20px; left: 0; width: 100%; text-align: center; z-index: 10; color: white; text-shadow: 2px 2px 4px black; font-size: 24px;">
                    <h3>Standard Route $${state.config.balance.casinoPrices?.standard || 75} 2x Shiny $${state.config.balance.casinoPrices?.doubleShiny || 200}</h3>
                </div>
                <div style="display: flex; justify-content: space-evenly; align-items: center; width: 100%; height: 100%; padding: 15px; box-sizing: border-box;">
                    <div style="position: relative; text-align: center; flex: 1 1 0; max-width: 200px; margin: 0 5px;">
                        <img src="./Assets/Extra/Casino/${window.currentMapRegion === 'Johto' ? (window.currentCasinoHub === 'Goldenrod Game Corner' ? 'Region2 Johto Babies.png' : 'Region2 Kanto Starter Troupe.png') : 'Region1 Starter Troupe.png'}" alt="Starter Troupe" style="width: 100%; display: block; filter: drop-shadow(0 0 10px black);">
                        <div onclick="window.startCasinoEncounter(false, window.currentMapRegion === 'Johto' && window.currentCasinoHub === 'Goldenrod Game Corner' ? 'Goldenrod Babies Corner' : 'Celadon Casino Starter Troupe')" style="position: absolute; left: 15.38%; top: 33.47%; width: 62.06%; height: 28.08%; cursor: pointer; clip-path: polygon(0 0, 100% 0, 100% 100%, 0 100%);" title="Standard Encounter ($${state.config.balance.casinoPrices?.standard || 75})"></div>
                        <div onclick="window.startCasinoEncounter(true, window.currentMapRegion === 'Johto' && window.currentCasinoHub === 'Goldenrod Game Corner' ? 'Goldenrod Babies Corner' : 'Celadon Casino Starter Troupe')" style="position: absolute; left: 18.14%; top: 85.36%; width: 55.62%; height: 10.16%; cursor: pointer; clip-path: polygon(0 0, 100% 0, 100% 100%, 0 100%);" title="2x Shiny ($${state.config.balance.casinoPrices?.doubleShiny || 200})"></div>
                    </div>
            `;

            if (window.currentCasinoHub === 'Goldenrod Game Corner' || ((window.currentMapRegion === 'Johto' && window.currentCasinoHub !== 'Goldenrod Game Corner') ? isUnlockedByAreaId('Celadon Casino Starter Troupe') : isUnlockedByAreaId('Celadon Casino'))) {
                machinesHtml += `
                    <div style="position: relative; text-align: center; flex: 1 1 0; max-width: 200px; margin: 0 5px;">
                        <img src="./Assets/Extra/Casino/${window.currentMapRegion === 'Johto' ? (window.currentCasinoHub === 'Goldenrod Game Corner' ? 'Region2 Johto Lucky Spot.png' : 'Region2 Kanto Babies.png') : 'Region1 Mid Troupe.png'}" alt="${window.currentMapRegion === 'Johto' ? 'Babies' : 'Mid Troupe'}" style="width: 100%; display: block; filter: drop-shadow(0 0 10px black);">
                        <div onclick="window.startCasinoEncounter(false, window.currentMapRegion === 'Johto' && window.currentCasinoHub === 'Goldenrod Game Corner' ? 'Goldenrod Lucky Spot Corner' : 'Celadon Casino Mid Troupe')" style="position: absolute; left: 15.38%; top: 33.47%; width: 62.06%; height: 28.08%; cursor: pointer; clip-path: polygon(0 0, 100% 0, 100% 100%, 0 100%);" title="Standard Encounter ($${state.config.balance.casinoPrices?.standard || 75})"></div>
                        <div onclick="window.startCasinoEncounter(true, window.currentMapRegion === 'Johto' && window.currentCasinoHub === 'Goldenrod Game Corner' ? 'Goldenrod Lucky Spot Corner' : 'Celadon Casino Mid Troupe')" style="position: absolute; left: 18.14%; top: 85.36%; width: 55.62%; height: 10.16%; cursor: pointer; clip-path: polygon(0 0, 100% 0, 100% 100%, 0 100%);" title="2x Shiny ($${state.config.balance.casinoPrices?.doubleShiny || 200})"></div>
                    </div>
                `;
            }

            if ((window.currentMapRegion === 'Johto' ? isUnlockedByAreaId('Dojo') : isUnlockedByAreaId('Big Fishing Spot')) && window.currentCasinoHub !== 'Goldenrod Game Corner') {
                machinesHtml += `
                    <div style="position: relative; text-align: center; flex: 1 1 0; max-width: 200px; margin: 0 5px;">
                        <img src="./Assets/Extra/Casino/${window.currentMapRegion === 'Johto' ? 'Region2 Late Troupe Kanto.png' : 'Region1 Late Troupe.png'}" alt="Late Troupe" style="width: 100%; display: block; filter: drop-shadow(0 0 10px black);">
                        <div onclick="window.startCasinoEncounter(false, 'Celadon Casino Late Troupe')" style="position: absolute; left: 15.38%; top: 33.47%; width: 62.06%; height: 28.08%; cursor: pointer; clip-path: polygon(0 0, 100% 0, 100% 100%, 0 100%);" title="Standard Encounter ($${state.config.balance.casinoPrices?.standard || 75})"></div>
                        <div onclick="window.startCasinoEncounter(true, 'Celadon Casino Late Troupe')" style="position: absolute; left: 18.14%; top: 85.36%; width: 55.62%; height: 10.16%; cursor: pointer; clip-path: polygon(0 0, 100% 0, 100% 100%, 0 100%);" title="2x Shiny ($${state.config.balance.casinoPrices?.doubleShiny || 200})"></div>
                    </div>
                `;
            }

            if ((window.currentMapRegion === 'Johto' ? isUnlockedByAreaId('Celadon Casino Special Spot') : isUnlockedByAreaId('Small Fishing Spot')) && window.currentCasinoHub !== 'Goldenrod Game Corner') {
                machinesHtml += `
                    <div style="position: relative; text-align: center; flex: 1 1 0; max-width: 200px; margin: 0 5px;">
                        <img src="./Assets/Extra/Casino/${window.currentMapRegion === 'Johto' ? 'Region2 Kanto Eeveelutions.png' : 'Region1 Eeveelutions.png'}" alt="Eeveelutions" style="width: 100%; display: block; filter: drop-shadow(0 0 10px black);">
                        <div onclick="window.startCasinoEncounter(false, 'Celadon Casino Eeveelutions')" style="position: absolute; left: 15.38%; top: 33.47%; width: 62.06%; height: 28.08%; cursor: pointer; clip-path: polygon(0 0, 100% 0, 100% 100%, 0 100%);" title="Standard Encounter ($${state.config.balance.casinoPrices?.standard || 75})"></div>
                        <div onclick="window.startCasinoEncounter(true, 'Celadon Casino Eeveelutions')" style="position: absolute; left: 18.14%; top: 85.36%; width: 55.62%; height: 10.16%; cursor: pointer; clip-path: polygon(0 0, 100% 0, 100% 100%, 0 100%);" title="2x Shiny ($${state.config.balance.casinoPrices?.doubleShiny || 200})"></div>
                    </div>
                `;
            }

            if ((window.currentMapRegion === 'Johto' ? isUnlockedByAreaId('Celadon Casino Babies') : isUnlockedByAreaId('Fighting Dojo')) && window.currentCasinoHub !== 'Goldenrod Game Corner') {
                machinesHtml += `
                    <div style="position: relative; text-align: center; flex: 1 1 0; max-width: 200px; margin: 0 5px;">
                        <img src="./Assets/Extra/Casino/${window.currentMapRegion === 'Johto' ? 'Region2 Kanto Special Spot.png' : 'Region1 Special Spot.png'}" alt="Special Spot" style="width: 100%; display: block; filter: drop-shadow(0 0 10px black);">
                        <div onclick="window.startCasinoEncounter(false, 'Celadon Casino Special Spot')" style="position: absolute; left: 15.38%; top: 33.47%; width: 62.06%; height: 28.08%; cursor: pointer; clip-path: polygon(0 0, 100% 0, 100% 100%, 0 100%);" title="Standard Encounter ($${state.config.balance.casinoPrices?.standard || 75})"></div>
                        <div onclick="window.startCasinoEncounter(true, 'Celadon Casino Special Spot')" style="position: absolute; left: 18.14%; top: 85.36%; width: 55.62%; height: 10.16%; cursor: pointer; clip-path: polygon(0 0, 100% 0, 100% 100%, 0 100%);" title="2x Shiny ($${state.config.balance.casinoPrices?.doubleShiny || 200})"></div>
                    </div>
                `;
            }

            machinesHtml += `</div>`;
            setSafeHTML(btnContainer, machinesHtml);
        }

        const overlay = document.getElementById('map-inner-modal-overlay');
        const modal = document.getElementById('map-inner-modal');
        if (overlay && modal) {
            overlay.style.display = 'flex';

            const mapWin = document.getElementById('interactive-map');
            if (mapWin) {
                const applyPaddingAndAspect = (aspectRatio) => {
                    const mapW = mapWin.offsetWidth;
                    const mapH = mapWin.offsetHeight;
                    const maxDim = Math.max(mapW, mapH);
                    const padding = maxDim * 0.02;
                    overlay.style.padding = `${padding}px`;

                    modal.style.aspectRatio = aspectRatio ? aspectRatio.toString() : 'auto';
                    modal.style.maxHeight = '100%';
                    modal.style.maxWidth = '100%';
                };

                const img = new Image();
                img.onload = () => applyPaddingAndAspect(img.naturalWidth / img.naturalHeight);
                img.src = './Assets/BG/Casino.png';
            }
        }
    } else if (locationName.startsWith("Celadon Casino ") || locationName === "Celadon Casino Starter Troupe" || locationName === "Celadon Casino Babies" || locationName === "Celadon Casino Special Spot" || locationName === "Celadon Casino Eeveelutions" || locationName === "Celadon Casino Late Troupe" || locationName === "Goldenrod Babies Corner" || locationName === "Goldenrod Lucky Spot Corner") {
        if (!window.currentCasinoHub) window.currentCasinoHub = "Celadon Casino";
        if (battleSystem) {
             battleSystem.stop();
             battleSystem.activeEncounter = null;
             battleSystem.isSearching = false;
             if (battleSystem.gymState) battleSystem.gymState.isActive = false;
        }

        let bgImg = '';
        const isGoldenrod = window.currentCasinoHub === "Goldenrod Game Corner";

        if (locationName === 'Celadon Casino Starter Troupe' || locationName === 'Goldenrod Babies Corner') {
            bgImg = window.currentMapRegion === 'Johto' ? (isGoldenrod ? 'Region2 Johto Babies.png' : 'Region2 Kanto Starter Troupe.png') : 'Region1 Starter Troupe.png';
        }
        if (locationName === 'Celadon Casino Mid Troupe' || locationName === 'Celadon Casino Babies' || locationName === 'Goldenrod Lucky Spot Corner') {
            bgImg = window.currentMapRegion === 'Johto' ? (isGoldenrod ? 'Region2 Johto Lucky Spot.png' : 'Region2 Kanto Babies.png') : 'Region1 Mid Troupe.png';
        }
        if (locationName === 'Celadon Casino Late Troupe') {
            bgImg = window.currentMapRegion === 'Johto' ? (isGoldenrod ? '' : 'Region2 Late Troupe Kanto.png') : 'Region1 Late Troupe.png';
        }
        if (locationName === 'Celadon Casino Eeveelutions') {
            bgImg = window.currentMapRegion === 'Johto' ? (isGoldenrod ? '' : 'Region2 Kanto Eeveelutions.png') : 'Region1 Eeveelutions.png';
        }
        if (locationName === 'Celadon Casino Special Spot') {
            bgImg = window.currentMapRegion === 'Johto' ? (isGoldenrod ? '' : 'Region2 Kanto Special Spot.png') : 'Region1 Special Spot.png';
        }

        const vGym = document.getElementById("map-inner-modal-content");
        const vGymTitle = document.getElementById("map-inner-modal-title");
        if (vGymTitle) vGymTitle.innerText = locationName;

        if (vGym) {
            vGym.replaceChildren();
            vGym.style.position = "relative";
            vGym.style.height = "100%";
            vGym.style.backgroundImage = `url('./Assets/Extra/Casino/${bgImg}')`;
            vGym.style.backgroundPosition = 'center';
            vGym.style.backgroundRepeat = 'no-repeat';
            vGym.style.backgroundSize = 'contain';

            let html = '';
            const stdLeft = 16.3;
            const stdTop = 34.16;
            const stdWidth = 76.7 - 16.3;
            const stdHeight = 61.06 - 34.16;

            const shinyLeft = 19.24;
            const shinyTop = 85.96;
            const shinyWidth = 73.94 - 19.24;
            const shinyHeight = 94.72 - 85.96;

            html += `<div class="casino-overlay-btn" onclick="window.startCasinoEncounter(false, '${locationName}')" style="position: absolute; left: ${stdLeft}%; top: ${stdTop}%; width: ${stdWidth}%; height: ${stdHeight}%; cursor: pointer;" title="Standard Encounter (${state.config.balance.casinoPrices?.standard || 75})"></div>`;
            html += `<div class="casino-overlay-btn" onclick="window.startCasinoEncounter(true, '${locationName}')" style="position: absolute; left: ${shinyLeft}%; top: ${shinyTop}%; width: ${shinyWidth}%; height: ${shinyHeight}%; cursor: pointer;" title="2x Shiny (${state.config.balance.casinoPrices?.doubleShiny || 200})"></div>`;
            html += `<button class="casino-overlay-btn" onclick="window.navigateToLocation(window.currentCasinoHub)" style="position: absolute; top: 10px; left: 10px; padding: 10px; cursor: pointer; z-index: 100;">Back to Lobby</button>`;

            setSafeHTML(vGym, html);
        }

        const overlay = document.getElementById('map-inner-modal-overlay');
        const modal = document.getElementById('map-inner-modal');
        if (overlay && modal) {
            overlay.style.display = 'flex';

            const mapWin = document.getElementById('interactive-map');
            if (mapWin) {
                const applyPaddingAndAspect = (aspectRatio) => {
                    const mapW = mapWin.offsetWidth;
                    const mapH = mapWin.offsetHeight;
                    const maxDim = Math.max(mapW, mapH);
                    const padding = maxDim * 0.02;
                    overlay.style.padding = `${padding}px`;

                    modal.style.aspectRatio = aspectRatio ? aspectRatio.toString() : 'auto';
                    modal.style.maxHeight = '100%';
                    modal.style.maxWidth = '100%';
                };

                const img = new Image();
                img.onload = () => applyPaddingAndAspect(img.naturalWidth / img.naturalHeight);
                img.src = `./Assets/Extra/Casino/${bgImg}`;
            }
        }
    } else if (locationName === "Daycare") {
        if (!state.stats.hasSeenDaycare) {
            document.getElementById('daycare-first-time-overlay').style.display = 'flex';
        } else {
            document.getElementById('daycare-first-time-overlay').style.display = 'none';
        }

        if (battleSystem) {
             battleSystem.stop();
             battleSystem.activeEncounter = null;
             battleSystem.isSearching = false;
             if (battleSystem.gymState) battleSystem.gymState.isActive = false;
        }
        switchView("DAYCARE_HUB");
        updateUI();
        return;
    } else if (locationName === "PokeCenter & PokeMarket" || locationName.includes("Market") || locationName.includes("Center")) {
        if (battleSystem) {
             battleSystem.stop();
             battleSystem.activeEncounter = null;
             battleSystem.isSearching = false;
             if (battleSystem.gymState) battleSystem.gymState.isActive = false;
        }
        switchView("POKEMON_CENTER_MARKET");
        const vCenter = document.getElementById("view-center-market");
        setupMarket(vCenter);
    } else if (locationName.includes("Gym") || locationName.includes("Pokemon League")) {
        let bgImg = "";
        let lookupName = locationName;

        if (locationName.includes("Pewter")) bgImg = "BG-Gym-1-Pewter-Rock.png";
        else if (locationName.includes("Cerulean")) bgImg = "BG-Gym-2-Cerulean-Water.png";
        else if (locationName.includes("Vermilion")) bgImg = "BG-Gym-3-Vermilion-Electric.png";
        else if (locationName.includes("Celadon")) bgImg = "BG-Gym-4-Celadon-Grass.png";
        else if (locationName.includes("Fuchsia")) bgImg = "BG-Gym-5-Fuchsia-Poison.png";
        else if (locationName.includes("Saffron")) bgImg = "BG-Gym-6-Saffron-Psychic.png";
        else if (locationName.includes("Cinnabar")) bgImg = "BG-Gym-7-Cinnabar-Fire.png";
        else if (locationName.includes("Viridian Gym")) bgImg = "BG-Gym-8-Viridian-Ground.png";
        else if (locationName === "Kanto Pokemon League") {
            bgImg = "IndigoPlateau.png";
            lookupName = "Kanto Pokemon League";
        }

        const vGym = document.getElementById("map-inner-modal-content");
        const vGymTitle = document.getElementById("map-inner-modal-title");
        const gymConfig = state.config.gyms ? state.config.gyms.find(g => g.name === lookupName) : null;

        if (vGymTitle) {
            vGymTitle.innerText = locationName;
        }

        if (vGym && typeof vGym.appendChild === 'function') {
            if (typeof vGym.replaceChildren === 'function') {
                vGym.replaceChildren();
            }

            if (gymConfig && state.config.gymAssets && state.config.gymAssets[gymConfig.leader]) {
                const assetConfig = state.config.gymAssets[gymConfig.leader];
                const spritePath = `./Assets/Gym/GymLeaders/${assetConfig.sprite}`;
                const bgPath = `./Assets/Gym/BG/${assetConfig.background}`;

                // Remove the static bgImg so it doesn't override the dynamic one
                bgImg = "";

                const dynamicGymBgUi = document.createElement('div');
                dynamicGymBgUi.id = 'dynamic-gym-bg-ui';
                dynamicGymBgUi.style.position = 'absolute';
                dynamicGymBgUi.style.top = '0';
                dynamicGymBgUi.style.left = '0';
                dynamicGymBgUi.style.width = '100%';
                dynamicGymBgUi.style.height = '100%';
                dynamicGymBgUi.style.zIndex = '0';
                dynamicGymBgUi.style.backgroundImage = `url('${bgPath}')`;
                dynamicGymBgUi.style.backgroundSize = '100% 100%';
                dynamicGymBgUi.style.overflow = 'hidden';

                const gymLeaderImg = document.createElement('img');
                gymLeaderImg.src = spritePath;
                gymLeaderImg.style.position = 'absolute';
                gymLeaderImg.style.left = `${assetConfig.position.rel_x * 100}%`;
                gymLeaderImg.style.top = `${assetConfig.position.rel_y * 100}%`;
                gymLeaderImg.style.width = `${(assetConfig.size.px_width / 1800) * 100}%`;
                gymLeaderImg.style.transform = `rotate(${assetConfig.tilt.angle_deg}deg)`;
                gymLeaderImg.style.transformOrigin = assetConfig.tilt.origin;
                gymLeaderImg.style.pointerEvents = 'none';

                dynamicGymBgUi.appendChild(gymLeaderImg);
                vGym.appendChild(dynamicGymBgUi);
            }

            const uiContainer = document.createElement('div');
            uiContainer.id = 'gym-ui-container';
            uiContainer.className = 'gym-ui-container';

            const headerEl = document.createElement('h2');
            headerEl.id = 'gym-title-header';
            headerEl.textContent = locationName;

            const contentArea = document.createElement('div');
            contentArea.id = 'gym-content-area';

            uiContainer.appendChild(headerEl);
            uiContainer.appendChild(contentArea);
            vGym.appendChild(uiContainer);

            // Scale gym UI from inner modal's width AND height so it shrinks/grows in both axes
            const updateGymFontSize = () => {
                const w = vGym.clientWidth, h = vGym.clientHeight;
                if (!w || !h) return;
                const fs = Math.max(7, Math.min(22, Math.min(w / 45, h / 30)));
                vGym.style.setProperty('--gym-fs', `${fs.toFixed(2)}px`);
            };
            if (!vGym._gymResizeObserver && typeof ResizeObserver !== 'undefined') {
                vGym._gymResizeObserver = new ResizeObserver(updateGymFontSize);
                vGym._gymResizeObserver.observe(vGym);
            }
            requestAnimationFrame ? requestAnimationFrame(updateGymFontSize) : updateGymFontSize();

            if (gymConfig && contentArea) {
                const metaRow = document.createElement('div');
                metaRow.className = 'gym-meta-row';
                if (gymConfig.leader) {
                    const leaderPill = document.createElement('span');
                    leaderPill.className = 'gym-meta-pill';
                    leaderPill.textContent = `Leader: ${gymConfig.leader}`;
                    metaRow.appendChild(leaderPill);
                }
                if (Array.isArray(gymConfig.trainers)) {
                    const countPill = document.createElement('span');
                    countPill.className = 'gym-meta-pill';
                    countPill.textContent = `${gymConfig.trainers.length} Trainers`;
                    metaRow.appendChild(countPill);
                }
                if (state.stats?.completedChallengeIds?.includes(lookupName)) {
                    const clearedPill = document.createElement('span');
                    clearedPill.className = 'gym-meta-pill is-cleared';
                    clearedPill.textContent = 'Cleared';
                    metaRow.appendChild(clearedPill);
                }
                if (metaRow.children.length > 0) {
                    contentArea.appendChild(metaRow);
                }

                const btn = document.createElement('button');
                btn.id = "btn-enter-gym";
                btn.className = "action-btn action-btn-primary";
                btn.style.width = "100%";
                btn.textContent = "Enter";
                btn.onclick = () => { window.startGymBattle(lookupName); };
                contentArea.appendChild(btn);
            }

            vGym.style.position = "relative";
            vGym.style.height = "100%";
            if (bgImg) {
                vGym.style.backgroundImage = `url('./Assets/BG/${bgImg}')`;
                vGym.style.backgroundSize = "100% 100%";
            } else {
                vGym.style.backgroundImage = "none";
            }
        }

        // Show the inner modal overlay instead of closing the map modal
        const overlay = document.getElementById('map-inner-modal-overlay');
        const modal = document.getElementById('map-inner-modal');
        if (overlay && modal) {
            overlay.style.display = 'flex';

            // Ensure the dynamic layout and 2% padding based on largest window dimension
            const mapWin = document.getElementById('interactive-map');
            if (mapWin) {
                const applyPaddingAndAspect = (aspectRatio) => {
                    const mapW = mapWin.offsetWidth;
                    const mapH = mapWin.offsetHeight;
                    const maxDim = Math.max(mapW, mapH);
                    const padding = maxDim * 0.02; // 2% of the biggest one
                    overlay.style.padding = `${padding}px`;

                    if (aspectRatio) {
                        modal.style.aspectRatio = aspectRatio.toString();
                    } else {
                        modal.style.aspectRatio = 'auto'; // Fallback
                    }

                    // Force fit without exceeding bounds
                    modal.style.maxHeight = '100%';
                    modal.style.maxWidth = '100%';
                };

                const gymAsset = gymConfig && state.config.gymAssets ? state.config.gymAssets[gymConfig.leader] : null;
                const imgToLoad = bgImg ? `./Assets/BG/${bgImg}` : (gymAsset ? `./Assets/Gym/BG/${gymAsset.background}` : null);
                if (imgToLoad) {
                    const img = new Image();
                    img.onload = () => applyPaddingAndAspect(img.naturalWidth / img.naturalHeight);
                    img.src = imgToLoad;
                } else {
                    applyPaddingAndAspect(null);
                }
            }
        }

    } else {
        switchView("BATTLE_ARENA");
        if (battleSystem) {
             battleSystem.stop();
             battleSystem.activeEncounter = null;
             battleSystem.isSearching = false;
             if (battleSystem.gymState) battleSystem.gymState.isActive = false;
             battleSystem.searchNext(); // Restart search if we moved
        }
    }
    if (!isGymLocation) {
        updateUI();
    }
}

export function showMapTooltip(e, locationName) {
    let tooltip = document.getElementById('map-tooltip');
    if (!tooltip) {
        tooltip = document.createElement('div');
        tooltip.id = 'map-tooltip';
        tooltip.style.cssText = 'display:none; position:fixed; background:rgba(0,0,0,0.8); color:white; pointer-events:none; z-index: 99999; line-height: 1.4;';
        document.body.appendChild(tooltip);
    }

    if (!tooltip) return;

    let scale = 1;
    const mapWindow = document.getElementById('window-map');
    if (mapWindow) {
        const currentWidth = mapWindow.offsetWidth || parseInt(mapWindow.style.width) || 800;
        scale = currentWidth / 800;
    }

    const fontSize = 14 * scale;
    const padding = 5 * scale;
    const borderRadius = 5 * scale;
    const cursorOffset = 15 * scale;

    tooltip.style.fontSize = fontSize + 'px';
    tooltip.style.padding = padding + 'px';
    tooltip.style.borderRadius = borderRadius + 'px';

    const activeRegion = window.currentMapRegion || '';
    if (tooltip.dataset.locationName !== locationName || tooltip.dataset.region !== activeRegion) {
        let displayLocationName = locationName.replace(/\s*\([^)]+\)$/, '');
        let info = `<strong>${displayLocationName}</strong><br>`;

        // Fetch info to show on tooltip
        if (locationName.includes("Gym") || locationName.includes("Pokemon League")) {
            let lookupName = locationName;

            if (state.config.gyms) {
                const gym = state.config.gyms.find(g => g.name === lookupName);
                if (gym) {
                    info += `Leader: ${gym.leader}<br>`;
                    info += `Trainers: ${gym.trainers.length}<br>`;
                }
            }
        } else if (typeof window.getRoutesForRegion === 'function' && window.getRoutesForRegion(window.currentMapRegion)) {
            let route = null;
            route = window.getRoutesForRegion(window.currentMapRegion).find(r => r.name === locationName);

            if (route) {
                // Find overall min and max level for the route
                let minLvl = 100;
                let maxLvl = 1;
                route.spawns.forEach(s => {
                    if (s.minLevel < minLvl) minLvl = s.minLevel;
                    if (s.maxLevel > maxLvl) maxLvl = s.maxLevel;
                });
                info += `Levels: ${minLvl}-${maxLvl}<br>`;
                info += `Spawns: ${route.spawns.length}<br>`;

                // Show all spawns
                route.spawns.forEach(s => {
                    let pName = "Unknown";
                    if (state.config.pokemonMap || state.config.pokemonData) {
                        const pd = state.config.pokemonMap
                            ? (state.config.pokemonMap.get(Number(s.pokemonId)) || state.config.pokemonMap.get(s.pokemonId))
                            : state.config.pokemonData.find(pd => pd.id === s.pokemonId);
                        if (pd) {
                            pName = s.forceShiny && pd.name === "Gyarados" ? "Red Gyarados" : pd.name;
                        }
                    }
                    info += `- ${pName} (Lvl: ${s.minLevel}-${s.maxLevel}, ${Math.round(s.chance * 100)}%)<br>`;
                });
            } else {
                info += `Hub Area<br>`;
            }
        }

        setSafeHTML(tooltip, info);
        tooltip.dataset.locationName = locationName;
        tooltip.dataset.region = activeRegion;
    }
    tooltip.style.display = 'block';

    // Get tooltip dimensions
    const rect = tooltip.getBoundingClientRect();

    let leftPos = e.clientX + cursorOffset;
    let topPos = e.clientY + cursorOffset;

    // Clamp to map boundaries
    let bounds = {
        left: 0,
        top: 0,
        right: window.innerWidth,
        bottom: window.innerHeight
    };

    const mapWindowElem = document.getElementById('window-map');
    if (mapWindowElem) {
        const mapRect = mapWindowElem.getBoundingClientRect();
        bounds = {
            left: mapRect.left,
            top: mapRect.top,
            right: mapRect.right,
            bottom: mapRect.bottom
        };
    }

    if (leftPos + rect.width > bounds.right) {
        leftPos = e.clientX - rect.width - cursorOffset;
    }
    if (topPos + rect.height > bounds.bottom) {
        topPos = e.clientY - rect.height - cursorOffset;
    }

    // Ensure it doesn't go off the top or left edges of the map
    leftPos = Math.max(bounds.left, leftPos);
    topPos = Math.max(bounds.top, topPos);

    tooltip.style.left = leftPos + "px";
    tooltip.style.top = topPos + "px";
}
export function hideMapTooltip() {
    const tooltip = document.getElementById('map-tooltip');
    if (tooltip) {
        tooltip.style.display = 'none';
        delete tooltip.dataset.locationName;
        delete tooltip.dataset.region;
    }
}
