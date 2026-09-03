const fs = require('fs');
let content = fs.readFileSync('src/ui/topbar.js', 'utf8');

content = content.replace(
    'let beatenE4 = state.stats.defeatedBosses && state.stats.defeatedBosses["Elite 4 Lorelei"] && state.stats.defeatedBosses["Champion Rival"];',
    'let beatenE4 = state.stats.defeatedBosses && (state.stats.defeatedBosses["Elite 4 Lorelei"] || state.stats.defeatedBosses["Lorelei"]) && state.stats.defeatedBosses["Champion Rival"];'
);

fs.writeFileSync('src/ui/topbar.js', content);
