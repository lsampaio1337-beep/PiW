import { state, globals } from '../state.js';
import { updateUI } from '../ui.js';

export function setupMarket(vCenter) {
    vCenter.style.backgroundImage = "url('./Assets/BG/BG-PCPM.png')";
    vCenter.style.backgroundSize = "cover";
    vCenter.style.backgroundPosition = "center";
    vCenter.style.backgroundRepeat = "no-repeat";
    vCenter.style.height = "100%";
    vCenter.style.width = "100%";
    vCenter.style.position = "relative";

    // Clear out old UI
    vCenter.innerHTML = '';

    // Create interactive overlay buttons (Transparent absolute positioned for realism, but let's just make nice visual buttons positioned over the desks)
    vCenter.innerHTML = `
        <div id="market-toast" style="display: none; position: absolute; top: 10%; left: 50%; transform: translateX(-50%); background: #2ecc71; color: white; padding: 10px 20px; border-radius: 8px; z-index: 200; font-weight: bold; box-shadow: 0 4px 6px rgba(0,0,0,0.5);"></div>
        <!-- Left Side: PokeCenter -->
        <button id="btn-heal-all" style="position: absolute; left: 15%; top: 20%; padding: 15px 30px; font-size: 18px; font-weight: bold; background: #e74c3c; color: white; border: 2px solid white; border-radius: 8px; cursor: pointer; transform: translate(-50%, -50%); box-shadow: 0 4px 6px rgba(0,0,0,0.3);">
            Heal
        </button>

        <!-- Right Side: PokeMarket -->
        <div style="position: absolute; right: 15%; top: 20%; transform: translate(50%, -50%); display: flex; flex-direction: column; gap: 15px;">
            <button id="btn-market-buy" style="padding: 15px 30px; font-size: 18px; font-weight: bold; background: #3498db; color: white; border: 2px solid white; border-radius: 8px; cursor: pointer; box-shadow: 0 4px 6px rgba(0,0,0,0.3);">
                Buy
            </button>
            <button id="btn-market-sell" style="padding: 15px 30px; font-size: 18px; font-weight: bold; background: #2ecc71; color: white; border: 2px solid white; border-radius: 8px; cursor: pointer; box-shadow: 0 4px 6px rgba(0,0,0,0.3);">
                Sell
            </button>
        </div>

        <!-- Market Buy Modal Container (Hidden by default) -->
        <div id="market-buy-modal-overlay" onclick="window.closeMarketBuyModal(event)" style="display: none; position: absolute; top: 0; left: 0; width: 100%; height: 100%; z-index: 99; background: rgba(0,0,0,0.5);">
        <div id="market-buy-modal" style="position: absolute; top: 50%; left: 50%; transform: translate(-50%, -50%); background: rgba(0,0,0,0.9); padding: 2%; border-radius: 12px; border: 2px solid #3498db; width: 60%; max-width: 800px; max-height: 80%; overflow-y: auto; color: white; z-index: 100; resize: both; overflow: auto; container-type: inline-size;" onclick="event.stopPropagation()">
            <h2 style="text-align: center; margin-top: 0; font-size: 5cqi;">PokeMarket - Buy</h2>


            <div style="text-align: center; margin-bottom: 20px;">
                <button onclick="window.renderBuyTab('pokeballs')" style="padding: 1cqi 2cqi; margin: 0 1cqi; cursor: pointer; font-size: 2.5cqi;">Pokeballs</button>
                <button onclick="window.renderBuyTab('potions')" style="padding: 1cqi 2cqi; margin: 0 1cqi; cursor: pointer; font-size: 2.5cqi;">Potions</button>
                <button onclick="window.renderBuyTab('stones')" style="padding: 1cqi 2cqi; margin: 0 1cqi; cursor: pointer; font-size: 2.5cqi;">Stones</button>
            </div>

            <div style="text-align: center; margin-bottom: 3cqi; background: #222; padding: 2cqi; border-radius: 1cqi; font-size: 3cqi;">
                <label>Purchase Quantity: </label>
                <input type="number" id="global-buy-qty" value="1" min="1" oninput="window.updateBuyPrices()" style="width: 15cqi; padding: 1cqi; text-align: center; font-size: 3cqi;">
            </div>

            <div id="market-buy-items-grid" style="display: grid; grid-template-columns: repeat(auto-fit, minmax(15cqi, 1fr)); gap: 2cqi; justify-content: center;">
                <!-- Items injected here -->
            </div>
        </div>
    </div>
    `;

    document.getElementById('btn-heal-all').onclick = () => {
        state.party.forEach(p => p.currentHp = p.maxHp);

        updateUI();
    };

    document.getElementById('btn-market-buy').onclick = () => {
        document.getElementById('market-buy-modal-overlay').style.display = 'block';
        window.renderBuyTab('pokeballs'); // Default tab
    };

    document.getElementById('btn-market-sell').onclick = () => {
        if (document.getElementById('market-buy-modal-overlay')) {
            document.getElementById('market-buy-modal-overlay').style.display = 'none';
        }
        if (window.startSellMode) {
            window.startSellMode();
        }
    };
}

// Global functions for inline HTML calls in the buy modal
window.renderBuyTab = function(category) {
    const modal = document.getElementById('market-buy-modal');
    if (modal) {
        if (category === 'pokeballs') {
            modal.style.width = '40%';
            modal.style.maxWidth = '600px';
        } else if (category === 'potions') {
            modal.style.width = '55%';
            modal.style.maxWidth = '700px';
        } else if (category === 'stones') {
            modal.style.width = '70%';
            modal.style.maxWidth = '800px';
        }
    }
    const grid = document.getElementById('market-buy-items-grid');
    if (!grid) return;
    window.currentBuyCategory = category;
    let html = '';

    if (category === 'pokeballs') {
        grid.style.gridTemplateColumns = 'repeat(auto-fit, minmax(15cqi, 1fr))';
        grid.style.justifyContent = 'center';
        state.config.balance.items.pokeballs.forEach(b => {
            html += generateBuyCard(b.name, b.price, `Efficiency: ${b.multiplier}x`, category, `Assets/Items/Balls/${b.name.replace(/Regular Pokeball/, "Pokeball").replace(/Great Pokeball/, "Greatball").replace(/Ultra Pokeball/, "Ultraball").replace(/Master Pokeball/, "Masterball")}.png`);
        });
    } else if (category === 'potions') {
        grid.style.gridTemplateColumns = 'repeat(auto-fit, minmax(15cqi, 1fr))';
        grid.style.justifyContent = 'center';
        state.config.balance.items.potions.forEach(p => {
            let inventoryName = p.name;
            if (p.name === 'Regular Potion') inventoryName = 'Regular Potion';
            if (p.name === 'Big') inventoryName = 'Big Potion';
            html += generateBuyCard(inventoryName, p.price, `Heals: ${p.heal} HP`, category, `Assets/Items/Potions/${inventoryName}.png`);
        });
    } else if (category === 'stones') {
        grid.style.gridTemplateColumns = 'repeat(auto-fit, minmax(15cqi, 1fr))';
        const stonePrice = state.config.balance.items.stones.price;
        Object.keys(state.backpack.stones).forEach(stoneName => {
            html += generateBuyCard(stoneName, stonePrice, "", category, `Assets/Items/Stones/${stoneName}.png`);
        });
    }

    grid.innerHTML = html;
    window.updateBuyPrices();
};

function generateBuyCard(name, price, attribute, category, imgPath) {
    // Break names into 2 lines for potions and stones based on space
    let displayName = name;
    if (category === 'potions' || category === 'stones') {
        let parts = name.split(' ');
        if (parts.length > 1) {
            displayName = parts[0] + '<br>' + parts.slice(1).join(' ');
        }
    }

    return `
        <div onclick="window.confirmBuyItem('${name}', ${price}, '${category}')" style="background: #333; border: 2px solid #555; border-radius: 1cqi; padding: 2cqi; text-align: center; cursor: pointer; transition: transform 0.1s; display: flex; flex-direction: column; align-items: center; justify-content: space-between;" onmouseover="this.style.transform='scale(1.05)'" onmouseout="this.style.transform='scale(1)'">
            <img src="${imgPath}" onerror="this.src='./Assets/Extra/Spot.png'" style="width: 80%; aspect-ratio: 1/1; object-fit: contain; margin-bottom: 2cqi;">
            <div style="font-weight: bold; font-size: 3cqi; margin-bottom: 1cqi; line-height: 1.2;">${displayName}</div>
            ${attribute ? `<div style="font-size: 2cqi; color: #aaa; margin-bottom: 1cqi;">${attribute}</div>` : ""}
            <div class="buy-price-display" data-base-price="${price}" style="color: #f1c40f; font-weight: bold; font-size: 3.5cqi; margin-top: auto;">
                $${formatMarketPrice(price)}
            </div>
        </div>
    `;
}

window.updateBuyPrices = function() {
    const qtyInput = document.getElementById('global-buy-qty');
    if (!qtyInput) return;

    let qty = parseInt(qtyInput.value);
    if (isNaN(qty) || qty < 1) {
        qty = 1;
        qtyInput.value = 1;
    }

    const priceDisplays = document.querySelectorAll('.buy-price-display');
    priceDisplays.forEach(el => {
        const basePrice = parseInt(el.getAttribute('data-base-price'));
        el.innerText = "$" + formatMarketPrice(basePrice * qty);
    });
};

window.confirmBuyItem = function(itemId, cost, category) {
    const qtyInput = document.getElementById('global-buy-qty');
    let qty = 1;
    if (qtyInput) {
        qty = parseInt(qtyInput.value);
        if (isNaN(qty) || qty < 1) qty = 1;
    }

    const totalCost = cost * qty;

    if (state.trainer.money >= totalCost) {
        state.trainer.money -= totalCost;
        if (state.backpack[category][itemId] !== undefined) {
             state.backpack[category][itemId] += qty;
        } else {
             state.backpack[category][itemId] = qty;
        }
        updateUI();
        const toast = document.getElementById('market-toast');
        if (toast) {
            toast.innerText = `Bought ${qty}x ${itemId} for ${totalCost.toLocaleString()}!`;
            toast.style.display = 'block';
            setTimeout(() => { toast.style.display = 'none'; }, 2000);
        }
    } else {
        alert(`Not enough money! You need $${totalCost.toLocaleString()} but only have $${state.trainer.money.toLocaleString()}.`);
    }
};

window.closeMarketBuyModal = function(e) {
    const overlay = document.getElementById('market-buy-modal-overlay');
    if (overlay) overlay.style.display = 'none';
};



    if (val < 1000000000) {
        let exactM = val / 1000000;
        let roundedUpM = Math.ceil(val / 100000) / 10;
        let isExact = (exactM === roundedUpM);
        return (isExact ? "" : "~") + roundedUpM.toFixed(1) + "m";
    }

    if (val < 1000000000000) {
        let exactB = val / 1000000000;
        let roundedUpB = Math.ceil(val / 100000000) / 10;
        let isExact = (exactB === roundedUpB);
        return (isExact ? "" : "~") + roundedUpB.toFixed(1) + "b";
    }

    let exactT = val / 1000000000000;
    let roundedUpT = Math.ceil(val / 100000000000) / 10;
    let isExact = (exactT === roundedUpT);
    return (isExact ? "" : "~") + roundedUpT.toFixed(1) + "t";
}

    let exactM = val / 1000000;
    let roundedUpM = Math.ceil(val / 100000) / 10;
    let isExact = (exactM === roundedUpM);
    return (isExact ? "" : "~") + roundedUpM.toFixed(1) + "m";
}
