import { state, globals } from '../state.js';
import { showModal, updateUI } from '../ui.js';
import { WHITE_CANDY_DEFEAT_REQUIREMENT } from '../constants.js';

function getCandyCost(color, currentOwned) {
    const owned = currentOwned || 0;
    if (color === 'Green Candy') return 1 + owned;
    if (color === 'Purple Candy') return 2 + (owned * 2);
    if (color === 'Black Yellow Candy') return 3 + (owned * 3);
    if (color === 'Rainbow Candy') return 4 + (owned * 4);
    return 1;
}

export function showBonusCandyModal() {
    const defeats = state.stats.bonusCandyDefeats || 0;
    const isClaimable = false; // Auto claims now
    const progressTextLeft = `${defeats}/${WHITE_CANDY_DEFEAT_REQUIREMENT}`;
    const progressPct = (defeats / WHITE_CANDY_DEFEAT_REQUIREMENT) * 100;

    // Ensure candyPurchaseHistory exists
    if (!state.stats.candyPurchaseHistory) {
        state.stats.candyPurchaseHistory = [];
    }

    // Build the candy bank HTML
    let candyBankHTML = '';
    const history = state.stats.candyPurchaseHistory;
    for (let i = 0; i < history.length; i++) {
        let candyImg = 'WhiteCandy.png';
        if (history[i] === 'Green Candy') candyImg = 'LootCandy.png';
        else if (history[i] === 'Purple Candy') candyImg = 'XPCandy.png';
        else if (history[i] === 'Black Yellow Candy') candyImg = 'CatchCandy.png';
        else if (history[i] === 'Rainbow Candy') candyImg = 'ShinyCandy.png';
        candyBankHTML += `<img src="Assets/Extra/${candyImg}" style="width: 30px; height: 30px; margin: 2px;" title="${history[i]}" onerror="this.style.display='none'">`;
    }
    // Append unspent white candies
    const unspentWhite = state.stats.whiteCandies || 0;
    for (let i = 0; i < unspentWhite; i++) {
        candyBankHTML += `<img src="Assets/Extra/WhiteCandy.png" style="width: 30px; height: 30px; margin: 2px;" title="White Candy" onerror="this.style.display='none'">`;
    }

    const html = `
        <div style="text-align: center; font-family: sans-serif; box-sizing: border-box;">
            <div style="margin-bottom: 10px;">
                <h2 style="margin: 0; display: inline-block; vertical-align: middle;">White Candies: ${state.stats.whiteCandies || 0}</h2>
                <img src="Assets/Extra/WhiteCandy.png" style="width: 30px; height: 30px; vertical-align: middle; margin-left: 10px;" onerror="this.style.display='none'">
            </div>

            <div style="margin-bottom: 20px;">
                <div
                    style="
                        position: relative;
                        width: 100%;
                        height: 30px;
                        background-color: #333;
                        border-radius: 15px;
                        border: 2px solid #555;
                        overflow: hidden;
                        cursor: default;
                    ">
                    <div style="
                        position: absolute;
                        top: 0; left: 0; height: 100%;
                        width: ${progressPct}%;
                        background-color: #3498db;
                        transition: width 0.3s ease;
                    "></div>
                    <div style="
                        position: absolute;
                        top: 0; left: 0; right: 0; height: 100%;
                        display: flex; align-items: center; justify-content: center;
                        color: white; font-weight: bold; text-shadow: 1px 1px 2px black;
                        pointer-events: none;
                    ">
                        <div style="width: 100%; text-align: center;">${progressTextLeft}</div>
                    </div>
                </div>
            </div>

            <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 15px; margin-bottom: 20px;">
                ${renderCandyOption('Green Candy', '+0.25% in Loot Probability and<br>Bonus of 1% in Money from Battles', getCandyCost('Green Candy', state.stats.greenCandies), state.stats.greenCandies, `Loot: +${0.25 * (state.stats.greenCandies || 0)}% | Money: +${1 * (state.stats.greenCandies || 0)}%`, 'LootCandy.png')}
                ${renderCandyOption('Purple Candy', 'XP Bonus of 2%', getCandyCost('Purple Candy', state.stats.purpleCandies), state.stats.purpleCandies, `+${2 * (state.stats.purpleCandies || 0)}%`, 'XPCandy.png')}
                ${renderCandyOption('Black Yellow Candy', 'Catch Bonus of 20%', getCandyCost('Black Yellow Candy', state.stats.blackYellowCandies), state.stats.blackYellowCandies, `Catch: +${20 * (state.stats.blackYellowCandies || 0)}%`, 'CatchCandy.png')}
                ${renderCandyOption('Rainbow Candy', 'Shiny +1roll', getCandyCost('Rainbow Candy', state.stats.rainbowCandies), state.stats.rainbowCandies, '+' + (state.stats.rainbowCandies || 0) + ' rolls', 'ShinyCandy.png')}
            </div>

            <div style="background-color: #222; border: 1px solid #444; border-radius: 8px; padding: 10px; text-align: left; min-height: 50px;">
                <h4 style="margin-top: 0; margin-bottom: 10px; text-align: center;">Candy Bank</h4>
                <div style="display: flex; flex-wrap: wrap; justify-content: center;">
                    ${candyBankHTML}
                </div>
            </div>
        </div>

        <!-- Bonus Candy First-Time Overlay (Inner Modal) -->
        <div id="bonus-candy-first-time-overlay" style="display: ${!state.stats.hasSeenBonusCandyModal ? 'flex' : 'none'}; position: absolute; top: 0; left: 0; width: 100%; height: 100%; z-index: 10000; background: rgba(0, 0, 0, 0.7); flex-direction: column; align-items: center; justify-content: center; border-radius: 8px;">
            <div style="background: #34495e; padding: 20px; border-radius: 10px; border: 2px solid #ff00ff; text-align: center; color: white; max-width: 80%;">
                <div id="bonus-candy-intro-text" style="margin-top: 0; font-size: 16px;">
                    <p>Here you can find delicious candies!</p>
                    <p>In order to earn a white candy you need to defeat ${WHITE_CANDY_DEFEAT_REQUIREMENT} wild Pokémons</p>
                    <p>When claimed white candies can be trade to different flavors with different effects.</p>
                    <p>Each time a flavored candy is traded, the next one will have its price increased by its initial value.</p>
                </div>
                <button id="btn-dismiss-bonus-candy" onclick="window.dismissBonusCandyMessage()" style="padding: 10px 20px; background: #2ecc71; color: white; border: none; border-radius: 5px; cursor: pointer; font-weight: bold; margin-top: 10px; font-size: 16px;">Enjoy!</button>
            </div>
        </div>
    `;

    showModal("Bonus Candy", html, "window-bonus-candy", "800px", "auto");

    // Ensure the inner content container has relative positioning so the absolute overlay maps correctly to it
    const modalContent = document.querySelector('#window-bonus-candy .window-content-container');
    if (modalContent) {
        modalContent.style.position = 'relative';
    }
}

function renderCandyOption(color, effectText, cost, currentOwned, currentEffect, imageFile) {
    const owned = currentOwned || 0;

    let verticalAlign = '';
    let horizontalAlign = '';

    if (color === 'Green Candy') {
        verticalAlign = 'bottom: 10px;';
        horizontalAlign = 'right: 10px;';
    } else if (color === 'Purple Candy') {
        verticalAlign = 'bottom: 10px;';
        horizontalAlign = 'left: 10px;';
    } else if (color === 'Black Yellow Candy') {
        verticalAlign = 'top: 10px;';
        horizontalAlign = 'right: 10px;';
    } else if (color === 'Rainbow Candy') {
        verticalAlign = 'top: 10px;';
        horizontalAlign = 'left: 10px;';
    }

    const titleStyle = color.includes('Rainbow')
        ? `background: ${getColorHex(color)}; background-size: 200% auto; -webkit-background-clip: text; -webkit-text-fill-color: transparent; animation: rainbowShift 3s linear infinite;`
        : `color: ${getColorHex(color)}; text-shadow: 1px 1px 2px black;`;

    const isMaxed = color === 'Rainbow Candy' && owned >= 7;

    return `
        <div style="background-color: #222; border: 1px solid #444; border-radius: 8px; padding: 15px; display: flex; flex-direction: column; align-items: center; position: relative; min-height: 120px; justify-content: center; ${isMaxed ? 'opacity: 0.5;' : ''}">
            <img src="Assets/Extra/${imageFile}" ${isMaxed ? '' : `onclick="window.buyBonusCandy('${color}')"`} style="width: 60px; height: 60px; position: absolute; ${verticalAlign} ${horizontalAlign} ${isMaxed ? '' : 'cursor: pointer;'} border-radius: 5px; box-shadow: 0 0 5px rgba(255,255,255,0.5);" onerror="this.style.display='none'" title="${isMaxed ? 'MAXED' : `Click to buy ${color}`}">
            <div style="font-size: 18px; font-weight: bold; margin-bottom: 5px; ${titleStyle}">${color}</div>
            <div style="font-size: 14px; margin-bottom: 5px; text-align: center;">Effect: ${effectText}</div>
            <div style="font-size: 12px; margin-bottom: 5px; text-align: center; color: #88ff88;">Current Bonus: ${currentEffect}</div>
            <div style="font-size: 14px; margin-bottom: 10px;">${isMaxed ? 'Cost: MAXED' : `Cost: ${cost} White Candy`}</div>
            <div style="font-size: 14px; color: #aaa;">Owned: ${owned}${color === 'Rainbow Candy' ? ' / 7' : ''}</div>
        </div>
    `;
}

function getColorHex(colorName) {
    if (colorName.includes('Green')) return '#2ecc71';
    if (colorName.includes('Purple')) return '#9b59b6';
    if (colorName.includes('Black Yellow')) return '#f1c40f'; // Approximation
    if (colorName.includes('Rainbow')) return 'linear-gradient(to right, red, orange, yellow, green, blue, indigo, violet)';
    return 'white';
}

window.claimWhiteCandy = function() {
    // Deprecated now that it auto-claims
};

window.buyBonusCandy = function(color) {
    if (color === 'Rainbow Candy' && (state.stats.rainbowCandies || 0) >= 7) {
        alert("Maximum Rainbow Candies reached!");
        return;
    }

    const currentOwned = color === 'Green Candy' ? state.stats.greenCandies
                       : color === 'Purple Candy' ? state.stats.purpleCandies
                       : color === 'Black Yellow Candy' ? state.stats.blackYellowCandies
                       : color === 'Rainbow Candy' ? state.stats.rainbowCandies
                       : 0;

    const cost = getCandyCost(color, currentOwned);

    if ((state.stats.whiteCandies || 0) >= cost) {
        state.stats.whiteCandies -= cost;
        if (color === 'Green Candy') state.stats.greenCandies = (state.stats.greenCandies || 0) + 1;
        else if (color === 'Purple Candy') state.stats.purpleCandies = (state.stats.purpleCandies || 0) + 1;
        else if (color === 'Black Yellow Candy') state.stats.blackYellowCandies = (state.stats.blackYellowCandies || 0) + 1;
        else if (color === 'Rainbow Candy') state.stats.rainbowCandies = (state.stats.rainbowCandies || 0) + 1;

        if (!state.stats.candyPurchaseHistory) {
            state.stats.candyPurchaseHistory = [];
        }
        state.stats.candyPurchaseHistory.push(color);

        updateUI();
        showBonusCandyModal(); // Refresh modal
            } else {
        alert("Not enough White Candies!");
    }
};
