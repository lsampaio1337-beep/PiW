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
        // ignore errors silently
    }
}

async function getSpriteUrls(p) {
    const isGen7Alolan = (p.extraName === 'Alolan' && parseInt(p.num) >= 722 && parseInt(p.num) <= 807);
    const hasExtraName = p.extraName !== '' && p.extraName !== 'Alolan';

    if (hasExtraName) {
        try {
            const { data } = await axios.get(p.detailUrl, { headers: { 'User-Agent': 'Mozilla/5.0' } });
            const $ = cheerio.load(data);

            let targetUrl = null;
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
            return { normal: null, shiny: null };
        }
    }

    let spriteSlug = p.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/-+/g, '-').replace(/^-|-$/g, '');
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

            const isGen7 = genText.includes('Generation 7');
            const isGen8 = genText.includes('Generation 8');
            const isGen9 = genText.includes('Generation 9');

            const rowText = $(tr).find('th').first().text() || $(tr).find('td').first().text() || "";

            if (p.extraName === 'Alolan' && !isGen7Alolan) {
                if (!rowText.includes('Alolan')) return;
            } else if (isGen7Alolan) {
                if (!isGen7) return;
            } else {
                if (rowText.includes('Alolan') || rowText.includes('Galarian') || rowText.includes('Hisuian') || rowText.includes('Paldean') || rowText.includes('Partner') || rowText.includes('Form')) {
                    if (rowText.includes('Alolan') || rowText.includes('Galarian') || rowText.includes('Hisuian') || rowText.includes('Paldean')) {
                        return;
                    }
                }
            }

            let normalUrl = null;
            let shinyUrl = null;

            $(tr).find('td').each((j, td) => {
                let aHref = $(td).find('a').attr('href');
                let imgSrc = $(td).find('img').attr('data-src') || $(td).find('img').attr('src');
                let spanSrc = $(td).find('span').attr('data-src');

                let url = aHref || imgSrc || spanSrc;
                if (url) {
                    url = url.replace('/avif/', '/').replace('.avif', '.png');
                    if (url.includes('/normal/') && !normalUrl) normalUrl = url;
                    if (url.includes('/shiny/') && !shinyUrl) shinyUrl = url;
                }
            });

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
                candidates.push({ normal: normalUrl, shiny: shinyUrl, isGen7, isGen8, isGen9, gen: genText });
            }
        });

        if (candidates.length === 0) return { normal: null, shiny: null };

        if (p.extraName === 'Alolan' || isGen7Alolan) {
            const g7 = candidates.find(c => c.isGen7 && c.shiny);
            if (g7) return { normal: g7.normal, shiny: g7.shiny };
            const g7_any = candidates.find(c => c.isGen7);
            if (g7_any) return { normal: g7_any.normal, shiny: g7_any.shiny };
        }

        const g9 = candidates.find(c => c.isGen9 && c.shiny);
        if (g9) return { normal: g9.normal, shiny: g9.shiny };

        const g7 = candidates.find(c => c.isGen7 && c.shiny);
        if (g7) return { normal: g7.normal, shiny: g7.shiny };

        const nonGen8 = candidates.find(c => !c.isGen8 && c.shiny);
        if (nonGen8) return { normal: nonGen8.normal, shiny: nonGen8.shiny };

        return { normal: candidates[0].normal, shiny: candidates[0].shiny };

    } catch (e) {
        return { normal: null, shiny: null };
    }
}

async function run() {
    const dir = 'Assets/Pokemon Sprites/New Natural';
    await fs.ensureDir(dir);

    const list = await fs.readJson('data/pokemon_full.json');
    console.log(`Downloading sprites for ${list.length} Pokemon...`);

    const batchSize = 10;

    for (let i = 0; i < list.length; i += batchSize) {
        const batch = list.slice(i, i + batchSize);
        await Promise.all(batch.map(async (p) => {
            const urls = await getSpriteUrls(p);

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

        if (i % 100 === 0) {
            console.log(`Sprite progress: ${Math.min(i + batchSize, list.length)} / ${list.length}`);
        }
    }

    console.log("Finished downloading sprites.");
}
run();
