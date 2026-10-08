import { state, globals, swapRegion, checkFinalChallengeCompleted } from '../state.js';
import { updateUI, switchView } from '../ui.js';
import { setupMarket } from './market.js';

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
    return result;
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


function generateMarkerHtml(locationId, locationName, coords, isUnlocked, hasNewNotification, showCheckmark) {
    if (!isUnlocked) return '';

    let markerImg = './Assets/Map/Spots/Spot.png';
    let isClickable = true;

    if (locationId === 'professor_oak_lab' || locationId === 'johto_oak_lab') {
        markerImg = './Assets/Map/Spots/Spot_Lab.png';
    } else if (locationId === 'pokemon_center___market') {
        markerImg = './Assets/Map/Spots/Spot_PCPM.png';
    } else if (locationId === 'safari_zone') {
        markerImg = './Assets/Map/Spots/Spot_Safariball.png';
    } else if (locationId === 'casino') {
        markerImg = './Assets/Map/Spots/Spot_Casino.png';
    } else if (locationId === 'daycare') {
        markerImg = './Assets/Map/Spots/Spot_Daycare.png';
    } else if (locationId === 'pewter_gym') {
        markerImg = `./Assets/Gym/Badges/${window.getBadgeFileName('Kanto', 1)}`;
    } else if (locationId === 'cerulean_gym') {
        markerImg = `./Assets/Gym/Badges/${window.getBadgeFileName('Kanto', 2)}`;
    } else if (locationId === 'vermilion_gym') {
        markerImg = `./Assets/Gym/Badges/${window.getBadgeFileName('Kanto', 3)}`;
    } else if (locationId === 'celadon_gym') {
        markerImg = `./Assets/Gym/Badges/${window.getBadgeFileName('Kanto', 4)}`;
    } else if (locationId === 'fuchsia_gym') {
        markerImg = `./Assets/Gym/Badges/${window.getBadgeFileName('Kanto', 5)}`;
    } else if (locationId === 'saffron_gym') {
        markerImg = `./Assets/Gym/Badges/${window.getBadgeFileName('Kanto', 6)}`;
    } else if (locationId === 'cinnabar_gym') {
        markerImg = `./Assets/Gym/Badges/${window.getBadgeFileName('Kanto', 7)}`;
    } else if (locationId === 'viridian_gym') {
        markerImg = `./Assets/Gym/Badges/${window.getBadgeFileName('Kanto', 8)}`;
    }

    // Standardize spot sizes
    let markerWidth = "24px";
    let markerHeight = "24px";
    let dropShadow = "none";

    if (locationId === 'pokemon_center___market') {
        markerWidth = "32px";
        markerHeight = "32px";
    } else if (['professor_oak_lab', 'johto_oak_lab', 'indigo_plateu', 'safari_zone', 'casino', 'daycare'].includes(locationId)) {
        markerWidth = "28px";
        markerHeight = "28px";
    }

    if (markerImg !== './Assets/Extra/Spot.png') {
        // Solid black outline (4-axis) and a larger soft white glow
        dropShadow = "drop-shadow(1px 0px 0 #000) drop-shadow(-1px 0px 0 #000) drop-shadow(0px 1px 0 #000) drop-shadow(0px -1px 0 #000) drop-shadow(0px 0px 5px rgba(255, 255, 255, 0.8))";
    }

    let markerClass = hasNewNotification ? 'map-marker pulse-marker' : 'map-marker';
    let safeLocationName = locationName.replace(/'/g, "&#39;");
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

function generateRegionButtonsHtml(regions, hasUnlockedJohto) {
    if (!hasUnlockedJohto) return '';

    let exclamationHtml = !state.globalStats.hasSeenJohtoMap ? `<img src="Assets/Extra/ExclamationMark.png" style="position: absolute; top: -5px; right: -5px; width: 15px; height: auto; pointer-events: none; z-index: 10;">` : '';

    let buttonsHtml = regions.map(r => {
        let extra = r.name === 'Johto' ? exclamationHtml : '';
        let style = window.currentMapRegion === r.name
            ? 'background: linear-gradient(to bottom, #3498db, #2980b9); color: white; border: 1px solid #3498db; box-shadow: 0 2px 4px rgba(0,0,0,0.2);'
            : 'background: transparent; color: rgba(255, 255, 255, 0.7); border: 1px solid transparent;';
        return `<button onclick="window.switchMapRegion('${r.name}')" style="${style} border-radius: 15px; padding: 5px 15px; font-weight: bold; cursor: pointer; font-size: 14px; transition: all 0.2s; position: relative;" onmousedown="event.stopPropagation()">${r.name}${extra}</button>`;
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

function getUnlockedAreas() {
    let unlockedAreas = new Set();
    unlockedAreas.add("Professor Oak Lab");
    unlockedAreas.add("Johto Oak Lab");
    unlockedAreas.add("Professor Lab");

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

    if (targetStats.completed150Challenge) {
        unlockedAreas.add("Mythical and Legendaries");
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
    return unlockedAreas;
}

function generateMarkersForRegion(region, unlockedAreas) {
    let html = '';
    if (region === 'Kanto') {
        for (const [locationId, locationData] of Object.entries(state.config.mapCoordinates)) {
            const locationName = locationData.name;
            const coords = locationData;
            let isUnlocked = unlockedAreas.has(locationName);
            if (!isUnlocked) continue;

            let hasNewNotification = false;
            let showCheckmark = false;

            if (state.stats.newRoutes && state.stats.newRoutes.some(r => parseAreaNames(r).includes(locationName))) {
                hasNewNotification = true;
            }
            if (locationId === 'professor_oak_lab' && state.stats.showOakMarkerPulse) {
                hasNewNotification = true;
            }

            // Checkmarks for gyms
            if (locationId === 'pewter_gym' && state.trainer.badges >= 1) showCheckmark = true;
            if (locationId === 'cerulean_gym' && state.trainer.badges >= 2) showCheckmark = true;
            if (locationId === 'vermilion_gym' && state.trainer.badges >= 3) showCheckmark = true;
            if (locationId === 'celadon_gym' && state.trainer.badges >= 4) showCheckmark = true;
            if (locationId === 'fuchsia_gym' && state.trainer.badges >= 5) showCheckmark = true;
            if (locationId === 'saffron_gym' && state.trainer.badges >= 6) showCheckmark = true;
            if (locationId === 'cinnabar_gym' && state.trainer.badges >= 7) showCheckmark = true;
            if (locationId === 'viridian_gym' && state.trainer.badges >= 8) showCheckmark = true;

            html += generateMarkerHtml(locationId, locationName, coords, true, hasNewNotification, showCheckmark);
        }
    } else if (region === 'Johto') {
        for (const [locationId, locationData] of Object.entries(state.config.johtoMapCoordinates || {})) {
            const locationName = locationData.name;
            const coords = locationData;

            let isUnlocked = unlockedAreas.has(locationName);
            if (!isUnlocked) continue;

            html += generateMarkerHtml(locationId, locationName, coords, true, false, false);
        }
    } else {
        // Fallback for new regions
        let coords = { x: 50, y: 50 };
        let locationName = "Professor Lab";
        html += generateMarkerHtml("professor_oak_lab", locationName, coords, true, false, false);
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
            const widthVal = parseFloat(targetWidth);
            const targetHeight = (widthVal / (currentRegionObj.width / currentRegionObj.height)) + headerH;
            winEl.style.height = targetHeight + 'px';
            const scaler = winEl.querySelector('.window-content-scaler');
            if (scaler) {
                scaler.style.height = '100%';
                scaler.style.width = '100%';
            }
        }
    }
}

export function showMap() {
    if (state.stats.hasUnseenMap || state.stats.showMapOakNotification) {
        state.stats.hasUnseenMap = false;
        state.stats.showMapOakNotification = false;
        updateUI();
    }

    let unlockedAreas = getUnlockedAreas();

    let isFinalChallengeCompleted = checkFinalChallengeCompleted();
    const regions = [
        { name: 'Kanto', mapFile: '1 Kanto Map.png', width: 2571, height: 1818 },
        { name: 'Johto', mapFile: '2 Johto Map.png', width: 1961, height: 1316 },
        { name: 'Hoenn', mapFile: '3 Hoenn Map.png', width: 1250, height: 884 },
        { name: 'Sinnoh', mapFile: '4 Sinnoh Map.png', width: 1024, height: 724 },
        { name: 'Unova', mapFile: '5 Unova Map.png', width: 1280, height: 837 },
        { name: 'Kalos', mapFile: '6 Kalos Map.png', width: 1032, height: 676 },
        { name: 'Alola', mapFile: '7 1 Alola Map.png', width: 1280, height: 905 },
        { name: 'Galar', mapFile: '8 Galar Map.png', width: 1554, height: 2198 },
        { name: 'Hisui', mapFile: '9 Hisui Map.png', width: 1280, height: 711 },
        { name: 'Paldea', mapFile: '10 Paldea Map.png', width: 1280, height: 905 }
    ];

    if (isFinalChallengeCompleted) { state.globalStats.hasSeenJohtoMap = true; }
    let showRegionBar = isFinalChallengeCompleted || state.globalStats.hasSeenJohtoMap;

    let regionButtonsHtml = generateRegionButtonsHtml(regions, showRegionBar);

    const currentRegionObj = regions.find(r => r.name === window.currentMapRegion) || regions[0];
    let mapImage = `./Assets/Map/${currentRegionObj.mapFile}`;
    let aspectRatio = `${currentRegionObj.width} / ${currentRegionObj.height}`;

    let html = `
        <div id="interactive-map" style="position: relative; width: 100%; aspect-ratio: ${aspectRatio}; background-image: url('${mapImage}'); background-size: 100% 100%; background-repeat: no-repeat; background-position: center;">
    `;

    html += generateMarkersForRegion(window.currentMapRegion, unlockedAreas);

    html += `
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

        if (showRegionBar) {
            window.showModal(titleHtml, html, 'window-map', targetWidth);
        } else {
            window.showModal('Map', html, 'window-map', targetWidth);
        }

        setupMapWindowDimensions(currentRegionObj, targetWidth);
    }
}

export function navigateToLocation(locationName) {
    if (window.currentMapRegion && window.currentMapRegion !== state.currentRegionName) {
        // Stop battle completely before swapping
        if (globals.battleSystem) {
             globals.battleSystem.stop();
             globals.battleSystem.activeEncounter = null;
             globals.battleSystem.isSearching = false;
             if (globals.battleSystem.gymState) globals.battleSystem.gymState.isActive = false;
        }
        swapRegion(window.currentMapRegion);
    }

    if (state.stats.newRoutes && state.stats.newRoutes.some(r => parseAreaNames(r).includes(locationName))) {
        state.stats.newRoutes = state.stats.newRoutes.filter(r => !parseAreaNames(r).includes(locationName));
    }

    const battleSystem = globals.battleSystem;
    state.currentRoute = locationName;
    if (window.closeModal) window.closeModal();

    if (locationName === "Professor Oak Lab") {
        if (battleSystem) {
             battleSystem.stop();
             battleSystem.activeEncounter = null;
             battleSystem.isSearching = false;
             if (battleSystem.gymState) battleSystem.gymState.isActive = false;
        }
        switchView("PROF_OAK_LAB");
    } else if (locationName === "Johto Oak Lab") {
        if (battleSystem) {
             battleSystem.stop();
             battleSystem.activeEncounter = null;
             battleSystem.isSearching = false;
             if (battleSystem.gymState) battleSystem.gymState.isActive = false;
        }
        switchView("JOHTO_OAK_LAB");
    } else if (locationName === "Professor Lab") {
        if (battleSystem) {
             battleSystem.stop();
             battleSystem.activeEncounter = null;
             battleSystem.isSearching = false;
             if (battleSystem.gymState) battleSystem.gymState.isActive = false;
        }
        switchView("GENERIC_LAB");
    } else if (locationName === "Safari Zone") {
        if (battleSystem) {
            battleSystem.stop();
        }
        switchView("SAFARI_HUB");
        const msg = document.getElementById("safari-welcome-msg");
        if (msg) {
            const safariCost = state.config.balance.safariZonePrice || 500;
            msg.innerText = `Welcome to Safari Zone! Here we charge a fee per battle you have and you can use our SafariBalls at will. Do you wanna enter Safari Zone?`;
        }
    } else if (locationName === "Casino") {
        if (battleSystem) {
             battleSystem.stop();
             battleSystem.activeEncounter = null;
             battleSystem.isSearching = false;
             if (battleSystem.gymState) battleSystem.gymState.isActive = false;
        }
        switchView("CASINO_HUB");

        // Reset Casino background to default lobby if it was changed
        const viewCasino = document.getElementById("view-casino");
        viewCasino.style.backgroundImage = "url('./Assets/BG/BG-Cassino.jpg')";
        const casinoContent = document.getElementById("casino-content");
        if(casinoContent) casinoContent.style.display = 'block';

        // Clear any overlay buttons
        const oldOverlays = viewCasino.querySelectorAll('.casino-overlay-btn');
        oldOverlays.forEach(el => el.remove());

        const btnContainer = document.getElementById("casino-buttons-container");
        if (btnContainer) {
            btnContainer.style.width = '100%';
            btnContainer.style.height = '100%';

            const completedChallenges = state.stats.completedChallengeIds || [];
            const isUnlockedByAreaId = (areaId) => completedChallenges.some(id => parseAreaNames(id).includes(areaId));

            let machinesHtml = `
                <div style="position: absolute; top: 20px; left: 0; width: 100%; text-align: center; z-index: 10; color: white; text-shadow: 2px 2px 4px black; font-size: 24px;">
                    <h3>Standard Route $${state.config.balance.casinoPrices?.standard || 75} 2x Shiny $${state.config.balance.casinoPrices?.doubleShiny || 200}</h3>
                </div>
                <div style="display: flex; justify-content: space-evenly; align-items: center; width: 100%; height: 100%; padding: 15px; box-sizing: border-box;">
                    <div style="position: relative; text-align: center; flex: 1 1 0; max-width: 200px; margin: 0 5px;">
                        <img src="./Assets/Extra/Casino Starter Troupe.png" alt="Starter Troupe" style="width: 100%; display: block; filter: drop-shadow(0 0 10px black);">
                        <div onclick="window.startCasinoEncounter(false, 'Casino - Starter Troupe')" style="position: absolute; left: 15.38%; top: 33.47%; width: 62.06%; height: 28.08%; cursor: pointer; clip-path: polygon(0 0, 100% 0, 100% 100%, 0 100%);" title="Standard Encounter ($${state.config.balance.casinoPrices?.standard || 75})"></div>
                        <div onclick="window.startCasinoEncounter(true, 'Casino - Starter Troupe')" style="position: absolute; left: 18.14%; top: 85.36%; width: 55.62%; height: 10.16%; cursor: pointer; clip-path: polygon(0 0, 100% 0, 100% 100%, 0 100%);" title="2x Shiny ($${state.config.balance.casinoPrices?.doubleShiny || 200})"></div>
                    </div>
            `;

            if (isUnlockedByAreaId('Casino')) {
                machinesHtml += `
                    <div style="position: relative; text-align: center; flex: 1 1 0; max-width: 200px; margin: 0 5px;">
                        <img src="./Assets/Extra/Casino Mid Troupe.png" alt="Mid Troupe" style="width: 100%; display: block; filter: drop-shadow(0 0 10px black);">
                        <div onclick="window.startCasinoEncounter(false, 'Casino - Mid Troupe')" style="position: absolute; left: 15.38%; top: 33.47%; width: 62.06%; height: 28.08%; cursor: pointer; clip-path: polygon(0 0, 100% 0, 100% 100%, 0 100%);" title="Standard Encounter ($${state.config.balance.casinoPrices?.standard || 75})"></div>
                        <div onclick="window.startCasinoEncounter(true, 'Casino - Mid Troupe')" style="position: absolute; left: 18.14%; top: 85.36%; width: 55.62%; height: 10.16%; cursor: pointer; clip-path: polygon(0 0, 100% 0, 100% 100%, 0 100%);" title="2x Shiny ($${state.config.balance.casinoPrices?.doubleShiny || 200})"></div>
                    </div>
                `;
            }

            if (isUnlockedByAreaId('Big Fishing Spot')) {
                machinesHtml += `
                    <div style="position: relative; text-align: center; flex: 1 1 0; max-width: 200px; margin: 0 5px;">
                        <img src="./Assets/Extra/Casino Late Troupe.png" alt="Late Troupe" style="width: 100%; display: block; filter: drop-shadow(0 0 10px black);">
                        <div onclick="window.startCasinoEncounter(false, 'Casino - Late Troupe')" style="position: absolute; left: 15.38%; top: 33.47%; width: 62.06%; height: 28.08%; cursor: pointer; clip-path: polygon(0 0, 100% 0, 100% 100%, 0 100%);" title="Standard Encounter ($${state.config.balance.casinoPrices?.standard || 75})"></div>
                        <div onclick="window.startCasinoEncounter(true, 'Casino - Late Troupe')" style="position: absolute; left: 18.14%; top: 85.36%; width: 55.62%; height: 10.16%; cursor: pointer; clip-path: polygon(0 0, 100% 0, 100% 100%, 0 100%);" title="2x Shiny ($${state.config.balance.casinoPrices?.doubleShiny || 200})"></div>
                    </div>
                `;
            }

            if (isUnlockedByAreaId('Small Fishing Spot')) {
                machinesHtml += `
                    <div style="position: relative; text-align: center; flex: 1 1 0; max-width: 200px; margin: 0 5px;">
                        <img src="./Assets/Extra/Casino Eeveelutions.png" alt="Eeveelutions" style="width: 100%; display: block; filter: drop-shadow(0 0 10px black);">
                        <div onclick="window.startCasinoEncounter(false, 'Casino - Eeveelutions')" style="position: absolute; left: 15.38%; top: 33.47%; width: 62.06%; height: 28.08%; cursor: pointer; clip-path: polygon(0 0, 100% 0, 100% 100%, 0 100%);" title="Standard Encounter ($${state.config.balance.casinoPrices?.standard || 75})"></div>
                        <div onclick="window.startCasinoEncounter(true, 'Casino - Eeveelutions')" style="position: absolute; left: 18.14%; top: 85.36%; width: 55.62%; height: 10.16%; cursor: pointer; clip-path: polygon(0 0, 100% 0, 100% 100%, 0 100%);" title="2x Shiny ($${state.config.balance.casinoPrices?.doubleShiny || 200})"></div>
                    </div>
                `;
            }

            if (isUnlockedByAreaId('Fighting Dojo')) {
                machinesHtml += `
                    <div style="position: relative; text-align: center; flex: 1 1 0; max-width: 200px; margin: 0 5px;">
                        <img src="./Assets/Extra/Casino Special Spot.png" alt="Special Spot" style="width: 100%; display: block; filter: drop-shadow(0 0 10px black);">
                        <div onclick="window.startCasinoEncounter(false, 'Casino - Special Spot')" style="position: absolute; left: 15.38%; top: 33.47%; width: 62.06%; height: 28.08%; cursor: pointer; clip-path: polygon(0 0, 100% 0, 100% 100%, 0 100%);" title="Standard Encounter ($${state.config.balance.casinoPrices?.standard || 75})"></div>
                        <div onclick="window.startCasinoEncounter(true, 'Casino - Special Spot')" style="position: absolute; left: 18.14%; top: 85.36%; width: 55.62%; height: 10.16%; cursor: pointer; clip-path: polygon(0 0, 100% 0, 100% 100%, 0 100%);" title="2x Shiny ($${state.config.balance.casinoPrices?.doubleShiny || 200})"></div>
                    </div>
                `;
            }

            machinesHtml += `</div>`;
            btnContainer.innerHTML = machinesHtml;
        }
    } else if (locationName.startsWith("Casino - ")) {
        if (battleSystem) {
             battleSystem.stop();
             battleSystem.activeEncounter = null;
             battleSystem.isSearching = false;
             if (battleSystem.gymState) battleSystem.gymState.isActive = false;
        }
        switchView("CASINO_HUB");

        const casinoContent = document.getElementById("casino-content");
        if(casinoContent) casinoContent.style.display = 'none';

        let bgImg = '';
        if (locationName === 'Casino - Starter Troupe') bgImg = 'Casino Starter Troupe.png';
        if (locationName === 'Casino - Mid Troupe') bgImg = 'Casino Mid Troupe.png';
        if (locationName === 'Casino - Late Troupe') bgImg = 'Casino Late Troupe.png';
        if (locationName === 'Casino - Eeveelutions') bgImg = 'Casino Eeveelutions.png';
        if (locationName === 'Casino - Special Spot') bgImg = 'Casino Special Spot.png';

        const viewCasino = document.getElementById("view-casino");
        viewCasino.style.backgroundImage = `url('./Assets/Extra/${bgImg}')`;
        viewCasino.style.backgroundPosition = 'center';
        viewCasino.style.backgroundRepeat = 'no-repeat';
        viewCasino.style.backgroundSize = 'contain';

        // Remove old buttons if any
        const oldOverlays = viewCasino.querySelectorAll('.casino-overlay-btn');
        oldOverlays.forEach(el => el.remove());

        // We use relative positioning for click areas
        let html = '';
        const stdLeft = 16.3;
        const stdTop = 34.16;
        const stdWidth = 76.7 - 16.3;
        const stdHeight = 61.06 - 34.16;

        const shinyLeft = 19.24;
        const shinyTop = 85.96;
        const shinyWidth = 73.94 - 19.24;
        const shinyHeight = 94.72 - 85.96;

        // Overlay transparent divs
        html += `<div class="casino-overlay-btn" onclick="window.startCasinoEncounter(false, '${locationName}')" style="position: absolute; left: ${stdLeft}%; top: ${stdTop}%; width: ${stdWidth}%; height: ${stdHeight}%; cursor: pointer;" title="Standard Encounter ($${state.config.balance.casinoPrices?.standard || 75})"></div>`;
        html += `<div class="casino-overlay-btn" onclick="window.startCasinoEncounter(true, '${locationName}')" style="position: absolute; left: ${shinyLeft}%; top: ${shinyTop}%; width: ${shinyWidth}%; height: ${shinyHeight}%; cursor: pointer;" title="2x Shiny ($${state.config.balance.casinoPrices?.doubleShiny || 200})"></div>`;
        html += `<button class="casino-overlay-btn" onclick="window.navigateToLocation('Casino')" style="position: absolute; top: 10px; left: 10px; padding: 10px; cursor: pointer; z-index: 100;">Back to Lobby</button>`;

        // Append to the viewCasino container
        viewCasino.insertAdjacentHTML('beforeend', html);
    } else if (locationName === "Daycare") {
        if (!state.globalStats.hasSeenDaycare) {
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
    } else if (locationName.includes("Gym") || locationName === "Indigo Plateau") {
        switchView("GYM");
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
        else if (locationName === "Indigo Plateau") {
            bgImg = "BG-IndigoPlateau.png";
            lookupName = "Indigo Plateau"; // Correct spelling for the gyms config
        }

        const vGym = document.getElementById("view-gym");
        const gymConfig = state.config.gyms.find(g => g.name === lookupName);

        // Stop current battle system
        if (battleSystem) {
            battleSystem.stop();
        }

        let buttonHtml = '';
        if (gymConfig) {
            let buttonText = lookupName === "Indigo Plateau" ? "Challange Elite 4 and Champion" : "Battle Gym";
            buttonHtml = `<button onclick="window.startGymBattle('${lookupName}')" style="padding: 10px 20px; font-size: 16px; margin-top: 10px; cursor: pointer;">${buttonText}</button>`;
        }

        vGym.innerHTML = `
            <div style="background-color: rgba(0,0,0,0.8); display: flex; flex-direction: column; align-items: center; padding: 20px; border-radius: 8px; position: absolute; left: 50%; top: 50%; transform: translate(-50%, -50%); min-width: 300px;">
                <h2>${locationName}</h2>
                <div id="gym-content-area" style="position: relative; width: 100%; text-align: center; display: flex; flex-direction: column; gap: 10px; align-items: center;">
                    ${buttonHtml}
                </div>
            </div>
        `;
        if (bgImg) {
            vGym.style.backgroundImage = `url('./Assets/BG/${bgImg}')`;
            vGym.style.backgroundSize = "cover";
            vGym.style.height = "100%";
            vGym.style.position = "relative";
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
    updateUI();
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

    let info = `<strong>${locationName}</strong><br>`;

    // Fetch info to show on tooltip
    if (locationName.includes("Gym") || locationName === "Indigo Plateau") {
        let lookupName = locationName;

        if (state.config.gyms) {
            const gym = state.config.gyms.find(g => g.name === lookupName);
            if (gym) {
                info += `Leader: ${gym.leader}<br>`;
                info += `Trainers: ${gym.trainers.length - 1}<br>`;
            }
        }
    } else if (state.config.routes) {
        const route = state.config.routes.find(r => r.name === locationName);
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
                if (state.config.pokemonData) {
                    const pd = state.config.pokemonData[s.pokemonId - 1]; // Use O(1) lookup
                    if (pd) pName = pd.name;
                }
                info += `- ${pName} (Lvl: ${s.minLevel}-${s.maxLevel}, ${Math.round(s.chance * 100)}%)<br>`;
            });
        } else {
            info += `Hub Area<br>`;
        }
    }

    tooltip.innerHTML = info;
    tooltip.style.display = 'block';

    // Get tooltip dimensions
    const rect = tooltip.getBoundingClientRect();

    let leftPos = e.clientX + cursorOffset;
    let topPos = e.clientY + cursorOffset;

    // Clamp to window boundaries
    if (leftPos + rect.width > window.innerWidth) {
        leftPos = e.clientX - rect.width - cursorOffset;
    }
    if (topPos + rect.height > window.innerHeight) {
        topPos = e.clientY - rect.height - cursorOffset;
    }

    // Ensure it doesn't go off the top or left edges either
    leftPos = Math.max(0, leftPos);
    topPos = Math.max(0, topPos);

    tooltip.style.left = leftPos + "px";
    tooltip.style.top = topPos + "px";
}
export function hideMapTooltip() {
    const tooltip = document.getElementById('map-tooltip');
    if (tooltip) tooltip.style.display = 'none';
}
