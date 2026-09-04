import { state } from '../../state.js';
import { formatQuantity } from './utils.js';
import { updateUI } from '../../ui.js';
import { renderBackpackTab } from './index.js';

export function renderPokeballsTab(area) {
    if (window.sellModeActive) {
        renderPokeballsSellMode(area);
        return;
    }

    let content = '<div style="text-align:center; margin-bottom:10px;"><p style="font-size:12px;">Click a Pokeball to set it as active for auto-catch. Selected ball will be used if available, otherwise it falls back to a lower tier.</p></div>';

    // Use CSS grid to allow dynamic scaling
    content += '<div style="display: grid; grid-template-columns: repeat(5, 1fr); gap: 10px; width: 100%; justify-items: center; align-items: center;">';

    const noneActive = state.settings.activeBallTier === -1;
    content += `
        <div onclick="window.setActiveItem('ball', -1)" style="text-align: center; width: 100%; cursor: pointer; border: 2px solid ${noneActive ? '#2ecc71' : 'transparent'}; border-radius: 8px; padding: 5px; background: ${noneActive ? 'rgba(46,204,113,0.2)' : 'transparent'}; box-sizing: border-box;">
            <div style="width: 100%; aspect-ratio: 1/1; margin: 0 auto; display: flex; align-items: center; justify-content: center; font-size: 24px; color: #e74c3c;">X</div>
            <div style="font-size: 12px; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; margin-top: 2px;">None</div>
        </div>
    `;

    state.config.balance.items.pokeballs.forEach((b, idx) => {
        const qty = state.backpack.pokeballs[b.name] || 0;
        const isActive = state.settings.activeBallTier === idx;
        content += `
            <div onclick="window.setActiveItem('ball', ${idx})" style="text-align: center; width: 100%; cursor: pointer; border: 2px solid ${isActive ? '#2ecc71' : 'transparent'}; border-radius: 8px; padding: 5px; background: ${isActive ? 'rgba(46,204,113,0.2)' : 'transparent'}; box-sizing: border-box;">
                <div style="width: 100%; aspect-ratio: 1/1; margin: 0 auto; display: flex; align-items: center; justify-content: center;">
                    <img src="./Assets/Items/Pokeballs/${b.name}.png" style="max-width: 100%; max-height: 100%; object-fit: contain;" onerror="this.src='./Assets/Extra/Spot.png'">
                </div>
                <div style="font-size: 12px; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; margin-top: 2px;">${b.name}</div>
                <div style="font-size: 12px;"><b>x${formatQuantity(qty)}</b></div>
            </div>
        `;
    });
    content += '</div>';

    area.innerHTML = content;
}

function renderPokeballsSellMode(area) {
    let content = '<div style="display: grid; grid-template-columns: repeat(auto-fill, minmax(180px, 1fr)); gap: 15px; overflow-y: auto; max-height: 100%; padding-bottom: 20px;">';

    state.config.balance.items.pokeballs.forEach(b => {
        const qty = state.backpack.pokeballs[b.name] || 0;
        if (qty > 0) {
            const sellPrice = Math.floor(b.price * 0.5);
            content += `
                <div style="background: #333; border: 1px solid #555; border-radius: 8px; padding: 10px; text-align: center; position: relative;">
                    <img src="./Assets/Items/Pokeballs/${b.name}.png" onerror="this.src='./Assets/Extra/Spot.png'" style="width: 48px; height: 48px; margin-bottom: 5px;">
                    <div style="font-size: 14px; font-weight: bold;">${b.name}</div>
                    <div style="font-size: 12px; color: #aaa;">Owned: ${formatQuantity(qty)}</div>
                    <div style="font-size: 12px; color: #2ecc71;">Sell: $${sellPrice} ea</div>

                    <div style="margin-top: 10px;">
                        <input type="number" id="sell-qty-ball-${b.name.replace(/\s+/g, '-')}" value="1" min="1" max="${qty}" oninput="window.updateLocalSellPrice('ball', '${b.name}', ${sellPrice})" style="width: 50px; text-align: center; margin-bottom: 5px;">
                        <button onclick="document.getElementById('sell-qty-ball-${b.name.replace(/\s+/g, '-')}').value=${qty}; window.updateLocalSellPrice('ball', '${b.name}', ${sellPrice})" style="padding: 2px 5px; font-size: 10px;">Max</button>
                    </div>
                    <div id="sell-total-ball-${b.name.replace(/\s+/g, '-')}" style="font-size: 14px; font-weight: bold; color: #f1c40f; margin-top: 5px;">Total: $${sellPrice}</div>
                    <button onclick="window.sellItem('${b.name}', 'pokeballs', ${sellPrice}, 'ball')" style="margin-top: 5px; padding: 5px 10px; background: #e74c3c; color: white; border: none; border-radius: 4px; cursor: pointer; width: 100%;">Sell</button>
                </div>
            `;
        }
    });

    content += '</div>';
    area.innerHTML = content;
}

window.updateLocalSellPrice = function(type, itemName, sellPrice) {
    const input = document.getElementById(`sell-qty-${type}-${itemName.replace(/\s+/g, '-')}`);
    const totalDiv = document.getElementById(`sell-total-${type}-${itemName.replace(/\s+/g, '-')}`);
    if (input && totalDiv) {
        let qty = parseInt(input.value);
        if (isNaN(qty) || qty < 1) qty = 1;
        const max = parseInt(input.getAttribute('max'));
        if (qty > max) qty = max;
        input.value = qty;
        totalDiv.innerText = `Total: $${(qty * sellPrice).toLocaleString()}`;
    }
};

window.sellItem = function(itemId, category, sellPrice, typePrefix) {
    const input = document.getElementById(`sell-qty-${typePrefix}-${itemId.replace(/\s+/g, '-')}`);
    if (!input) return;
    const qty = parseInt(input.value);

    if (state.backpack[category][itemId] >= qty) {
        state.backpack[category][itemId] -= qty;
        const earnings = qty * sellPrice;
        state.trainer.money += earnings;
        updateUI();
        alert(`Sold ${qty}x ${itemId} for $${earnings.toLocaleString()}!`);
        renderBackpackTab(category); // Re-render this tab
    } else {
        alert("Not enough items to sell!");
    }
};
