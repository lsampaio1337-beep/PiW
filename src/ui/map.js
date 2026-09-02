import { state, globals } from '../state.js';
import { updateUI, switchView } from '../ui.js';

export function showMap() {
    let rightCol = document.getElementById('modal-overlay');
    let contentPanel = document.getElementById('content-panel');
    rightCol.style.display = 'flex';

    // Generate Interactive Map HTML
    let html = `
        <div id="interactive-map" style="position: relative; width: 100%; aspect-ratio: 16/11; background-image: url('./Assets/Map/Kanto Map.png'); background-size: contain; background-repeat: no-repeat; background-position: center; border: 2px solid #fff; border-radius: 8px;">
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
            else if (['mount_moon', 'rock_tunnel', 'cerulean_cave', 'seafoam_islands', 'diglett_s_cave'].includes(locationId)) markerImg = './Assets/Map/Spot_Cave.png';
            else if (locationId === 'small_fishing_spot') markerImg = './Assets/Map/Spot_Fishing1.png';
            else if (locationId === 'big_fishing_spot') markerImg = './Assets/Map/Spot_Fishing2.png';
            else if (locationId === 'fighting_dojo') markerImg = './Assets/Map/Spot_FightingDojo.png';
            else if (locationId === 'fossil_revival') markerImg = './Assets/Map/Spot_FossilRevival.png';
            else if (locationId === 'pok_mon_mansion') markerImg = './Assets/Map/Spot_PokeMansion.png';
            else if (locationId === 'trade_with_a_friend') markerImg = './Assets/Map/Spot_TradeHub.png';
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
            if (['professor_oak_lab', 'pokemon_center___market', 'indigo_plateu', 'safari_zone', 'casino', 'mount_moon', 'rock_tunnel', 'cerulean_cave', 'seafoam_islands', 'small_fishing_spot', 'big_fishing_spot', 'fighting_dojo', 'fossil_revival', 'pok_mon_mansion', 'trade_with_a_friend', 'daycare', 'diglett_s_cave'].includes(locationId)) {
                // Ensure spot markers like casino and diglett's cave are standard size
                markerWidth = "24px";
                markerHeight = "24px";
            }


            html += `
                <div class="map-marker"
                     data-location="${locationName}"
                     title="${locationName}"
                     style="position: absolute; left: ${coords.x}%; top: ${coords.y}%; width: ${markerWidth}; height: ${markerHeight}; background-image: url('${markerImg}'); background-size: contain; background-repeat: no-repeat; transform: translate(-50%, -50%); cursor: ${isClickable ? 'pointer' : 'default'};"
                     ${isClickable ? `onclick="window.navigateToLocation('${locationName}')"` : ''}
                     onmouseover="window.showMapTooltip(event, '${locationName}')"
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
    document.getElementById('modal-overlay').style.display = 'none';

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
            btnContainer.innerHTML = `
                <div style="display: grid; grid-template-columns: repeat(5, 1fr); gap: 15px; padding: 15px;">
                    <div onclick="window.navigateToLocation('Casino - Starter Troupe')" style="cursor: pointer; text-align: center;">
                        <img src="./Assets/Extra/Casino Starter Troupe.png" alt="Starter Troupe" style="width: 100%; max-width: 200px; border-radius: 8px; border: 2px solid #555;">
                        <p style="margin-top: 5px; font-weight: bold;">Starter Troupe</p>
                    </div>
                    <div onclick="window.navigateToLocation('Casino - Mid Troupe')" style="cursor: pointer; text-align: center;">
                        <img src="./Assets/Extra/Casino Mid Troupe.png" alt="Mid Troupe" style="width: 100%; max-width: 200px; border-radius: 8px; border: 2px solid #555;">
                        <p style="margin-top: 5px; font-weight: bold;">Mid Troupe</p>
                    </div>
                    <div onclick="window.navigateToLocation('Casino - Late Troupe')" style="cursor: pointer; text-align: center;">
                        <img src="./Assets/Extra/Casino Late Troupe.png" alt="Late Troupe" style="width: 100%; max-width: 200px; border-radius: 8px; border: 2px solid #555;">
                        <p style="margin-top: 5px; font-weight: bold;">Late Troupe</p>
                    </div>
                    <div onclick="window.navigateToLocation('Casino - Eeveelutions')" style="cursor: pointer; text-align: center;">
                        <img src="./Assets/Extra/Casino Eeveelutions.png" alt="Eeveelutions" style="width: 100%; max-width: 200px; border-radius: 8px; border: 2px solid #555;">
                        <p style="margin-top: 5px; font-weight: bold;">Eeveelutions</p>
                    </div>
                    <div onclick="window.navigateToLocation('Casino - Special Spot')" style="cursor: pointer; text-align: center;">
                        <img src="./Assets/Extra/Casino Special Spot.png" alt="Special Spot" style="width: 100%; max-width: 200px; border-radius: 8px; border: 2px solid #555;">
                        <p style="margin-top: 5px; font-weight: bold;">Special Spot</p>
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
        html += `<div class="casino-overlay-btn" onclick="window.startCasinoEncounter(false, '${locationName}')" style="position: absolute; left: ${shinyLeft}%; top: ${shinyTop}%; width: ${shinyWidth}%; height: ${shinyHeight}%; cursor: pointer;" title="Special Encounter ($10)"></div>`;
        html += `<button class="casino-overlay-btn" onclick="window.navigateToLocation('Casino')" style="position: absolute; top: 10px; left: 10px; padding: 10px; cursor: pointer; z-index: 100;">Back to Lobby</button>`;

        // Append to the viewCasino container
        viewCasino.insertAdjacentHTML('beforeend', html);
    } else if (locationName === "Pokemon Center & Market" || locationName.includes("Market")) {
        if (battleSystem) {
             battleSystem.stop();
             battleSystem.activeEncounter = null;
             battleSystem.isSearching = false;
             if (battleSystem.gymState) battleSystem.gymState.isActive = false;
        }
        switchView("POKEMON_CENTER_MARKET");
        const vCenter = document.getElementById("view-center-market");
        vCenter.innerHTML = `
            <div style="background-color: rgba(0,0,0,0.8); display: inline-block; padding: 20px; margin-top: 50px; border-radius: 8px;">
                <h2>Pokemon Center & Market</h2>
                <div style="margin-top: 20px;">
                    <button id="btn-heal-all" style="padding: 10px 20px; font-size: 16px; margin-right: 10px;">Pokemon Center (Heal All)</button>
                    <button id="btn-market-buy" style="padding: 10px 20px; font-size: 16px;">Market (Buy Items)</button>
                </div>
                <div id="market-panel" style="margin-top: 20px; display: none; text-align: left; max-height: 300px; overflow-y: auto;">
                    <h3>Buy Items</h3>
                    <div id="market-items"></div>
                </div>
            </div>
        `;
        // vCenter.style.backgroundImage = "url('./Assets/BG/BG-PC&M.png')"; // missing asset
        vCenter.style.backgroundSize = "cover";
        vCenter.style.height = "100%";
        vCenter.style.textAlign = "center";

        document.getElementById('btn-heal-all').onclick = () => {
            state.party.forEach(p => p.currentHp = p.maxHp);
            alert("All Pokemon have been healed!");
            updateUI();
        };

        document.getElementById('btn-market-buy').onclick = () => {
            const panel = document.getElementById('market-panel');
            panel.style.display = panel.style.display === 'none' ? 'block' : 'none';
            if(panel.style.display === 'block') {
                const itemsDiv = document.getElementById('market-items');
                let itemsHtml = '<h4>Pokeballs</h4>';

                // Pokeballs dynamically from config
                state.config.balance.items.pokeballs.forEach(b => {
                    if (state.backpack.pokeballs[b.name] !== undefined) {
                        itemsHtml += `<div style="margin-bottom: 5px; display: flex; align-items: center; justify-content: space-between;">
                            <span>${b.name} ($${b.price})</span>
                            <div>
                                <input type="number" id="buy-qty-${b.name.replace(/\\s+/g, '-')}" value="1" min="1" style="width: 50px; padding: 5px; margin-right: 5px;">
                                <button onclick="window.buyItem('${b.name}', ${b.price}, 'pokeballs')">Buy</button>
                            </div>
                        </div>`;
                    }
                });

                itemsHtml += '<h4>Potions</h4>';

                // Potions dynamically from config
                state.config.balance.items.potions.forEach(p => {
                    let inventoryName = p.name;
                    // Map config names to inventory names where they differ slightly
                    if (p.name === 'Regular Potion') inventoryName = 'Regular Potion';
                    if (p.name === 'Big') inventoryName = 'Big Potion';
                    if (p.name === 'Max Potion') return; // Excluded from backpack initial state for now unless added

                    if (state.backpack.potions[inventoryName] !== undefined) {
                        itemsHtml += `<div style="margin-bottom: 5px; display: flex; align-items: center; justify-content: space-between;">
                            <span>${inventoryName} ($${p.price})</span>
                            <div>
                                <input type="number" id="buy-qty-${inventoryName.replace(/\\s+/g, '-')}" value="1" min="1" style="width: 50px; padding: 5px; margin-right: 5px;">
                                <button onclick="window.buyItem('${inventoryName}', ${p.price}, 'potions')">Buy</button>
                            </div>
                        </div>`;
                    }
                });

                itemsHtml += '<h4>Stones</h4>';

                // Stones from config (only has price/sell, need to list all stones in backpack)
                const stonePrice = state.config.balance.items.stones.price;
                Object.keys(state.backpack.stones).forEach(stoneName => {
                    itemsHtml += `<div style="margin-bottom: 5px; display: flex; align-items: center; justify-content: space-between;">
                        <span>${stoneName} ($${stonePrice})</span>
                        <div>
                            <input type="number" id="buy-qty-${stoneName.replace(/\\s+/g, '-')}" value="1" min="1" style="width: 50px; padding: 5px; margin-right: 5px;">
                            <button onclick="window.buyItem('${stoneName}', ${stonePrice}, 'stones')">Buy</button>
                        </div>
                    </div>`;
                });

                itemsDiv.innerHTML = itemsHtml;
            }
        };

        window.buyItem = (itemId, cost, category) => {
            const inputEl = document.getElementById(`buy-qty-${itemId.replace(/\\s+/g, '-')}`);
            if (!inputEl) return;
            const quantity = parseInt(inputEl.value);
            if (isNaN(quantity) || quantity <= 0) return;

            const totalCost = cost * quantity;

            if (state.trainer.money >= totalCost) {
                state.trainer.money -= totalCost;
                state.backpack[category][itemId] += quantity;
                updateUI();
                alert(`Bought ${quantity}x ${itemId} for $${totalCost}!`);
            } else {
                alert(`Not enough money! You need $${totalCost} but only have $${state.trainer.money}.`);
            }
        };
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
            <div style="position: absolute; left: 33%; top: 50%; transform: translate(-50%, -50%);">
                <div style="background-color: rgba(0,0,0,0.8); display: inline-block; padding: 20px; border-radius: 8px;">
                    <h2 style="margin-top: 0;">${locationName}</h2>
                    <div id="gym-content-area">
                        ${buttonHtml}
                    </div>
                </div>
            </div>
        `;
        if (bgImg) {
            vGym.style.backgroundImage = `url('./Assets/BG/${bgImg}')`;
            vGym.style.backgroundSize = "cover";
            vGym.style.height = "100%";
            vGym.style.textAlign = "center";
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
