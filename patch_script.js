const fs = require('fs');

const file = 'src/ui/market.js';
let content = fs.readFileSync(file, 'utf8');

// Function 1: getMarketItems(category)
const getMarketItemsLogic = `
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
            img: \`./Assets/Items/Balls/\${b.name}.png\`,
            attrLabel: b.name === 'Masterball' ? \`Efficiency: 100%\` : \`Efficiency: \${b.multiplier}x\`
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
                    img: \`./Assets/Items/Potions/\${invName}.png\`,
                    attrLabel: \`Heal: \${p.heal >= 999999 ? '100%' : p.heal + ' HP'}\`
                };
            });
    } else if (category === 'stones') {
        const badges = state.trainer.badges || 0;
        const stonePrice = Math.max(1000, 1000 * badges);
        let stoneKeys = Object.keys(state.backpack.stones).filter(k => !VITAMINS.includes(k));
        stoneKeys.sort((a, b) => a.localeCompare(b));
        items = stoneKeys.map(stoneName => {
            return {
                name: stoneName,
                price: stonePrice,
                img: \`./Assets/Items/Stones/\${stoneName}.png\`,
                attrLabel: \`Evolution Item\`
            };
        });
    } else if (category === 'vitamins') {
        const badges = state.trainer.badges || 0;
        const getVitaminPrice = (vitaminName, badges) => {
            switch(vitaminName) {
                case 'HP Up': return Math.max(1000, 1000 * badges);
                case 'Carbo Speed': return Math.max(500, 500 * badges);
                case 'Protein Atk': return Math.max(750, Math.ceil(750 * badges));
                case 'Calcium SpAtk': return Math.max(750, Math.ceil(750 * badges));
                case 'Iron Def': return Math.max(782, Math.round(625 * badges));
                case 'Zinc SpDef': return Math.max(625, Math.round(625 * badges));
                default: return Math.max(2000, 1000 * badges);
            }
        };
        items = VITAMINS.map(vitaminName => {
            return {
                name: vitaminName,
                price: getVitaminPrice(vitaminName, badges),
                img: \`./Assets/Items/Vitamins/\${vitaminName}.png\`,
                attrLabel: \`Stat Item\`
            };
        });
    }
    return items;
}
`;

const generateMarketItemCardLogic = `
function generateMarketItemCard(item, category, stock) {
    let displayName = item.displayName || item.name;
    if (category === 'potions') displayName = displayName.replace(' Potion', '<br>Potion');
    if (category === 'stones') displayName = displayName.replace(' Stone', '<br>Stone');

    const safeId = escapeHTML(item.name.replace(/\\s+/g, ''));
    const safeItemNameAttr = escapeHTML(item.name);
    const safeItemNameJS = escapeHTML(escapeJS(item.name));
    const safeCategoryAttr = escapeHTML(category);
    const safeCategoryJS = escapeHTML(escapeJS(category));

    let buyAction = \`if(window.buyItem) window.buyItem('\${safeItemNameJS}', \${item.price}, '\${safeCategoryJS}')\`;
    if (category === 'upgrades') {
        const safeUpgradeTypeJS = escapeHTML(escapeJS(item.upgradeType));
        buyAction = \`if(window.buyItem) window.buyItem('\${safeItemNameJS}', \${item.price}, '\${safeCategoryJS}', '\${safeUpgradeTypeJS}')\`;
    }

    const safeImg = escapeHTML(item.img);
    let escapedDisplayName = escapeHTML(item.displayName || item.name);
    if (category === 'potions') escapedDisplayName = escapedDisplayName.replace(' Potion', '<br>Potion');
    if (category === 'stones') escapedDisplayName = escapedDisplayName.replace(' Stone', '<br>Stone');

    return \`
        <div class="market-item-card" data-price="\${item.price}" data-id="\${safeItemNameAttr}" data-category="\${safeCategoryAttr}"
            style="width: calc(16.666% - calc(var(--m-width) * 0.018 * 5 / 6)); background: #2c3e50; border: 2px solid #2ecc71; border-radius: 10px; padding: calc(var(--m-width) * 0.012); text-align: center; transition: transform 0.2s; display: flex; flex-direction: column; align-items: center; justify-content: center; box-sizing: border-box;">
            <div style="font-size: calc(var(--m-width) * 0.017); font-weight: bold; margin-bottom: calc(var(--m-width) * 0.006); height: calc(var(--m-width) * 0.038); display: flex; align-items: center; justify-content: center; text-align: center; line-height: 1.1;">\${escapedDisplayName}</div>
            <img src="\${safeImg}" style="width: calc(var(--m-width) * 0.072); height: calc(var(--m-width) * 0.072); object-fit: contain; margin-bottom: calc(var(--m-width) * 0.006);">
            \${category !== 'stones' ? \`<div style="font-size: calc(var(--m-width) * 0.014); color: #f1c40f; margin-bottom: calc(var(--m-width) * 0.006); line-height: 1.1;">\${item.attrLabel}</div>\` : ''}
            \${category !== 'upgrades' ? \`<div style="font-size: calc(var(--m-width) * 0.014); color: #bdc3c7; line-height: 1.1; margin-bottom: calc(var(--m-width) * 0.006);">Stock: \${formatMarketNumberDown(stock)}</div>\` : ''}

            \${category !== 'upgrades' ? \`
            <div style="display: flex; gap: 5px; margin-top: calc(var(--m-width) * 0.006); align-items: center; justify-content: center; width: 100%;">
                <input type="text" id="buy-qty-\${safeId}" value="1" oninput="if(window.updateBuyItemPrice) window.updateBuyItemPrice('\${safeItemNameJS}', '\${safeCategoryJS}', \${item.price})" style="width: calc(var(--m-width) * 0.06); height: calc(var(--m-width) * 0.025); padding: 0 calc(var(--m-width) * 0.006); font-size: calc(var(--m-width) * 0.015); text-align: center; border-radius: 5px; border: 1px solid #ccc; box-sizing: border-box; margin: 0; outline: none;">
                \${(category === 'pokeballs' || category === 'potions') ? \`
                <button onclick="if(window.buySetMax) window.buySetMax('\${safeItemNameJS}', '\${safeCategoryJS}', \${item.price})" style="display: flex; align-items: center; justify-content: center; padding: 0 calc(var(--m-width) * 0.006); height: calc(var(--m-width) * 0.025); font-size: calc(var(--m-width) * 0.015); font-weight: bold; border-radius: 5px; cursor: pointer; background: #95a5a6; color: white; border: none; box-sizing: border-box; margin: 0;">Max</button>
                \` : ''}
            </div>
            \` : ''}

            <button id="buy-btn-\${safeId}" onclick="\${buyAction}" class="market-final-price" style="margin-top: calc(var(--m-width) * 0.012); background: #2ecc71; color: white; border: 2px solid white; border-radius: 8px; padding: 5px 15px; font-size: calc(var(--m-width) * 0.017); font-weight: bold; cursor: pointer; width: 100%;">\${formatMarketNumber(item.price)}</button>
        </div>
    \`;
}
`;

const renderPokeMarketTabNew = `
export function renderPokeMarketTab(category) {
    const content = document.getElementById('market-buy-content');
    if (!content) return;

    // Highlight active tab
    const tabs = ['pokeballs', 'potions', 'stones', 'vitamins', 'upgrades'];
    tabs.forEach(tab => {
        const btn = document.getElementById(\`market-tab-buy-\${tab}\`);
        if (btn) {
            if (tab === category) {
                btn.style.background = 'linear-gradient(to bottom, #2ecc71, #27ae60)';
                btn.style.color = 'white';
                btn.style.border = '1px solid #2ecc71';
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

    let items = getMarketItems(category);

    if (category === 'upgrades' && items.length === 0) {
        safeSetHTML(content, \`<div style="text-align: center; font-size: calc(var(--m-width) * 0.024); color: white; width: 100%; margin-top: calc(var(--m-width) * 0.05); padding-bottom: calc(var(--m-width) * 0.05);">No available upgrade to be bought.</div>\`);
        return;
    }

    let html = \`<div style="--m-width: min(76vw, 750px); display: flex; flex-wrap: wrap; gap: calc(var(--m-width) * 0.018); justify-content: center; width: 100%;">\`;
    items.forEach(item => {
        let stock = 0;
        const targetCategory = category === 'vitamins' ? 'stones' : category;
        if (category !== 'upgrades' && state.backpack[targetCategory] && state.backpack[targetCategory][item.name]) {
            stock = state.backpack[targetCategory][item.name];
        }

        html += generateMarketItemCard(item, category, stock);
    });
    html += \`</div>\`;

    safeSetHTML(content, html);
}
`;

// Replace renderPokeMarketTab function body
let startIdx = content.indexOf('export function renderPokeMarketTab(category) {');
let endIdx = content.indexOf('export function buyItem(', startIdx);

let newContent = content.substring(0, startIdx) +
                 getMarketItemsLogic + '\n' +
                 generateMarketItemCardLogic + '\n' +
                 renderPokeMarketTabNew + '\n\n' +
                 content.substring(endIdx);

fs.writeFileSync(file, newContent);
