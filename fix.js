const fs = require('fs');

let content = fs.readFileSync('src/ui/tokenShop.js', 'utf8');

const replacement = `function renderSelectableItemActions(item) {
    return \`
        <div style="display: flex; gap: 5px; width: 100%;">
            <button onclick="window.buyTokenItemRandom('\${item.id}')" style="flex: 1; padding: 5px; background: #2ecc71; color: white; border: none; border-radius: 5px; cursor: pointer; font-weight: bold; font-size: 12px;">Random<br><img src="Assets/Extra/Token.png" style="width:12px;vertical-align:middle;"> \${item.randomPrice}</button>
            <button onclick="window.showTokenItemSelect('\${item.id}')" style="flex: 1; padding: 5px; background: #2ecc71; color: white; border: none; border-radius: 5px; cursor: pointer; font-weight: bold; font-size: 12px;">Choose<br><img src="Assets/Extra/Token.png" style="width:12px;vertical-align:middle;"> \${item.selectPrice}</button>
        </div>
    \`;
}

function renderLockedItemActions() {
    return \`
        <button disabled style="width: 100%; padding: 8px; background: #95a5a6; color: white; border: none; border-radius: 5px; cursor: not-allowed; font-weight: bold; font-size: 12px;">
            Need to unlock Daycare
        </button>
    \`;
}

function renderBuyableItemActions(item) {
    return \`
        <button onclick='\${item.action}' style="width: 100%; padding: 8px; background: #2ecc71; color: white; border: none; border-radius: 5px; cursor: pointer; font-weight: bold; font-size: 12px;">
            Buy for <img src="Assets/Extra/Token.png" style="width:14px;vertical-align:middle;"> \${item.price}
        </button>
    \`;
}

function renderTokenShopItem(item) {
    let isLocked = false;
    if (item.unlockKey === 'daycare' && (!state.globalStats || !state.globalStats.hasSeenDaycare)) {
        isLocked = true;
    }

    let html = \`
        <div style="background: #2c3e50; border: 2px solid #3498db; border-radius: 8px; padding: 8px; display: flex; flex-direction: column; align-items: center; text-align: center; justify-content: space-between; box-sizing: border-box; width: 100%;">
            <div style="font-weight: bold; font-size: 12px; margin-bottom: 5px; height: 30px; display: flex; align-items: center; color: white;">\${item.name}</div>
            <img src="\${item.img}" style="width: 40px; height: 40px; object-fit: contain; margin-bottom: 5px;">
            <div style="font-size: 10px; color: #bdc3c7; margin-bottom: 10px; flex-grow: 1;">\${item.desc}</div>
    \`;

    if (item.isSelectable) {
        html += renderSelectableItemActions(item);
    } else {
        if (isLocked) {
            html += renderLockedItemActions();
        } else {
            html += renderBuyableItemActions(item);
        }
    }

    html += \`</div>\`;
    return html;
}`;

// Use regex to replace the function since we know exactly what we want to replace
const searchPattern = /function renderTokenShopItem\(item\) \{[\s\S]*?html \+= `<\/div>`;\n    return html;\n\}/;

content = content.replace(searchPattern, replacement);
fs.writeFileSync('src/ui/tokenShop.js', content);
