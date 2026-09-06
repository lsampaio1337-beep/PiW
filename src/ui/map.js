import { state, globals } from '../state.js';
import { updateUI, switchView } from '../ui.js';
import { setupMarket } from './market.js';

export function showMap() {
    let rightCol = document.getElementById('modal-overlay');
    let contentPanel = document.getElementById('content-panel');
    rightCol.style.display = 'flex';

    const modalBox = document.getElementById('modal-content-box');
    if (modalBox) {
        // Save original inline styles to restore later if another view needs it
        modalBox.dataset.originalStyles = modalBox.getAttribute('style') || '';

        // Remove padding and background so the map is flush and the background window is gone
        modalBox.style.padding = '0px';
        modalBox.style.border = 'none';
        modalBox.style.backgroundColor = 'transparent';
        modalBox.style.overflow = 'hidden';

        // Ensure no inherited box-shadow or extra margins break the flush look
        modalBox.style.boxShadow = 'none';
        modalBox.style.maxWidth = '90%'; // Allow it to expand nicely
    }

    // Also remove any padding from content-panel just in case
    if (contentPanel) {
        contentPanel.style.padding = '0px';
        contentPanel.style.margin = '0px';
    }

    // Generate Interactive Map HTML
    let html = `
        <div id="interactive-map" style="position: relative; width: 100%; aspect-ratio: 16/11; background-image: url('./Assets/Map/Kanto Map.png'); background-size: 100% 100%; background-repeat: no-repeat; background-position: center; border-radius: 8px;">
    `;

    for (const [locationId, locationData] of Object.entries(state.config.mapCoordinates)) {
        const locationName = locationData.name;
        const coords = locationData;

        // By request, all map spots are currently unlocked by default
        let isUnlocked = true;

        if (isUnlocked) {

            let markerImg = './Assets/Extra/Spot.png';
            let showCheckmark = false;
            let isClickable = true;

            if (locationId === 'professor_oak_lab') markerImg = './Assets/Extra/Spot_Oak.png';
            else if (locationId === 'pokemon_center___market') markerImg = './Assets/Extra/Spot_PCPM.png';
            else if (locationId === 'indigo_plateu') markerImg = './Assets/Extra/Spot_E4.png';
            else if (locationId === 'safari_zone') markerImg = './Assets/Extra/Spot_Safariball.png';
            else if (locationId === 'casino') { markerImg = './Assets/Extra/Spot_Casino.png'; }
            else if (['mount_moon', 'rock_tunnel', 'cerulean_cave', 'seafoam_islands', 'diglett_s_cave'].includes(locationId)) markerImg = './Assets/Extra/Spot.png';
            else if (locationId === 'small_fishing_spot') markerImg = './Assets/Extra/Spot.png';
            else if (locationId === 'big_fishing_spot') markerImg = './Assets/Extra/Spot.png';
            else if (locationId === 'fighting_dojo') markerImg = './Assets/Extra/Spot.png';
            else if (locationId === 'fossil_revival') markerImg = './Assets/Extra/Spot.png';
            else if (locationId === 'pok_mon_mansion') markerImg = './Assets/Extra/Spot.png';
            else if (locationId === 'trade_with_a_friend') markerImg = './Assets/Extra/Spot.png';
            else if (locationId === 'daycare') markerImg = './Assets/Map/Spot_Daycare.png';
            else if (locationId === 'pewter_gym') { markerImg = './Assets/Badges/Badge Kanto 1.png'; if (state.trainer.badges >= 1) showCheckmark = true; }
            else if (locationId === 'cerulean_gym') { markerImg = './Assets/Badges/Badge Kanto 2.png'; if (state.trainer.badges >= 2) showCheckmark = true; }
            else if (locationId === 'vermilion_gym') { markerImg = './Assets/Badges/Badge Kanto 3.png'; if (state.trainer.badges >= 3) showCheckmark = true; }
            else if (locationId === 'celadon_gym') { markerImg = './Assets/Badges/Badge Kanto 4.png'; if (state.trainer.badges >= 4) showCheckmark = true; }
            else if (locationId === 'fuchsia_gym') { markerImg = './Assets/Badges/Badge Kanto 5.png'; if (state.trainer.badges >= 5) showCheckmark = true; }
            else if (locationId === 'saffron_gym') { markerImg = './Assets/Badges/Badge Kanto 6.png'; if (state.trainer.badges >= 6) showCheckmark = true; }
            else if (locationId === 'cinnabar_gym') { markerImg = './Assets/Badges/Badge Kanto 7.png'; if (state.trainer.badges >= 7) showCheckmark = true; }
            else if (locationId === 'viridian_gym') { markerImg = './Assets/Badges/Badge Kanto 8.png'; if (state.trainer.badges >= 8) showCheckmark = true; }

            // Standardize spot sizes
            let markerWidth = "24px";
            let markerHeight = "24px";
            let dropShadow = "none";

            if (locationId === 'pokemon_center___market') {
                markerWidth = "32px";
                markerHeight = "32px";
            } else if (['professor_oak_lab', 'indigo_plateu', 'safari_zone', 'casino', 'daycare'].includes(locationId)) {
                markerWidth = "28px";
                markerHeight = "28px";
            }

            if (markerImg !== './Assets/Extra/Spot.png') {
                // Solid black outline (4-axis) and a larger soft white glow
                dropShadow = "drop-shadow(1px 0px 0 #000) drop-shadow(-1px 0px 0 #000) drop-shadow(0px 1px 0 #000) drop-shadow(0px -1px 0 #000) drop-shadow(0px 0px 5px rgba(255, 255, 255, 0.8))";
            }


            html += `
                <div class="map-marker"
                     data-location="${locationName.replace(/'/g, "&#39;")}"
                     title="${locationName.replace(/'/g, "&#39;")}"
                     style="position: absolute; left: ${coords.x}%; top: ${coords.y}%; width: ${markerWidth}; height: ${markerHeight}; background-image: url('${markerImg}'); background-size: contain; background-repeat: no-repeat; transform: translate(-50%, -50%); filter: ${dropShadow}; cursor: ${isClickable ? 'pointer' : 'default'};"
                     ${isClickable ? `onclick="window.navigateToLocation('${locationName.replace(/'/g, "\\'")}')"` : ''}
                     onmouseover="window.showMapTooltip(event, '${locationName.replace(/'/g, "\\'")}')"
                     onmouseout="window.hideMapTooltip()">
                     ${showCheckmark ? '<div style="position:absolute; top:-5px; right:-5px; background:green; color:white; border-radius:50%; width:15px; height:15px; font-size:10px; line-height:15px; text-align:center;">✓</div>' : ''}
                </div>
            `;
        }
    }

    html += `
        </div>
        <div id="map-tooltip" style="display:none; position:absolute; background:rgba(0,0,0,0.8); color:white; padding:5px; border-radius:5px; pointer-events:none; z-index: 100;"></div>
    `;

    contentPanel.innerHTML = html;
}

export function navigateToLocation(locationName) {
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
            btnContainer.innerHTML = `
                <div style="position: absolute; top: 20px; left: 0; width: 100%; text-align: center; z-index: 10; color: white; text-shadow: 2px 2px 4px black; font-size: 24px;">
                    <h3>Standard Route $10 Special Route $20</h3>
                </div>
                <div style="display: flex; justify-content: space-evenly; align-items: center; width: 100%; height: 100%; padding: 15px; box-sizing: border-box;">
                    <div style="position: relative; text-align: center; flex: 1 1 0; max-width: 200px; margin: 0 5px;">
                        <img src="./Assets/Extra/Casino Starter Troupe.png" alt="Starter Troupe" style="width: 100%; display: block; filter: drop-shadow(0 0 10px black);">
                        <div onclick="window.startCasinoEncounter(false, 'Casino - Starter Troupe')" style="position: absolute; left: 15.38%; top: 33.47%; width: 62.06%; height: 28.08%; cursor: pointer; clip-path: polygon(0 0, 100% 0, 100% 100%, 0 100%);" title="Standard Encounter ($10)"></div>
                        <div onclick="window.startCasinoEncounter(true, 'Casino - Starter Troupe')" style="position: absolute; left: 18.14%; top: 85.36%; width: 55.62%; height: 10.16%; cursor: pointer; clip-path: polygon(0 0, 100% 0, 100% 100%, 0 100%);" title="Special Encounter ($20)"></div>
                    </div>
                    <div style="position: relative; text-align: center; flex: 1 1 0; max-width: 200px; margin: 0 5px;">
                        <img src="./Assets/Extra/Casino Mid Troupe.png" alt="Mid Troupe" style="width: 100%; display: block; filter: drop-shadow(0 0 10px black);">
                        <div onclick="window.startCasinoEncounter(false, 'Casino - Mid Troupe')" style="position: absolute; left: 15.38%; top: 33.47%; width: 62.06%; height: 28.08%; cursor: pointer; clip-path: polygon(0 0, 100% 0, 100% 100%, 0 100%);" title="Standard Encounter ($10)"></div>
                        <div onclick="window.startCasinoEncounter(true, 'Casino - Mid Troupe')" style="position: absolute; left: 18.14%; top: 85.36%; width: 55.62%; height: 10.16%; cursor: pointer; clip-path: polygon(0 0, 100% 0, 100% 100%, 0 100%);" title="Special Encounter ($20)"></div>
                    </div>
                    <div style="position: relative; text-align: center; flex: 1 1 0; max-width: 200px; margin: 0 5px;">
                        <img src="./Assets/Extra/Casino Late Troupe.png" alt="Late Troupe" style="width: 100%; display: block; filter: drop-shadow(0 0 10px black);">
                        <div onclick="window.startCasinoEncounter(false, 'Casino - Late Troupe')" style="position: absolute; left: 15.38%; top: 33.47%; width: 62.06%; height: 28.08%; cursor: pointer; clip-path: polygon(0 0, 100% 0, 100% 100%, 0 100%);" title="Standard Encounter ($10)"></div>
                        <div onclick="window.startCasinoEncounter(true, 'Casino - Late Troupe')" style="position: absolute; left: 18.14%; top: 85.36%; width: 55.62%; height: 10.16%; cursor: pointer; clip-path: polygon(0 0, 100% 0, 100% 100%, 0 100%);" title="Special Encounter ($20)"></div>
                    </div>
                    <div style="position: relative; text-align: center; flex: 1 1 0; max-width: 200px; margin: 0 5px;">
                        <img src="./Assets/Extra/Casino Eeveelutions.png" alt="Eeveelutions" style="width: 100%; display: block; filter: drop-shadow(0 0 10px black);">
                        <div onclick="window.startCasinoEncounter(false, 'Casino - Eeveelutions')" style="position: absolute; left: 15.38%; top: 33.47%; width: 62.06%; height: 28.08%; cursor: pointer; clip-path: polygon(0 0, 100% 0, 100% 100%, 0 100%);" title="Standard Encounter ($10)"></div>
                        <div onclick="window.startCasinoEncounter(true, 'Casino - Eeveelutions')" style="position: absolute; left: 18.14%; top: 85.36%; width: 55.62%; height: 10.16%; cursor: pointer; clip-path: polygon(0 0, 100% 0, 100% 100%, 0 100%);" title="Special Encounter ($20)"></div>
                    </div>
                    <div style="position: relative; text-align: center; flex: 1 1 0; max-width: 200px; margin: 0 5px;">
                        <img src="./Assets/Extra/Casino Special Spot.png" alt="Special Spot" style="width: 100%; display: block; filter: drop-shadow(0 0 10px black);">
                        <div onclick="window.startCasinoEncounter(false, 'Casino - Special Spot')" style="position: absolute; left: 15.38%; top: 33.47%; width: 62.06%; height: 28.08%; cursor: pointer; clip-path: polygon(0 0, 100% 0, 100% 100%, 0 100%);" title="Standard Encounter ($10)"></div>
                        <div onclick="window.startCasinoEncounter(true, 'Casino - Special Spot')" style="position: absolute; left: 18.14%; top: 85.36%; width: 55.62%; height: 10.16%; cursor: pointer; clip-path: polygon(0 0, 100% 0, 100% 100%, 0 100%);" title="Special Encounter ($20)"></div>
                    </div>
                </div>
            `;
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
        html += `<div class="casino-overlay-btn" onclick="window.startCasinoEncounter(false, '${locationName}')" style="position: absolute; left: ${stdLeft}%; top: ${stdTop}%; width: ${stdWidth}%; height: ${stdHeight}%; cursor: pointer;" title="Standard Encounter ($10)"></div>`;
        html += `<div class="casino-overlay-btn" onclick="window.startCasinoEncounter(true, '${locationName}')" style="position: absolute; left: ${shinyLeft}%; top: ${shinyTop}%; width: ${shinyWidth}%; height: ${shinyHeight}%; cursor: pointer;" title="Special Encounter ($20)"></div>`;
        html += `<button class="casino-overlay-btn" onclick="window.navigateToLocation('Casino')" style="position: absolute; top: 10px; left: 10px; padding: 10px; cursor: pointer; z-index: 100;">Back to Lobby</button>`;

        // Append to the viewCasino container
        viewCasino.insertAdjacentHTML('beforeend', html);
    } else if (locationName === "Daycare") {
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
    } else if (locationName.includes("Gym") || locationName === "Indigo Plateu") {
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
        else if (locationName === "Indigo Plateu") {
            // Pick a random E4 background for now, or the first one
            bgImg = "BG-Elite4-1Lorelei.png";
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
            const playerLvl = state.party[0] ? state.party[0].level : 1;
            if (playerLvl < gymConfig.levelRequirement) {
                buttonHtml = `<p style="color: red;">Level ${gymConfig.levelRequirement} required to challenge this Gym.</p>`;
            } else {
                buttonHtml = `<button onclick="window.startGymBattle('${lookupName}')" style="padding: 10px 20px; font-size: 16px; margin-top: 10px; cursor: pointer;">Challenge ${locationName}</button>`;
            }
        }

        vGym.innerHTML = `
            <div style="background-color: rgba(0,0,0,0.8); display: inline-block; padding: 20px; margin-top: 50px; border-radius: 8px;">
                <h2>${locationName}</h2>
                <div id="gym-content-area">
                    ${buttonHtml}
                </div>
            </div>
        `;
        if (bgImg) {
            vGym.style.backgroundImage = `url('./Assets/BG/${bgImg}')`;
            vGym.style.backgroundSize = "cover";
            vGym.style.height = "100%";
            vGym.style.textAlign = "center";
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
    const tooltip = document.getElementById('map-tooltip');
    if (!tooltip) return;

    let info = `<strong>${locationName}</strong><br>`;

    // Fetch info to show on tooltip
    if (locationName.includes("Gym") || locationName === "Elite 4") {
        let lookupName = locationName;
        if (lookupName === "Elite 4") lookupName = "Indigo Plateau";

        if (state.config.gyms) {
            const gym = state.config.gyms.find(g => g.name === lookupName);
            if (gym) {
                info += `Leader: ${gym.leader}<br>`;
                info += `Lvl Req: ${gym.levelRequirement}<br>`;
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
                    const pd = state.config.pokemonData.find(p => p.id === s.pokemonId);
                    if (pd) pName = pd.name;
                }
                info += `- ${pName} (${Math.round(s.chance * 100)}%)<br>`;
            });
        } else {
            info += `Hub Area<br>`;
        }
    }

    tooltip.innerHTML = info;
    tooltip.style.display = 'block';

    // Fix tooltip positioning by using fixed position for the tooltip to avoid offset issues
    tooltip.style.position = 'fixed';
    tooltip.style.left = (e.clientX + 15) + 'px';
    tooltip.style.top = (e.clientY + 15) + 'px';
}

export function hideMapTooltip() {
    const tooltip = document.getElementById('map-tooltip');
    if (tooltip) tooltip.style.display = 'none';
}
