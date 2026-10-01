const axios = require('axios');
const cheerio = require('cheerio');
async function test() {
  const { data } = await axios.get('https://pokemondb.net/sprites/eevee');
  const $ = cheerio.load(data);

  // Find Black/White animated sprites if they exist, or regular BW, then latest, then gen 8
  const imgs = [];
  $('img').each((i, el) => {
    const src = $(el).attr('src') || $(el).attr('data-src');
    if (src) imgs.push(src);
  });

  const bwAnimated = imgs.find(src => src.includes('black-white/anim/normal'));
  const bwAnimatedShiny = imgs.find(src => src.includes('black-white/anim/shiny'));
  const bwNormal = imgs.find(src => src.includes('black-white/normal'));
  const bwShiny = imgs.find(src => src.includes('black-white/shiny'));

  console.log("BW Animated:", bwAnimated, "Shiny:", bwAnimatedShiny);
  console.log("BW Normal:", bwNormal, "Shiny:", bwShiny);
}
test();
