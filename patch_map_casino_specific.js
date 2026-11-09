const fs = require('fs');

const path = 'src/ui/map.js';
let content = fs.readFileSync(path, 'utf8');

const strToFind = `        switchView("CASINO_HUB");

        const casinoContent = document.getElementById("casino-content");
        if(casinoContent) casinoContent.style.display = 'none';`;

const replaceWith = `        // Don't switchView, we will render it into a modal.

        // Also we don't need to manipulate casinoContent anymore as we render HTML directly`;

if (content.includes(strToFind)) {
    content = content.replace(strToFind, replaceWith);
    console.log("Patched casino individual slots view switch in map.js");
}

const findViewCasino = `        const viewCasino = document.getElementById("view-casino");
        viewCasino.style.backgroundImage = \`url('./Assets/Extra/Casino/\${bgImg}')\`;
        viewCasino.style.backgroundPosition = 'center';
        viewCasino.style.backgroundRepeat = 'no-repeat';
        viewCasino.style.backgroundSize = 'contain';

        // Clear any overlay buttons
        const oldOverlays = viewCasino.querySelectorAll('.casino-overlay-btn');
        oldOverlays.forEach(el => el.remove());

        let html = '';`;

const replaceViewCasino = `        let html = \`
            <div style="position: relative; width: 100%; min-height: 400px; background-image: url('./Assets/Extra/Casino/\${bgImg}'); background-size: contain; background-position: center; background-repeat: no-repeat; display: flex; align-items: center; justify-content: center; overflow: hidden; border-radius: 8px;">
        \`;`;

if (content.includes(findViewCasino)) {
    content = content.replace(findViewCasino, replaceViewCasino);
    console.log("Patched casino individual slots container in map.js");
}

const findHtmlAppend = `        html += \`<button class="casino-overlay-btn" onclick="window.navigateToLocation('Celadon Casino')" style="position: absolute; top: 10px; left: 10px; padding: 10px; cursor: pointer; z-index: 100;">Back to Lobby</button>\`;

        // Append to the viewCasino container
        viewCasino.insertAdjacentHTML('beforeend', html);`;

const replaceHtmlAppend = `        html += \`<button class="casino-overlay-btn" onclick="window.navigateToLocation('Celadon Casino')" style="position: absolute; top: 10px; left: 10px; padding: 10px; cursor: pointer; z-index: 100;">Back to Lobby</button>\`;
        html += \`</div>\`;

        if (window.showModal) {
            window.showModal(locationName, html, "window-casino-modal", "800px", "auto");
        }`;

if (content.includes(findHtmlAppend)) {
    content = content.replace(findHtmlAppend, replaceHtmlAppend);
    console.log("Patched casino individual slots append in map.js");
}


fs.writeFileSync(path, content);
