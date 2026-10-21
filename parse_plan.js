// My plan is:
// 1. Add window.getGlobalBadgeInfo = function(gymIndex) { ... } inside `src/ui.js` just before `window.getBadgeFileName`.
// 2. Modify `src/ui/gift.js` to use `window.getGlobalBadgeInfo` to find the correct `region` and `number` for a `gymIndex`. Then call `window.getBadgeFileName(region, number)` to fetch the image, which perfectly matches `map.js` functionality!
// 3. Complete pre commit step.
// 4. Submit.
