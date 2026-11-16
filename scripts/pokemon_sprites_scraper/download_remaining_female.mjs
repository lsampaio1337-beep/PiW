import fs from 'fs';
import path from 'path';

const OUTPUT_DIR = 'C:\\Users\\lsamp\\OneDrive\\Desktop\\PiW\\Sprites\\remaining';
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

function findFemaleOnlyLink(links, isShiny, slug) {
    let filtered = links.filter((l) => !l.includes('back'));
    filtered = filtered.filter((l) => (isShiny ? l.includes('shiny') : l.includes('normal')));
    if (filtered.length === 0) return null;

    // If standard sprite exists, skip
    if (filtered.some((l) => isBaseLink(l, slug))) {
        return null;
    }

    const excludeKeywords = ['mega', 'gigantamax', 'gmax', 'primal', 'ultra'];
    for (const l of filtered) {
        if (excludeKeywords.some((k) => l.includes(k))) continue;
        const filename = l.split('/').pop();
        if (filename.includes('-f.png') || filename.includes('female')) {
            return l;
        }
    }

    return null;
}

async function getLinksForPokemon(slug) {
    const results = { Gen5: {}, Gen6: {}, Gen7: {}, Gen8: {} };
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

        if (text.startsWith('Black') && text.includes('White') && !text.includes('2')) {
            if (!results.Gen5.normal) results.Gen5.normal = findFemaleOnlyLink(absoluteLinks, false, slug);
            if (!results.Gen5.shiny) results.Gen5.shiny = findFemaleOnlyLink(absoluteLinks, true, slug);
        }

        if (text.includes('OmegaRuby') && text.includes('AlphaSapphire')) {
            if (!results.Gen6.normal) results.Gen6.normal = findFemaleOnlyLink(absoluteLinks, false, slug);
            if (!results.Gen6.shiny) results.Gen6.shiny = findFemaleOnlyLink(absoluteLinks, true, slug);
        }

        if (text.includes('UltraSun') || text.includes('UltraMoon') || text.includes('SunMoon')) {
            if (!results.Gen7.normal) results.Gen7.normal = findFemaleOnlyLink(absoluteLinks, false, slug);
            if (!results.Gen7.shiny) results.Gen7.shiny = findFemaleOnlyLink(absoluteLinks, true, slug);
        }

        if (text.includes('Home')) {
            if (!results.Gen8.normal) results.Gen8.normal = findFemaleOnlyLink(absoluteLinks, false, slug);
            if (!results.Gen8.shiny) results.Gen8.shiny = findFemaleOnlyLink(absoluteLinks, true, slug);
        }
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
        pkmList = pkmList.filter((p) => ['meowstic', 'frillish', 'pikachu'].includes(p.slug));
    }

    for (const p of pkmList) {
        const { num, name, slug } = p;
        const links = await getLinksForPokemon(slug);
        let downloadedAny = false;

        for (const t of ['normal', 'shiny']) {
            for (const gen of ['Gen5', 'Gen6', 'Gen7', 'Gen8']) {
                const genNum = gen.slice(-1);
                const url = links[gen][t];
                if (url) {
                    const suffix = t === 'shiny' ? '_shiny' : '';
                    const filename = `Gen${genNum}_${num}_${name}${suffix}.png`;
                    const filepath = path.join(OUTPUT_DIR, filename);
                    if (await downloadImage(url, filepath)) {
                        console.log(`Downloaded ${filename} from ${url}`);
                        downloadedAny = true;
                    }
                }
            }
        }

        if (!downloadedAny) {
            console.log(`Skipped ${num} ${name} (has standard or no female-only sprite)`);
        }

        await sleep(300);
    }

    console.log('Done!');
}

main().catch((err) => {
    console.error(err);
    process.exit(1);
});
