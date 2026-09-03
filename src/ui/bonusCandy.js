import { state, globals } from '../state.js';
import { showModal, updateUI } from '../ui.js';

export function showBonusCandyModal() {
    const defeats = state.stats.bonusCandyDefeats || 0;
    const isClaimable = defeats >= 1000;
    const progressTextLeft = isClaimable ? "" : `${defeats}/1000`;
    const progressTextRight = isClaimable ? "" : `${Math.floor((defeats / 1000) * 100)}%`;
    const progressTextCenter = isClaimable ? "Click to Claim White Candy!" : "";
    const progressPct = isClaimable ? 100 : (defeats / 1000) * 100;

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
        <div style="text-align: center; font-family: sans-serif; padding: 10px;">
            <div style="margin-bottom: 10px;">
                <h2 style="margin: 0; display: inline-block; vertical-align: middle;">White Candies: ${state.stats.whiteCandies || 0}</h2>
                <img src="Assets/Extra/WhiteCandy.png" style="width: 30px; height: 30px; vertical-align: middle; margin-left: 10px;" onerror="this.style.display='none'">
            </div>

            <div style="margin-bottom: 20px;">
                <div
                    onclick="window.claimWhiteCandy()"
                    style="
                        position: relative;
                        width: 100%;
                        height: 30px;
                        background-color: #333;
                        border-radius: 15px;
                        border: 2px solid #555;
                        overflow: hidden;
                        cursor: ${isClaimable ? 'pointer' : 'default'};
                        box-shadow: ${isClaimable ? '0 0 10px yellow' : 'none'};
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
                        ${isClaimable
                            ? `<span>${progressTextCenter}</span>`
                            : `<div style="width: 50%; text-align: center;">${progressTextLeft}</div><div style="width: 50%; text-align: center;">${progressTextRight}</div>`
                        }
                    </div>
                </div>
            </div>

            <div style="margin-bottom: 20px;">
                <button onclick="window.cheatWhiteCandy()" style="padding: 5px 10px; background-color: #888; color: white; border: none; border-radius: 5px; cursor: pointer; font-size: 12px;">Cheat: +1 White Candy</button>
            </div>

            <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 15px; margin-bottom: 20px;">
                ${renderCandyOption('Green Candy', '+1% Loot Probability and Quantity', 1, state.stats.greenCandies, (1 + 0.01 * (state.stats.greenCandies || 0)).toFixed(2) + 'x', 'LootCandy.png')}
                ${renderCandyOption('Purple Candy', 'XP +1%', 2, state.stats.purpleCandies, (1 + 0.01 * (state.stats.purpleCandies || 0)).toFixed(2) + 'x', 'XPCandy.png')}
                ${renderCandyOption('Black Yellow Candy', 'Catch +1%', 3, state.stats.blackYellowCandies, (1 + 0.01 * (state.stats.blackYellowCandies || 0)).toFixed(2) + 'x', 'CatchCandy.png')}
                ${renderCandyOption('Rainbow Candy', 'Shiny +1roll', 5, state.stats.rainbowCandies, '+' + (state.stats.rainbowCandies || 0) + ' rolls', 'ShinyCandy.png')}
            </div>

            <div style="background-color: #222; border: 1px solid #444; border-radius: 8px; padding: 10px; text-align: left; min-height: 50px;">
                <h4 style="margin-top: 0; margin-bottom: 10px; text-align: center;">Candy Bank</h4>
                <div style="display: flex; flex-wrap: wrap; justify-content: center;">
                    ${candyBankHTML}
                </div>
            </div>
        </div>
    `;

    showModal(null, html);
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
        ? `background: ${getColorHex(color)}; -webkit-background-clip: text; -webkit-text-fill-color: transparent;`
        : `color: ${getColorHex(color)}; text-shadow: 1px 1px 2px black;`;

    return `
        <div style="background-color: #222; border: 1px solid #444; border-radius: 8px; padding: 15px; display: flex; flex-direction: column; align-items: center; position: relative; min-height: 120px; justify-content: center;">
            <img src="Assets/Extra/${imageFile}" onclick="window.buyBonusCandy('${color}', ${cost})" style="width: 60px; height: 60px; position: absolute; ${verticalAlign} ${horizontalAlign} cursor: pointer; border-radius: 5px; box-shadow: 0 0 5px rgba(255,255,255,0.5);" onerror="this.style.display='none'" title="Click to buy ${color}">
            <div style="font-size: 18px; font-weight: bold; margin-bottom: 5px; ${titleStyle}">${color}</div>
            <div style="font-size: 14px; margin-bottom: 5px; text-align: center;">Effect: ${effectText}</div>
            <div style="font-size: 14px; margin-bottom: 10px;">Cost: ${cost} White Candy</div>
            <div style="font-size: 14px; color: #aaa;">Owned: ${owned}</div>
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
    if ((state.stats.bonusCandyDefeats || 0) >= 1000) {
        state.stats.bonusCandyDefeats -= 1000;
        state.stats.whiteCandies = (state.stats.whiteCandies || 0) + 1;
        updateUI();
        showBonusCandyModal(); // Refresh modal
    }
};

window.cheatWhiteCandy = function() {
    state.stats.whiteCandies = (state.stats.whiteCandies || 0) + 1;
    updateUI();
    showBonusCandyModal();
};

window.buyBonusCandy = function(color, cost) {
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
