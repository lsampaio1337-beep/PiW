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

async function run() {
  const browser = await chromium.launch();
  const page = await browser.newPage();

  if (!fs.existsSync('sprites')) fs.mkdirSync('sprites');

  console.log("Fetching list of all forms...");
  await page.goto('https://pokemondb.net/pokedex/all');
  const html = await page.content();
  const $ = cheerio.load(html);

  const targets = [];

  $('#pokedex tbody tr').each((i, row) => {
     const numStr = $(row).find('.infocard-cell-data').text().trim();
     if(!numStr) return;

     const name = $(row).find('.ent-name').text().trim();
     const extraName = $(row).find('.text-muted').text().trim();
     const base = $(row).find('.ent-name').attr('href').split('/').pop();

     if (extraName && !extraName.includes('Male') && !extraName.includes('Female')) {
        targets.push({ num: numStr, name, extraName, base });
     }
  });

  console.log(`Found ${targets.length} target forms. Starting scraping...`);

  const outputData = {};

  for (let i = 0; i < targets.length; i++) {
    const target = targets[i];
    console.log(`[${i+1}/${targets.length}] Processing ${target.name} - ${target.extraName}...`);
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
      const targetHtml = await page.content();
      const $c = cheerio.load(targetHtml);

      let tabId = '';
      $c('.sv-tabs-tab-list').first().find('a').each((j, el) => {
        if ($c(el).text().trim() === target.extraName) tabId = $c(el).attr('href');
      });
      if (!tabId) tabId = $c('.sv-tabs-tab-list').first().find('a').first().attr('href');

      if (tabId) {
        const tabContent = $c(tabId);

        const vitalsTable = tabContent.find('th:contains("HP")').closest('table');
        if (vitalsTable.length > 0) {
          vitalsTable.find('tbody tr').each((j, row) => {
            const rawStatName = $c(row).find('th').text().trim();
            const statValue = $c(row).find('td').first().text().trim();
            if (rawStatName && statMap[rawStatName]) {
              outputData[idKey].baseStats[statMap[rawStatName]] = statValue;
            }
          });
          const totalValue = vitalsTable.find('tfoot td b, tfoot td').first().text().trim();
          outputData[idKey].baseStats['Total'] = totalValue;
        }

        const typesTable = tabContent.find('th:contains("Type")').closest('table');
        typesTable.find('th:contains("Type")').next('td').find('a').each((j, a) => {
          outputData[idKey].types.push($c(a).text().trim());
        });
      }

      let moveTabId = '';
      $c('.sv-tabs-tab-list').last().find('a').each((j, el) => {
        const text = $c(el).text().trim();
        if (text === target.extraName) moveTabId = $c(el).attr('href');
        if (target.extraName.includes('Alolan') && text.includes('Sun')) moveTabId = $c(el).attr('href');
        if (target.extraName.includes('Galarian') && text.includes('Sword')) moveTabId = $c(el).attr('href');
        if (target.extraName.includes('Hisuian') && text.includes('Legends')) moveTabId = $c(el).attr('href');
      });

      if (!moveTabId) moveTabId = $c('.sv-tabs-tab-list a[href^="#tab-moves"]').first().attr('href');

      if (moveTabId) {
        const moveContent = $c(moveTabId);
        const levelUpTable = moveContent.find('h3:contains("Moves learnt by level up")').nextAll('div.resp-scroll').first().find('table');

        levelUpTable.find('tbody tr').each((j, row) => {
          const level = $c(row).find('td').eq(0).text().trim();
          const moveName = $c(row).find('td').eq(1).text().trim();
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

      $s('h2').each((j, h2) => {
        const genText = $s(h2).text();
        if (genText.includes('Generation')) {
          let genNum = parseInt(genText.replace('Generation', '').trim(), 10);
          if (![5, 6, 7, 8].includes(genNum)) return;

          const table = $s(h2).nextAll('div.resp-scroll').first().find('table');

          table.find('tbody tr').each((rIdx, row) => {
             const firstCellText = $s(row).find('td:first-child').text().toLowerCase().replace(/\s+/g, ' ').trim();
             let isTargetRow = false;

             if (genNum === 5 && firstCellText.includes('black 2 white 2')) isTargetRow = true;
             else if (genNum === 6 && firstCellText.includes('omega ruby alpha sapphire')) isTargetRow = true;
             else if (genNum === 7 && firstCellText.includes('ultra sun ultra moon')) isTargetRow = true;
             // Some Gen 7 might fall back to 'sun moon' if ultra sun doesn't explicitly exist
             else if (genNum === 7 && firstCellText.includes('sun moon')) isTargetRow = true;
             else if (genNum === 8 && firstCellText.includes('home')) isTargetRow = true;

             if (isTargetRow) {
                $s(row).find('td').slice(1).each((cIdx, cell) => {
                   $s(cell).find('span.sprites-table-card').each(async (k, card) => {
                      const img = $s(card).find('img');
                      const src = img.attr('src') || img.attr('data-src');
                      const form = $s(card).find('small').text().trim() || 'Normal';

                      if (src && (form === target.extraName || form.includes(target.extraName.replace(target.name, '').trim()))) {
                        const filename = `Gen${genNum}_${target.num}_${target.name}_${target.extraName}.png`;
                        const filepath = path.join('sprites', filename);
                        // We strictly want static .png images as requested, although gen 5 B2W2 are mostly animated gifs on DB,
                        // The user said: "For png. Font: https://pokemondb.net/sprites" and "name the .png"
                        if (!fs.existsSync(filepath) && src.startsWith('http')) {
                          try {
                            await downloadImage(src, filepath);
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

  fs.writeFileSync('pokemon_data.json', JSON.stringify(outputData, null, 2));
  console.log('Saved pokemon_data.json. Done!');
  await browser.close();
}

run();
