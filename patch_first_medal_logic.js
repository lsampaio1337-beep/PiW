const fs = require('fs');

let uiJs = fs.readFileSync('src/ui.js', 'utf8');

// The original logic had `const hasFirst = caughtCount > 0;`. We need to be careful with the original implementation for loading old profiles.
// If an older save had no date, we assign it `Unknown`.
// To do this properly, in the `window.checkAndAwardMedals` function:

uiJs = uiJs.replace(
    "if (hasFirst && !regionalStats.medalsEarned['First']) {\n            regionalStats.medalsEarned['First'] = { date: Date.now(), playtime: regionalStats.playtime || 0 };\n        }",
    "if (hasFirst && !regionalStats.medalsEarned['First']) {\n            regionalStats.medalsEarned['First'] = { date: (regionalStats.playtime > 0 && caughtCount > 10) ? 'Unknown' : Date.now(), playtime: regionalStats.playtime || 0 };\n        }"
);
uiJs = uiJs.replace(
    "if (hasSecond && !regionalStats.medalsEarned['Second']) {\n            regionalStats.medalsEarned['Second'] = { date: Date.now(), playtime: regionalStats.playtime || 0 };\n        }",
    "if (hasSecond && !regionalStats.medalsEarned['Second']) {\n            regionalStats.medalsEarned['Second'] = { date: (regionalStats.playtime > 0) ? 'Unknown' : Date.now(), playtime: regionalStats.playtime || 0 };\n        }"
);
uiJs = uiJs.replace(
    "if (hasThird && !regionalStats.medalsEarned['Third']) {\n            regionalStats.medalsEarned['Third'] = { date: Date.now(), playtime: regionalStats.playtime || 0 };\n        }",
    "if (hasThird && !regionalStats.medalsEarned['Third']) {\n            regionalStats.medalsEarned['Third'] = { date: (regionalStats.playtime > 0) ? 'Unknown' : Date.now(), playtime: regionalStats.playtime || 0 };\n        }"
);

fs.writeFileSync('src/ui.js', uiJs);
