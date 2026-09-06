import { state } from '../../state.js';
import { getBasePrice } from './utils.js';
import { formatQuantity } from './utils.js';

export function renderStonesTab(area) {
    if (window.sellModeActive) {
        renderStonesSellTab(area);
        return;
    }
    // 18 stones list hardcoded alphabetically to match the 6x3 grid request precisely
    const allStones = [
        "Bug Stone", "Dark Stone", "Dragon Stone", "Electric Stone", "Fairy Stone", "Fighting Stone",
        "Fire Stone", "Flying Stone", "Ghost Stone", "Grass Stone", "Ground Stone", "Ice Stone",
        "Normal Stone", "Poison Stone", "Psychic Stone", "Rock Stone", "Steel Stone", "Water Stone"
    ];

    let content = '<div style="display: grid; grid-template-columns: repeat(6, 1fr); gap: 10px; width: 100%; justify-items: center; align-items: center;">';

    for (const name of allStones) {
        // Fallback to 0 if they don't have it in inventory yet
        const qty = state.backpack.stones[name] || 0;

        content += `
            <div style="text-align: center; width: 100%; box-sizing: border-box;">
                <div style="width: 100%; aspect-ratio: 1/1; margin: 0 auto; display: flex; align-items: center; justify-content: center;">
                    <img src="./Assets/Items/Stones/${name}.png" style="max-width: 100%; max-height: 100%; object-fit: contain;" onerror="this.src='data:image/gif;base64,R0lGODlhAQABAAD/ACwAAAAAAQABAAACADs='">
                </div>
                <div style="font-size: 10px; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; margin-top: 2px;">${name}</div>
                <div style="font-size: 12px;"><b>x${formatQuantity(qty)}</b></div>
            </div>
        `;
    }

    content += '</div>';

    area.innerHTML = content;
}


export function renderStonesSellTab(area) {
    let content = `<div style="text-align: center; margin-bottom: 15px; color: #e74c3c; font-weight: bold; font-size: 18px;">Selling Mode: Stones</div>`;
    content += `<div style="display: grid; grid-template-columns: repeat(4, 1fr); gap: 10px; justify-content: center;">`;

    const items = Object.keys(state.backpack['stones']);
    items.sort();

    items.forEach(itemName => {
        let qty = state.backpack['stones'][itemName];
        if (qty > 0) {
            let basePrice = getBasePrice('stones', itemName);
            let sellPrice = Math.floor(basePrice * 0.5);
            let imgPath = '';
            imgPath = `./Assets/Items/Stones/${itemName}.png`;

            content += `
                <div style="background: rgba(0,0,0,0.5); border-radius: 8px; padding: 10px; text-align: center; display: flex; flex-direction: column; align-items: center; justify-content: space-between;">
                    <img src="${imgPath}" style="width: 50px; height: 50px; object-fit: contain;">
                    <div style="font-size: 12px; margin-top: 5px;">${itemName} (x${qty})</div>
                    <div style="font-size: 12px; color: #2ecc71;">Sell: $${sellPrice} ea</div>
                    <div style="display: flex; gap: 5px; margin-top: 5px;">
                        <input type="number" min="0" max="${qty}" value="0" class="sell-qty-input" data-item="${itemName}" data-price="${basePrice}" onchange="window.updateSellValueDisplay('stones')" style="width: 50px; text-align: center; border-radius: 4px; border: 1px solid #ccc; background: #333; color: white;">
                        <button onclick="this.previousElementSibling.value = ${qty}; window.updateSellValueDisplay('stones')" style="padding: 2px 5px; background: #3498db; color: white; border: none; border-radius: 4px; cursor: pointer; font-size: 10px;">All</button>
                    </div>
                </div>
            `;
        }
    });

    content += `</div>`;

    content += `
        <div style="margin-top: 20px; text-align: center; background: rgba(0,0,0,0.6); padding: 10px; border-radius: 5px;">
            <div id="sell-value-display" style="font-size: 18px; font-weight: bold; color: #2ecc71; margin-bottom: 10px;">Total Earned: $0</div>
            <button onclick="window.sellSelectedItems('stones')" style="padding: 10px 20px; background: #e74c3c; color: white; border: none; border-radius: 4px; cursor: pointer; font-size: 16px; font-weight: bold; margin-right: 10px;">Sell Selected</button>
            <button onclick="window.cancelSellMode()" style="padding: 10px 20px; background: #7f8c8d; color: white; border: none; border-radius: 4px; cursor: pointer; font-size: 16px; font-weight: bold;">Cancel</button>
        </div>
    `;

    area.innerHTML = content;
}
