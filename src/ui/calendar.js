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

    if (!document.getElementById('calendar-styles')) {
        const styleEl = document.createElement('style');
        styleEl.id = 'calendar-styles';
        styleEl.textContent = `
            #window-calendar .cal-root {
                display: flex;
                flex-direction: column;
                width: 100%;
                height: 100%;
                box-sizing: border-box;
                color: #f1f5f9;
            }
            #window-calendar .cal-content {
                flex: 1;
                overflow-y: auto;
                padding: 14px 18px 18px;
                box-sizing: border-box;
            }
            #window-calendar .cal-section-header {
                display: flex;
                align-items: center;
                justify-content: space-between;
                margin-bottom: 12px;
                border-bottom: 1px solid rgba(255, 255, 255, 0.35);
                padding-bottom: 5px;
            }
            #window-calendar .cal-section-title {
                margin: 0;
                font-size: 18px;
                font-weight: bold;
                color: #ffffff;
            }
            #window-calendar .cal-week-pill {
                background: rgba(52, 152, 219, 0.2);
                border: 1px solid rgba(52, 152, 219, 0.45);
                color: #7dd3fc;
                font-size: 12px;
                font-weight: 600;
                padding: 3px 10px;
                border-radius: 999px;
            }
            #window-calendar .cal-rewards-grid {
                display: grid;
                grid-template-columns: repeat(7, 1fr);
                gap: 8px;
                width: 100%;
                margin-bottom: 6px;
            }
            #window-calendar .cal-day-card {
                position: relative;
                border: 1px solid rgba(255, 255, 255, 0.12);
                border-radius: 10px;
                padding: 10px 6px;
                background: rgba(15, 23, 42, 0.65);
                display: flex;
                flex-direction: column;
                align-items: center;
                justify-content: space-between;
                min-height: 124px;
                transition: transform 0.15s ease, box-shadow 0.15s ease, border-color 0.15s ease;
                box-sizing: border-box;
            }
            #window-calendar .cal-day-card--upcoming:hover {
                transform: translateY(-2px);
                border-color: rgba(52, 152, 219, 0.5);
            }
            #window-calendar .cal-day-card--claimed {
                background: rgba(15, 23, 42, 0.35);
                border-color: rgba(255, 255, 255, 0.06);
                opacity: 0.68;
            }
            #window-calendar .cal-day-card--claimable {
                border: 1.5px solid #2ecc71;
                background: linear-gradient(180deg, rgba(46, 204, 113, 0.22) 0%, rgba(15, 23, 42, 0.85) 100%);
                box-shadow: 0 0 14px rgba(46, 204, 113, 0.35);
                cursor: pointer;
            }
            #window-calendar .cal-day-card--claimable:hover {
                transform: translateY(-3px);
                box-shadow: 0 4px 18px rgba(46, 204, 113, 0.5);
            }
            #window-calendar .cal-day-card--milestone {
                border-color: rgba(241, 196, 15, 0.55);
                background: linear-gradient(180deg, rgba(241, 196, 15, 0.14) 0%, rgba(15, 23, 42, 0.78) 100%);
            }
            #window-calendar .cal-day-header {
                font-weight: 700;
                font-size: 12px;
                text-transform: uppercase;
                letter-spacing: 0.5px;
                color: #cbd5e1;
                margin-bottom: 8px;
            }
            #window-calendar .cal-day-card--claimable .cal-day-header {
                color: #6ee7b7;
            }
            #window-calendar .cal-day-card--milestone .cal-day-header {
                color: #fde047;
            }
            #window-calendar .cal-day-items {
                flex-grow: 1;
                display: flex;
                flex-direction: column;
                justify-content: center;
                gap: 5px;
                width: 100%;
            }
            #window-calendar .cal-item-row {
                display: flex;
                align-items: center;
                justify-content: center;
                gap: 5px;
                font-size: 13px;
                font-weight: 600;
                color: #f8fafc;
            }
            #window-calendar .cal-item-row img {
                width: 22px;
                height: 22px;
                filter: drop-shadow(0 1px 2px rgba(0,0,0,0.5));
            }
            #window-calendar .cal-badge {
                margin-top: 8px;
                font-size: 10px;
                font-weight: 700;
                text-transform: uppercase;
                letter-spacing: 0.5px;
                padding: 2px 8px;
                border-radius: 999px;
            }
            #window-calendar .cal-badge--claim {
                background: #2ecc71;
                color: #052e16;
                box-shadow: 0 2px 6px rgba(46, 204, 113, 0.4);
            }
            #window-calendar .cal-badge--claimed {
                background: rgba(148, 163, 184, 0.2);
                color: #94a3b8;
            }
            #window-calendar .cal-badge--milestone {
                background: rgba(241, 196, 15, 0.2);
                color: #fde047;
                border: 1px solid rgba(241, 196, 15, 0.35);
            }
            #window-calendar .cal-challenges-section {
                margin-top: 18px;
                padding-top: 8px;
            }
            #window-calendar .cal-challenges-list {
                display: flex;
                flex-direction: column;
                gap: 8px;
            }
            #window-calendar .cal-challenge-card {
                background: rgba(15, 23, 42, 0.6);
                border: 1px solid rgba(255, 255, 255, 0.1);
                border-radius: 8px;
                padding: 10px 12px;
                display: flex;
                align-items: center;
                justify-content: space-between;
                gap: 12px;
                transition: border-color 0.15s ease, background 0.15s ease;
            }
            #window-calendar .cal-challenge-card--ready {
                border-color: rgba(46, 204, 113, 0.6);
                background: rgba(46, 204, 113, 0.1);
            }
            #window-calendar .cal-challenge-card--claimed {
                background: rgba(15, 23, 42, 0.35);
                border-color: rgba(255, 255, 255, 0.05);
                opacity: 0.72;
            }
            #window-calendar .cal-challenge-info {
                flex: 1;
                display: flex;
                flex-direction: column;
                gap: 6px;
                text-align: left;
            }
            #window-calendar .cal-challenge-text {
                font-size: 13px;
                font-weight: 500;
                color: #e2e8f0;
                display: flex;
                align-items: center;
                gap: 6px;
            }
            #window-calendar .cal-progress-track {
                width: 100%;
                height: 6px;
                background: rgba(255, 255, 255, 0.1);
                border-radius: 999px;
                overflow: hidden;
            }
            #window-calendar .cal-progress-fill {
                height: 100%;
                background: linear-gradient(90deg, #3498db, #38bdf8);
                border-radius: 999px;
                transition: width 0.25s ease;
            }
            #window-calendar .cal-challenge-card--ready .cal-progress-fill,
            #window-calendar .cal-challenge-card--claimed .cal-progress-fill {
                background: linear-gradient(90deg, #2ecc71, #4ade80);
            }
            #window-calendar .cal-challenge-actions {
                display: flex;
                align-items: center;
                gap: 8px;
                flex-shrink: 0;
            }
            #window-calendar .cal-progress-label {
                font-size: 12px;
                font-weight: 700;
                color: #94a3b8;
                min-width: 48px;
                text-align: right;
            }
            #window-calendar .cal-btn {
                display: inline-flex;
                align-items: center;
                gap: 5px;
                padding: 5px 10px;
                font-size: 12px;
                font-weight: 600;
                color: #ffffff;
                border: none;
                border-radius: 6px;
                cursor: pointer;
                transition: filter 0.15s ease, transform 0.1s ease;
            }
            #window-calendar .cal-btn:hover:not(:disabled) {
                filter: brightness(1.12);
            }
            #window-calendar .cal-btn:active:not(:disabled) {
                transform: scale(0.97);
            }
            #window-calendar .cal-btn--claim {
                background: linear-gradient(180deg, #2ecc71, #27ae60);
                box-shadow: 0 2px 6px rgba(46, 204, 113, 0.35);
            }
            #window-calendar .cal-btn--reroll {
                background: rgba(231, 76, 60, 0.85);
            }
            #window-calendar .cal-btn--reroll:disabled {
                background: rgba(148, 163, 184, 0.25);
                color: #94a3b8;
                cursor: not-allowed;
            }
            #window-calendar .cal-btn--cheat {
                background: rgba(100, 116, 139, 0.45);
                color: #cbd5e1;
            }
            #window-calendar .cal-completed-pill {
                font-size: 11px;
                font-weight: 700;
                color: #4ade80;
                background: rgba(46, 204, 113, 0.15);
                border: 1px solid rgba(46, 204, 113, 0.3);
                padding: 3px 9px;
                border-radius: 999px;
            }
        `;
        document.head.appendChild(styleEl);
    }

    let html = `<div class="cal-root">`;

    let titleHtml = `
        <div style="display: flex; flex-direction: column; align-items: center; gap: 6px;">
            <div style="font-weight: 700; font-size: 18px; color: white; letter-spacing: 0.3px;">Daily Calendar</div>
            <div style="display: inline-flex; background: rgba(0, 0, 0, 0.3); border: 1px solid rgba(255,255,255,0.08); border-radius: 999px; padding: 3px; gap: 4px;">
                <button onclick="window.showCalendar('activities')" style="${tab === 'activities' ? 'background: linear-gradient(to bottom, #3498db, #2980b9); color: white; border: 1px solid #3498db; box-shadow: 0 2px 6px rgba(52,152,219,0.35);' : 'background: transparent; color: rgba(255, 255, 255, 0.7); border: 1px solid transparent;'} border-radius: 999px; padding: 5px 14px; font-weight: 600; cursor: pointer; font-size: 13px; transition: all 0.2s; display: inline-flex; align-items: center; gap: 6px;">
                    Activities${showActivityDot ? '<span style="width: 7px; height: 7px; border-radius: 50%; background: #2ecc71; display: inline-block;"></span>' : ''}
                </button>
                <button onclick="window.showCalendar('shop')" style="${tab === 'shop' ? 'background: linear-gradient(to bottom, #3498db, #2980b9); color: white; border: 1px solid #3498db; box-shadow: 0 2px 6px rgba(52,152,219,0.35);' : 'background: transparent; color: rgba(255, 255, 255, 0.7); border: 1px solid transparent;'} border-radius: 999px; padding: 5px 14px; font-weight: 600; cursor: pointer; font-size: 13px; transition: all 0.2s;">Shop</button>
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
                <span class="cal-week-pill">Week ${weekNumber} &bull; Day ${dayOfWeek + 1} of 7</span>
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
