const fs = require('fs');
let content = fs.readFileSync('src/ui/tokenShop.js', 'utf8');

const search = `    let html = \`
        <div style="display: flex; flex-direction: column; align-items: center; padding: 20px; color: white;">
            <div style="display: flex; align-items: center; gap: 10px; margin-bottom: 20px; background: rgba(0,0,0,0.5); padding: 10px 20px; border-radius: 10px; border: 2px solid #f1c40f;">
                <img src="Assets/Extra/Token.png" style="width: 32px; height: 32px;">
                <span style="font-size: 24px; font-weight: bold; color: #f1c40f;">Tokens: \${state.trainer.tokens || 0}</span>
            </div>`;

const replace = `    let html = \`
        <div style="display: flex; flex-direction: column; align-items: center; padding: 20px; color: white;">
            <div style="display: flex; gap: 10px; margin-bottom: 20px;">
                <div style="display: flex; align-items: center; gap: 10px; background: rgba(0,0,0,0.5); padding: 10px 20px; border-radius: 10px; border: 2px solid #f1c40f;">
                    <img src="Assets/Extra/Token.png" style="width: 32px; height: 32px;">
                    <span style="font-size: 24px; font-weight: bold; color: #f1c40f;">Tokens: \${state.trainer.tokens || 0}</span>
                </div>
                <button onclick="window.giveFreeTokens()" style="background: #e67e22; color: white; border: none; border-radius: 10px; padding: 10px 20px; font-weight: bold; cursor: pointer; font-size: 16px; box-shadow: 0 4px 6px rgba(0,0,0,0.3); transition: transform 0.1s;">
                    + Token
                </button>
            </div>`;

if (content.includes(search)) {
    content = content.replace(search, replace);
    fs.writeFileSync('src/ui/tokenShop.js', content, 'utf8');
    console.log('Replaced html in tokenShop.js');
} else {
    console.log('Search not found in tokenShop.js');
}
