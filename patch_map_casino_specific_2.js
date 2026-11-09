const fs = require('fs');

const path = 'src/ui/map.js';
let content = fs.readFileSync(path, 'utf8');

const findViewCasino2 = `        const viewCasino = document.getElementById("view-casino");
        viewCasino.style.backgroundImage = \`url('./Assets/Extra/Casino/\${bgImg}')\`;
        viewCasino.style.backgroundPosition = 'center';
        viewCasino.style.backgroundRepeat = 'no-repeat';
        viewCasino.style.backgroundSize = 'contain';

        // Remove old buttons if any
        const oldOverlays = viewCasino.querySelectorAll('.casino-overlay-btn');
        oldOverlays.forEach(el => el.remove());

        // We use relative positioning for click areas
        let html = '';`;

const replaceViewCasino2 = `        let html = \`
            <div style="position: relative; width: 100%; min-height: 400px; background-image: url('./Assets/Extra/Casino/\${bgImg}'); background-size: contain; background-position: center; background-repeat: no-repeat; display: flex; align-items: center; justify-content: center; overflow: hidden; border-radius: 8px;">
        \`;`;

if (content.includes(findViewCasino2)) {
    content = content.replace(findViewCasino2, replaceViewCasino2);
    console.log("Patched casino individual slots container in map.js (second attempt)");
}
fs.writeFileSync(path, content);
