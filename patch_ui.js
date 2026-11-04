const fs = require('fs');
const filepath = 'src/ui.js';
let content = fs.readFileSync(filepath, 'utf8');

const target = `                if (state.config && state.config.gyms) {
                    let currentRegionGyms = 0;
                    for (let j = 0; j <= i; j++) {
                        if (state.config.gyms[j] && state.config.gyms[j].name.includes("Gym")) {
                            currentRegionGyms++;
                        }
                    }

                    let regionIndex = Math.floor((currentRegionGyms - 1) / 8);
                    const regions = ['Kanto', 'Johto', 'Hoenn', 'Sinnoh', 'Unova2', 'Kalos', 'Alola', 'Galar', 'Hisui', 'Paldea'];
                    badgeRegion = regions[regionIndex] || 'Kanto';
                    badgeNum = ((currentRegionGyms - 1) % 8) + 1;
                }`;

const replacement = `                if (state.config && state.config.gyms) {
                    let regionIndex = Math.floor(i / 8);
                    const regions = ['Kanto', 'Johto', 'Hoenn', 'Sinnoh', 'Unova2', 'Kalos', 'Alola', 'Galar', 'Hisui', 'Paldea'];
                    badgeRegion = regions[regionIndex] || 'Kanto';
                    badgeNum = (i % 8) + 1;
                }`;

if (content.includes(target)) {
    content = content.replace(target, replacement);
    fs.writeFileSync(filepath, content, 'utf8');
    console.log("Successfully replaced the badge generation logic.");
} else {
    console.log("Target block not found in src/ui.js.");
}
