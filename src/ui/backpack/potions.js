import { state } from '../../state.js';
import { formatQuantity } from './utils.js';
import { renderBackpackTab } from './index.js';

export function renderPotionsTab(area) {
    if (window.sellModeActive) {
        renderPotionsSellMode(area);
        return;
    }

    let content = '<div style="text-align:center; margin-bottom:10px;"><p style="font-size:12px;">Click a Potion to set it as active for auto-heal. Selected potion will be used if available, otherwise it falls back to a lower tier.</p></div>';
    content += '<div style="display: grid; grid-template-columns: repeat(5, 1fr); gap: 10px; width: 100%; justify-items: center; align-items: center;">';

    const noneActive = state.settings.activePotionTier === -1;
    content += `
        <div onclick="window.setActiveItem('potion', -1)" style="text-align: center; width: 100%; cursor: pointer; border: 2px solid ${noneActive ? '#2ecc71' : 'transparent'}; border-radius: 8px; padding: 5px; background: ${noneActive ? 'rgba(46,204,113,0.2)' : 'transparent'}; box-sizing: border-box;">
            <div style="width: 100%; aspect-ratio: 1/1; margin: 0 auto; display: flex; align-items: center; justify-content: center; font-size: 24px; color: #e74c3c;">X</div>
            <div style="font-size: 12px; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; margin-top: 2px;">None</div>
        </div>
    `;

    const potions = state.config.balance.items.potions;
    potions.forEach((p, idx) => {
        let inventoryName = p.name;
        if (p.name === 'Regular Potion') inventoryName = 'Regular Potion';
        if (p.name === 'Big') inventoryName = 'Big Potion';

        const qty = state.backpack.potions[inventoryName] || 0;
        const isActive = state.settings.activePotionTier === idx;
        content += `
            <div onclick="window.setActiveItem('potion', ${idx})" style="text-align: center; width: 100%; cursor: pointer; border: 2px solid ${isActive ? '#2ecc71' : 'transparent'}; border-radius: 8px; padding: 5px; background: ${isActive ? 'rgba(46,204,113,0.2)' : 'transparent'}; box-sizing: border-box;">
                <div style="width: 100%; aspect-ratio: 1/1; margin: 0 auto; display: flex; align-items: center; justify-content: center;">
                    <img src="./Assets/Items/Potions/${inventoryName}.png" style="max-width: 100%; max-height: 100%; object-fit: contain;" onerror="this.src='./Assets/Extra/Spot.png'">
                </div>
                <div style="font-size: 12px; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; margin-top: 2px;">${inventoryName}</div>
                <div style="font-size: 10px; color: #aaa;">Heals ${p.heal}HP</div>
                <div style="font-size: 12px;"><b>x${formatQuantity(qty)}</b></div>
            </div>
        `;
    });
    content += '</div>';

    area.innerHTML = content;
}

function renderPotionsSellMode(area) {
    let content = '<div style="display: grid; grid-template-columns: repeat(auto-fill, minmax(180px, 1fr)); gap: 15px; overflow-y: auto; max-height: 100%; padding-bottom: 20px;">';

    state.config.balance.items.potions.forEach(p => {
        let inventoryName = p.name;
        if (p.name === 'Regular Potion') inventoryName = 'Regular Potion';
        if (p.name === 'Big') inventoryName = 'Big Potion';

        const qty = state.backpack.potions[inventoryName] || 0;
        if (qty > 0) {
            const sellPrice = Math.floor(p.price * 0.5);
            content += `
                <div style="background: #333; border: 1px solid #555; border-radius: 8px; padding: 10px; text-align: center; position: relative;">
                    <img src="./Assets/Items/Potions/${inventoryName}.png" onerror="this.src='./Assets/Extra/Spot.png'" style="width: 48px; height: 48px; margin-bottom: 5px;">
                    <div style="font-size: 14px; font-weight: bold;">${inventoryName}</div>
                    <div style="font-size: 12px; color: #aaa;">Owned: ${formatQuantity(qty)}</div>
                    <div style="font-size: 12px; color: #2ecc71;">Sell: $${sellPrice} ea</div>

                    <div style="margin-top: 10px;">
                        <input type="number" id="sell-qty-potion-${inventoryName.replace(/\s+/g, '-')}" value="1" min="1" max="${qty}" onchange="window.updateLocalSellPrice('potion', '${inventoryName}', ${sellPrice})" style="width: 50px; text-align: center; margin-bottom: 5px;">
                        <button onclick="document.getElementById('sell-qty-potion-${inventoryName.replace(/\s+/g, '-')}').value=${qty}; window.updateLocalSellPrice('potion', '${inventoryName}', ${sellPrice})" style="padding: 2px 5px; font-size: 10px;">Max</button>
                    </div>
                    <div id="sell-total-potion-${inventoryName.replace(/\s+/g, '-')}" style="font-size: 14px; font-weight: bold; color: #f1c40f; margin-top: 5px;">Total: $${sellPrice}</div>
                    <button onclick="window.sellItem('${inventoryName}', 'potions', ${sellPrice}, 'potion')" style="margin-top: 5px; padding: 5px 10px; background: #e74c3c; color: white; border: none; border-radius: 4px; cursor: pointer; width: 100%;">Sell</button>
                </div>
            `;
        }
    });

    content += '</div>';
    area.innerHTML = content;
}
