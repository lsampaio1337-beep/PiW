const fs = require('fs');

const path = 'src/ui.js';
let content = fs.readFileSync(path, 'utf8');

if (!content.includes("import { showSettings")) {
    const settingsPath = 'src/ui/settings.js';
    if (!content.includes(`import { showSettings }`)) {
       content = content.replace("import { showHelp } from './ui/help.js';", "import { showHelp } from './ui/help.js';\nimport { showSettings } from './ui/settings.js';\n");
       fs.writeFileSync(path, content);
    }
}
