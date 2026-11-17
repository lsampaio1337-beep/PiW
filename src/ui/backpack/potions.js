import { state } from '../../state.js';
import { formatQuantity } from './utils.js';

export function renderPotionsTab(area) {
    let content = `
        <div style="display: flex; flex-direction: column; width: 100%; gap: 12px;">
            <div style="text-align: center; color: #94a3b8; font-size: 13px; font-weight: 600;">Select a Potion to auto-use during battles.</div>

            <div style="width: min(460px, 90%); margin: 0 auto; padding: 10px 14px; background: rgba(23, 33, 45, 0.72); border: 1px solid rgba(255,255,255,0.08); border-radius: 10px; display: flex; flex-direction: column; align-items: center; justify-content: center;">
                <label style="color: #e2e8f0; font-size: 13px; font-weight: 600; margin-bottom: 10px;">
                    Auto-Heal Threshold: <span id="potion-threshold-val" style="color: #4ade80;">${state.settings.autoPotionThreshold}%</span>
                </label>
                <div style="position: relative; width: 100%;">
                    <input type="range" min="1" max="100" value="${state.settings.autoPotionThreshold}" id="potion-threshold-slider"
                        oninput="window.setAutoPotionThreshold(this.value)"
                        style="width: 100%; cursor: pointer; position: relative; z-index: 2; background: transparent; accent-color: #2ecc71;"
                    >
                    <!-- Background bar to show locked zone -->
                    <div style="position: absolute; top: 50%; left: 0; width: 100%; height: 6px; transform: translateY(-50%); background: #334155; border-radius: 3px; z-index: 1; pointer-events: none;">
                        <div style="position: absolute; top: 0; left: 90%; width: 10%; height: 100%; background: #e74c3c; border-radius: 0 3px 3px 0;"></div>
                    </div>
                    <!-- 90% Marker Ball -->
                    <div style="position: absolute; top: 50%; left: 90%; transform: translate(-50%, -50%); width: 14px; height: 14px; background: #e74c3c; border-radius: 50%; z-index: 3; pointer-events: none; box-shadow: 0 0 2px rgba(0,0,0,0.5);"></div>
                </div>
            </div>

            <div class="backpack-item-grid">
    `;

    const potions = state.config.balance.items.potions;

    for (let idx = 0; idx < potions.length; idx++) {
        let p = potions[idx];
        if (p.name === 'Max Potion') continue;
        const rawName = p.name;
        const potName = rawName === 'Big' ? 'Big Potion' : rawName;

        let displayName = potName.replace(' Potion', '<br>Potion');

        const qty = state.backpack.potions[potName] || 0;
        const isActive = state.settings.activePotionTier === idx;
        const healAmt = p.heal;
        const attrLabel = `Heal: ${healAmt >= 999999 ? '100%' : healAmt + ' HP'}`;

        content += `
            <div onclick="window.setActiveItem('potion', ${idx})"
                class="backpack-item-card is-clickable ${isActive ? 'is-active' : ''}">
                ${isActive ? `<span class="backpack-active-badge">Active</span>` : ''}
                <div class="backpack-item-name">${displayName}</div>
                <img src="./Assets/Items/Potions/${potName}.png" class="backpack-item-img" onerror="this.src='data:image/gif;base64,R0lGODlhAQABAAD/ACwAAAAAAQABAAACADs='">
                <div class="backpack-item-attr">${attrLabel}</div>
                <div class="backpack-item-stock">Stock: ${formatQuantity(qty)}</div>
            </div>
        `;
    }

    content += `
            </div>
        </div>
    `;

    const doc = new DOMParser().parseFromString(content, 'text/html');
    area.replaceChildren(...doc.body.childNodes);
}
