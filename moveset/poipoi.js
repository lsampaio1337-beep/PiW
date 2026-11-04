const axios = require('axios');
const cheerio = require('cheerio');
const fs = require('fs');
const path = require('path');

const BASE_URL = 'https://pokemondb.net';

const GEN_MAP = [
    { gen: 1, tabs: ['Yellow'], outRegion: 1 },
    { gen: 2, tabs: ['Crystal'], outRegion: 2 },
    { gen: 3, tabs: ['Emerald'], outRegion: 3 },
    { gen: 4, tabs: ['Platinum'], outRegion: 4 },
    { gen: 5, tabs: ['Black 2/White 2'], outRegion: 5 },
    { gen: 6, tabs: ['X/Y'], outRegion: 6 },
    { gen: 7, tabs: ['Ultra Sun/Ultra Moon'], outRegion: 7 },
    { gen: 8, tabs: ['Sword/Shield'], outRegion: 8 },
    { gen: 8, tabs: ['Legends: Arceus'], outRegion: 9 },
    { gen: 9, tabs: ['Scarlet/Violet'], outRegion: 10 }
];

const delay = ms => new Promise(resolve => setTimeout(resolve, ms));

async function fetchPokemonList() {
    console.log('Fetching full pokemon list...');
    const res = await axios.get(`${BASE_URL}/pokedex/all`);
    const $ = cheerio.load(res.data);
    const pokemons = new Map();
    $('#pokedex tbody tr').each((i, el) => {
        const name = $(el).find('.ent-name').text().trim();
        const href = $(el).find('.ent-name').attr('href');
        const id = href.split('/').pop();
        if (!pokemons.has(name)) {
            pokemons.set(name, id);
        }
    });
    return Array.from(pokemons.entries()).map(([name, id]) => ({ name, id }));
}

function parseMoveRow($, tr) {
    const tds = $(tr).find('td');
    if (tds.length < 5) return null;

    let levelStr = $(tr).find('td:nth-child(1)').text().trim();
    let move = $(tr).find('td:nth-child(2)').text().trim();
    let type = $(tr).find('td:nth-child(3)').text().trim();

    let cat = $(tr).find('td:nth-child(4) img').attr('title')
           || $(tr).find('td:nth-child(4) span').attr('title')
           || $(tr).find('td:nth-child(4)').text().trim();

    let powerStr = $(tr).find('td:nth-child(5)').text().trim();
    let accStr = $(tr).find('td:nth-child(6)').text().trim();

    if (!cat || cat.toLowerCase() === 'status') return null;
    if (powerStr === '0' || powerStr === '—') return null;
    if (accStr === '0' || accStr === '—') return null;

    let power = parseInt(powerStr, 10);
    let acc = parseInt(accStr, 10);
    if (isNaN(power)) return null;

    return {
        level: levelStr,
        move,
        type,
        cat,
        power,
        acc
    };
}

async function fetchPokemonMovesForGen(pokemonId, gen) {
    try {
        const url = `${BASE_URL}/pokedex/${pokemonId}/moves/${gen}`;
        const res = await axios.get(url, { validateStatus: () => true });
        if (res.status !== 200) return null;
        return cheerio.load(res.data);
    } catch (err) {
        console.error(`Error fetching ${pokemonId} gen ${gen}: ${err.message}`);
        return null;
    }
}

function extractMovesFromDoc($, targetTabRegex, pokemonName) {
    const moves = [];
    let containers = [];

    // We only care about main game tabs, which are typically the very first sv-tabs-tab-list on the page
    // if there are multiple versions. We must not confuse these with form tabs.
    // Pokemon forms don't have `/` or `&` usually (except maybe Type: Null, but let's be careful).
    // The safest way is to check the first wrapper.
    const allTabLists = $('.sv-tabs-tab-list');

    let targetHref = null;
    let foundAnyGameTabs = false;

    if (allTabLists.length > 0 && targetTabRegex) {
        // Let's check all links across all tab lists just in case
        const allLinks = allTabLists.find('a');

        allLinks.each((i, el) => {
            const text = $(el).text().trim();
            if (targetTabRegex.test(text)) {
                targetHref = $(el).attr('href');
                foundAnyGameTabs = true;
            }
        });

        // If we didn't find the exact target but we did find other games like Sword/Shield and Brilliant Diamond
        // it means the pokemon is NOT in the target game for this gen.
        // We know they are game tabs if they match some game.
        // Wait, how do we know if it was a game tab that was found?
        // Let's just say if targetHref is found, we use it.
        // If targetHref is NOT found, we fallback to body ONLY if there are no tabs that look like games at all.
        // E.g. Gen 1 often has NO tabs (just body).
        // Gen 9 often has Scarlet/Violet tabs. If a pokemon is not in SV, it might have no tabs, or just body.

        if (targetHref) {
            const tabId = targetHref.replace('#', '');
            containers = $(`#${tabId}`);
        } else {
            // It might be that this pokemon doesn't have ANY game tabs (e.g. Gen 1), so we fallback to body.
            // Or it might be they DO have game tabs, but the target game isn't one of them (e.g. Larvitar in Legends Arceus), in which case we should return [].
            // To distinguish: check if there are ANY tabs that match common game names for this gen.
            const gameNamesForGen = {
                1: /red|blue|yellow/i,
                2: /gold|silver|crystal/i,
                3: /ruby|sapphire|emerald|firered|leafgreen/i,
                4: /diamond|pearl|platinum|heartgold|soulsilver/i,
                5: /black|white/i,
                6: /x\s*[\/&]\s*y|omega|alpha/i,
                7: /sun|moon|let's/i,
                8: /sword|shield|brilliant|shining|legends/i,
                9: /scarlet|violet|legends/i
            };

            // Check if any link on the page matches any game in this gen.
            let hasGameTabs = false;
            // determine generation from the targetTabRegex by looking at the rules (we can't easily, but we can just test all game names)
            const allGamesRegex = /red|blue|yellow|gold|silver|crystal|ruby|sapphire|emerald|firered|leafgreen|diamond|pearl|platinum|heartgold|soulsilver|black|white|x\s*[\/&]\s*y|omega|alpha|sun|moon|let's|sword|shield|brilliant|shining|legends|scarlet|violet/i;

            allLinks.each((i, el) => {
                if (allGamesRegex.test($(el).text().trim())) {
                    hasGameTabs = true;
                }
            });

            if (hasGameTabs) {
                // There ARE game tabs, but our target wasn't among them.
                // Ergo, the pokemon doesn't exist in our target game.
                return [];
            } else {
                // There are NO game tabs at all.
                // That means the whole page implicitly applies to the target game (usually Gen 1-4 format).
                containers = $('body');
            }
        }
    } else {
        containers = $('body');
    }

    if (containers.length === 0) return [];

    if (containers.text().toLowerCase().includes('does not learn any level up moves') ||
        containers.text().toLowerCase().includes('does not learn any moves') ||
        containers.text().toLowerCase().includes('is not available in')) {
        return [];
    }

    containers.first().find('h3').each((i, h3) => {
        const title = $(h3).text().trim().toLowerCase();
        if (title.includes('learnt by level up') || title.includes('learned by level up')) {
            let current = $(h3).next();
            while(current.length && current.prop('tagName') !== 'H3') {
                if (current.hasClass('sv-tabs-wrapper')) {
                    let targetHref = null;
                    current.find('.sv-tabs-tab-list a').each((j, a) => {
                        if ($(a).text().trim().toLowerCase() === pokemonName.toLowerCase()) {
                            targetHref = $(a).attr('href');
                        }
                    });

                    if (!targetHref) {
                        targetHref = current.find('.sv-tabs-tab-list a').first().attr('href');
                    }

                    if (targetHref) {
                        const targetDiv = current.find(targetHref);
                        targetDiv.find('table tbody tr').each((k, tr) => {
                            const moveObj = parseMoveRow($, tr);
                            if (moveObj) moves.push(moveObj);
                        });
                    }
                } else if (current.prop('tagName') === 'DIV' && current.find('table').length > 0 && !current.hasClass('sv-tabs-wrapper')) {
                    current.find('table tbody tr').each((k, tr) => {
                        const moveObj = parseMoveRow($, tr);
                        if (moveObj) moves.push(moveObj);
                    });
                } else if (current.prop('tagName') === 'TABLE') {
                    current.find('tbody tr').each((k, tr) => {
                        const moveObj = parseMoveRow($, tr);
                        if (moveObj) moves.push(moveObj);
                    });
                }
                current = current.next();
            }
        }
    });

    return moves;
}

async function processPokemon(pokemon) {
    const results = {};
    const genRequests = [1, 2, 3, 4, 5, 6, 7, 8, 9];

    for (const gen of genRequests) {
        const $ = await fetchPokemonMovesForGen(pokemon.id, gen);
        if (!$) continue;

        const rules = GEN_MAP.filter(r => r.gen === gen);
        for (const rule of rules) {
            let targetTabRegex = null;
            if (rule.tabs.length > 0) {
                // Add flexible whitespace around / or & just in case
                targetTabRegex = new RegExp(`^(${rule.tabs.join('|').replace(/\//g, '\\s*[/&]\\s*')})$`, 'i');
            }

            const moves = extractMovesFromDoc($, targetTabRegex, pokemon.name);
            if (moves && moves.length > 0) {
                const uniqueMoves = [];
                const seen = new Set();
                for (const m of moves) {
                    const key = m.level + m.move;
                    if (!seen.has(key)) {
                        seen.add(key);
                        uniqueMoves.push(m);
                    }
                }

                results[rule.outRegion] = uniqueMoves;
            }
        }
        await delay(300);
    }

    console.log(`[+] Collected data for ${pokemon.name} - Regions mapped: ${Object.keys(results).join(', ')}`);
    return { name: pokemon.name, id: pokemon.id, movesets: results };
}

async function main() {
    const pokemons = await fetchPokemonList();
    console.log(`Found ${pokemons.length} unique pokemon to process. This will take a while!`);

    let allMovesets = {};
    const outPath = path.join(__dirname, 'movesets.json');

    if (fs.existsSync(outPath)) {
        try {
            allMovesets = JSON.parse(fs.readFileSync(outPath, 'utf8'));
            console.log(`Loaded ${Object.keys(allMovesets).length} already processed pokemon from movesets.json`);
        } catch (e) {
            console.log('Failed to parse existing movesets.json, starting fresh.');
        }
    }

    let count = 0;
    for (const p of pokemons) {
        if (allMovesets[p.name]) {
            continue;
        }

        const res = await processPokemon(p);
        allMovesets[res.name] = res.movesets;
        count++;

        if (count % 5 === 0) {
            fs.writeFileSync(outPath, JSON.stringify(allMovesets, null, 2));
            console.log(`>>> Progress saved to ${outPath} (${Object.keys(allMovesets).length}/${pokemons.length})`);
        }
    }

    fs.writeFileSync(outPath, JSON.stringify(allMovesets, null, 2));
    console.log(`\n\n======================================================`);
    console.log(`FINISHED PROCESSING ALL ${pokemons.length} POKEMON!`);
    console.log(`Final data saved to ${outPath}`);
    console.log(`======================================================\n`);
}

main().catch(console.error);
