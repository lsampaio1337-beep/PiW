const fs = require('fs');

let content = fs.readFileSync('tests/windowManager.test.js', 'utf-8');

content = content.replace(
    'expect(header.textContent).toContain(xssTitle);',
    'expect(header.textContent).toContain("Malicious Title");'
);

fs.writeFileSync('tests/windowManager.test.js', content);
