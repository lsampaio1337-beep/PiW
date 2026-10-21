// Ah! In Johto, `badgeCount` is 1 to 16.
// `completeChallenge` in `ui.js` does:
// `gymIndex: req.earnBadge.badgeCount - 1`
// So Johto badges 1 to 8 will have `gymIndex` 0 to 7!
// Wait. 0 to 7 is EXACTLY the Kanto badges in `config/gyms.js`.
// And Johto's Kanto badges (9-16) will have `gymIndex` 8 to 15!
// BUT `gymIndex` 8 is Indigo Plateau in `config/gyms.js`!!

// Look at how `battleSystem.js` populates `pendingGifts`:
// `const gymIndex = this.state.config.gyms.findIndex(g => g.name === gym.name);`
// `this.state.stats.pendingGifts.push({ type: 'badge', gymName: gym.name, gymIndex: gymIndex });`
// In this case, Violet Gym gets `gymIndex` 9!
// Wait... if `completeChallenge` pushes `gymIndex` 0, and `battleSystem` pushes `gymIndex` 9...
// THEY PUSH DIFFERENT THINGS DEPENDING ON WHERE THE GIFT CAME FROM!!
// Wait, `completeChallenge` in `ui.js` pushes the gift for the BADGE ITSELF??
// Let's read `ui.js` completeChallenge earnBadge logic.
