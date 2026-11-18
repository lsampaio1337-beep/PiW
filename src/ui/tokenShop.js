import { state } from '../state.js';
import { VITAMINS } from '../constants.js';

const STONE_TYPES = [
    "Normal Stone", "Fire Stone", "Water Stone", "Grass Stone", "Electric Stone", "Ice Stone",
    "Fighting Stone", "Poison Stone", "Ground Stone", "Flying Stone", "Psychic Stone", "Bug Stone",
    "Rock Stone", "Ghost Stone", "Dragon Stone", "Steel Stone", "Dark Stone", "Fairy Stone"
];

export function renderTokenShopHtml() {
    const tokens = state.trainer.tokens || 0;
    return `
        <div class="tshop-root">
            <div class="tshop-wallet">
                <div class="tshop-wallet-left">
                    <img src="Assets/Extra/Token.png" class="tshop-wallet-icon" alt="Token">
                    <div>
                        <div class="tshop-wallet-label">Available Balance</div>
                        <div class="tshop-wallet-amount">${tokens.toLocaleString('en-US')} Daily Tokens</div>
                    </div>
                </div>
                <span class="piw-badge is-teal">Earn tokens from Daily Rewards &amp; Challenges</span>
            </div>

            ${getTokenShopCategoriesHtml()}
        </div>
    `;
}

const TOKEN_SHOP_ITEMS = [
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
    },
    {
        id: 'unlock_daycare',
        name: 'Unlock Daycare Upgrade',
        img: 'Assets/Items/Upgrades/Daycare1.png',
        desc: 'Allow you to buy upgrades for the Daycare.',
        price: 1,
        isUnlock: true,
        unlockKey: 'daycare',
        action: 'window.buyTokenUnlock("daycare")'
    }
];

function renderSelectableItemActions(item) {
    const tokens = state.trainer.tokens || 0;
    const canRand = tokens >= item.randomPrice;
    const canChoose = tokens >= item.selectPrice;
    return `
        <div class="tshop-card-actions">
            <button class="piw-btn piw-btn-success piw-btn-sm ${canRand ? '' : 'is-disabled'}" onclick="window.buyTokenItemRandom('${item.id}')" style="flex: 1; flex-direction: column; gap: 2px;">
                <span>Random</span>
                <span style="display: inline-flex; align-items: center; gap: 3px;"><img src="Assets/Extra/Token.png" style="width:12px;"> ${item.randomPrice}</span>
            </button>
            <button class="piw-btn piw-btn-primary piw-btn-sm ${canChoose ? '' : 'is-disabled'}" onclick="window.showTokenItemSelect('${item.id}')" style="flex: 1; flex-direction: column; gap: 2px;">
                <span>Choose</span>
                <span style="display: inline-flex; align-items: center; gap: 3px;"><img src="Assets/Extra/Token.png" style="width:12px;"> ${item.selectPrice}</span>
            </button>
        </div>
    `;
}

function renderLockedItemActions() {
    return `
        <button disabled class="piw-btn piw-btn-secondary piw-btn-sm is-disabled" style="width: 100%;">
            Need to unlock Daycare
        </button>
    `;
}

function renderBuyableItemActions(item) {
    const tokens = state.trainer.tokens || 0;
    const canAfford = tokens >= item.price;
    return `
        <button onclick='${item.action}' class="piw-btn piw-btn-success piw-btn-sm ${canAfford ? '' : 'is-disabled'}" style="width: 100%;">
            Buy for <img src="Assets/Extra/Token.png" style="width:13px;"> ${item.price}
        </button>
    `;
}

function renderTokenShopItem(item) {
    let isLocked = false;
    if (item.unlockKey === 'daycare' && (!state.stats || !state.stats.hasSeenDaycare)) {
        isLocked = true;
    }

    let ownedBadge = '';
    if (item.id === 'masterball') {
        const owned = state.backpack?.pokeballs?.Masterball || 0;
        ownedBadge = `<span class="piw-badge is-blue" style="font-size: 10px; padding: 1px 7px;">Owned: ${owned}</span>`;
    }

    let html = `
        <div class="tshop-card">
            <div class="tshop-card-title">${item.name}</div>
            <img src="${item.img}" class="tshop-card-icon" alt="${item.name}">
            ${ownedBadge}
            <div class="tshop-card-desc">${item.desc}</div>
    `;

    if (item.isSelectable) {
        html += renderSelectableItemActions(item);
    } else {
        if (isLocked) {
            html += renderLockedItemActions();
        } else {
            html += renderBuyableItemActions(item);
        }
    }

    html += `</div>`;
    return html;
}

function renderCategory(title, items) {
    if (items.length === 0) return '';
    let html = `
        <div style="display: flex; flex-direction: column; width: 100%;">
            <div class="cal-section-header">
                <h2 class="cal-section-title">${title}</h2>
            </div>
            <div class="tshop-grid">
    `;
    items.forEach(item => {
        html += renderTokenShopItem(item);
    });
    html += `
            </div>
        </div>
    `;
    return html;
}

function getTokenShopCategoriesHtml() {
    let html = '';

    // Filter out already unlocked items
    const availableItems = TOKEN_SHOP_ITEMS.filter(item => {
        if (item.isUnlock) {
            if (!state.stats.upgradesUnlocked) {
                state.stats.upgradesUnlocked = {};
            }
            if (state.stats.upgradesUnlocked[item.unlockKey]) {
                return false; // Skip if already unlocked
            }
        }
        return true;
    });

    const consumables = availableItems.filter(item => !item.isUnlock);
    const upgrades = availableItems.filter(item => item.isUnlock);

    html += renderCategory('Consumables', consumables);
    html += renderCategory('Upgrades', upgrades);

    return html;
}

function handleTokenPurchase(cost, callback) {
    if ((state.trainer.tokens || 0) >= cost) {
        state.trainer.tokens -= cost;
        callback();
        if (window.showCalendar && document.getElementById('window-calendar') && document.getElementById('window-calendar').offsetParent !== null) {
            window.showCalendar('shop');
        }
        if (window.updateUI) window.updateUI();

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
    } else {
        if (window.showGameAlert) {
            window.showGameAlert(`Not enough tokens! You need ${cost}.`, 'window-calendar');
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
            if (window.showGameAlert) window.showGameAlert("Bought 1x Masterball!", 'window-calendar');
        });
    }
};

window.buyTokenUnlock = function(unlockKey) {
    handleTokenPurchase(1, () => {
        if (!state.stats.upgradesUnlocked) {
            state.stats.upgradesUnlocked = {};
        }
        state.stats.upgradesUnlocked[unlockKey] = true;
        if (window.showGameAlert) window.showGameAlert(`Unlocked ${unlockKey} upgrades!`, 'window-calendar');
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
            const index = Math.floor(Math.random() * STONE_TYPES.length);
            itemAwarded = STONE_TYPES[index];
            if (!state.backpack.stones[itemAwarded]) state.backpack.stones[itemAwarded] = 0;
            state.backpack.stones[itemAwarded] += 1;
        }
        if (window.showGameAlert) window.showGameAlert(`Got 1x ${itemAwarded}!`, 'window-calendar');
    });
};

window.closeTokenInnerModal = function() {
    const existing = document.getElementById('token-inner-modal');
    if (existing) existing.remove();
};

window.showTokenItemSelect = function(itemType) {
    let itemsToSelect = [];
    let title = "";
    let gridCols = 3;
    if (itemType === 'vitamin') {
        itemsToSelect = VITAMINS.map(v => ({ name: v, img: `Assets/Items/Vitamins/${v}.png` }));
        title = "Select a Vitamin";
        gridCols = 3; // 2 rows, 3 columns
    } else if (itemType === 'stone') {
        itemsToSelect = STONE_TYPES.map(s => ({ name: s, img: `Assets/Items/Stones/${s}.png` }));
        title = "Select an Evolution Stone";
        gridCols = 6; // 3 rows, 6 columns
    }

    window.closeTokenInnerModal();

    const container = document.getElementById('window-calendar-content') || document.getElementById('calendar-content-area');
    if (!container) return;

    container.style.position = 'relative';

    const overlay = document.createElement('div');
    overlay.id = 'token-inner-modal';
    overlay.className = 'piw-inner-overlay';
    overlay.style.zIndex = '50';

    let gridHtml = `
        <div class="floating-window" style="position: relative; width: 100%; max-width: ${gridCols === 6 ? '740px' : '460px'}; max-height: 90%; display: flex; flex-direction: column; overflow: hidden;">
            <div class="window-header" style="position: relative; cursor: default;">
                <span>${title}</span>
                <div class="window-header-actions">
                    <span class="window-ctrl-btn is-close" onclick="window.closeTokenInnerModal()" title="Close">X</span>
                </div>
            </div>
            <div style="padding: 16px; display: flex; flex-direction: column; align-items: center; gap: 12px; overflow-y: auto;">
                <span class="piw-badge is-amber"><img src="Assets/Extra/Token.png" style="width:14px;"> Cost: 2 Tokens</span>
                <div class="tshop-select-grid" style="grid-template-columns: repeat(${gridCols}, 1fr); width: 100%;">
    `;

    itemsToSelect.forEach(item => {
        const owned = (state.backpack?.stones?.[item.name]) || 0;
        gridHtml += `
            <div class="piw-card is-interactive" onclick="window.confirmTokenItemSelect('${item.name}')" style="padding: 8px 6px; text-align: center; display: flex; flex-direction: column; align-items: center; justify-content: center; gap: 4px;">
                <img src="${item.img}" style="width: 36px; height: 36px; object-fit: contain;">
                <div style="font-size: 11px; font-weight: 700; color: var(--piw-text-primary); line-height: 1.2;">${item.name}</div>
                <div style="font-size: 10px; color: var(--piw-text-muted);">Owned: ${owned}</div>
            </div>
        `;
    });

    gridHtml += `
                </div>
                <button class="piw-btn piw-btn-danger" onclick="window.closeTokenInnerModal()">Cancel</button>
            </div>
        </div>
    `;

    if (window.windowManager && typeof window.windowManager._parseAndSanitizeToElement === 'function') {
        window.windowManager._parseAndSanitizeToElement(gridHtml, overlay);
    } else {
        const doc = new DOMParser().parseFromString(gridHtml, 'text/html');
        overlay.replaceChildren(...doc.body.childNodes);
    }
    container.appendChild(overlay);
};

window.confirmTokenItemSelect = function(itemName) {
    window.closeTokenInnerModal();
    handleTokenPurchase(2, () => {
        if (!state.backpack.stones[itemName]) {
            state.backpack.stones[itemName] = 0;
        }
        state.backpack.stones[itemName] += 1;

        if (window.showGameAlert) window.showGameAlert(`Bought 1x ${itemName}!`, 'window-calendar');
        // The handleTokenPurchase already navigates back to 'shop' calendar tab
    });
};

window.renderTokenShopHtml = renderTokenShopHtml;
