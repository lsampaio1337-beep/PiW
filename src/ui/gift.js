import { VITAMINS } from "../constants.js";
import { state } from '../state.js';
import { updateUI, showModal } from '../ui.js';
import { getCapacity, getCurrentCount } from '../mathEngine.js';

function claimItemGift(gift) {
    if (!state.backpack) state.backpack = {};
    let qty = gift.count || 1;

    let isBall = gift.item.includes('ball') || gift.item.includes('Ball');
    let isPotion = gift.item.includes('Potion') || gift.item === 'Big';

    if (isBall && gift.item !== 'Masterball') {
        let currentBalls = getCurrentCount(state, 'balls');
        let maxBalls = getCapacity(state, 'balls');
        let spaceLeft = maxBalls - currentBalls;
        if (qty > spaceLeft) {
            if (window.showGameAlert) window.showGameAlert("Can't collect Ball due to its maximum capacity", "window-gifts");
            return false;
        }
    } else if (isPotion) {
        let currentPotions = getCurrentCount(state, 'potions');
        let maxPotions = getCapacity(state, 'potions');
        let spaceLeft = maxPotions - currentPotions;
        if (qty > spaceLeft) {
            if (window.showGameAlert) window.showGameAlert("Can't collect Potion due to its maximum capacity", "window-gifts");
            return false;
        }
    }

    if (isBall) {
        if (!state.backpack.pokeballs) state.backpack.pokeballs = {};
        if (!state.backpack.pokeballs[gift.item]) state.backpack.pokeballs[gift.item] = 0;
        state.backpack.pokeballs[gift.item] += qty;
    } else if (isPotion) {
        const potName = gift.item === 'Big' ? 'Big Potion' : gift.item;
        if (!state.backpack.potions) state.backpack.potions = {};
        if (!state.backpack.potions[potName]) state.backpack.potions[potName] = 0;
        state.backpack.potions[potName] += qty;
    } else if (gift.item.includes('Stone') || VITAMINS.includes(gift.item)) {
        if (!state.backpack.stones) state.backpack.stones = {};
        if (!state.backpack.stones[gift.item]) state.backpack.stones[gift.item] = 0;
        state.backpack.stones[gift.item] += qty;
    } else {
        if (!state.backpack.stones) state.backpack.stones = {};
        if (!state.backpack.stones[gift.item]) state.backpack.stones[gift.item] = 0;
        state.backpack.stones[gift.item] += qty;
    }
    return true;
}

function claimBadgeGift() {
    state.trainer.badges++;
}

function ensureClaimedGiftsHistory(giftType) {
    if (!state.stats.claimedGifts) {
        state.stats.claimedGifts = [];
        // For backwards compatibility, populate existing badges
        for (let i = 0; i < state.trainer.badges - (giftType === 'badge' ? 1 : 0); i++) {
            let gymIndex = i;
            if (state.currentRegionName === 'Johto') {
                gymIndex = (i < 8) ? i + 9 : i - 8;
            }
            state.stats.claimedGifts.push({ type: 'badge', gymIndex: gymIndex });
        }
    }
}

window.claimPendingGift = function(index) {
    if (!state.stats.pendingGifts || index < 0 || index >= state.stats.pendingGifts.length) return;

    const gift = state.stats.pendingGifts[index];

    if (gift.type === 'item') {
        const success = claimItemGift(gift);
        if (!success) return;
    } else if (gift.type === 'badge') {
        claimBadgeGift();
    }

    ensureClaimedGiftsHistory(gift.type);
    state.stats.claimedGifts.push(gift);

    state.stats.pendingGifts.splice(index, 1);

    showGiftModal(); // refresh modal
    updateUI();
    const win = document.getElementById("window-gifts");
    if (win && win.adjustHeightForNewContent) {
        win.adjustHeightForNewContent();
    }
};


function generateBadgeGiftHTML(gift, isPending, index) {
    let badgeRegion = state.currentRegionName || 'Kanto';
    let badgeNum = gift.gymIndex + 1;
    if (typeof window.getGlobalBadgeInfo === 'function') {
        const info = window.getGlobalBadgeInfo(gift.gymIndex);
        if (info) {
            badgeRegion = info.region || info.badgeRegion || badgeRegion;
            badgeNum = info.number ?? info.badgeNum ?? info.badgeNumber ?? badgeNum;
        }
    } else if (state.currentRegionName === 'Johto') {
        if (gift.gymIndex > 8) {
            badgeRegion = 'Johto';
            badgeNum = gift.gymIndex - 8;
        } else {
            badgeRegion = 'Kanto';
            badgeNum = gift.gymIndex + 1;
        }
    }

    const title = gift.gymName ? gift.gymName + ' Badge' : 'Badge';

    let wrapperStyle = isPending
        ? `cursor: pointer; padding: 10px; border: 1px solid #ccc; border-radius: 5px; background: rgba(0,0,0,0.5); transition: background 0.2s;`
        : `padding: 10px; border: 1px solid #444; border-radius: 5px; background: rgba(0,0,0,0.2);`;

    let imgStyle = isPending
        ? `width: 50px; height: 50px;`
        : `width: 50px; height: 50px; filter: drop-shadow(0 0 5px gold);`;

    let clickHandlers = isPending
        ? `onclick="window.claimPendingGift(${index})" onmouseover="this.style.background='rgba(255,255,255,0.2)'" onmouseout="this.style.background='rgba(0,0,0,0.5)'"`
        : "";

    return `
        <div ${clickHandlers} style="${wrapperStyle}">
            <img src="./Assets/Gym/Badges/${window.getBadgeFileName(badgeRegion, badgeNum)}" style="${imgStyle}" title="${title}">
        </div>
    `;
}


function generateItemGiftHTML(gift, isPending, index) {
    let imgPath = gift.item.includes("Key") ? `Assets/Items/KeyItems/${gift.item.replace(/ /g, "_")}.png` : gift.item.includes("Potion") ? `Assets/Items/Potions/${gift.item}.png` : gift.item.includes("Stone") ? `Assets/Items/Stones/${gift.item}.png` : VITAMINS.includes(gift.item) ? `Assets/Items/Vitamins/${gift.item}.png` : `Assets/Items/Balls/${gift.item}.png`;

    let wrapperStyle = isPending
        ? `cursor: pointer; padding: 10px; border: 1px solid #ccc; border-radius: 5px; background: rgba(0,0,0,0.5); transition: background 0.2s;`
        : `padding: 10px; border: 1px solid #444; border-radius: 5px; background: rgba(0,0,0,0.2);`;

    let clickHandlers = isPending
        ? `onclick="window.claimPendingGift(${index})" onmouseover="this.style.background='rgba(255,255,255,0.2)'" onmouseout="this.style.background='rgba(0,0,0,0.5)'"`
        : "";

    return `
        <div ${clickHandlers} style="${wrapperStyle}">
            <div style="position: relative; display: inline-block;">
                <img src="${imgPath}" style="width: 50px; height: 50px;" title="${gift.item}">
                ${gift.count > 1 ? `<span style="position: absolute; bottom: -5px; right: -5px; background: rgba(0,0,0,0.8); color: white; padding: 2px 5px; border-radius: 10px; font-size: 12px; font-weight: bold;">x${gift.count}</span>` : ''}
            </div>
        </div>
    `;
}


function generateGiftHTML(gift, isPending, index = -1) {
    if (gift.type === 'badge') {
        return generateBadgeGiftHTML(gift, isPending, index);
    } else if (gift.type === 'item') {
        return generateItemGiftHTML(gift, isPending, index);
    }
    return '';
}

function generatePendingGiftsHTML(pending) {
    if (!pending || pending.length === 0) return '';

    let html = `<h3 style="margin-top: 0; margin-bottom: 10px;">Pending Gifts</h3>`;
    html += `<div style="display: flex; flex-wrap: wrap; justify-content: center; gap: 10px; margin-bottom: 20px;">`;

    pending.forEach((gift, index) => {
        html += generateGiftHTML(gift, true, index);
    });

    html += `</div>`;
    return html;
}

function generateClaimedGiftsHTML(claimed, hasPending) {
    if (!claimed || claimed.length === 0) return '';

    let html = '';
    if (hasPending) {
        html += `<hr style="border: 1px solid #444; margin: 20px 0;">`;
    }

    html += `<h3 style="margin-top: 0; margin-bottom: 10px;">Collected Gifts</h3>`;
    html += `<div style="display: flex; flex-wrap: wrap; justify-content: center; gap: 10px;">`;

    claimed.forEach((gift) => {
        html += generateGiftHTML(gift, false);
    });

    html += `</div>`;
    return html;
}

export function showGiftModal() {
    let html = `<div style="text-align: center; padding: 2%; box-sizing: border-box;">`;

    const pending = state.stats.pendingGifts || [];
    html += generatePendingGiftsHTML(pending);

    if (!state.stats.claimedGifts && state.trainer.badges > 0) {
        ensureClaimedGiftsHistory('badge');
    }

    const claimed = state.stats.claimedGifts || [];
    html += generateClaimedGiftsHTML(claimed, pending.length > 0);

    html += `</div>`;

    showModal("Gifts", html, "window-gifts");

    const win = document.getElementById("window-gifts");
    if (win && win.adjustHeightForNewContent) {
        setTimeout(() => {
            win.adjustHeightForNewContent();
        }, 50);
    }
}

window.showGiftModal = showGiftModal;