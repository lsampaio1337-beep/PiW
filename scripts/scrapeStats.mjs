import axios from 'axios';
import * as cheerio from 'cheerio';
import fs from 'fs/promises';
import path from 'path';

const BASE_URL = 'https://pokemondb.net';
const NATIONAL_URL = `${BASE_URL}/pokedex/national`;
const DELAY_MS = 350;

const outArg = process.argv.slice(2).find((a) => a.startsWith('--out='));
const OUTPUT_FILE = path.resolve(outArg ? outArg.split('=')[1] : 'stats_scraped.json');

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

const HEADERS = {
  'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
};

const STAT_KEY_MAP = {
  HP: 'hp',
  Attack: 'atk',
  Defense: 'def',
  'Sp. Atk': 'spa',
  'Sp. Def': 'spd',
  Speed: 'spe',
};

async function fetchHtml(url, retries = 3) {
  for (let attempt = 1; attempt <= retries; attempt++) {
    try {
      const { data } = await axios.get(url, { headers: HEADERS, timeout: 15000 });
      return data;
    } catch (err) {
      if (attempt === retries) throw err;
      await sleep(1000 * attempt);
    }
  }
}

async function getPokemonList() {
  const html = await fetchHtml(NATIONAL_URL);
  const $ = cheerio.load(html);
  const seen = new Set();
  const list = [];

  $('.infocard-list .infocard a.ent-name').each((_, el) => {
    const href = $(el).attr('href');
    const name = $(el).text().trim();
    if (href && href.startsWith('/pokedex/') && !seen.has(href)) {
      seen.add(href);
      list.push({ name, href });
    }
  });

  return list;
}

function extractStatsFromContainer($, container) {
  const h2 = $(container).find('h2').filter((_, el) => $(el).text().trim().toLowerCase() === 'base stats').first();
  if (!h2.length) return null;

  const table = h2.nextAll('.resp-scroll').first().find('table.vitals-table').first();
  if (!table.length) return null;

  const stats = {};
  table.find('tbody tr').each((_, row) => {
    const label = $(row).find('th').text().trim();
    const key = STAT_KEY_MAP[label];
    if (!key) return;
    const val = parseInt($(row).find('td.cell-num').first().text().trim(), 10);
    if (!Number.isNaN(val)) stats[key] = val;
  });

  if (Object.keys(stats).length !== 6) return null;
  stats.bst = stats.hp + stats.atk + stats.def + stats.spa + stats.spd + stats.spe;
  return stats;
}

async function scrapePokemonStats(pokemon) {
  const html = await fetchHtml(`${BASE_URL}${pokemon.href}`);
  const $ = cheerio.load(html);
  const result = {};

  const basicsWrapper = $('.tabset-basics.sv-tabs-wrapper, .sv-tabs-wrapper, .tabs-wrapper').first();
  if (!basicsWrapper.length) {
    const stats = extractStatsFromContainer($, $('body'));
    if (stats) result[pokemon.name] = stats;
    return result;
  }

  const tabs = basicsWrapper.children('.sv-tabs-tab-list, .tabs-tab-list').first().find('a');
  const panels = basicsWrapper.children('.sv-tabs-panel-list, .tabs-panel-list').first().children('.sv-tabs-panel, .tabs-panel');

  if (!tabs.length) {
    const stats = extractStatsFromContainer($, $('body'));
    if (stats) result[pokemon.name] = stats;
    return result;
  }

  let baseStats = null;
  tabs.each((idx, tabEl) => {
    const label = $(tabEl).text().trim();
    if (/^(male|female)$/i.test(label)) return;

    const panel = panels.eq(idx);
    const stats = extractStatsFromContainer($, panel);
    if (!stats) return;

    if (idx === 0 || label === pokemon.name) {
      baseStats = stats;
      result[pokemon.name] = stats;
    } else {
      if (baseStats && JSON.stringify(baseStats) === JSON.stringify(stats)) {
        return;
      }
      result[label] = stats;
    }
  });

  return result;
}

async function main() {
  const args = process.argv.slice(2);
  const limitArg = args.find((a) => a.startsWith('--limit='));
  const limit = limitArg ? parseInt(limitArg.split('=')[1], 10) : Infinity;

  console.log(`Output file: ${OUTPUT_FILE}`);
  await fs.mkdir(path.dirname(OUTPUT_FILE), { recursive: true });

  let existing = {};
  try {
    const raw = await fs.readFile(OUTPUT_FILE, 'utf-8');
    existing = JSON.parse(raw);
    console.log(`Loaded ${Object.keys(existing).length} existing entries from ${OUTPUT_FILE}`);
  } catch {
    // Fresh start
  }

  console.log('Fetching National Pokédex list...');
  const pokemonList = await getPokemonList();
  console.log(`Found ${pokemonList.length} Pokémon.`);

  const toProcess = pokemonList.slice(0, limit);
  for (let i = 0; i < toProcess.length; i++) {
    const p = toProcess[i];
    if (existing[p.name]) {
      console.log(`[${i + 1}/${toProcess.length}] Skipping ${p.name} (already scraped)`);
      continue;
    }

    console.log(`[${i + 1}/${toProcess.length}] Scraping ${p.name}...`);
    try {
      const scraped = await scrapePokemonStats(p);
      Object.assign(existing, scraped);
      await fs.writeFile(OUTPUT_FILE, JSON.stringify(existing, null, 2), 'utf-8');
    } catch (err) {
      console.error(`Error scraping ${p.name}: ${err.message}`);
    }

    await sleep(DELAY_MS);
  }

  console.log(`Done! Saved stats to ${OUTPUT_FILE}`);
}

main().catch((err) => {
  console.error('Fatal error:', err);
  process.exit(1);
});
