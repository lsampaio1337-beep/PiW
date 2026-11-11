function calculateStat(baseStat, ivStat, level, quality, vitamins = 0) {
    return Math.floor((Math.floor(((2 * baseStat + ivStat + Math.floor(vitamins / 4)) * level) / 100) + 5) * quality);
}

const levels = [10, 50, 80, 100];
const speeds = {
  low: 30,
  medium: 80,
  high: 130
};
const iv = 15;
const quality = 1;

for (const [type, base] of Object.entries(speeds)) {
  const vals = levels.map(l => calculateStat(base, iv, l, quality, 0));
  console.log(`${type} speed Pokemon (${base}): ${vals.join(', ')}`);
}
