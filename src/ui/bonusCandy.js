import { state } from '../state.js';
import { showModal, updateUI } from '../ui.js';
import { WHITE_CANDY_DEFEAT_REQUIREMENT } from '../constants.js';

const CANDY_CONFIG = {
    'Green Candy': {
        stateKey: 'greenCandies',
        imageFile: 'LootCandy.png',
        hex: '#2ecc71',
        borderColor: 'rgba(46, 204, 113, 0.38)',
        glowColor: 'rgba(46, 204, 113, 0.28)',
        btnGradient: 'linear-gradient(135deg, #22c55e, #15803d)',
        getCost: (owned) => 1 + owned,
        maxOwned: Infinity
    },
    'Purple Candy': {
        stateKey: 'purpleCandies',
        imageFile: 'XPCandy.png',
        hex: '#c084fc',
        borderColor: 'rgba(192, 132, 252, 0.38)',
        glowColor: 'rgba(168, 85, 247, 0.28)',
        btnGradient: 'linear-gradient(135deg, #a855f7, #7e22ce)',
        getCost: (owned) => 2 + (owned * 2),
        maxOwned: Infinity
    },
    'Black Yellow Candy': {
        stateKey: 'blackYellowCandies',
        imageFile: 'CatchCandy.png',
        hex: '#facc15',
        borderColor: 'rgba(250, 204, 21, 0.38)',
        glowColor: 'rgba(234, 179, 8, 0.25)',
        btnGradient: 'linear-gradient(135deg, #eab308, #b45309)',
        getCost: (owned) => 3 + (owned * 3),
        maxOwned: Infinity
    },
    'Rainbow Candy': {
        stateKey: 'rainbowCandies',
        imageFile: 'ShinyCandy.png',
        hex: 'linear-gradient(to right, #ff595e, #ffca3a, #8ac926, #1982c4, #a855f7)',
        borderColor: 'rgba(244, 114, 182, 0.42)',
        glowColor: 'rgba(168, 85, 247, 0.32)',
        btnGradient: 'linear-gradient(135deg, #ec4899, #8b5cf6, #3b82f6)',
        getCost: (owned) => 4 + (owned * 4),
        maxOwned: 7
    }
};

function getCandyCost(color, currentOwned) {
    const owned = currentOwned || 0;
    const config = CANDY_CONFIG[color];
    if (config) return config.getCost(owned);
    return 1;
}

function generateCandyBankHTML(history, unspentWhite) {
    if (history.length === 0 && unspentWhite === 0) {
        return `<div class="bc-bank-empty">No candies yet — defeat wild Pokémon to earn your first White Candy!</div>`;
    }

    let candyBankHTML = '';
    for (let i = 0; i < history.length; i++) {
        const candyImg = CANDY_CONFIG[history[i]] ? CANDY_CONFIG[history[i]].imageFile : 'WhiteCandy.png';
        candyBankHTML += `<img class="bc-bank-item" src="Assets/Extra/Candies/${candyImg}" title="${history[i]}">`;
    }
    for (let i = 0; i < unspentWhite; i++) {
        candyBankHTML += `<img class="bc-bank-item bc-bank-item--white" src="Assets/Extra/Candies/WhiteCandy.png" title="Unspent White Candy">`;
    }
    return candyBankHTML;
}

function generateHeroHeaderHTML(unspentWhite, defeats, progressPct) {
    const remaining = Math.max(0, WHITE_CANDY_DEFEAT_REQUIREMENT - defeats);
    return `
        <div class="bc-hero-header">
            <div class="bc-wallet">
                <div class="bc-wallet-icon-wrap">
                    <img class="bc-wallet-icon" src="Assets/Extra/Candies/WhiteCandy.png" alt="White Candy">
                </div>
                <div class="bc-wallet-info">
                    <span class="bc-wallet-label">White Candies</span>
                    <span class="bc-wallet-count">${unspentWhite}</span>
                </div>
            </div>
            <div class="bc-progress-wrap">
                <div class="bc-progress-meta">
                    <span class="bc-progress-title">Next White Candy Progress</span>
                    <span class="bc-progress-numbers">${defeats} / ${WHITE_CANDY_DEFEAT_REQUIREMENT}<span class="bc-progress-remaining">(${remaining} left)</span></span>
                </div>
                <div class="bc-progress-track">
                    <div class="bc-progress-fill" style="width: ${progressPct}%;"></div>
                    <div class="bc-progress-pct">${Math.floor(progressPct)}%</div>
                </div>
            </div>
        </div>
    `;
}

function generateCandyOptionsHTML(unspentWhite) {
    const g = state.stats.greenCandies || 0;
    const p = state.stats.purpleCandies || 0;
    const by = state.stats.blackYellowCandies || 0;
    const r = state.stats.rainbowCandies || 0;
    return `
        <div class="bc-grid">
            ${renderCandyOption('Green Candy', '+0.25% Loot Probability &<br>+1% Money from Battles', getCandyCost('Green Candy', state.stats.greenCandies), g, `Loot +${(0.25 * g).toFixed(2)}% (+0.25%) | Money +${g}% (+1%)`, 'LootCandy.png', unspentWhite)}
            ${renderCandyOption('Purple Candy', '+2% Experience Gain from Battles', getCandyCost('Purple Candy', state.stats.purpleCandies), p, `+${2 * p}% XP ➔ +${2 * (p + 1)}%`, 'XPCandy.png', unspentWhite)}
            ${renderCandyOption('Black Yellow Candy', '+20% Catch Rate Bonus', getCandyCost('Black Yellow Candy', state.stats.blackYellowCandies), by, `+${20 * by}% Catch ➔ +${20 * (by + 1)}%`, 'CatchCandy.png', unspentWhite)}
            ${renderCandyOption('Rainbow Candy', '+1 Extra Shiny Roll per Candy', getCandyCost('Rainbow Candy', state.stats.rainbowCandies), r, r >= 7 ? `+${r} Shiny Rolls (MAX)` : `+${r} ➔ +${r + 1} Shiny Rolls`, 'ShinyCandy.png', unspentWhite)}
        </div>
    `;
}

function generateFirstTimeOverlayHTML(hasSeenModal) {
    return `
        <!-- Bonus Candy First-Time Overlay (Inner Modal) -->
        <div id="bonus-candy-first-time-overlay" class="bc-intro-overlay" style="display: ${!hasSeenModal ? 'flex' : 'none'};">
            <div class="bc-intro-card">
                <div class="bc-intro-icons">
                    <img src="Assets/Extra/Candies/WhiteCandy.png" alt="White Candy">
                    <img src="Assets/Extra/Candies/LootCandy.png" alt="Green Candy">
                    <img src="Assets/Extra/Candies/XPCandy.png" alt="Purple Candy">
                    <img src="Assets/Extra/Candies/CatchCandy.png" alt="Black Yellow Candy">
                    <img src="Assets/Extra/Candies/ShinyCandy.png" alt="Rainbow Candy">
                </div>
                <h3 class="bc-intro-title">Welcome to Bonus Candies!</h3>
                <div id="bonus-candy-intro-text" class="bc-intro-steps">
                    <div class="bc-intro-step"><strong>1. Earn White Candies:</strong> Defeat <strong>${WHITE_CANDY_DEFEAT_REQUIREMENT}</strong> wild Pokémon to earn a White Candy.</div>
                    <div class="bc-intro-step"><strong>2. Trade for Permanent Buffs:</strong> Exchange White Candies for flavored candies that grant permanent account-wide bonuses.</div>
                    <div class="bc-intro-step"><strong>3. Scaling Cost:</strong> Each time you trade for a flavor, its next cost increases by its base price.</div>
                </div>
                <button id="btn-dismiss-bonus-candy" class="bc-intro-btn" onclick="window.dismissBonusCandyMessage()">Enjoy!</button>
            </div>
        </div>
    `;
}

function generateMainModalHTML(unspentWhite, defeats, progressPct, candyBankHTML, tradedCount, hasSeenModal) {
    return `
        <div class="bc-modal-root">
            ${generateHeroHeaderHTML(unspentWhite, defeats, progressPct)}
            ${generateCandyOptionsHTML(unspentWhite)}

            <div class="bc-bank">
                <div class="bc-bank-header">
                    <h4 class="bc-bank-title">Candy Bank</h4>
                    <div class="bc-bank-badges">
                        <span class="bc-bank-badge">Traded: ${tradedCount}</span>
                        <span class="bc-bank-badge">Unspent: ${unspentWhite}</span>
                    </div>
                </div>
                <div class="bc-bank-tray">
                    ${candyBankHTML}
                </div>
            </div>
        </div>
        ${generateFirstTimeOverlayHTML(hasSeenModal)}
    `;
}

export function showBonusCandyModal() {
    const defeats = state.stats.bonusCandyDefeats || 0;
    const progressPct = Math.min(100, Math.max(0, (defeats / WHITE_CANDY_DEFEAT_REQUIREMENT) * 100));

    if (!state.stats.candyPurchaseHistory) {
        state.stats.candyPurchaseHistory = [];
    }

    const unspentWhite = state.stats.whiteCandies || 0;
    const tradedCount = state.stats.candyPurchaseHistory.length;
    const candyBankHTML = generateCandyBankHTML(state.stats.candyPurchaseHistory, unspentWhite);

    const html = generateMainModalHTML(
        unspentWhite,
        defeats,
        progressPct,
        candyBankHTML,
        tradedCount,
        state.globalStats?.hasSeenBonusCandyModal
    );

    showModal("Bonus Candy", html, "window-bonus-candy", "800px", "auto");

    const modalContent = document.querySelector('#window-bonus-candy .window-content-container');
    if (modalContent) {
        modalContent.style.position = 'relative';
    }
}

function renderCandyOption(color, effectText, cost, currentOwned, currentEffect, imageFile, unspentWhite) {
    const owned = currentOwned || 0;
    const config = CANDY_CONFIG[color] || {};
    const isRainbow = color === 'Rainbow Candy';
    const isMaxed = config.maxOwned !== undefined && owned >= config.maxOwned;
    const canAfford = !isMaxed && unspentWhite >= cost;

    const cardClasses = [
        'bc-card',
        isRainbow ? 'bc-card--rainbow' : '',
        isMaxed ? 'bc-card--maxed' : ''
    ].filter(Boolean).join(' ');

    const cardVars = `--candy-accent: ${config.hex || '#38bdf8'}; --candy-border: ${config.borderColor || 'rgba(148,163,184,0.25)'}; --candy-glow: ${config.glowColor || 'rgba(56,189,248,0.2)'}; --candy-btn-bg: ${config.btnGradient || 'linear-gradient(135deg, #2563eb, #1d4ed8)'};`;

    const titleClass = isRainbow ? 'bc-card-title bc-card-title--rainbow' : 'bc-card-title';
    const titleInline = isRainbow ? '' : `style="color: ${config.hex || '#f1f5f9'};"`;

    const ownedText = config.maxOwned !== Infinity ? `${owned} / ${config.maxOwned}` : `${owned}`;
    const ownedPillClass = isMaxed ? 'bc-owned-pill bc-owned-pill--maxed' : 'bc-owned-pill';

    let buttonHTML;
    if (isMaxed) {
        buttonHTML = `<button type="button" class="bc-buy-btn bc-buy-btn--maxed" disabled>MAXED OUT</button>`;
    } else if (canAfford) {
        buttonHTML = `
            <button type="button" class="bc-buy-btn bc-buy-btn--affordable" onclick="window.buyBonusCandy('${color}')" title="Trade ${cost} White Candy for ${color}">
                <span>Trade for ${cost}</span>
                <img class="bc-cost-icon" src="Assets/Extra/Candies/WhiteCandy.png" alt="White Candy">
            </button>
        `;
    } else {
        const missing = cost - unspentWhite;
        buttonHTML = `
            <button type="button" class="bc-buy-btn bc-buy-btn--unaffordable" onclick="window.buyBonusCandy('${color}')" title="Need ${missing} more White Candy">
                <span>Cost: ${cost}</span>
                <img class="bc-cost-icon" src="Assets/Extra/Candies/WhiteCandy.png" alt="White Candy">
                <span>(Need ${missing} more)</span>
            </button>
        `;
    }

    return `
        <div class="${cardClasses}" style="${cardVars}">
            <div class="bc-card-header">
                <div class="bc-icon-pedestal" ${isMaxed ? '' : `onclick="window.buyBonusCandy('${color}')" style="cursor: pointer;"`} title="${isMaxed ? 'MAXED' : `Click to trade for ${color}`}">
                    <img class="bc-card-icon" src="Assets/Extra/Candies/${imageFile}" alt="${color}">
                </div>
                <div class="bc-card-title-group">
                    <div class="${titleClass}" ${titleInline}>${color}</div>
                    <span class="${ownedPillClass}">${isMaxed ? `MAXED (${ownedText})` : `Owned: ${ownedText}`}</span>
                </div>
            </div>
            <div class="bc-card-body">
                <div class="bc-effect-text">${effectText}</div>
                <div class="bc-current-bonus">
                    <span class="bc-current-label">Active Bonus</span>
                    <span class="bc-current-value">${currentEffect}</span>
                </div>
            </div>
            ${buttonHTML}
        </div>
    `;
}

window.buyBonusCandy = function(color) {
    const config = CANDY_CONFIG[color];
    if (!config) return;

    const currentOwned = state.stats[config.stateKey] || 0;

    if (currentOwned >= config.maxOwned) {
        const pluralColor = color.endsWith('y') ? color.slice(0, -1) + 'ies' : color + 's';
        const maxMsg = `Maximum ${pluralColor} reached!`;
        if (window.showGameAlert) {
            window.showGameAlert(maxMsg, 'window-bonus-candy');
        } else {
            alert(maxMsg);
        }
        return;
    }

    const cost = getCandyCost(color, currentOwned);

    if ((state.stats.whiteCandies || 0) >= cost) {
        state.stats.whiteCandies -= cost;
        state.stats[config.stateKey] = currentOwned + 1;

        if (!state.stats.candyPurchaseHistory) {
            state.stats.candyPurchaseHistory = [];
        }
        state.stats.candyPurchaseHistory.push(color);

        updateUI();
        showBonusCandyModal(); // Refresh modal
    } else {
        const noCandyMsg = "Not enough White Candies!";
        if (window.showGameAlert) {
            window.showGameAlert(noCandyMsg, 'window-bonus-candy');
        } else {
            alert(noCandyMsg);
        }
    }
};
