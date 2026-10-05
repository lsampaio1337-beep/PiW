const axios = require('axios');
const cheerio = require('cheerio');
const fs = require('fs-extra');

async function scrapeDetails() {
    const list = await fs.readJson('data/pokemon_transformed.json');
    console.log(`Starting detail scraping for ${list.length} Pokemon...`);
    const cache = {};
    const batchSize = 10;

    for (let i = 0; i < list.length; i += batchSize) {
        const batch = list.slice(i, i + batchSize);
        await Promise.all(batch.map(async (p) => {
            try {
                if (!cache[p.detailUrl]) {
                    const { data } = await axios.get(p.detailUrl, { headers: { 'User-Agent': 'Mozilla/5.0' } });
                    cache[p.detailUrl] = data;
                }
                const $ = cheerio.load(cache[p.detailUrl]);

                let moves = [];
                // Find tab corresponding to the extra name (or base form)
                let targetTabId = null;

                if (p.extraName && p.extraName !== 'Alolan') {
                    // Find the tab link that matches the extra name
                    $('.sv-tabs-tab-list a').each((idx, el) => {
                        const tabText = $(el).text().trim();
                        if (tabText.includes(p.extraName)) {
                            targetTabId = $(el).attr('href'); // e.g. #tab-basic-11002
                        }
                    });
                }

                if (!targetTabId) {
                    // Fall back to the first tab (usually the base form)
                    targetTabId = $('.sv-tabs-tab-list a').first().attr('href');
                }

                let container = $('body');
                let relevantContainers = [];
                if (targetTabId) {
                     // targetTabId usually looks like `#tab-basic-11002` but moves are under `#tab-moves-XXX`.
                     relevantContainers.push(targetTabId);
                     if (targetTabId.startsWith('#tab-basic-')) {
                         relevantContainers.push(targetTabId.replace('#tab-basic-', '#tab-moves-'));
                     }
                }

                // E.g. Charizard Mega X moves:
                // If there are multiple forms, their moves might be identical to the base form, or listed separately.
                // In Pokemon DB, moves are often grouped by generation (SV, SWSH). We'll look for the first valid table.

                let foundTable = false;

                // Let's try to scope it to the specific form's panel if possible.
                // But Pokemon DB usually lists moves by Game Version (SV, BDSP, SWSH) rather than by Form, UNLESS the form has a completely different movepool (like Alolan forms, which have their own detail pages or tabs).
                // If a form has a different movepool, it might be in its own tab.
                // Let's just find the `h3:contains("Moves learnt by level up")` that is visible or corresponds to the latest game.


                let searchScope = $('body');
                if (relevantContainers.length > 0) {
                    // We found specific tabs for this form
                    // Combine selectors
                    searchScope = $(relevantContainers.join(', '));
                    if (searchScope.length === 0) searchScope = $('body');
                }

                searchScope.find('h3').each((idx, el) => {
                    if (!foundTable && $(el).text().includes('Moves learnt by level up')) {
                        const table = $(el).nextAll('.resp-scroll').first().find('table');
                        if (table.length) {
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

                p.moves = moves;

                // --- EVOLUTIONS ---
                const familyNumbers = new Set();
                const evoSteps = [];

                // Evolution is shared across the family, so just parse it globally from the page
                $('.infocard-list-evo .infocard').each((j, el) => {
                    const text = $(el).find('small').first().text().trim();
                    if (text.startsWith('#')) {
                        const num = text.replace(/[^0-9]/g, '');
                        if (num) familyNumbers.add(num.padStart(4, '0'));
                    }
                });

                $('.infocard-list-evo .infocard-arrow').each((j, el) => {
                    const method = $(el).text();
                    const match = method.match(/Level\s+(\d+)/i);
                    const level = match ? match[1] : '101';

                    let fromNum = '';
                    let toNum = '';

                    const prevInfocard = $(el).prevAll('.infocard').first();
                    if (prevInfocard.length) {
                        fromNum = prevInfocard.find('small').first().text().replace(/[^0-9]/g, '');
                    } else {
                        fromNum = $(el).closest('.infocard-evo-split').prevAll('.infocard').first().find('small').first().text().replace(/[^0-9]/g, '');
                        if(!fromNum) {
                            fromNum = $(el).closest('.infocard-evo-list').prevAll('.infocard').first().find('small').first().text().replace(/[^0-9]/g, '');
                        }
                    }

                    const nextInfocard = $(el).nextAll('.infocard').first();
                    if (nextInfocard.length) {
                        toNum = nextInfocard.find('small').first().text().replace(/[^0-9]/g, '');
                    } else {
                        toNum = $(el).next().find('.infocard').first().find('small').first().text().replace(/[^0-9]/g, '');
                    }

                    if (fromNum && toNum) {
                        fromNum = fromNum.padStart(4, '0');
                        toNum = toNum.padStart(4, '0');
                        evoSteps.push({ from: fromNum, to: toNum, level: level });
                    }
                });

                p.evolutions = {
                    family: Array.from(familyNumbers),
                    steps: evoSteps
                };

            } catch (err) {
                console.error(`Error processing ${p.key}:`, err.message);
            }
        }));

        console.log(`Processed ${Math.min(i + batchSize, list.length)} / ${list.length}`);
    }

    await fs.writeJson('data/pokemon_full.json', list, { spaces: 2 });
    console.log("Detail scraping complete. Saved to data/pokemon_full.json");
}

scrapeDetails();
