const fs = require('fs');
let content = fs.readFileSync('src/ui/market.js', 'utf8');

content = content.replace(/<<<<<<< HEAD[\s\S]*?=======\n/, "");
content = content.replace(/>>>>>>> origin\/main\n/, "");

content = content.replace(/<<<<<<< HEAD[\s\S]*?=======\n/, "");
content = content.replace(/>>>>>>> origin\/main\n/, "");


fs.writeFileSync('src/ui/market.js', content, 'utf8');
