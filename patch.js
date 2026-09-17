const fs = require('fs');
let content = fs.readFileSync('src/windowManager.js', 'utf8');
content = content.replace(
    /const oldScale = scalerElement.style.transform;\s*const oldWidth = winElement.style.width;/g,
    `const oldScale = scalerElement.style.transform;
        const oldWidth = winElement.style.width;
        const oldPosition = scalerElement.style.position;`
);

content = content.replace(
    /\/\/ Restore positioning\s*scalerElement.style.position = 'absolute';/g,
    `// Restore positioning
        scalerElement.style.position = oldPosition;`
);

fs.writeFileSync('src/windowManager.js', content);
