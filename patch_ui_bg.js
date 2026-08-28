const fs = require('fs');

let ui = fs.readFileSync('src/ui.js', 'utf8');

// Fix messed up sed replace
ui = ui.replace(/\/\/ vCenter\.style\.backgroundImage = "url\('\.\/Assets\/BG\/BG-PC\\vCenter\.style\.backgroundImage = "url\('\.\/Assets\/BG\/BG-PC&M\.png'\)";M\.png'\)"; \/\/ missing asset/, '// vCenter.style.backgroundImage = "url(\'./Assets/BG/BG-PC&M.png\')"; // missing asset');

fs.writeFileSync('src/ui.js', ui);
