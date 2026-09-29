import { state } from '../state.js';
import { updateUI, showModal } from '../ui.js';
import { VITAMINS } from '../constants.js';

export function getShopHtml() {
    let tokens = state.trainer.tokens || 0;

    const upgradesInfo = [
        { id: 'balls', name: 'Unlock Ball Upgrade', icon: 'Ball1' },
        { id: 'potions', name: 'Unlock Potion Upgrade', icon: 'Potion1' },
        { id: 'box', name: 'Unlock Storage Upgrade', icon: 'Storage1' },
        { id: 'speed', name: 'Unlock Speed Upgrade', icon: 'Speed1' },
        { id: 'glass', name: 'Unlock Glasses Upgrade', icon: 'Glass1' },
        { id: 'loot', name: 'Unlock Loot Upgrade', icon: 'Loot1' },
        { id: 'smartwatch', name: 'Unlock Smartwatch Upgrade', icon: 'Smartwatch1' }
    ];


    const descriptions = {
        'Vitamins': 'A vitamin that improves any stat in a Pokemon in 1% (max 20% each stat).',
        'Evolution Stones': 'A Stone needed for evolving pokemon.',
        'Masterball': 'A ball that guarantee capture.',
        'ball': 'Allow you to carry more balls.',
        'potion': 'Allow you to carry more potions.',
        'box': 'Allow you to keep more pokemons on backpack.',
        'speed': 'Allow you to buy upgrades that decreases encounter speed.',
        'glass': 'Allow you to buy upgrades that display visual information while combat.',
        'loot': 'Allow you to buy upgrades that collect loots from pokemons.',
        'smartwatch': 'Allow you to buy upgrades that helps capture and heal during battle.'
    };

    let html = \`
        <div style="display: flex; justify-content: center; align-items: center; gap: 10px; margin-bottom: 20px;">
            <img src="Assets/Extra/Token.png" style="width: 30px; height: 30px;" />
            <h2 style="margin: 0; color: #f1c40f;">Tokens: <span id="shop-token-count">\${tokens.toLocaleString()}</span></h2>
        </div>
        <div style="display: flex; flex-wrap: wrap; gap: 15px; justify-content: center; padding: 10px; overflow-y: auto; max-height: 60vh;">
    \`;

    const createCard = (title, img, cost, actionsHtml) => \`
        <div style="background: #2c3e50; border: 2px solid #3498db; border-radius: 10px; padding: 15px; text-align: center; width: 160px; display: flex; flex-direction: column; align-items: center;">
            <div style="font-size: 16px; font-weight: bold; margin-bottom: 10px; color: white; min-height: 40px; display: flex; align-items: center;">\${title}</div>
            <img src="\${img}" style="width: 60px; height: 60px; object-fit: contain; margin-bottom: 10px;">
            <div style="font-size: 16px; font-weight: bold; color: #f1c40f; margin-bottom: 5px;">\${cost} Token\${cost > 1 ? 's' : ''}</div>
            <div style="font-size: 11px; color: #ccc; margin-bottom: 15px; flex: 1; text-align: center;">\${descriptions[title] || descriptions[title.toLowerCase().replace('unlock ', '').replace(' upgrade', '').replace('storage', 'box').replace('glasses', 'glass')] || ''}</div>
            <div style="display: flex; gap: 5px; flex-direction: column; width: 100%;">
                \${actionsHtml}
            </div>
        </div>
    \`;

    const btnStyle = "padding: 8px; font-size: 14px; background: #2ecc71; color: white; border: none; border-radius: 5px; cursor: pointer; font-weight: bold;";

    // Any Vitamin
    html += createCard("Vitamins", "Assets/Extra/Vitamin.png", 2, \`
        <button onclick="window.shopBuySelect('vitamin')" style="\${btnStyle}">Select (2)</button>
        <button onclick="window.shopBuyRandom('vitamin')" style="\${btnStyle} background: #9b59b6;">Random (1)</button>
    \`);

    // Any Stone
    html += createCard("Evolution Stones", "Assets/Items/Stones/Normal Stone.png", 2, \`
        <button onclick="window.shopBuySelect('stone')" style="\${btnStyle}">Select (2)</button>
        <button onclick="window.shopBuyRandom('stone')" style="\${btnStyle} background: #9b59b6;">Random (1)</button>
    \`);

    // Masterball
    html += createCard("Masterball", "Assets/Items/Balls/Masterball.png", 10, \`
        <button onclick="window.shopBuyMasterball()" style="\${btnStyle}">Buy (10)</button>
    \`);

    // Upgrades
    for (let upg of upgradesInfo) {
        let maxTier = 1;
        if (state.config.balance && state.config.balance.expansions) {
            let key = upg.id;
            if (key === 'balls') key = 'ballPocket';
            if (key === 'potions') key = 'potionSatchel';
            if (key === 'box') key = 'pokemonBox';
            maxTier = (state.config.balance.expansions[key] && state.config.balance.expansions[key].length) ? state.config.balance.expansions[key].length : 1;
        }

        let currentTier = state.stats.upgrades ? (state.stats.upgrades[upg.id + 'Tier'] || 0) : 0;
        let isMaxed = currentTier >= maxTier;

        if (!isMaxed) {
            html += createCard(upg.name, \`Assets/Items/Upgrades/\${upg.icon}.png\`, 1, \`
                <button onclick="window.shopBuyUpgrade('\${upg.id}')" style="\${btnStyle}">Unlock (1)</button>
            \`);
        }
    }

    html += \`</div>\`;
    return html;
}

window.shopBuyMasterball = function() {
    if ((state.trainer.tokens || 0) >= 10) {
        state.trainer.tokens -= 10;
        if (!state.backpack.pokeballs["Masterball"]) state.backpack.pokeballs["Masterball"] = 0;
        state.backpack.pokeballs["Masterball"] += 1;
        if(window.showGameAlert) window.showGameAlert("Bought 1x Masterball!");
        if(window.showCalendar) window.showCalendar('shop');
        updateUI();
    } else {
        if(window.showGameAlert) window.showGameAlert("Not enough tokens!");
    }
};

window.shopBuyUpgrade = function(upgradeId) {
    if ((state.trainer.tokens || 0) >= 1) {
        let maxTier = 1;
        if (state.config.balance && state.config.balance.expansions) {
            let key = upgradeId;
            if (key === 'balls') key = 'ballPocket';
            if (key === 'potions') key = 'potionSatchel';
            if (key === 'box') key = 'pokemonBox';
            maxTier = (state.config.balance.expansions[key] && state.config.balance.expansions[key].length) ? state.config.balance.expansions[key].length : 1;
        }

        if (!state.stats.upgrades) state.stats.upgrades = {};

        state.trainer.tokens -= 1;
        state.stats.upgrades[upgradeId + 'Tier'] = maxTier; // Max it out completely per user request

        if(window.showGameAlert) window.showGameAlert(\`Unlocked all tiers for \${upgradeId}!\`);
        if(window.showCalendar) window.showCalendar('shop');
        updateUI();
    } else {
        if(window.showGameAlert) window.showGameAlert("Not enough tokens!");
    }
};

const ALL_STONES = [
    "Normal Stone", "Fire Stone", "Water Stone", "Grass Stone",
    "Electric Stone", "Ice Stone", "Fighting Stone", "Poison Stone",
    "Ground Stone", "Flying Stone", "Psychic Stone", "Bug Stone",
    "Rock Stone", "Ghost Stone", "Dragon Stone", "Steel Stone",
    "Dark Stone", "Fairy Stone"
];

window.shopBuyRandom = function(type) {
    if ((state.trainer.tokens || 0) >= 1) {
        state.trainer.tokens -= 1;
        let item = "";

        if (type === 'vitamin') {
            item = VITAMINS[Math.floor(Math.random() * VITAMINS.length)];
        } else {
            item = ALL_STONES[Math.floor(Math.random() * ALL_STONES.length)];
        }

        // Vitamins and Stones are both stored in state.backpack.stones
        if (!state.backpack.stones) state.backpack.stones = {};
        if (state.backpack.stones[item] === undefined) state.backpack.stones[item] = 0;
        state.backpack.stones[item] += 1;

        if(window.showGameAlert) window.showGameAlert(\`Got 1x \${item}!\`);
        if(window.showCalendar) window.showCalendar('shop');
        updateUI();
    } else {
        if(window.showGameAlert) window.showGameAlert("Not enough tokens!");
    }
};

window.shopBuySelect = function(type) {
    if ((state.trainer.tokens || 0) < 2) {
        if(window.showGameAlert) window.showGameAlert("Not enough tokens! You need 2 Tokens to select.");
        return;
    }

    let items = type === 'vitamin' ? VITAMINS : ALL_STONES;
    let title = type === 'vitamin' ? "Select a Vitamin" : "Select a Stone";

    let html = \`<div style="display: flex; flex-wrap: wrap; gap: 10px; justify-content: center; padding: 10px; max-height: 400px; overflow-y: auto;">\`;

    items.forEach(item => {
        let imgSrc = type === 'vitamin' ? \`Assets/Extra/Vitamin.png\` : \`Assets/Items/Stones/\${item}.png\`;
        html += \`
            <div onclick="window.shopPerformSelect('\${item}')" style="background: #2c3e50; border: 2px solid #3498db; border-radius: 8px; padding: 10px; text-align: center; width: 100px; cursor: pointer;">
                <img src="\${imgSrc}" style="width: 50px; height: 50px; object-fit: contain; margin-bottom: 5px;">
                <div style="font-size: 12px; color: white; font-weight: bold;">\${item}</div>
            </div>
        \`;
    });

    html += \`</div>\`;
    showModal(title, html, "window-shop-select", "600px", "auto");
};

window.shopPerformSelect = function(item) {
    if ((state.trainer.tokens || 0) >= 2) {
        state.trainer.tokens -= 2;

        // Vitamins and Stones are both stored in state.backpack.stones
        if (!state.backpack.stones) state.backpack.stones = {};
        if (state.backpack.stones[item] === undefined) state.backpack.stones[item] = 0;
        state.backpack.stones[item] += 1;

        if(window.showGameAlert) window.showGameAlert(\`Bought 1x \${item} for 2 Tokens!\`);

        if (window.windowManager) window.windowManager.closeDynamicWindow("window-shop-select");
        if(window.showCalendar) window.showCalendar('shop');
        updateUI();
    } else {
        if(window.showGameAlert) window.showGameAlert("Not enough tokens!");
    }
};
