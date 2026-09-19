import { state } from '../../state.js';
import { formatQuantity } from './utils.js';

export function renderPokeballsTab(area) {
    let content = `
        <div style="display: flex; flex-direction: column; width: 100%; height: 100%; container-type: inline-size;">
            <h3 style="text-align: center; margin-top: 0; color: #ddd; font-size: 2.5cqi;">Select Ball to auto use during battles.</h3>
            <div style="display: flex; flex-wrap: wrap; gap: 1.5cqi; justify-content: center; align-content: flex-start; overflow-y: auto; flex: 1; padding: 1.2cqi; box-sizing: border-box;">
    `;

    state.config.balance.items.pokeballs.forEach((b, idx) => {
        const qty = state.backpack.pokeballs[b.name] || 0;
        const isActive = state.settings.activeBallTier === idx;
        const borderColor = isActive ? '#2ecc71' : '#3498db';
        const attrLabel = b.name === 'Masterball' ? `Efficiency: 100%` : `Efficiency: ${b.multiplier}x`;

        content += `
            <div onclick="window.setActiveItem('ball', ${idx})"
                style="background: #2c3e50; border: 2px solid ${borderColor}; border-radius: 10px; padding: 1cqi; text-align: center; cursor: pointer; transition: transform 0.2s; display: flex; flex-direction: column; align-items: center; justify-content: center; width: 14.5cqi; box-sizing: border-box;">
                <div style="font-size: 1.6cqi; font-weight: bold; margin-bottom: 0.5cqi; height: 3.5cqi; display: flex; align-items: center; justify-content: center; text-align: center; line-height: 1.1;">${b.name}</div>
                <img src="./Assets/Items/Balls/${b.name}.png" style="width: 7cqi; height: 7cqi; object-fit: contain; margin-bottom: 0.5cqi;" onerror="this.src='data:image/gif;base64,R0lGODlhAQABAAD/ACwAAAAAAQABAAACADs='">
                <div style="font-size: 1.4cqi; color: #f1c40f; margin-bottom: 0.5cqi; line-height: 1.1;">${attrLabel}</div>
                <div style="font-size: 1.6cqi; font-weight: bold; color: #bdc3c7; line-height: 1.1;">Stock: ${formatQuantity(qty)}</div>
            </div>
        `;
    });
    content += `
            </div>
        </div>
    `;

    area.innerHTML = content;
}
