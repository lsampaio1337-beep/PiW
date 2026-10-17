const fs = require('fs');
let code = fs.readFileSync('src/ui.js', 'utf8');

const search = `window.getBadgeFileName = function(region, number) {
    if (window.badgeMapping[region] && window.badgeMapping[region][number]) {
        return window.badgeMapping[region][number];
    }
    // Fallback if mapping not found, though ideally we won't hit this
    return \`Badge_\${region}_\${number}.png\`;
};`;

const replace = `window.getBadgeFileName = function(region, number) {
    if (region === 'Johto' && number > 8) {
        region = 'Kanto';
        number = number - 8;
    }

    if (window.badgeMapping[region] && window.badgeMapping[region][number]) {
        return window.badgeMapping[region][number];
    }
    // Fallback if mapping not found, though ideally we won't hit this
    return \`Badge_\${region}_\${number}.png\`;
};`;

code = code.replace(search, replace);
fs.writeFileSync('src/ui.js', code, 'utf8');
console.log("Replaced!");
