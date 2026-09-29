const fs = require('fs');

const filesToGrep = [
    'src/battleSystem.js',
    'src/ui.js',
    'src/ui/market.js',
    'src/dayCare.js',
    'src/ui/pokemonStats.js'
];

const hooksToFind = [
    'defeat_level',
    'defeat_type',
    'defeat_endurance',
    'defeat_1_turn',
    'defeat_underdog',
    'defeat_single_route',
    'defeat_gym_leader',
    'catch_sum_iv',
    'catch_ball_tier',
    'catch_different_species',
    'catch_rare',
    'catch_weak',
    'catch_species',
    'catch_type',
    'catch_level',
    'sell_pokemon',
    'spend_balls',
    'spend_potions',
    'heal_center',
    'earn_money',
    'gain_levels',
    'evolve_pokemon',
    'gain_exp',
    'complete_progress_challenge',
    'sleep_minutes',
    'daycare_iv',
    'hatch_eggs',
    'safari_catch',
    'casino_catch',
    'casino_shiny'
];

let allContent = '';
for (const f of filesToGrep) {
    if (fs.existsSync(f)) {
        allContent += fs.readFileSync(f, 'utf8') + '\n';
    }
}

for (const hook of hooksToFind) {
    if (allContent.includes("'" + hook + "'") || allContent.includes('"' + hook + '"')) {
        console.log("FOUND: " + hook);
    } else {
        console.log("MISSING: " + hook);
    }
}
