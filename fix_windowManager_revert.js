const fs = require('fs');
let code = fs.readFileSync('src/windowManager.js', 'utf8');

// I should remove applySavedSettings from mousedown/focusWindow and ONLY run it on spawnWindow. Wait, let's just reset windowManager.js to HEAD and re-apply correctly.
