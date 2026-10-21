const state = { currentRegionName: 'Johto' };
const gifts = [
    { type: 'badge', gymName: 'Violet Gym', gymIndex: 9 }, // Johto 1
    { type: 'badge', gymName: 'Pewter Gym', gymIndex: 0 }, // Kanto 1
    { type: 'badge', gymName: 'Oreburgh Gym', gymIndex: 17 } // Sinnoh 1
];

function getBadgeInfo(gymIndex) {
    let region = state.currentRegionName || 'Kanto';
    let badgeNum = gymIndex + 1;

    if (gymIndex >= 0 && gymIndex <= 7) {
        region = 'Kanto';
        badgeNum = gymIndex + 1;
    } else if (gymIndex >= 9 && gymIndex <= 16) {
        region = 'Johto';
        badgeNum = gymIndex - 8;
    } else if (gymIndex >= 17 && gymIndex <= 24) {
        region = 'Sinnoh';
        badgeNum = gymIndex - 16;
    } else if (gymIndex >= 25 && gymIndex <= 32) {
        region = 'Unova';
        badgeNum = gymIndex - 24;
    }

    return { region, badgeNum };
}

gifts.forEach(gift => {
    let { region, badgeNum } = getBadgeInfo(gift.gymIndex);
    console.log(`For gymIndex ${gift.gymIndex} (${gift.gymName}), region is ${region}, badgeNum is ${badgeNum}`);
});
