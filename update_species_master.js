const fs = require('fs');

let content = fs.readFileSync('src/ui/dailyChallenges.js', 'utf-8');

let searchStr = `let speciesArr = Array.from(availableSpecies);
            if (speciesArr.length === 0) return 'Pidgey';
            return speciesArr[Math.floor(Math.random() * speciesArr.length)];`;

let replaceStr = `let speciesArr = Array.from(availableSpecies);
            if (speciesArr.length === 0) return 'Pidgey';
            let pid = speciesArr[Math.floor(Math.random() * speciesArr.length)];
            let pData = state.config.pokemonData.find(p => p.id === pid);
            return pData ? pData.name : pid;`;

content = content.replace(searchStr, replaceStr);
fs.writeFileSync('src/ui/dailyChallenges.js', content, 'utf-8');
console.log("Updated dailyChallenges.js");
