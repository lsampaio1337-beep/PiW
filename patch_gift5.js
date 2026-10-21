const fs = require('fs');
let content = fs.readFileSync('src/ui/gift.js', 'utf8');

// The file currently has `a.gymIndex - 16`
content = content.replace(/a\.gymIndex - 16/g, "a.gymIndex - 17");
content = content.replace(/b\.gymIndex - 16/g, "b.gymIndex - 17");
content = content.replace(/a\.gift\.gymIndex - 16/g, "a.gift.gymIndex - 17");
content = content.replace(/b\.gift\.gymIndex - 16/g, "b.gift.gymIndex - 17");

fs.writeFileSync('src/ui/gift.js', content, 'utf8');
