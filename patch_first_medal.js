const fs = require('fs');

let uiJs = fs.readFileSync('src/ui.js', 'utf8');

// The first medal is earned when the region is fully cleared (Final Challenge completed), not just by catching 1 Pokemon.
uiJs = uiJs.replace(
    "const hasFirst = caughtCount > 0;",
    "const hasFirst = checkFinalChallengeCompleted(region);"
);

fs.writeFileSync('src/ui.js', uiJs);
