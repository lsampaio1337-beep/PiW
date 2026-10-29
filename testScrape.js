const axios = require('axios');
const cheerio = require('cheerio');
axios.get('https://pokemondb.net/pokedex/pidgey').then(res => {
    const $ = cheerio.load(res.data);
    let locations = [];
    $('h2:contains("Where to find")').nextAll('.resp-scroll').first().find('table tbody tr').each((i, el) => {
        const text = $(el).find('td').text();
        locations.push(text.trim());
    });
    console.log(locations.join(' | '));
});
