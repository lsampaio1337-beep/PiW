<<<<<<< SEARCH
    if (state.stats.newRoutes && state.stats.newRoutes.some(r => parseAreaNames(r).includes(locationName))) {
        state.stats.newRoutes = state.stats.newRoutes.filter(r => !parseAreaNames(r).includes(locationName));
    }

    const battleSystem = globals.battleSystem;
    state.currentRoute = locationName;
    if (window.closeModal) window.closeModal();

    // Ensure main view and party windows are open when navigating, especially to places like Professor Lab
    if (window.windowManager) {
        window.windowManager.toggleWindow('main-view-window', true);
        window.windowManager.toggleWindow('party-window', true);
    }
=======
    if (state.stats.newRoutes && state.stats.newRoutes.some(r => parseAreaNames(r).includes(locationName))) {
        state.stats.newRoutes = state.stats.newRoutes.filter(r => !parseAreaNames(r).includes(locationName));
    }

    const battleSystem = globals.battleSystem;

    // Do not set currentRoute to Gym or Pokemon League to keep player fighting on current route
    if (!locationName.includes("Gym") && !locationName.includes("Pokemon League")) {
        state.currentRoute = locationName;
    }

    if (window.closeModal) window.closeModal();

    // Ensure main view and party windows are open when navigating, especially to places like Professor Lab
    if (window.windowManager) {
        window.windowManager.toggleWindow('main-view-window', true);
        window.windowManager.toggleWindow('party-window', true);
    }
>>>>>>> REPLACE
<<<<<<< SEARCH
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
        const gymConfig = state.config.gyms.find(g => g.name === lookupName);

        if (vGymTitle) {
            vGymTitle.innerText = locationName;
        }

        // Stop current battle system
        if (battleSystem) {
            battleSystem.stop();
        }
=======
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
        const gymConfig = state.config.gyms.find(g => g.name === lookupName);

        if (vGymTitle) {
            vGymTitle.innerText = locationName;
        }
>>>>>>> REPLACE
<<<<<<< SEARCH
        if (gymConfig && contentArea) {
            let buttonText = lookupName.includes("Pokemon League") ? "Challenge" : "Battle Gym";
            const btn = document.createElement('button');
            btn.className = "action-btn action-btn-primary";
            btn.style.marginTop = "10px";
            btn.textContent = buttonText;
            btn.onclick = () => { window.startGymBattle(lookupName); };
            contentArea.appendChild(btn);
        }
=======
        if (gymConfig && contentArea) {
            let buttonText = lookupName.includes("Pokemon League") ? "Challenge" : "Enter Gym";
            const btn = document.createElement('button');
            btn.className = "action-btn action-btn-primary";
            btn.style.marginTop = "10px";
            btn.textContent = buttonText;
            btn.onclick = () => { window.startGymBattle(lookupName); };
            contentArea.appendChild(btn);
        }
>>>>>>> REPLACE
