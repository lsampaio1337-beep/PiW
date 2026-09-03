const fs = require('fs');
let content = fs.readFileSync('src/ui.js', 'utf8');

const regex = /part = part\.replace\(\/\\\[Incomplete\\\]\/g, '\[Complete\]'\)\.replace\(\/color: red\/g, 'color: green'\);/;

const newLogic = `
                  // For past challenges, ensure they look complete and numbers match max requirements
                  // The text might look like "Defeat 25 Pokémon on Route 1 (0/25)"
                  // We extract the required count and force it to say (25/25) [Complete]
                  part = part.replace(/\\((\\d+)\\/(\\d+)\\)/, (match, p1, p2) => \`(\${p2}/\${p2})\`);
                  if (!part.includes("[Complete]")) {
                       part += \` <span style="color: green;">[Complete]</span>\`;
                  }
                  part = part.replace(/color: red/g, 'color: green');
`;

content = content.replace(regex, newLogic);
fs.writeFileSync('src/ui.js', content);
