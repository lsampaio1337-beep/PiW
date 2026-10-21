// My plan is clear now:
// 1. In `src/ui.js`, export a new helper function `getGlobalBadgeInfo` (or attach it to `window.getGlobalBadgeInfo` if we want to be safe since it's global).
// Actually, I can just define it directly inside `src/ui.js` and assign it to `window.getGlobalBadgeInfo`.
// 2. In `src/ui/gift.js`, use `window.getGlobalBadgeInfo` instead of the ternary string formatting.
// 3. That's it!
