const axios = require('axios');
const cheerio = require('cheerio');
async function test() {
    const { data } = await axios.get('https://pokemondb.net/sprites/bulbasaur');
    const $ = cheerio.load(data);

    // Just find the links inside td directly
    $('table tbody tr').each((i, tr) => {
        let links = [];
        $(tr).find('td').each((j, td) => {
            let href = $(td).find('a').attr('href');
            if (href) links.push(href);
        });
        if(links.length > 0) {
           console.log($(tr).closest('table').prevAll('h2').first().text(), links);
        }
    });
}
test();
