const https = require('https');
const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const SPRITES_DIR = path.join(__dirname, 'sprites');
if (!fs.existsSync(SPRITES_DIR)) {
    fs.mkdirSync(SPRITES_DIR);
}

const args = process.argv.slice(2);
let ranges = null;

for (let i = 0; i < args.length; i++) {
    if (args[i] === '--ranges' && args[i + 1]) {
        ranges = args[i + 1].split(',').map(r => {
            const parts = r.split('-');
            if (parts.length === 2) {
                return { start: parseInt(parts[0], 10), end: parseInt(parts[1], 10) };
            }
            return { start: parseInt(r, 10), end: parseInt(r, 10) };
        });
    }
}

const fetchUrl = (url) => {
    return new Promise((resolve, reject) => {
        https.get(url, { headers: { 'User-Agent': 'Mozilla/5.0' } }, (res) => {
            if (res.statusCode >= 300 && res.statusCode < 400 && res.headers.location) {
                return resolve(fetchUrl(res.headers.location));
            }
            if (res.statusCode !== 200) {
                return reject(new Error(`Failed to fetch ${url} - Status Code: ${res.statusCode}`));
            }
            let data = '';
            res.on('data', chunk => data += chunk);
            res.on('end', () => resolve(data));
        }).on('error', reject);
    });
};

const downloadFile = (url, filepath) => {
    return new Promise((resolve) => {
        https.get(url, { headers: { 'User-Agent': 'Mozilla/5.0' } }, (res) => {
            if (res.statusCode === 200) {
                const fileStream = fs.createWriteStream(filepath);
                res.pipe(fileStream);
                fileStream.on('finish', () => {
                    fileStream.close();
                    resolve(true);
                });
            } else {
                res.resume();
                resolve(false);
            }
        }).on('error', () => {
            resolve(false);
        });
    });
};

const logProgress = (msg) => {
    console.log(msg);
};

const isIdInRange = (idStr) => {
    if (!ranges) return true;
    const id = parseInt(idStr, 10);
    return ranges.some(r => id >= r.start && id <= r.end);
};

const sleep = (ms) => new Promise(r => setTimeout(r, ms));

const parsePokemonSprites = (html, slug) => {
    const tables = html.split('<h2>Generation ');
    const results = {};

    [
        { gen: 5, targets: ['Black<br>White'] },
        { gen: 6, targets: ['Omega Ruby<br>Alpha Sapphire', 'X<br>Y'] },
        { gen: 7, targets: ['Ultra Sun<br>Ultra Moon', 'Sun<br>Moon'] },
        { gen: 8, targets: ['Home', 'Sword<br>Shield'] },
    ].forEach(({ gen, targets }) => {
        let table = tables.find(t => t.startsWith(gen.toString()));
        results[`Gen${gen}`] = { normal: null, shiny: null };

        if (table) {
            let rows = table.match(/<tr>\s*<td class="cell-sprite-games ent-name">[\s\S]*?<\/tr>/g);
            if (rows) {
                let targetRow = null;
                for (let t of targets) {
                    targetRow = rows.find(r => r.includes(t));
                    if (targetRow) break;
                }

                if (!targetRow) {
                    for (let row of rows) {
                        if (row.includes(`/${slug}.png`) || row.includes(`/${slug}.gif`)) {
                            targetRow = row;
                            break;
                        }
                    }
                }
                if (!targetRow) {
                    for (let row of rows) {
                        if (row.includes('.png')) {
                            targetRow = row;
                            break;
                        }
                    }
                }

                if (targetRow) {
                    const tds = targetRow.match(/<td[^>]*>([\s\S]*?)<\/td>/g);
                    if (tds && tds.length >= 3) {
                        const normalTd = tds[1];
                        const shinyTd = tds[2];

                        const extractUrl = (tdHtml) => {
                            const imgs = tdHtml.match(/<img[^>]*src="([^"]+)"[^>]*>/g);
                            if (imgs) {
                                for (let img of imgs) {
                                    const srcMatch = img.match(/src="([^"]+)"/);
                                    if (srcMatch) {
                                        const url = srcMatch[1];
                                        const filename = url.split('/').pop();
                                        if (filename === `${slug}.png` || filename === `${slug}.gif`) {
                                            return url;
                                        }
                                    }
                                }
                                for (let img of imgs) {
                                    const srcMatch = img.match(/src="([^"]+)"/);
                                    if (srcMatch && srcMatch[1].endsWith('.png')) {
                                        return srcMatch[1];
                                    }
                                }
                            }
                            return null;
                        };

                        results[`Gen${gen}`].normal = extractUrl(normalTd);
                        results[`Gen${gen}`].shiny = extractUrl(shinyTd);
                    }
                }
            }
        }
    });

    return results;
};

const run = async () => {
    logProgress('Fetching Pokedex list...');
    let pokedexHtml;
    try {
        pokedexHtml = await fetchUrl('https://pokemondb.net/pokedex/all');
    } catch (e) {
        logProgress('Error fetching pokedex: ' + e.message);
        return;
    }

    const matches = [...pokedexHtml.matchAll(/<span class="infocard-cell-data">(\d+)<\/span><\/td>\s*<td class="cell-name"><a class="ent-name" href="\/pokedex\/([^"]+)"[^>]*>([^<]+)<\/a>/g)];

    const uniquePokes = [];
    const seenIds = new Set();
    for (let m of matches) {
        if (!seenIds.has(m[1])) {
            seenIds.add(m[1]);
            uniquePokes.push({ id: m[1], slug: m[2], name: m[3] });
        }
    }

    const targetPokes = uniquePokes.filter(p => isIdInRange(p.id));
    logProgress(`Found ${targetPokes.length} Pokemon to process.`);

    const mdPath = path.join(__dirname, 'pokemon_sprites_log.md');
    fs.writeFileSync(mdPath, '# Pokemon Sprites Log\n\n');

    for (let poke of targetPokes) {
        logProgress(`Processing #${poke.id} ${poke.name}...`);
        let html;
        try {
            html = await fetchUrl(`https://pokemondb.net/sprites/${poke.slug}`);
            await sleep(500);
        } catch (e) {
            logProgress(`  [!] Failed to load sprites page for ${poke.name}.`);
            continue;
        }

        const sprites = parsePokemonSprites(html, poke.slug);

        let nStr = '';
        let sStr = '';

        for (const gen of [5, 6, 7, 8]) {
            const genData = sprites[`Gen${gen}`];
            let normalOk = 0;
            let shinyOk = 0;

            if (genData.normal) {
                const filename = `Gen${gen}_${poke.id}_${poke.name}.png`;
                const success = await downloadFile(genData.normal, path.join(SPRITES_DIR, filename));
                if (success) normalOk = 1;
            }

            if (genData.shiny) {
                const filename = `Gen${gen}_${poke.id}_${poke.name}_shiny.png`;
                const success = await downloadFile(genData.shiny, path.join(SPRITES_DIR, filename));
                if (success) shinyOk = 1;
            }

            nStr += normalOk;
            sStr += shinyOk;
        }

        let nLog = `${poke.id}n${nStr}`;
        if (nStr.includes('0')) {
            nLog = `Check ${nLog}`;
        }

        let sLog = `${poke.id}s${sStr}`;
        if (sStr.includes('0')) {
            sLog = `Check ${sLog}`;
        }

        fs.appendFileSync(mdPath, `${nLog}\n${sLog}\n`);
        logProgress(`  -> Normal: ${nStr}, Shiny: ${sStr}`);
    }

    logProgress('Done!');
};

run();
