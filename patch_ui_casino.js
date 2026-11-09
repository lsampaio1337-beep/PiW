const fs = require('fs');

const path = 'src/ui.js';
let content = fs.readFileSync(path, 'utf8');

const casinoStr = `    window.startCasinoEncounter = (doubleShiny, locationName) => {
        state.casinoDoubleShiny = doubleShiny;
        state.currentRoute = locationName;

        if (window.windowManager) window.windowManager.closeDynamicWindow('window-casino-modal');

        // Money deduction and validation are handled by battleSystem.searchNext()
        switchView("BATTLE_ARENA");
        if (globals.battleSystem) {
             globals.battleSystem.stop();
             globals.battleSystem.activeEncounter = null;
             globals.battleSystem.isSearching = false;
             if (globals.battleSystem.gymState) globals.battleSystem.gymState.isActive = false;
             globals.battleSystem.searchNext();
        }
        updateUI();
    };`;

const oldCasinoStr = `    window.startCasinoEncounter = (doubleShiny, locationName) => {
        state.casinoDoubleShiny = doubleShiny;
        state.currentRoute = locationName;

        // Money deduction and validation are handled by battleSystem.searchNext()
        switchView("BATTLE_ARENA");
        if (globals.battleSystem) {
             globals.battleSystem.stop();
             globals.battleSystem.activeEncounter = null;
             globals.battleSystem.isSearching = false;
             if (globals.battleSystem.gymState) globals.battleSystem.gymState.isActive = false;
             globals.battleSystem.searchNext();
        }
        updateUI();
    };`;

if (content.includes(oldCasinoStr)) {
    content = content.replace(oldCasinoStr, casinoStr);
}

const safariStr = `window.enterSafariZone = () => {
    if (window.windowManager) window.windowManager.closeDynamicWindow('window-safari-modal');
    switchView("BATTLE_ARENA");
    if (window.globals && window.globals.battleSystem) {
        window.globals.battleSystem.stop();
        window.globals.battleSystem.activeEncounter = null;
        window.globals.battleSystem.isSearching = false;
        if (window.globals.battleSystem.gymState) window.globals.battleSystem.gymState.isActive = false;
        window.globals.battleSystem.state.currentRoute = window.currentSafariZone || "Johto Safari Zone";
        window.globals.battleSystem.searchNext();

    }
};`;

const oldSafariStr = `window.enterSafariZone = () => {
    switchView("BATTLE_ARENA");
    if (window.globals && window.globals.battleSystem) {
        window.globals.battleSystem.stop();
        window.globals.battleSystem.activeEncounter = null;
        window.globals.battleSystem.isSearching = false;
        if (window.globals.battleSystem.gymState) window.globals.battleSystem.gymState.isActive = false;
        window.globals.battleSystem.state.currentRoute = window.currentSafariZone || "Johto Safari Zone";
        window.globals.battleSystem.searchNext();

    }
};`;

if (content.includes(oldSafariStr)) {
    content = content.replace(oldSafariStr, safariStr);
}

fs.writeFileSync(path, content);
console.log("Patched startCasinoEncounter and enterSafariZone in ui.js");
