import { state } from '../state.js';
import { showModal } from '../ui.js';
import { updateTopbar } from './topbar.js';
import { claimDailyChallengeReward } from '../dailyChallenges.js';


export function getRewardForDay(daysClaimed) {
    const w = Math.floor(daysClaimed / 7) + 1;
    const d = daysClaimed + 1;
    const dayOfWeek = daysClaimed % 7; // 0 to 6 (Day 1 to Day 7)

    if (w === 1) {
        switch(dayOfWeek) {
            case 0: return { items: { "Pokeball": 10 }, potions: { "Tiny Potion": 10 } };
            case 1: return { items: { "Pokeball": 20 }, potions: { "Small Potion": 10 } };
            case 2: return { items: { "Greatball": 10 }, potions: { "Regular Potion": 10 } };
            case 3: return { items: { "Greatball": 20 }, potions: { "Regular Potion": 20 } };
            case 4: return { items: { "Ultraball": 10 }, potions: { "Big Potion": 5 } };
            case 5: return { items: { "Ultraball": 20 }, potions: { "Big Potion": 10 } };
            case 6: return { items: { "Masterball": 1 }, potions: { "Ultra Potion": 2 } };
        }
    } else {
        // Week 2+
        if (dayOfWeek < 6) { // Days 1-6
            const ultraballs = 15 + 5 * (d - 7);
            const hyperPotions = 2 * (d - 7);
            return { items: { "Ultraball": ultraballs }, potions: { "Huge Potion": hyperPotions } };
        } else { // Day 7
            const masterballs = w;
            const ultraPotions = 2 * w;
            return { items: { "Masterball": masterballs }, potions: { "Ultra Potion": ultraPotions } };
        }
    }
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

    const rewardList = getRewardListForWeek(weekNumber);

    let html = `<div style="text-align: center; color: white; padding: 2%; box-sizing: border-box;">`;
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

    // Append Daily Challenges
    if (state.stats.dailyChallenges && state.stats.dailyChallenges.list && state.stats.dailyChallenges.list.length > 0) {
        html += `<h2 style="margin-top: 20px; border-top: 1px solid #444; padding-top: 20px;">Daily Challenges</h2>`;
        html += `<div style="display: flex; gap: 2%; justify-content: center; width: 100%;">`;

        let allCompleted = true;

        for (let i = 0; i < state.stats.dailyChallenges.list.length; i++) {
            const challenge = state.stats.dailyChallenges.list[i];
            const isDone = challenge.current >= challenge.target;
            if (!isDone) allCompleted = false;

            let cStyle = `border: 2px solid ${isDone ? '#4CAF50' : '#555'}; border-radius: 8px; padding: 10px; flex: 1; background: rgba(0,0,0,0.6); display: flex; flex-direction: column; align-items: center; text-align: center;`;
            let pText = challenge.description.replace('{target}', challenge.target).replace('{typeTarget}', challenge.typeTarget || '').replace('{ivTarget}', challenge.ivTarget || '');

            html += `<div style="${cStyle}">
                <p style="font-size: 14px; margin: 0 0 10px 0;">${pText}</p>
                <div style="width: 100%; background: #333; border-radius: 5px; height: 10px; margin-bottom: 5px; overflow: hidden;">
                    <div style="width: ${(Math.min(challenge.current / challenge.target, 1) * 100).toFixed(0)}%; background: #4CAF50; height: 100%;"></div>
                </div>
                <span style="font-size: 12px; color: #ccc;">${challenge.current} / ${challenge.target}</span>
            </div>`;
        }

        html += `</div>`;

        html += `<div style="margin-top: 20px; text-align: center; display: flex; justify-content: center; align-items: center; gap: 15px;">
            <div style="display: flex; align-items: center; gap: 5px;">
                <img src="Assets/Items/Extra/DailyToken.png" style="width: 32px; height: 32px;" title="Daily Token">
                <span style="font-size: 18px; font-weight: bold; color: #FFD700;">x1</span>
            </div>
            `;

        if (state.stats.dailyChallenges.claimed) {
            html += `<button disabled style="padding: 10px 20px; background: #555; color: #888; border: none; border-radius: 5px; font-weight: bold; cursor: not-allowed;">Collected</button>`;
        } else if (allCompleted) {
            html += `<button onclick="window.claimDailyChallengeReward()" style="padding: 10px 20px; background: #4CAF50; color: white; border: none; border-radius: 5px; font-weight: bold; cursor: pointer; box-shadow: 0 0 10px #4CAF50;">Claim Reward</button>`;
        } else {
            html += `<button disabled style="padding: 10px 20px; background: #555; color: #888; border: none; border-radius: 5px; font-weight: bold; cursor: not-allowed;">Claim Reward</button>`;
        }

        html += `</div>`;
    }

    html += `</div>`;

    showModal("Daily Rewards", html, "window-calendar");
}
