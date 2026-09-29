const fs = require('fs');

function checkFileForHook(filename, hookStr) {
    if (!fs.existsSync(filename)) return false;
    return fs.readFileSync(filename, 'utf8').includes(hookStr);
}

const hooks = [
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

let res = {};
for (let h of hooks) {
   let check1 = checkFileForHook('src/battleSystem.js', h);
   let check2 = checkFileForHook('src/ui.js', h);
   let check3 = checkFileForHook('src/ui/market.js', h);
   let check4 = checkFileForHook('src/dayCare.js', h);
   let check5 = checkFileForHook('src/ui/pokemonStats.js', h);
   let check6 = checkFileForHook('src/ui/topbar.js', h);

   res[h] = check1 || check2 || check3 || check4 || check5 || check6;
}
console.log(res);
