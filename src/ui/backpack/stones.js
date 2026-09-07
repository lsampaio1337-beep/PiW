import { state } from '../../state.js';
import { formatQuantity } from './utils.js';

export function renderStonesTab(area) {
    // 18 stones list hardcoded alphabetically to match the 6x3 grid request precisely
    const allStones = [
        "Bug Stone", "Dark Stone", "Dragon Stone", "Electric Stone", "Fairy Stone", "Fighting Stone",
        "Fire Stone", "Flying Stone", "Ghost Stone", "Grass Stone", "Ground Stone", "Ice Stone",
        "Normal Stone", "Poison Stone", "Psychic Stone", "Rock Stone", "Steel Stone", "Water Stone"
    ];

    let content = `
        <div style="display: flex; flex-direction: column; width: 100%; height: 100%; container-type: inline-size;">
            <div style="display: grid; grid-template-columns: repeat(6, 14.5cqi); gap: 1.5cqi; justify-content: center; align-content: flex-start; width: 100%; padding: 1.2cqi; overflow-y: hidden; overflow-x: hidden; box-sizing: border-box;">
    `;

    for (const name of allStones) {
        // Fallback to 0 if they don't have it in inventory yet
        const qty = state.backpack.stones[name] || 0;

        let displayName = name.replace(' Stone', '<br>Stone');

        content += `
            <div style="background: #2c3e50; border: 2px solid #3498db; border-radius: 10px; padding: 1cqi; text-align: center; display: flex; flex-direction: column; align-items: center; justify-content: center; box-sizing: border-box;">
                <div style="font-size: 1.6cqi; font-weight: bold; margin-bottom: 0.5cqi; height: 3.5cqi; display: flex; align-items: center; justify-content: center; text-align: center; line-height: 1.1;">${displayName}</div>
                <img src="./Assets/Items/Stones/${name}.png" style="width: 7cqi; height: 7cqi; object-fit: contain; margin-bottom: 0.5cqi;" onerror="this.src='data:image/gif;base64,R0lGODlhAQABAAD/ACwAAAAAAQABAAACADs='">
                <div style="font-size: 1.3cqi; color: transparent; margin-bottom: 0.5cqi; line-height: 1.1; user-select: none;">-</div>
                <div style="font-size: 1.6cqi; font-weight: bold; color: #bdc3c7; line-height: 1.1;">Stock: ${formatQuantity(qty)}</div>
            </div>
        `;
    }

    content += `
            </div>
        </div>
    `;

    area.innerHTML = content;
}
