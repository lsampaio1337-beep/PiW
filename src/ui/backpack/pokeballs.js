import { state } from '../../state.js';
import { formatQuantity } from './utils.js';

export function renderPokeballsTab(area) {
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
                    <img src="./Assets/Items/Balls/${b.name}.png" style="max-width: 100%; max-height: 100%; object-fit: contain;" onerror="this.src='data:image/gif;base64,R0lGODlhAQABAAD/ACwAAAAAAQABAAACADs='">
                </div>
                <div style="font-size: 12px; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; margin-top: 2px;">${b.name}</div>
                <div style="font-size: 12px;"><b>x${formatQuantity(qty)}</b></div>
            </div>
        `;
    });
    content += '</div>';

    area.innerHTML = content;
}
