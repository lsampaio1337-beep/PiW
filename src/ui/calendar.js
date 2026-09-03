import { state } from '../state.js';
import { showModal } from '../ui.js';
import { updateTopbar } from './topbar.js';

const week1Rewards = [
    { items: { "Pokeball": 100 }, potions: { "Tiny Potion": 100 } },
    { items: { "Greatball": 100 }, potions: { "Small Potion": 100 } },
    { items: { "Greatball": 200 }, potions: { "Small Potion": 200 } },
    { items: { "Greatball": 300 }, potions: { "Big Potion": 300 } },
    { items: { "Ultraball": 100 }, potions: { "Big Potion": 100 } },
    { items: { "Ultraball": 200 }, potions: { "Big Potion": 200 } },
    { items: { "Masterball": 1 }, potions: { "Hyper Potion": 10 } }
];

const weekXRewards = [
    { items: { "Ultraball": 100 }, potions: { "Big Potion": 100 } },
    { items: { "Ultraball": 200 }, potions: { "Big Potion": 200 } },
    { items: { "Ultraball": 300 }, potions: { "Big Potion": 300 } },
    { items: { "Ultraball": 400 }, potions: { "Big Potion": 400 } },
    { items: { "Ultraball": 500 }, potions: { "Big Potion": 500 } },
    { items: { "Ultraball": 600 }, potions: { "Big Potion": 600 } },
    { items: { "Masterball": 1 }, potions: { "Hyper Potion": 10 } }
];

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

    // Determine if we are on week 1 or week > 1
    const week = Math.floor(state.stats.dailyRewards.daysClaimed / 7);
    const dayOfWeek = state.stats.dailyRewards.daysClaimed % 7;

    if (dayIndex !== dayOfWeek) return; // Can only claim the current day

    const rewardList = (week === 0) ? week1Rewards : weekXRewards;
    const reward = rewardList[dayOfWeek];

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

    // Update state
    state.stats.dailyRewards.lastClaimDate = getLocalDateString();
    state.stats.dailyRewards.daysClaimed++;

    // Refresh UI
    updateTopbar();
    showCalendar();
}

// Make globally accessible for the inline onclick handler
window.claimDailyReward = claimDailyReward;

export function showCalendar() {
    if (!state.stats.dailyRewards) {
        state.stats.dailyRewards = { daysClaimed: 0, lastClaimDate: null };
    }

    const isAvailable = checkDailyRewardAvailable();
    const daysClaimed = state.stats.dailyRewards.daysClaimed;
    const displayDaysClaimed = isAvailable ? daysClaimed : Math.max(0, daysClaimed - 1);

    const weekNumber = Math.floor(displayDaysClaimed / 7) + 1;
    const dayOfWeek = displayDaysClaimed % 7;

    const rewardList = (weekNumber === 1) ? week1Rewards : weekXRewards;

    let html = `<div style="text-align: center; color: white;">`;
    html += `<h2 style="margin-top: 0;">Daily Rewards - Week ${weekNumber}</h2>`;
    html += `<div style="display: flex; gap: 10px; justify-content: center; overflow-x: auto; padding-bottom: 10px;">`;

    for (let i = 0; i < 7; i++) {
        const reward = rewardList[i];
        let cardStyle = `
            border: 2px solid #555;
            border-radius: 8px;
            padding: 10px;
            width: 120px;
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
            overlayHtml = `<div style="font-size: 20px; margin-top: 5px;">✔️</div>`;
        } else if (i === dayOfWeek) {
            if (isAvailable) {
                // Claimable today
                cardStyle += ` border-color: #4CAF50; cursor: pointer; background: rgba(0,100,0,0.6); box-shadow: 0 0 10px #4CAF50;`;
                onClickHtml = `onclick="window.claimDailyReward(${i})"`;
            } else {
                // Already claimed today, show this slot as collected
                cardStyle += ` opacity: 0.5; border-color: #333; filter: grayscale(100%);`;
                overlayHtml = `<div style="font-size: 20px; margin-top: 5px;">✔️</div>`;
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
    html += `<p style="font-size: 12px; color: #ccc; margin-top: 15px;">New rewards available every day. Check back tomorrow!</p>`;
    html += `</div>`;

    showModal("Daily Rewards", html);
}
