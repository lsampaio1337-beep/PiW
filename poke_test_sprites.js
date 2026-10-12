const axios = require('axios');
const cheerio = require('cheerio');
const fs = require('fs-extra');

async function testBulba() {
    let spritePageUrl = `https://pokemondb.net/sprites/bulbasaur`;

    const { data } = await axios.get(spritePageUrl, { headers: { 'User-Agent': 'Mozilla/5.0' } });
    const $ = cheerio.load(data);

    let candidates = [];

    $('table tbody tr').each((i, tr) => {
        const genText = $(tr).closest('table').prevAll('h2').first().text();
        const rowText = $(tr).find('th').first().text() || $(tr).find('td').first().text() || "";

        let normalUrl = null;
        let shinyUrl = null;

        // Exclude regional forms for this test (pretending we only want base)
        if (rowText.includes('Alolan') || rowText.includes('Galarian') || rowText.includes('Hisuian') || rowText.includes('Paldean') || rowText.includes('Partner') || rowText.includes('Form')) {
            if (rowText.includes('Alolan') || rowText.includes('Galarian') || rowText.includes('Hisuian') || rowText.includes('Paldean')) {
                return;
            }
        }

        $(tr).find('td').each((j, td) => {
            let aHref = $(td).find('a').attr('href');
            let imgSrc = $(td).find('img').attr('data-src') || $(td).find('img').attr('src');
            let spanSrc = $(td).find('span').attr('data-src');
            let url = aHref || imgSrc || spanSrc;

            if (url) {
                // Remove avif extension and transform to basic normal/shiny urls
                url = url.replace('/avif/', '/').replace('.avif', '.png');
                if (url.includes('/normal/') && !normalUrl) normalUrl = url;
                if (url.includes('/shiny/') && !shinyUrl) shinyUrl = url;
            }
        });

        // Just look at the first two links if it didn't explicitly say normal or shiny
        if (!normalUrl && !shinyUrl) {
            let links = [];
            $(tr).find('td').each((j, td) => {
                let aHref = $(td).find('a').attr('href');
                let imgSrc = $(td).find('img').attr('data-src') || $(td).find('img').attr('src');
                let spanSrc = $(td).find('span').attr('data-src');
                let url = aHref || imgSrc || spanSrc;
                if (url) links.push(url.replace('/avif/', '/').replace('.avif', '.png'));
            });
            if (links.length >= 1) normalUrl = links[0];
            if (links.length >= 2) shinyUrl = links[1];
        }

        if (normalUrl) {
            candidates.push({ gen: genText, row: rowText, normal: normalUrl, shiny: shinyUrl });
        }
    });

    console.log("Candidates:");
    console.log(candidates);
}
testBulba();
