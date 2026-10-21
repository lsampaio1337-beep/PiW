// So we know how UI badge mapping currently works.
// For backwards compatibility and correct region mapping from gymIndex:
// We should update `src/ui/gift.js` to correctly determine the region and number.

// The bug in `src/ui/gift.js`:
// `const badgeNum = state.currentRegionName === 'Johto' ? (gift.gymIndex > 8 ? gift.gymIndex - 8 : gift.gymIndex + 9) : gift.gymIndex + 1;`
// `img src="./Assets/Gym/Badges/${window.getBadgeFileName(state.currentRegionName || 'Kanto', badgeNum)}"`

// It assumes `gift.gymIndex` is the global index from `config/gyms.js`, except when current region is Johto, then it tries to offset it but it gets it horribly wrong for BOTH Kanto and Johto because `gift.gymIndex` IS the global index!
// If `gift.gymIndex` is global index:
// Pewter Gym = 0.
// Violet Gym = 9.

// To fix it, we should map global `gymIndex` to `(region, badgeNum)` directly in `src/ui/gift.js`.
function getBadgeRegionAndNumber(gymIndex) {
    if (gymIndex >= 0 && gymIndex <= 7) return { region: 'Kanto', number: gymIndex + 1 };
    if (gymIndex >= 9 && gymIndex <= 16) return { region: 'Johto', number: gymIndex - 8 };
    if (gymIndex >= 17 && gymIndex <= 24) return { region: 'Sinnoh', number: gymIndex - 16 };
    if (gymIndex >= 25 && gymIndex <= 32) return { region: 'Unova2', number: gymIndex - 24 };

    // What if Hoenn is added to gyms.js later, taking index 33-40?
    if (gymIndex >= 33 && gymIndex <= 40) return { region: 'Hoenn', number: gymIndex - 32 };

    return { region: 'Kanto', number: 1 };
}
