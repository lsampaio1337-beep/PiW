import { VITAMINS } from "../../constants.js";
import { state } from '../../state.js';
import { formatQuantity } from './utils.js';

const VITAMIN_BONUSES = {
    'HP Up': '+1% Max HP',
    'Carbo Speed': '+1% Speed',
    'Protein Atk': '+1% Attack',
    'Calcium SpAtk': '+1% Sp. Atk',
    'Iron Def': '+1% Defense',
    'Zinc SpDef': '+1% Sp. Def'
};

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
        const attrLabel = VITAMIN_BONUSES[name] || '+1% Stat';

        content += `
            <div class="backpack-item-card">
                <div class="backpack-item-name">${displayName}</div>
                <img src="${imagePath}" class="backpack-item-img" onerror="this.src='data:image/gif;base64,R0lGODlhAQABAAD/ACwAAAAAAQABAAACADs='">
                <div class="backpack-item-attr">${attrLabel}</div>
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
