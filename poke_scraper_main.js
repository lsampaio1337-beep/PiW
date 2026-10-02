const axios = require('axios');
const cheerio = require('cheerio');
const fs = require('fs-extra');

async function scrapeMainList() {
    try {
        const url = 'https://pokemondb.net/pokedex/all';
        console.log('Fetching', url);
        const { data } = await axios.get(url, { headers: { 'User-Agent': 'Mozilla/5.0' } });
        const $ = cheerio.load(data);

        const pokemonList = [];

        $('table#pokedex tbody tr').each((i, el) => {
            const $row = $(el);
            const numStr = $row.find('.infocard-cell-data').text().trim(); // e.g. 0001
            const $nameCell = $row.find('.ent-name').first();
            const name = $nameCell.text().trim();

            const $extraNameEl = $row.find('.text-muted').first();
            let extraName = $extraNameEl.text().trim();

            // Extract types
            const types = [];
            $row.find('.type-icon').each((j, typeEl) => {
                types.push($(typeEl).text().trim());
            });

            // Extract stats
            const statsCells = $row.find('.cell-num');
            // First cell is icon/id, second is total, then hp, atk, def, spatk, spdef, spd
            // We just grab the text and filter out empty ones to be safe, but they are all td.cell-num

            // Looking at the html:
            // 0: cell-num cell-fixed (image + id)
            // 1: cell-num cell-total
            // 2: hp
            // 3: atk
            // 4: def
            // 5: spatk
            // 6: spdef
            // 7: spd

            const total = $(statsCells[1]).text().trim();
            const hp = $(statsCells[2]).text().trim();
            const attack = $(statsCells[3]).text().trim();
            const defense = $(statsCells[4]).text().trim();
            const spAtk = $(statsCells[5]).text().trim();
            const spDef = $(statsCells[6]).text().trim();
            const speed = $(statsCells[7]).text().trim();

            // Construct key format: #_$_%
            let key = `${numStr}_${name}`;
            if (extraName) {
                key += `_${extraName}`;
            }

            // Link to the detail page (e.g. /pokedex/bulbasaur)
            const detailUrl = 'https://pokemondb.net' + $nameCell.attr('href');

            pokemonList.push({
                key,
                num: numStr,
                name,
                extraName,
                types,
                stats: {
                    Total: total,
                    HP: hp,
                    Attack: attack,
                    Defense: defense,
                    SpAtk: spAtk,
                    SpDef: spDef,
                    Speed: speed
                },
                detailUrl
            });
        });

        await fs.writeJson('data/pokemon_base.json', pokemonList, { spaces: 2 });
        console.log(`Scraped ${pokemonList.length} Pokemon entries.`);

    } catch (e) {
        console.error('Error scraping main list:', e);
    }
}

scrapeMainList();
