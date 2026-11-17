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
    const stateClass = isPending ? 'is-pending' : 'is-claimed';
    const clickHandlers = isPending ? `onclick="window.claimPendingGift(${index})"` : '';
    const statusPill = isPending
        ? `<span class="gift-status-pill is-claim">Claim</span>`
        : `<span class="gift-status-pill is-done">Claimed</span>`;

    return `
        <div class="gift-card is-badge ${stateClass}" ${clickHandlers} title="${title}">
            <div class="gift-icon-wrap">
                <img class="gift-icon-img" src="./Assets/Gym/Badges/${window.getBadgeFileName(badgeRegion, badgeNum)}" alt="${title}">
            </div>
            <div class="gift-label">${title}</div>
            ${statusPill}
        </div>
    `;
}


function generateItemGiftHTML(gift, isPending, index) {
    let imgPath = gift.item.includes("Key") ? `Assets/Items/KeyItems/${gift.item.replace(/ /g, "_")}.png` : gift.item.includes("Potion") ? `Assets/Items/Potions/${gift.item}.png` : gift.item.includes("Stone") ? `Assets/Items/Stones/${gift.item}.png` : VITAMINS.includes(gift.item) ? `Assets/Items/Vitamins/${gift.item}.png` : `Assets/Items/Balls/${gift.item}.png`;

    const stateClass = isPending ? 'is-pending' : 'is-claimed';
    const clickHandlers = isPending ? `onclick="window.claimPendingGift(${index})"` : '';
    const statusPill = isPending
        ? `<span class="gift-status-pill is-claim">Claim</span>`
        : `<span class="gift-status-pill is-done">Claimed</span>`;

    return `
        <div class="gift-card is-item ${stateClass}" ${clickHandlers} title="${gift.item}">
            <div class="gift-icon-wrap">
                <img class="gift-icon-img" src="${imgPath}" alt="${gift.item}">
                ${gift.count > 1 ? `<span class="gift-qty-badge">x${gift.count}</span>` : ''}
            </div>
            <div class="gift-label">${gift.item}</div>
            ${statusPill}
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

    let html = `<div class="gift-section is-pending-section">`;
    html += `<div class="gift-section-header">`;
    html += `<h3 class="gift-section-title">Pending Gifts</h3>`;
    html += `<span class="gift-count-badge is-pending">${pending.length}</span>`;
    html += `</div>`;
    html += `<div class="gift-grid">`;

    pending.forEach((gift, index) => {
        html += generateGiftHTML(gift, true, index);
    });

    html += `</div></div>`;
    return html;
}

function generateClaimedGiftsHTML(claimed) {
    if (!claimed || claimed.length === 0) return '';

    let html = `<div class="gift-section">`;
    html += `<div class="gift-section-header">`;
    html += `<h3 class="gift-section-title">Collected Gifts</h3>`;
    html += `<span class="gift-count-badge">${claimed.length}</span>`;
    html += `</div>`;
    html += `<div class="gift-grid">`;

    claimed.forEach((gift) => {
        html += generateGiftHTML(gift, false);
    });

    html += `</div></div>`;
    return html;
}

export function showGiftModal() {
    let html = `<div class="gift-window-content">`;

    const pending = state.stats.pendingGifts || [];
    html += generatePendingGiftsHTML(pending);

    if (!state.stats.claimedGifts && state.trainer.badges > 0) {
        ensureClaimedGiftsHistory('badge');
    }

    const claimed = state.stats.claimedGifts || [];
    html += generateClaimedGiftsHTML(claimed);

    if (pending.length === 0 && claimed.length === 0) {
        html += `<div class="gift-empty-state">No gifts yet. Defeat Gym Leaders or complete Challenges to earn gifts!</div>`;
    }

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