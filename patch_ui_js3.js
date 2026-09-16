const fs = require('fs');
let uiJs = fs.readFileSync('src/ui.js', 'utf8');

uiJs = uiJs.replace(/showModal\("Progress Challenges", html\);/g, 'showModal("Progress Challenges", html, "window-challenges");');
uiJs = uiJs.replace(/showModal\("Tasks & Rewards", html\);/g, 'showModal("Tasks & Rewards", html, "window-tasks");');
uiJs = uiJs.replace(/showModal\("ZzZ Mode", resultsHtml\);/g, 'showModal("ZzZ Mode", resultsHtml, "window-zzz-rewards");');
uiJs = uiJs.replace(/showModal\("Trainer", `/g, 'showModal("Trainer", `'); // Will fix trainer manually with dynamic id

uiJs = uiJs.replace(/showModal\("Trainer", `([\s\S]*?)`\);/g, 'showModal("Trainer", `$1`, "window-trainer");');

fs.writeFileSync('src/ui.js', uiJs);
