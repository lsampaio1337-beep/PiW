import { VITAMINS } from "../constants.js";


export function getMarketAlertTarget() {
    const innerModal = document.getElementById('main-view-inner-modal');
    if (innerModal && innerModal.offsetParent !== null) {
        return 'main-view-inner-modal-content';
    }
    return 'window-market';
}

import { calculatePP, getCapacity, getCurrentCount } from "../mathEngine.js";
import { state, globals } from '../state.js';
import { updateUI, showModal } from '../ui.js';

// formatMarketNumberDown is hoisted manually if needed
function _formatMarketNumberDown(num) {
    return num.toLocaleString();
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
    vCenter.innerHTML = `
        <div style="position: absolute; top: 0; left: 0; width: 100%; height: 100%; display: flex; justify-content: space-between; align-items: center; padding: 0 10%; box-sizing: border-box;">
            <button id="btn-heal-all" style="background: #3498db; color: white; border: 3px solid white; border-radius: 12px; padding: 15px 30px; font-size: 24px; font-weight: bold; cursor: pointer; box-shadow: 0 4px 10px rgba(0,0,0,0.5); margin-top: -20%;">Heal</button>
            <div style="display: flex; flex-direction: column; gap: 20px; margin-top: -20%;">
                <button id="btn-market-market" style="background: #f1c40f; color: black; border: 3px solid white; border-radius: 12px; padding: 15px 30px; font-size: 24px; font-weight: bold; cursor: pointer; box-shadow: 0 4px 10px rgba(0,0,0,0.5);">Market</button>
            </div>
        </div>
    `;

    document.getElementById('btn-heal-all').addEventListener('click', () => {
        state.party.forEach(p => p.currentHp = p.maxHp);
        if (typeof window !== 'undefined' && typeof window.trackDailyChallenge === 'function') window.trackDailyChallenge('heal_center');
        state.storage.forEach(p => p.currentHp = p.maxHp);
        updateUI();
        const btn = document.getElementById('btn-heal-all');
        const origText = btn.textContent;
        btn.textContent = 'Healed!';
        setTimeout(() => btn.textContent = origText, 1000);
    });

    document.getElementById('btn-market-market').addEventListener('click', () => {
        window.openPokeMarketBuy();
    });
}

export function openPokeMarketBuy() {
    const hasUnlockedUpgrades = state.stats.upgradesUnlocked && Object.keys(state.stats.upgradesUnlocked).some(k => state.stats.upgradesUnlocked[k]);

    const html = `
        <div id="market-buy-wrapper" style="display: flex; flex-direction: column; width: 100%; height: 100%; margin-top: 0px; --m-width: min(90vw, 825px);">


            <div style="padding-top: calc(var(--m-width) * 0.02); margin-bottom: calc(var(--m-width) * 0.015); display: flex; align-items: center; justify-content: center; gap: calc(var(--m-width) * 0.012);">
                <label style="font-weight: bold; font-size: calc(var(--m-width) * 0.022); color: white;">$<span id="market-trainer-money">${state.trainer.money.toLocaleString()}</span></label>
            </div>


            <div id="market-buy-content" style="display: flex; flex-wrap: wrap; gap: calc(var(--m-width) * 0.018); justify-content: center; overflow-y: auto; flex: 1; padding: calc(var(--m-width) * 0.012);">
                <!-- Cards injected here -->
            </div>
        </div>
    `;

    const overlay = document.getElementById('main-view-inner-modal-overlay');
    const title = document.getElementById('main-view-inner-modal-title');
    const content = document.getElementById('main-view-inner-modal-content');

    const titleHtml = `
        <div style="display: flex; flex-direction: column; align-items: center; gap: 5px;">
            <div style="display: inline-flex; background: rgba(0, 0, 0, 0.2); border-radius: 20px; padding: 3px; gap: 5px;">
                <button onclick="window.openPokeMarketBuy()" style="background: linear-gradient(to bottom, #2ecc71, #27ae60); color: white; border: 1px solid #2ecc71; border-radius: 15px; padding: 5px 15px; font-weight: bold; cursor: pointer; box-shadow: 0 2px 4px rgba(0,0,0,0.2); font-size: 14px;">Buy</button>
                <button onclick="if(window.openPokeMarketSell) window.openPokeMarketSell()" style="background: transparent; color: rgba(255, 255, 255, 0.7); border: 1px solid transparent; border-radius: 15px; padding: 5px 15px; font-weight: bold; cursor: pointer; font-size: 14px; transition: all 0.2s;" onmouseover="this.style.color='white'; this.style.background='rgba(255,255,255,0.1)';" onmouseout="this.style.color='rgba(255, 255, 255, 0.7)'; this.style.background='transparent';">Sell</button>
            </div>
            <div style="display: inline-flex; background: rgba(0, 0, 0, 0.2); border-radius: 20px; padding: 3px; gap: 5px;">
                <button id="market-tab-buy-pokeballs" onclick="window.renderPokeMarketTab('pokeballs')" style="background: transparent; color: rgba(255, 255, 255, 0.7); border: 1px solid transparent; border-radius: 15px; padding: 5px 15px; font-weight: bold; cursor: pointer; font-size: 14px; transition: all 0.2s;">Balls</button>
                <button id="market-tab-buy-potions" onclick="window.renderPokeMarketTab('potions')" style="background: transparent; color: rgba(255, 255, 255, 0.7); border: 1px solid transparent; border-radius: 15px; padding: 5px 15px; font-weight: bold; cursor: pointer; font-size: 14px; transition: all 0.2s;">Potions</button>
                <button id="market-tab-buy-stones" onclick="window.renderPokeMarketTab('stones')" style="background: transparent; color: rgba(255, 255, 255, 0.7); border: 1px solid transparent; border-radius: 15px; padding: 5px 15px; font-weight: bold; cursor: pointer; font-size: 14px; transition: all 0.2s;">Stones</button>
                <button id="market-tab-buy-vitamins" onclick="window.renderPokeMarketTab('vitamins')" style="background: transparent; color: rgba(255, 255, 255, 0.7); border: 1px solid transparent; border-radius: 15px; padding: 5px 15px; font-weight: bold; cursor: pointer; font-size: 14px; transition: all 0.2s;">Vitamins</button>
                ${hasUnlockedUpgrades ? `<button id="market-tab-buy-upgrades" onclick="window.renderPokeMarketTab('upgrades')" style="background: transparent; color: rgba(255, 255, 255, 0.7); border: 1px solid transparent; border-radius: 15px; padding: 5px 15px; font-weight: bold; cursor: pointer; font-size: 14px; transition: all 0.2s;">Upgrades</button>` : ''}
            </div>
        </div>
    `;

    if (overlay && title && content) {
        title.innerHTML = titleHtml;
        content.innerHTML = html;
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
    let multiplier = 1;
    if (val.endsWith('K')) { multiplier = 1000; val = val.slice(0, -1); }
    else if (val.endsWith('M')) { multiplier = 1000000; val = val.slice(0, -1); }
    else if (val.endsWith('B')) { multiplier = 1000000000; val = val.slice(0, -1); }
    else if (val.endsWith('T')) { multiplier = 1000000000000; val = val.slice(0, -1); }

    let parsed = parseFloat(val);
    if (isNaN(parsed) || parsed <= 0) return 1;
    return Math.floor(parsed * multiplier);
}

export function formatMarketNumber(num) {
    return num.toLocaleString();
}

export function renderPokeMarketTab(category) {
    const content = document.getElementById('market-buy-content');
    if (!content) return;

    // Highlight active tab
    const tabs = ['pokeballs', 'potions', 'stones', 'vitamins', 'upgrades'];
    tabs.forEach(tab => {
        const btn = document.getElementById(`market-tab-buy-${tab}`);
        if (btn) {
            if (tab === category) {
                btn.style.background = 'linear-gradient(to bottom, #3498db, #2980b9)';
                btn.style.color = 'white';
                btn.style.border = '1px solid #3498db';
                btn.style.boxShadow = '0 2px 4px rgba(0,0,0,0.2)';
            } else {
                btn.style.background = 'transparent';
                btn.style.color = 'rgba(255, 255, 255, 0.7)';
                btn.style.border = '1px solid transparent';
                btn.style.boxShadow = 'none';
            }
        }
    });

    content.dataset.category = category;



    let items = [];
    let cols = 6;


    if (category === 'upgrades') {

        let ballTier = state.stats.upgrades.ballsTier || 0;
        let potionTier = state.stats.upgrades.potionsTier || 0;
        let boxTier = state.stats.upgrades.boxTier || 0;
        let glassTier = state.stats.upgrades.glassTier || 0;
        let smartwatchTier = state.stats.upgrades.smartwatchTier || 0;
        let speedTier = state.stats.upgrades.speedTier || 0;
        let lootTier = state.stats.upgrades.lootTier || 0;

        let ballUpgrade = state.config.balance.expansions.ballPocket[ballTier];
        let potionUpgrade = state.config.balance.expansions.potionSatchel[potionTier];
        let boxUpgrade = state.config.balance.expansions.pokemonBox[boxTier];
        let glassUpgrade = state.config.balance.expansions.glass[glassTier];
        let smartwatchUpgrade = state.config.balance.expansions.smartwatch[smartwatchTier];
        let speedUpgrade = state.config.balance.expansions.speed[speedTier];
        let lootUpgrade = state.config.balance.expansions.loot[lootTier];

        let unlocked = state.stats.upgradesUnlocked || {};

        if (ballUpgrade && unlocked['balls']) items.push({ ...ballUpgrade, type: 'balls', img: './Assets/Items/Upgrades/' + ballUpgrade.name + '.png', attrLabel: '+' + ballUpgrade.increment + ' Balls<br>in stock' });
        if (potionUpgrade && unlocked['potions']) items.push({ ...potionUpgrade, type: 'potions', img: './Assets/Items/Upgrades/' + potionUpgrade.name + '.png', attrLabel: '+' + potionUpgrade.increment + ' Potions<br>in stock' });
        if (boxUpgrade && unlocked['box']) items.push({ ...boxUpgrade, type: 'box', img: './Assets/Items/Upgrades/' + boxUpgrade.name + '.png', attrLabel: '+' + boxUpgrade.increment + ' Pokemons<br>in backpack' });
        if (glassUpgrade && unlocked['glass']) items.push({ ...glassUpgrade, type: 'glass', img: './Assets/Items/Upgrades/' + glassUpgrade.name + '.png', attrLabel: glassUpgrade.description });
        if (smartwatchUpgrade && unlocked['smartwatch']) items.push({ ...smartwatchUpgrade, type: 'smartwatch', img: './Assets/Items/Upgrades/' + smartwatchUpgrade.name + '.png', attrLabel: smartwatchUpgrade.description });
        if (speedUpgrade && unlocked['speed']) items.push({ ...speedUpgrade, type: 'speed', img: './Assets/Items/Upgrades/' + speedUpgrade.name + '.png', attrLabel: speedUpgrade.description });
        if (lootUpgrade && unlocked['loot']) items.push({ ...lootUpgrade, type: 'loot', img: './Assets/Items/Upgrades/' + lootUpgrade.name + '.png', attrLabel: lootUpgrade.description });

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
                let invName = p.name;
                if (p.name === 'Regular Potion') invName = 'Regular Potion';
                if (p.name === 'Big') invName = 'Big Potion';
                return {
                    name: invName,
                    price: p.price,
                    img: `./Assets/Items/Potions/${invName}.png`,
                    attrLabel: `Heal: ${p.heal >= 999999 ? '100%' : p.heal + ' HP'}`
                };
            });
    } else if (category === 'stones') {
        const badges = state.trainer.badges || 0;
        const stonePrice = badges >= 8 ? 10000 : Math.max(500, 1000 * badges);
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
        const vitaminPrice = badges >= 8 ? 10000 : Math.max(2000, 1000 * badges);
        items = VITAMINS.map(vitaminName => {
            return {
                name: vitaminName,
                price: vitaminPrice,
                img: `./Assets/Items/Vitamins/${vitaminName}.png`,
                attrLabel: `Stat Item`
            };
        });
    }

    if (category === 'upgrades' && items.length === 0) {
        content.innerHTML = `<div style="text-align: center; font-size: calc(var(--m-width) * 0.024); color: white; width: 100%; margin-top: calc(var(--m-width) * 0.05);">No available upgrade to be bought.</div>`;
        return;
    }

    let html = `<div style="--m-width: min(76vw, 750px); display: grid; grid-template-columns: repeat(${cols}, calc(var(--m-width) * 0.135)); gap: calc(var(--m-width) * 0.018); justify-content: center; width: 100%;">`;
    items.forEach(item => {
        let displayName = item.displayName || item.name;
        if (category === 'potions') displayName = displayName.replace(' Potion', '<br>Potion');
        if (category === 'stones') displayName = displayName.replace(' Stone', '<br>Stone');

        let stock = 0;
        const targetCategory = category === 'vitamins' ? 'stones' : category;
        if (category !== 'upgrades' && state.backpack[targetCategory] && state.backpack[targetCategory][item.name]) {
            stock = state.backpack[targetCategory][item.name];
        }

        const safeId = item.name.replace(/\s+/g, '');
        let buyAction = `if(window.buyItem) window.buyItem('${item.name}', ${item.price}, '${category}')`;
        if (category === 'upgrades') {
            buyAction = `if(window.buyItem) window.buyItem('${item.name}', ${item.price}, '${category}', '${item.upgradeType}')`;
        }

        html += `
            <div class="market-item-card" data-price="${item.price}" data-id="${item.name}" data-category="${category}"
                style="background: #2c3e50; border: 2px solid #3498db; border-radius: 10px; padding: calc(var(--m-width) * 0.012); text-align: center; transition: transform 0.2s; display: flex; flex-direction: column; align-items: center; justify-content: center;">
                <div style="font-size: calc(var(--m-width) * 0.017); font-weight: bold; margin-bottom: calc(var(--m-width) * 0.006); height: calc(var(--m-width) * 0.038); display: flex; align-items: center; justify-content: center; text-align: center; line-height: 1.1;">${displayName}</div>
                <img src="${item.img}" style="width: calc(var(--m-width) * 0.072); height: calc(var(--m-width) * 0.072); object-fit: contain; margin-bottom: calc(var(--m-width) * 0.006);">
                ${category !== 'stones' ? `<div style="font-size: calc(var(--m-width) * 0.014); color: #f1c40f; margin-bottom: calc(var(--m-width) * 0.006); line-height: 1.1;">${item.attrLabel}</div>` : ''}
                ${category !== 'upgrades' ? `<div style="font-size: calc(var(--m-width) * 0.014); color: #bdc3c7; line-height: 1.1; margin-bottom: calc(var(--m-width) * 0.006);">Stock: ${formatMarketNumberDown(stock)}</div>` : ''}

                ${category !== 'upgrades' ? `
                <div style="display: flex; gap: 5px; margin-top: calc(var(--m-width) * 0.006); align-items: center; justify-content: center; width: 100%;">
                    <input type="text" id="buy-qty-${safeId}" value="1" oninput="if(window.updateBuyItemPrice) window.updateBuyItemPrice('${item.name}', '${category}', ${item.price})" style="width: calc(var(--m-width) * 0.06); height: calc(var(--m-width) * 0.025); padding: 0 calc(var(--m-width) * 0.006); font-size: calc(var(--m-width) * 0.015); text-align: center; border-radius: 5px; border: 1px solid #ccc; box-sizing: border-box; margin: 0; outline: none;">
                    ${(category === 'pokeballs' || category === 'potions') ? `
                    <button onclick="if(window.buySetMax) window.buySetMax('${item.name}', '${category}', ${item.price})" style="display: flex; align-items: center; justify-content: center; padding: 0 calc(var(--m-width) * 0.006); height: calc(var(--m-width) * 0.025); font-size: calc(var(--m-width) * 0.015); font-weight: bold; border-radius: 5px; cursor: pointer; background: #95a5a6; color: white; border: none; box-sizing: border-box; margin: 0;">Max</button>
                    ` : ''}
                </div>
                ` : ''}

                <button id="buy-btn-${safeId}" onclick="${buyAction}" class="market-final-price" style="margin-top: calc(var(--m-width) * 0.012); background: #2ecc71; color: white; border: 2px solid white; border-radius: 8px; padding: 5px 15px; font-size: calc(var(--m-width) * 0.017); font-weight: bold; cursor: pointer; width: 100%;">${formatMarketNumber(item.price)}</button>
            </div>
        `;
    });
    html += `</div>`;

    content.innerHTML = html;
}

export function buyItem(itemId, baseCost, category, upgradeType = null) { return newBuyItem(itemId, baseCost, category, upgradeType); }


export function formatMarketNumberDown(num) {
    return _formatMarketNumberDown(num);
}

export function updateBuyItemPrice(itemId, category, basePrice) {
    const safeId = itemId.replace(/\s+/g, '');
    const input = document.getElementById(`buy-qty-${safeId}`);
    const btnDisplay = document.getElementById(`buy-btn-${safeId}`);
    if (!input || !btnDisplay) return;

    let qty = parseMarketQuantity(input.value);

    // Limit qty based on available capacity if applicable
    if (category === 'pokeballs' || category === 'potions') {
        const type = category === 'pokeballs' ? 'balls' : 'potions';
        const currentCount = getCurrentCount(state, type);
        const capacity = getCapacity(state, type);
        const spaceLeft = Math.max(0, capacity - currentCount);

        if (qty > spaceLeft) {
            qty = spaceLeft;
            input.value = spaceLeft > 0 ? formatMarketNumberDown(spaceLeft).replace('~', '') : "0";
        }
    }

    // Fallback limit for items without capacity to avoid extreme numbers
    if (qty > 1000000) {
        qty = 1000000;
        input.value = (1000000).toLocaleString();
    }

    let totalVal = qty * basePrice;
    btnDisplay.textContent = "$" + formatMarketNumber(totalVal);
}

export function buySetMax(itemId, category, basePrice) {
    const safeId = itemId.replace(/\s+/g, '');
    const input = document.getElementById(`buy-qty-${safeId}`);
    if (!input) return;

    if (category === 'pokeballs' || category === 'potions') {
        const type = category === 'pokeballs' ? 'balls' : 'potions';
        const currentCount = getCurrentCount(state, type);
        const capacity = getCapacity(state, type);
        const spaceLeft = Math.max(0, capacity - currentCount);

        input.value = formatMarketNumberDown(spaceLeft).replace('~', '');
    } else {
        input.value = (1000000).toLocaleString();
    }

    updateBuyItemPrice(itemId, category, basePrice);
}

export function newBuyItem(itemId, baseCost, category, upgradeType = null) {
    const safeId = itemId.replace(/\s+/g, '');
    const input = document.getElementById(`buy-qty-${safeId}`);
    let qty = 1;

    if (category !== 'upgrades' && input) {
        qty = parseMarketQuantity(input.value);
    }

    if (qty <= 0) {
        if(window.showGameAlert) window.showGameAlert("Please enter a valid quantity to buy.", getMarketAlertTarget());
        return;
    }

    if (category === 'pokeballs' || category === 'potions') {
        const type = category === 'pokeballs' ? 'balls' : 'potions';
        const currentCount = getCurrentCount(state, type);
        const capacity = getCapacity(state, type);
        const spaceLeft = capacity - currentCount;
        if (qty > spaceLeft) {
            window.showGameAlert(`Not enough space! You can only buy ${spaceLeft} more ${category}.`, getMarketAlertTarget());
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
        const moneyLabel = document.getElementById('market-trainer-money');
        if (moneyLabel) moneyLabel.textContent = state.trainer.money.toLocaleString();
        window.showGameAlert(`Bought ${qty.toLocaleString()}x ${itemId} for ${totalCost.toLocaleString()}!`, getMarketAlertTarget());
        renderPokeMarketTab(category);
    } else {
        window.showGameAlert(`Not enough money! You need ${totalCost.toLocaleString()} but only have ${state.trainer.money.toLocaleString()}.`, getMarketAlertTarget());
    }
}


export function openPokeMarketSell() {
    const html = `
        <div id="market-sell-wrapper" style="display: flex; flex-direction: column; width: 100%; height: 100%; margin-top: 0px; --m-width: min(90vw, 825px);">


            <div style="padding-top: calc(var(--m-width) * 0.02); margin-bottom: calc(var(--m-width) * 0.015); display: flex; align-items: center; justify-content: center; gap: calc(var(--m-width) * 0.012);">
                <label style="font-weight: bold; font-size: calc(var(--m-width) * 0.022); color: white;">$<span id="market-trainer-money-sell">${state.trainer.money.toLocaleString()}</span></label>
            </div>

            <div id="market-pokemon-sell-controls" style="display: none; flex-direction: column; align-items: center; justify-content: center; margin-bottom: calc(var(--m-width) * 0.015); gap: calc(var(--m-width) * 0.012);">
                <div style="font-size: calc(var(--m-width) * 0.022); font-weight: bold; color: white;">Selected: <span id="market-pokemon-sell-count">0</span> | Total: $<span id="market-pokemon-sell-total">0</span></div>
                <div style="display: flex; gap: calc(var(--m-width) * 0.012);">
                    <button onclick="if(window.marketSelectAllPokemonForSale) window.marketSelectAllPokemonForSale()" style="padding: calc(var(--m-width) * 0.012) calc(var(--m-width) * 0.024); font-size: calc(var(--m-width) * 0.019); font-weight: bold; border-radius: 5px; background: #3498db; color: white; cursor: pointer; border: none;">Select Visible</button>
                    <button onclick="if(window.marketDeselectAllPokemonForSale) window.marketDeselectAllPokemonForSale()" style="padding: calc(var(--m-width) * 0.012) calc(var(--m-width) * 0.024); font-size: calc(var(--m-width) * 0.019); font-weight: bold; border-radius: 5px; background: #95a5a6; color: white; cursor: pointer; border: none;">Deselect All</button>
                    <button onclick="if(window.marketSellSelectedPokemon) window.marketSellSelectedPokemon()" style="padding: calc(var(--m-width) * 0.012) calc(var(--m-width) * 0.024); font-size: calc(var(--m-width) * 0.019); font-weight: bold; border-radius: 5px; background: #e74c3c; color: white; cursor: pointer; border: none;">Sell Selected</button>
                </div>

                <div id="market-pokemon-filters" style="display: flex; flex-wrap: nowrap; gap: calc(var(--m-width) * 0.012); justify-content: center; align-items: center; background: #2c3e50; padding: calc(var(--m-width) * 0.012); border-radius: 8px; border: 1px solid #7f8c8d; width: 100%; box-sizing: border-box;">
                    <div style="display: flex; gap: calc(var(--m-width) * 0.006); align-items: center;">
                        <label style="color: white; font-size: calc(var(--m-width) * 0.017);">Name:</label>
                        <input type="text" id="market-filter-name" oninput="if(window.renderPokeMarketSellTab) window.renderPokeMarketSellTab('pokemon')" style="width: calc(var(--m-width) * 0.1); padding: calc(var(--m-width) * 0.006); border-radius: 4px; border: 1px solid #ccc; font-size: calc(var(--m-width) * 0.017);">
                    </div>
                    <div style="display: flex; gap: calc(var(--m-width) * 0.006); align-items: center;">
                        <label style="color: white; font-size: calc(var(--m-width) * 0.017);">Level:</label>
                        <input type="text" id="market-filter-level-min" placeholder="Min" oninput="if(window.sanitizeMarketNumberInput) window.sanitizeMarketNumberInput(this); if(window.renderPokeMarketSellTab) window.renderPokeMarketSellTab('pokemon')" style="width: calc(var(--m-width) * 0.04); padding: calc(var(--m-width) * 0.006); border-radius: 4px; border: 1px solid #ccc; font-size: calc(var(--m-width) * 0.017);">
                        <span style="color: white;">-</span>
                        <input type="text" id="market-filter-level-max" placeholder="Max" oninput="if(window.sanitizeMarketNumberInput) window.sanitizeMarketNumberInput(this); if(window.renderPokeMarketSellTab) window.renderPokeMarketSellTab('pokemon')" style="width: calc(var(--m-width) * 0.04); padding: calc(var(--m-width) * 0.006); border-radius: 4px; border: 1px solid #ccc; font-size: calc(var(--m-width) * 0.017);">
                    </div>
                    <div style="display: flex; gap: calc(var(--m-width) * 0.006); align-items: center;">
                        <label style="color: white; font-size: calc(var(--m-width) * 0.017);">Q:</label>
                        <input type="text" id="market-filter-q-min" placeholder="Min" oninput="if(window.sanitizeMarketQInput) window.sanitizeMarketQInput(this); if(window.renderPokeMarketSellTab) window.renderPokeMarketSellTab('pokemon')" style="width: calc(var(--m-width) * 0.04); padding: calc(var(--m-width) * 0.006); border-radius: 4px; border: 1px solid #ccc; font-size: calc(var(--m-width) * 0.017);">
                        <span style="color: white;">-</span>
                        <input type="text" id="market-filter-q-max" placeholder="Max" oninput="if(window.sanitizeMarketQInput) window.sanitizeMarketQInput(this); if(window.renderPokeMarketSellTab) window.renderPokeMarketSellTab('pokemon')" style="width: calc(var(--m-width) * 0.04); padding: calc(var(--m-width) * 0.006); border-radius: 4px; border: 1px solid #ccc; font-size: calc(var(--m-width) * 0.017);">
                    </div>
                    <div style="display: flex; gap: calc(var(--m-width) * 0.006); align-items: center;">
                        <label style="color: white; font-size: calc(var(--m-width) * 0.017);">SumIV:</label>
                        <input type="text" id="market-filter-sumiv-min" placeholder="Min" oninput="if(window.sanitizeMarketNumberInput) window.sanitizeMarketNumberInput(this); if(window.renderPokeMarketSellTab) window.renderPokeMarketSellTab('pokemon')" style="width: calc(var(--m-width) * 0.04); padding: calc(var(--m-width) * 0.006); border-radius: 4px; border: 1px solid #ccc; font-size: calc(var(--m-width) * 0.017);">
                        <span style="color: white;">-</span>
                        <input type="text" id="market-filter-sumiv-max" placeholder="Max" oninput="if(window.sanitizeMarketNumberInput) window.sanitizeMarketNumberInput(this); if(window.renderPokeMarketSellTab) window.renderPokeMarketSellTab('pokemon')" style="width: calc(var(--m-width) * 0.04); padding: calc(var(--m-width) * 0.006); border-radius: 4px; border: 1px solid #ccc; font-size: calc(var(--m-width) * 0.017);">
                    </div>
                </div>
            </div>

            <div id="market-sell-content" style="display: flex; flex-wrap: wrap; gap: calc(var(--m-width) * 0.018); justify-content: center; overflow-y: auto; flex: 1; padding: calc(var(--m-width) * 0.012);">
                <!-- Cards injected here -->
            </div>
        </div>
    `;

    window.marketSelectedPokemonForSale = new Set();

    const overlay = document.getElementById('main-view-inner-modal-overlay');
    const title = document.getElementById('main-view-inner-modal-title');
    const content = document.getElementById('main-view-inner-modal-content');

    const titleHtml = `
        <div style="display: flex; flex-direction: column; align-items: center; gap: 5px;">
            <div style="display: inline-flex; background: rgba(0, 0, 0, 0.2); border-radius: 20px; padding: 3px; gap: 5px;">
                <button onclick="window.openPokeMarketBuy()" style="background: transparent; color: rgba(255, 255, 255, 0.7); border: 1px solid transparent; border-radius: 15px; padding: 5px 15px; font-weight: bold; cursor: pointer; font-size: 14px; transition: all 0.2s;" onmouseover="this.style.color='white'; this.style.background='rgba(255,255,255,0.1)';" onmouseout="this.style.color='rgba(255, 255, 255, 0.7)'; this.style.background='transparent';">Buy</button>
                <button onclick="if(window.openPokeMarketSell) window.openPokeMarketSell()" style="background: linear-gradient(to bottom, #e74c3c, #c0392b); color: white; border: 1px solid #e74c3c; border-radius: 15px; padding: 5px 15px; font-weight: bold; cursor: pointer; box-shadow: 0 2px 4px rgba(0,0,0,0.2); font-size: 14px;">Sell</button>
            </div>
            <div style="display: inline-flex; background: rgba(0, 0, 0, 0.2); border-radius: 20px; padding: 3px; gap: 5px;">
                <button id="market-tab-sell-pokeballs" onclick="if(window.renderPokeMarketSellTab) window.renderPokeMarketSellTab('pokeballs')" style="background: transparent; color: rgba(255, 255, 255, 0.7); border: 1px solid transparent; border-radius: 15px; padding: 5px 15px; font-weight: bold; cursor: pointer; font-size: 14px; transition: all 0.2s;">Balls</button>
                <button id="market-tab-sell-potions" onclick="if(window.renderPokeMarketSellTab) window.renderPokeMarketSellTab('potions')" style="background: transparent; color: rgba(255, 255, 255, 0.7); border: 1px solid transparent; border-radius: 15px; padding: 5px 15px; font-weight: bold; cursor: pointer; font-size: 14px; transition: all 0.2s;">Potions</button>
                <button id="market-tab-sell-stones" onclick="if(window.renderPokeMarketSellTab) window.renderPokeMarketSellTab('stones')" style="background: transparent; color: rgba(255, 255, 255, 0.7); border: 1px solid transparent; border-radius: 15px; padding: 5px 15px; font-weight: bold; cursor: pointer; font-size: 14px; transition: all 0.2s;">Stones</button>
                <button id="market-tab-sell-vitamins" onclick="if(window.renderPokeMarketSellTab) window.renderPokeMarketSellTab('vitamins')" style="background: transparent; color: rgba(255, 255, 255, 0.7); border: 1px solid transparent; border-radius: 15px; padding: 5px 15px; font-weight: bold; cursor: pointer; font-size: 14px; transition: all 0.2s;">Vitamins</button>
                <button id="market-tab-sell-pokemon" onclick="if(window.renderPokeMarketSellTab) window.renderPokeMarketSellTab('pokemon')" style="background: transparent; color: rgba(255, 255, 255, 0.7); border: 1px solid transparent; border-radius: 15px; padding: 5px 15px; font-weight: bold; cursor: pointer; font-size: 14px; transition: all 0.2s;">Pokemon</button>
            </div>
        </div>
    `;

    if (overlay && title && content) {
        title.innerHTML = titleHtml;
        content.innerHTML = html;
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

export function renderPokeMarketSellTab(category) {
    const content = document.getElementById('market-sell-content');
    if (!content) return;

    // Highlight active tab
    const tabs = ['pokeballs', 'potions', 'stones', 'vitamins', 'pokemon'];
    tabs.forEach(tab => {
        const btn = document.getElementById(`market-tab-sell-${tab}`);
        if (btn) {
            if (tab === category) {
                btn.style.background = 'linear-gradient(to bottom, #3498db, #2980b9)';
                btn.style.color = 'white';
                btn.style.border = '1px solid #3498db';
                btn.style.boxShadow = '0 2px 4px rgba(0,0,0,0.2)';
            } else {
                btn.style.background = 'transparent';
                btn.style.color = 'rgba(255, 255, 255, 0.7)';
                btn.style.border = '1px solid transparent';
                btn.style.boxShadow = 'none';
            }
        }
    });

    let items = [];
    let cols = 6;

    const pokemonControls = document.getElementById('market-pokemon-sell-controls');
    if (pokemonControls) {
        pokemonControls.style.display = category === 'pokemon' ? 'flex' : 'none';
    }

    if (category === 'pokemon') {
        let html = `<div style="--m-width: min(76vw, 750px); display: grid; grid-template-columns: repeat(${cols}, calc(var(--m-width) * 0.135)); gap: calc(var(--m-width) * 0.018); justify-content: center; width: 100%;">`;

        const filterName = (document.getElementById('market-filter-name')?.value || '').toLowerCase();
        const filterLevelMin = parseFloat(document.getElementById('market-filter-level-min')?.value);
        const filterLevelMax = parseFloat(document.getElementById('market-filter-level-max')?.value);
        const filterQMin = parseFloat(document.getElementById('market-filter-q-min')?.value);
        const filterQMax = parseFloat(document.getElementById('market-filter-q-max')?.value);
        const filterSumIVMin = parseFloat(document.getElementById('market-filter-sumiv-min')?.value);
        const filterSumIVMax = parseFloat(document.getElementById('market-filter-sumiv-max')?.value);

        state.storage.forEach(p => {
        if (!p.uuid) p.uuid = Math.random().toString(36).substring(2, 15);
            let sumIV = p.ivs.hp + p.ivs.atk + p.ivs.def + p.ivs.spa + p.ivs.spd + p.ivs.spe;
            let pBst = p.bst;
            if (!pBst && p.id && state.config && state.config.pokemonData) {
                const pd = state.config.pokemonData.find(pd => pd.id === p.id);
                if (pd) pBst = pd.hp + pd.atk + pd.def + pd.spa + pd.spd + pd.spe;
            }
            if (!pBst) pBst = 300;
            let pEv = calculatePP(pBst, p.level, p.quality, sumIV);

            let pName = p.name || p.id;
            if (typeof p.id === 'number' && state.config && state.config.pokemonData) {
                const pd = state.config.pokemonData.find(pd => pd.id === p.id);
                if (pd) pName = p.name || pd.name;
            }
            if (filterName && !(pName && pName.toString().toLowerCase().includes(filterName)) && !(p.id && p.id.toString().toLowerCase().includes(filterName))) return;
            if (!isNaN(filterLevelMin) && p.level < filterLevelMin) return;
            if (!isNaN(filterLevelMax) && p.level > filterLevelMax) return;
            if (!isNaN(filterQMin) && p.quality < filterQMin) return;
            if (!isNaN(filterQMax) && p.quality > filterQMax) return;
            if (!isNaN(filterSumIVMin) && sumIV < filterSumIVMin) return;
            if (!isNaN(filterSumIVMax) && sumIV > filterSumIVMax) return;

            let imgSrc = `Assets/Pokemon Sprites/Natural/${p.qualityName === 'Shiny' ? p.id + '_shiny' : p.id}.png`;

            let glowClass = "glow-weak";
            if (p.qualityName === "Shiny") glowClass = "glow-shiny";
            else if (p.qualityName === "Epic") glowClass = "glow-epic";
            else if (p.qualityName === "Rare") glowClass = "glow-rare";
            else if (p.qualityName === "Uncommon") glowClass = "glow-uncommon";
            else if (p.qualityName === "Regular") glowClass = "glow-regular";

            let isSelected = window.marketSelectedPokemonForSale && window.marketSelectedPokemonForSale.has(p.uuid);
            let selectionStyle = isSelected ? 'outline: 3px solid #00ff00; outline-offset: -3px; background: rgba(0,255,0,0.2);' : 'background: #2c3e50; border: 2px solid #777;';

            html += `
                <div onclick="if(window.toggleMarketPokemonSaleSelection) window.toggleMarketPokemonSaleSelection('${p.uuid}')"
                    style="${selectionStyle} border-radius: 10px; padding: calc(var(--m-width) * 0.012); text-align: center; display: flex; flex-direction: column; align-items: center; justify-content: center; cursor: pointer; position: relative;">
                    <div style="font-size: calc(var(--m-width) * 0.017); font-weight: bold; margin-bottom: calc(var(--m-width) * 0.006); line-height: 1.1; color: white;">${pName}</div>
                    <div style="flex: 1; width: 100%; display: flex; align-items: center; justify-content: center; position: relative; height: calc(var(--m-width) * 0.072); margin-bottom: calc(var(--m-width) * 0.006);">
                        <img src="${imgSrc}" class="${glowClass}" style="max-height: 100%; max-width: 100%; object-fit: contain; z-index: 1;" onerror="this.src='data:image/gif;base64,R0lGODlhAQABAAD/ACwAAAAAAQABAAACADs='">
                    </div>
                    <div style="font-size: calc(var(--m-width) * 0.014); color: #bdc3c7; line-height: 1.1;">Lv. ${p.level}</div>
                    <div style="font-size: calc(var(--m-width) * 0.014); color: #f1c40f; line-height: 1.1;">Q: ${p.quality.toFixed(2)}</div>
                    <div style="font-size: calc(var(--m-width) * 0.014); color: #3498db; line-height: 1.1;">∑IV: ${sumIV}</div>
                    <div style="font-size: calc(var(--m-width) * 0.017); font-weight: bold; color: white; margin-top: calc(var(--m-width) * 0.012); line-height: 1.1;">$${formatMarketNumber(pEv)}</div>
                </div>
            `;
        });

        html += `</div>`;
        content.innerHTML = html;
        return;
    }

    if (category === 'pokeballs') {
        items = state.config.balance.items.pokeballs.map(b => ({
            name: b.name,
            buyPrice: b.price,
            img: `./Assets/Items/Balls/${b.name}.png`,
            attrLabel: b.name === 'Masterball' ? `Efficiency: 100%` : `Efficiency: ${b.multiplier}x`
        }));
    } else if (category === 'potions') {
        items = state.config.balance.items.potions
            .filter(p => p.name !== 'Max Potion')
            .map(p => {
                let invName = p.name;
                if (p.name === 'Regular Potion') invName = 'Regular Potion';
                if (p.name === 'Big') invName = 'Big Potion';
                return {
                    name: invName,
                    buyPrice: p.price,
                    img: `./Assets/Items/Potions/${invName}.png`,
                    attrLabel: `Heal: ${p.heal >= 999999 ? '100%' : p.heal + ' HP'}`
                };
            });
    } else if (category === 'stones') {
        let stoneKeysSell = Object.keys(state.backpack.stones).filter(k => !VITAMINS.includes(k));
        stoneKeysSell.sort((a, b) => a.localeCompare(b));
        items = stoneKeysSell.map(stoneName => {
            return {
                name: stoneName,
                sellPrice: 50,
                img: `./Assets/Items/Stones/${stoneName}.png`
            };
        });
    } else if (category === 'vitamins') {
        const getVitaminSellPrice = (vitaminName) => {
            switch(vitaminName) {
                case 'HP Up': return 80;
                case 'Carbo Speed': return 40;
                case 'Protein Atk':
                case 'Calcium SpAtk': return 60;
                case 'Iron Def':
                case 'Zinc SpDef': return 50;
                default: return 50;
            }
        };

        items = VITAMINS.map(vitaminName => {
            return {
                name: vitaminName,
                sellPrice: getVitaminSellPrice(vitaminName),
                img: `./Assets/Items/Vitamins/${vitaminName}.png`
            };
        });
    }

    let html = `<div style="--m-width: min(76vw, 750px); display: grid; grid-template-columns: repeat(${cols}, calc(var(--m-width) * 0.135)); gap: calc(var(--m-width) * 0.018); justify-content: center; width: 100%;">`;
    items.forEach(item => {
        let displayName = item.displayName || item.name;
        if (category === 'potions') displayName = displayName.replace(' Potion', '<br>Potion');
        if (category === 'stones') displayName = displayName.replace(' Stone', '<br>Stone');

        const baseSellPrice = item.sellPrice !== undefined ? item.sellPrice : Math.floor(item.buyPrice * 0.5);
        let stock = 0;
        let maxCapStr = "";
        const targetCategory = category === 'vitamins' ? 'stones' : category;
        if (state.backpack[targetCategory] && state.backpack[targetCategory][item.name]) {
            stock = state.backpack[targetCategory][item.name];
        }
        const safeId = item.name.replace(/\s+/g, '');

        html += `
            <div class="market-item-card" data-basesell="${baseSellPrice}" data-id="${item.name}" data-category="${category}" data-stock="${stock}"
                style="background: #2c3e50; border: 2px solid #e74c3c; border-radius: 10px; padding: calc(var(--m-width) * 0.012); text-align: center; display: flex; flex-direction: column; align-items: center; justify-content: center;">
                <div style="font-size: calc(var(--m-width) * 0.017); font-weight: bold; margin-bottom: calc(var(--m-width) * 0.006); height: calc(var(--m-width) * 0.038); display: flex; align-items: center; justify-content: center; text-align: center; line-height: 1.1;">${displayName}</div>
                <img src="${item.img}" style="width: calc(var(--m-width) * 0.072); height: calc(var(--m-width) * 0.072); object-fit: contain; margin-bottom: calc(var(--m-width) * 0.006);">
                ${item.attrLabel ? `<div style="font-size: calc(var(--m-width) * 0.014); color: #f1c40f; margin-bottom: calc(var(--m-width) * 0.006); line-height: 1.1;">${item.attrLabel}</div>` : ''}
                <div style="font-size: calc(var(--m-width) * 0.014); color: #bdc3c7; line-height: 1.1;">Stock: ${formatMarketNumberDown(stock)}</div>

                <div style="display: flex; gap: 5px; margin-top: calc(var(--m-width) * 0.012); align-items: center; justify-content: center; width: 100%;">
                    <input type="text" id="sell-qty-${safeId}" value="${stock > 0 ? 1 : 0}" oninput="if(window.updateSellItemPrice) window.updateSellItemPrice('${item.name}', '${category}')" style="width: calc(var(--m-width) * 0.06); height: calc(var(--m-width) * 0.025); padding: 0 calc(var(--m-width) * 0.006); font-size: calc(var(--m-width) * 0.015); text-align: center; border-radius: 5px; border: 1px solid #ccc; box-sizing: border-box; margin: 0; outline: none;">
                    <button onclick="if(window.sellSetMax) window.sellSetMax('${item.name}', '${category}')" style="display: flex; align-items: center; justify-content: center; padding: 0 calc(var(--m-width) * 0.006); height: calc(var(--m-width) * 0.025); font-size: calc(var(--m-width) * 0.015); font-weight: bold; border-radius: 5px; cursor: pointer; background: #95a5a6; color: white; border: none; box-sizing: border-box; margin: 0;">Max</button>
                </div>

                <button id="sell-btn-${safeId}" onclick="if(window.sellMarketItem) window.sellMarketItem('${item.name}', ${baseSellPrice}, '${category}')" style="margin-top: calc(var(--m-width) * 0.012); background: #e74c3c; color: white; border: 2px solid white; border-radius: 8px; padding: 5px 15px; font-size: calc(var(--m-width) * 0.017); font-weight: bold; cursor: pointer; width: 100%;">$${formatMarketNumber(stock > 0 ? baseSellPrice : 0)}</button>
            </div>
        `;
    });
    html += `</div>`;

    content.innerHTML = html;
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
            input.value = formatMarketNumberDown(stock).replace('~', '');
        } else {
            input.value = "0";
        }
    }
    if (qty > 1000000) {
        qty = 1000000;
        input.value = (1000000).toLocaleString();
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
        input.value = (1000000).toLocaleString();
    } else {
        input.value = formatMarketNumberDown(stock).replace('~', '');
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
        const moneyLabel = document.getElementById('market-trainer-money-sell');
        if (moneyLabel) {
            moneyLabel.textContent = state.trainer.money.toLocaleString();
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

window.toggleMarketPokemonSaleSelection = function(uuid) {
    if (!window.marketSelectedPokemonForSale) return;
    if (window.marketSelectedPokemonForSale.has(uuid)) {
        window.marketSelectedPokemonForSale.delete(uuid);
    } else {
        window.marketSelectedPokemonForSale.add(uuid);
    }
    updateMarketPokemonSellCount();
    if (window.renderPokeMarketSellTab) window.renderPokeMarketSellTab('pokemon');
};

window.marketDeselectAllPokemonForSale = function() {
    if (window.marketSelectedPokemonForSale) {
        window.marketSelectedPokemonForSale.clear();
    }
    updateMarketPokemonSellCount();
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

    state.storage.forEach(p => {
        if (!p.uuid) p.uuid = Math.random().toString(36).substring(2, 15);
        let sumIV = p.ivs.hp + p.ivs.atk + p.ivs.def + p.ivs.spa + p.ivs.spd + p.ivs.spe;

        let pName = p.name || p.id;
        if (typeof p.id === 'number' && state.config && state.config.pokemonData) {
            const pd = state.config.pokemonData.find(pd => pd.id === p.id);
            if (pd) pName = p.name || pd.name;
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
        state.storage.forEach(p => {
        if (!p.uuid) p.uuid = Math.random().toString(36).substring(2, 15);
            if (window.marketSelectedPokemonForSale.has(p.uuid)) {
                let sumIV = p.ivs.hp + p.ivs.atk + p.ivs.def + p.ivs.spa + p.ivs.spd + p.ivs.spe;
                let pBst = p.bst;
            if (!pBst && p.id && state.config && state.config.pokemonData) {
                const pd = state.config.pokemonData.find(pd => pd.id === p.id);
                if (pd) pBst = pd.hp + pd.atk + pd.def + pd.spa + pd.spd + pd.spe;
            }
            if (!pBst) pBst = 300;
            let pEv = calculatePP(pBst, p.level, p.quality, sumIV);
                totalGain += pEv;
            }
        });

        countSpan.textContent = count;
        totalSpan.textContent = formatMarketNumber(totalGain);
    }
}

window.marketSellSelectedPokemon = function() {
    if (!window.marketSelectedPokemonForSale || window.marketSelectedPokemonForSale.size === 0) return;

    let numSold = window.marketSelectedPokemonForSale.size;
    let totalGain = 0;

    state.storage = state.storage.filter(p => {
        if (window.marketSelectedPokemonForSale.has(p.uuid)) {
            let sumIV = p.ivs.hp + p.ivs.atk + p.ivs.def + p.ivs.spa + p.ivs.spd + p.ivs.spe;
            let pBst = p.bst;
            if (!pBst && p.id && state.config && state.config.pokemonData) {
                const pd = state.config.pokemonData.find(pd => pd.id === p.id);
                if (pd) pBst = pd.hp + pd.atk + pd.def + pd.spa + pd.spd + pd.spe;
            }
            if (!pBst) pBst = 300;
            let pEv = calculatePP(pBst, p.level, p.quality, sumIV);
            totalGain += pEv;
            return false;
        }
        return true;
    });

    state.trainer.money += totalGain;
            if (typeof window !== 'undefined' && typeof window.trackDailyChallenge === 'function') {
                window.trackDailyChallenge('sell_pokemon', { count: numSold });
                window.trackDailyChallenge('earn_money', { amount: totalGain });
            }

    // Track Daily Challenges
    if (typeof window.trackDailyChallenge === 'function') {
        window.trackDailyChallenge('sell_pokemon', { count: numSold });
        window.trackDailyChallenge('earn_money', { amount: totalGain });
    }

    window.marketSelectedPokemonForSale.clear();

    if (window.updateUI) window.updateUI();

    const moneyLabel = document.getElementById('market-trainer-money-sell');
    if (moneyLabel) {
        moneyLabel.textContent = state.trainer.money.toLocaleString();
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

window.updateMarketPokemonSellCount = updateMarketPokemonSellCount;
