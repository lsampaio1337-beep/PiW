import re

with open('src/ui.js', 'r') as f:
    content = f.read()

old_upgrades = """        } else if (tab === 'upgrades') {
            contentHtml = '<div style="display: grid; grid-template-columns: repeat(auto-fill, minmax(80px, 1fr)); gap: 10px; padding: 10px;">';

            if (state.stats.upgrades) {
                const upgradeTypes = [
                    { key: 'ballsTier', configKey: 'ballPocket' },
                    { key: 'potionsTier', configKey: 'potionSatchel' },
                    { key: 'boxTier', configKey: 'pokemonBox' },
                    { key: 'glassTier', configKey: 'glass' },
                    { key: 'smartwatchTier', configKey: 'smartwatch' },
                    { key: 'speedTier', configKey: 'speed' },
                    { key: 'lootTier', configKey: 'loot' }
                ];

                upgradeTypes.forEach(type => {
                    const tier = state.stats.upgrades[type.key] || 0;
                    if (tier > 0) {
                        // Show the currently purchased tier (index tier - 1)
                        const configItem = state.config.balance.expansions[type.configKey][tier - 1];
                        if (configItem) {
                            const displayName = configItem.displayName || configItem.name;
                            contentHtml += `
                                <div style="background: #2c3e50; border: 2px solid #3498db; border-radius: 10px; padding: 10px; text-align: center; display: flex; flex-direction: column; align-items: center; justify-content: center;">
                                    <img src="./Assets/Items/Upgrades/${configItem.name}.png" style="width: 50px; height: 50px; object-fit: contain; margin-bottom: 5px;" alt="${displayName}">
                                    <div style="font-size: 12px; font-weight: bold; color: white; line-height: 1.1; word-wrap: break-word;">${displayName}</div>
                                </div>
                            `;
                        }
                    }
                });
            }

            contentHtml += '</div>';

            if (contentHtml === '<div style="display: grid; grid-template-columns: repeat(auto-fill, minmax(80px, 1fr)); gap: 10px; padding: 10px;"></div>') {
                contentHtml = '<div style="text-align: center; padding: 20px; font-style: italic; color: #ccc;">No upgrades purchased yet.</div>';
            }
        }"""

new_upgrades = """        } else if (tab === 'upgrades') {
            contentHtml = '<div style="display: grid; grid-template-columns: repeat(auto-fill, minmax(200px, 1fr)); gap: 15px; padding: 15px;">';

            if (state.stats.upgrades) {
                const upgradeTypes = [
                    { key: 'ballsTier', configKey: 'ballPocket' },
                    { key: 'potionsTier', configKey: 'potionSatchel' },
                    { key: 'boxTier', configKey: 'pokemonBox' },
                    { key: 'glassTier', configKey: 'glass' },
                    { key: 'smartwatchTier', configKey: 'smartwatch' },
                    { key: 'speedTier', configKey: 'speed' },
                    { key: 'lootTier', configKey: 'loot' }
                ];

                upgradeTypes.forEach(type => {
                    const tier = state.stats.upgrades[type.key] || 0;
                    if (tier > 0) {
                        // Show the currently purchased tier (index tier - 1)
                        const configItem = state.config.balance.expansions[type.configKey][tier - 1];
                        if (configItem) {
                            const displayName = configItem.displayName || configItem.name;
                            const description = configItem.description || '';
                            contentHtml += `
                                <div style="background: #2c3e50; border: 2px solid #3498db; border-radius: 10px; padding: 15px; text-align: center; display: flex; flex-direction: column; align-items: center; justify-content: flex-start; gap: 10px;">
                                    <div style="font-size: 14px; font-weight: bold; color: white;">${displayName}</div>
                                    <img src="./Assets/Items/Upgrades/${configItem.name}.png" style="width: 50px; height: 50px; object-fit: contain;" alt="${displayName}">
                                    <div style="font-size: 12px; color: #cbd5e1; line-height: 1.3;">${description}</div>
                                </div>
                            `;
                        }
                    }
                });
            }

            contentHtml += '</div>';

            if (contentHtml === '<div style="display: grid; grid-template-columns: repeat(auto-fill, minmax(200px, 1fr)); gap: 15px; padding: 15px;"></div>') {
                contentHtml = '<div style="text-align: center; padding: 20px; font-style: italic; color: #ccc;">No upgrades purchased yet.</div>';
            }
        }"""

if old_upgrades in content:
    content = content.replace(old_upgrades, new_upgrades)
    with open('src/ui.js', 'w') as f:
        f.write(content)
else:
    print("Could not find old upgrades block.")
