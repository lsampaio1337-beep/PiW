const fs = require('fs');
let code = fs.readFileSync('src/ui/map.js', 'utf8');

let searchCasinoHub = `        let machinesHtml = \`
            <div style="position: absolute; top: 20px; left: 0; width: 100%; text-align: center; z-index: 10; color: white; text-shadow: 2px 2px 4px black; font-size: 24px;">
                <h3>Standard Route $\${state.config.balance.casinoPrices?.standard || 75} 2x Shiny $\${state.config.balance.casinoPrices?.doubleShiny || 200}</h3>
            </div>
            <div style="position: absolute; top: 0; left: 0; display: flex; justify-content: space-evenly; align-items: center; width: 100%; height: 100%; padding: 15px; box-sizing: border-box;">\`;`;

let replaceCasinoHub = `        let machinesHtml = \`
            <div style="position: absolute; top: 20px; left: 0; width: 100%; text-align: center; z-index: 10; color: white; text-shadow: 2px 2px 4px black; font-size: 24px;">
                <h3>Standard Route $\${state.config.balance.casinoPrices?.standard || 75} 2x Shiny $\${state.config.balance.casinoPrices?.doubleShiny || 200}</h3>
            </div>
            <div style="position: absolute; top: 0; left: 0; display: flex; justify-content: space-evenly; align-items: center; width: 100%; height: 100%; padding: 15px; box-sizing: border-box;">\`;`;

// The issue was I replaced the whole chunk, then my second patch tried to replace a different chunk. Wait, let me just replace the entire else if block for Casino Hub to be safe.

let elseIfStart = code.indexOf(`    } else if (locationName === "Celadon Casino" || locationName === "Goldenrod Game Corner") {`);
let elseIfEnd = code.indexOf(`    } else if (locationName.startsWith("Celadon Casino ")`);
let casinoHubCode = code.substring(elseIfStart, elseIfEnd);

let newCasinoHubCode = `    } else if (locationName === "Celadon Casino" || locationName === "Goldenrod Game Corner") {
        window.currentCasinoHub = locationName;
        if (battleSystem) {
             battleSystem.stop();
             battleSystem.activeEncounter = null;
             battleSystem.isSearching = false;
             if (battleSystem.gymState) battleSystem.gymState.isActive = false;
        }

        const vGym = document.getElementById("map-inner-modal-content");
        const vGymTitle = document.getElementById("map-inner-modal-title");

        if (vGymTitle) {
            vGymTitle.innerText = locationName;
        }

        vGym.replaceChildren();
        vGym.style.position = "relative";
        vGym.style.height = "100%";
        vGym.style.width = "100%";
        vGym.style.backgroundImage = "none";
        vGym.style.backgroundColor = "black";

        const flexContainer = document.createElement('div');
        flexContainer.style.width = '100%';
        flexContainer.style.height = '100%';
        flexContainer.style.display = 'flex';
        flexContainer.style.justifyContent = 'center';
        flexContainer.style.alignItems = 'center';
        flexContainer.style.position = 'relative';

        const wrapper = document.createElement('div');
        wrapper.style.position = 'relative';
        wrapper.style.display = 'inline-block';
        wrapper.style.maxWidth = '100%';
        wrapper.style.maxHeight = '100%';

        const imgEl = document.createElement('img');
        imgEl.src = "./Assets/BG/Casino.png";
        imgEl.style.maxWidth = '100%';
        imgEl.style.maxHeight = '100%';
        imgEl.style.display = 'block';
        imgEl.style.objectFit = 'contain';

        wrapper.appendChild(imgEl);

        const completedChallenges = state.stats.completedChallengeIds || [];
        const isUnlockedByAreaId = (areaId) => completedChallenges.some(id => parseAreaNames(id).includes(areaId));

        let machinesHtml = \`
            <div style="position: absolute; top: 20px; left: 0; width: 100%; text-align: center; z-index: 10; color: white; text-shadow: 2px 2px 4px black; font-size: 24px;">
                <h3>Standard Route $\${state.config.balance.casinoPrices?.standard || 75} 2x Shiny $\${state.config.balance.casinoPrices?.doubleShiny || 200}</h3>
            </div>
            <div style="position: absolute; top: 0; left: 0; display: flex; justify-content: space-evenly; align-items: center; width: 100%; height: 100%; padding: 15px; box-sizing: border-box;">
                    <div style="position: relative; text-align: center; flex: 1 1 0; max-width: 200px; margin: 0 5px;">
                        <img src="./Assets/Extra/Casino/\${window.currentMapRegion === 'Johto' ? (window.currentCasinoHub === 'Goldenrod Game Corner' ? 'Region2 Johto Babies.png' : 'Region2 Kanto Starter Troupe.png') : 'Region1 Starter Troupe.png'}" alt="Starter Troupe" style="width: 100%; display: block; filter: drop-shadow(0 0 10px black);">
                        <div onclick="window.startCasinoEncounter(false, window.currentMapRegion === 'Johto' && window.currentCasinoHub === 'Goldenrod Game Corner' ? 'Goldenrod Babies Corner' : 'Celadon Casino Starter Troupe')" style="position: absolute; left: 15.38%; top: 33.47%; width: 62.06%; height: 28.08%; cursor: pointer; clip-path: polygon(0 0, 100% 0, 100% 100%, 0 100%);" title="Standard Encounter ($\${state.config.balance.casinoPrices?.standard || 75})"></div>
                        <div onclick="window.startCasinoEncounter(true, window.currentMapRegion === 'Johto' && window.currentCasinoHub === 'Goldenrod Game Corner' ? 'Goldenrod Babies Corner' : 'Celadon Casino Starter Troupe')" style="position: absolute; left: 18.14%; top: 85.36%; width: 55.62%; height: 10.16%; cursor: pointer; clip-path: polygon(0 0, 100% 0, 100% 100%, 0 100%);" title="2x Shiny ($\${state.config.balance.casinoPrices?.doubleShiny || 200})"></div>
                    </div>
            \`;

            if (window.currentCasinoHub === 'Goldenrod Game Corner' || ((window.currentMapRegion === 'Johto' && window.currentCasinoHub !== 'Goldenrod Game Corner') ? isUnlockedByAreaId('Celadon Casino Starter Troupe') : isUnlockedByAreaId('Celadon Casino'))) {
                machinesHtml += \`
                    <div style="position: relative; text-align: center; flex: 1 1 0; max-width: 200px; margin: 0 5px;">
                        <img src="./Assets/Extra/Casino/\${window.currentMapRegion === 'Johto' ? (window.currentCasinoHub === 'Goldenrod Game Corner' ? 'Region2 Johto Lucky Spot.png' : 'Region2 Kanto Babies.png') : 'Region1 Mid Troupe.png'}" alt="\${window.currentMapRegion === 'Johto' ? 'Babies' : 'Mid Troupe'}" style="width: 100%; display: block; filter: drop-shadow(0 0 10px black);">
                        <div onclick="window.startCasinoEncounter(false, window.currentMapRegion === 'Johto' && window.currentCasinoHub === 'Goldenrod Game Corner' ? 'Goldenrod Lucky Spot Corner' : 'Celadon Casino Mid Troupe')" style="position: absolute; left: 15.38%; top: 33.47%; width: 62.06%; height: 28.08%; cursor: pointer; clip-path: polygon(0 0, 100% 0, 100% 100%, 0 100%);" title="Standard Encounter ($\${state.config.balance.casinoPrices?.standard || 75})"></div>
                        <div onclick="window.startCasinoEncounter(true, window.currentMapRegion === 'Johto' && window.currentCasinoHub === 'Goldenrod Game Corner' ? 'Goldenrod Lucky Spot Corner' : 'Celadon Casino Mid Troupe')" style="position: absolute; left: 18.14%; top: 85.36%; width: 55.62%; height: 10.16%; cursor: pointer; clip-path: polygon(0 0, 100% 0, 100% 100%, 0 100%);" title="2x Shiny ($\${state.config.balance.casinoPrices?.doubleShiny || 200})"></div>
                    </div>
                \`;
            }

            if ((window.currentMapRegion === 'Johto' ? isUnlockedByAreaId('Dojo') : isUnlockedByAreaId('Big Fishing Spot')) && window.currentCasinoHub !== 'Goldenrod Game Corner') {
                machinesHtml += \`
                    <div style="position: relative; text-align: center; flex: 1 1 0; max-width: 200px; margin: 0 5px;">
                        <img src="./Assets/Extra/Casino/\${window.currentMapRegion === 'Johto' ? 'Region2 Late Troupe Kanto.png' : 'Region1 Late Troupe.png'}" alt="Late Troupe" style="width: 100%; display: block; filter: drop-shadow(0 0 10px black);">
                        <div onclick="window.startCasinoEncounter(false, 'Celadon Casino Late Troupe')" style="position: absolute; left: 15.38%; top: 33.47%; width: 62.06%; height: 28.08%; cursor: pointer; clip-path: polygon(0 0, 100% 0, 100% 100%, 0 100%);" title="Standard Encounter ($\${state.config.balance.casinoPrices?.standard || 75})"></div>
                        <div onclick="window.startCasinoEncounter(true, 'Celadon Casino Late Troupe')" style="position: absolute; left: 18.14%; top: 85.36%; width: 55.62%; height: 10.16%; cursor: pointer; clip-path: polygon(0 0, 100% 0, 100% 100%, 0 100%);" title="2x Shiny ($\${state.config.balance.casinoPrices?.doubleShiny || 200})"></div>
                    </div>
                \`;
            }

            if ((window.currentMapRegion === 'Johto' ? isUnlockedByAreaId('Celadon Casino Special Spot') : isUnlockedByAreaId('Small Fishing Spot')) && window.currentCasinoHub !== 'Goldenrod Game Corner') {
                machinesHtml += \`
                    <div style="position: relative; text-align: center; flex: 1 1 0; max-width: 200px; margin: 0 5px;">
                        <img src="./Assets/Extra/Casino/\${window.currentMapRegion === 'Johto' ? 'Region2 Kanto Eeveelutions.png' : 'Region1 Eeveelutions.png'}" alt="Eeveelutions" style="width: 100%; display: block; filter: drop-shadow(0 0 10px black);">
                        <div onclick="window.startCasinoEncounter(false, 'Celadon Casino Eeveelutions')" style="position: absolute; left: 15.38%; top: 33.47%; width: 62.06%; height: 28.08%; cursor: pointer; clip-path: polygon(0 0, 100% 0, 100% 100%, 0 100%);" title="Standard Encounter ($\${state.config.balance.casinoPrices?.standard || 75})"></div>
                        <div onclick="window.startCasinoEncounter(true, 'Celadon Casino Eeveelutions')" style="position: absolute; left: 18.14%; top: 85.36%; width: 55.62%; height: 10.16%; cursor: pointer; clip-path: polygon(0 0, 100% 0, 100% 100%, 0 100%);" title="2x Shiny ($\${state.config.balance.casinoPrices?.doubleShiny || 200})"></div>
                    </div>
                \`;
            }

            if ((window.currentMapRegion === 'Johto' ? isUnlockedByAreaId('Celadon Casino Babies') : isUnlockedByAreaId('Fighting Dojo')) && window.currentCasinoHub !== 'Goldenrod Game Corner') {
                machinesHtml += \`
                    <div style="position: relative; text-align: center; flex: 1 1 0; max-width: 200px; margin: 0 5px;">
                        <img src="./Assets/Extra/Casino/\${window.currentMapRegion === 'Johto' ? 'Region2 Kanto Special Spot.png' : 'Region1 Special Spot.png'}" alt="Special Spot" style="width: 100%; display: block; filter: drop-shadow(0 0 10px black);">
                        <div onclick="window.startCasinoEncounter(false, 'Celadon Casino Special Spot')" style="position: absolute; left: 15.38%; top: 33.47%; width: 62.06%; height: 28.08%; cursor: pointer; clip-path: polygon(0 0, 100% 0, 100% 100%, 0 100%);" title="Standard Encounter ($\${state.config.balance.casinoPrices?.standard || 75})"></div>
                        <div onclick="window.startCasinoEncounter(true, 'Celadon Casino Special Spot')" style="position: absolute; left: 18.14%; top: 85.36%; width: 55.62%; height: 10.16%; cursor: pointer; clip-path: polygon(0 0, 100% 0, 100% 100%, 0 100%);" title="2x Shiny ($\${state.config.balance.casinoPrices?.doubleShiny || 200})"></div>
                    </div>
                \`;
            }

            machinesHtml += \`</div>\`;

            const overlayContainer = document.createElement('div');
            overlayContainer.style.position = 'absolute';
            overlayContainer.style.top = '0';
            overlayContainer.style.left = '0';
            overlayContainer.style.width = '100%';
            overlayContainer.style.height = '100%';
            overlayContainer.innerHTML = machinesHtml;

            wrapper.appendChild(overlayContainer);
            flexContainer.appendChild(wrapper);
            vGym.appendChild(flexContainer);

        const overlay = document.getElementById('map-inner-modal-overlay');
        if (overlay) overlay.style.display = 'flex';

`;

code = code.replace(casinoHubCode, newCasinoHubCode);
fs.writeFileSync('src/ui/map.js', code);
