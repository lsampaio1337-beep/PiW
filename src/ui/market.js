import { VITAMINS } from "../constants.js";
import { calculatePP, getCapacity, getCurrentCount } from "../mathEngine.js";
import { state } from '../state.js';
import { updateUI, showModal } from '../ui.js';
import { escapeHTML } from '../utils/stringUtils.js';

export function getMarketAlertTarget() {
    const innerModal = document.getElementById('main-view-inner-modal');
    if (innerModal && innerModal.offsetParent !== null) {
        return 'main-view-inner-modal-content';
    }
    return 'window-market';
}

// Helper to get a map of Pokemon Data for O(1) lookups
let _cachedPokemonDataMap = null;
function getPokemonDataMap() {
    if (state.config?.pokemonMap) {
        return state.config.pokemonMap;
    }
    if (!_cachedPokemonDataMap && state.config?.pokemonData) {
        _cachedPokemonDataMap = new Map();
        for (let i = 0; i < state.config.pokemonData.length; i++) {
            const pd = state.config.pokemonData[i];
            if (pd) {
                _cachedPokemonDataMap.set(pd.id, pd);
            }
        }
    }
    return _cachedPokemonDataMap;
}

function lookupPokemonInMap(map, id) {
    if (!map || id == null) return undefined;
    return map.get(id) || map.get(Number(id));
}

function escapeJS(str) {
    if (typeof str !== 'string') return str;
    return str.replace(/\\/g, '\\\\')
              .replace(/'/g, "\\'")
              .replace(/"/g, '\\"')
              .replace(/\n/g, '\\n')
              .replace(/\r/g, '\\r');
}

function safeSetHTML(element, htmlContent) {
    if (window.windowManager && typeof window.windowManager._parseAndSanitizeToElement === 'function') {
        window.windowManager._parseAndSanitizeToElement(htmlContent, element);
    } else {
        const parser = new DOMParser();
        const doc = parser.parseFromString(htmlContent, 'text/html');
        element.replaceChildren(...doc.body.childNodes);
    }
}


window.sanitizeMarketNumberInput = function(input) {
    let val = input.value.replace(/\D/g, '');
    if (val.length > 3) val = val.substring(0, 3);
    input.value = val;
};

window.sanitizeMarketQInput = function(input) {
    let val = input.value.replace(/\D/g, '');
    if (val.length > 3) val = val.substring(0, 3);
    if (val.length > 1) {
        val = val.substring(0, 1) + '.' + val.substring(1);
    }
    input.value = val;
};

export function setupMarket(vCenter) {
    vCenter.replaceChildren();

    const container = document.createElement('div');
    container.style.cssText = "position: absolute; top: 0; left: 0; width: 100%; height: 100%; display: flex; justify-content: space-between; align-items: center; padding: 0 10%; box-sizing: border-box;";

    const btnHealAll = document.createElement('button');
    btnHealAll.id = 'btn-heal-all';
    btnHealAll.className = 'pcpm-btn pcpm-btn-heal';
    btnHealAll.style.marginTop = '-20%';
    btnHealAll.textContent = 'Heal';

    const rightPanel = document.createElement('div');
    rightPanel.style.cssText = "display: flex; flex-direction: column; gap: 20px; margin-top: -20%;";

    const btnMarket = document.createElement('button');
    btnMarket.id = 'btn-market-market';
    btnMarket.className = 'pcpm-btn pcpm-btn-market';
    btnMarket.textContent = 'Market';

    rightPanel.appendChild(btnMarket);
    container.appendChild(btnHealAll);
    container.appendChild(rightPanel);
    vCenter.appendChild(container);

    const origHealText = btnHealAll.textContent;
    let healResetTimer = null;
    btnHealAll.addEventListener('click', () => {
        state.party.forEach(p => p.currentHp = p.maxHp);
        if (typeof window !== 'undefined' && typeof window.trackDailyChallenge === 'function') window.trackDailyChallenge('heal_center');
        state.storage.forEach(p => p.currentHp = p.maxHp);
        updateUI();
        if (healResetTimer) clearTimeout(healResetTimer);
        btnHealAll.textContent = 'Healed!';
        healResetTimer = setTimeout(() => {
            btnHealAll.textContent = origHealText;
            healResetTimer = null;
        }, 1000);
    });

    btnMarket.addEventListener('click', () => {
        window.openPokeMarketBuy();
    });
}


function getMarketBuyHtml(hasUnlockedUpgrades = true) {
    return `
        <div id="market-buy-wrapper" class="market-shell">
            <div class="market-subnav">
                <div class="piw-tab-bar">
                    <button onclick="window.openPokeMarketBuy()" class="piw-tab-btn is-active-buy">Buy</button>
                    <button onclick="if(window.openPokeMarketSell) window.openPokeMarketSell()" class="piw-tab-btn">Sell</button>
                </div>
                <div class="piw-tab-bar">
                    <button id="market-tab-buy-pokeballs" onclick="window.renderPokeMarketTab('pokeballs')" class="piw-tab-btn">Balls</button>
                    <button id="market-tab-buy-potions" onclick="window.renderPokeMarketTab('potions')" class="piw-tab-btn">Potions</button>
                    <button id="market-tab-buy-stones" onclick="window.renderPokeMarketTab('stones')" class="piw-tab-btn">Stones</button>
                    <button id="market-tab-buy-vitamins" onclick="window.renderPokeMarketTab('vitamins')" class="piw-tab-btn">Vitamins</button>
                    ${hasUnlockedUpgrades ? `<button id="market-tab-buy-upgrades" onclick="window.renderPokeMarketTab('upgrades')" class="piw-tab-btn">Upgrades</button>` : ''}
                </div>
            </div>
            <div id="market-buy-content" class="market-grid-scroll">
                <!-- Cards injected here -->
            </div>
        </div>
    `;
}

function getMarketBuyTitleHtml() {
    return `PokéMart`;
}

export function openPokeMarketBuy() {
    // Glass is available by default now, so upgrades are always unlocked.
    const hasUnlockedUpgrades = true;

    const html = getMarketBuyHtml(hasUnlockedUpgrades);

    const overlay = document.getElementById('main-view-inner-modal-overlay');
    const title = document.getElementById('main-view-inner-modal-title');
    const content = document.getElementById('main-view-inner-modal-content');
    const moneyDisplay = document.getElementById('inner-modal-money-display');
    if (moneyDisplay) {
        moneyDisplay.textContent = `$ ${state.trainer.money.toLocaleString('en-US')}`;
        moneyDisplay.style.display = 'block';
    }

    const titleHtml = getMarketBuyTitleHtml();

    if (overlay && title && content) {
        safeSetHTML(title, titleHtml);
        safeSetHTML(content, html);
        overlay.style.display = 'flex';
    } else {
        showModal('Market', html, 'window-market');

        const modalBox = document.getElementById('modal-content-box');
        if (modalBox) {
            modalBox.dataset.originalStyles = modalBox.getAttribute('style') || '';
            modalBox.style.width = 'max-content';
            modalBox.style.height = 'max-content';
            modalBox.style.maxWidth = '90%';
            modalBox.style.maxHeight = '95%';
        }
    }

    setTimeout(() => {
        if (window.renderPokeMarketTab) {
            window.renderPokeMarketTab('pokeballs');
        } else {
            renderPokeMarketTab('pokeballs');
        }
    }, 10);
}

export function parseMarketQuantity(valStr) {
    if (!valStr) return 1;
    let val = valStr.toUpperCase().trim().replace(/,/g, '');
    let parsed = parseFloat(val);
    if (isNaN(parsed) || parsed <= 0) return 1;
    return Math.floor(parsed);
}

export function formatMarketNumber(num) {
    return num.toLocaleString('en-US');
}


function getMarketItems(category) {
    let items = [];
    if (category === 'upgrades') {
        let ballTier = state.stats.upgrades.ballsTier || 0;
        let potionTier = state.stats.upgrades.potionsTier || 0;
        let boxTier = state.stats.upgrades.boxTier || 0;
        let glassTier = state.stats.upgrades.glassTier || 0;
        let smartwatchTier = state.stats.upgrades.smartwatchTier || 0;
        let speedTier = state.stats.upgrades.speedTier || 0;
        let lootTier = state.stats.upgrades.lootTier || 0;
        let daycareTier = state.stats.upgrades.daycareTier || 0;

        let ballUpgrade = state.config.balance.expansions.ballPocket[ballTier];
        let potionUpgrade = state.config.balance.expansions.potionSatchel[potionTier];
        let boxUpgrade = state.config.balance.expansions.pokemonBox[boxTier];
        let glassUpgrade = state.config.balance.expansions.glass[glassTier];
        let smartwatchUpgrade = state.config.balance.expansions.smartwatch[smartwatchTier];
        let speedUpgrade = state.config.balance.expansions.speed[speedTier];
        let lootUpgrade = state.config.balance.expansions.loot[lootTier];
        let daycareUpgrade = state.config.balance.expansions.daycare[daycareTier];

        let unlocked = state.stats.upgradesUnlocked || {};

        if (ballUpgrade && unlocked['balls']) items.push({ ...ballUpgrade, type: 'balls', img: './Assets/Items/Upgrades/' + ballUpgrade.name + '.png', attrLabel: '+' + ballUpgrade.increment + ' Balls<br>in stock' });
        if (potionUpgrade && unlocked['potions']) items.push({ ...potionUpgrade, type: 'potions', img: './Assets/Items/Upgrades/' + potionUpgrade.name + '.png', attrLabel: '+' + potionUpgrade.increment + ' Potions<br>in stock' });
        if (boxUpgrade && unlocked['box']) items.push({ ...boxUpgrade, type: 'box', img: './Assets/Items/Upgrades/' + boxUpgrade.name + '.png', attrLabel: '+' + boxUpgrade.increment + ' Pokemons<br>in backpack' });
        if (glassUpgrade) items.push({ ...glassUpgrade, type: 'glass', img: './Assets/Items/Upgrades/' + glassUpgrade.name + '.png', attrLabel: glassUpgrade.description });
        if (smartwatchUpgrade && unlocked['smartwatch']) items.push({ ...smartwatchUpgrade, type: 'smartwatch', img: './Assets/Items/Upgrades/' + smartwatchUpgrade.name + '.png', attrLabel: smartwatchUpgrade.description });
        if (speedUpgrade && unlocked['speed']) items.push({ ...speedUpgrade, type: 'speed', img: './Assets/Items/Upgrades/' + speedUpgrade.name + '.png', attrLabel: speedUpgrade.description });
        if (lootUpgrade && unlocked['loot']) items.push({ ...lootUpgrade, type: 'loot', img: './Assets/Items/Upgrades/' + lootUpgrade.name + '.png', attrLabel: lootUpgrade.description });
        if (daycareUpgrade && unlocked['daycare']) items.push({ ...daycareUpgrade, type: 'daycare', img: './Assets/Items/Upgrades/' + daycareUpgrade.name + '.png', attrLabel: daycareUpgrade.description });

        items = items.map(u => ({
            name: u.name,
            displayName: u.displayName,
            price: u.cost,
            img: u.img,
            attrLabel: u.attrLabel,
            upgradeType: u.type
        }));
    } else if (category === 'pokeballs') {
        items = state.config.balance.items.pokeballs.map(b => ({
            name: b.name,
            price: b.price,
            img: `./Assets/Items/Balls/${b.name}.png`,
            attrLabel: b.name === 'Masterball' ? `Efficiency: 100%` : `Efficiency: ${b.multiplier}x`
        }));
    } else if (category === 'potions') {
        items = state.config.balance.items.potions
            .filter(p => p.name !== 'Max Potion')
            .map(p => {
                const invName = p.name === 'Big' ? 'Big Potion' : p.name;
                return {
                    name: invName,
                    price: p.price,
                    img: `./Assets/Items/Potions/${invName}.png`,
                    attrLabel: `Heal: ${p.heal >= 999999 ? '100%' : p.heal + ' HP'}`
                };
            });
    } else if (category === 'stones') {
        const badges = state.trainer.badges || 0;
        const stonePrice = Math.max(2500, 2500 * badges);
        let stoneKeys = Object.keys(state.backpack.stones).filter(k => !VITAMINS.includes(k));
        stoneKeys.sort((a, b) => a.localeCompare(b));
        items = stoneKeys.map(stoneName => {
            return {
                name: stoneName,
                price: stonePrice,
                img: `./Assets/Items/Stones/${stoneName}.png`,
                attrLabel: `Evolution Item`
            };
        });
    } else if (category === 'vitamins') {
        const badges = state.trainer.badges || 0;
        const getVitaminPrice = (vitaminName, badges) => {
            switch(vitaminName) {
                case 'HP Up': return Math.max(2500, 2500 * badges);
                case 'Carbo Speed': return Math.max(1250, 1250 * badges);
                case 'Protein Atk': return Math.max(1875, 1875 * badges);
                case 'Calcium SpAtk': return Math.max(1875, 1875 * badges);
                case 'Iron Def': return Math.max(1563, Math.ceil(1562.5 * badges));
                case 'Zinc SpDef': return Math.max(1563, Math.ceil(1562.5 * badges));
                default: return Math.max(2500, 2500 * badges);
            }
        };
        items = VITAMINS.map(vitaminName => {
            return {
                name: vitaminName,
                price: getVitaminPrice(vitaminName, badges),
                img: `./Assets/Items/Vitamins/${vitaminName}.png`,
                attrLabel: `Stat Item`
            };
        });
    }
    return items;
}


function generateMarketItemCard(item, category, stock) {
    const safeId = escapeHTML(item.name.replace(/\s+/g, ''));
    const safeItemNameAttr = escapeHTML(item.name);
    const safeItemNameJS = escapeHTML(escapeJS(item.name));
    const safeCategoryAttr = escapeHTML(category);
    const safeCategoryJS = escapeHTML(escapeJS(category));

    let buyAction = `if(window.buyItem) window.buyItem('${safeItemNameJS}', ${item.price}, '${safeCategoryJS}', null, '${escapeHTML(escapeJS(item.displayName || item.name))}')`;
    if (category === 'upgrades') {
        const safeUpgradeTypeJS = escapeHTML(escapeJS(item.upgradeType));
        buyAction = `if(window.buyItem) window.buyItem('${safeItemNameJS}', ${item.price}, '${safeCategoryJS}', '${safeUpgradeTypeJS}', '${escapeHTML(escapeJS(item.displayName || item.name))}')`;
    }

    const safeImg = escapeHTML(item.img);
    let escapedDisplayName = escapeHTML(item.displayName || item.name).replace(/&lt;br&gt;/gi, '<br>');
    if (category === 'potions') escapedDisplayName = escapedDisplayName.replace(' Potion', '<br>Potion');
    if (category === 'stones') escapedDisplayName = escapedDisplayName.replace(' Stone', '<br>Stone');
    if (category === 'upgrades' && item.upgradeType === 'daycare') {
        const parts = escapedDisplayName.split(' ');
        if (parts.length >= 2) {
            escapedDisplayName = parts.slice(0, -1).join(' ') + '<br>' + parts[parts.length - 1];
        }
    }

    return `
        <div class="market-item-card" data-price="${item.price}" data-id="${safeItemNameAttr}" data-category="${safeCategoryAttr}">
            <div class="market-card-title">${escapedDisplayName}</div>
            <img src="${safeImg}" class="market-card-img">
            ${category !== 'stones' ? `<div class="market-card-attr">${item.attrLabel ? String(item.attrLabel).replace(/&lt;br&gt;/gi, '<br>') : ''}</div>` : ''}
            ${category !== 'upgrades' ? `<div class="market-card-stock">Stock: ${formatMarketNumberDown(stock)}</div>` : ''}

            <div class="market-card-footer">
                ${category !== 'upgrades' ? `
                <div class="market-qty-row">
                    <input type="text" id="buy-qty-${safeId}" value="1" oninput="if(window.updateBuyItemPrice) window.updateBuyItemPrice('${safeItemNameJS}', '${safeCategoryJS}', ${item.price})" class="market-qty-input">
                    <button onclick="if(window.buySetMax) window.buySetMax('${safeItemNameJS}', '${safeCategoryJS}', ${item.price})" class="market-max-btn">Max</button>
                </div>
                ` : ''}
                <button id="buy-btn-${safeId}" onclick="${buyAction}" class="market-final-price market-action-btn">$${formatMarketNumber(item.price)}</button>
            </div>
        </div>
    `;
}


function updateMarketTabStyles(activeCategory) {
    const tabs = ['pokeballs', 'potions', 'stones', 'vitamins', 'upgrades'];
    tabs.forEach(tab => {
        const btn = document.getElementById(`market-tab-buy-${tab}`);
        if (btn) {
            btn.classList.toggle('is-active-buy', tab === activeCategory);
        }
    });
}

function generateMarketItemsHTML(items, category) {
    if (category === 'upgrades' && items.length === 0) {
        return `<div style="text-align: center; font-size: 16px; color: #94a3b8; width: 100%; padding: 40px 16px;">No available upgrade to be bought.</div>`;
    }

    let html = `<div class="market-grid">`;
    items.forEach(item => {
        let stock = 0;
        const targetCategory = category === 'vitamins' ? 'stones' : category;
        if (category !== 'upgrades' && state.backpack[targetCategory] && state.backpack[targetCategory][item.name]) {
            stock = state.backpack[targetCategory][item.name];
        }

        html += generateMarketItemCard(item, category, stock);
    });
    html += `</div>`;

    return html;
}

export function renderPokeMarketTab(category) {
    const content = document.getElementById('market-buy-content');
    if (!content) return;

    updateMarketTabStyles(category);

    content.dataset.category = category;

    let items = getMarketItems(category);
    let capacityBanner = '';
    if (category === 'pokeballs' || category === 'potions') {
        const type = category === 'pokeballs' ? 'balls' : 'potions';
        const used = getCurrentCount(state, type);
        const cap = getCapacity(state, type);
        const pct = cap > 0 ? Math.min(100, Math.round((used / cap) * 100)) : 0;
        const label = category === 'pokeballs' ? 'Ball Pocket' : 'Potion Satchel';
        const isFull = used >= cap;
        capacityBanner = `
            <div class="bp-capacity-banner">
                <span style="font-size: 12px; font-weight: 700; color: var(--piw-text-primary);">${label}: <span class="piw-badge ${isFull ? 'is-red' : 'is-blue'}">${used.toLocaleString('en-US')} / ${cap.toLocaleString('en-US')}</span></span>
                <div class="piw-progress-track" style="flex: 1; max-width: 240px; height: 7px;">
                    <div class="piw-progress-fill ${isFull ? 'is-amber' : 'is-green'}" style="width: ${pct}%;"></div>
                </div>
            </div>
        `;
    }
    let html = capacityBanner + generateMarketItemsHTML(items, category);

    safeSetHTML(content, html);
}


export function buyItem(itemId, baseCost, category, upgradeType = null, displayName = null) { return newBuyItem(itemId, baseCost, category, upgradeType, displayName); }


export function formatMarketNumberDown(num) {
    return num.toLocaleString('en-US');
}

export function updateBuyItemPrice(itemId, category, basePrice) {
    const safeId = itemId.replace(/\s+/g, '');
    const input = document.getElementById(`buy-qty-${safeId}`);
    const btnDisplay = document.getElementById(`buy-btn-${safeId}`);
    if (!input || !btnDisplay) return;

    let qty = parseMarketQuantity(input.value);

    // Limit qty based on available capacity if applicable
    if ((category === 'pokeballs' && itemId !== 'Masterball') || category === 'potions') {
        const type = category === 'pokeballs' ? 'balls' : 'potions';
        const currentCount = getCurrentCount(state, type);
        const capacity = getCapacity(state, type);
        const spaceLeft = Math.max(0, capacity - currentCount);

        if (qty > spaceLeft) {
            qty = spaceLeft;
            input.value = spaceLeft > 0 ? formatMarketNumberDown(spaceLeft) : "0";
        }
    }

    // Fallback limit for items without capacity to avoid extreme numbers
    if (qty > 1000000) {
        qty = 1000000;
        input.value = (1000000).toLocaleString('en-US');
    }

    let totalVal = qty * basePrice;
    btnDisplay.textContent = "$" + formatMarketNumber(totalVal);
}

export function buySetMax(itemId, category, basePrice) {
    const safeId = itemId.replace(/\s+/g, '');
    const input = document.getElementById(`buy-qty-${safeId}`);
    if (!input) return;

    const money = state.trainer?.money || 0;
    const maxAffordable = basePrice > 0 ? Math.floor(money / basePrice) : 1000000;

    if ((category === 'pokeballs' && itemId !== 'Masterball') || category === 'potions') {
        const type = category === 'pokeballs' ? 'balls' : 'potions';
        const currentCount = getCurrentCount(state, type);
        const capacity = getCapacity(state, type);
        const spaceLeft = Math.max(0, capacity - currentCount);
        const bestQty = spaceLeft > 0 ? Math.max(1, Math.min(spaceLeft, maxAffordable || 1)) : 0;

        input.value = formatMarketNumberDown(bestQty);
    } else {
        const bestQty = Math.min(1000000, Math.max(1, maxAffordable));
        input.value = formatMarketNumberDown(bestQty);
    }

    updateBuyItemPrice(itemId, category, basePrice);
}

export function newBuyItem(itemId, baseCost, category, upgradeType = null, displayName = null) {
    const safeId = itemId.replace(/\s+/g, '');
    const input = document.getElementById(`buy-qty-${safeId}`);
    let qty = 1;

    if (category !== 'upgrades' && input) {
        qty = parseMarketQuantity(input.value);
    }

    if (qty <= 0) {
        if (window.showGameAlert) window.showGameAlert("Please enter a valid quantity to buy.", getMarketAlertTarget());
        return;
    }

    if (category === 'pokeballs' || category === 'potions') {
        const type = category === 'pokeballs' ? 'balls' : 'potions';
        const currentCount = getCurrentCount(state, type);
        const capacity = getCapacity(state, type);
        let spaceLeft = Math.max(0, capacity - currentCount);
        if (itemId === 'Masterball') spaceLeft = Infinity;
        if (qty > spaceLeft) {
            if (window.showGameAlert) window.showGameAlert(`Not enough space! You can only buy ${spaceLeft} more ${category}`, "market-buy-wrapper");
            return;
        }
    }

    const totalCost = baseCost * qty;

    if (state.trainer.money >= totalCost) {
        state.trainer.money -= totalCost;
        if (category === 'upgrades') {
            state.stats.upgrades[upgradeType + 'Tier'] += 1;
        } else {
            const targetCategory = category === 'vitamins' ? 'stones' : category;
            if (state.backpack[targetCategory][itemId] === undefined) {
                 state.backpack[targetCategory][itemId] = 0;
            }
            state.backpack[targetCategory][itemId] += qty;
        }

        if (typeof window.trackDailyChallenge === 'function') {
            if (category === 'pokeballs') {
                window.trackDailyChallenge('spend_balls', { amount: totalCost });
            } else if (category === 'potions') {
                window.trackDailyChallenge('spend_potions', { amount: totalCost });
            }
        }

        updateUI();
        const moneyDisplay = document.getElementById('inner-modal-money-display');
        if (moneyDisplay) {
            moneyDisplay.textContent = `$ ${state.trainer.money.toLocaleString('en-US')}`;
        }
        if (window.showGameAlert) window.showGameAlert(`Bought ${qty.toLocaleString('en-US')}x ${(displayName || itemId).replace(/&lt;br&gt;/gi, ' ').replace(/<br>/gi, ' ')} for ${totalCost.toLocaleString('en-US')}!`, getMarketAlertTarget());
        renderPokeMarketTab(category);
    } else {
        if (window.showGameAlert) window.showGameAlert(`Not enough money! You need ${totalCost.toLocaleString('en-US')} but only have ${state.trainer.money.toLocaleString('en-US')}.`, getMarketAlertTarget());
    }
}



function getMarketSellHtml() {
    return `
        <div id="market-sell-wrapper" class="market-shell">
            <div class="market-subnav">
                <div class="piw-tab-bar">
                    <button onclick="window.openPokeMarketBuy()" class="piw-tab-btn">Buy</button>
                    <button onclick="if(window.openPokeMarketSell) window.openPokeMarketSell()" class="piw-tab-btn is-active-sell">Sell</button>
                </div>
                <div class="piw-tab-bar">
                    <button id="market-tab-sell-pokeballs" onclick="if(window.renderPokeMarketSellTab) window.renderPokeMarketSellTab('pokeballs')" class="piw-tab-btn">Balls</button>
                    <button id="market-tab-sell-potions" onclick="if(window.renderPokeMarketSellTab) window.renderPokeMarketSellTab('potions')" class="piw-tab-btn">Potions</button>
                    <button id="market-tab-sell-stones" onclick="if(window.renderPokeMarketSellTab) window.renderPokeMarketSellTab('stones')" class="piw-tab-btn">Stones</button>
                    <button id="market-tab-sell-vitamins" onclick="if(window.renderPokeMarketSellTab) window.renderPokeMarketSellTab('vitamins')" class="piw-tab-btn">Vitamins</button>
                    <button id="market-tab-sell-pokemon" onclick="if(window.renderPokeMarketSellTab) window.renderPokeMarketSellTab('pokemon')" class="piw-tab-btn">Pokemon</button>
                </div>
            </div>

            <div id="market-pokemon-sell-controls" class="market-sell-controls">
                <div class="market-sell-summary">
                    <div class="market-sell-stats">
                        <span>Selected: <span id="market-pokemon-sell-count">0</span></span>
                        <span style="color: #64748b;">|</span>
                        <span style="color: #4ade80;">Total: $<span id="market-pokemon-sell-total">0</span></span>
                    </div>
                    <div class="market-sell-btns">
                        <select id="market-filter-sort" class="piw-select" style="padding: 4px 8px; font-size: 12px;" onchange="if(window.setMarketPokemonSort) window.setMarketPokemonSort(this.value)">
                            <option value="default">Sort: Default</option>
                            <option value="price-desc">Price: High ↓</option>
                            <option value="price-asc">Price: Low ↑</option>
                            <option value="q-asc">Quality: Low ↑</option>
                            <option value="level-asc">Level: Low ↑</option>
                            <option value="iv-asc">Sum IV: Low ↑</option>
                        </select>
                        <button onclick="if(window.toggleMarketPokemonFilters) window.toggleMarketPokemonFilters()" class="market-ctrl-btn" style="background: #334155;">🔍 Filters</button>
                        <button onclick="if(window.marketSelectAllPokemonForSale) window.marketSelectAllPokemonForSale()" class="market-ctrl-btn" style="background: #2563eb;">Select Visible</button>
                        <button onclick="if(window.marketDeselectAllPokemonForSale) window.marketDeselectAllPokemonForSale()" class="market-ctrl-btn" style="background: #475569;">Deselect All</button>
                        <button onclick="if(window.marketSellSelectedPokemon) window.marketSellSelectedPokemon()" class="market-ctrl-btn" style="background: #dc2626;">Sell Selected</button>
                    </div>
                </div>

                <div id="market-pokemon-filters" class="piw-filter-bar" style="display: none;">
                    <div class="piw-filter-group">
                        <label class="piw-filter-label">Name</label>
                        <input type="text" id="market-filter-name" placeholder="Search..." oninput="if(window.renderPokeMarketSellTab) window.renderPokeMarketSellTab('pokemon')" class="piw-filter-input" style="width: 90px;">
                    </div>
                    <div class="piw-filter-group">
                        <label class="piw-filter-label">Lv</label>
                        <input type="text" id="market-filter-level-min" placeholder="Min" oninput="if(window.sanitizeMarketNumberInput) window.sanitizeMarketNumberInput(this); if(window.renderPokeMarketSellTab) window.renderPokeMarketSellTab('pokemon')" class="piw-filter-input" style="width: 44px;">
                        <span style="color: #64748b;">-</span>
                        <input type="text" id="market-filter-level-max" placeholder="Max" oninput="if(window.sanitizeMarketNumberInput) window.sanitizeMarketNumberInput(this); if(window.renderPokeMarketSellTab) window.renderPokeMarketSellTab('pokemon')" class="piw-filter-input" style="width: 44px;">
                    </div>
                    <div class="piw-filter-group">
                        <label class="piw-filter-label">Q</label>
                        <input type="text" id="market-filter-q-min" placeholder="Min" oninput="if(window.sanitizeMarketQInput) window.sanitizeMarketQInput(this); if(window.renderPokeMarketSellTab) window.renderPokeMarketSellTab('pokemon')" class="piw-filter-input" style="width: 44px;">
                        <span style="color: #64748b;">-</span>
                        <input type="text" id="market-filter-q-max" placeholder="Max" oninput="if(window.sanitizeMarketQInput) window.sanitizeMarketQInput(this); if(window.renderPokeMarketSellTab) window.renderPokeMarketSellTab('pokemon')" class="piw-filter-input" style="width: 44px;">
                    </div>
                    <div class="piw-filter-group">
                        <label class="piw-filter-label">∑IV</label>
                        <input type="text" id="market-filter-sumiv-min" placeholder="Min" oninput="if(window.sanitizeMarketNumberInput) window.sanitizeMarketNumberInput(this); if(window.renderPokeMarketSellTab) window.renderPokeMarketSellTab('pokemon')" class="piw-filter-input" style="width: 46px;">
                        <span style="color: #64748b;">-</span>
                        <input type="text" id="market-filter-sumiv-max" placeholder="Max" oninput="if(window.sanitizeMarketNumberInput) window.sanitizeMarketNumberInput(this); if(window.renderPokeMarketSellTab) window.renderPokeMarketSellTab('pokemon')" class="piw-filter-input" style="width: 46px;">
                    </div>
                    <button onclick="if(window.clearMarketPokemonFilters) window.clearMarketPokemonFilters()" style="background: rgba(231, 76, 60, 0.2); color: #f87171; border: 1px solid rgba(231, 76, 60, 0.45); border-radius: 6px; padding: 4px 10px; font-size: 11px; font-weight: bold; cursor: pointer; transition: all 0.2s;">Clear</button>
                </div>
            </div>

            <div id="market-sell-content" class="market-grid-scroll">
                <!-- Cards injected here -->
            </div>
        </div>
    `;
}

function getMarketSellTitleHtml() {
    return `PokéMart`;
}

export function openPokeMarketSell() {
    const html = getMarketSellHtml();

    window.marketSelectedPokemonForSale = new Set();

    const overlay = document.getElementById('main-view-inner-modal-overlay');
    const title = document.getElementById('main-view-inner-modal-title');
    const content = document.getElementById('main-view-inner-modal-content');
    const moneyDisplay = document.getElementById('inner-modal-money-display');
    if (moneyDisplay) {
        moneyDisplay.textContent = `$ ${state.trainer.money.toLocaleString('en-US')}`;
        moneyDisplay.style.display = 'block';
    }

    const titleHtml = getMarketSellTitleHtml();

    if (overlay && title && content) {
        safeSetHTML(title, titleHtml);
        safeSetHTML(content, html);
        overlay.style.display = 'flex';
    } else {
        if (window.showModal) window.showModal('Sell', html, 'window-market-sell');

        const modalBox = document.getElementById('modal-content-box');
        if (modalBox) {
            modalBox.dataset.originalStyles = modalBox.getAttribute('style') || '';
            modalBox.style.width = 'max-content';
            modalBox.style.height = 'max-content';
            modalBox.style.maxWidth = '90%';
            modalBox.style.maxHeight = '95%';
        }
    }

    setTimeout(() => {
        if (window.renderPokeMarketSellTab) {
            window.renderPokeMarketSellTab('pokeballs');
        }
    }, 10);
}

function setupMarketSellTabUI(category) {
    if (category !== 'pokemon') {
        const filters = document.getElementById('market-pokemon-filters');
        if (filters) {
            filters.style.display = 'none';
        }
        ['name', 'level-min', 'level-max', 'q-min', 'q-max', 'sumiv-min', 'sumiv-max'].forEach(id => {
            const input = document.getElementById(`market-filter-${id}`);
            if (input) input.value = '';
        });
    }

    // Highlight active tab
    const tabs = ['pokeballs', 'potions', 'stones', 'vitamins', 'pokemon'];
    tabs.forEach(tab => {
        const btn = document.getElementById(`market-tab-sell-${tab}`);
        if (btn) {
            btn.classList.toggle('is-active-sell', tab === category);
        }
    });

    const pokemonControls = document.getElementById('market-pokemon-sell-controls');
    if (pokemonControls) {
        pokemonControls.style.display = category === 'pokemon' ? 'flex' : 'none';
    }
}

function getMarketSellItems(category) {
    if (category === 'pokeballs') {
        return state.config.balance.items.pokeballs.map(b => ({
            name: b.name,
            buyPrice: b.price,
            img: `./Assets/Items/Balls/${b.name}.png`,
            attrLabel: b.name === 'Masterball' ? `Efficiency: 100%` : `Efficiency: ${b.multiplier}x`
        }));
    } else if (category === 'potions') {
        return state.config.balance.items.potions
            .filter(p => p.name !== 'Max Potion')
            .map(p => {
                const invName = p.name === 'Big' ? 'Big Potion' : p.name;
                return {
                    name: invName,
                    buyPrice: p.price,
                    img: `./Assets/Items/Potions/${invName}.png`,
                    attrLabel: `Heal: ${p.heal >= 999999 ? '100%' : p.heal + ' HP'}`
                };
            });
    } else if (category === 'stones') {
        const badges = state.trainer.badges || 0;
        const stonePrice = Math.max(2500, 2500 * badges);
        const stoneSellPrice = Math.floor(stonePrice * 0.1);
        let stoneKeysSell = Object.keys(state.backpack.stones).filter(k => !VITAMINS.includes(k));
        stoneKeysSell.sort((a, b) => a.localeCompare(b));
        return stoneKeysSell.map(stoneName => {
            return {
                name: stoneName,
                sellPrice: stoneSellPrice,
                img: `./Assets/Items/Stones/${stoneName}.png`
            };
        });
    } else if (category === 'vitamins') {
        const badges = state.trainer.badges || 0;
        const getVitaminSellPrice = (vitaminName, badges) => {
            switch(vitaminName) {
                case 'HP Up': return Math.floor(Math.max(2500, 2500 * badges) * 0.1);
                case 'Carbo Speed': return Math.floor(Math.max(1250, 1250 * badges) * 0.1);
                case 'Protein Atk': return Math.floor(Math.max(1875, 1875 * badges) * 0.1);
                case 'Calcium SpAtk': return Math.floor(Math.max(1875, 1875 * badges) * 0.1);
                case 'Iron Def': return Math.floor(Math.max(1563, Math.ceil(1562.5 * badges)) * 0.1);
                case 'Zinc SpDef': return Math.floor(Math.max(1563, Math.ceil(1562.5 * badges)) * 0.1);
                default: return Math.floor(Math.max(2500, 2500 * badges) * 0.1);
            }
        };

        return VITAMINS.map(vitaminName => {
            return {
                name: vitaminName,
                sellPrice: getVitaminSellPrice(vitaminName, badges),
                img: `./Assets/Items/Vitamins/${vitaminName}.png`
            };
        });
    }
    return [];
}

function renderMarketSellItemsList(content, category, items) {
    let html = `<div class="market-grid">`;
    items.forEach(item => {
        let escapedDisplayName = escapeHTML(item.displayName || item.name).replace(/&lt;br&gt;/gi, '<br>');
        if (category === 'potions') escapedDisplayName = escapedDisplayName.replace(' Potion', '<br>Potion');
        if (category === 'stones') escapedDisplayName = escapedDisplayName.replace(' Stone', '<br>Stone');

        const baseSellPrice = item.sellPrice !== undefined ? item.sellPrice : Math.floor(item.buyPrice * 0.5);
        let stock = 0;
        const targetCategory = category === 'vitamins' ? 'stones' : category;
        if (state.backpack[targetCategory] && state.backpack[targetCategory][item.name]) {
            stock = state.backpack[targetCategory][item.name];
        }

        const safeId = escapeHTML(item.name.replace(/\s+/g, ''));
        const safeItemNameAttr = escapeHTML(item.name);
        const safeItemNameJS = escapeHTML(escapeJS(item.name));
        const safeCategoryAttr = escapeHTML(category);
        const safeCategoryJS = escapeHTML(escapeJS(category));
        const safeImg = escapeHTML(item.img);

        html += `
            <div class="market-item-card is-sell" data-basesell="${baseSellPrice}" data-id="${safeItemNameAttr}" data-category="${safeCategoryAttr}" data-stock="${stock}">
                <div class="market-card-title">${escapedDisplayName}</div>
                <img src="${safeImg}" class="market-card-img">
                ${item.attrLabel ? `<div class="market-card-attr">${item.attrLabel ? String(item.attrLabel).replace(/&lt;br&gt;/gi, '<br>') : ''}</div>` : ''}
                <div class="market-card-stock">Stock: ${formatMarketNumberDown(stock)}</div>

                <div class="market-card-footer">
                    <div class="market-qty-row">
                        <input type="text" id="sell-qty-${safeId}" value="${stock > 0 ? 1 : 0}" oninput="if(window.updateSellItemPrice) window.updateSellItemPrice('${safeItemNameJS}', '${safeCategoryJS}')" class="market-qty-input">
                        <button onclick="if(window.sellSetMax) window.sellSetMax('${safeItemNameJS}', '${safeCategoryJS}')" class="market-max-btn">Max</button>
                    </div>
                    <button id="sell-btn-${safeId}" onclick="if(window.sellMarketItem) window.sellMarketItem('${safeItemNameJS}', ${baseSellPrice}, '${safeCategoryJS}')" class="market-action-btn is-sell">$${formatMarketNumber(stock > 0 ? baseSellPrice : 0)}</button>
                </div>
            </div>
        `;
    });
    html += `</div>`;

    safeSetHTML(content, html);
}

function renderMarketSellPokemonList(content) {
    let html = `<div class="market-grid">`;

    const filterName = (document.getElementById('market-filter-name')?.value || '').toLowerCase();
    const filterLevelMin = parseFloat(document.getElementById('market-filter-level-min')?.value);
    const filterLevelMax = parseFloat(document.getElementById('market-filter-level-max')?.value);
    const filterQMin = parseFloat(document.getElementById('market-filter-q-min')?.value);
    const filterQMax = parseFloat(document.getElementById('market-filter-q-max')?.value);
    const filterSumIVMin = parseFloat(document.getElementById('market-filter-sumiv-min')?.value);
    const filterSumIVMax = parseFloat(document.getElementById('market-filter-sumiv-max')?.value);
    const sortMode = window.marketPokemonSortMode || 'default';

    const map = getPokemonDataMap();
    const candidates = [];

    state.storage.forEach(p => {
        if (!p.uuid) p.uuid = crypto.randomUUID();
        let sumIV = p.ivs.hp + p.ivs.atk + p.ivs.def + p.ivs.spa + p.ivs.spd + p.ivs.spe;

        const pd = lookupPokemonInMap(map, p.id);
        if (p.bst === undefined && pd) {
            p.bst = pd.hp + pd.atk + pd.def + pd.spa + pd.spd + pd.spe;
        }
        let pEv = calculatePP(p.bst || 300, p.level, p.quality, sumIV);

        let pName = p.name || p.id;
        if (pd) {
            pName = p.name || pd.name;
        }
        if (filterName && !(pName && pName.toString().toLowerCase().includes(filterName)) && !(p.id && p.id.toString().toLowerCase().includes(filterName))) return;
        if (!isNaN(filterLevelMin) && p.level < filterLevelMin) return;
        if (!isNaN(filterLevelMax) && p.level > filterLevelMax) return;
        if (!isNaN(filterQMin) && p.quality < filterQMin) return;
        if (!isNaN(filterQMax) && p.quality > filterQMax) return;
        if (!isNaN(filterSumIVMin) && sumIV < filterSumIVMin) return;
        if (!isNaN(filterSumIVMax) && sumIV > filterSumIVMax) return;

        candidates.push({ p, sumIV, pEv, pName });
    });

    if (sortMode !== 'default') {
        candidates.sort((a, b) => {
            if (sortMode === 'price-desc') return b.pEv - a.pEv;
            if (sortMode === 'price-asc') return a.pEv - b.pEv;
            if (sortMode === 'q-asc') return a.p.quality - b.p.quality;
            if (sortMode === 'level-asc') return a.p.level - b.p.level;
            if (sortMode === 'iv-asc') return a.sumIV - b.sumIV;
            return 0;
        });
    }

    candidates.forEach(({ p, sumIV, pEv, pName }) => {
        let imgSrc = window.getSpriteUrl(p.id, p.qualityName === 'Shiny');

        let glowClass = "glow-weak";
        if (p.qualityName === "Shiny") glowClass = "glow-shiny";
        else if (p.qualityName === "Legendary") glowClass = "glow-legendary";
        else if (p.qualityName === "Epic") glowClass = "glow-epic";
        else if (p.qualityName === "Rare") glowClass = "glow-rare";
        else if (p.qualityName === "Uncommon") glowClass = "glow-uncommon";
        else if (p.qualityName === "Regular") glowClass = "glow-regular";

        let isSelected = window.marketSelectedPokemonForSale && window.marketSelectedPokemonForSale.has(p.uuid);

        html += `
            <div data-uuid="${escapeHTML(p.uuid)}" onclick="if(window.toggleMarketPokemonSaleSelection) window.toggleMarketPokemonSaleSelection('${escapeHTML(p.uuid)}')"
                class="market-pokemon-card ${isSelected ? 'is-selected' : ''}">
                <div onclick="event.stopPropagation(); if(window.showPokemonStatsByUuid) window.showPokemonStatsByUuid('${escapeHTML(p.uuid)}')" style="position: absolute; top: 4px; right: 4px; width: 17px; height: 17px; border-radius: 50%; background: rgba(15, 23, 42, 0.85); border: 1px solid rgba(148, 163, 184, 0.45); color: #e2e8f0; font-size: 10px; font-weight: 800; display: flex; align-items: center; justify-content: center; cursor: pointer; z-index: 2;" title="Inspect Pokémon">i</div>
                <div style="font-size: 13px; font-weight: bold; margin-bottom: 4px; line-height: 1.15; color: white; padding-right: 14px;">${escapeHTML(String(pName))}</div>
                <div style="flex: 1; width: 100%; display: flex; align-items: center; justify-content: center; position: relative; height: 54px; margin-bottom: 4px;">
                    <img src="${escapeHTML(imgSrc)}" class="${glowClass}" style="max-height: 100%; max-width: 100%; object-fit: contain; z-index: 1;" onerror="this.style.display='none'">
                </div>
                <div style="font-size: 11.5px; color: #cbd5e1; line-height: 1.15;">Lv. ${p.level}</div>
                <div style="font-size: 11.5px; color: #fbbf24; line-height: 1.15;">Q: ${p.quality.toFixed(2)}</div>
                <div style="font-size: 11.5px; color: #38bdf8; line-height: 1.15;">∑IV: ${sumIV}</div>
                <div style="font-size: 13px; font-weight: bold; color: #4ade80; margin-top: 6px; line-height: 1.15;">$${formatMarketNumber(pEv)}</div>
            </div>
        `;
    });

    html += `</div>`;
    safeSetHTML(content, html);
}

export function renderPokeMarketSellTab(category) {
    const content = document.getElementById('market-sell-content');
    if (!content) return;

    setupMarketSellTabUI(category);

    if (category === 'pokemon') {
        renderMarketSellPokemonList(content);
        return;
    }

    const items = getMarketSellItems(category);
    renderMarketSellItemsList(content, category, items);
}

export function updateSellItemPrice(itemId, category) {
    const safeId = itemId.replace(/\s+/g, '');
    const input = document.getElementById(`sell-qty-${safeId}`);
    const sellBtn = document.getElementById(`sell-btn-${safeId}`);
    if (!input || !sellBtn) return;

    const cards = document.querySelectorAll('.market-item-card');
    let card = Array.from(cards).find(c => c.dataset.id === itemId && c.dataset.category === category);
    if (!card) return;

    let stock = parseInt(card.dataset.stock) || 0;
    let baseSellPrice = parseInt(card.dataset.basesell) || 0;

    let qty = parseMarketQuantity(input.value);

    if (qty > stock) {
        qty = stock;
        if (stock > 0) {
            input.value = formatMarketNumberDown(stock);
        } else {
            input.value = "0";
        }
    }
    if (qty > 1000000) {
        qty = 1000000;
        input.value = (1000000).toLocaleString('en-US');
    }

    let totalVal = qty * baseSellPrice;
    if (sellBtn) sellBtn.textContent = "$" + formatMarketNumber(totalVal);
}

export function sellSetMax(itemId, category) {
    const safeId = itemId.replace(/\s+/g, '');
    const input = document.getElementById(`sell-qty-${safeId}`);

    const cards = document.querySelectorAll('.market-item-card');
    let card = Array.from(cards).find(c => c.dataset.id === itemId && c.dataset.category === category);
    if (!card || !input) return;

    let stock = parseInt(card.dataset.stock) || 0;

    if (stock > 1000000) {
        input.value = (1000000).toLocaleString('en-US');
    } else {
        input.value = formatMarketNumberDown(stock);
    }

    updateSellItemPrice(itemId, category);
}

export function sellMarketItem(itemId, baseSellPrice, category) {
    const safeId = itemId.replace(/\s+/g, '');
    const input = document.getElementById(`sell-qty-${safeId}`);

    let stock = 0;
    const targetCategory = category === 'vitamins' ? 'stones' : category;
    if (state.backpack[targetCategory] && state.backpack[targetCategory][itemId]) {
        stock = state.backpack[targetCategory][itemId];
    }

    let qty = parseMarketQuantity(input ? input.value : '0');

    if (qty <= 0) {
        if(window.showGameAlert) window.showGameAlert("Please enter a valid quantity to sell.", getMarketAlertTarget());
        return;
    }

    if (qty > stock) {
        qty = stock;
    }

    if (qty > 1000000) qty = 1000000;

    if (stock >= qty && qty > 0) {
        const totalValue = qty * baseSellPrice;

        state.backpack[targetCategory][itemId] -= qty;
        state.trainer.money += totalValue;

        if (window.updateUI) window.updateUI();
        const moneyDisplay = document.getElementById('inner-modal-money-display');
        if (moneyDisplay) {
            moneyDisplay.textContent = `$ ${state.trainer.money.toLocaleString('en-US')}`;
        }

        if(window.showGameAlert) window.showGameAlert(`Sold ${formatMarketNumber(qty)}x ${itemId} for ${formatMarketNumber(totalValue)}!`, getMarketAlertTarget());

        renderPokeMarketSellTab(category);
    } else {
        if(window.showGameAlert) window.showGameAlert("You don't have enough of that item to sell.", getMarketAlertTarget());
    }
}

window.openPokeMarketSell = openPokeMarketSell;
window.renderPokeMarketSellTab = renderPokeMarketSellTab;
window.updateSellItemPrice = updateSellItemPrice;
window.sellSetMax = sellSetMax;
window.sellMarketItem = sellMarketItem;

window.setMarketPokemonSort = function(sortMode) {
    window.marketPokemonSortMode = sortMode || 'default';
    if (window.renderPokeMarketSellTab) window.renderPokeMarketSellTab('pokemon');
};

window.toggleMarketPokemonSaleSelection = function(uuid) {
    if (!window.marketSelectedPokemonForSale) return;
    let isNowSelected = false;
    if (window.marketSelectedPokemonForSale.has(uuid)) {
        window.marketSelectedPokemonForSale.delete(uuid);
    } else {
        window.marketSelectedPokemonForSale.add(uuid);
        isNowSelected = true;
    }
    updateMarketPokemonSellCount();
    const card = document.querySelector(`.market-pokemon-card[data-uuid="${uuid}"]`);
    if (card) {
        card.classList.toggle('is-selected', isNowSelected);
    } else if (window.renderPokeMarketSellTab) {
        window.renderPokeMarketSellTab('pokemon');
    }
};

window.marketDeselectAllPokemonForSale = function() {
    if (window.marketSelectedPokemonForSale) {
        window.marketSelectedPokemonForSale.clear();
    }
    updateMarketPokemonSellCount();
    document.querySelectorAll('.market-pokemon-card.is-selected').forEach(c => c.classList.remove('is-selected'));
};

window.toggleMarketPokemonFilters = function() {
    const filters = document.getElementById('market-pokemon-filters');
    if (filters) {
        if (filters.style.display === 'none') {
            filters.style.display = 'flex';
        } else {
            filters.style.display = 'none';
        }
    }
};

window.clearMarketPokemonFilters = function() {
    ['name', 'level-min', 'level-max', 'q-min', 'q-max', 'sumiv-min', 'sumiv-max'].forEach(id => {
        const input = document.getElementById(`market-filter-${id}`);
        if (input) input.value = '';
    });
    if (window.renderPokeMarketSellTab) window.renderPokeMarketSellTab('pokemon');
};

window.marketSelectAllPokemonForSale = function() {
    if (!window.marketSelectedPokemonForSale) window.marketSelectedPokemonForSale = new Set();

    const filterName = (document.getElementById('market-filter-name')?.value || '').toLowerCase();
    const filterLevelMin = parseFloat(document.getElementById('market-filter-level-min')?.value);
    const filterLevelMax = parseFloat(document.getElementById('market-filter-level-max')?.value);
    const filterQMin = parseFloat(document.getElementById('market-filter-q-min')?.value);
    const filterQMax = parseFloat(document.getElementById('market-filter-q-max')?.value);
    const filterSumIVMin = parseFloat(document.getElementById('market-filter-sumiv-min')?.value);
    const filterSumIVMax = parseFloat(document.getElementById('market-filter-sumiv-max')?.value);

    const map = getPokemonDataMap();

    state.storage.forEach(p => {
        if (!p.uuid) p.uuid = crypto.randomUUID();
        let sumIV = p.ivs.hp + p.ivs.atk + p.ivs.def + p.ivs.spa + p.ivs.spd + p.ivs.spe;

        let pName = p.name || p.id;
        const pd = lookupPokemonInMap(map, p.id);
        if (pd) {
            pName = p.name || pd.name;
        }
        if (filterName && !(pName && pName.toString().toLowerCase().includes(filterName)) && !(p.id && p.id.toString().toLowerCase().includes(filterName))) return;
        if (!isNaN(filterLevelMin) && p.level < filterLevelMin) return;
        if (!isNaN(filterLevelMax) && p.level > filterLevelMax) return;
        if (!isNaN(filterQMin) && p.quality < filterQMin) return;
        if (!isNaN(filterQMax) && p.quality > filterQMax) return;
        if (!isNaN(filterSumIVMin) && sumIV < filterSumIVMin) return;
        if (!isNaN(filterSumIVMax) && sumIV > filterSumIVMax) return;

        window.marketSelectedPokemonForSale.add(p.uuid);
    });

    updateMarketPokemonSellCount();
    if (window.renderPokeMarketSellTab) window.renderPokeMarketSellTab('pokemon');
};

function updateMarketPokemonSellCount() {
    const countSpan = document.getElementById('market-pokemon-sell-count');
    const totalSpan = document.getElementById('market-pokemon-sell-total');
    if (countSpan && totalSpan && window.marketSelectedPokemonForSale) {
        let count = window.marketSelectedPokemonForSale.size;

        let totalGain = 0;
        const map = getPokemonDataMap();
        state.storage.forEach(p => {
            if (!p.uuid) p.uuid = crypto.randomUUID();
            if (window.marketSelectedPokemonForSale.has(p.uuid)) {
                let sumIV = p.ivs.hp + p.ivs.atk + p.ivs.def + p.ivs.spa + p.ivs.spd + p.ivs.spe;
                if (p.bst === undefined) {
                    const pd = lookupPokemonInMap(map, p.id);
                    if (pd) p.bst = pd.hp + pd.atk + pd.def + pd.spa + pd.spd + pd.spe;
                }
                let pEv = calculatePP(p.bst || 300, p.level, p.quality, sumIV);
                totalGain += pEv;
            }
        });

        countSpan.textContent = count;
        totalSpan.textContent = formatMarketNumber(totalGain);
    }
}

window.marketSellSelectedPokemon = function() {
    if (!window.marketSelectedPokemonForSale || window.marketSelectedPokemonForSale.size === 0) return;

    let numSold = 0;
    let totalGain = 0;
    const map = getPokemonDataMap();

    state.storage = state.storage.filter(p => {
        if (window.marketSelectedPokemonForSale.has(p.uuid)) {
            let sumIV = p.ivs.hp + p.ivs.atk + p.ivs.def + p.ivs.spa + p.ivs.spd + p.ivs.spe;
            if (p.bst === undefined) {
                const pd = lookupPokemonInMap(map, p.id);
                if (pd) p.bst = pd.hp + pd.atk + pd.def + pd.spa + pd.spd + pd.spe;
            }
            let pEv = calculatePP(p.bst || 300, p.level, p.quality, sumIV);
            totalGain += pEv;
            numSold++;
            return false;
        }
        return true;
    });

    state.trainer.money += totalGain;
    if (typeof window !== 'undefined' && typeof window.trackDailyChallenge === 'function') {
        window.trackDailyChallenge('sell_pokemon', { count: numSold });
        window.trackDailyChallenge('earn_money', { amount: totalGain });
    }

    window.marketSelectedPokemonForSale.clear();

    if (window.updateUI) window.updateUI();

    const moneyDisplay = document.getElementById('inner-modal-money-display');
    if (moneyDisplay) {
        moneyDisplay.textContent = `$ ${state.trainer.money.toLocaleString('en-US')}`;
    }

    updateMarketPokemonSellCount();

    if (window.showGameAlert) {
        window.showGameAlert(`Sold ${numSold} Pokemon for ${formatMarketNumber(totalGain)}!`, getMarketAlertTarget());
    } else {
        alert(`Sold ${numSold} Pokemon for $${totalGain}!`);
    }

    if (window.renderPokeMarketSellTab) window.renderPokeMarketSellTab('pokemon');
};
window.openPokeMarketBuy = openPokeMarketBuy;
window.renderPokeMarketTab = renderPokeMarketTab;
window.buyItem = buyItem;
window.updateBuyItemPrice = updateBuyItemPrice;
window.buySetMax = buySetMax;
