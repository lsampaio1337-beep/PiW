const fs = require('fs');
const content = fs.readFileSync('src/ui/calendar.js', 'utf8');

const marketStyleActive = "background: linear-gradient(to bottom, #2ecc71, #27ae60); color: white; border: 1px solid #2ecc71; border-radius: 15px; padding: 5px 15px; font-weight: bold; cursor: pointer; box-shadow: 0 2px 4px rgba(0,0,0,0.2); font-size: 14px;";
const marketStyleInactive = "background: transparent; color: rgba(255, 255, 255, 0.7); border: 1px solid transparent; border-radius: 15px; padding: 5px 15px; font-weight: bold; cursor: pointer; font-size: 14px; transition: all 0.2s;' onmouseover='this.style.color=\"white\"; this.style.background=\"rgba(255,255,255,0.1)\";' onmouseout='this.style.color=\"rgba(255, 255, 255, 0.7)\"; this.style.background=\"transparent\";";
const marketStyleInactiveHoverOut = "this.style.color=\\'rgba(255, 255, 255, 0.7)\\'; this.style.background=\\'transparent\\';";
const marketStyleInactiveHoverIn = "this.style.color=\\'white\\'; this.style.background=\\'rgba(255,255,255,0.1)\\';";
const marketStyleInactiveStr = `background: transparent; color: rgba(255, 255, 255, 0.7); border: 1px solid transparent; border-radius: 15px; padding: 5px 15px; font-weight: bold; cursor: pointer; font-size: 14px; transition: all 0.2s;" onmouseover="${marketStyleInactiveHoverIn}" onmouseout="${marketStyleInactiveHoverOut}`;

const tabsCode = `
    const titleHtml = \`
        <div style="display: inline-flex; background: rgba(0, 0, 0, 0.2); border-radius: 20px; padding: 3px; gap: 5px;" onmousedown="event.stopPropagation()">
            <button onclick="window.showCalendar('activities')" style="\${tab === 'activities' ? '${marketStyleActive}' : '${marketStyleInactiveStr}'}">Activities</button>
            <button onclick="window.showCalendar('shop')" style="\${tab === 'shop' ? '${marketStyleActive}' : '${marketStyleInactiveStr}'}">Shop</button>
        </div>
    \`;

    let html = \`<div style="display: flex; flex-direction: column; width: 100%; height: 100%; box-sizing: border-box;">
        <div id="calendar-content-area" style="flex: 1; overflow-y: auto;">\`;
`;

let replaced = content.replace(
    /let html = `<div style="display: flex; flex-direction: column; width: 100%; height: 100%; box-sizing: border-box;">`;[\s\S]*?<div id="calendar-content-area" style="flex: 1; overflow-y: auto;">\s*`;/,
    tabsCode
);

const shopTokenBtn = `
    } else if (tab === 'shop') {
        html += \`
            <div style="display: flex; justify-content: center; margin-top: 10px; margin-bottom: 10px;">
                <button onclick="window.giveFreeTokens()" style="padding: 10px 20px; font-size: 16px; font-weight: bold; border-radius: 5px; cursor: pointer; background: #e67e22; color: white; border: none;">Token</button>
            </div>
        \`;
        html += window.renderTokenShopHtml ? window.renderTokenShopHtml() : '<div style="color: white; text-align: center;">Loading shop...</div>';
    }
`;

replaced = replaced.replace(
    /\} else if \(tab === 'shop'\) \{\s*html \+= window.renderTokenShopHtml \? window.renderTokenShopHtml\(\) : '<div style="color: white; text-align: center;">Loading shop...<\/div>';\s*\}/,
    shopTokenBtn
);

replaced = replaced.replace(
    /showModal\("Calendar", html, "window-calendar", "800px", "auto"\);/,
    'showModal(titleHtml, html, "window-calendar", "800px", "auto");'
);

fs.writeFileSync('src/ui/calendar.js', replaced);
