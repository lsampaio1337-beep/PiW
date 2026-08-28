const fs = require('fs');

let ui = fs.readFileSync('src/ui.js', 'utf8');

// Replace document.getElementById('right-col') with document.getElementById('modal-overlay')
ui = ui.replace(/document\.getElementById\('right-col'\)/g, "document.getElementById('modal-overlay')");

fs.writeFileSync('src/ui.js', ui);
