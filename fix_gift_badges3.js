// Ah! In `johtoRoutes.js`, the `badgeCount` is 1 for Violet Gym, 2 for Azalea, 9 for Kanto gym Pewter.
// So `gymIndex` in the gift is `badgeCount - 1`.
// So Violet Gym -> badgeCount 1 -> gymIndex 0.
// But `gymIndex` 0 is KANTO 1 in the logic inside `src/ui/gift.js` if you don't adjust it.
// Let's trace `src/ui/gift.js`:
// gift.gymIndex = 0.
// currentRegionName = 'Johto'
// const badgeNum = state.currentRegionName === 'Johto' ? (gift.gymIndex > 8 ? gift.gymIndex - 8 : gift.gymIndex + 9) : gift.gymIndex + 1;
// Since gymIndex = 0, gift.gymIndex > 8 is FALSE.
// So it returns gift.gymIndex + 9 = 9.
// So badgeNum = 9.
// image: window.getBadgeFileName('Johto', 9)
// -> this gets transformed to 'Kanto' 1.
// So Violet Gym gets Kanto 1 badge!!
// That perfectly explains why ALL of the badges are wrong.

// The `gift.gymIndex` is NOT the config/gyms.js index!
// It's the sequential index of the badge (0 to 15).
// In Johto:
// Violet Gym: badgeCount = 1 -> gift.gymIndex = 0.
// Azalea Gym: badgeCount = 2 -> gift.gymIndex = 1.
// Pewter Gym: badgeCount = 9 -> gift.gymIndex = 8.
// Cerulean Gym: badgeCount = 10 -> gift.gymIndex = 9.
