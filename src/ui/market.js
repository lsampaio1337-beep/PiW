import { state, globals } from '../state.js';
import { updateUI, showModal } from '../ui.js';

export function setupMarket(vCenter) {
    vCenter.innerHTML = `
        <div style="position: absolute; top: 0; left: 0; width: 100%; height: 100%; display: flex; justify-content: space-between; align-items: center; padding: 0 10vw; box-sizing: border-box;">
            <button id="btn-heal-all" style="background: #3498db; color: white; border: 3px solid white; border-radius: 12px; padding: 15px 30px; font-size: 24px; font-weight: bold; cursor: pointer; box-shadow: 0 4px 10px rgba(0,0,0,0.5); transform: translateY(-30vh);">Heal</button>
            <button id="btn-market-buy" style="background: #f1c40f; color: black; border: 3px solid white; border-radius: 12px; padding: 15px 30px; font-size: 24px; font-weight: bold; cursor: pointer; box-shadow: 0 4px 10px rgba(0,0,0,0.5); transform: translateY(-30vh);">Buy</button>
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
}

export function openPokeMarketBuy() {
    const html = `
        <div id="market-buy-wrapper" style="display: flex; flex-direction: column; width: 100%; height: 100%; margin-top: 10px; --m-width: min(90vw, 825px);">
            <div style="display: flex; gap: calc(var(--m-width) * 0.012); margin-bottom: calc(var(--m-width) * 0.024); justify-content: center;">
                <button onclick="window.renderPokeMarketTab('pokeballs')" style="padding: calc(var(--m-width) * 0.012) calc(var(--m-width) * 0.024); font-size: calc(var(--m-width) * 0.019); font-weight: bold; border-radius: 5px;">Balls</button>
                <button onclick="window.renderPokeMarketTab('potions')" style="padding: calc(var(--m-width) * 0.012) calc(var(--m-width) * 0.024); font-size: calc(var(--m-width) * 0.019); font-weight: bold; border-radius: 5px;">Potions</button>
                <button onclick="window.renderPokeMarketTab('stones')" style="padding: calc(var(--m-width) * 0.012) calc(var(--m-width) * 0.024); font-size: calc(var(--m-width) * 0.019); font-weight: bold; border-radius: 5px;">Stones</button>
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

export function updateMarketPrices() {
    const qtyInput = document.getElementById('market-global-qty');
    if (!qtyInput) return;

    let qty = parseMarketQuantity(qtyInput.value);
    if (qty > 1000000) {
        qty = 1000000;
        qtyInput.value = "1M";
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

    let items = [];
    let cols = 4;

    if (category === 'pokeballs') {
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

        html += `
            <div class="market-item-card" data-price="${item.price}" data-id="${item.name}" data-category="${category}"
                onclick="window.buyItem('${item.name}', ${item.price}, '${category}')"
                style="background: #2c3e50; border: 2px solid #3498db; border-radius: 10px; padding: calc(var(--m-width) * 0.012); text-align: center; cursor: pointer; transition: transform 0.2s; display: flex; flex-direction: column; align-items: center; justify-content: center;">
                <div style="font-size: calc(var(--m-width) * 0.017); font-weight: bold; margin-bottom: calc(var(--m-width) * 0.006); height: calc(var(--m-width) * 0.038); display: flex; align-items: center; justify-content: center; text-align: center; line-height: 1.1;">${displayName}</div>
                <img src="${item.img}" style="width: calc(var(--m-width) * 0.072); height: calc(var(--m-width) * 0.072); object-fit: contain; margin-bottom: calc(var(--m-width) * 0.006);">
                ${category !== 'stones' ? `<div style="font-size: calc(var(--m-width) * 0.014); color: #f1c40f; margin-bottom: calc(var(--m-width) * 0.006); line-height: 1.1;">${item.attrLabel}</div>` : ''}
                <div style="font-size: calc(var(--m-width) * 0.014); color: #bdc3c7; line-height: 1.1;">Base: $${formatMarketNumber(item.price)}</div>
                <div class="market-final-price" style="font-size: calc(var(--m-width) * 0.017); font-weight: bold; color: #2ecc71; margin-top: calc(var(--m-width) * 0.006); line-height: 1.1;">$${formatMarketNumber(item.price)}</div>
            </div>
        `;
    });
    html += `</div>`;

    content.innerHTML = html;
    updateMarketPrices();
}

export function buyItem(itemId, baseCost, category) {
    const qtyInput = document.getElementById('market-global-qty');
    const qty = parseMarketQuantity(qtyInput ? qtyInput.value : '1');
    if (qty <= 0) return;

    const totalCost = baseCost * qty;

    if (state.trainer.money >= totalCost) {
        state.trainer.money -= totalCost;
        if (state.backpack[category][itemId] === undefined) {
             state.backpack[category][itemId] = 0;
        }
        state.backpack[category][itemId] += qty;
        updateUI();
        const moneyLabel = document.getElementById('market-trainer-money');
        if (moneyLabel) moneyLabel.textContent = state.trainer.money.toLocaleString();
        alert(`Bought ${qty.toLocaleString()}x ${itemId} for $${totalCost.toLocaleString()}!`);
    } else {
        alert(`Not enough money! You need $${totalCost.toLocaleString()} but only have $${state.trainer.money.toLocaleString()}.`);
    }
}
