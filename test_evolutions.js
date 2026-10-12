const axios = require('axios');
const cheerio = require('cheerio');
async function test() {
  const { data } = await axios.get('https://pokemondb.net/pokedex/charizard');
  const $ = cheerio.load(data);

  const family = [];
  $('.infocard-list-evo .infocard').each((i, el) => {
    const num = $(el).find('small').first().text().trim().replace('#', '');
    if (num && !num.includes('(')) {
      family.push(num);
    }
  });

  const edges = [];
  $('.infocard-list-evo').first().children().each((i, el) => {
    if ($(el).hasClass('infocard-arrow')) {
      const condition = $(el).text().trim();
      let level = 101;
      const levelMatch = condition.match(/Level (\d+)/i);
      if (levelMatch) {
         level = parseInt(levelMatch[1]);
      }

      const prev = $(el).prevAll('.infocard').first();
      const next = $(el).nextAll('.infocard').first();

      const fromNum = prev.find('small').first().text().trim().replace('#', '');
      const toNum = next.find('small').first().text().trim().replace('#', '');

      if (fromNum && toNum) {
        edges.push({ from: fromNum, to: toNum, level });
      }
    }
  });

  console.log("Family:", family);
  console.log("Edges:", edges);
}
test();
