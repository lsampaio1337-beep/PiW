const fs = require('fs');

function replaceFile(path, replacer) {
    let content = fs.readFileSync(path, 'utf8');
    content = replacer(content);
    fs.writeFileSync(path, content);
}

replaceFile('src/ui/bonusCandy.js', c => c.replace('showModal("Bonus Candy", html);', 'showModal("Bonus Candy", html, "window-bonus-candy");'));
replaceFile('src/ui/pokemonStats.js', c => c.replace('showModal(`${p.name} (Lv. ${p.level})`, html);', 'showModal(`${p.name} (Lv. ${p.level})`, html, "window-pokemon-stats");'));
replaceFile('src/ui/market.js', c => c.replace("showModal('', html);", "showModal('Market', html, 'window-market');").replace("window.showModal('Sell Items', html);", "window.showModal('Sell Items', html, 'window-market-sell');"));
replaceFile('src/ui/gift.js', c => c.replace('showModal("Gifts", html);', 'showModal("Gifts", html, "window-gifts");'));
replaceFile('src/ui/calendar.js', c => c.replace('showModal("Daily Rewards", html);', 'showModal("Daily Rewards", html, "window-calendar");'));
replaceFile('src/ui/pokedex.js', c => c.replace(/showModal\("Pokedex", html\);/g, 'showModal("Pokedex", html, "window-pokedex");'));
replaceFile('src/ui/settings.js', c => c.replace('showModal("Settings", settingsHTML);', 'showModal("Settings", settingsHTML, "window-settings");').replace('showModal("Force Next Encounter", html);', 'showModal("Force Next Encounter", html, "window-force-encounter");'));
