import { state } from '../../state.js';
import { formatQuantity } from './utils.js';

export function renderPotionsTab(area) {
    let content = '<div style="text-align:center; margin-bottom:10px;"><p style="font-size:12px;">Click a Potion to set it as active for auto-heal. Selected potion will be used if available, otherwise it falls back to a lower tier.</p></div>';

    // Line 1: None, Tiny, Small, Regular
    content += '<div style="display: flex; gap: 20px; justify-content: center; margin-bottom: 20px;">';

    const noneActive = state.settings.activePotionTier === -1;
    content += `
        <div onclick="window.setActiveItem('potion', -1)" style="text-align: center; width: 80px; cursor: pointer; border: 2px solid ${noneActive ? '#2ecc71' : 'transparent'}; border-radius: 8px; padding: 5px; background: ${noneActive ? 'rgba(46,204,113,0.2)' : 'transparent'};">
            <div style="width: 50px; height: 50px; margin: 0 auto; display: flex; align-items: center; justify-content: center; font-size: 24px; color: #e74c3c;">X</div>
            <span style="font-size: 12px;">None</span>
        </div>
    `;

    const potions = state.config.balance.items.potions;

    for (let idx = 0; idx < 3; idx++) {
        let p = potions[idx];
        let inventoryName = p.name;
        if (p.name === 'Regular Potion') inventoryName = 'Regular Potion';
        if (p.name === 'Big') inventoryName = 'Big Potion';
        const qty = state.backpack.potions[inventoryName] || 0;
        const isActive = state.settings.activePotionTier === idx;
        content += `
            <div onclick="window.setActiveItem('potion', ${idx})" style="text-align: center; width: 80px; cursor: pointer; border: 2px solid ${isActive ? '#2ecc71' : 'transparent'}; border-radius: 8px; padding: 5px; background: ${isActive ? 'rgba(46,204,113,0.2)' : 'transparent'};">
                <div style="width: 50px; height: 50px; margin: 0 auto; display: flex; align-items: center; justify-content: center;">
                    <img src="./Assets/Items/Potions/${inventoryName}.png" style="max-width: 100%; max-height: 100%; object-fit: contain;" onerror="this.src='data:image/gif;base64,R0lGODlhAQABAAD/ACwAAAAAAQABAAACADs='">
                </div>
                <span style="font-size: 12px;">${inventoryName}</span>
                <br><b>x${formatQuantity(qty)}</b>
            </div>
        `;
    }
    content += '</div>';

    // Line 2: Big, Hyper, Ultra, Max
    content += '<div style="display: flex; gap: 20px; justify-content: center;">';
    for (let idx = 3; idx < potions.length; idx++) {
        let p = potions[idx];
        let inventoryName = p.name;
        if (p.name === 'Regular Potion') inventoryName = 'Regular Potion';
        if (p.name === 'Big') inventoryName = 'Big Potion';
        const qty = state.backpack.potions[inventoryName] || 0;
        const isActive = state.settings.activePotionTier === idx;
        content += `
            <div onclick="window.setActiveItem('potion', ${idx})" style="text-align: center; width: 80px; cursor: pointer; border: 2px solid ${isActive ? '#2ecc71' : 'transparent'}; border-radius: 8px; padding: 5px; background: ${isActive ? 'rgba(46,204,113,0.2)' : 'transparent'};">
                <div style="width: 50px; height: 50px; margin: 0 auto; display: flex; align-items: center; justify-content: center;">
                    <img src="./Assets/Items/Potions/${inventoryName}.png" style="max-width: 100%; max-height: 100%; object-fit: contain;" onerror="this.src='data:image/gif;base64,R0lGODlhAQABAAD/ACwAAAAAAQABAAACADs='">
                </div>
                <span style="font-size: 12px;">${inventoryName}</span>
                <br><b>x${formatQuantity(qty)}</b>
            </div>
        `;
    }
    content += '</div>';

    area.innerHTML = content;
}
