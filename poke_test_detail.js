const axios = require('axios');
const cheerio = require('cheerio');

async function test() {
    const { data } = await axios.get('https://pokemondb.net/pokedex/charizard');
    const $ = cheerio.load(data);

    // Check tabs
    console.log('Tabs:');
    $('.sv-tabs-tab-list a').each((i, el) => {
        console.log($(el).text(), $(el).attr('href'));
    });

    // Evolutions are usually shared or in an infocard-list-evo
    console.log('Evolutions:');
    $('.infocard-list-evo').each((i, el) => {
        // Just print some text to see
        console.log($(el).text().replace(/\s+/g, ' ').substring(0, 100));
    });
}
test();
