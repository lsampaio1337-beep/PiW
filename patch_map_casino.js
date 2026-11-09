const fs = require('fs');

const path = 'src/ui/map.js';
let content = fs.readFileSync(path, 'utf8');

const casinoStart = content.indexOf('} else if (locationName === "Celadon Casino" || locationName === "Goldenrod Game Corner") {');
const casinoEnd = content.indexOf('} else if (locationName.startsWith("Celadon Casino ") || locationName === "Celadon Casino Starter Troupe"', casinoStart);

if (casinoStart > -1 && casinoEnd > -1) {
    const oldCasinoBlock = content.substring(casinoStart, casinoEnd);

    const newCasinoBlock = `} else if (locationName === "Celadon Casino" || locationName === "Goldenrod Game Corner") {
        window.currentCasinoHub = locationName;
        if (battleSystem) {
             battleSystem.stop();
             battleSystem.activeEncounter = null;
             battleSystem.isSearching = false;
             if (battleSystem.gymState) battleSystem.gymState.isActive = false;
        }

        const completedChallenges = state.stats.completedChallengeIds || [];
        const isUnlockedByAreaId = (areaId) => completedChallenges.some(id => parseAreaNames(id).includes(areaId));

        let machinesHtml = \`
            <div style="position: relative; width: 100%; min-height: 400px; background-image: url('./Assets/BG/Casino.png'); background-size: 100% 100%; background-position: center; display: flex; align-items: center; justify-content: center; overflow: hidden; border-radius: 8px;">
                <div style="position: absolute; top: 20px; left: 0; width: 100%; text-align: center; z-index: 10; color: white; text-shadow: 2px 2px 4px black; font-size: 24px;">
                    <h3>Standard Route $\${state.config.balance.casinoPrices?.standard || 75} 2x Shiny $\${state.config.balance.casinoPrices?.doubleShiny || 200}</h3>
                </div>
                <div style="display: flex; justify-content: space-evenly; align-items: center; width: 100%; height: 100%; padding: 15px; box-sizing: border-box; z-index: 2;">
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

        machinesHtml += \`
                </div>
            </div>
        \`;

        if (window.showModal) {
            window.showModal(locationName, machinesHtml, "window-casino-modal", "800px", "auto");
        }
    `;

    content = content.replace(oldCasinoBlock, newCasinoBlock);
    fs.writeFileSync(path, content);
    console.log("Patched Casino Hub in map.js");
} else {
    console.log("Could not find Casino Hub block in map.js");
}
