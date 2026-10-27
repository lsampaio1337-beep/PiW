const { chromium } = require('playwright');
const cheerio = require('cheerio');
const fs = require('fs');
const https = require('https');
const path = require('path');

const delay = ms => new Promise(res => setTimeout(res, ms));

async function downloadImage(url, filepath) {
  return new Promise((resolve, reject) => {
    https.get(url, (res) => {
      if (res.statusCode !== 200) {
        reject(new Error(`Failed to download image. Status code: ${res.statusCode}`));
        return;
      }
      const stream = fs.createWriteStream(filepath);
      res.pipe(stream);
      stream.on('finish', () => {
        stream.close();
        resolve();
      });
    }).on('error', (err) => {
      fs.unlink(filepath, () => {});
      reject(err);
    });
  });
}

const statMap = {
  "HP": "HP",
  "Attack": "Attack",
  "Defense": "Def",
  "Sp. Atk": "SpAtk",
  "Sp. Def": "SpDef",
  "Speed": "Speed"
};

const testTargets = [
  { num: '0006', name: 'Charizard', extraName: 'Mega Charizard X', base: 'charizard' },
  { num: '0026', name: 'Raichu', extraName: 'Alolan Raichu', base: 'raichu' },
  { num: '0778', name: 'Mimikyu', extraName: 'Busted Form', base: 'mimikyu' }
];

async function run() {
  const browser = await chromium.launch();
  const page = await browser.newPage();
  const outputData = {};

  if (!fs.existsSync('test_sprites')) fs.mkdirSync('test_sprites');

  for (const target of testTargets) {
    console.log(`Processing ${target.name} - ${target.extraName}...`);
    const idKey = `${target.num}_${target.name}_${target.extraName}`;
    outputData[idKey] = {
      id: target.num,
      name: target.name,
      extraName: target.extraName,
      types: [],
      baseStats: {},
      learnset: [],
      evolvesFrom: target.name
    };

    // --- DATA ---
    try {
      await page.goto(`https://pokemondb.net/pokedex/${target.base}`);
      const html = await page.content();
      const $ = cheerio.load(html);

      let tabId = '';
      $('.sv-tabs-tab-list').first().find('a').each((i, el) => {
        if ($(el).text().trim() === target.extraName) {
          tabId = $(el).attr('href');
        }
      });
      if (!tabId) tabId = $('.sv-tabs-tab-list').first().find('a').first().attr('href');

      if (tabId) {
        const tabContent = $(tabId);

        const vitalsTable = tabContent.find('th:contains("HP")').closest('table');
        if (vitalsTable.length > 0) {
          vitalsTable.find('tbody tr').each((i, row) => {
            const rawStatName = $(row).find('th').text().trim();
            const statValue = $(row).find('td').first().text().trim();
            if (rawStatName && statMap[rawStatName]) {
              outputData[idKey].baseStats[statMap[rawStatName]] = statValue;
            }
          });
          const totalValue = vitalsTable.find('tfoot td b, tfoot td').first().text().trim();
          outputData[idKey].baseStats['Total'] = totalValue;
        }

        const typesTable = tabContent.find('th:contains("Type")').closest('table');
        typesTable.find('th:contains("Type")').next('td').find('a').each((i, a) => {
          outputData[idKey].types.push($(a).text().trim());
        });
      }

      let moveTabId = '';
      $('.sv-tabs-tab-list').last().find('a').each((i, el) => {
        const text = $(el).text().trim();
        if (text === target.extraName) moveTabId = $(el).attr('href');
        if (target.extraName.includes('Alolan') && text.includes('Sun')) moveTabId = $(el).attr('href');
        if (target.extraName.includes('Galarian') && text.includes('Sword')) moveTabId = $(el).attr('href');
        if (target.extraName.includes('Hisuian') && text.includes('Legends')) moveTabId = $(el).attr('href');
      });

      if (!moveTabId) moveTabId = $('.sv-tabs-tab-list a[href^="#tab-moves"]').first().attr('href');

      if (moveTabId) {
        const moveContent = $(moveTabId);
        const levelUpTable = moveContent.find('h3:contains("Moves learnt by level up")').nextAll('div.resp-scroll').first().find('table');
        levelUpTable.find('tbody tr').each((i, row) => {
          const level = $(row).find('td').eq(0).text().trim();
          const moveName = $(row).find('td').eq(1).text().trim();
          if(level && moveName) outputData[idKey].learnset.push({ level, move: moveName });
        });
      }
    } catch (e) {
      console.error(`Error scraping data for ${target.extraName}:`, e.message);
    }

    await delay(500);

    // --- SPRITES ---
    try {
      await page.goto(`https://pokemondb.net/sprites/${target.base}`);
      const htmlSprites = await page.content();
      const $s = cheerio.load(htmlSprites);

      $s('h2').each((i, h2) => {
        const genText = $s(h2).text();
        if (genText.includes('Generation')) {
          let genNum = parseInt(genText.replace('Generation', '').trim(), 10);
          if (![5, 6, 7, 8].includes(genNum)) return;

          const table = $s(h2).nextAll('div.resp-scroll').first().find('table');

          // Get headers to figure out which column represents which game
          const gameColumns = [];
          table.find('thead th').each((j, th) => {
             const text = $s(th).text().trim().toLowerCase();
             gameColumns.push({ index: j, text });
          });

          // Identify matching columns based on generation
          const targetCols = [];
          for (let k = 0; k < gameColumns.length; k++) {
             const col = gameColumns[k];
             if (genNum === 5 && col.text.includes('black 2') && col.text.includes('white 2')) targetCols.push(col.index);
             else if (genNum === 6 && col.text.includes('omega ruby') && col.text.includes('alpha sapphire')) targetCols.push(col.index);
             else if (genNum === 7 && col.text.includes('ultra sun') && col.text.includes('ultra moon')) targetCols.push(col.index);
             else if (genNum === 8 && col.text.includes('home')) targetCols.push(col.index);
          }

          // Now scrape rows
          table.find('tbody tr').each((rIdx, row) => {
             // On PokemonDB sprite tables, the *rows* are typically 'Normal' or 'Shiny' (or 'Animated').
             // The games are often the first column instead, Wait!
             // Let's re-verify the layout. It's:
             // <thead><tr><th></th><th>Normal</th><th>Shiny</th></tr></thead>
             // <tbody><tr><td>X / Y</td><td><img></td><td><img></td></tr></tbody>
             // Let's support both layouts by checking first column of body OR headers.

             const firstCellText = $s(row).find('td:first-child').text().toLowerCase().replace(/\s+/g, ' ');
             let isTargetRow = false;

             if (genNum === 5 && firstCellText.includes('black 2 white 2')) isTargetRow = true;
             else if (genNum === 6 && firstCellText.includes('omega ruby alpha sapphire')) isTargetRow = true;
             else if (genNum === 7 && firstCellText.includes('ultra sun ultra moon')) isTargetRow = true;
             else if (genNum === 8 && firstCellText.includes('home')) isTargetRow = true;

             if (isTargetRow) {
                // Look in all cells of this row
                $s(row).find('td').slice(1).each((cIdx, cell) => {
                   $s(cell).find('span.sprites-table-card').each(async (k, card) => {
                      const img = $s(card).find('img');
                      const src = img.attr('src') || img.attr('data-src');
                      const form = $s(card).find('small').text().trim() || 'Normal';

                      if (src && (form === target.extraName || form.includes(target.extraName.replace(target.name, '').trim()))) {
                        const filename = `Gen${genNum}_${target.num}_${target.name}_${target.extraName}.png`;
                        const filepath = path.join('test_sprites', filename);
                        if (!fs.existsSync(filepath) && src.startsWith('http') && src.endsWith('.png')) {
                          try {
                            await downloadImage(src, filepath);
                            console.log(`Downloaded ${filename}`);
                          } catch (e) {
                            console.error(`Failed to download ${src}`);
                          }
                        }
                      }
                   });
                });
             }
          });
        }
      });
    } catch (e) {
      console.error(`Error scraping sprites for ${target.extraName}:`, e.message);
    }

    await delay(500);
  }

  fs.writeFileSync('test_data.json', JSON.stringify(outputData, null, 2));
  console.log('Saved test_data.json');
  await browser.close();
}

run();
