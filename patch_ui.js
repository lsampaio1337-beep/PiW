const fs = require('fs');
const filepath = 'src/ui.js';
let content = fs.readFileSync(filepath, 'utf8');

const target = `                if (state.config && state.config.gyms) {
                    let regionIndex = Math.floor(i / 8);
                    const regions = ['Kanto', 'Johto', 'Hoenn', 'Sinnoh', 'Unova2', 'Kalos', 'Alola', 'Galar', 'Hisui', 'Paldea'];
                    badgeRegion = regions[regionIndex] || 'Kanto';
                    badgeNum = (i % 8) + 1;
                }`;

const replacement = `                if (state.config && state.config.gyms) {
                    let gymIndex = i;
                    // For backwards compatibility and correct ordering in Johto
                    if (state.currentRegionName === 'Johto') {
                        if (i < 8) gymIndex = i + 8;
                        else if (i < 16) gymIndex = i - 8;
                    }

                    let regionIndex = Math.floor(gymIndex / 8);
                    const regions = ['Kanto', 'Johto', 'Hoenn', 'Sinnoh', 'Unova2', 'Kalos', 'Alola', 'Galar', 'Hisui', 'Paldea'];
                    badgeRegion = regions[regionIndex] || 'Kanto';
                    badgeNum = (gymIndex % 8) + 1;
                }`;

if (content.includes(target)) {
    content = content.replace(target, replacement);
    fs.writeFileSync(filepath, content, 'utf8');
    console.log("Successfully added Johto offset to the badge generation logic.");
} else {
    console.log("Target block not found in src/ui.js.");
}
