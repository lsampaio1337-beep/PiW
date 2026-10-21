window = {
    badgeMapping: {
        "Johto": {
            "1": "Johto 1",
            "2": "Johto 2",
            // ...
        },
        "Kanto": {
            "1": "Kanto 1",
            "2": "Kanto 2",
            // ...
        }
    }
};
window.getBadgeFileName = function(region, number) {
    if (region === 'Unova') region = 'Unova2';

    if (region === 'Johto' && number > 8) {
        region = 'Kanto';
        number = number - 8;
    }

    if (window.badgeMapping[region] && window.badgeMapping[region][number]) {
        return window.badgeMapping[region][number];
    }
    // Fallback if mapping not found, though ideally we won't hit this
    return `Badge_${region}_${number}.png`;
};

const state = {
    currentRegionName: 'Johto',
    trainer: { badges: 1 }
};
// Gyms in Kanto: 0 to 7
// Gyms in Johto: 9 to 16

const gifts = [
    { type: 'badge', gymName: 'Violet Gym', gymIndex: 9 }, // Johto 1
    { type: 'badge', gymName: 'Pewter Gym', gymIndex: 0 }, // Kanto 1
];

gifts.forEach(gift => {
    // Current logic in src/ui/gift.js:
    const badgeNum = state.currentRegionName === 'Johto' ? (gift.gymIndex > 8 ? gift.gymIndex - 8 : gift.gymIndex + 9) : gift.gymIndex + 1;
    const img = window.getBadgeFileName(state.currentRegionName || 'Kanto', badgeNum);
    console.log(`For gymIndex ${gift.gymIndex} (${gift.gymName}), badgeNum is ${badgeNum}, image: ${img}`);
});
