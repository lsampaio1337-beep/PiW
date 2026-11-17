import { VITAMINS } from "../../constants.js";
import { state } from '../../state.js';
import { formatQuantity } from './utils.js';

export function renderVitaminsTab(area) {
    let content = `
        <div class="backpack-item-grid">
    `;

    for (const name of VITAMINS) {
        // Fallback to 0 if they don't have it in inventory yet
        // Since vitamins are stored alongside stones in state currently
        const qty = state.backpack.stones[name] || 0;

        let displayName = name;
        if (name.includes(' ')) {
            const parts = name.split(' ');
            if (parts.length === 2) {
                displayName = `${parts[0]}<br>${parts[1]}`;
            }
        }

        const imagePath = `./Assets/Items/Vitamins/${name}.png`;

        content += `
            <div class="backpack-item-card">
                <div class="backpack-item-name">${displayName}</div>
                <img src="${imagePath}" class="backpack-item-img" onerror="this.src='data:image/gif;base64,R0lGODlhAQABAAD/ACwAAAAAAQABAAACADs='">
                <div class="backpack-item-stock">Stock: ${formatQuantity(qty)}</div>
            </div>
        `;
    }

    content += `
        </div>
    `;

    const doc = new DOMParser().parseFromString(content, 'text/html');
    area.replaceChildren(...doc.body.childNodes);
}
