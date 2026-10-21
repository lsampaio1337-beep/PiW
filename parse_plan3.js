// Wait, the backwards compatibility loops also need fixing!
/*
        for (let i = 0; i < state.trainer.badges - (gift.type === 'badge' ? 1 : 0); i++) {
            let gymIndex = i;
            if (state.currentRegionName === 'Johto') {
                gymIndex = (i < 8) ? i + 9 : i - 8;
            }
            // WAIT. If i < 8 (first 8 badges in Johto), gymIndex is i + 9.
            // But wait, the user said "Badge order in region 2 should be 9-10-11-12-13-14-15-16-1-2-3-4-5-6-7-8".
            // So if i < 8, gymIndex should be i + 9. (e.g. 9 to 16)
            // If i >= 8, gymIndex should be i - 8? NO!
            // If i is 8, the user said 1! But `i - 8` = 0.
            // The user thinks Kanto is 1-8. BUT config/gyms.js has Kanto as 0-7.
            // If I map `gymIndex` to regions using my new `getGlobalBadgeInfo` logic, then `gymIndex` 0 maps to Kanto 1!
            // So `i - 8` being 0 is PERFECT!
        }
*/
