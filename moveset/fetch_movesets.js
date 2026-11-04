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
    const tabs = $('.sv-tabs-tab-list a');

    if (tabs.length > 0 && targetTabRegex) {
        let targetHref = null;
        tabs.each((i, el) => {
            const text = $(el).text().trim();
            if (targetTabRegex.test(text)) {
                targetHref = $(el).attr('href');
            }
        });

        if (targetHref) {
            const tabId = targetHref.replace('#', '');
            containers = $(`#${tabId}`);
        } else {
            // Found tabs, but the target game isn't there!
            // Do NOT fall back to body. Return empty because pokemon doesn't exist in this game,
            // or has no tab for it.
            return [];
        }
    } else {
        // If there are no tabs AT ALL, it means the whole page is for the given game (usually Gen 1-4)
        containers = $('body');
    }

    if (containers.length === 0) return [];

    // Check if the container text says "does not learn any level up moves"
    // or "does not exist in" to skip cleanly.
    if (containers.text().toLowerCase().includes('does not learn any level up moves') ||
        containers.text().toLowerCase().includes('does not learn any moves') ||
        containers.text().toLowerCase().includes('is not available in')) {
        return [];
    }

    // Within the container, find 'h3' that matches "learnt by level up"
    containers.first().find('h3').each((i, h3) => {
        const title = $(h3).text().trim().toLowerCase();
        if (title.includes('learnt by level up') || title.includes('learned by level up')) {
            let current = $(h3).next();
            while(current.length && current.prop('tagName') !== 'H3') {
                if (current.hasClass('sv-tabs-wrapper')) {
                    // It's a tabs wrapper for forms. Find the tab that matches pokemonName exactly.
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
                targetTabRegex = new RegExp(`^(${rule.tabs.join('|').replace(/\//g, '[/&]')})$`, 'i');
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
        await delay(500); // 500ms delay to avoid rate limiting
    }

    console.log(`Finished ${pokemon.name} - Regions found: ${Object.keys(results).join(', ')}`);
    return { name: pokemon.name, id: pokemon.id, movesets: results };
}

async function main() {
    const pokemons = await fetchPokemonList();
    console.log(`Found ${pokemons.length} unique pokemon.`);

    const allMovesets = {};
    const CONCURRENCY = 5;

    for (let i = 0; i < pokemons.length; i += CONCURRENCY) {
        const chunk = pokemons.slice(i, i + CONCURRENCY);
        const results = await Promise.all(chunk.map(p => processPokemon(p)));
        for (const res of results) {
            allMovesets[res.name] = res.movesets;
        }
    }

    const outPath = path.join(__dirname, 'movesets.json');
    fs.writeFileSync(outPath, JSON.stringify(allMovesets, null, 2));
    console.log(`Saved all movesets to ${outPath}`);
}

main().catch(console.error);
