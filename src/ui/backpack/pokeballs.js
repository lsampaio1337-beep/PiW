import { state } from '../../state.js';
import { getCapacity, getCurrentCount } from '../../mathEngine.js';
import { formatQuantity } from './utils.js';

export function renderPokeballsTab(area) {
    const isNoCaptureActive = state.settings.activeBallTier === -1;
    const used = getCurrentCount(state, 'balls');
    const cap = getCapacity(state, 'balls');
    const capPct = cap > 0 ? Math.min(100, Math.round((used / cap) * 100)) : 0;
    const isFull = used >= cap;
    let content = `
        <div style="display: flex; flex-direction: column; width: 100%; gap: 10px;">
            <div class="bp-capacity-banner">
                <div style="display: flex; align-items: center; gap: 8px;">
                    <span style="font-size: 12.5px; font-weight: 700; color: var(--piw-text-primary);">Ball Pocket</span>
                    <span class="piw-badge ${isFull ? 'is-red' : 'is-blue'}">${used.toLocaleString('en-US')} / ${cap.toLocaleString('en-US')}</span>
                </div>
                <div class="piw-progress-track" style="flex: 1; max-width: 240px; height: 8px;">
                    <div class="piw-progress-fill ${isFull ? 'is-amber' : ''}" style="width: ${capPct}%;"></div>
                </div>
                <span style="color: var(--piw-text-muted); font-size: 11.5px; font-weight: 600;">Click a ball to auto-use</span>
            </div>
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
