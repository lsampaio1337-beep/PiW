import { state, globals } from '../state.js';
import { showModal, updateUI } from '../ui.js';

export function showBonusCandyModal() {
    const defeats = state.stats.bonusCandyDefeats || 0;
    const isClaimable = defeats >= 1000;
    const progressTextLeft = isClaimable ? "Click to Claim White Candy!" : `${defeats}/1000`;
    const progressTextRight = isClaimable ? "" : `${Math.floor((defeats / 1000) * 100)}%`;
    const progressPct = isClaimable ? 100 : (defeats / 1000) * 100;

    const html = `
        <div style="text-align: center; font-family: sans-serif; padding: 10px;">
            <div style="margin-bottom: 20px;">
                <h3 style="margin-bottom: 5px;">White Candy Progress</h3>
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
                        background-color: ${isClaimable ? '#f1c40f' : '#3498db'};
                        transition: width 0.3s ease;
                    "></div>
                    <div style="
                        position: absolute;
                        top: 0; left: 10px; height: 100%;
                        display: flex; align-items: center;
                        color: white; font-weight: bold; text-shadow: 1px 1px 2px black;
                    ">
                        ${progressTextLeft}
                    </div>
                    <div style="
                        position: absolute;
                        top: 0; right: 10px; height: 100%;
                        display: flex; align-items: center;
                        color: white; font-weight: bold; text-shadow: 1px 1px 2px black;
                    ">
                        ${progressTextRight}
                    </div>
                </div>
            </div>

            <div style="margin-bottom: 20px;">
                <h2 style="margin: 0; display: inline-block; vertical-align: middle;">White Candies: ${state.stats.whiteCandies || 0}</h2>
                <img src="Assets/Items/Candies/White Candy.png" style="width: 30px; height: 30px; vertical-align: middle; margin-left: 10px;" onerror="this.style.display='none'">
            </div>

            <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 15px;">
                ${renderCandyOption('Green', 'Loot +1%', 1, state.stats.greenCandies, (1.01 ** (state.stats.greenCandies || 0)).toFixed(2) + 'x')}
                ${renderCandyOption('Purple', 'XP +1%', 2, state.stats.purpleCandies, (1.01 ** (state.stats.purpleCandies || 0)).toFixed(2) + 'x')}
                ${renderCandyOption('Black Yellow', 'Catch +1%', 3, state.stats.blackYellowCandies, (1.01 ** (state.stats.blackYellowCandies || 0)).toFixed(2) + 'x')}
                ${renderCandyOption('Rainbow', 'Shiny +1roll', 5, state.stats.rainbowCandies, '+' + (state.stats.rainbowCandies || 0) + ' rolls')}
            </div>
        </div>
    `;

    showModal("Bonus Candy", html);
}

function renderCandyOption(color, effectText, cost, currentOwned, currentEffect) {
    const owned = currentOwned || 0;
    return `
        <div style="background-color: #222; border: 1px solid #444; border-radius: 8px; padding: 15px; display: flex; flex-direction: column; align-items: center;">
            <div style="font-size: 18px; font-weight: bold; margin-bottom: 5px; color: ${getColorHex(color)}; text-shadow: 1px 1px 2px black;">${color} Candy</div>
            <div style="font-size: 14px; margin-bottom: 5px;">Effect: ${effectText}</div>
            <div style="font-size: 14px; margin-bottom: 10px;">Cost: ${cost} White Candy</div>
            <button onclick="window.buyBonusCandy('${color}', ${cost})" style="
                padding: 8px 15px;
                background-color: #4CAF50;
                color: white;
                border: none;
                border-radius: 5px;
                cursor: pointer;
                font-weight: bold;
                margin-bottom: 10px;
            ">Buy (Cost: ${cost})</button>
            <div style="font-size: 14px; color: #aaa;">Owned: ${owned}</div>
            <div style="font-size: 14px; color: #4CAF50;">Total Effect: ${currentEffect}</div>
        </div>
    `;
}

function getColorHex(colorName) {
    switch(colorName) {
        case 'Green': return '#2ecc71';
        case 'Purple': return '#9b59b6';
        case 'Black Yellow': return '#f1c40f'; // Approximation
        case 'Rainbow': return 'linear-gradient(to right, red, orange, yellow, green, blue, indigo, violet)'; // Cannot text-color gradient easily, so fallback to white in CSS or just use an orange/pink here, let's just use a bright color
        default: return 'white';
    }
}

window.claimWhiteCandy = function() {
    if ((state.stats.bonusCandyDefeats || 0) >= 1000) {
        state.stats.bonusCandyDefeats -= 1000;
        state.stats.whiteCandies = (state.stats.whiteCandies || 0) + 1;
        updateUI();
        showBonusCandyModal(); // Refresh modal
    }
};

window.buyBonusCandy = function(color, cost) {
    if ((state.stats.whiteCandies || 0) >= cost) {
        state.stats.whiteCandies -= cost;
        if (color === 'Green') state.stats.greenCandies = (state.stats.greenCandies || 0) + 1;
        else if (color === 'Purple') state.stats.purpleCandies = (state.stats.purpleCandies || 0) + 1;
        else if (color === 'Black Yellow') state.stats.blackYellowCandies = (state.stats.blackYellowCandies || 0) + 1;
        else if (color === 'Rainbow') state.stats.rainbowCandies = (state.stats.rainbowCandies || 0) + 1;

        updateUI();
        showBonusCandyModal(); // Refresh modal
    } else {
        alert("Not enough White Candies!");
    }
};
