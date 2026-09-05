import { state, globals } from '../state.js';
import { updateUI, showModal } from '../ui.js';

export function setupMarket(vCenter) {
    // We need 1 button on left y=20% and 1 button on right y=20%.
    // And when the buy button is clicked, it opens a modal.
    vCenter.innerHTML = `
        <div style="position: absolute; top: 0; left: 0; width: 100%; height: 100%; display: flex; justify-content: space-between; align-items: center; padding: 0 10vw; box-sizing: border-box;">
            <!-- PokeCenter Button (Left) -->
            <button id="btn-heal-all" style="
                background: #e74c3c;
                color: white;
                border: 3px solid white;
                border-radius: 12px;
                padding: 15px 30px;
                font-size: 24px;
                font-weight: bold;
                cursor: pointer;
                box-shadow: 0 4px 10px rgba(0,0,0,0.5);
                transform: translateY(-30vh);
            ">PokeCenter</button>

            <!-- PokeMarket Button (Right) -->
            <button id="btn-market-buy" style="
                background: #3498db;
                color: white;
                border: 3px solid white;
                border-radius: 12px;
                padding: 15px 30px;
                font-size: 24px;
                font-weight: bold;
                cursor: pointer;
                box-shadow: 0 4px 10px rgba(0,0,0,0.5);
                transform: translateY(-30vh);
            ">PokeMarket</button>
        </div>
    `;
    vCenter.style.backgroundImage = "url('./Assets/BG/BG-PCPM.png')";
    vCenter.style.backgroundSize = "cover";
    vCenter.style.backgroundPosition = "center";
    vCenter.style.height = "100%";
    vCenter.style.position = "relative";
    vCenter.style.textAlign = "center";

    document.getElementById('btn-heal-all').onclick = () => {
        state.party.forEach(p => p.currentHp = p.maxHp);
        state.storage.forEach(p => p.currentHp = p.maxHp);
        updateUI();
    };

    document.getElementById('btn-market-buy').onclick = () => {
        if (window.openPokeMarketBuy) {
            window.openPokeMarketBuy();
        } else {
            openPokeMarketBuy();
        }
    };
}

// Memory: modal should be "width: max-content; height: max-content; max-width: 90%; max-height: 90%;"
export function openPokeMarketBuy() {
    // Generate tabs: Balls, Potions, Stones
    const html = `
        <div id="market-buy-modal" style="display: flex; flex-direction: column; width: 100%; height: 100%;">

            <div style="display: flex; gap: 10px; margin-bottom: 15px; justify-content: center;">
                <button onclick="window.renderPokeMarketTab('pokeballs')" style="padding: 10px 20px; font-weight: bold;">Balls</button>
                <button onclick="window.renderPokeMarketTab('potions')" style="padding: 10px 20px; font-weight: bold;">Potions</button>
                <button onclick="window.renderPokeMarketTab('stones')" style="padding: 10px 20px; font-weight: bold;">Stones</button>
            </div>

            <div style="margin-bottom: 15px; display: flex; align-items: center; justify-content: center; gap: 10px;">
                <label style="font-weight: bold; font-size: 18px;">Quantity to Buy:</label>
                <input type="text" id="market-global-qty" value="1" oninput="window.updateMarketPrices()" style="width: 100px; padding: 5px; font-size: 18px; text-align: center; border-radius: 5px; border: 1px solid #ccc;">
            </div>

            <div id="market-buy-content" style="display: flex; flex-wrap: wrap; gap: 15px; justify-content: center; overflow-y: auto; flex: 1; padding: 10px;">
                <!-- Cards injected here -->
            </div>
        </div>
    `;

    showModal("PokeMarket", html);

    // Apply specific modal overrides
    const modalBox = document.getElementById('modal-content-box');
    if (modalBox) {
        modalBox.dataset.originalStyles = modalBox.getAttribute('style') || '';
        modalBox.style.width = 'max-content';
        modalBox.style.height = 'max-content';
        modalBox.style.maxWidth = '90%';
        modalBox.style.maxHeight = '90%';
    }

    // Default to balls tab
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

    // Round up to 1 decimal place
    // 4.44 -> 4.5
    let rounded = Math.ceil(val * 10) / 10;

    // Check if rounding changed the original meaning
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

    // Update all cards based on their base price
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
        cols = 7;
        items = state.config.balance.items.potions.map(p => {
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
        // Generate list from backpack stone keys
        let stoneKeys = Object.keys(state.backpack.stones);
        stoneKeys.sort((a, b) => a.localeCompare(b));
        items = stoneKeys.map(stoneName => ({
            name: stoneName,
            price: stonePrice,
            img: `./Assets/Items/Stones/${stoneName}.png`,
            attrLabel: `Evolution Item`
        }));
    }

    let html = `<div style="display: grid; grid-template-columns: repeat(${cols}, minmax(0, 120px)); gap: 1vw; justify-content: center; width: 100%;">`;
    items.forEach(item => {
        html += `
            <div class="market-item-card" data-price="${item.price}" data-id="${item.name}" data-category="${category}"
                onclick="window.buyItem('${item.name}', ${item.price}, '${category}')"
                style="background: #2c3e50; border: 2px solid #3498db; border-radius: 10px; padding: 5px; text-align: center; cursor: pointer; transition: transform 0.2s; container-type: inline-size; display: flex; flex-direction: column; align-items: center; justify-content: center;">
                <div style="font-size: 14cqw; font-weight: bold; margin-bottom: 5px; height: 32px; display: flex; align-items: center; justify-content: center;">${item.name}</div>
                <img src="${item.img}" style="width: 50cqw; height: 50cqw; object-fit: contain; margin-bottom: 5px;">
                <div style="font-size: 12cqw; color: #f1c40f; margin-bottom: 5px;">${item.attrLabel}</div>
                <div style="font-size: 12cqw; color: #bdc3c7;">Base: $${formatMarketNumber(item.price)}</div>
                <div class="market-final-price" style="font-size: 14cqw; font-weight: bold; color: #2ecc71; margin-top: 5px;">$${formatMarketNumber(item.price)}</div>
            </div>
        `;
    });
    html += `</div>`;

    content.innerHTML = html;
    updateMarketPrices(); // Apply current quantity to new cards
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
        alert(`Bought ${qty.toLocaleString()}x ${itemId} for $${totalCost.toLocaleString()}!`);
    } else {
        alert(`Not enough money! You need $${totalCost.toLocaleString()} but only have $${state.trainer.money.toLocaleString()}.`);
    }
}
