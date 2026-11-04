const fs = require('fs');

let uiJs = fs.readFileSync('src/ui.js', 'utf8');

uiJs = uiJs.replace(
    "                if (activeTier) {",
    "                if (activeTier) {\n                    if (!regionalStats.medalsEarned) regionalStats.medalsEarned = {};\n                    if (!regionalStats.medalsEarned[activeTier]) {\n                        regionalStats.medalsEarned[activeTier] = {\n                            date: Date.now(),\n                            playtime: regionalStats.playtime || state.globalStats.playtime || 0\n                        };\n                    }\n"
);

// We need to do this for hasFirst, hasSecond, hasThird.
// The code inside `window.showTrainerStats` currently dynamically calculates them.
// By injecting this block, we can retroactively mark existing medals as earned (their date will be "Unknown" if we structure it to check if it already existed).
// Wait, if it didn't exist before, Date.now() is exactly right NOW.
// A better approach is: if we dynamically evaluate and save them here, old medals will be timestamped with "now".
// To fix this, we can set date to 0 or "Unknown" if they are already earned before this tracking is deployed.
// We can use a trick: If `caughtCount > 0` but `medalsEarned.First` doesn't exist, we can create it. But wait, `showTrainerStats` is only called when the user OPENS the stats window. This means the medal won't be "recorded" until they open the window.
// We should put the evaluation function somewhere it's called often, like updateMainControl or gameClockTick, OR we just build an explicit check function.
