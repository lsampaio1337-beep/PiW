import { state } from '../state.js';
import { VITAMINS } from '../constants.js';

export function renderTokenShopHtml() {
    let html = `
        <div style="display: flex; flex-direction: column; align-items: center; padding: 20px; color: white;">
            <div style="display: flex; gap: 10px; margin-bottom: 20px;">
                <div style="display: flex; align-items: center; gap: 10px; background: rgba(0,0,0,0.5); padding: 10px 20px; border-radius: 10px; border: 2px solid #f1c40f;">
                    <img src="Assets/Extra/Token.png" style="width: 32px; height: 32px;">
                    <span style="font-size: 24px; font-weight: bold; color: #f1c40f;">Tokens: ${state.trainer.tokens || 0}</span>
                </div>
                <button onclick="window.giveFreeTokens()" style="background: #e67e22; color: white; border: none; border-radius: 10px; padding: 10px 20px; font-weight: bold; cursor: pointer; font-size: 16px; box-shadow: 0 4px 6px rgba(0,0,0,0.3); transition: transform 0.1s;">
                    + Token
                </button>
            </div>

            <div style="display: flex; flex-wrap: wrap; gap: 15px; justify-content: center; max-width: 100%;">
                ${getTokenShopItemsHtml()}
            </div>
        </div>
    `;
    return html;
}

function getTokenShopItemsHtml() {
    const items = [
        {
            id: 'vitamin',
            name: 'Vitamin',
            img: 'Assets/Extra/Vitamin.png',
            desc: 'A vitamin that improves any stat in a Pokemon in 1%.',
            isSelectable: true,
            selectPrice: 2,
            randomPrice: 1
        },
        {
            id: 'stone',
            name: 'Evolution Stone',
            img: 'Assets/Items/Stones/Normal Stone.png',
            desc: 'A Stone needed for evolving pokemon.',
            isSelectable: true,
            selectPrice: 2,
            randomPrice: 1
        },
        {
            id: 'masterball',
            name: 'Masterball',
            img: 'Assets/Items/Balls/Masterball.png',
            desc: 'A ball that guarantee capture.',
            price: 10,
            action: 'window.buyTokenItem("masterball")'
        },
        {
            id: 'unlock_ball',
            name: 'Unlock Ball Upgrade',
            img: 'Assets/Items/Upgrades/Ball1.png',
            desc: 'Allow you to carry more balls.',
            price: 1,
            isUnlock: true,
            unlockKey: 'balls',
            action: 'window.buyTokenUnlock("balls")'
        },
        {
            id: 'unlock_potion',
            name: 'Unlock Potion Upgrade',
            img: 'Assets/Items/Upgrades/Potion1.png',
            desc: 'Allow you to carry more potions.',
            price: 1,
            isUnlock: true,
            unlockKey: 'potions',
            action: 'window.buyTokenUnlock("potions")'
        },
        {
            id: 'unlock_storage',
            name: 'Unlock Storage Upgrade',
            img: 'Assets/Items/Upgrades/Storage1.png',
            desc: 'Allow you to keep more pokemons on backpack.',
            price: 1,
            isUnlock: true,
            unlockKey: 'box',
            action: 'window.buyTokenUnlock("box")'
        },
        {
            id: 'unlock_speed',
            name: 'Unlock Speed Upgrade',
            img: 'Assets/Items/Upgrades/Speed1.png',
            desc: 'Allow you to buy upgrades that decreases encounter speed.',
            price: 1,
            isUnlock: true,
            unlockKey: 'speed',
            action: 'window.buyTokenUnlock("speed")'
        },
        {
            id: 'unlock_glasses',
            name: 'Unlock Glasses Upgrade',
            img: 'Assets/Items/Upgrades/Glass1.png',
            desc: 'Allow you to buy upgrades that display visual information while in battle.',
            price: 1,
            isUnlock: true,
            unlockKey: 'glass',
            action: 'window.buyTokenUnlock("glass")'
        },
        {
            id: 'unlock_loot',
            name: 'Unlock Loot Upgrade',
            img: 'Assets/Items/Upgrades/Loot1.png',
            desc: 'Allow you to buy upgrades that collect loot from pokemons.',
            price: 1,
            isUnlock: true,
            unlockKey: 'loot',
            action: 'window.buyTokenUnlock("loot")'
        },
        {
            id: 'unlock_smartwatch',
            name: 'Unlock Smartwatch Upgrade',
            img: 'Assets/Items/Upgrades/Smartwatch1.png',
            desc: 'Allow you to buy upgrades that helps capture and heal while in battle.',
            price: 1,
            isUnlock: true,
            unlockKey: 'smartwatch',
            action: 'window.buyTokenUnlock("smartwatch")'
        }
    ];

    let html = '';
    items.forEach(item => {
        if (item.isUnlock) {
            if (!state.stats.upgradesUnlocked) {
                state.stats.upgradesUnlocked = {};
            }
            if (state.stats.upgradesUnlocked[item.unlockKey]) {
                return; // Skip if already unlocked
            }
        }

        html += `
            <div style="background: #2c3e50; border: 2px solid #f1c40f; border-radius: 8px; padding: 8px; width: 150px; display: flex; flex-direction: column; align-items: center; text-align: center; justify-content: space-between;">
                <div style="font-weight: bold; font-size: 12px; margin-bottom: 5px; height: 30px; display: flex; align-items: center;">${item.name}</div>
                <img src="${item.img}" style="width: 40px; height: 40px; object-fit: contain; margin-bottom: 5px;">
                <div style="font-size: 10px; color: #bdc3c7; margin-bottom: 10px; flex-grow: 1;">${item.desc}</div>
        `;

        if (item.isSelectable) {
            html += `
                <div style="display: flex; gap: 5px; width: 100%;">
                    <button onclick="window.buyTokenItemRandom('${item.id}')" style="flex: 1; padding: 5px; background: #2ecc71; color: white; border: none; border-radius: 5px; cursor: pointer; font-weight: bold; font-size: 12px;">Random<br><img src="Assets/Extra/Token.png" style="width:12px;vertical-align:middle;"> ${item.randomPrice}</button>
                    <button onclick="window.showTokenItemSelect('${item.id}')" style="flex: 1; padding: 5px; background: #2ecc71; color: white; border: none; border-radius: 5px; cursor: pointer; font-weight: bold; font-size: 12px;">Choose<br><img src="Assets/Extra/Token.png" style="width:12px;vertical-align:middle;"> ${item.selectPrice}</button>
                </div>
            `;
        } else {
            html += `
                <button onclick='${item.action}' style="width: 100%; padding: 8px; background: #2ecc71; color: white; border: none; border-radius: 5px; cursor: pointer; font-weight: bold; font-size: 12px;">
                    Buy for <img src="Assets/Extra/Token.png" style="width:14px;vertical-align:middle;"> ${item.price}
                </button>
            `;
        }

        html += `</div>`;
    });

    return html;
}

function handleTokenPurchase(cost, callback) {
    if ((state.trainer.tokens || 0) >= cost) {
        state.trainer.tokens -= cost;
        callback();
        if (window.showCalendar) {
            window.showCalendar('shop');
        }
        if (window.updateUI) window.updateUI();
    } else {
        if (window.showGameAlert) {
            window.showGameAlert(`Not enough tokens! You need ${cost}.`);
        }
    }
}

window.buyTokenItem = function(itemType) {
    if (itemType === 'masterball') {
        handleTokenPurchase(10, () => {
            if (!state.backpack.pokeballs["Masterball"]) {
                state.backpack.pokeballs["Masterball"] = 0;
            }
            state.backpack.pokeballs["Masterball"] += 1;
            if (window.showGameAlert) window.showGameAlert("Bought 1x Masterball!");
        });
    }
};

window.buyTokenUnlock = function(unlockKey) {
    handleTokenPurchase(1, () => {
        if (!state.stats.upgradesUnlocked) {
            state.stats.upgradesUnlocked = {};
        }
        state.stats.upgradesUnlocked[unlockKey] = true;
        if (window.showGameAlert) window.showGameAlert(`Unlocked ${unlockKey} upgrades!`);
    });
};

window.buyTokenItemRandom = function(itemType) {
    handleTokenPurchase(1, () => {
        let itemAwarded = "";
        if (itemType === 'vitamin') {
            const index = Math.floor(Math.random() * VITAMINS.length);
            itemAwarded = VITAMINS[index];
            if (!state.backpack.stones[itemAwarded]) state.backpack.stones[itemAwarded] = 0;
            state.backpack.stones[itemAwarded] += 1;
        } else if (itemType === 'stone') {
            const stoneTypes = ["Normal Stone", "Fire Stone", "Water Stone", "Grass Stone", "Electric Stone", "Ice Stone", "Fighting Stone", "Poison Stone", "Ground Stone", "Flying Stone", "Psychic Stone", "Bug Stone", "Rock Stone", "Ghost Stone", "Dragon Stone", "Steel Stone", "Dark Stone", "Fairy Stone"];
            const index = Math.floor(Math.random() * stoneTypes.length);
            itemAwarded = stoneTypes[index];
            if (!state.backpack.stones[itemAwarded]) state.backpack.stones[itemAwarded] = 0;
            state.backpack.stones[itemAwarded] += 1;
        }
        if (window.showGameAlert) window.showGameAlert(`Got 1x ${itemAwarded}!`);
    });
};

window.showTokenItemSelect = function(itemType) {
    let itemsToSelect = [];
    let title = "";
    if (itemType === 'vitamin') {
        itemsToSelect = VITAMINS.map(v => ({ name: v, img: `Assets/Items/Vitamins/${v}.png` }));
        title = "Select a Vitamin";
    } else if (itemType === 'stone') {
        const stoneTypes = ["Normal Stone", "Fire Stone", "Water Stone", "Grass Stone", "Electric Stone", "Ice Stone", "Fighting Stone", "Poison Stone", "Ground Stone", "Flying Stone", "Psychic Stone", "Bug Stone", "Rock Stone", "Ghost Stone", "Dragon Stone", "Steel Stone", "Dark Stone", "Fairy Stone"];
        itemsToSelect = stoneTypes.map(s => ({ name: s, img: `Assets/Items/Stones/${s}.png` }));
        title = "Select an Evolution Stone";
    }

    let html = `
        <div style="display: flex; flex-direction: column; align-items: center; padding: 20px; color: white;">
            <div style="font-size: 20px; font-weight: bold; margin-bottom: 20px;">Cost: 2 Tokens</div>
            <div style="display: flex; flex-wrap: wrap; gap: 10px; justify-content: center;">
    `;

    itemsToSelect.forEach(item => {
        html += `
            <div onclick="window.confirmTokenItemSelect('${item.name}')" style="background: #2c3e50; border: 2px solid #3498db; border-radius: 10px; padding: 10px; text-align: center; cursor: pointer; transition: transform 0.2s; width: 100px; height: 110px; display: flex; flex-direction: column; align-items: center; justify-content: flex-start; box-sizing: border-box;">
                <img src="${item.img}" style="width: 48px; height: 48px; object-fit: contain; margin-bottom: 5px;">
                <div style="font-size: 12px; font-weight: bold;">${item.name}</div>
            </div>
        `;
    });

    html += `
            </div>
            <button onclick="window.showCalendar('shop')" style="margin-top: 20px; padding: 10px 20px; background: #e74c3c; color: white; border: none; border-radius: 5px; cursor: pointer; font-weight: bold;">Cancel</button>
        </div>
    `;

    if (window.showModal) {
        window.showModal(title, html, "window-token-select", "600px", "auto");
    }
};

window.confirmTokenItemSelect = function(itemName) {
    handleTokenPurchase(2, () => {
        if (!state.backpack.stones[itemName]) {
            state.backpack.stones[itemName] = 0;
        }
        state.backpack.stones[itemName] += 1;

        if (window.showGameAlert) window.showGameAlert(`Bought 1x ${itemName}!`);
        // The handleTokenPurchase already navigates back to 'shop' calendar tab
    });
};

window.renderTokenShopHtml = renderTokenShopHtml;
