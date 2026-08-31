import { state } from '../../state.js';
import { formatQuantity } from './utils.js';

export function renderPotionsTab(area) {
    let content = '<div style="text-align:center; margin-bottom:10px;"><p style="font-size:12px;">Click a Potion to set it as active for auto-heal. Selected potion will be used if available, otherwise it falls back to a lower tier.</p></div>';
    content += '<div style="display: flex; flex-wrap: wrap; gap: 20px; justify-content: center;">';

    const noneActive = state.settings.activePotionTier === -1;
    content += `
        <div onclick="window.setActiveItem('potion', -1)" style="text-align: center; width: 80px; cursor: pointer; border: 2px solid ${noneActive ? '#2ecc71' : 'transparent'}; border-radius: 8px; padding: 5px; background: ${noneActive ? 'rgba(46,204,113,0.2)' : 'transparent'};">
            <div style="width: 50px; height: 50px; margin: 0 auto; display: flex; align-items: center; justify-content: center; font-size: 24px; color: #e74c3c;">X</div>
            <span style="font-size: 12px;">None</span>
        </div>
    `;

    state.config.balance.items.potions.forEach((p, idx) => {
        let inventoryName = p.name;
        if (p.name === 'Regular Potion') inventoryName = 'Regular Potion';
        if (p.name === 'Big') inventoryName = 'Big Potion';
        const qty = state.backpack.potions[inventoryName] || 0;
        const isActive = state.settings.activePotionTier === idx;
        content += `
            <div onclick="window.setActiveItem('potion', ${idx})" style="text-align: center; width: 80px; cursor: pointer; border: 2px solid ${isActive ? '#2ecc71' : 'transparent'}; border-radius: 8px; padding: 5px; background: ${isActive ? 'rgba(46,204,113,0.2)' : 'transparent'};">
                <img src="./Assets/Items/Potions/${inventoryName}.png" style="width: 50px; height: 50px;" onerror="this.src='data:image/gif;base64,R0lGODlhAQABAAD/ACwAAAAAAQABAAACADs='">
                <br><span style="font-size: 12px;">${inventoryName}</span>
                <br><b>x${formatQuantity(qty)}</b>
            </div>
        `;
    });
    content += '</div>';

    area.innerHTML = content;
}
