const axios = require('axios');
const cheerio = require('cheerio');
async function test() {
    const { data } = await axios.get('https://pokemondb.net/pokedex/all');
    const $ = cheerio.load(data);
    const row = $('table#pokedex tbody tr').first();
    console.log(row.html());
}
test();
