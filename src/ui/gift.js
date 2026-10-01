import { VITAMINS } from "../constants.js";
import { state } from '../state.js';
import { updateUI } from '../ui.js';
import { showModal } from '../ui.js';
import { getCapacity, getCurrentCount } from '../mathEngine.js';

window.claimPendingGift = function(index) {
    if (!state.stats.pendingGifts || index < 0 || index >= state.stats.pendingGifts.length) return;

    const gift = state.stats.pendingGifts[index];

    if (gift.type === 'item') {
        if (!state.backpack) state.backpack = {};
        let qty = gift.count || 1;

        let isBall = gift.item.includes('ball') || gift.item.includes('Ball');
        let isPotion = gift.item.includes('Potion');

        if (isBall && gift.item !== 'Masterball') {
            let currentBalls = getCurrentCount(state, 'balls');
            let maxBalls = getCapacity(state, 'balls');
            let spaceLeft = maxBalls - currentBalls;
            if (qty > spaceLeft) {
                qty = Math.max(0, spaceLeft);
                if (window.showGameAlert) window.showGameAlert("Can't collect Ball due to its maximum capacity", "window-gifts");
            }
        } else if (isPotion) {
            let currentPotions = getCurrentCount(state, 'potions');
            let maxPotions = getCapacity(state, 'potions');
            let spaceLeft = maxPotions - currentPotions;
            if (qty > spaceLeft) {
                qty = Math.max(0, spaceLeft);
                if (window.showGameAlert) window.showGameAlert("Can't collect Potion due to its maximum capacity", "window-gifts");
            }
        }

        if (qty > 0) {
            if (!state.backpack[gift.item]) state.backpack[gift.item] = 0;
            state.backpack[gift.item] += qty;
        }
    } else if (gift.type === 'badge') {
        state.trainer.badges++;
    }

    if (!state.stats.claimedGifts) {
        state.stats.claimedGifts = [];
        // For backwards compatibility, populate existing badges
        for (let i = 0; i < state.trainer.badges - (gift.type === 'badge' ? 1 : 0); i++) {
            state.stats.claimedGifts.push({ type: 'badge', gymIndex: i });
        }
    }
    state.stats.claimedGifts.push(gift);

    state.stats.pendingGifts.splice(index, 1);

    showGiftModal(); // refresh modal
    updateUI();
    const win = document.getElementById("window-gifts");
    if (win && win.adjustHeightForNewContent) {
        win.adjustHeightForNewContent();
    }
};

export function showGiftModal() {
    let html = `<div style="text-align: center; padding: 2%; box-sizing: border-box;">`;

    // Check pending gifts
    const pending = state.stats.pendingGifts || [];
    if (pending.length > 0) {
        html += `<h3 style="margin-top: 0; margin-bottom: 10px;">Pending Gifts</h3>`;
        html += `<div style="display: flex; flex-wrap: wrap; justify-content: center; gap: 10px; margin-bottom: 20px;">`;

        pending.forEach((gift, index) => {
            if (gift.type === 'badge') {
                const badgeNum = gift.gymIndex + 1;
                html += `
                    <div onclick="window.claimPendingGift(${index})" style="cursor: pointer; padding: 10px; border: 1px solid #ccc; border-radius: 5px; background: rgba(0,0,0,0.5); transition: background 0.2s;" onmouseover="this.style.background='rgba(255,255,255,0.2)'" onmouseout="this.style.background='rgba(0,0,0,0.5)'">
                        <img src="./Assets/Badges/Badge Kanto ${badgeNum}.png" style="width: 50px; height: 50px;" title="${gift.gymName} Badge">
                    </div>
                `;
            } else if (gift.type === 'item') {
                let imgPath = gift.item.includes('Potion') ? `Assets/Items/Potions/${gift.item}.png` :
                              gift.item.includes('Stone') ? `Assets/Items/Stones/${gift.item}.png` :
                              VITAMINS.includes(gift.item) ? `Assets/Items/Vitamins/${gift.item}.png` :
                              `Assets/Items/Balls/${gift.item}.png`;
                html += `
                    <div onclick="window.claimPendingGift(${index})" style="cursor: pointer; padding: 10px; border: 1px solid #ccc; border-radius: 5px; background: rgba(0,0,0,0.5); transition: background 0.2s;" onmouseover="this.style.background='rgba(255,255,255,0.2)'" onmouseout="this.style.background='rgba(0,0,0,0.5)'">
                        <div style="position: relative; display: inline-block;">
                            <img src="${imgPath}" style="width: 50px; height: 50px;" title="${gift.item}">
                            ${gift.count > 1 ? `<span style="position: absolute; bottom: -5px; right: -5px; background: rgba(0,0,0,0.8); color: white; padding: 2px 5px; border-radius: 10px; font-size: 12px; font-weight: bold;">x${gift.count}</span>` : ''}
                        </div>
                    </div>
                `;
            }
        });

        html += `</div>`;
    }

    // Backwards compatibility for collected gifts
    if (!state.stats.claimedGifts && state.trainer.badges > 0) {
        state.stats.claimedGifts = [];
        for (let i = 0; i < state.trainer.badges; i++) {
            state.stats.claimedGifts.push({ type: 'badge', gymIndex: i });
        }
    }

    // Check collected gifts (items and badges)
    const claimed = state.stats.claimedGifts || [];
    if (claimed.length > 0) {
        if (pending.length > 0) {
            html += `<hr style="border: 1px solid #444; margin: 20px 0;">`;
        }
        html += `<h3 style="margin-top: 0; margin-bottom: 10px;">Collected Gifts</h3>`;
        html += `<div style="display: flex; flex-wrap: wrap; justify-content: center; gap: 10px;">`;

        claimed.forEach((gift) => {
            if (gift.type === 'badge') {
                const badgeNum = gift.gymIndex + 1;
                html += `
                    <div style="padding: 10px; border: 1px solid #444; border-radius: 5px; background: rgba(0,0,0,0.2);">
                        <img src="./Assets/Badges/Badge Kanto ${badgeNum}.png" style="width: 50px; height: 50px; filter: drop-shadow(0 0 5px gold);" title="${gift.gymName ? gift.gymName + ' Badge' : 'Badge'}">
                    </div>
                `;
            } else if (gift.type === 'item') {
                let imgPath = gift.item.includes('Potion') ? `Assets/Items/Potions/${gift.item}.png` :
                              gift.item.includes('Stone') ? `Assets/Items/Stones/${gift.item}.png` :
                              VITAMINS.includes(gift.item) ? `Assets/Items/Vitamins/${gift.item}.png` :
                              `Assets/Items/Balls/${gift.item}.png`;
                html += `
                    <div style="padding: 10px; border: 1px solid #444; border-radius: 5px; background: rgba(0,0,0,0.2);">
                        <div style="position: relative; display: inline-block;">
                            <img src="${imgPath}" style="width: 50px; height: 50px;" title="${gift.item}">
                            ${gift.count > 1 ? `<span style="position: absolute; bottom: -5px; right: -5px; background: rgba(0,0,0,0.8); color: white; padding: 2px 5px; border-radius: 10px; font-size: 12px; font-weight: bold;">x${gift.count}</span>` : ''}
                        </div>
                    </div>
                `;
            }
        });

        html += `</div>`;
    }

    html += `</div>`;

    showModal("Gifts", html, "window-gifts");
    const win = document.getElementById("window-gifts");
    if (win) {
        win.style.maxHeight = '800px';
    }
    if (window.windowManager) window.windowManager.recalculateWindowSize('window-gifts');
}
