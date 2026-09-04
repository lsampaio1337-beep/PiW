import { state } from '../../state.js';
import { formatQuantity } from './utils.js';

export function renderStonesTab(area) {
    if (window.sellModeActive) {
        renderStonesSellMode(area);
        return;
    }


    let totalItems = 0;
    Object.keys(state.backpack.stones).forEach(k => { if ((state.backpack.stones[k] || 0) > 0) totalItems++; });
    if (totalItems === 0) {
        area.innerHTML = '<div style="display: flex; height: 100%; width: 100%; align-items: center; justify-content: center; font-size: 24px; color: #aaa; font-weight: bold;">No item</div>';
        return;
    }
    let content = '<div style="display: grid; grid-template-columns: repeat(6, 1fr); justify-content: center; gap: 10px; width: 100%; justify-items: center; align-items: center; height: 100%;">';

    const stoneNames = Object.keys(state.backpack.stones).sort();

    stoneNames.forEach(s => {
        const qty = state.backpack.stones[s] || 0;

        let opacity = qty > 0 ? "1" : "0.3";
        let filter = qty > 0 ? "none" : "grayscale(100%)";

        content += `
            <div style="text-align: center; width: 100%; opacity: ${opacity}; filter: ${filter}; border: 1px solid transparent; border-radius: 8px; padding: 5px; box-sizing: border-box;">
                <div style="width: 100%; aspect-ratio: 1/1; margin: 0 auto; display: flex; align-items: center; justify-content: center;">
                    <img src="./Assets/Items/Stones/${s}.png" style="max-width: 100%; max-height: 100%; object-fit: contain;" onerror="this.src='./Assets/Extra/Spot.png'">
                </div>
                <div style="font-size: 10px; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; margin-top: 2px;">${s}</div>
                <div style="font-size: 12px; margin-top: 2px;"><b>x${formatQuantity(qty)}</b></div>
            </div>
        `;
    });

    content += '</div>';
    area.innerHTML = content;
}

function renderStonesSellMode(area) {
    let totalItems = 0;
    Object.keys(state.backpack.stones).forEach(k => { if ((state.backpack.stones[k] || 0) > 0) totalItems++; });
    if (totalItems === 0) {
        area.innerHTML = '<div style="display: flex; height: 100%; width: 100%; align-items: center; justify-content: center; font-size: 24px; color: #aaa; font-weight: bold;">No item</div>';
        return;
    }
    let content = '<div style="display: grid; grid-template-columns: repeat(4, 1fr); justify-content: center; gap: 15px; overflow-y: auto; max-height: 100%; padding-bottom: 20px;">';
    const stonePrice = state.config.balance.items.stones.sell || Math.floor(state.config.balance.items.stones.price * 0.5);

    Object.keys(state.backpack.stones).sort().forEach(s => {
        const qty = state.backpack.stones[s] || 0;
        if (qty > 0) {
            content += `
                <div style="background: #333; border: 1px solid #555; border-radius: 8px; padding: 5%; text-align: center; display: flex; flex-direction: column; align-items: center; justify-content: space-between; aspect-ratio: 1 / 1.5; box-sizing: border-box; container-type: inline-size;">
                    <img src="./Assets/Items/Stones/${s}.png" onerror="this.src='./Assets/Extra/Spot.png'" style="width: 50%; max-height: 30%; object-fit: contain; margin-bottom: 5px;">
                    <div style="font-size: 14px; font-weight: bold;">${s.split(' ')[0]}<br>${s.split(' ').slice(1).join(' ')}</div>
                    <div style="font-size: 12px; color: #aaa;">Owned: ${formatQuantity(qty)}</div>
                    <div style="font-size: 12px; color: #2ecc71;">Sell: $${stonePrice} ea</div>

                    <div style="margin-top: 10px;">
                        <input type="number" id="sell-qty-stone-${s.replace(/\s+/g, '-')}" value="1" min="1" max="${qty}" oninput="window.updateLocalSellPrice('stone', '${s}', ${stonePrice})" style="width: 80%; text-align: center; margin-bottom: 5px; font-size: 12px;">
                        <button onclick="document.getElementById('sell-qty-stone-${s.replace(/\s+/g, '-')}').value=${qty}; window.updateLocalSellPrice('stone', '${s}', ${stonePrice})" style="padding: 2px 5px; font-size: 10px;">Max</button>
                    </div>
                    <div id="sell-total-stone-${s.replace(/\s+/g, '-')}" style="font-size: 14px; font-weight: bold; color: #f1c40f; margin-top: 5px;">Total: $${stonePrice}</div>
                    <button onclick="window.sellItem('${s}', 'stones', ${stonePrice}, 'stone')" style="margin-top: 5px; padding: 5%; background: #e74c3c; color: white; border: none; border-radius: 4px; cursor: pointer; width: 100%; font-size: 10cqw;">Sell</button>
                </div>
            `;
        }
    });

    content += '</div>';
    area.innerHTML = content;
}
