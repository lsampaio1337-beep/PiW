const axios = require('axios');
const cheerio = require('cheerio');
const fs = require('fs-extra');

async function testBulba() {
    const p = { name: "Bulbasaur", num: "0001", extraName: "" };

    let spriteSlug = p.name.toLowerCase().replace(/[^a-z0-9]+/g, '-');
    let spritePageUrl = `https://pokemondb.net/sprites/${spriteSlug}`;

    console.log(spritePageUrl);

    const { data } = await axios.get(spritePageUrl, { headers: { 'User-Agent': 'Mozilla/5.0' } });
    const $ = cheerio.load(data);

    let candidates = [];

    $('table tbody tr').each((i, tr) => {
        const genText = $(tr).closest('table').prevAll('h2').first().text();
        if (!genText.includes('Generation')) return;

        const rowText = $(tr).find('th').first().text() || $(tr).find('td').first().text() || "";

        if (rowText.includes('Alolan') || rowText.includes('Galarian') || rowText.includes('Hisuian') || rowText.includes('Paldean')) return;

        let links = [];
        $(tr).find('td').each((j, td) => {
            // Some images are lazy loaded using `data-src` on a span or img
            let aHref = $(td).find('a').attr('href');
            let imgSrc = $(td).find('img').attr('data-src') || $(td).find('img').attr('src');
            let spanSrc = $(td).find('span').attr('data-src');

            let url = aHref || imgSrc || spanSrc;
            if (url && (url.endsWith('.png') || url.endsWith('.gif'))) {
                links.push(url);
            }
        });

        if (links.length >= 2) {
            let normalUrl = links[0];
            let shinyUrl = links.find(l => l.includes('/shiny/'));
            if (normalUrl && shinyUrl) {
                candidates.push({ normal: normalUrl, shiny: shinyUrl, gen: genText });
            }
        } else {
             // Let's log what we found if it wasn't enough
             console.log("Not enough links in", genText, rowText, "Found:", links);
        }
    });

    console.log("Candidates:", candidates);
}

testBulba();
