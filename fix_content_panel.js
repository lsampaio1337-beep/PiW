const fs = require('fs');
let content = fs.readFileSync('src/windowManager.js', 'utf-8');
content = content.replace("            contentPanel.innerHTML = '';\n", "");
fs.writeFileSync('src/windowManager.js', content);
