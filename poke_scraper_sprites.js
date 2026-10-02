const axios = require('axios');
const cheerio = require('cheerio');
const fs = require('fs-extra');
const path = require('path');

async function downloadImage(url, filepath) {
    if (!url) return;
    if (await fs.pathExists(filepath)) return; // skip if already downloaded
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

async function getSpriteUrls(p) {
    const isGen7Alolan = (p.extraName === 'Alolan' && parseInt(p.num) >= 722 && parseInt(p.num) <= 807);
    const hasExtraName = p.extraName !== '' && p.extraName !== 'Alolan';

    // Instructions: "If pokemon have an extra name (except for Alolan) make sure to change tabs to get the correct data get and get the image from sprite above 'Additional artwork' link. (they do not have shiny)"
    if (hasExtraName) {
        try {
            const { data } = await axios.get(p.detailUrl, { headers: { 'User-Agent': 'Mozilla/5.0' } });
            const $ = cheerio.load(data);

            let targetUrl = null;
            // The image is usually right above "Additional artwork". In Pokemon DB it's typically the main active image in the tabs.
            // Since we know the extra name, we look for an image alt containing that name
            $('.sv-tabs-panel-list img').each((i, el) => {
                const alt = $(el).attr('alt') || '';
                const src = $(el).attr('src');
                if (alt.includes(p.extraName) && src && !src.includes('icon')) {
                    targetUrl = src;
                }
            });

            if (!targetUrl) {
                targetUrl = $('.sv-tabs-panel-list .active img').first().attr('src');
            }
            return { normal: targetUrl, shiny: null };
        } catch (e) {
            console.error("Failed to fetch artwork for", p.key);
            return { normal: null, shiny: null };
        }
    }

    // For base and Alolan forms (e.g. Alolan Rattata, or Gen 7 Alolan versions)
    // The sprite page is at /sprites/bulbasaur (using the base name in lowercase, handling spaces/punctuation)
    let spriteSlug = p.name.toLowerCase().replace(/[^a-z0-9]+/g, '-');
    if (p.name === 'Nidoran♀') spriteSlug = 'nidoran-f';
    if (p.name === 'Nidoran♂') spriteSlug = 'nidoran-m';
    if (p.name === "Farfetch'd") spriteSlug = 'farfetchd';
    if (p.name === "Sirfetch'd") spriteSlug = 'sirfetchd';
    if (p.name === "Mr. Mime") spriteSlug = 'mr-mime';
    if (p.name === "Mime Jr.") spriteSlug = 'mime-jr';

    let spritePageUrl = `https://pokemondb.net/sprites/${spriteSlug}`;

    try {
        const { data } = await axios.get(spritePageUrl, { headers: { 'User-Agent': 'Mozilla/5.0' } });
        const $ = cheerio.load(data);

        let candidates = [];

        $('table tbody tr').each((i, tr) => {
            const genText = $(tr).closest('table').prevAll('h2').first().text();
            if (!genText.includes('Generation')) return;

            const isGen7 = genText.includes('Generation 7');
            const isGen8 = genText.includes('Generation 8');
            const isGen9 = genText.includes('Generation 9');

            const rowText = $(tr).find('th').first().text() || $(tr).find('td').first().text() || "";

            // Filter by form
            if (p.extraName === 'Alolan' && !isGen7Alolan) {
                // E.g. Alolan Rattata, requires "Alolan" in the row
                if (!rowText.includes('Alolan')) return;
            } else if (isGen7Alolan) {
                // 722-807 Alolan, just use Gen 7 sprites. They don't have "Alolan" in the row text.
                if (!isGen7) return;
            } else {
                // Base form. Reject other regional variants.
                if (rowText.includes('Alolan') || rowText.includes('Galarian') || rowText.includes('Hisuian') || rowText.includes('Paldean')) return;
            }

            let links = [];
            $(tr).find('td').each((j, td) => {
                let href = $(td).find('a').attr('href');
                if (href && href.endsWith('.png')) links.push(href);
            });

            if (links.length >= 2) {
                // Typically first is normal, second is shiny
                // Ensure the shiny url actually contains "shiny"
                let normalUrl = links[0];
                let shinyUrl = links.find(l => l.includes('/shiny/'));
                if (normalUrl && shinyUrl) {
                    candidates.push({ normal: normalUrl, shiny: shinyUrl, isGen7, isGen8, isGen9, gen: genText });
                }
            }
        });

        if (candidates.length === 0) return { normal: null, shiny: null };

        if (p.extraName === 'Alolan' || isGen7Alolan) {
            const g7 = candidates.find(c => c.isGen7);
            if (g7) return { normal: g7.normal, shiny: g7.shiny };
        }

        // "Collect latest gen sprites available that contains both normal and shiny. Only use gen 8 sprites if no other generation sprite available."
        // We prefer Gen 9 (Scarlet/Violet) or Gen 7 or older.
        const g9 = candidates.find(c => c.isGen9);
        if (g9) return { normal: g9.normal, shiny: g9.shiny };

        const g7 = candidates.find(c => c.isGen7);
        if (g7) return { normal: g7.normal, shiny: g7.shiny };

        // Let's just find the first one that is NOT Gen 8 if possible, otherwise Gen 8.
        const nonGen8 = candidates.find(c => !c.isGen8);
        if (nonGen8) return { normal: nonGen8.normal, shiny: nonGen8.shiny };

        return { normal: candidates[0].normal, shiny: candidates[0].shiny };

    } catch (e) {
        console.error(`Failed sprites page ${spritePageUrl} for ${p.key}: ${e.message}`);
        return { normal: null, shiny: null };
    }
}

async function run() {
    const dir = 'Assets/Pokemon Sprites/New Natural';
    await fs.ensureDir(dir);

    const list = await fs.readJson('data/pokemon_full.json');
    console.log(`Downloading sprites for ${list.length} Pokemon...`);

    // Batch processing to avoid rate limits
    const batchSize = 10;

    for (let i = 0; i < list.length; i += batchSize) {
        const batch = list.slice(i, i + batchSize);
        await Promise.all(batch.map(async (p) => {
            const urls = await getSpriteUrls(p);

            // Name format: #_$_% (if extra name)
            let baseName = p.num + '_' + p.name;
            if (p.extraName) baseName += '_' + p.extraName;

            if (urls.normal) {
                const normalPath = path.join(dir, `${baseName}.png`);
                await downloadImage(urls.normal, normalPath);
            }
            if (urls.shiny) {
                const shinyPath = path.join(dir, `${baseName}_shiny.png`);
                await downloadImage(urls.shiny, shinyPath);
            }
        }));

        console.log(`Sprite progress: ${Math.min(i + batchSize, list.length)} / ${list.length}`);
    }

    console.log("Finished downloading sprites.");
}
run();
