const fs = require('fs');
let code = fs.readFileSync('src/ui/gift.js', 'utf8');

const regex = /const badgeNum = state\.currentRegionName === 'Johto' \? \(gift\.gymIndex > 8 \? gift\.gymIndex - 8 : gift\.gymIndex \+ 9\) : gift\.gymIndex \+ 1;\s*html \+= `[^`]*<img src="\.\/Assets\/Gym\/Badges\/\$\{window\.getBadgeFileName\(state\.currentRegionName \|\| 'Kanto', badgeNum\)\}"/g;

console.log(code.match(regex));
