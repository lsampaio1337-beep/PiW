const fs = require('fs');
let code = fs.readFileSync('src/ui/battle.js', 'utf8');

const lines = code.split('\n');

// We have 1 extra closing brace. Let's trace it carefully.
let openCount = 0;
for (let i = 0; i < lines.length; i++) {
  openCount += (lines[i].match(/\{/g) || []).length;
  openCount -= (lines[i].match(/\}/g) || []).length;

  if (openCount < 0) {
     console.log('Negative at line: ', i + 1);
     // Let's remove the closing brace that made it negative at this line.
     lines[i] = lines[i].replace('}', '');
     break;
  }
}

fs.writeFileSync('src/ui/battle.js', lines.join('\n'), 'utf8');
