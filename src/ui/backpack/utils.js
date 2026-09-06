import { state } from '../../state.js';
export function formatQuantity(q) {
    if (q >= 1000000) return Math.floor(q / 1000000) + 'm';
    if (q >= 1000) return Math.floor(q / 1000) + 'k';
    return q;
}

export function getBasePrice(category, itemName) {
    const balance = state ? state.config.balance : (typeof state !== 'undefined' ? state.config.balance : null);
    if (!balance) return 0;

    if (category === 'pokeballs') {
        const item = balance.items.pokeballs.find(b => b.name === itemName);
        return item ? item.price : 0;
    } else if (category === 'potions') {
        let lookupName = itemName;
        if (itemName === 'Regular Potion') lookupName = 'Regular'; // Potions balance name might differ, checking later
        const item = balance.items.potions.find(p => p.name === itemName || p.name === lookupName || (itemName === 'Big Potion' && p.name === 'Big'));
        return item ? item.price : 0;
    } else if (category === 'stones') {
        return balance.items.stones.price;
    }
    return 0;
}

export function updateSellValueDisplay(category) {
    let total = 0;
    document.querySelectorAll('.sell-qty-input').forEach(input => {
        let qty = parseInt(input.value) || 0;
        let price = parseInt(input.dataset.price) || 0;
        total += Math.floor(qty * (price * 0.5));
    });

    const display = document.getElementById('sell-value-display');
    if (display) {
        display.innerHTML = `Total Earned: $${total.toLocaleString()}`;
    }
}

export function sellSelectedItems(category) {
    let totalEarned = 0;
    let itemsSold = 0;

    document.querySelectorAll('.sell-qty-input').forEach(input => {
        let qty = parseInt(input.value) || 0;
        let price = parseInt(input.dataset.price) || 0;
        let itemName = input.dataset.item;

        if (qty > 0) {
            let maxQty = state.backpack[category][itemName] || 0;
            if (qty > maxQty) qty = maxQty;

            state.backpack[category][itemName] -= qty;
            totalEarned += Math.floor(qty * (price * 0.5));
            itemsSold += qty;
        }
    });

    if (itemsSold > 0) {
        state.trainer.money += totalEarned;
        window.updateUI();
        if (window.renderBackpackTab) {
            window.renderBackpackTab(category);
        }
    }
}

window.updateSellValueDisplay = updateSellValueDisplay;
window.sellSelectedItems = sellSelectedItems;
