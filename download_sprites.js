const axios = require('axios');
const cheerio = require('cheerio');
const fs = require('fs-extra');
const path = require('path');

async function downloadImage(url, filepath) {
    if (!url) return;
    if (await fs.pathExists(filepath)) return;
    try {
        const response = await axios({ url, responseType: 'stream', headers: { 'User-Agent': 'Mozilla/5.0' } });
        return new Promise((resolve, reject) => {
            const writer = fs.createWriteStream(filepath);
            response.data.pipe(writer);
            writer.on('finish', resolve);
            writer.on('error', reject);
        });
    } catch (e) {
        console.error(`Failed to download ${url}: ${e.message}`);
    }
}

async function scrapePokedex() {
    console.log('Fetching Pokédex...');
    const url = 'https://pokemondb.net/pokedex/all';
    const { data } = await axios.get(url, { headers: { 'User-Agent': 'Mozilla/5.0' } });
    const $ = cheerio.load(data);

    const pokemonList = [];
    const seenNums = new Set();

    $('table#pokedex tbody tr').each((i, el) => {
        const $row = $(el);
        const numStr = $row.find('.infocard-cell-data').text().trim(); // e.g. 0001

        if (seenNums.has(numStr)) {
            return; // Skip duplicate numbers (alternate forms)
        }
        seenNums.add(numStr);

        const $nameCell = $row.find('.ent-name').first();
        const name = $nameCell.text().trim();

        let spriteSlug = name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/-+/g, '-').replace(/^-|-$/g, '');
        if (name === 'Nidoran♀') spriteSlug = 'nidoran-f';
        if (name === 'Nidoran♂') spriteSlug = 'nidoran-m';
        if (name === "Farfetch'd") spriteSlug = 'farfetchd';
        if (name === "Sirfetch'd") spriteSlug = 'sirfetchd';
        if (name === "Mr. Mime") spriteSlug = 'mr-mime';
        if (name === "Mime Jr.") spriteSlug = 'mime-jr';
        if (name === "Flabébé") spriteSlug = 'flabebe';
        if (name === "Type: Null") spriteSlug = 'type-null';
        if (name === "Tapu Koko") spriteSlug = 'tapu-koko';
        if (name === "Tapu Lele") spriteSlug = 'tapu-lele';
        if (name === "Tapu Bulu") spriteSlug = 'tapu-bulu';
        if (name === "Tapu Fini") spriteSlug = 'tapu-fini';
        if (name === "Walking Wake") spriteSlug = 'walking-wake';
        if (name === "Iron Leaves") spriteSlug = 'iron-leaves';

        pokemonList.push({
            num: numStr,
            name: name,
            slug: spriteSlug
        });
    });

    console.log(`Found ${pokemonList.length} unique Pokémon.`);
    return pokemonList;
}

async function scrapeSprites(pokemon, targetDir) {
    const spritePageUrl = `https://pokemondb.net/sprites/${pokemon.slug}`;
    try {
        const { data } = await axios.get(spritePageUrl, { headers: { 'User-Agent': 'Mozilla/5.0' } });
        const $ = cheerio.load(data);

        const gensToTarget = {
            'Generation 5': 'Gen5',
            'Generation 6': 'Gen6',
            'Generation 7': 'Gen7',
            'Generation 9': 'Gen9'
        };

        const downloadPromises = [];

        $('h2').each((i, el) => {
            const text = $(el).text();
            for (const [genText, genCode] of Object.entries(gensToTarget)) {
                if (text.includes(genText)) {
                    const content = $(el).nextUntil('h2');
                    let normalUrl = null;
                    let shinyUrl = null;

                    content.find('img, span[data-src], a').each((j, el2) => {
                        const url = $(el2).attr('src') || $(el2).attr('data-src') || $(el2).attr('href');
                        if (url && (url.includes('.png') || url.includes('.gif') || url.includes('.avif') || url.includes('.webp') || url.includes('.jpg'))) {
                            let cleanUrl = url.replace('/avif/', '/').replace('.avif', '.png');

                            if (cleanUrl.includes('/normal/') && !normalUrl) normalUrl = cleanUrl;
                            if (cleanUrl.includes('/shiny/') && !shinyUrl) shinyUrl = cleanUrl;
                        }
                    });

                    if (!normalUrl && !shinyUrl) {
                        const links = [];
                        content.find('img, span[data-src], a').each((j, el2) => {
                            const url = $(el2).attr('src') || $(el2).attr('data-src') || $(el2).attr('href');
                            if (url && (url.includes('.png') || url.includes('.gif') || url.includes('.avif') || url.includes('.webp') || url.includes('.jpg'))) {
                                links.push(url.replace('/avif/', '/').replace('.avif', '.png'));
                            }
                        });
                        if (links.length >= 1) normalUrl = links[0];
                        if (links.length >= 2) shinyUrl = links[1];
                    }

                    if (normalUrl) {
                        const filename = `${genCode}_${pokemon.num}_${pokemon.name}.png`;
                        const filepath = path.join(targetDir, filename);
                        downloadPromises.push(downloadImage(normalUrl, filepath));
                    }
                    if (shinyUrl) {
                        const filename = `${genCode}_${pokemon.num}_${pokemon.name}_shiny.png`;
                        const filepath = path.join(targetDir, filename);
                        downloadPromises.push(downloadImage(shinyUrl, filepath));
                    }
                }
            }
        });

        await Promise.all(downloadPromises);

    } catch (e) {
        if (e.response && e.response.status === 404) {
            console.warn(`Sprite page not found for ${pokemon.name} (${spritePageUrl})`);
        } else {
            console.error(`Error processing ${pokemon.name}: ${e.message}`);
        }
    }
}

async function run() {
    const targetDir = 'Assets/Pokemon Sprites/New Natural';
    await fs.ensureDir(targetDir);

    const pokemonList = await scrapePokedex();

    const batchSize = 10;
    for (let i = 0; i < pokemonList.length; i += batchSize) {
        const batch = pokemonList.slice(i, i + batchSize);
        await Promise.all(batch.map(p => scrapeSprites(p, targetDir)));
        if (i % 50 === 0) {
            console.log(`Processed ${Math.min(i + batchSize, pokemonList.length)} / ${pokemonList.length} Pokémon...`);
        }
    }

    console.log('Finished downloading sprites.');
}

if (require.main === module) {
    run();
}
