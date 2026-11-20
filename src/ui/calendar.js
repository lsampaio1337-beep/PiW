import { state } from '../state.js';
import { showModal } from '../ui.js';
import { updateMainControl } from './mainControl.js';
import { getDailyChallengesHtml, checkAnyDailyChallengeCompleted } from './dailyChallenges.js';
import { getCapacity, getCurrentCount } from '../mathEngine.js';

export { checkAnyDailyChallengeCompleted };


export function getRewardForDay(daysClaimed) {
    if (typeof daysClaimed !== 'number' || !Number.isInteger(daysClaimed) || daysClaimed < 0) {
        throw new Error('daysClaimed must be a non-negative integer');
    }

    const w = Math.floor(daysClaimed / 7) + 1;
    const d = daysClaimed + 1;
    const dayOfWeek = daysClaimed % 7; // 0 to 6 (Day 1 to Day 7)

    let reward = {};

    if (w === 1) {
        switch(dayOfWeek) {
            case 0: reward = { items: { "Pokeball": 10 }, potions: { "Tiny Potion": 10 } }; break;
            case 1: reward = { items: { "Pokeball": 20 }, potions: { "Small Potion": 10 } }; break;
            case 2: reward = { items: { "Greatball": 10 }, potions: { "Regular Potion": 10 } }; break;
            case 3: reward = { items: { "Greatball": 20 }, potions: { "Regular Potion": 20 } }; break;
            case 4: reward = { items: { "Ultraball": 10 }, potions: { "Big Potion": 5 } }; break;
            case 5: reward = { items: { "Ultraball": 20 }, potions: { "Big Potion": 10 } }; break;
            case 6: reward = { items: { "Masterball": 1 }, potions: { "Ultra Potion": 2 } }; break;
        }
    } else {
        // Week 2+
        if (dayOfWeek < 6) { // Days 1-6
            const ultraballs = 15 + 5 * (d - 7);
            const hyperPotions = 2 * (d - 7);
            reward = { items: { "Ultraball": ultraballs }, potions: { "Huge Potion": hyperPotions } };
        } else { // Day 7
            const masterballs = w;
            const ultraPotions = 2 * w;
            reward = { items: { "Masterball": masterballs }, potions: { "Ultra Potion": ultraPotions } };
        }
    }
    reward.tokens = 1;
    return reward;
}

export function getRewardListForWeek(weekNumber) {
    const list = [];
    const startDaysClaimed = (weekNumber - 1) * 7;
    for (let i = 0; i < 7; i++) {
        list.push(getRewardForDay(startDaysClaimed + i));
    }
    return list;
}



function getLocalDateString() {
    const now = new Date();
    // E.g. "2023-10-27"
    return now.getFullYear() + '-' + String(now.getMonth() + 1).padStart(2, '0') + '-' + String(now.getDate()).padStart(2, '0');
}

export function checkDailyRewardAvailable() {
    if (!state.stats.dailyRewards) {
        state.stats.dailyRewards = { daysClaimed: 0, lastClaimDate: null };
    }
    const today = getLocalDateString();
    return state.stats.dailyRewards.lastClaimDate !== today;
}

export function claimDailyReward(dayIndex) {
    if (!checkDailyRewardAvailable()) return;

    const dayOfWeek = state.stats.dailyRewards.daysClaimed % 7;

    if (dayIndex !== dayOfWeek) return; // Can only claim the current day

    const reward = getRewardForDay(state.stats.dailyRewards.daysClaimed);

    // Check capacity first
    let failBall = false;
    let failPotion = false;

    for (let ballName in reward.items) {
        let qty = reward.items[ballName];
        let currentBalls = getCurrentCount(state, 'balls');
        let maxBalls = getCapacity(state, 'balls');
        let spaceLeft = maxBalls - currentBalls;
        if (ballName === 'Masterball') spaceLeft = Infinity;

        if (qty > spaceLeft) {
            failBall = true;
        }
    }

    for (let potionName in reward.potions) {
        let qty = reward.potions[potionName];
        let currentPotions = getCurrentCount(state, 'potions');
        let maxPotions = getCapacity(state, 'potions');
        let spaceLeft = maxPotions - currentPotions;

        if (qty > spaceLeft) {
            failPotion = true;
        }
    }

    if (failBall || failPotion) {
        if (failBall && failPotion) {
            if (window.showGameAlert) window.showGameAlert("Can't collect Ball and Potion due to its maximum capacity", "window-calendar");
        } else if (failBall) {
            if (window.showGameAlert) window.showGameAlert("Can't collect Ball due to its maximum capacity", "window-calendar");
        } else if (failPotion) {
            if (window.showGameAlert) window.showGameAlert("Can't collect Potion due to its maximum capacity", "window-calendar");
        }
        return; // Abort entirely
    }

    // Grant items
    for (let ballName in reward.items) {
        let qty = reward.items[ballName];
        if (!state.backpack.pokeballs[ballName]) state.backpack.pokeballs[ballName] = 0;
        state.backpack.pokeballs[ballName] += qty;
    }

    for (let potionName in reward.potions) {
        let qty = reward.potions[potionName];
        if (!state.backpack.potions[potionName]) state.backpack.potions[potionName] = 0;
        state.backpack.potions[potionName] += qty;
    }

    if (reward.tokens) {
        if (!state.trainer.tokens) state.trainer.tokens = 0;
        state.trainer.tokens += reward.tokens;
        if (!state.stats.tokensEarned) state.stats.tokensEarned = 0;
        state.stats.tokensEarned += reward.tokens;
    }

    // Update state
    state.stats.dailyRewards.lastClaimDate = getLocalDateString();
    state.stats.dailyRewards.daysClaimed++;

    // Refresh UI
    updateMainControl();
    if (document.getElementById('window-calendar') && document.getElementById('window-calendar').offsetParent !== null) showCalendar();
}

// Make globally accessible for the inline onclick handler
window.claimDailyReward = claimDailyReward;

window.giveFreeTokens = function() {
    if (!state.trainer.tokens) state.trainer.tokens = 0;
    state.trainer.tokens += 10;
    if (window.showGameAlert) window.showGameAlert("Received 10 Tokens!");
    if (window.showCalendar && document.getElementById('window-calendar') && document.getElementById('window-calendar').offsetParent !== null) window.showCalendar('shop');
};

window.showCalendar = showCalendar;
export function showCalendar(tab = 'activities') {
    window.currentCalendarTab = tab;
    if (state.stats.dailyChallenges) {
        state.stats.dailyChallenges.hasSeenNotification = true;
    }
    if (typeof window.updateMainControl === 'function') {
        window.updateMainControl();
    }

    const hasClaimableReward = checkDailyRewardAvailable();
    const hasClaimableChallenge = checkAnyDailyChallengeCompleted();
    const showActivityDot = hasClaimableReward || hasClaimableChallenge;
    const tokenCount = state.trainer?.tokens || 0;

    let html = `<div class="cal-root">`;

    let titleHtml = `
        <div style="display: flex; flex-direction: column; align-items: center; gap: 6px; width: 100%;">
            <div style="font-weight: 700; font-size: 18px; color: white; letter-spacing: 0.3px;">Daily Calendar</div>
            <div class="piw-tab-bar" onmousedown="event.stopPropagation()">
                <button class="piw-tab-btn ${tab === 'activities' ? 'is-active' : ''}" onclick="window.showCalendar('activities')" style="display: inline-flex; align-items: center; gap: 6px;">
                    Activities${showActivityDot ? '<span style="width: 7px; height: 7px; border-radius: 50%; background: #2ecc71; display: inline-block;"></span>' : ''}
                </button>
                <button class="piw-tab-btn ${tab === 'shop' ? 'is-active' : ''}" onclick="window.showCalendar('shop')">Shop</button>
            </div>
        </div>
    `;

    html += `
        <div id="calendar-content-area" class="cal-content">
    `;

    if (tab === 'activities') {
        if (!state.stats.dailyRewards) {
            state.stats.dailyRewards = { daysClaimed: 0, lastClaimDate: null };
        }

        const isAvailable = checkDailyRewardAvailable();
        const daysClaimed = state.stats.dailyRewards.daysClaimed;
        const displayDaysClaimed = isAvailable ? daysClaimed : Math.max(0, daysClaimed - 1);

        const weekNumber = Math.floor(displayDaysClaimed / 7) + 1;
        const dayOfWeek = displayDaysClaimed % 7;

        const rewardList = getRewardListForWeek(weekNumber);

        html += `<div style="text-align: center; color: white; box-sizing: border-box;">`;
        html += `
            <div class="cal-section-header">
                <h2 class="cal-section-title">Daily Rewards</h2>
                <div style="display: flex; align-items: center; gap: 8px; flex-wrap: wrap;">
                    <span class="piw-badge is-amber" title="Available Tokens"><img src="Assets/Extra/Token.png" style="width: 14px; height: 14px;"> ${tokenCount.toLocaleString('en-US')} Tokens</span>
                    <span class="cal-week-pill">Week ${weekNumber} &bull; Day ${dayOfWeek + 1} of 7</span>
                </div>
            </div>
        `;
        html += `<div class="cal-rewards-grid">`;

    for (let i = 0; i < 7; i++) {
        const reward = rewardList[i];
        const isMilestone = i === 6;
        let cardClasses = 'cal-day-card';
        let onClickHtml = '';
        let statusBadge = '';

        if (i < dayOfWeek) {
            cardClasses += ' cal-day-card--claimed';
            statusBadge = `<div class="cal-badge cal-badge--claimed">&#10003; Claimed</div>`;
        } else if (i === dayOfWeek) {
            if (isAvailable) {
                cardClasses += ' cal-day-card--claimable';
                onClickHtml = `onclick="window.claimDailyReward(${i})"`;
                statusBadge = `<div class="cal-badge cal-badge--claim">Claim</div>`;
            } else {
                cardClasses += ' cal-day-card--claimed';
                statusBadge = `<div class="cal-badge cal-badge--claimed">&#10003; Claimed</div>`;
            }
        } else {
            cardClasses += ' cal-day-card--upcoming';
            if (isMilestone) {
                cardClasses += ' cal-day-card--milestone';
                statusBadge = `<div class="cal-badge cal-badge--milestone">Milestone</div>`;
            }
        }

        let itemsHtml = '';
        for (let ballName in reward.items) {
            let qty = reward.items[ballName];
            itemsHtml += `
                <div class="cal-item-row">
                    <img src="Assets/Items/Balls/${ballName}.png" title="${ballName}">
                    <span>x${qty}</span>
                </div>
            `;
        }
        for (let potionName in reward.potions) {
            let qty = reward.potions[potionName];
            itemsHtml += `
                <div class="cal-item-row">
                    <img src="Assets/Items/Potions/${potionName}.png" title="${potionName}">
                    <span>x${qty}</span>
                </div>
            `;
        }

        if (reward.tokens) {
            itemsHtml += `
                <div class="cal-item-row">
                    <img src="Assets/Extra/Token.png" title="Token">
                    <span>x${reward.tokens}</span>
                </div>
            `;
        }

        html += `
            <div class="${cardClasses}" ${onClickHtml}>
                <div class="cal-day-header">Day ${i + 1}</div>
                <div class="cal-day-items">
                    ${itemsHtml}
                </div>
                ${statusBadge || '<div class="cal-badge" style="visibility: hidden;">&nbsp;</div>'}
            </div>
        `;
    }

        html += `</div>`;

        // Inject Daily Challenges
        html += getDailyChallengesHtml();

        html += `</div>`;
    } else if (tab === 'shop') {
        html += window.renderTokenShopHtml ? window.renderTokenShopHtml() : '<div style="color: white; text-align: center;">Loading shop...</div>';
    }

    html += `</div></div>`;

    showModal(titleHtml, html, "window-calendar", "800px", "auto");

    // Auto adjust height when switching tabs
    setTimeout(() => {
        const win = document.getElementById('window-calendar');
        if (win) {
            if (typeof win.adjustHeightForNewContent === 'function') {
                win.adjustHeightForNewContent();
            } else if (window.windowManager) {
                window.windowManager.recalculateWindowSize('window-calendar');
            }
        }
    }, 50);
}
