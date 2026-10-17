const assert = require('assert');

// Mock state and global variables for testing
global.window = {
    badgeMapping: {
        'Kanto': {
            1: 'Badge_Kanto_1_Boulder_Rock.png',
            8: 'Badge_Kanto_8_Earth_Ground.png'
        },
        'Johto': {
            1: 'Badge_Johto_1_Zephyr_Flying.png',
            8: 'Badge_Johto_8_Rising_Dragon.png'
        }
    }
};

window.getBadgeFileName = function(region, number) {
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

assert.strictEqual(window.getBadgeFileName('Kanto', 1), 'Badge_Kanto_1_Boulder_Rock.png');
assert.strictEqual(window.getBadgeFileName('Johto', 1), 'Badge_Johto_1_Zephyr_Flying.png');
assert.strictEqual(window.getBadgeFileName('Johto', 8), 'Badge_Johto_8_Rising_Dragon.png');
assert.strictEqual(window.getBadgeFileName('Johto', 9), 'Badge_Kanto_1_Boulder_Rock.png');
assert.strictEqual(window.getBadgeFileName('Johto', 16), 'Badge_Kanto_8_Earth_Ground.png');
assert.strictEqual(window.getBadgeFileName('Kanto', 9), 'Badge_Kanto_9.png');

console.log('All tests passed!');
