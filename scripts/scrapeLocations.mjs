import axios from 'axios';
import * as cheerio from 'cheerio';
import fs from 'fs';
import path from 'path';

const CACHE_FILE = path.join(process.cwd(), 'location_cache.json');
let cache = {};

if (fs.existsSync(CACHE_FILE)) {
    cache = JSON.parse(fs.readFileSync(CACHE_FILE, 'utf8'));
}

const saveCache = () => {
    fs.writeFileSync(CACHE_FILE, JSON.stringify(cache, null, 2));
};

const delay = ms => new Promise(res => setTimeout(res, ms));

const formatPokemonName = (name) => {
    let formatted = name.toLowerCase()
        .replace(/[^a-z0-9\s-]/g, '')
        .trim()
        .replace(/\s+/g, '-');
    if (name === 'Nidoran♀') return 'nidoran-f';
    if (name === 'Nidoran♂') return 'nidoran-m';
    if (formatted.includes('mr-mime')) return 'mr-mime';
    if (formatted.includes('mime-jr')) return 'mime-jr';
    if (formatted === 'farfetchd') return 'farfetchd';
    if (formatted === 'ho-oh') return 'ho-oh';
    if (formatted === 'porygon-z') return 'porygon-z';
    return formatted;
};

export const fetchPokemonLocations = async (pokemonName) => {
    const formattedName = formatPokemonName(pokemonName);

    if (cache[formattedName]) {
        return cache[formattedName];
    }

    // console.log(`Fetching locations for ${pokemonName}...`);
    try {
        const url = `https://pokemondb.net/pokedex/${formattedName}`;
        const response = await axios.get(url, {
            headers: { 'User-Agent': 'Mozilla/5.0' }
        });

        const $ = cheerio.load(response.data);
        const locations = [];

        const locHeaders = $(`h2:contains("Where to find ${pokemonName}")`);
        if (locHeaders.length) {
            locHeaders.next('div').find('.vitals-table').first().find('tbody tr').each((i, el) => {
                const games = $(el).find('th').text().trim();
                const locationText = $(el).find('td').text().trim();
                locations.push({ games, locationText });
            });
        }

        cache[formattedName] = locations;
        saveCache();

        await delay(300); // 300ms delay between requests
        return locations;
    } catch (e) {
        // console.error(`Failed to fetch for ${pokemonName}: ${e.message}`);
        cache[formattedName] = [];
        saveCache();
        await delay(300);
        return [];
    }
};

export const isPokemonLegacyToRoute = (locations, routeName, regionId) => {
    if (!locations || locations.length === 0) return false;

    // Filter locations by game based on regionId roughly
    let relevantGames = [];
    if (regionId === 1) relevantGames = ['Red', 'Blue', 'Yellow', 'FireRed', 'LeafGreen', "Let's Go Pikachu", "Let's Go Eevee"];
    else if (regionId === 2) relevantGames = ['Gold', 'Silver', 'Crystal', 'HeartGold', 'SoulSilver'];
    else if (regionId === 3) relevantGames = ['Ruby', 'Sapphire', 'Emerald', 'Omega Ruby', 'Alpha Sapphire'];
    else if (regionId === 4) relevantGames = ['Diamond', 'Pearl', 'Platinum', 'Brilliant Diamond', 'Shining Pearl'];
    else if (regionId === 5) relevantGames = ['Black', 'White', 'Black 2', 'White 2'];

    let isLegacy = false;
    for (const loc of locations) {
        // check if game matches
        const matchesGame = relevantGames.some(rg => loc.games.includes(rg));
        if (matchesGame || relevantGames.length === 0) { // If no specific game match possible, check all
            // Try to match route name
            // Removing numbers and checking base string, or exactly Route X
            const routeNameClean = routeName.toLowerCase().replace(/extra challenge.*/i, '');
            if (routeNameClean.length > 2 && loc.locationText.toLowerCase().includes(routeNameClean)) {
                isLegacy = true;
                break;
            }
        }
    }
    return isLegacy;
};
