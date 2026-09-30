const fs = require('fs');
let content = fs.readFileSync('src/ui.js', 'utf8');

const searchBlock = `
                            const description = configItem.description || '';
                            contentHtml += \`
                                <div style="background: #2c3e50; border: 2px solid #3498db; border-radius: 10px; padding: 15px; text-align: center; display: flex; flex-direction: column; align-items: center; justify-content: flex-start; gap: 10px;">
                                    <div style="font-size: 14px; font-weight: bold; color: white;">\${displayName}</div>
                                    <img src="./Assets/Items/Upgrades/\${configItem.name}.png" style="width: 50px; height: 50px; object-fit: contain;" alt="\${displayName}">
                                    <div style="font-size: 12px; color: #cbd5e1; line-height: 1.3;">\${description}</div>
                                </div>
                            \`;
`;

const replaceBlock = `
                            let description = configItem.description || '';
                            if (type.configKey === 'ballPocket') {
                                description = \`Ball Stock Capacity: \${window.mathEngine.getCapacity(state, 'balls')}\`;
                            } else if (type.configKey === 'potionSatchel') {
                                description = \`Potion Stock Capacity: \${window.mathEngine.getCapacity(state, 'potions')}\`;
                            } else if (type.configKey === 'pokemonBox') {
                                description = \`Pokemon Capacity in Backpack: \${window.mathEngine.getCapacity(state, 'storage')}\`;
                            } else if (type.configKey === 'speed') {
                                description = \`Encounter time decreased in \${configItem.increment}\`;
                            } else if (type.configKey === 'loot') {
                                if (tier === 1) description = "Can loot Potion";
                                else if (tier === 2) description = "Can loot Potion and Ball";
                                else if (tier === 3) description = "Can loot Potion, Ball and Stone";
                                else if (tier === 4) description = "Can loot Potion, Ball, Stone and Vitamin";
                            } else if (type.configKey === 'smartwatch') {
                                if (tier === 1) description = "Can Select Ball at Main View";
                                else if (tier === 2) description = "Can Select Ball and potion at Main View";
                                else if (tier >= 3) description = "Can Select Ball and potion at Main View and use smart mode for capture";
                            }

                            contentHtml += \`
                                <div style="background: #2c3e50; border: 2px solid #3498db; border-radius: 10px; padding: 15px; text-align: center; display: flex; flex-direction: column; align-items: center; justify-content: flex-start; gap: 10px;">
                                    <div style="font-size: 14px; font-weight: bold; color: white;">\${displayName}</div>
                                    <img src="./Assets/Items/Upgrades/\${configItem.name}.png" style="width: 50px; height: 50px; object-fit: contain;" alt="\${displayName}">
                                    <div style="font-size: 12px; color: #cbd5e1; line-height: 1.3;">\${description}</div>
                                </div>
                            \`;
`;

content = content.replace(searchBlock.trim(), replaceBlock.trim());
fs.writeFileSync('src/ui.js', content);
