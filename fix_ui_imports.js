const fs = require('fs');
let content = fs.readFileSync('src/ui.js', 'utf8');

// Move import { getChallengeData } to the top
content = content.replace("import { getChallengeData } from './ui/topbar.js';", "");
content = "import { getChallengeData } from './ui/topbar.js';\n" + content;

fs.writeFileSync('src/ui.js', content);
