const axios = require('axios');
const cheerio = require('cheerio');
async function test() {
  const { data } = await axios.get('https://pokemondb.net/pokedex/eevee');
  const $ = cheerio.load(data);

  console.log($('.infocard-list-evo').first().html());
}
test();
