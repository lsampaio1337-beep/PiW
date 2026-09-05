import { state, globals } from '../state.js';
import { updateUI } from '../ui.js';

export function setupMarket(vCenter) {
    vCenter.innerHTML = `
        <div style="background-color: rgba(0,0,0,0.8); display: inline-block; padding: 20px; margin-top: 50px; border-radius: 8px;">
            <h2>Pokemon Center & Market</h2>
            <div style="margin-top: 20px;">
                <button id="btn-heal-all" style="padding: 10px 20px; font-size: 16px; margin-right: 10px;">Pokemon Center (Heal All)</button>
                <button id="btn-market-buy" style="padding: 10px 20px; font-size: 16px; margin-right: 10px;">Market (Buy Items)</button>
                    <button id="btn-market-sell" style="padding: 10px 20px; font-size: 16px;">Market (Sell Items)</button>
            </div>
            <div id="market-panel" style="margin-top: 20px; display: none; text-align: left; max-height: 300px; overflow-y: auto;">
                <h3>Buy Items</h3>
                <div id="market-items"></div>
            </div>
        </div>
    `;
    vCenter.style.backgroundSize = "cover";
    vCenter.style.height = "100%";
    vCenter.style.textAlign = "center";

    document.getElementById('btn-heal-all').onclick = () => {
        state.party.forEach(p => p.currentHp = p.maxHp);
        alert("All Pokemon have been healed!");
        updateUI();
    };


        document.getElementById('btn-market-sell').onclick = () => {
            if (window.startSellMode) {
                window.startSellMode();
            }
        };

        document.getElementById('btn-market-buy').onclick = () => {

        const panel = document.getElementById('market-panel');
        panel.style.display = panel.style.display === 'none' ? 'block' : 'none';
        if(panel.style.display === 'block') {
            const itemsDiv = document.getElementById('market-items');
            let itemsHtml = '<h4>Pokeballs</h4>';

            state.config.balance.items.pokeballs.forEach(b => {
                if (state.backpack.pokeballs[b.name] !== undefined) {
                    itemsHtml += `<div style="margin-bottom: 5px; display: flex; align-items: center; justify-content: space-between;">
                        <span>${b.name} ($${b.price})</span>
                        <div>
                            <input type="number" id="buy-qty-${b.name.replace(/\\s+/g, '-')}" value="1" min="1" style="width: 50px; padding: 5px; margin-right: 5px;">
                            <button onclick="window.buyItem('${b.name}', ${b.price}, 'pokeballs')">Buy</button>
                        </div>
                    </div>`;
                }
            });

            itemsHtml += '<h4>Potions</h4>';

            state.config.balance.items.potions.forEach(p => {
                let inventoryName = p.name;
                if (p.name === 'Regular Potion') inventoryName = 'Regular Potion';
                if (p.name === 'Big') inventoryName = 'Big Potion';
                if (p.name === 'Max Potion') return;

                if (state.backpack.potions[inventoryName] !== undefined) {
                    itemsHtml += `<div style="margin-bottom: 5px; display: flex; align-items: center; justify-content: space-between;">
                        <span>${inventoryName} ($${p.price})</span>
                        <div>
                            <input type="number" id="buy-qty-${inventoryName.replace(/\\s+/g, '-')}" value="1" min="1" style="width: 50px; padding: 5px; margin-right: 5px;">
                            <button onclick="window.buyItem('${inventoryName}', ${p.price}, 'potions')">Buy</button>
                        </div>
                    </div>`;
                }
            });

            itemsHtml += '<h4>Stones</h4>';

            const stonePrice = state.config.balance.items.stones.price;
            Object.keys(state.backpack.stones).forEach(stoneName => {
                itemsHtml += `<div style="margin-bottom: 5px; display: flex; align-items: center; justify-content: space-between;">
                    <span>${stoneName} ($${stonePrice})</span>
                    <div>
                        <input type="number" id="buy-qty-${stoneName.replace(/\\s+/g, '-')}" value="1" min="1" style="width: 50px; padding: 5px; margin-right: 5px;">
                        <button onclick="window.buyItem('${stoneName}', ${stonePrice}, 'stones')">Buy</button>
                    </div>
                </div>`;
            });

            itemsDiv.innerHTML = itemsHtml;
        }
    };
}

export function buyItem(itemId, cost, category) {
    const inputEl = document.getElementById(`buy-qty-${itemId.replace(/\\s+/g, '-')}`);
    if (!inputEl) return;
    const quantity = parseInt(inputEl.value);
    if (isNaN(quantity) || quantity <= 0) return;

    const totalCost = cost * quantity;

    if (state.trainer.money >= totalCost) {
        state.trainer.money -= totalCost;
        state.backpack[category][itemId] += quantity;
        updateUI();
        alert(`Bought ${quantity}x ${itemId} for $${totalCost}!`);
    } else {
        alert(`Not enough money! You need $${totalCost} but only have $${state.trainer.money}.`);
    }
}
