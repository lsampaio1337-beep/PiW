// Wait! `gift.gymIndex` is currently hardcoded in gift.js.
// We can just add a global utility `window.getGlobalBadgeInfo = function(gymIndex)`
// And modify `src/ui/gift.js` to call it.
// And `src/ui/gift.js` also has `const badgeNum` logic.
