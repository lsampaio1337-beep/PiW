const fs = require('fs');

let content = fs.readFileSync('src/windowManager.js', 'utf-8');

// Replace header.textContent = title;
content = content.replace(
    /header\.textContent = title;/g,
    `this._parseAndSanitizeToElement(title, header);`
);

fs.writeFileSync('src/windowManager.js', content);
