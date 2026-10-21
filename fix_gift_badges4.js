// Wait, `battleSystem.js` also pushes badges!
// Let's look at `battleSystem.js`:
// const gymIndex = this.state.config.gyms.findIndex(g => g.name === gym.name);
// if (gymIndex !== -1 && this.state.trainer.badges === (this.state.currentRegionName === 'Johto' ? (gymIndex > 8 ? gymIndex - 9 : gymIndex + 8) : gymIndex)) {
//     this.state.stats.pendingGifts.push({ type: 'badge', gymName: gym.name, gymIndex: gymIndex });
// }
// Oh boy! `battleSystem.js` pushes the `config/gyms.js` index!
// Which for Violet Gym is 9!
// So if `battleSystem.js` pushes gymIndex = 9, `ui.js` parses it.
// If it's pushed from `ui.js` (completeChallenge), it pushes `badgeCount - 1` = 0.
// WHICH ONE IS IT?

// Wait, the gift claim in `gift.js`:
// for (let i = 0; i < state.trainer.badges - (gift.type === 'badge' ? 1 : 0); i++) {
//      let gymIndex = i;
//      if (state.currentRegionName === 'Johto') {
//           gymIndex = (i < 8) ? i + 9 : i - 8;
//      }
//      state.stats.claimedGifts.push({ type: 'badge', gymIndex: gymIndex });
// }
// This code converts sequential badge index `i` (0 to 15) to `gymIndex`!
// i = 0 (Violet Gym) -> gymIndex = 9!
// i = 8 (Pewter Gym) -> gymIndex = 8 - 8 = 0!

// So the "true" `gymIndex` in gifts is meant to be the `config/gyms.js` index!
// This means Violet Gym = 9. Pewter Gym = 0.

// Let's see what `gift.js` currently does when displaying it:
// const badgeNum = state.currentRegionName === 'Johto' ? (gift.gymIndex > 8 ? gift.gymIndex - 8 : gift.gymIndex + 9) : gift.gymIndex + 1;
// If gymIndex = 9 (Violet gym)
// gift.gymIndex > 8 is TRUE. badgeNum = 9 - 8 = 1.
// image = getBadgeFileName('Johto', 1). This is CORRECT!

// If gymIndex = 0 (Pewter gym)
// gift.gymIndex > 8 is FALSE. badgeNum = 0 + 9 = 9.
// image = getBadgeFileName('Johto', 9) -> converted to 'Kanto' 1. This is CORRECT!
