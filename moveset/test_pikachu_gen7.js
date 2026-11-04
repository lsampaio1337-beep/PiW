const axios = require('axios');
const cheerio = require('cheerio');

async function testExtract(pokemon, gen) {
    const url = `https://pokemondb.net/pokedex/${pokemon}/moves/${gen}`;
    const res = await axios.get(url, { validateStatus: () => true });
    const $ = cheerio.load(res.data);
    $('.sv-tabs-tab-list a').each((i, el) => {
        console.log($(el).text().trim(), $(el).attr('href'));
    });
}
testExtract('raichu', 7);
