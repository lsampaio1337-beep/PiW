const fs = require('fs');
let code = fs.readFileSync('src/ui.js', 'utf8');

const search = `    } else if (viewName === 'SAFARI_HUB') {
        document.getElementById('view-safari-hub').style.display = 'flex';
    } else if (viewName === 'BATTLE_ARENA') {
        document.getElementById('view-battle-arena').style.display = 'flex';
        document.getElementById('view-battle-arena').style.flexDirection = 'column';
    } else if (viewName === 'POKEMON_CENTER_MARKET') {
        document.getElementById('view-center-market').style.display = 'block';
        setupMarket(document.getElementById('view-center-market'));
    } else if (viewName === 'GYM') {
        document.getElementById('view-gym').style.display = 'block';
    } else if (viewName === 'CASINO_HUB') {
        document.getElementById('view-casino').style.display = 'block';
    } else if (viewName === 'BATTLE_STADIUM') {`;

const replace = `    } else if (viewName === 'BATTLE_ARENA') {
        document.getElementById('view-battle-arena').style.display = 'flex';
        document.getElementById('view-battle-arena').style.flexDirection = 'column';
    } else if (viewName === 'POKEMON_CENTER_MARKET') {
        document.getElementById('view-center-market').style.display = 'block';
        setupMarket(document.getElementById('view-center-market'));
    } else if (viewName === 'GYM') {
        document.getElementById('view-gym').style.display = 'block';
    } else if (viewName === 'BATTLE_STADIUM') {`;

if (code.includes(search)) {
    code = code.replace(search, replace);
    fs.writeFileSync('src/ui.js', code);
    console.log("Replaced successfully!");
} else {
    console.log("Search string not found!");
}
