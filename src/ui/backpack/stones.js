import { state } from '../../state.js';
import { formatQuantity } from './utils.js';

export function renderStonesTab(area) {
    let content = '<div style="display: flex; flex-wrap: wrap; gap: 20px; justify-content: center;">';
    for (const [name, qty] of Object.entries(state.backpack.stones)) {
        content += `
            <div style="text-align: center; width: 80px;">
                <img src="./Assets/Items/Stones/${name}.png" style="width: 50px; height: 50px;" onerror="this.src='data:image/gif;base64,R0lGODlhAQABAAD/ACwAAAAAAQABAAACADs='">
                <br><span style="font-size: 12px;">${name}</span>
                <br><b>x${formatQuantity(qty)}</b>
            </div>
        `;
    }
    content += '</div>';

    area.innerHTML = content;
}
