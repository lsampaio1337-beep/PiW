import { state } from '../../state.js';
import { formatQuantity } from './utils.js';

export function renderPokeballsTab(area) {
    const isNoCaptureActive = state.settings.activeBallTier === -1;
    let content = `
        <div style="display: flex; flex-direction: column; width: 100%; gap: 10px;">
            <div style="text-align: center; color: #94a3b8; font-size: 13px; font-weight: 600;">Select a Pokéball to auto-use during battles.</div>
            <div class="backpack-item-grid">
                <div onclick="window.setActiveItem('ball', -1)"
                    class="backpack-item-card is-clickable ${isNoCaptureActive ? 'is-active' : ''}">
                    ${isNoCaptureActive ? `<span class="backpack-active-badge">Active</span>` : ''}
                    <div class="backpack-item-name">Not Capture</div>
                    <img src="./Assets/Extra/No.png" class="backpack-item-img" onerror="this.src='data:image/gif;base64,R0lGODlhAQABAAD/ACwAAAAAAQABAAACADs='">
                    <div class="backpack-item-attr">Disable Auto-Capture</div>
                    <div class="backpack-item-stock">-</div>
                </div>
    `;

    state.config.balance.items.pokeballs.forEach((b, idx) => {
        const qty = state.backpack.pokeballs[b.name] || 0;
        const isActive = state.settings.activeBallTier === idx;
        const attrLabel = b.name === 'Masterball' ? `Efficiency: 100%` : `Efficiency: ${b.multiplier}x`;

        content += `
            <div onclick="window.setActiveItem('ball', ${idx})"
                class="backpack-item-card is-clickable ${isActive ? 'is-active' : ''}">
                ${isActive ? `<span class="backpack-active-badge">Active</span>` : ''}
                <div class="backpack-item-name">${b.name}</div>
                <img src="./Assets/Items/Balls/${b.name}.png" class="backpack-item-img" onerror="this.src='data:image/gif;base64,R0lGODlhAQABAAD/ACwAAAAAAQABAAACADs='">
                <div class="backpack-item-attr">${attrLabel}</div>
                <div class="backpack-item-stock">Stock: ${formatQuantity(qty)}</div>
            </div>
        `;
    });
    content += `
            </div>
        </div>
    `;

    const doc = new DOMParser().parseFromString(content, 'text/html');
    area.replaceChildren(...doc.body.childNodes);
}
