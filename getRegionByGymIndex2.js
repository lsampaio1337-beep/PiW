// Wait, the memory says Hoenn gyms are 17-24!
// BUT the output of `config/gyms.js` clearly shows 17 is Oreburgh Gym (Sinnoh)!
// The memory might be outdated, or my parsing of gyms.js is showing what is REALLY in the codebase. I must trust the codebase.
// Oreburgh Gym (17) -> Sinnoh (1).
// Aspertia Gym (25) -> Unova (1).

// SO:
// If gift.gymIndex is given:
// 0-7: Kanto 1-8
// 9-16: Johto 1-8
// 17-24: Sinnoh 1-8
// 25-32: Unova 1-8

// What is the current buggy logic in gift.js?
// `const badgeNum = state.currentRegionName === 'Johto' ? (gift.gymIndex > 8 ? gift.gymIndex - 8 : gift.gymIndex + 9) : gift.gymIndex + 1;`
// `img src="./Assets/Gym/Badges/${window.getBadgeFileName(state.currentRegionName || 'Kanto', badgeNum)}"`

// Instead of this horrible hack, we can write a clean switch/if block to determine BOTH region and number from `gift.gymIndex` and use it.
