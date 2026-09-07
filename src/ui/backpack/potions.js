import { state } from '../../state.js';
import { formatQuantity } from './utils.js';

export function renderPotionsTab(area) {
    let content = `
        <div style="display: flex; flex-direction: column; width: 100%; height: 100%; container-type: inline-size;">
            <h3 style="text-align: center; margin-top: 0; color: #ddd; font-size: 2.5cqi;">Select Potion to auto use during battles.</h3>

            <div style="width: 80%; margin: 1cqi auto 2cqi auto; display: flex; flex-direction: column; align-items: center; justify-content: center;">
                <label style="color: #ddd; font-size: 1.8cqi; margin-bottom: 1cqi;">
                    Auto-Heal Threshold: <span id="potion-threshold-val">${state.settings.autoPotionThreshold}%</span>
                </label>
                <input type="range" min="0" max="100" value="${state.settings.autoPotionThreshold}" id="potion-threshold-slider"
                    oninput="
                        let val = parseInt(this.value);
                        if (val > 90) { val = 90; this.value = 90; }
                        document.getElementById('potion-threshold-val').innerText = val + '%';
                        window.setAutoPotionThreshold(val);
                    "
                    style="width: 100%; cursor: pointer;"
                >
            </div>

            <div style="display: flex; flex-wrap: wrap; gap: 1.5cqi; justify-content: center; align-content: flex-start; overflow-y: auto; flex: 1; padding: 1.2cqi; box-sizing: border-box;">
    `;

    const potions = state.config.balance.items.potions;

    for (let idx = 0; idx < potions.length; idx++) {
        let p = potions[idx];
        if (p.name === 'Max Potion') continue;
        let inventoryName = p.name;
        if (p.name === 'Regular Potion') inventoryName = 'Regular Potion';
        if (p.name === 'Big') inventoryName = 'Big Potion';

        let displayName = inventoryName.replace(' Potion', '<br>Potion');

        const qty = state.backpack.potions[inventoryName] || 0;
        const isActive = state.settings.activePotionTier === idx;
        const borderColor = isActive ? '#2ecc71' : '#3498db';
        const healAmt = p.heal;
        const attrLabel = `Heal: ${healAmt >= 999999 ? '100%' : healAmt + ' HP'}`;

        content += `
            <div onclick="window.setActiveItem('potion', ${idx})"
                style="background: #2c3e50; border: 2px solid ${borderColor}; border-radius: 10px; padding: 1cqi; text-align: center; cursor: pointer; transition: transform 0.2s; display: flex; flex-direction: column; align-items: center; justify-content: center; width: 14.5cqi; box-sizing: border-box;">
                <div style="font-size: 1.6cqi; font-weight: bold; margin-bottom: 0.5cqi; height: 3.5cqi; display: flex; align-items: center; justify-content: center; text-align: center; line-height: 1.1;">${displayName}</div>
                <img src="./Assets/Items/Potions/${inventoryName}.png" style="width: 7cqi; height: 7cqi; object-fit: contain; margin-bottom: 0.5cqi;" onerror="this.src='data:image/gif;base64,R0lGODlhAQABAAD/ACwAAAAAAQABAAACADs='">
                <div style="font-size: 1.4cqi; color: #f1c40f; margin-bottom: 0.5cqi; line-height: 1.1;">${attrLabel}</div>
                <div style="font-size: 1.6cqi; font-weight: bold; color: #bdc3c7; line-height: 1.1;">Stock: ${formatQuantity(qty)}</div>
            </div>
        `;
    }

    content += `
            </div>
        </div>
    `;

    area.innerHTML = content;
}
