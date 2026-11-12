const fs = require('fs');
let code = fs.readFileSync('src/ui.js', 'utf8');

const search = `        if (results.fainted) {
            state.currentRoute = "PokeCenter & PokeMarket";
            window.navigateToLocation("PokeCenter & PokeMarket");
        } else if (results.outOfMoney) {
            if (["Johto Safari Zone", "Kanto Safari Zone"].includes(state.currentRoute)) {
                switchView("SAFARI_HUB");
            } else if (state.currentRoute && state.currentRoute.startsWith("Celadon Casino ")) {
                state.currentRoute = "Celadon Casino";
                window.navigateToLocation("Celadon Casino");
            } else {
                returnToLab();
            }
        } else {
            returnToLab();
        }`;

const replace = `        if (results.fainted) {
            state.currentRoute = "PokeCenter & PokeMarket";
            window.navigateToLocation("PokeCenter & PokeMarket");
        } else if (results.outOfMoney) {
            if (["Johto Safari Zone", "Kanto Safari Zone"].includes(state.currentRoute)) {
                window.navigateToLocation(state.currentRoute);
            } else if (state.currentRoute && state.currentRoute.startsWith("Celadon Casino ")) {
                state.currentRoute = "Celadon Casino";
                window.navigateToLocation("Celadon Casino");
            } else {
                returnToLab();
            }
        } else {
            returnToLab();
        }`;

if (code.includes(search)) {
    code = code.replace(search, replace);
    fs.writeFileSync('src/ui.js', code);
    console.log("Replaced successfully (ZzZ Mode Safari)!");
} else {
    console.log("Search string not found (ZzZ Mode Safari)!");
}
