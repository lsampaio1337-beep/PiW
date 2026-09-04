const fs = require('fs');
let content = fs.readFileSync('src/ui.js', 'utf8');

const conflictBlock = `<<<<<<< HEAD
    contentPanel.innerHTML = \`<h2>\${title}</h2>\${htmlContent}\`;
=======

    let titleHtml = title ? \`<h2>\${title}</h2>\` : '';
    contentPanel.innerHTML = \`\${titleHtml}\${htmlContent}\`;
>>>>>>> origin/main`;

const resolvedBlock = `    let titleHtml = title ? \`<h2>\${title}</h2>\` : '';
    contentPanel.innerHTML = \`\${titleHtml}\${htmlContent}\`;`;

content = content.replace(conflictBlock, resolvedBlock);
fs.writeFileSync('src/ui.js', content);
