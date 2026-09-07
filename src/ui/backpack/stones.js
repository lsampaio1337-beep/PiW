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
        <div style="display: flex; flex-direction: column; width: 100%; height: 100%; --m-width: min(90vw, 825px);">
            <div style="display: grid; grid-template-columns: repeat(6, calc(var(--m-width) * 0.1305)); gap: calc(var(--m-width) * 0.018); justify-content: center; align-content: flex-start; width: 100%; padding: calc(var(--m-width) * 0.012); overflow-y: hidden; overflow-x: hidden;">
    `;

    for (const name of allStones) {
        // Fallback to 0 if they don't have it in inventory yet
        const qty = state.backpack.stones[name] || 0;

        let displayName = name.replace(' Stone', '<br>Stone');

        content += `
            <div style="background: #2c3e50; border: 2px solid #3498db; border-radius: 10px; padding: calc(var(--m-width) * 0.010); text-align: center; display: flex; flex-direction: column; align-items: center; justify-content: center; box-sizing: border-box;">
                <div style="font-size: calc(var(--m-width) * 0.015); font-weight: bold; margin-bottom: calc(var(--m-width) * 0.005); height: calc(var(--m-width) * 0.034); display: flex; align-items: center; justify-content: center; text-align: center; line-height: 1.1;">${displayName}</div>
                <img src="./Assets/Items/Stones/${name}.png" style="width: calc(var(--m-width) * 0.065); height: calc(var(--m-width) * 0.065); object-fit: contain; margin-bottom: calc(var(--m-width) * 0.005);" onerror="this.src='data:image/gif;base64,R0lGODlhAQABAAD/ACwAAAAAAQABAAACADs='">
                <div style="font-size: calc(var(--m-width) * 0.012); color: transparent; margin-bottom: calc(var(--m-width) * 0.005); line-height: 1.1; user-select: none;">-</div>
                <div style="font-size: calc(var(--m-width) * 0.015); font-weight: bold; color: #bdc3c7; line-height: 1.1;">Stock: ${formatQuantity(qty)}</div>
            </div>
        `;
    }

    content += `
            </div>
        </div>
    `;

    area.innerHTML = content;
}
