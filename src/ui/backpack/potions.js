import { state } from '../../state.js';
import { formatQuantity } from './utils.js';

export function renderPotionsTab(area) {
    let content = `
        <div style="display: flex; flex-direction: column; width: 100%; height: 100%; --m-width: min(90vw, 825px);">
            <h3 style="text-align: center; margin-top: 0; color: #ddd; font-size: calc(var(--m-width) * 0.022);">Select Potion to auto use during battles.</h3>
            <div style="display: flex; flex-wrap: wrap; gap: calc(var(--m-width) * 0.018); justify-content: center; overflow-y: auto; flex: 1; padding: calc(var(--m-width) * 0.012);">
    `;

    const potions = state.config.balance.items.potions;

    for (let idx = 0; idx < potions.length; idx++) {
        let p = potions[idx];
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
                style="background: #2c3e50; border: 2px solid ${borderColor}; border-radius: 10px; padding: calc(var(--m-width) * 0.012); text-align: center; cursor: pointer; transition: transform 0.2s; display: flex; flex-direction: column; align-items: center; justify-content: center; width: calc(var(--m-width) * 0.145); box-sizing: border-box;">
                <div style="font-size: calc(var(--m-width) * 0.017); font-weight: bold; margin-bottom: calc(var(--m-width) * 0.006); height: calc(var(--m-width) * 0.038); display: flex; align-items: center; justify-content: center; text-align: center; line-height: 1.1;">${displayName}</div>
                <img src="./Assets/Items/Potions/${inventoryName}.png" style="width: calc(var(--m-width) * 0.072); height: calc(var(--m-width) * 0.072); object-fit: contain; margin-bottom: calc(var(--m-width) * 0.006);" onerror="this.src='data:image/gif;base64,R0lGODlhAQABAAD/ACwAAAAAAQABAAACADs='">
                <div style="font-size: calc(var(--m-width) * 0.014); color: #f1c40f; margin-bottom: calc(var(--m-width) * 0.006); line-height: 1.1;">${attrLabel}</div>
                <div style="font-size: calc(var(--m-width) * 0.017); font-weight: bold; color: #bdc3c7; line-height: 1.1;">Stock: ${formatQuantity(qty)}</div>
            </div>
        `;
    }

    content += `
            </div>
        </div>
    `;

    area.innerHTML = content;
}
