const fs = require('fs');
let content = fs.readFileSync('src/ui/market.js', 'utf8');

// The reviewer noted that `max-width` logic actually broke the Balls tab by making it ~37% smaller.
// We just need to remove the `max-width` condition entirely, `minmax(0, 120px)` handles the scaling correctly.

let targetGrid = `let html = \`<div style="display: grid; grid-template-columns: repeat(\${cols}, minmax(0, 120px)); gap: 15px; justify-content: center; width: 100%; max-width: \${cols === 6 ? '100%' : 'calc((100% + 15px) * (4/6) - 15px)'};">\`;`;
let replacementGrid = `let html = \`<div style="display: grid; grid-template-columns: repeat(\${cols}, minmax(0, 120px)); gap: 15px; justify-content: center; width: 100%;">\`;`;

content = content.replace(targetGrid, replacementGrid);

fs.writeFileSync('src/ui/market.js', content);
