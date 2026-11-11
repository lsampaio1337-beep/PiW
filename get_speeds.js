function calculateStat(baseStat, ivStat, level, quality, vitamins = 0) {
    return Math.floor((Math.floor(((2 * baseStat + ivStat + Math.floor(vitamins / 4)) * level) / 100) + 5) * quality);
}

const levels = [3, 10, 25, 50, 80, 100];
const configs = [
  { name: 'Low Speed', base: 30, iv: 50, q: 1.4 },
  { name: 'Medium Speed', base: 80, iv: 50, q: 1.4 },
  { name: 'High Speed', base: 130, iv: 50, q: 1.4 },
  { name: 'Max Speed', base: 130, iv: 100, q: 1.8 },
];

console.log("| Pokemon Type | Lvl 3 | Lvl 10 | Lvl 25 | Lvl 50 | Lvl 80 | Lvl 100 |");
console.log("|--------------|-------|--------|--------|--------|--------|---------|");
for (const conf of configs) {
  const vals = levels.map(l => calculateStat(conf.base, conf.iv, l, conf.q, 0));
  console.log(`| ${conf.name} | ${vals.join(' | ')} |`);
}
