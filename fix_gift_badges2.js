// If gymIndex is 9 (Violet Gym), and state.currentRegionName is 'Johto':
// const badgeNum = state.currentRegionName === 'Johto' ? (gift.gymIndex > 8 ? gift.gymIndex - 8 : gift.gymIndex + 9) : gift.gymIndex + 1;
// 9 > 8 is true, so badgeNum = 9 - 8 = 1.
// image = window.getBadgeFileName('Johto', 1).
// 'Johto' 1 is 'Zephyr Badge'.

// Let's test the UI.js map for Violet Gym:
// } else if (locationId === 'violet_gym') {
//     markerImg = `./Assets/Gym/Badges/${window.getBadgeFileName('Johto', 1)}`;
// }

// Wait! If Violet Gym is returning Johto 1 in both map and gifts, why is it WRONG in gifts?
// Ah! Let's look at `gymIndex` in the gift payload!
// How is `gymIndex` pushed?
// From `src/ui.js` inside `completeChallenge`:
//                 state.stats.pendingGifts.push({ type: 'badge', gymName: req.earnBadge.name.replace(' Badge', ''), gymIndex: req.earnBadge.badgeCount - 1 });
