import { state } from '../state.js';
import { showModal } from '../ui.js';
import { updateTopbar } from './topbar.js';
import { getDailyChallengesHtml } from './dailyChallenges.js';


export function getRewardForDay(daysClaimed) {
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

export function checkAnyDailyChallengeCompleted() {
    if (!state.stats.dailyChallenges || !state.stats.dailyChallenges.active) return false;
    if (state.stats.dailyChallenges.hasSeenNotification) return false;
    for (let c of state.stats.dailyChallenges.active) {
        if (c.completed) return true;
    }
    return false;
}

export function claimDailyReward(dayIndex) {
    if (!checkDailyRewardAvailable()) return;

    const dayOfWeek = state.stats.dailyRewards.daysClaimed % 7;

    if (dayIndex !== dayOfWeek) return; // Can only claim the current day

    const reward = getRewardForDay(state.stats.dailyRewards.daysClaimed);

    // Grant items
    for (let ballName in reward.items) {
        if (!state.backpack.pokeballs[ballName]) {
             state.backpack.pokeballs[ballName] = 0;
        }
        state.backpack.pokeballs[ballName] += reward.items[ballName];
    }

    for (let potionName in reward.potions) {
        if (!state.backpack.potions[potionName]) {
             state.backpack.potions[potionName] = 0;
        }
        state.backpack.potions[potionName] += reward.potions[potionName];
    }

    if (reward.tokens) {
        if (!state.trainer.tokens) state.trainer.tokens = 0;
        state.trainer.tokens += reward.tokens;
    }

    // Update state
    state.stats.dailyRewards.lastClaimDate = getLocalDateString();
    state.stats.dailyRewards.daysClaimed++;

    // Refresh UI
    updateTopbar();
    showCalendar();
}

// Make globally accessible for the inline onclick handler
window.claimDailyReward = claimDailyReward;

window.giveFreeTokens = function() {
    if (!state.trainer.tokens) state.trainer.tokens = 0;
    state.trainer.tokens += 10;
    if (window.showGameAlert) window.showGameAlert("Received 10 Tokens!");
    if (window.showCalendar) window.showCalendar('shop');
};

window.showCalendar = showCalendar;
export function showCalendar(tab = 'activities') {
    let html = `<div style="display: flex; flex-direction: column; width: 100%; height: 100%; box-sizing: border-box;">`;

    // Tabs
    html += `
        <div style="display: flex; gap: 10px; justify-content: center; margin-top: 10px; margin-bottom: 10px; align-items: center;">
            <button onclick="window.showCalendar('activities')" style="padding: 10px 20px; font-size: 16px; font-weight: bold; border-radius: 5px; cursor: pointer; ${tab === 'activities' ? 'background: #3498db; color: white;' : 'background: #2c3e50; color: #bdc3c7; border: 1px solid #7f8c8d;'}">Activities</button>
            <button onclick="window.showCalendar('shop')" style="padding: 10px 20px; font-size: 16px; font-weight: bold; border-radius: 5px; cursor: pointer; ${tab === 'shop' ? 'background: #3498db; color: white;' : 'background: #2c3e50; color: #bdc3c7; border: 1px solid #7f8c8d;'}">Shop</button>
            <button onclick="window.giveFreeTokens()" style="padding: 10px 20px; font-size: 16px; font-weight: bold; border-radius: 5px; cursor: pointer; background: #e67e22; color: white; border: none;">Token</button>
        </div>
        <div id="calendar-content-area" style="flex: 1; overflow-y: auto;">
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

        html += `<div style="text-align: center; color: white; padding: 2%; box-sizing: border-box;">`;
        html += `<h2 style="margin-top: 0;">Daily Rewards - Week ${weekNumber}</h2>`;
        html += `<div style="display: flex; gap: 1%; justify-content: center; padding-bottom: 10px; width: 100%;">`;

    for (let i = 0; i < 7; i++) {
        const reward = rewardList[i];
        let cardStyle = `
            border: 2px solid #555;
            border-radius: 8px;
            padding: 10px 5px;
            flex: 1;
            background: rgba(0,0,0,0.6);
            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: space-between;
        `;
        let overlayHtml = '';
        let onClickHtml = '';

        if (i < dayOfWeek) {
            // Already claimed
            cardStyle += ` opacity: 0.5; border-color: #333; filter: grayscale(100%);`;
            overlayHtml = '';
        } else if (i === dayOfWeek) {
            if (isAvailable) {
                // Claimable today
                cardStyle += ` border-color: #4CAF50; cursor: pointer; background: rgba(0,100,0,0.6); box-shadow: 0 0 10px #4CAF50;`;
                onClickHtml = `onclick="window.claimDailyReward(${i})"`;
            } else {
                // Already claimed today, show this slot as collected
                cardStyle += ` opacity: 0.5; border-color: #333; filter: grayscale(100%);`;
                overlayHtml = '';
            }
        } else {
            // Future days
            overlayHtml = '';
        }

        let itemsHtml = '';
        for (let ballName in reward.items) {
            let qty = reward.items[ballName];
            itemsHtml += `
                <div style="display: flex; align-items: center; gap: 5px; margin-bottom: 5px; justify-content: center;">
                    <img src="Assets/Items/Balls/${ballName}.png" style="width: 24px; height: 24px;" title="${ballName}">
                    <span style="font-size: 14px;">x${qty}</span>
                </div>
            `;
        }
        for (let potionName in reward.potions) {
            let qty = reward.potions[potionName];
            itemsHtml += `
                <div style="display: flex; align-items: center; gap: 5px; justify-content: center;">
                    <img src="Assets/Items/Potions/${potionName}.png" style="width: 24px; height: 24px;" title="${potionName}">
                    <span style="font-size: 14px;">x${qty}</span>
                </div>
            `;
        }

        if (reward.tokens) {
            itemsHtml += `
                <div style="display: flex; align-items: center; gap: 5px; margin-top: 5px; justify-content: center;">
                    <img src="Assets/Extra/Token.png" style="width: 24px; height: 24px;" title="Token">
                    <span style="font-size: 14px;">x${reward.tokens}</span>
                </div>
            `;
        }

        html += `
            <div style="${cardStyle}" ${onClickHtml}>
                <div style="font-weight: bold; margin-bottom: 10px;">Day ${i+1}</div>
                <div style="flex-grow: 1; display: flex; flex-direction: column; justify-content: center;">
                    ${itemsHtml}
                </div>
                ${overlayHtml}
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

    showModal("Calendar", html, "window-calendar", "800px", "auto");

    // Bind to window for tab switching
    window.showCalendar = showCalendar;
}
