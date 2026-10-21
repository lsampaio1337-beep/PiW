// WAIT!! What if currentRegionName is NOT 'Johto'?
const state2 = { currentRegionName: 'Hoenn' };

function getGiftBadgeDisplay2(gift) {
    let badgeNum = state2.currentRegionName === 'Johto' ? (gift.gymIndex > 8 ? gift.gymIndex - 8 : gift.gymIndex + 9) : gift.gymIndex + 1;
    let region = state2.currentRegionName || 'Kanto';

    if (region === 'Unova') region = 'Unova2';
    if (region === 'Johto' && badgeNum > 8) {
        region = 'Kanto';
        badgeNum = badgeNum - 8;
    }

    return `${region} ${badgeNum}`;
}

console.log("IN HOENN:");
console.log("If gymIndex = 9 (Violet Gym):", getGiftBadgeDisplay2({ gymIndex: 9 }));
console.log("If gymIndex = 0 (Pewter Gym):", getGiftBadgeDisplay2({ gymIndex: 0 }));
console.log("If gymIndex = 17 (Oreburgh Gym in Sinnoh):", getGiftBadgeDisplay2({ gymIndex: 17 }));
