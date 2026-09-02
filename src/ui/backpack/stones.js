import { state } from '../../state.js';
import { formatQuantity } from './utils.js';

export function renderStonesTab(area) {
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
