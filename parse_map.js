// If we look at how the region mappings are done:
// Kanto gyms map to gymIndex 0-7.
// Johto gyms map to gymIndex 9-16.
// Sinnoh gyms map to gymIndex 17-24.
// Unova gyms map to gymIndex 25-32.

// I will create `window.getGlobalBadgeInfo = function(gymIndex)` in `src/ui.js` that maps gymIndex to { region, badgeNum }.
// Then I will call it in `src/ui/gift.js`.

// Wait, the plan should outline these changes. I'll write the plan.
