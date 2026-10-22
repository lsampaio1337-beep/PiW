const fs = require('fs');

let content = fs.readFileSync('src/windowManager.js', 'utf-8');
content = content.replace(
    "const forbiddenTags = ['script', 'iframe', 'object', 'embed', 'applet', 'base', 'meta', 'link'];",
    "const forbiddenTags = ['script', 'iframe', 'object', 'embed', 'applet', 'base', 'meta', 'link', 'img'];"
);

fs.writeFileSync('src/windowManager.js', content);
