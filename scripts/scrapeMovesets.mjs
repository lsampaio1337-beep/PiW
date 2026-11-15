import axios from 'axios';
import * as cheerio from 'cheerio';
import fs from 'fs/promises';
import path from 'path';

const BASE_URL = 'https://pokemondb.net';
const NATIONAL_URL = `${BASE_URL}/pokedex/national`;
const DELAY_MS = 350;

const outArg = process.argv.slice(2).find((a) => a.startsWith('--out='));
const OUTPUT_FILE = path.resolve(outArg ? outArg.split('=')[1] : 'movesets_scraped.json');

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

const HEADERS = {
  'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
};

/**
 * Fetch HTML with retry logic.
 */
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

/**
 * Parse the National Dex page to get all Pokémon slugs and names.
 */
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

/**
 * Extract level-up moves from a cheerio container holding a "Moves learnt by level up" heading.
 */
function extractLevelUpMoves($, container) {
  const moves = [];
  const heading = $(container)
    .find('h3')
    .filter((_, el) => $(el).text().trim().toLowerCase().includes('moves learnt by level up'))
    .first();

  const table = heading.length
    ? heading.nextAll('.resp-scroll').first().find('table.data-table').first()
    : $(container).find('table.data-table').first();
  if (!table.length) return moves;

  table.find('tbody tr').each((_, row) => {
    const cells = $(row).find('td');
    if (cells.length < 5) return;

    const level = $(cells[0]).text().trim();
    const move = $(cells[1]).text().trim();
    const type = $(cells[2]).text().trim();
    const cat = $(cells[3]).attr('data-sort-value') || $(cells[3]).find('img').attr('alt') || $(cells[3]).text().trim();
    const powerRaw = $(cells[4]).text().trim();

    // Only keep Physical and Special; ignore Status
    const catLower = cat.trim().toLowerCase();
    if (catLower !== 'physical' && catLower !== 'special') return;
    const catNormalized = catLower === 'physical' ? 'Physical' : 'Special';

    const power = powerRaw === '—' || powerRaw === '-' || powerRaw === '' ? 0 : parseInt(powerRaw, 10) || 0;

    moves.push({
      level,
      move,
      type,
      cat: catNormalized,
      power,
    });
  });

  return moves;
}

/**
 * Map a generation + game tab label to the target Region key, or null to skip.
 */
function mapGameToRegion(genKey, gameLabel) {
  const g = (gameLabel || '').toLowerCase();
  if (genKey === '1') return null;
  if (genKey === '2') return g.includes('crystal') ? 'Reg2' : null;
  if (genKey === '3') return g.includes('emerald') ? 'Reg3' : null;
  if (genKey === '4') return g.includes('platinum') ? 'Reg4' : null;
  if (genKey === '5') return g.includes('black 2') || g.includes('white 2') || g.includes('bw2') ? 'Reg5' : null;
  if (genKey === '6') return g.includes('x/y') || g === 'xy' ? 'Reg6' : null;
  if (genKey === '7') return g.includes('ultra sun') || g.includes('ultra moon') || g.includes('usum') ? 'Reg7' : null;
  if (genKey === '8') {
    if (g.includes('sword/shield') || g === 'ss') return 'Reg8';
    if (g.includes('legends: arceus') || g.includes('arceus')) return 'Reg9';
    return null;
  }
  if (genKey === '9') return g.includes('scarlet/violet') || g === 'sv' ? 'Reg10' : null;
  return null;
}

/**
 * Scrape a single generation's moveset page (e.g. /pokedex/bulbasaur/moves/1).
 */
async function scrapeGenPage(pokemon, genKey, genHref, result) {
  if (genKey === '1') return;
  const html = await fetchHtml(`${BASE_URL}${genHref}`);
  const $ = cheerio.load(html);

  const mainWrapper = $('.tabset-moves-game.sv-tabs-wrapper, .sv-tabs-wrapper, .tabs-wrapper').first();
  if (!mainWrapper.length) {
    return;
  }

  const tabs = mainWrapper.children('.sv-tabs-tab-list, .tabs-tab-list').first().find('a');
  const panels = mainWrapper.children('.sv-tabs-panel-list, .tabs-panel-list').first().children('.sv-tabs-panel, .tabs-panel');

  tabs.each((idx, tabEl) => {
    const label = $(tabEl).text().trim();
    const panel = panels.eq(idx);

    const subWrapper = panel.find('.sv-tabs-wrapper, .tabs-wrapper').first();
    if (subWrapper.length) {
      const subTabs = subWrapper.children('.sv-tabs-tab-list, .tabs-tab-list').first().find('a');
      const subPanels = subWrapper.children('.sv-tabs-panel-list, .tabs-panel-list').first().children('.sv-tabs-panel, .tabs-panel');

      subTabs.each((subIdx, subTabEl) => {
        const subLabel = $(subTabEl).text().trim();
        if (/^(male|female)$/i.test(subLabel)) return;

        const subPanel = subPanels.eq(subIdx);
        const isSubForm = subLabel.includes(pokemon.name) || subLabel.includes('Mega') || subLabel.includes('Form');
        const gameName = isSubForm ? label : subLabel;
        const regKey = mapGameToRegion(genKey, gameName);
        if (!regKey) return;

        const moves = extractLevelUpMoves($, subPanel);
        if (moves.length > 0) {
          const targetName = isSubForm ? subLabel : (label.includes(pokemon.name) || label.includes('Mega') ? label : pokemon.name);
          if (targetName !== pokemon.name) {
            const baseMoves = result[pokemon.name]?.[regKey];
            if (baseMoves && JSON.stringify(baseMoves) === JSON.stringify(moves)) {
              return;
            }
          }
          result[targetName] ??= {};
          result[targetName][regKey] = moves;
        }
      });
    } else {
      const regKey = mapGameToRegion(genKey, label);
      if (!regKey) return;

      const moves = extractLevelUpMoves($, panel);
      if (moves.length > 0) {
        result[pokemon.name] ??= {};
        result[pokemon.name][regKey] = moves;
      }
    }
  });
}

/**
 * Scrape all generation/game/variation movesets for a single Pokémon page.
 */
async function scrapePokemonPage(pokemon) {
  const html = await fetchHtml(`${BASE_URL}${pokemon.href}`);
  const $ = cheerio.load(html);
  const result = {};

  const movesHeading = $('#dex-moves');
  if (!movesHeading.length) return result;

  const genLinks = [];
  movesHeading.nextAll('ul.list-nav').first().find('a').each((_, el) => {
    const genText = $(el).text().trim();
    const href = $(el).attr('href');
    if (href && href.includes('/moves/')) {
      genLinks.push({ genKey: genText, href });
    }
  });

  if (genLinks.length === 0) {
    // Fallback: single-page moveset
    const moves = extractLevelUpMoves($, $('body'));
    if (moves.length > 0) {
      result[pokemon.name] = { '9': moves };
    }
    return result;
  }

  for (const { genKey, href } of genLinks) {
    await scrapeGenPage(pokemon, genKey, href, result);
    await sleep(DELAY_MS);
  }

  return result;
}

async function main() {
  const args = process.argv.slice(2);
  const limitArg = args.find((a) => a.startsWith('--limit='));
  const limit = limitArg ? parseInt(limitArg.split('=')[1], 10) : Infinity;
  const variantsOnly = args.includes('--variants-only');

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

  let pokemonList;
  if (variantsOnly) {
    console.log('Fetching Pokémon with variants from /pokedex/all...');
    const html = await fetchHtml(`${BASE_URL}/pokedex/all`);
    const $ = cheerio.load(html);
    const map = new Map();
    $('#pokedex tbody tr').each((_, tr) => {
      const a = $(tr).find('td.cell-name a.ent-name');
      const small = $(tr).find('td.cell-name small.text-muted').text().trim();
      const href = a.attr('href');
      const name = a.text().trim();
      if (small && href && !/mega/i.test(small)) {
        map.set(href, { name, href });
      }
    });
    pokemonList = Array.from(map.values());
  } else {
    console.log('Fetching National Pokédex list...');
    pokemonList = await getPokemonList();
  }
  console.log(`Found ${pokemonList.length} Pokémon.`);

  const toProcess = pokemonList.slice(0, limit);
  for (let i = 0; i < toProcess.length; i++) {
    const p = toProcess[i];
    if (!variantsOnly && existing[p.name]) {
      console.log(`[${i + 1}/${toProcess.length}] Skipping ${p.name} (already scraped)`);
      continue;
    }

    console.log(`[${i + 1}/${toProcess.length}] Scraping ${p.name}...`);
    try {
      const scraped = await scrapePokemonPage(p);
      if (variantsOnly) {
        for (const [k, v] of Object.entries(scraped)) {
          if (k !== p.name) existing[k] = v;
        }
      } else {
        Object.assign(existing, scraped);
      }
      await fs.writeFile(OUTPUT_FILE, JSON.stringify(existing, null, 2), 'utf-8');
    } catch (err) {
      console.error(`Error scraping ${p.name}: ${err.message}`);
    }

    await sleep(DELAY_MS);
  }

  console.log(`Done! Saved movesets to ${OUTPUT_FILE}`);
}

main().catch((err) => {
  console.error('Fatal error:', err);
  process.exit(1);
});
