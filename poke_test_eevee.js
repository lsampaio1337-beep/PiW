const axios = require('axios');
const cheerio = require('cheerio');

async function test(url) {
    const { data } = await axios.get(url);
    const $ = cheerio.load(data);

    const familyNumbers = new Set();
    const evoSteps = [];

    // Some small tags might have other info. We strictly want #XXXX
    $('.infocard-list-evo .infocard').each((j, el) => {
        const smallTags = $(el).find('small');
        smallTags.each((i, smallEl) => {
            const text = $(smallEl).text().trim();
            const idMatch = text.match(/#(\d{4})/);
            if (idMatch) {
                familyNumbers.add(idMatch[1]);
            }
        });
    });

    $('.infocard-list-evo .infocard-arrow').each((j, el) => {
        const method = $(el).text();
        const match = method.match(/Level\s+(\d+)/i);
        const level = match ? match[1] : '101';

        let fromNum = '';
        let toNum = '';

        // The structure for split evos (like Eevee):
        // <div class="infocard-list-evo">
        //   <div class="infocard">... Eevee ...</div>
        //   <span class="infocard-evo-split">
        //     <div class="infocard-evo-list"> <span class="infocard-arrow">...</span> <div class="infocard">... Vaporeon ...</div> </div>
        //     <div class="infocard-evo-list"> <span class="infocard-arrow">...</span> <div class="infocard">... Jolteon ...</div> </div>
        // ...

        // Helper to extract ID
        const extractId = (infocard) => {
            let extracted = '';
            infocard.find('small').each((i, smallEl) => {
                const text = $(smallEl).text().trim();
                const idMatch = text.match(/#(\d{4})/);
                if (idMatch) {
                    extracted = idMatch[1];
                    return false; // Break the each loop
                }
            });
            return extracted;
        };

        // Find 'from'
        const prevInfocard = $(el).prevAll('.infocard').first();
        if (prevInfocard.length) {
            fromNum = extractId(prevInfocard);
        } else {
            // Eevee is parent of split. Go up and find the previous infocard
            fromNum = extractId($(el).closest('.infocard-evo-split').prevAll('.infocard').first());
            if(!fromNum) {
                fromNum = extractId($(el).closest('.infocard-evo-list').prevAll('.infocard').first());
            }
        }

        // Find 'to'
        const nextInfocard = $(el).nextAll('.infocard').first();
        if (nextInfocard.length) {
            toNum = extractId(nextInfocard);
        } else {
            toNum = extractId($(el).next().find('.infocard').first());
        }

        if (fromNum && toNum) {
            fromNum = fromNum.padStart(4, '0');
            toNum = toNum.padStart(4, '0');
            evoSteps.push({ from: fromNum, to: toNum, level: level });
        }
    });

    console.log("Family:", Array.from(familyNumbers));
    console.log("Evo Steps:", evoSteps);
}
test('https://pokemondb.net/pokedex/eevee');
