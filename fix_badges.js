// I need to:
// 1. Add window.getGlobalBadgeInfo = function(gymIndex) { ... } inside `src/ui.js` just before `window.getBadgeFileName`.
// 2. Use this new function inside `src/ui/gift.js` instead of the horrible ternary logic.

// wait, why is Kanto 0-7, Johto 9-16? Because Indigo Plateau is 8.
// What about Hoenn? They aren't in gyms.js but if they are added later they will be 33-40.
// So let's write `window.getGlobalBadgeInfo(gymIndex)` in `src/ui.js`.
