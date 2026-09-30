const fs = require('fs');
let content = fs.readFileSync('src/ui/calendar.js', 'utf8');

const search = `    let titleHtml = \`
        <div style="display: inline-flex; background: rgba(0, 0, 0, 0.2); border-radius: 20px; padding: 3px; gap: 5px;">
            <button onclick="window.showCalendar('activities')" style="\${tab === 'activities' ? 'background: linear-gradient(to bottom, #3498db, #2980b9); color: white; border: 1px solid #3498db; box-shadow: 0 2px 4px rgba(0,0,0,0.2);' : 'background: transparent; color: rgba(255, 255, 255, 0.7); border: 1px solid transparent;'} border-radius: 15px; padding: 5px 15px; font-weight: bold; cursor: pointer; font-size: 14px; transition: all 0.2s;">Activities</button>
            <button onclick="window.showCalendar('shop')" style="\${tab === 'shop' ? 'background: linear-gradient(to bottom, #3498db, #2980b9); color: white; border: 1px solid #3498db; box-shadow: 0 2px 4px rgba(0,0,0,0.2);' : 'background: transparent; color: rgba(255, 255, 255, 0.7); border: 1px solid transparent;'} border-radius: 15px; padding: 5px 15px; font-weight: bold; cursor: pointer; font-size: 14px; transition: all 0.2s;">Shop</button>
            <button onclick="window.giveFreeTokens()" style="background: transparent; color: rgba(255, 255, 255, 0.7); border: 1px solid transparent; border-radius: 15px; padding: 5px 15px; font-weight: bold; cursor: pointer; font-size: 14px; transition: all 0.2s; display: flex; align-items: center; gap: 4px;">
                Token
            </button>
        </div>
    \`;`;

const replace = `    let titleHtml = \`
        <div style="display: inline-flex; background: rgba(0, 0, 0, 0.2); border-radius: 20px; padding: 3px; gap: 5px;">
            <button onclick="window.showCalendar('activities')" style="\${tab === 'activities' ? 'background: linear-gradient(to bottom, #3498db, #2980b9); color: white; border: 1px solid #3498db; box-shadow: 0 2px 4px rgba(0,0,0,0.2);' : 'background: transparent; color: rgba(255, 255, 255, 0.7); border: 1px solid transparent;'} border-radius: 15px; padding: 5px 15px; font-weight: bold; cursor: pointer; font-size: 14px; transition: all 0.2s;">Activities</button>
            <button onclick="window.showCalendar('shop')" style="\${tab === 'shop' ? 'background: linear-gradient(to bottom, #3498db, #2980b9); color: white; border: 1px solid #3498db; box-shadow: 0 2px 4px rgba(0,0,0,0.2);' : 'background: transparent; color: rgba(255, 255, 255, 0.7); border: 1px solid transparent;'} border-radius: 15px; padding: 5px 15px; font-weight: bold; cursor: pointer; font-size: 14px; transition: all 0.2s;">Shop</button>
        </div>
    \`;`;

if (content.includes(search)) {
    content = content.replace(search, replace);
    fs.writeFileSync('src/ui/calendar.js', content, 'utf8');
    console.log('Replaced titleHtml');
} else {
    console.log('Search not found in calendar.js');
}
