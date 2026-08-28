const fs = require('fs');

let ui = fs.readFileSync('src/ui.js', 'utf8');

const replacement = `
            let markerImg = './Assets/Extra/Spot.png';
            if (locationId === 'pallet_town') markerImg = './Assets/Extra/Spot_Oak.png';
            else if (locationId === 'trade_hub') markerImg = './Assets/Extra/Spot_PCPM.png';
            else if (locationId === 'indigo_plateau') markerImg = './Assets/Extra/Spot_E4.png';
            else if (locationId === 'pewter_gym') markerImg = './Assets/Badges/Badge Kanto 1.png';
            else if (locationId === 'cerulean_gym') markerImg = './Assets/Badges/Badge Kanto 2.png';
            else if (locationId === 'vermilion_gym') markerImg = './Assets/Badges/Badge Kanto 3.png';
            else if (locationId === 'celadon_gym') markerImg = './Assets/Badges/Badge Kanto 4.png';
            else if (locationId === 'fuchsia_gym') markerImg = './Assets/Badges/Badge Kanto 5.png';
            else if (locationId === 'saffron_gym') markerImg = './Assets/Badges/Badge Kanto 6.png';
            else if (locationId === 'cinnabar_gym') markerImg = './Assets/Badges/Badge Kanto 7.png';
            else if (locationId === 'viridian_gym') markerImg = './Assets/Badges/Badge Kanto 8.png';

            // Increase size for special spots
            let markerWidth = "24px";
            let markerHeight = "24px";
            if (['pallet_town', 'trade_hub', 'indigo_plateau'].includes(locationId)) {
                markerWidth = "40px";
                markerHeight = "40px";
            }
`;

const searchStr = `            let markerImg = './Assets/Extra/Spot.png';
            if (locationId === 'pewter_gym') markerImg = './Assets/Badges/Badge Kanto 1.png';
            else if (locationId === 'cerulean_gym') markerImg = './Assets/Badges/Badge Kanto 2.png';
            else if (locationId === 'vermilion_gym') markerImg = './Assets/Badges/Badge Kanto 3.png';
            else if (locationId === 'celadon_gym') markerImg = './Assets/Badges/Badge Kanto 4.png';
            else if (locationId === 'fuchsia_gym') markerImg = './Assets/Badges/Badge Kanto 5.png';
            else if (locationId === 'saffron_gym') markerImg = './Assets/Badges/Badge Kanto 6.png';
            else if (locationId === 'cinnabar_gym') markerImg = './Assets/Badges/Badge Kanto 7.png';
            else if (locationId === 'viridian_gym') markerImg = './Assets/Badges/Badge Kanto 8.png';`;

ui = ui.replace(searchStr, replacement);

ui = ui.replace(`style="position: absolute; left: \${coords.x}%; top: \${coords.y}%; width: 24px; height: 24px; background-image: url('\${markerImg}');`, `style="position: absolute; left: \${coords.x}%; top: \${coords.y}%; width: \${markerWidth}; height: \${markerHeight}; background-image: url('\${markerImg}');`);

fs.writeFileSync('src/ui.js', ui);
