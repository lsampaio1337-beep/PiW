
import { state } from '../../state.js';
import { updateUI } from '../../ui.js';

window.currentMarketTab = 'pokeballs';
window.currentMarketInput = '1';
window.currentMarketParsedQty = 1;

function parseQuantity(valStr) {
    let s = valStr.trim().toLowerCase();
    if (s === '') return 1;
    let multiplier = 1;
    if (s.endsWith('k')) { multiplier = 1000; s = s.slice(0, -1); }
    else if (s.endsWith('m')) { multiplier = 1000000; s = s.slice(0, -1); }
    else if (s.endsWith('b')) { multiplier = 1000000000; s = s.slice(0, -1); }
    else if (s.endsWith('t')) { multiplier = 1000000000000; s = s.slice(0, -1); }

    let num = parseFloat(s);
    if (isNaN(num) || num <= 0) return 1;
    let rawQty = num * multiplier;
    let qty = Math.ceil(rawQty);
    window.currentMarketHasRounding = (qty !== rawQty);
    return Math.min(Math.max(1, qty), 999999999999999);
}

function formatNumberDisplay(num) {
    let abs = Math.abs(num);
    let str = "";
    let rounded = false;

    if (abs >= 1e12) {
        let val = num / 1e12;
        let strVal = (Math.ceil(val * 10) / 10).toString();
        str = strVal + 't';
        if (parseFloat(strVal) !== val) rounded = true;
    } else if (abs >= 1e9) {
        let val = num / 1e9;
        let strVal = (Math.ceil(val * 10) / 10).toString();
        str = strVal + 'b';
        if (parseFloat(strVal) !== val) rounded = true;
    } else if (abs >= 1e6) {
        let val = num / 1e6;
        let strVal = (Math.ceil(val * 10) / 10).toString();
        str = strVal + 'm';
        if (parseFloat(strVal) !== val) rounded = true;
    } else if (abs >= 1e3) {
        let val = num / 1e3;
        let strVal = (Math.ceil(val * 10) / 10).toString();
        str = strVal + 'k';
        if (parseFloat(strVal) !== val) rounded = true;
    } else {
        str = num.toString();
    }

    return { str, rounded };
}

window.onMarketInput = function(val) {
    window.currentMarketInput = val;
    window.currentMarketParsedQty = parseQuantity(val);
    renderMarketCards();
};

window.switchMarketTab = function(tab) {
    window.currentMarketTab = tab;
    renderMarketCards();
};

window.buyMarketItem = function(itemId, cost, category) {
    const quantity = window.currentMarketParsedQty;
    const totalCost = cost * quantity;

    if (state.trainer.money >= totalCost) {
        state.trainer.money -= totalCost;
        if (!state.backpack[category][itemId]) state.backpack[category][itemId] = 0;
        state.backpack[category][itemId] += quantity;
        updateUI();

        // Show temporary success feedback on the card
        const card = document.getElementById(`market-card-${itemId.replace(/\s+/g, '-')}`);
        if (card) {
            const originalBorder = card.style.border;
            card.style.border = '2px solid green';
            card.style.backgroundColor = 'rgba(0, 255, 0, 0.1)';
            setTimeout(() => {
                card.style.border = originalBorder;
                card.style.backgroundColor = 'rgba(0,0,0,0.7)';
            }, 500);
        }
    } else {
        alert(`Not enough money! You need $${totalCost} but only have $${state.trainer.money}.`);
    }
};

export function openMarketModal() {
    let modal = document.getElementById('market-buy-modal');
    if (!modal) {
        modal = document.createElement('div');
        modal.id = 'market-buy-modal';
        modal.style.position = 'absolute';
        modal.style.top = '0';
        modal.style.left = '0';
        modal.style.width = '100%';
        modal.style.height = '100%';
        modal.style.backgroundColor = 'rgba(0, 0, 0, 0.8)';
        modal.style.display = 'flex';
        modal.style.justifyContent = 'center';
        modal.style.alignItems = 'center';
        modal.style.zIndex = '1000';

        modal.onclick = (e) => {
            if (e.target === modal) {
                modal.remove();
            }
        };

        document.getElementById('view-center-market').appendChild(modal);
    }

    modal.innerHTML = `
        <div style="max-width: 90%; max-height: 90%; width: max-content; height: max-content; background: #2c3e50; border-radius: 12px; display: flex; flex-direction: column; overflow: hidden; box-shadow: 0 10px 25px rgba(0,0,0,0.8); position: relative;">
            <div style="padding: 15px; background: #34495e; display: flex; justify-content: space-between; align-items: center; border-bottom: 2px solid #2980b9;">
                <h2 style="margin: 0; color: white; font-size: 24px;">PokeMarket</h2>
                <div style="display: flex; align-items: center;">
                    <span style="color: white; margin-right: 10px; font-size: 18px;">Qty:</span>
                    <input type="text" id="generic-market-input" value="${window.currentMarketInput}" oninput="window.onMarketInput(this.value)" placeholder="1k, 1m..." style="font-size: 18px; padding: 5px; width: 120px; border-radius: 6px; border: 1px solid #ccc; text-align: center;">
                </div>
            </div>

            <div style="display: flex; background: #1a252f;">
                <button onclick="window.switchMarketTab('pokeballs')" style="flex: 1; padding: 12px; font-size: 18px; cursor: pointer; background: ${window.currentMarketTab === 'pokeballs' ? '#2980b9' : 'transparent'}; color: white; border: none; border-bottom: ${window.currentMarketTab === 'pokeballs' ? '3px solid #3498db' : '3px solid transparent'}; outline: none;">Pokeballs</button>
                <button onclick="window.switchMarketTab('potions')" style="flex: 1; padding: 12px; font-size: 18px; cursor: pointer; background: ${window.currentMarketTab === 'potions' ? '#2980b9' : 'transparent'}; color: white; border: none; border-bottom: ${window.currentMarketTab === 'potions' ? '3px solid #3498db' : '3px solid transparent'}; outline: none;">Potions</button>
                <button onclick="window.switchMarketTab('stones')" style="flex: 1; padding: 12px; font-size: 18px; cursor: pointer; background: ${window.currentMarketTab === 'stones' ? '#2980b9' : 'transparent'}; color: white; border: none; border-bottom: ${window.currentMarketTab === 'stones' ? '3px solid #3498db' : '3px solid transparent'}; outline: none;">Stones</button>
            </div>

            <div id="market-cards-container" style="flex: 1; padding: 20px; overflow-y: auto; background: #ecf0f1;">
            </div>
        </div>
    `;

    // Auto-focus input on open
    setTimeout(() => {
        const inp = document.getElementById('generic-market-input');
        if (inp) inp.focus();
    }, 100);

    renderMarketCards();
}

window.renderMarketCards = function() {
    const container = document.getElementById('market-cards-container');
    if (!container) return;

    const qty = window.currentMarketParsedQty;
    let items = [];
    let category = window.currentMarketTab;

    if (category === 'pokeballs') {
        items = state.config.balance.items.pokeballs.map(b => ({
            id: b.name,
            name: b.name,
            price: b.price,
            attrLabel: 'Catch Rate',
            attrValue: `${b.multiplier}x`,
            img: `./Assets/Items/Balls/${b.name.replace(/\s+/g, '')}.png`
        }));
    } else if (category === 'potions') {
        items = state.config.balance.items.potions.map(p => {
            let invName = p.name;
            if (p.name === 'Regular Potion') invName = 'Regular Potion';
            if (p.name === 'Big') invName = 'Big Potion';
            return {
                id: invName,
                name: invName,
                price: p.price,
                attrLabel: 'Heals',
                attrValue: p.name === "Max Potion" ? "100% Heal" : `${p.heal} HP`,
                img: `./Assets/Items/Potions/${invName.replace(/\s+/g, '')}.png`
            };
        });
    } else if (category === 'stones') {
        const stonePrice = state.config.balance.items.stones.price;
        // Hardcode all known stones to ensure they are buyable even if not in inventory
        const allStones = [
            "Leaf Stone", "Fire Stone", "Water Stone", "Thunder Stone",
            "Moon Stone", "Sun Stone", "Ice Stone", "Dawn Stone",
            "Dusk Stone", "Shiny Stone", "Dragon Scale", "Kings Rock",
            "Metal Coat", "Up-Grade", "Protector", "Electirizer",
            "Magmarizer", "Dubious Disc"
        ];
        items = allStones.map(s => ({
            id: s,
            name: s,
            price: stonePrice,
            attrLabel: 'Type',
            attrValue: 'Evolution',
            img: `./Assets/Items/Stones/${s.replace(/\s+/g, '')}.png`
        }));
    }

    let html = `<div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 15px; width: 100%; justify-items: center; align-items: start;">`;

    items.forEach(item => {
        const totalRawCost = item.price * qty;
        const prefix = window.currentMarketHasRounding ? "~" : "";
        const costFmt = formatNumberDisplay(totalRawCost);
        const qtyFmt = formatNumberDisplay(qty);
        const totalCostStr = (window.currentMarketHasRounding || costFmt.rounded ? "~" : "") + costFmt.str;
        const qtyStr = (window.currentMarketHasRounding || qtyFmt.rounded ? "~" : "") + qtyFmt.str;
        // If the parsed qty is not perfectly matching a fractional input (e.g. they type 1.5 and we round up), we prefix ~ for precision loss, but for display let's just prefix ~ if total > 999 for flair or strictly implement the rounding logic.
        // Actually, the rounding logic requested was: If round up is necessary, use ~ in front of value.
        // Our parseQuantity uses Math.ceil.

        html += `
            <div id="market-card-${item.id.replace(/\s+/g, '-')}" style="background: rgba(0,0,0,0.7); border: 2px solid #7f8c8d; border-radius: 10px; padding: 15px; width: 100%; max-width: 250px; text-align: center; color: white; cursor: pointer; transition: transform 0.1s, border-color 0.1s; box-sizing: border-box;"
                 onmouseover="this.style.transform='scale(1.05)'; this.style.borderColor='#f1c40f';"
                 onmouseout="this.style.transform='scale(1)'; this.style.borderColor='#7f8c8d';"
                 onclick="window.buyMarketItem('${item.id}', ${item.price}, '${category}')">

                 <div style="font-size: 18px; font-weight: bold; margin-bottom: 10px; white-space: nowrap; overflow: hidden; text-overflow: ellipsis;">${item.name}</div>

                 <div style="height: 60px; display: flex; justify-content: center; align-items: center; margin-bottom: 10px;">
                    <img src="${item.img}" style="max-height: 100%; max-width: 100%; object-fit: contain; filter: drop-shadow(0 2px 4px rgba(0,0,0,0.5));" onerror="this.src='./Assets/Items/Balls/Pokeball.png'">
                 </div>

                 <div style="font-size: 14px; color: #bdc3c7; margin-bottom: 5px;">${item.attrLabel}: ${item.attrValue}</div>

                 <div style="background: rgba(0,0,0,0.5); border-radius: 6px; padding: 8px; margin-top: 10px;">
                    <div style="font-size: 12px; color: #95a5a6; margin-bottom: 2px;">Total for ${qtyStr}:</div>
                    <div style="font-size: 16px; color: #f1c40f; font-weight: bold;">$${totalCostStr}</div>
                 </div>
            </div>
        `;
    });

    html += `</div>`;
    container.innerHTML = html;
};
