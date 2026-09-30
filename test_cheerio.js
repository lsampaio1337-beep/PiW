const axios = require('axios');
const cheerio = require('cheerio');
async function test() {
  const { data } = await axios.get('https://pokemondb.net/pokedex/all');
  const $ = cheerio.load(data);
  const rows = $('#pokedex tbody tr').slice(0, 5);
  rows.each((i, el) => {
    const $el = $(el);
    const num = $el.find('.infocard-cell-data').text().trim();
    const name = $el.find('.ent-name').text().trim();
    const extraName = $el.find('.text-muted').text().trim();
    const types = [];
    $el.find('.type-icon').each((_, t) => types.push($(t).text().trim()));
    const cols = $el.find('.cell-num');
    const total = $(cols[0]).text().trim();
    const hp = $(cols[1]).text().trim();
    const atk = $(cols[2]).text().trim();
    const def = $(cols[3]).text().trim();
    const spatk = $(cols[4]).text().trim();
    const spdef = $(cols[5]).text().trim();
    const spe = $(cols[6]).text().trim();

    console.log({num, name, extraName, types, total, hp, atk, def, spatk, spdef, spe});
  });
}
test();
