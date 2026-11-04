const fs = require('fs');

let uiJs = fs.readFileSync('src/ui.js', 'utf8');

uiJs = uiJs.replace(
    /class="upgrade-item" onclick="window\.showUpgradeDetails\('\$\{type\.key\}', '\$\{type\.configKey\}'\)" style="cursor: pointer;  style="background: #2c3e50;/g,
    'class="upgrade-item" onclick="window.showUpgradeDetails(\'${type.key}\', \'${type.configKey}\')" style="cursor: pointer; background: #2c3e50;'
);

fs.writeFileSync('src/ui.js', uiJs);
