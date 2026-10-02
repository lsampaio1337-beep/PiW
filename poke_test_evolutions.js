const axios = require('axios');
const cheerio = require('cheerio');

async function test(url) {
    const { data } = await axios.get(url);
    const $ = cheerio.load(data);

    const familyNumbers = new Set();
    const evoSteps = [];

    $('.infocard-list-evo').each((i, evoList) => {
        $(evoList).find('span.infocard-evo-list > *').each((j, el) => {
             // Sometimes it's nested
        });

        // Actually let's just find all infocards
        $(evoList).find('.infocard').each((j, el) => {
            const num = $(el).find('small').first().text().replace(/[^0-9]/g, '');
            if (num) familyNumbers.add(num);
        });

        // And find all arrows
        $(evoList).find('.infocard-arrow').each((j, el) => {
            const method = $(el).text();
            const match = method.match(/Level\s+(\d+)/i);
            const level = match ? match[1] : '101';

            // To find 'from' and 'to'
            const fromNum = $(el).prevAll('.infocard').first().find('small').first().text().replace(/[^0-9]/g, '');
            // 'to' could be the next sibling infocard, or the first infocard in the next wrapper
            let toNum = $(el).nextAll('.infocard').first().find('small').first().text().replace(/[^0-9]/g, '');
            if (!toNum) {
                // look inside next element
                toNum = $(el).next().find('.infocard').first().find('small').first().text().replace(/[^0-9]/g, '');
            }
            if (!toNum) {
                 // look inside parent's next sibling
                 toNum = $(el).parent().nextAll('.infocard').first().find('small').first().text().replace(/[^0-9]/g, '');
            }

            if (fromNum && toNum) {
                evoSteps.push({ from: fromNum, to: toNum, level: level });
            }
        });
    });

    console.log("Family:", Array.from(familyNumbers));
    console.log("Evo Steps:", evoSteps);
}
test('https://pokemondb.net/pokedex/bulbasaur');
test('https://pokemondb.net/pokedex/eevee');
