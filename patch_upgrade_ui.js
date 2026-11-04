const fs = require('fs');

let uiJs = fs.readFileSync('src/ui.js', 'utf8');

uiJs = uiJs.replace(
    'class="upgrade-item"',
    'class="upgrade-item" onclick="window.showUpgradeDetails(\'${type.key}\', \'${type.configKey}\')" style="cursor: pointer; '
);
// note: style="cursor: pointer; " is because original string is `style="background:`

const showUpgradeDetailsFn = `
window.showUpgradeDetails = function(typeKey, configKey) {
    if (!state.config || !state.config.balance || !state.config.balance.expansions) return;
    const items = state.config.balance.expansions[configKey] || [];
    const ownedTier = state.stats.upgrades[typeKey] || 0;

    let html = \`<div style="display: grid; grid-template-columns: repeat(auto-fill, minmax(200px, 1fr)); gap: 15px; padding: 2%; box-sizing: border-box;">\`;

    for (let i = 0; i < ownedTier; i++) {
        const configItem = items[i];
        if (!configItem) continue;

        const displayName = configItem.displayName || configItem.name;
        let description = configItem.description || '';
        const tier = i + 1;

        if (configKey === 'ballPocket') {
            const tiers = [1000, 2000, 3000, 4000, 5000];
            description = \`Ball Stock Capacity: \${tiers[i] || 5000}\`;
        } else if (configKey === 'potionSatchel') {
            const tiers = [1000, 2000, 3000, 4000, 5000];
            description = \`Potion Stock Capacity: \${tiers[i] || 5000}\`;
        } else if (configKey === 'pokemonBox') {
            const tiers = [5000, 10000, 15000, 20000, 25000];
            description = \`Pokemon Capacity in Backpack: \${tiers[i] || 25000}\`;
        } else if (configKey === 'speed') {
            if (tier === 1) description = "Encounter time decreased in 10%";
            else if (tier === 2) description = "Encounter time decreased in 20%";
            else if (tier === 3) description = "Encounter time decreased in 30%";
            else if (tier === 4) description = "Encounter time decreased in 40%";
            else if (tier >= 5) description = "Encounter time decreased in 50%";
        } else if (configKey === 'glass') {
            if (tier === 1) description = "Show Healthbar at Main View";
            else if (tier === 2) description = "Show Healthbar and Damage at Main View";
            else if (tier === 3) description = "Show Healthbar, Damage and Level at Main View";
            else if (tier === 4) description = "Show Healthbar, Damage, Level and Quality at Main View";
            else if (tier >= 5) description = "Show Healthbar, Damage, Level, Quality and SumIV at Main View";
        } else if (configKey === 'loot') {
            if (tier === 1) description = "Can loot Potion";
            else if (tier === 2) description = "Can loot Potion and Ball";
            else if (tier === 3) description = "Can loot Potion, Ball and Stone";
            else if (tier === 4) description = "Can loot Potion, Ball, Stone and Vitamin";
        } else if (configKey === 'smartwatch') {
            if (tier === 1) description = "Can Select Ball at Main View";
            else if (tier === 2) description = "Can Select Ball and potion at Main View";
            else if (tier >= 3) description = "Can Select Ball and potion at Main View and use smart mode for capture";
        }

        html += \`
            <div style="background: #2c3e50; border: 2px solid #3498db; border-radius: 10px; padding: 15px; text-align: center; display: flex; flex-direction: column; align-items: center; justify-content: flex-start; gap: 10px;">
                <div style="font-size: 14px; font-weight: bold; color: white;">\${displayName}</div>
                <img src="./Assets/Items/Upgrades/\${configItem.name}.png" style="width: 50px; height: 50px; object-fit: contain;" alt="\${displayName}">
                <div style="font-size: 12px; color: #cbd5e1; line-height: 1.3;">\${description}</div>
            </div>
        \`;
    }

    html += \`</div>\`;

    // Capitalize first letter of configKey for title
    let titleStr = configKey.charAt(0).toUpperCase() + configKey.slice(1);
    // Add spaces before uppercase letters
    titleStr = titleStr.replace(/([A-Z])/g, ' $1').trim();

    showModal(\`\${titleStr} Upgrades\`, html, \`window-upgrade-details-\${configKey}\`, "800px");
};
`;

uiJs = uiJs.replace(
    "window.showTrainerStats = function(tab = 'statistics', options = {}) {",
    showUpgradeDetailsFn + "\nwindow.showTrainerStats = function(tab = 'statistics', options = {}) {"
);

fs.writeFileSync('src/ui.js', uiJs);
