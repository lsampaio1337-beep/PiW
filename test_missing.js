const axios = require('axios');
const cheerio = require('cheerio');
async function test() {
  const { data } = await axios.get('https://pokemondb.net/sprites/scorbunny');
  const $ = cheerio.load(data);
  const imgs = [];
  $('img').each((i, el) => {
    const src = $(el).attr('src') || $(el).attr('data-src');
    if (src) imgs.push(src);
  });
  console.log("Scorbunny imgs:", imgs.slice(0, 10));
}
test();
