const fs = require('fs');

let content = fs.readFileSync('src/ui/map.js', 'utf8');

// Remove the leader sprite from the Map Inner Modal update in map.js as well
const searchSpriteStr = `            const gymLeaderImg = document.createElement('img');
            gymLeaderImg.src = spritePath;
            gymLeaderImg.style.position = 'absolute';
            gymLeaderImg.style.left = \`\${assetConfig.position.rel_x * 100}%\`;
            gymLeaderImg.style.top = \`\${assetConfig.position.rel_y * 100}%\`;
            gymLeaderImg.style.width = \`\${(assetConfig.size.px_width / 1800) * 100}%\`;
            gymLeaderImg.style.transform = \`rotate(\${assetConfig.tilt.angle_deg}deg)\`;
            gymLeaderImg.style.transformOrigin = assetConfig.tilt.origin;
            gymLeaderImg.style.pointerEvents = 'none';

            dynamicGymBgUi.appendChild(gymLeaderImg);`;

const replaceSpriteStr = `            // Leader sprite intentionally removed here based on user requirement`;

content = content.replace(searchSpriteStr, replaceSpriteStr);

fs.writeFileSync('src/ui/map.js', content, 'utf8');
