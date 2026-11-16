import fs from 'fs';
import path from 'path';

const OUTPUT_DIR = 'C:\\Users\\lsamp\\OneDrive\\Desktop\\PiW\\Sprites\\Reg7 USUM';
const HEADERS = { 'User-Agent': 'Mozilla/5.0' };

async function fetchText(url) {
    const res = await fetch(url, { headers: HEADERS });
    if (!res.ok) throw new Error(`HTTP ${res.status} for ${url}`);
    return res.text();
}

async function getPokemonList() {
    const html = await fetchText('https://pokemondb.net/pokedex/national');
    const pokemonList = [];
    const cardRegex = /<small>#(\d+)<\/small>[\s\S]*?<a[^>]*class="ent-name"[^>]*href="\/pokedex\/([^"]+)"[^>]*>([^<]+)<\/a>/g;
    let match;
    while ((match = cardRegex.exec(html)) !== null) {
        pokemonList.push({
            num: match[1].trim(),
            slug: match[2].trim(),
            name: match[3].trim(),
        });
    }
    return pokemonList;
}

function isBaseLink(href, slug) {
    if (href.includes('back')) return false;
    const filename = href.split('/').pop();
    return filename === `${slug}.png`;
}

function findBestLink(links, isShiny, slug) {
    let filtered = links.filter((l) => !l.includes('back'));
    filtered = filtered.filter((l) => (isShiny ? l.includes('shiny') : l.includes('normal')));
    if (filtered.length === 0) return null;

    for (const l of filtered) {
        if (isBaseLink(l, slug)) return l;
    }

    const excludeKeywords = ['mega', 'gigantamax', 'gmax', '-f.png', '-m.png', 'female', 'male', 'primal', 'ultra'];
    for (const l of filtered) {
        if (!excludeKeywords.some((k) => l.includes(k))) return l;
    }

    return null;
}

async function getGen7Links(slug) {
    const results = {};
    let html;
    try {
        html = await fetchText(`https://pokemondb.net/sprites/${slug}`);
    } catch (err) {
        console.error(`Error fetching ${slug}: ${err.message}`);
        return results;
    }

    const rowRegex = /<tr[\s\S]*?<\/tr>/g;
    const rows = html.match(rowRegex) || [];

    for (const row of rows) {
        const gameMatch = row.match(/cell-sprite-games[^>]*>([\s\S]*?)<\/td>/);
        if (!gameMatch) continue;

        const text = gameMatch[1].replace(/<[^>]+>/g, '').replace(/\s+/g, '');
        if (!text.includes('UltraSun') && !text.includes('UltraMoon') && !text.includes('SunMoon')) {
            continue;
        }

        const links = new Set();
        const hrefRegex = /(?:href|src)="([^"]+\.png)"/g;
        let m;
        while ((m = hrefRegex.exec(row)) !== null) {
            let l = m[1];
            if (l.startsWith('//')) l = 'https:' + l;
            else if (l.startsWith('/')) l = 'https://pokemondb.net' + l;
            links.add(l);
        }

        const absoluteLinks = Array.from(links);
        if (!results.normal) results.normal = findBestLink(absoluteLinks, false, slug);
        if (!results.shiny) results.shiny = findBestLink(absoluteLinks, true, slug);
    }

    return results;
}

async function downloadImage(url, filepath) {
    if (fs.existsSync(filepath)) return true;
    try {
        const res = await fetch(url, { headers: HEADERS });
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const buffer = Buffer.from(await res.arrayBuffer());
        fs.writeFileSync(filepath, buffer);
        return true;
    } catch (err) {
        console.error(`Error downloading ${url}: ${err.message}`);
        return false;
    }
}

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

async function main() {
    fs.mkdirSync(OUTPUT_DIR, { recursive: true });
    let pkmList = await getPokemonList();

    if (process.argv.includes('--test')) {
        pkmList = pkmList.filter((p) => p.slug === 'rowlet');
    }

    for (const p of pkmList) {
        const { num, name, slug } = p;
        const links = await getGen7Links(slug);

        if (!links.normal || !links.shiny) {
            console.log(`Skipped ${num} ${name} (missing normal/shiny pair or male/female only)`);
            await sleep(300);
            continue;
        }

        for (const t of ['normal', 'shiny']) {
            const url = links[t];
            if (url) {
                const suffix = t === 'shiny' ? '_shiny' : '';
                const filename = `Gen7_${num}_${name}${suffix}.png`;
                const filepath = path.join(OUTPUT_DIR, filename);
                if (await downloadImage(url, filepath)) {
                    console.log(`Downloaded ${filename}`);
                }
            }
        }

        await sleep(300);
    }

    console.log('Done!');
}

main().catch((err) => {
    console.error(err);
    process.exit(1);
});
