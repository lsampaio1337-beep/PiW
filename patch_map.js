const fs = require('fs');

const path = 'src/ui/map.js';
let content = fs.readFileSync(path, 'utf8');

// Find the Safari part in navigateToLocation
const safariStart = content.indexOf('} else if (["Johto Safari Zone", "Kanto Safari Zone"].includes(locationName)) {');
const safariEnd = content.indexOf('} else if (locationName === "Celadon Casino" || locationName === "Goldenrod Game Corner") {', safariStart);

if (safariStart > -1 && safariEnd > -1) {
    const oldSafariBlock = content.substring(safariStart, safariEnd);

    const newSafariBlock = `} else if (["Johto Safari Zone", "Kanto Safari Zone"].includes(locationName)) {
        if (battleSystem) {
            battleSystem.stop();
        }
        window.currentSafariZone = locationName;

        const safariCost = state.config.balance.safariZonePrice || 500;
        const html = \`
            <div style="text-align: center; color: white; background: rgba(0,0,0,0.8); padding: 20px; border-radius: 10px; font-size: 20px; font-family: monospace;">
                <p>Welcome to \${locationName}! Here we charge a fee per battle you have and you can use our SafariBalls at will.<br><br>Do you wanna enter \${locationName}?</p>
                <button onclick="window.enterSafariZone()" style="margin-top: 20px; padding: 10px 20px; font-size: 18px; cursor: pointer; background: #ffcc00; border: none; border-radius: 5px; color: black; font-weight: bold;">Enter ($\${safariCost})</button>
            </div>
        \`;

        if (window.showModal) {
            window.showModal(locationName, html, "window-safari-modal", "600px", "auto");
        }
    `;

    content = content.replace(oldSafariBlock, newSafariBlock);
    fs.writeFileSync(path, content);
    console.log("Patched Safari in map.js");
} else {
    console.log("Could not find Safari block in map.js");
}
