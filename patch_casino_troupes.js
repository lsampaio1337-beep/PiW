const fs = require('fs');
let code = fs.readFileSync('src/ui/map.js', 'utf8');

const search = `    } else if (locationName.startsWith("Celadon Casino ") || locationName === "Celadon Casino Starter Troupe" || locationName === "Celadon Casino Babies" || locationName === "Celadon Casino Special Spot" || locationName === "Celadon Casino Eeveelutions" || locationName === "Celadon Casino Late Troupe" || locationName === "Goldenrod Babies Corner" || locationName === "Goldenrod Lucky Spot Corner") {
        if (!window.currentCasinoHub) window.currentCasinoHub = "Celadon Casino";
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

        const viewCasino = document.getElementById("view-casino");
        viewCasino.style.backgroundImage = \`url('./Assets/Extra/Casino/\${bgImg}')\`;
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
        html += \`<div class="casino-overlay-btn" onclick="window.startCasinoEncounter(false, '\${locationName}')" style="position: absolute; left: \${stdLeft}%; top: \${stdTop}%; width: \${stdWidth}%; height: \${stdHeight}%; cursor: pointer;" title="Standard Encounter ($\${state.config.balance.casinoPrices?.standard || 75})"></div>\`;
        html += \`<div class="casino-overlay-btn" onclick="window.startCasinoEncounter(true, '\${locationName}')" style="position: absolute; left: \${shinyLeft}%; top: \${shinyTop}%; width: \${shinyWidth}%; height: \${shinyHeight}%; cursor: pointer;" title="2x Shiny ($\${state.config.balance.casinoPrices?.doubleShiny || 200})"></div>\`;
        html += \`<button class="casino-overlay-btn" onclick="window.navigateToLocation('Celadon Casino')" style="position: absolute; top: 10px; left: 10px; padding: 10px; cursor: pointer; z-index: 100;">Back to Lobby</button>\`;

        // Append to the viewCasino container
        viewCasino.insertAdjacentHTML('beforeend', html);
    }`;

const replace = `    } else if (locationName.startsWith("Celadon Casino ") || locationName === "Celadon Casino Starter Troupe" || locationName === "Celadon Casino Babies" || locationName === "Celadon Casino Special Spot" || locationName === "Celadon Casino Eeveelutions" || locationName === "Celadon Casino Late Troupe" || locationName === "Goldenrod Babies Corner" || locationName === "Goldenrod Lucky Spot Corner") {
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
            vGym.style.backgroundImage = \`url('./Assets/Extra/Casino/\${bgImg}')\`;
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

            html += \`<div class="casino-overlay-btn" onclick="window.startCasinoEncounter(false, '\${locationName}')" style="position: absolute; left: \${stdLeft}%; top: \${stdTop}%; width: \${stdWidth}%; height: \${stdHeight}%; cursor: pointer;" title="Standard Encounter ($\${state.config.balance.casinoPrices?.standard || 75})"></div>\`;
            html += \`<div class="casino-overlay-btn" onclick="window.startCasinoEncounter(true, '\${locationName}')" style="position: absolute; left: \${shinyLeft}%; top: \${shinyTop}%; width: \${shinyWidth}%; height: \${shinyHeight}%; cursor: pointer;" title="2x Shiny ($\${state.config.balance.casinoPrices?.doubleShiny || 200})"></div>\`;
            html += \`<button class="casino-overlay-btn" onclick="window.navigateToLocation(window.currentCasinoHub)" style="position: absolute; top: 10px; left: 10px; padding: 10px; cursor: pointer; z-index: 100;">Back to Lobby</button>\`;

            vGym.innerHTML = html;
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
                    overlay.style.padding = \`\${padding}px\`;

                    modal.style.aspectRatio = aspectRatio ? aspectRatio.toString() : 'auto';
                    modal.style.maxHeight = '100%';
                    modal.style.maxWidth = '100%';
                };

                const img = new Image();
                img.onload = () => applyPaddingAndAspect(img.naturalWidth / img.naturalHeight);
                img.src = \`./Assets/Extra/Casino/\${bgImg}\`;
            }
        }
    }`;

if (code.includes(search)) {
    code = code.replace(search, replace);
    fs.writeFileSync('src/ui/map.js', code);
    console.log("Replaced successfully!");
} else {
    console.log("Search string not found!");
}
