const fs = require('fs');
let code = fs.readFileSync('src/ui/map.js', 'utf8');

const search = `    } else if (locationName === "Celadon Casino" || locationName === "Goldenrod Game Corner") {
        window.currentCasinoHub = locationName;
        if (battleSystem) {
             battleSystem.stop();
             battleSystem.activeEncounter = null;
             battleSystem.isSearching = false;
             if (battleSystem.gymState) battleSystem.gymState.isActive = false;
        }
        switchView("CASINO_HUB");

        // Reset Casino background to default lobby if it was changed
        const viewCasino = document.getElementById("view-casino");
        viewCasino.style.backgroundImage = "url('./Assets/BG/Casino.png')";
        const casinoContent = document.getElementById("casino-content");
        if(casinoContent) casinoContent.style.display = 'block';

        // Clear any overlay buttons
        const oldOverlays = viewCasino.querySelectorAll('.casino-overlay-btn');
        oldOverlays.forEach(el => el.remove());

        const btnContainer = document.getElementById("casino-buttons-container");
        if (btnContainer) {
            btnContainer.style.width = '100%';
            btnContainer.style.height = '100%';`;

const replace = `    } else if (locationName === "Celadon Casino" || locationName === "Goldenrod Game Corner") {
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
            vGym.appendChild(casinoContent);`;

if (code.includes(search)) {
    code = code.replace(search, replace);
    fs.writeFileSync('src/ui/map.js', code);
    console.log("Replaced successfully!");
} else {
    console.log("Search string not found!");
}
