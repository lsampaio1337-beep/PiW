const fs = require('fs');

let content = fs.readFileSync('src/windowManager.js', 'utf8');

const originalHeaderLogic = `        const header = document.getElementById(windowId + '-header');
        if (header && title) {
            header.style.position = 'relative';
            header.innerHTML = \`\${title}<span onclick="if(window.windowManager) window.windowManager.closeDynamicWindow('\${windowId}')" style="position: absolute; right: 10px; cursor: pointer; color: white; font-weight: bold;">X</span>\`;
        }`;

const newHeaderLogic = `        const header = document.getElementById(windowId + '-header');
        if (header && title) {
            header.style.position = 'relative';
            header.innerHTML = \`\${title}<span onclick="if(window.windowManager) window.windowManager.closeDynamicWindow('\${windowId}')" style="position: absolute; top: 10px; right: 10px; cursor: pointer; color: white; font-weight: bold; font-size: 16px; padding: 5px; z-index: 10;">X</span>\`;
        }`;

content = content.replace(originalHeaderLogic, newHeaderLogic);
fs.writeFileSync('src/windowManager.js', content);
