const fs = require('fs');

let uiJs = fs.readFileSync('src/ui.js', 'utf8');

uiJs = uiJs.replace(
    /const hasFirst = caughtCount > 0;/g,
    "const hasFirst = checkFinalChallengeCompleted(region);"
);

fs.writeFileSync('src/ui.js', uiJs);
