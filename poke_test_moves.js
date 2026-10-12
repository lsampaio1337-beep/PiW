const axios = require('axios');
const cheerio = require('cheerio');

async function test() {
    const { data } = await axios.get('https://pokemondb.net/pokedex/bulbasaur');
    const $ = cheerio.load(data);

    // Some pages have multiple tables (e.g. for different games like SV, BDSP, SWSH). We only want the active one, or the first one if there are no tabs.
    // Actually, PokemonDB puts all generation level-up sets under different tabs if applicable.
    // The active tab for moves usually has class "active" or we just grab the very first "Moves learnt by level up" table on the page.
    let moves = [];

    // We only take the first one encountered which corresponds to the latest gen (default active tab)
    let foundTable = false;
    $('h3').each((i, el) => {
        if (!foundTable && $(el).text().includes('Moves learnt by level up')) {
            const table = $(el).nextAll('.resp-scroll').first().find('table');
            if(table.length) {
                foundTable = true;
                table.find('tbody tr').each((j, tr) => {
                    const $row = $(tr);
                    const lv = $row.find('.cell-num').first().text().trim();
                    const name = $row.find('.ent-name').first().text().trim();
                    const type = $row.find('.type-icon').first().text().trim();

                    let cat = '';
                    if ($row.find('[title="Physical"]').length) cat = 'Physical';
                    else if ($row.find('[title="Special"]').length) cat = 'Special';
                    else if ($row.find('[title="Status"]').length) cat = 'Status';

                    if (!cat) {
                        const cell = $row.find('td[data-sort-value]').filter(function() {
                            return ['physical','special','status'].includes($(this).attr('data-sort-value'));
                        });
                        if (cell.length) {
                            cat = cell.attr('data-sort-value');
                            cat = cat.charAt(0).toUpperCase() + cat.slice(1);
                        }
                    }

                    const power = $row.find('.cell-num').eq(1).text().trim();

                    if (cat.toLowerCase() === 'physical' || cat.toLowerCase() === 'special') {
                        moves.push({ Lv: lv, Name: name, Type: type, Category: cat, Power: power });
                    }
                });
            }
        }
    });

    console.log("Moves:", moves);

    // Evolutions
    const evos = [];
    $('.infocard-list-evo .infocard').each((i, el) => {
        const numStr = $(el).find('.infocard-lg-data .text-muted').first().text().trim().replace('#', '');
        evos.push({ num: numStr });
    });

    // But we also need the level to evolve *from/to*.
    // Pokemon DB puts the evolution method in `.infocard-evo-list` arrows: `<span class="infocard-arrow">... <small>(Level 16)</small></span>`
    // Let's parse the whole evolution row to get relationships
    const evoData = [];
    $('.infocard-list-evo').first().children().each((i, el) => {
        const $el = $(el);
        if ($el.hasClass('infocard')) {
            const num = $el.find('.infocard-lg-data .text-muted').first().text().trim().replace('#', '');
            evoData.push({ type: 'pokemon', num });
        } else if ($el.hasClass('infocard-arrow')) {
            const method = $el.find('small').text().trim();
            // Try to extract level
            const match = method.match(/Level\s+(\d+)/i);
            const level = match ? match[1] : '101';
            evoData.push({ type: 'method', method, level });
        }
    });

    // Simplify evo data: list of all family numbers, and levels
    // The instructions say: "Evolution will need: all family number and what level to evolve from/to"
    const familyNumbers = [];
    const evoSteps = [];

    evoData.forEach((item, i) => {
        if (item.type === 'pokemon') {
            if (!familyNumbers.includes(item.num)) {
                familyNumbers.push(item.num);
            }
        } else if (item.type === 'method') {
            // from previous to next
            const from = evoData[i-1] ? evoData[i-1].num : null;
            // The next element might be a single pokemon, or a split evolution branch
            // Pokemon DB handles split evolutions with nested spans/divs.
            // Let's see how Eevee looks
        }
    });

    console.log("EvoData:", evoData);
}
test();
