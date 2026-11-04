const fs = require('fs');

let uiJs = fs.readFileSync('src/ui.js', 'utf8');

uiJs = uiJs.replace(
    'class="medal-item"',
    'class="medal-item" onclick="window.showMedalDetails(\'${region}\')"'
);

// We need to inject the `showMedalDetails` function
const showMedalDetailsFn = `
window.showMedalDetails = function(region) {
    if (!state.config || !state.config.pokemonData) return;

    let regionalStats;
    if (region === 'Kanto' && state.currentRegionName === 'Kanto') {
        regionalStats = state.stats;
    } else if (region === 'Kanto' && state.regions && state.regions['Kanto']) {
        regionalStats = state.regions['Kanto'].stats;
    } else {
        regionalStats = state.regions && state.regions[region] ? state.regions[region].stats : null;
    }

    if (!regionalStats && state.currentRegionName === region) {
        regionalStats = state.stats;
    }

    if (!regionalStats) return;

    let caughtCount = 0;
    let shinyCount = 0;
    let totalInRegion = 0;

    const regionKey = region.toLowerCase() + '_id';

    state.config.pokemonData.forEach(p => {
        if (p[regionKey]) {
            totalInRegion++;
            if (regionalStats.caughtSpecies && regionalStats.caughtSpecies[p.name]) {
                caughtCount++;
            }
            if (regionalStats.caughtShiniesSpecies && regionalStats.caughtShiniesSpecies[p.name]) {
                shinyCount++;
            }
        }
    });

    const hasFirst = checkFinalChallengeCompleted(region);
    const hasSecond = totalInRegion > 0 && caughtCount >= totalInRegion;
    const hasThird = totalInRegion > 0 && shinyCount >= totalInRegion;

    const medalsEarned = regionalStats.medalsEarned || {};

    const formatPlaytime = (totalSec) => {
        if (!totalSec || totalSec <= 0) return '0s';
        const d = Math.floor(totalSec / 86400);
        const h = Math.floor((totalSec % 86400) / 3600);
        const m = Math.floor((totalSec % 3600) / 60);
        const s = totalSec % 60;
        let str = '';
        if (d > 0) str += \`\${d}d \`;
        if (h > 0) str += \`\${h}h \`;
        if (m > 0) str += \`\${m}m \`;
        str += \`\${s}s\`;
        return str;
    };

    const formatDate = (dateObj) => {
        if (dateObj === 'Unknown' || !dateObj) return 'Unknown';
        const d = new Date(dateObj);
        const dd = String(d.getDate()).padStart(2, '0');
        const mm = String(d.getMonth() + 1).padStart(2, '0');
        const yy = String(d.getFullYear()).slice(-2);
        return \`\${dd}/\${mm}/\${yy}\`;
    };

    const buildMedalCard = (tier, title, description, hasMedal, earnData) => {
        const dateStr = hasMedal && earnData ? formatDate(earnData.date) : 'Locked';
        const timeStr = hasMedal && earnData ? formatPlaytime(earnData.playtime) : 'Locked';

        return \`
            <div style="background: rgba(0, 0, 0, 0.4); border-radius: 10px; padding: 15px; border: 1px solid rgba(255, 255, 255, 0.1); display: flex; flex-direction: column; align-items: center; gap: 10px;">
                <div style="font-size: 16px; font-weight: bold; color: white; text-align: center;">\${title}</div>
                <div style="text-align: center; \${!hasMedal ? 'filter: grayscale(100%) opacity(0.5);' : 'filter: drop-shadow(0 0 10px rgba(255, 215, 0, 0.8));'}">
                    <img src="Assets/Extra/Medals/\${region} \${tier}.png" alt="\${region} \${tier}" style="width: 128px; height: 128px; object-fit: contain; image-rendering: pixelated;" onerror="this.src='Assets/Extra/Medals/Kanto \${tier}.png'">
                </div>
                <div style="font-size: 12px; color: #cbd5e1; text-align: center; max-width: 200px;">\${description}</div>
                <div style="width: 100%; border-top: 1px solid rgba(255,255,255,0.1); margin: 5px 0;"></div>
                <div style="font-size: 12px; color: #94a3b8; text-align: center; display: flex; flex-direction: column; gap: 3px;">
                    <div><strong>Earned on:</strong> <span style="color: \${hasMedal ? '#f1c40f' : '#cbd5e1'}">\${dateStr}</span></div>
                    <div><strong>Time on Region:</strong> <span style="color: \${hasMedal ? '#f1c40f' : '#cbd5e1'}">\${timeStr}</span></div>
                </div>
            </div>
        \`;
    };

    let html = \`<div style="display: flex; gap: 20px; justify-content: space-around; padding: 20px; box-sizing: border-box;">\`;

    html += buildMedalCard('First', 'League Champion', \`Won \${region} Pokemon League\`, hasFirst, medalsEarned['First']);
    html += buildMedalCard('Second', 'Master Catcher', \`Catch all \${totalInRegion} Pokémons\`, hasSecond, medalsEarned['Second']);
    html += buildMedalCard('Third', 'Shiny Hunter', \`Catch all \${totalInRegion} Shinies Pokémons\`, hasThird, medalsEarned['Third']);

    html += \`</div>\`;

    showModal(\`\${region} Medals\`, html, \`window-medal-details-\${region}\`, "900px");
};
`;

uiJs = uiJs.replace(
    "window.showTrainerStats = function(tab = 'statistics', options = {}) {",
    showMedalDetailsFn + "\nwindow.showTrainerStats = function(tab = 'statistics', options = {}) {"
);

fs.writeFileSync('src/ui.js', uiJs);
