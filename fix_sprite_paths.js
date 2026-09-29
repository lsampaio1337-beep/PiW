const fs = require('fs');
let content = fs.readFileSync('src/ui/battle.js', 'utf8');

content = content.replace(
    /`Assets\/Pokemon Sprites\/Clean\/\$\{enemy\.qualityName === 'Shiny' \? enemy\.id \+ '_shiny' : enemy\.id\}\.png`;/,
    "`Assets/Pokemon Sprites/Clean/${enemy.qualityName === 'Shiny' ? enemy.id + '_shiny_Clean' : enemy.id + '_Clean'}.png`;"
);

content = content.replace(
    /`Assets\/Pokemon Sprites\/Clean\/\$\{leader\.qualityName === 'Shiny' \? \(leader\.transformedIntoId \|\| leader\.id\) \+ '_shiny' : \(leader\.transformedIntoId \|\| leader\.id\)\}\.png`;/g,
    "`Assets/Pokemon Sprites/Clean/${leader.qualityName === 'Shiny' ? (leader.transformedIntoId || leader.id) + '_shiny_Clean' : (leader.transformedIntoId || leader.id) + '_Clean'}.png`;"
);

fs.writeFileSync('src/ui/battle.js', content);
