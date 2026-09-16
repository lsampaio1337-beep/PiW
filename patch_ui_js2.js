const fs = require('fs');
let uiJs = fs.readFileSync('src/ui.js', 'utf8');

uiJs = uiJs.replace(/window\.windowManager\.toggleWindow\('modal-content-box', true\);/g, '');

// showModal needs to properly accept ID in topbar buttons
// actually, showModal is called inside showPokedex, showCalendar, etc.
// let's just make sure those specific functions pass a unique window id.

fs.writeFileSync('src/ui.js', uiJs);
