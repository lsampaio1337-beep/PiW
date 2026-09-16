const fs = require('fs');
let code = fs.readFileSync('src/windowManager.js', 'utf8');

// Ah, "Main Control" is `top-bar-window` (the nav bar), not `main-view-window`.
// Let's spawn new windows below `top-bar-window`.

code = code.replace(/const mainView = document\.getElementById\('main-view-window'\);/, "const mainView = document.getElementById('top-bar-window');");

fs.writeFileSync('src/windowManager.js', code);
