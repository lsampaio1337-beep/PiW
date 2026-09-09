import { calculatePP, getCapacity, getCurrentCount } from "../mathEngine.js";
import { state, globals } from '../state.js';
import { updateUI, showModal } from '../ui.js';

// formatMarketNumberDown is hoisted manually if needed
function _formatMarketNumberDown(num) {
    if (num < 1000) return num.toString();

    let suffix = '';
    let val = num;
    if (num >= 1000000000000) { suffix = 'T'; val = num / 1000000000000; }
    else if (num >= 1000000000) { suffix = 'B'; val = num / 1000000000; }
    else if (num >= 1000000) { suffix = 'M'; val = num / 1000000; }
    else if (num >= 1000) { suffix = 'K'; val = num / 1000; }

    let rounded = Math.floor(val * 10) / 10;
    let origRecomputed = rounded;
    if (suffix === 'T') origRecomputed *= 1000000000000;
    else if (suffix === 'B') origRecomputed *= 1000000000;
    else if (suffix === 'M') origRecomputed *= 1000000;
    else if (suffix === 'K') origRecomputed *= 1000;

    let displayStr = rounded.toString() + suffix;
    if (origRecomputed !== num) {
        displayStr = '~' + displayStr;
    }
    return displayStr;
}

export function setupMarket(vCenter) {
    vCenter.innerHTML = `
        <div style="position: absolute; top: 0; left: 0; width: 100%; height: 100%; display: flex; justify-content: space-between; align-items: center; padding: 0 10vw; box-sizing: border-box;">
            <button id="btn-heal-all" style="background: #3498db; color: white; border: 3px solid white; border-radius: 12px; padding: 15px 30px; font-size: 24px; font-weight: bold; cursor: pointer; box-shadow: 0 4px 10px rgba(0,0,0,0.5); transform: translateY(-30vh);">Heal</button>
            <div style="display: flex; flex-direction: column; gap: 20px; transform: translateY(-30vh);">
                <button id="btn-market-buy" style="background: #f1c40f; color: black; border: 3px solid white; border-radius: 12px; padding: 15px 30px; font-size: 24px; font-weight: bold; cursor: pointer; box-shadow: 0 4px 10px rgba(0,0,0,0.5);">Buy</button>
                <button id="btn-market-sell" style="background: #f1c40f; color: black; border: 3px solid white; border-radius: 12px; padding: 15px 30px; font-size: 24px; font-weight: bold; cursor: pointer; box-shadow: 0 4px 10px rgba(0,0,0,0.5);">Sell</button>
            </div>
        </div>
    `;

    document.getElementById('btn-heal-all').addEventListener('click', () => {
        state.party.forEach(p => p.currentHp = p.maxHp);
        state.storage.forEach(p => p.currentHp = p.maxHp);
        updateUI();
        const btn = document.getElementById('btn-heal-all');
        const origText = btn.textContent;
        btn.textContent = 'Healed!';
        setTimeout(() => btn.textContent = origText, 1000);
    });

    document.getElementById('btn-market-buy').addEventListener('click', () => {
        window.openPokeMarketBuy();
    });

    document.getElementById('btn-market-sell').addEventListener('click', () => {
        if (window.openPokeMarketSell) window.openPokeMarketSell();
    });
}

export function openPokeMarketBuy() {
    const html = `
        <div id="market-buy-wrapper" style="display: flex; flex-direction: column; width: 100%; height: 100%; margin-top: 10px; --m-width: min(90vw, 825px);">
            <div style="display: flex; gap: calc(var(--m-width) * 0.012); margin-bottom: calc(var(--m-width) * 0.024); justify-content: center;">
                <button onclick="window.renderPokeMarketTab('pokeballs')" style="padding: calc(var(--m-width) * 0.012) calc(var(--m-width) * 0.024); font-size: calc(var(--m-width) * 0.019); font-weight: bold; border-radius: 5px; cursor: pointer;">Balls</button>
                <button onclick="window.renderPokeMarketTab('potions')" style="padding: calc(var(--m-width) * 0.012) calc(var(--m-width) * 0.024); font-size: calc(var(--m-width) * 0.019); font-weight: bold; border-radius: 5px; cursor: pointer;">Potions</button>
                <button onclick="window.renderPokeMarketTab('stones')" style="padding: calc(var(--m-width) * 0.012) calc(var(--m-width) * 0.024); font-size: calc(var(--m-width) * 0.019); font-weight: bold; border-radius: 5px; cursor: pointer;">Stones</button>
                <button onclick="window.renderPokeMarketTab('upgrades')" style="padding: calc(var(--m-width) * 0.012) calc(var(--m-width) * 0.024); font-size: calc(var(--m-width) * 0.019); font-weight: bold; border-radius: 5px; cursor: pointer;">Upgrades</button>
            </div>

            <div style="margin-bottom: calc(var(--m-width) * 0.024); display: flex; align-items: center; justify-content: center; gap: calc(var(--m-width) * 0.012);">
                <label style="font-weight: bold; font-size: calc(var(--m-width) * 0.022); color: #2ecc71;">Money: $<span id="market-trainer-money">${state.trainer.money.toLocaleString()}</span></label>
            </div>

            <div style="margin-bottom: calc(var(--m-width) * 0.024); display: flex; align-items: center; justify-content: center; gap: calc(var(--m-width) * 0.012);">
                <label style="font-weight: bold; font-size: calc(var(--m-width) * 0.022);">Quantity to Buy:</label>
                <input type="text" id="market-global-qty" value="1" oninput="window.updateMarketPrices()" style="width: calc(var(--m-width) * 0.097); padding: calc(var(--m-width) * 0.006); font-size: calc(var(--m-width) * 0.022); text-align: center; border-radius: 5px; border: 1px solid #ccc;">
            </div>

            <div id="market-buy-content" style="display: flex; flex-wrap: wrap; gap: calc(var(--m-width) * 0.018); justify-content: center; overflow-y: auto; flex: 1; padding: calc(var(--m-width) * 0.012);">
                <!-- Cards injected here -->
            </div>
        </div>
    `;

    showModal('', html);

    const modalBox = document.getElementById('modal-content-box');
    if (modalBox) {
        modalBox.dataset.originalStyles = modalBox.getAttribute('style') || '';
        modalBox.style.width = 'max-content';
        modalBox.style.height = 'max-content';
        modalBox.style.maxWidth = '90%';
        modalBox.style.maxHeight = '90%';
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
    let val = valStr.toUpperCase().trim();
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
    if (num < 1000) return num.toString();

    let suffix = '';
    let val = num;
    if (num >= 1000000000000) { suffix = 'T'; val = num / 1000000000000; }
    else if (num >= 1000000000) { suffix = 'B'; val = num / 1000000000; }
    else if (num >= 1000000) { suffix = 'M'; val = num / 1000000; }
    else if (num >= 1000) { suffix = 'K'; val = num / 1000; }

    let rounded = Math.ceil(val * 10) / 10;
    let origRecomputed = rounded;
    if (suffix === 'T') origRecomputed *= 1000000000000;
    else if (suffix === 'B') origRecomputed *= 1000000000;
    else if (suffix === 'M') origRecomputed *= 1000000;
    else if (suffix === 'K') origRecomputed *= 1000;

    let displayStr = rounded.toString() + suffix;
    if (origRecomputed !== num) {
        displayStr = '~' + displayStr;
    }
    return displayStr;
}

import { getCapacity, getCurrentCount } from '../mathEngine.js';

export function updateMarketPrices() {
    const qtyInput = document.getElementById('market-global-qty');
    if (!qtyInput) return;

    let qty = parseMarketQuantity(qtyInput.value);
    let category = document.getElementById('market-buy-content')?.dataset.category;

    if (category === 'pokeballs' || category === 'potions') {
        const type = category === 'pokeballs' ? 'balls' : 'potions';
        const currentCount = getCurrentCount(state, type);
        const capacity = getCapacity(state, type);
        const spaceLeft = capacity - currentCount;

        if (qty > spaceLeft) {
            qty = Math.max(0, spaceLeft);
            qtyInput.value = qty > 0 ? formatMarketNumberDown(qty).replace('~', '') : "0";
        }
    } else {
        if (qty > 1000000) {
            qty = 1000000;
            qtyInput.value = "1M";
        }
    }

    document.querySelectorAll('.market-item-card').forEach(card => {
        const basePrice = parseInt(card.dataset.price);
        const finalPrice = basePrice * qty;
        const priceLabel = card.querySelector('.market-final-price');
        if (priceLabel) {
            priceLabel.textContent = '$' + formatMarketNumber(finalPrice);
        }
    });
}

export function renderPokeMarketTab(category) {
    const content = document.getElementById('market-buy-content');
    if (!content) return;

    content.dataset.category = category;

    let items = [];
    let cols = 4;


    if (category === 'upgrades') {
        cols = 3;

        let ballTier = state.stats.upgrades.ballsTier || 0;
        let potionTier = state.stats.upgrades.potionsTier || 0;
        let boxTier = state.stats.upgrades.boxTier || 0;

        let ballUpgrade = state.config.balance.expansions.ballPocket[ballTier];
        let potionUpgrade = state.config.balance.expansions.potionSatchel[potionTier];
        let boxUpgrade = state.config.balance.expansions.pokemonBox[boxTier];

        if (ballUpgrade) items.push({ ...ballUpgrade, type: 'balls', img: './Assets/Items/Upgrades/' + ballUpgrade.name + '.png', attrLabel: '+' + ballUpgrade.increment + ' Balls' });
        if (potionUpgrade) items.push({ ...potionUpgrade, type: 'potions', img: './Assets/Items/Upgrades/' + potionUpgrade.name + '.png', attrLabel: '+' + potionUpgrade.increment + ' Potions' });
        if (boxUpgrade) items.push({ ...boxUpgrade, type: 'box', img: './Assets/Items/Upgrades/' + boxUpgrade.name + '.png', attrLabel: '+' + boxUpgrade.increment + ' Pokemon' });

        items = items.map(u => ({
            name: u.name,
            price: u.cost,
            img: u.img,
            attrLabel: u.attrLabel,
            upgradeType: u.type
        }));
    } else if (category === 'pokeballs') {
        cols = 4;
        items = state.config.balance.items.pokeballs.map(b => ({
            name: b.name,
            price: b.price,
            img: `./Assets/Items/Balls/${b.name}.png`,
            attrLabel: b.name === 'Masterball' ? `Efficiency: 100%` : `Efficiency: ${b.multiplier}x`
        }));
    } else if (category === 'potions') {
        cols = 6;
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
        cols = 6;
        const stonePrice = state.config.balance.items.stones.price;
        let stoneKeys = Object.keys(state.backpack.stones);
        stoneKeys.sort((a, b) => a.localeCompare(b));
        items = stoneKeys.map(stoneName => ({
            name: stoneName,
            price: stonePrice,
            img: `./Assets/Items/Stones/${stoneName}.png`,
            attrLabel: `Evolution Item`
        }));
    }

    let html = `<div style="display: grid; grid-template-columns: repeat(${cols}, calc(var(--m-width) * 0.145)); gap: calc(var(--m-width) * 0.018); justify-content: center; width: 100%;">`;
    items.forEach(item => {
        let displayName = item.name;
        if (category === 'potions') displayName = displayName.replace(' Potion', '<br>Potion');
        if (category === 'stones') displayName = displayName.replace(' Stone', '<br>Stone');

        let stock = 0;
        if (category !== 'upgrades' && state.backpack[category] && state.backpack[category][item.name]) {
            stock = state.backpack[category][item.name];
        }

        let buyAction = `window.buyItem('${item.name}', ${item.price}, '${category}')`;
        if (category === 'upgrades') {
            buyAction = `window.buyItem('${item.name}', ${item.price}, '${category}', '${item.upgradeType}')`;
        }

        html += `
            <div class="market-item-card" data-price="${item.price}" data-id="${item.name}" data-category="${category}"
                onclick="${buyAction}"
                style="background: #2c3e50; border: 2px solid #3498db; border-radius: 10px; padding: calc(var(--m-width) * 0.012); text-align: center; cursor: pointer; transition: transform 0.2s; display: flex; flex-direction: column; align-items: center; justify-content: center;">
                <div style="font-size: calc(var(--m-width) * 0.017); font-weight: bold; margin-bottom: calc(var(--m-width) * 0.006); height: calc(var(--m-width) * 0.038); display: flex; align-items: center; justify-content: center; text-align: center; line-height: 1.1;">${displayName}</div>
                <img src="${item.img}" style="width: calc(var(--m-width) * 0.072); height: calc(var(--m-width) * 0.072); object-fit: contain; margin-bottom: calc(var(--m-width) * 0.006);">
                ${category !== 'stones' ? `<div style="font-size: calc(var(--m-width) * 0.014); color: #f1c40f; margin-bottom: calc(var(--m-width) * 0.006); line-height: 1.1;">${item.attrLabel}</div>` : ''}
                ${category !== 'upgrades' ? `<div style="font-size: calc(var(--m-width) * 0.014); color: #bdc3c7; line-height: 1.1; margin-bottom: calc(var(--m-width) * 0.006);">Stock: ${formatMarketNumberDown(stock)}</div>` : ''}
                ${category !== 'upgrades' ? `<div style="font-size: calc(var(--m-width) * 0.014); color: #bdc3c7; line-height: 1.1;">Base: ${formatMarketNumber(item.price)}</div>` : ''}
                <div class="market-final-price" style="font-size: calc(var(--m-width) * 0.017); font-weight: bold; color: #2ecc71; margin-top: calc(var(--m-width) * 0.006); line-height: 1.1;">$${formatMarketNumber(item.price)}</div>
            </div>
        `;
    });
    html += `</div>`;

    content.innerHTML = html;
    updateMarketPrices();
}

export function buyItem(itemId, baseCost, category, upgradeType = null) {
    let qty = 1;
    if (category !== 'upgrades') {
        const qtyInput = document.getElementById('market-global-qty');
        qty = parseMarketQuantity(qtyInput ? qtyInput.value : '1');
        if (qty <= 0) return;
    }

    if (category === 'pokeballs' || category === 'potions') {
        const type = category === 'pokeballs' ? 'balls' : 'potions';
        const currentCount = getCurrentCount(state, type);
        const capacity = getCapacity(state, type);
        const spaceLeft = capacity - currentCount;
        if (qty > spaceLeft) {
            window.showGameAlert(`Not enough space! You can only buy ${spaceLeft} more ${category}.`);
            return;
        }
    }

    const totalCost = baseCost * qty;

    if (state.trainer.money >= totalCost) {
        state.trainer.money -= totalCost;
        if (category === 'upgrades') {
            state.stats.upgrades[upgradeType + 'Tier'] += 1;
        } else {
            if (state.backpack[category][itemId] === undefined) {
                 state.backpack[category][itemId] = 0;
            }
            state.backpack[category][itemId] += qty;
        }
        updateUI();
        const moneyLabel = document.getElementById('market-trainer-money');
        if (moneyLabel) moneyLabel.textContent = state.trainer.money.toLocaleString();
        window.showGameAlert(`Bought ${qty.toLocaleString()}x ${itemId} for ${totalCost.toLocaleString()}!`);
        renderPokeMarketTab(category);
    } else {
        window.showGameAlert(`Not enough money! You need ${totalCost.toLocaleString()} but only have ${state.trainer.money.toLocaleString()}.`);
    }
}


export function formatMarketNumberDown(num) {
    return _formatMarketNumberDown(num);
}

export function openPokeMarketSell() {
    const html = `
        <div id="market-sell-wrapper" style="display: flex; flex-direction: column; width: 100%; height: 100%; margin-top: 10px; --m-width: min(90vw, 825px);">
            <div style="display: flex; gap: calc(var(--m-width) * 0.012); margin-bottom: calc(var(--m-width) * 0.024); justify-content: center;">
                <button onclick="if(window.renderPokeMarketSellTab) window.renderPokeMarketSellTab('pokeballs')" style="padding: calc(var(--m-width) * 0.012) calc(var(--m-width) * 0.024); font-size: calc(var(--m-width) * 0.019); font-weight: bold; border-radius: 5px; cursor: pointer;">Balls</button>
                <button onclick="if(window.renderPokeMarketSellTab) window.renderPokeMarketSellTab('potions')" style="padding: calc(var(--m-width) * 0.012) calc(var(--m-width) * 0.024); font-size: calc(var(--m-width) * 0.019); font-weight: bold; border-radius: 5px; cursor: pointer;">Potions</button>
                <button onclick="if(window.renderPokeMarketSellTab) window.renderPokeMarketSellTab('stones')" style="padding: calc(var(--m-width) * 0.012) calc(var(--m-width) * 0.024); font-size: calc(var(--m-width) * 0.019); font-weight: bold; border-radius: 5px; cursor: pointer;">Stones</button>
                <button onclick="if(window.renderPokeMarketSellTab) window.renderPokeMarketSellTab('pokemon')" style="padding: calc(var(--m-width) * 0.012) calc(var(--m-width) * 0.024); font-size: calc(var(--m-width) * 0.019); font-weight: bold; border-radius: 5px; cursor: pointer;">Pokemon</button>
            </div>

            <div style="margin-bottom: calc(var(--m-width) * 0.024); display: flex; align-items: center; justify-content: center; gap: calc(var(--m-width) * 0.012);">
                <label style="font-weight: bold; font-size: calc(var(--m-width) * 0.022); color: #2ecc71;">Money: $<span id="market-trainer-money-sell">${state.trainer.money.toLocaleString()}</span></label>
            </div>

            <div id="market-pokemon-sell-controls" style="display: none; flex-direction: column; align-items: center; justify-content: center; margin-bottom: calc(var(--m-width) * 0.024); gap: calc(var(--m-width) * 0.012);">
                <div style="font-size: calc(var(--m-width) * 0.022); font-weight: bold; color: white;">Selected: <span id="market-pokemon-sell-count">0</span> | Total: $<span id="market-pokemon-sell-total">0</span></div>
                <div style="display: flex; gap: calc(var(--m-width) * 0.012);">
                    <button onclick="if(window.marketSelectAllPokemonForSale) window.marketSelectAllPokemonForSale()" style="padding: calc(var(--m-width) * 0.012) calc(var(--m-width) * 0.024); font-size: calc(var(--m-width) * 0.019); font-weight: bold; border-radius: 5px; background: #3498db; color: white; cursor: pointer; border: none;">Select Visible</button>
                    <button onclick="if(window.marketDeselectAllPokemonForSale) window.marketDeselectAllPokemonForSale()" style="padding: calc(var(--m-width) * 0.012) calc(var(--m-width) * 0.024); font-size: calc(var(--m-width) * 0.019); font-weight: bold; border-radius: 5px; background: #95a5a6; color: white; cursor: pointer; border: none;">Deselect All</button>
                    <button onclick="if(window.marketSellSelectedPokemon) window.marketSellSelectedPokemon()" style="padding: calc(var(--m-width) * 0.012) calc(var(--m-width) * 0.024); font-size: calc(var(--m-width) * 0.019); font-weight: bold; border-radius: 5px; background: #e74c3c; color: white; cursor: pointer; border: none;">Sell Selected</button>
                </div>

                <div id="market-pokemon-filters" style="display: flex; flex-wrap: wrap; gap: calc(var(--m-width) * 0.012); justify-content: center; align-items: center; background: #2c3e50; padding: calc(var(--m-width) * 0.012); border-radius: 8px; border: 1px solid #7f8c8d; width: 100%; box-sizing: border-box;">
                    <div style="display: flex; gap: calc(var(--m-width) * 0.006); align-items: center;">
                        <label style="color: white; font-size: calc(var(--m-width) * 0.017);">Name:</label>
                        <input type="text" id="market-filter-name" oninput="if(window.renderPokeMarketSellTab) window.renderPokeMarketSellTab('pokemon')" style="width: calc(var(--m-width) * 0.1); padding: calc(var(--m-width) * 0.006); border-radius: 4px; border: 1px solid #ccc; font-size: calc(var(--m-width) * 0.017);">
                    </div>
                    <div style="display: flex; gap: calc(var(--m-width) * 0.006); align-items: center;">
                        <label style="color: white; font-size: calc(var(--m-width) * 0.017);">Level:</label>
                        <input type="number" id="market-filter-level-min" placeholder="Min" oninput="if(window.renderPokeMarketSellTab) window.renderPokeMarketSellTab('pokemon')" style="width: calc(var(--m-width) * 0.06); padding: calc(var(--m-width) * 0.006); border-radius: 4px; border: 1px solid #ccc; font-size: calc(var(--m-width) * 0.017);">
                        <span style="color: white;">-</span>
                        <input type="number" id="market-filter-level-max" placeholder="Max" oninput="if(window.renderPokeMarketSellTab) window.renderPokeMarketSellTab('pokemon')" style="width: calc(var(--m-width) * 0.06); padding: calc(var(--m-width) * 0.006); border-radius: 4px; border: 1px solid #ccc; font-size: calc(var(--m-width) * 0.017);">
                    </div>
                    <div style="display: flex; gap: calc(var(--m-width) * 0.006); align-items: center;">
                        <label style="color: white; font-size: calc(var(--m-width) * 0.017);">Q:</label>
                        <input type="number" step="0.01" id="market-filter-q-min" placeholder="Min" oninput="if(window.renderPokeMarketSellTab) window.renderPokeMarketSellTab('pokemon')" style="width: calc(var(--m-width) * 0.06); padding: calc(var(--m-width) * 0.006); border-radius: 4px; border: 1px solid #ccc; font-size: calc(var(--m-width) * 0.017);">
                        <span style="color: white;">-</span>
                        <input type="number" step="0.01" id="market-filter-q-max" placeholder="Max" oninput="if(window.renderPokeMarketSellTab) window.renderPokeMarketSellTab('pokemon')" style="width: calc(var(--m-width) * 0.06); padding: calc(var(--m-width) * 0.006); border-radius: 4px; border: 1px solid #ccc; font-size: calc(var(--m-width) * 0.017);">
                    </div>
                    <div style="display: flex; gap: calc(var(--m-width) * 0.006); align-items: center;">
                        <label style="color: white; font-size: calc(var(--m-width) * 0.017);">SumIV:</label>
                        <input type="number" id="market-filter-sumiv-min" placeholder="Min" oninput="if(window.renderPokeMarketSellTab) window.renderPokeMarketSellTab('pokemon')" style="width: calc(var(--m-width) * 0.06); padding: calc(var(--m-width) * 0.006); border-radius: 4px; border: 1px solid #ccc; font-size: calc(var(--m-width) * 0.017);">
                        <span style="color: white;">-</span>
                        <input type="number" id="market-filter-sumiv-max" placeholder="Max" oninput="if(window.renderPokeMarketSellTab) window.renderPokeMarketSellTab('pokemon')" style="width: calc(var(--m-width) * 0.06); padding: calc(var(--m-width) * 0.006); border-radius: 4px; border: 1px solid #ccc; font-size: calc(var(--m-width) * 0.017);">
                    </div>
                </div>
            </div>

            <div id="market-sell-content" style="display: flex; flex-wrap: wrap; gap: calc(var(--m-width) * 0.018); justify-content: center; overflow-y: auto; flex: 1; padding: calc(var(--m-width) * 0.012);">
                <!-- Cards injected here -->
            </div>
        </div>
    `;

    window.marketSelectedPokemonForSale = new Set();
    if (window.showModal) window.showModal('Sell Items', html);

    const modalBox = document.getElementById('modal-content-box');
    if (modalBox) {
        modalBox.dataset.originalStyles = modalBox.getAttribute('style') || '';
        modalBox.style.width = 'max-content';
        modalBox.style.height = 'max-content';
        modalBox.style.maxWidth = '90%';
        modalBox.style.maxHeight = '90%';
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

    let items = [];
    let cols = 4;

    const pokemonControls = document.getElementById('market-pokemon-sell-controls');
    if (pokemonControls) {
        pokemonControls.style.display = category === 'pokemon' ? 'flex' : 'none';
    }

    if (category === 'pokemon') {
        cols = 6;
        let html = `<div style="display: grid; grid-template-columns: repeat(${cols}, calc(var(--m-width) * 0.145)); gap: calc(var(--m-width) * 0.018); justify-content: center; width: 100%;">`;

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
            let pEv = calculatePP(p.bst, p.level, p.quality, sumIV);

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

            let imgSrc = `Assets/Pokemon Sprites/${p.qualityName === 'Shiny' ? p.id + '_shiny' : p.id}.png`;

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
                    <div style="font-size: calc(var(--m-width) * 0.017); font-weight: bold; color: #2ecc71; margin-top: calc(var(--m-width) * 0.012); line-height: 1.1;">$${formatMarketNumber(pEv)}</div>
                </div>
            `;
        });

        html += `</div>`;
        content.innerHTML = html;
        return;
    }

    if (category === 'pokeballs') {
        cols = 4;
        items = state.config.balance.items.pokeballs.map(b => ({
            name: b.name,
            buyPrice: b.price,
            img: `./Assets/Items/Balls/${b.name}.png`,
            attrLabel: b.name === 'Masterball' ? `Efficiency: 100%` : `Efficiency: ${b.multiplier}x`
        }));
    } else if (category === 'potions') {
        cols = 6;
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
        cols = 6;
        const stonePrice = state.config.balance.items.stones.price;
        let stoneKeysSell = Object.keys(state.backpack.stones);
        stoneKeysSell.sort((a, b) => a.localeCompare(b));
        items = stoneKeysSell.map(stoneName => ({
            name: stoneName,
            buyPrice: stonePrice,
            img: `./Assets/Items/Stones/${stoneName}.png`
        }));
    }

    let html = `<div style="display: grid; grid-template-columns: repeat(${cols}, calc(var(--m-width) * 0.145)); gap: calc(var(--m-width) * 0.018); justify-content: center; width: 100%;">`;
    items.forEach(item => {
        let displayName = item.name;
        if (category === 'potions') displayName = displayName.replace(' Potion', '<br>Potion');
        if (category === 'stones') displayName = displayName.replace(' Stone', '<br>Stone');

        const baseSellPrice = Math.floor(item.buyPrice * 0.5);
        let stock = 0;
        if (state.backpack[category] && state.backpack[category][item.name]) {
            stock = state.backpack[category][item.name];
        }

        const safeId = item.name.replace(/\s+/g, '');

        html += `
            <div class="market-item-card" data-basesell="${baseSellPrice}" data-id="${item.name}" data-category="${category}" data-stock="${stock}"
                style="background: #2c3e50; border: 2px solid #e74c3c; border-radius: 10px; padding: calc(var(--m-width) * 0.012); text-align: center; display: flex; flex-direction: column; align-items: center; justify-content: center;">
                <div style="font-size: calc(var(--m-width) * 0.017); font-weight: bold; margin-bottom: calc(var(--m-width) * 0.006); height: calc(var(--m-width) * 0.038); display: flex; align-items: center; justify-content: center; text-align: center; line-height: 1.1;">${displayName}</div>
                <img src="${item.img}" style="width: calc(var(--m-width) * 0.072); height: calc(var(--m-width) * 0.072); object-fit: contain; margin-bottom: calc(var(--m-width) * 0.006);">
                ${category !== 'stones' ? `<div style="font-size: calc(var(--m-width) * 0.014); color: #f1c40f; margin-bottom: calc(var(--m-width) * 0.006); line-height: 1.1;">${item.attrLabel}</div>` : ''}
                <div style="font-size: calc(var(--m-width) * 0.014); color: #bdc3c7; line-height: 1.1;">Stock: ${formatMarketNumberDown(stock)}</div>

                <div style="display: flex; gap: 5px; margin-top: calc(var(--m-width) * 0.012); align-items: center; justify-content: center; width: 100%;">
                    <input type="text" id="sell-qty-${safeId}" value="${stock > 0 ? 1 : 0}" oninput="if(window.updateSellItemPrice) window.updateSellItemPrice('${item.name}', '${category}')" style="width: calc(var(--m-width) * 0.06); height: calc(var(--m-width) * 0.025); padding: 0 calc(var(--m-width) * 0.006); font-size: calc(var(--m-width) * 0.015); text-align: center; border-radius: 5px; border: 1px solid #ccc; box-sizing: border-box; margin: 0; outline: none;">
                    <button onclick="if(window.sellSetMax) window.sellSetMax('${item.name}', '${category}')" style="display: flex; align-items: center; justify-content: center; padding: 0 calc(var(--m-width) * 0.006); height: calc(var(--m-width) * 0.025); font-size: calc(var(--m-width) * 0.015); font-weight: bold; border-radius: 5px; cursor: pointer; background: #95a5a6; color: white; border: none; box-sizing: border-box; margin: 0;">All</button>
                </div>

                <div class="market-final-price-sell" id="sell-total-${safeId}" style="font-size: calc(var(--m-width) * 0.017); font-weight: bold; color: #2ecc71; margin-top: calc(var(--m-width) * 0.012); line-height: 1.1;">$${formatMarketNumber(stock > 0 ? baseSellPrice : 0)}</div>

                <button onclick="if(window.sellMarketItem) window.sellMarketItem('${item.name}', ${baseSellPrice}, '${category}')" style="margin-top: calc(var(--m-width) * 0.012); background: #e74c3c; color: white; border: 2px solid white; border-radius: 8px; padding: 5px 15px; font-size: calc(var(--m-width) * 0.017); font-weight: bold; cursor: pointer; width: 100%;">Sell</button>
            </div>
        `;
    });
    html += `</div>`;

    content.innerHTML = html;
}

export function updateSellItemPrice(itemId, category) {
    const safeId = itemId.replace(/\s+/g, '');
    const input = document.getElementById(`sell-qty-${safeId}`);
    const totalDisplay = document.getElementById(`sell-total-${safeId}`);
    if (!input || !totalDisplay) return;

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
        input.value = "1M";
    }

    let totalVal = qty * baseSellPrice;
    totalDisplay.textContent = "$" + formatMarketNumber(totalVal);
}

export function sellSetMax(itemId, category) {
    const safeId = itemId.replace(/\s+/g, '');
    const input = document.getElementById(`sell-qty-${safeId}`);

    const cards = document.querySelectorAll('.market-item-card');
    let card = Array.from(cards).find(c => c.dataset.id === itemId && c.dataset.category === category);
    if (!card || !input) return;

    let stock = parseInt(card.dataset.stock) || 0;

    if (stock > 1000000) {
        input.value = "1M";
    } else {
        input.value = formatMarketNumberDown(stock).replace('~', '');
    }

    updateSellItemPrice(itemId, category);
}

export function sellMarketItem(itemId, baseSellPrice, category) {
    const safeId = itemId.replace(/\s+/g, '');
    const input = document.getElementById(`sell-qty-${safeId}`);

    let stock = 0;
    if (state.backpack[category] && state.backpack[category][itemId]) {
        stock = state.backpack[category][itemId];
    }

    let qty = parseMarketQuantity(input ? input.value : '0');

    if (qty <= 0) {
        if(window.showGameAlert) window.showGameAlert("Please enter a valid quantity to sell.");
        return;
    }

    if (qty > stock) {
        qty = stock;
    }

    if (qty > 1000000) qty = 1000000;

    if (stock >= qty && qty > 0) {
        const totalValue = qty * baseSellPrice;

        state.backpack[category][itemId] -= qty;
        state.trainer.money += totalValue;

        if (window.updateUI) window.updateUI();
        const moneyLabel = document.getElementById('market-trainer-money-sell');
        if (moneyLabel) {
            moneyLabel.textContent = state.trainer.money.toLocaleString();
        }

        if(window.showGameAlert) window.showGameAlert(`Sold ${formatMarketNumber(qty)}x ${itemId} for $${formatMarketNumber(totalValue)}!`);

        renderPokeMarketSellTab(category);
    } else {
        if(window.showGameAlert) window.showGameAlert("You don't have enough of that item to sell.");
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
                let pEv = calculatePP(p.bst, p.level, p.quality, sumIV);
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
            let pEv = calculatePP(p.bst, p.level, p.quality, sumIV);
            totalGain += pEv;
            return false;
        }
        return true;
    });

    state.trainer.money += totalGain;

    window.marketSelectedPokemonForSale.clear();

    if (window.updateUI) window.updateUI();

    const moneyLabel = document.getElementById('market-trainer-money-sell');
    if (moneyLabel) {
        moneyLabel.textContent = state.trainer.money.toLocaleString();
    }

    updateMarketPokemonSellCount();

    if (window.showGameAlert) {
        window.showGameAlert(`Sold ${numSold} Pokemon for $${formatMarketNumber(totalGain)}!`);
    } else {
        alert(`Sold ${numSold} Pokemon for $${totalGain}!`);
    }

    if (window.renderPokeMarketSellTab) window.renderPokeMarketSellTab('pokemon');
};
window.openPokeMarketBuy = openPokeMarketBuy;
window.renderPokeMarketTab = renderPokeMarketTab;
window.updateMarketPrices = updateMarketPrices;
window.buyItem = buyItem;
