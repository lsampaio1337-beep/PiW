const axios = require('axios');
const cheerio = require('cheerio');
async function test() {
  const { data } = await axios.get('https://pokemondb.net/pokedex/charizard');
  const $ = cheerio.load(data);

  // Moves
  const moves = [];
  $('h3:contains("Moves learnt by level up")').first().nextAll('div.resp-scroll').first().find('table tbody tr').each((i, el) => {
    const $el = $(el);
    const lv = $el.find('.cell-num').first().text().trim();
    const name = $el.find('.ent-name').first().text().trim();
    const type = $el.find('.type-icon').first().text().trim();
    const catUrl = $el.find('.cell-icon img').attr('src');
    let category = '';
    if (catUrl) {
      if (catUrl.includes('physical')) category = 'Physical';
      if (catUrl.includes('special')) category = 'Special';
      if (catUrl.includes('status')) category = 'Status';
    }
    const power = $el.find('.cell-num').eq(1).text().trim();

    if (category !== 'Status') {
      moves.push({ lv: parseInt(lv) || 0, name, type, category, power: parseInt(power) || 0 });
    }
  });
  console.log("Moves:", moves.slice(0, 5));

  // Evolutions
  const evos = [];
  $('.infocard-list-evo .infocard').each((i, el) => {
    const num = $(el).find('small').first().text().trim().replace('#', '');
    evos.push(num);
  });
  console.log("Evolutions Family:", evos);

  // Evolution levels
  const evoDetails = [];
  $('.infocard-list-evo .infocard-arrow').each((i, el) => {
    const text = $(el).text().trim();
    evoDetails.push(text);
  });
  console.log("Evo Details:", evoDetails);

}
test();
