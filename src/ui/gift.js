import { state } from '../state.js';
import { updateUI } from '../ui.js';
import { showModal } from '../ui.js';

window.claimPendingGift = function(index) {
    if (!state.stats.pendingGifts || index < 0 || index >= state.stats.pendingGifts.length) return;

    const gift = state.stats.pendingGifts[index];

    if (gift.type === 'badge') {
        state.trainer.badges++;
    }

    state.stats.pendingGifts.splice(index, 1);

    showGiftModal(); // refresh modal
    updateUI();
};

export function showGiftModal() {
    let html = \`<div style="text-align: center;">\`;

    // Check pending gifts
    const pending = state.stats.pendingGifts || [];
    if (pending.length > 0) {
        html += \`<h3 style="margin-bottom: 10px;">Pending Gifts</h3>\`;
        html += \`<div style="display: flex; flex-wrap: wrap; justify-content: center; gap: 10px; margin-bottom: 20px;">\`;

        pending.forEach((gift, index) => {
            if (gift.type === 'badge') {
                const badgeNum = gift.gymIndex + 1;
                html += \`
                    <div onclick="window.claimPendingGift(\${index})" style="cursor: pointer; padding: 10px; border: 1px solid #ccc; border-radius: 5px; background: rgba(0,0,0,0.5); transition: background 0.2s;" onmouseover="this.style.background='rgba(255,255,255,0.2)'" onmouseout="this.style.background='rgba(0,0,0,0.5)'">
                        <img src="./Assets/Badges/Badge Kanto \${badgeNum}.png" style="width: 50px; height: 50px;" title="\${gift.gymName} Badge">
                    </div>
                \`;
            }
        });

        html += \`</div>\`;
    } else {
        html += \`<h3 style="margin-bottom: 10px; color: #aaa;">No Pending Gifts</h3>\`;
    }

    // Check collected gifts (badges)
    const collectedBadges = state.trainer.badges || 0;
    if (collectedBadges > 0) {
        html += \`<hr style="border: 1px solid #444; margin: 20px 0;">\`;
        html += \`<h3 style="margin-bottom: 10px;">Collected Gifts</h3>\`;
        html += \`<div style="display: flex; flex-wrap: wrap; justify-content: center; gap: 10px;">\`;

        for (let i = 0; i < collectedBadges; i++) {
            const badgeNum = i + 1;
            html += \`
                <div style="padding: 10px; border: 1px solid #444; border-radius: 5px; background: rgba(0,0,0,0.2);">
                    <img src="./Assets/Badges/Badge Kanto \${badgeNum}.png" style="width: 50px; height: 50px; filter: drop-shadow(0 0 5px gold);">
                </div>
            \`;
        }

        html += \`</div>\`;
    }

    html += \`</div>\`;

    showModal("Gifts", html);
}
