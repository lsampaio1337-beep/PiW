const fs = require('fs');
const path = require('path');
const puppeteer = require('puppeteer');
const cheerio = require('cheerio');

const pokemonData = require('../data/pokemon.json');
const getPokemonId = (name) => {
    const pkmn = pokemonData.find(p => p.name.toLowerCase() === name.toLowerCase());
    return pkmn ? pkmn.id : null;
};

const CATEGORIES = {
    'Alabaster Icelands': 'https://bulbapedia.bulbagarden.net/wiki/Category:Alabaster_Icelands',
    'Cobalt Coastlands': 'https://bulbapedia.bulbagarden.net/wiki/Category:Cobalt_Coastlands',
    'Coronet Highlands': 'https://bulbapedia.bulbagarden.net/wiki/Category:Coronet_Highlands',
    'Crimson Mirelands': 'https://bulbapedia.bulbagarden.net/wiki/Category:Crimson_Mirelands',
    'Obsidian Fieldlands': 'https://bulbapedia.bulbagarden.net/wiki/Category:Obsidian_Fieldlands'
};

const IGNORE_HEADERS = ["Fixed Alpha", "Mass outbreak", "Alpha Levels", "Time of Day", "Weather"];
const ENCOUNTER_TYPES = {
    "In the air": "In the air",
    "Shaking trees": "Shaking trees",
    "Shaking ore deposits": "Shaking ore deposits",
    "Water": "Water",
    "Unown Research Notes": "Unown Research Notes"
};

const delay = ms => new Promise(res => setTimeout(res, ms));

// Simple console interaction to pause execution
const readline = require('readline');
const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
});
const waitForEnter = (query) => new Promise(resolve => rl.question(query, resolve));

(async () => {
    console.log("Starting Hisui Route Fetcher...");
    const browser = await puppeteer.launch({
        headless: false,
        args: ['--no-sandbox', '--disable-setuid-sandbox']
    });
    const page = await browser.newPage();

    // Set a realistic user agent
    await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/115.0.0.0 Safari/537.36');

    const hisuiRoutes = {};

    let isFirstPage = true;

    for (const [categoryName, categoryUrl] of Object.entries(CATEGORIES)) {
        console.log(`\nFetching category: ${categoryName}`);
        await page.goto(categoryUrl, { waitUntil: 'domcontentloaded' });

        if (isFirstPage) {
            await waitForEnter("Please manually complete any Cloudflare check in the browser, then press Enter to continue...");
            isFirstPage = false;
        } else {
            await delay(1500); // Wait a bit to let the page settle
        }

        const html = await page.content();
        const $ = cheerio.load(html);

        const routeLinks = [];
        $('.mw-category-group a').each((i, el) => {
            const routeName = $(el).text().trim();
            const href = $(el).attr('href');
            if (href) {
                routeLinks.push({ name: routeName, url: 'https://bulbapedia.bulbagarden.net' + href });
            }
        });

        console.log(`Found ${routeLinks.length} routes in ${categoryName}`);

        for (const route of routeLinks) {
            console.log(`  Scraping route: ${route.name}`);
            await page.goto(route.url, { waitUntil: 'domcontentloaded' });

            // Check if we hit another challenge
            const title = await page.title();
            if (title.includes("Just a moment")) {
                await waitForEnter("Cloudflare challenge detected! Please complete it, then press Enter to continue...");
            } else {
                await delay(1500);
            }

            const routeHtml = await page.content();
            const $route = cheerio.load(routeHtml);

            // Look for Wild Pokemon section
            const wildPokemonHeader = $route('#Wild_Pokémon').parent();
            if (wildPokemonHeader.length === 0) {
                console.log(`    No Wild Pokémon section found for ${route.name}. Skipping.`);
                continue;
            }

            // We need to iterate through tables following the Wild Pokemon header
            let currentNode = wildPokemonHeader.next();
            let currentEncounterType = "Basic";

            while (currentNode.length > 0 && !currentNode.is('h2')) {
                if (currentNode.is('h3') || currentNode.is('h4')) {
                    const headerText = currentNode.text().trim();
                    let matchedType = "Basic";
                    for (const type of Object.keys(ENCOUNTER_TYPES)) {
                        if (headerText.includes(type)) {
                            matchedType = ENCOUNTER_TYPES[type];
                            break;
                        }
                    }
                    // If it contains ignored headers, we can skip processing its tables
                    let shouldIgnore = false;
                    for (const ignore of IGNORE_HEADERS) {
                        if (headerText.toLowerCase().includes(ignore.toLowerCase())) {
                            shouldIgnore = true;
                            break;
                        }
                    }
                    if (shouldIgnore) {
                        currentEncounterType = "IGNORE";
                    } else {
                        currentEncounterType = matchedType;
                    }
                } else if (currentNode.is('table') && currentEncounterType !== "IGNORE") {
                    // Extract data from the table
                    const pokes = [];
                    // Find headers to know column indexes
                    const headers = [];
                    currentNode.find('tr').first().find('th').each((i, el) => {
                        headers.push($route(el).text().trim().toLowerCase());
                    });

                    let pokemonIdx = headers.findIndex(h => h.includes('pokémon'));
                    let levelIdx = headers.findIndex(h => h.includes('level'));
                    let rateIdx = headers.findIndex(h => h.includes('rate') || h.includes('probability'));

                    if (pokemonIdx !== -1) {
                        currentNode.find('tr').each((i, el) => {
                            if (i === 0) return; // skip header row
                            const tds = $route(el).find('td');
                            if (tds.length === 0) return; // skip sub-headers

                            // Get the text from the table cell containing the Pokemon name.
                            // The image might be inside an a tag. We want the text content of the cell.
                            // Find the first <a> tag that contains text.
                            const pokeLinks = $route(tds[pokemonIdx]).find('a');
                            let rawName = "";
                            pokeLinks.each((i, link) => {
                                const text = $route(link).text().trim();
                                if (text.length > 0 && rawName === "") {
                                    rawName = text;
                                }
                            });
                            if (!rawName) {
                                rawName = $route(tds[pokemonIdx]).text().trim();
                            }

                            // Keep periods (e.g. for Mr. Mime / Mime Jr.) and typical name characters
                            const cleanName = rawName.replace(/[^a-zA-Z\s\-'\.]/g, '').trim();

                            const id = getPokemonId(cleanName);
                            if (!id) {
                                return;
                            }

                            let minLevel = 1;
                            let maxLevel = 1;
                            if (levelIdx !== -1 && tds[levelIdx]) {
                                const levelStr = $route(tds[levelIdx]).text().trim();
                                const levelMatch = levelStr.match(/(\d+)(?:\s*-\s*(\d+))?/);
                                if (levelMatch) {
                                    minLevel = parseInt(levelMatch[1]);
                                    maxLevel = levelMatch[2] ? parseInt(levelMatch[2]) : minLevel;
                                }
                            }

                            let probability = "Varies";
                            if (rateIdx !== -1 && tds[rateIdx]) {
                                const probabilityRaw = $route(tds[rateIdx]).text().trim();
                                // Try to parse percentage
                                const pctMatch = probabilityRaw.match(/([\d\.]+)\s*%/);
                                if (pctMatch) {
                                    probability = parseFloat(pctMatch[1]) / 100;
                                } else {
                                    probability = probabilityRaw; // Keep original string if not a simple %
                                }
                            }

                            pokes.push({
                                id,
                                minLevel,
                                maxLevel,
                                probability
                            });
                        });
                    }

                    if (pokes.length > 0) {
                        const routeKey = currentEncounterType === "Basic"
                            ? `${route.name} (${categoryName})`
                            : `${route.name} (${categoryName}) - ${currentEncounterType}`;

                        // We might have multiple tables for the same routeKey (e.g. sub-areas), merge them
                        if (!hisuiRoutes[routeKey]) {
                            hisuiRoutes[routeKey] = { pokes: [] };
                        }
                        hisuiRoutes[routeKey].pokes.push(...pokes);
                    }
                }

                currentNode = currentNode.next();
            }
        }
    }

    // Write to file
    const outputPath = path.join(__dirname, '..', 'config', 'hisuiRoutes.js');
    let outputContent = "export const hisuiRoutes = {\n";
    for (const [routeName, data] of Object.entries(hisuiRoutes)) {
        outputContent += `  "${routeName}": {\n    pokes: [\n`;
        for (let i = 0; i < data.pokes.length; i++) {
            const poke = data.pokes[i];
            outputContent += `      {\n`;
            outputContent += `        id: ${poke.id},\n`;
            outputContent += `        minLevel: ${poke.minLevel},\n`;
            outputContent += `        maxLevel: ${poke.maxLevel},\n`;
            if (typeof poke.probability === 'string') {
                outputContent += `        probability: "${poke.probability.replace(/"/g, '\\"')}"\n`;
            } else {
                outputContent += `        probability: ${poke.probability}\n`;
            }
            outputContent += `      }${i < data.pokes.length - 1 ? ',' : ''}\n`;
        }
        outputContent += `    ]\n  },\n`;
    }
    // Remove last comma and close object
    outputContent = outputContent.replace(/,\n$/, '\n');
    outputContent += "};\n";

    fs.writeFileSync(outputPath, outputContent, 'utf8');
    console.log("Successfully wrote to config/hisuiRoutes.js");

    rl.close();
    await browser.close();
})();
