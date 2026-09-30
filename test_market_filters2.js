const { _electron } = require('playwright');
const path = require('path');

(async () => {
  try {
    const app = await _electron.launch({
      args: ['.'],
      executablePath: '/app/node_modules/electron/dist/electron',
      env: { ...process.env, DISPLAY: ':99' }
    });

    const window = await app.firstWindow();

    // Setup dummy game state
    await window.evaluate(() => {
      window.state = window.state || { stats: {}, trainer: {}, storage: [], party: [] };
      window.state.stats.upgradesUnlocked = { unlocked: true };
      window.state.storage = [
        { id: 1, level: 10, quality: 1.5, ivs: { hp: 10, atk: 10, def: 10, spa: 10, spd: 10, spe: 10 }, bst: 300 }
      ];
    });

    // Open market
    await window.evaluate(() => {
      window.switchView('POKEMON_CENTER_MARKET');
      window.setupMarket(document.getElementById('view-center-market'));
      window.openPokeMarketSell();
      window.renderPokeMarketSellTab('pokemon');
    });

    // Wait for the filters to render
    await window.waitForSelector('#market-pokemon-filters');

    // Test Level Filter
    await window.evaluate(() => {
        let el = document.getElementById('market-filter-level-min');
        el.value = '1234a';
        if(window.sanitizeMarketNumberInput) window.sanitizeMarketNumberInput(el);
    });

    let levelVal = await window.evaluate(() => document.getElementById('market-filter-level-min').value);
    console.log('Level value after "1234a":', levelVal); // Expected "123"

    // Test Q Filter
    await window.evaluate(() => {
        let el = document.getElementById('market-filter-q-min');
        el.value = '145';
        if(window.sanitizeMarketQInput) window.sanitizeMarketQInput(el);
    });
    let qVal1 = await window.evaluate(() => document.getElementById('market-filter-q-min').value);
    console.log('Q value after "145":', qVal1); // Expected "1.45"

    await window.evaluate(() => {
        let el = document.getElementById('market-filter-q-min');
        el.value = '1';
        if(window.sanitizeMarketQInput) window.sanitizeMarketQInput(el);
    });
    let qVal2 = await window.evaluate(() => document.getElementById('market-filter-q-min').value);
    console.log('Q value after "1":', qVal2); // Expected "1"

    await window.evaluate(() => {
        let el = document.getElementById('market-filter-q-min');
        el.value = '14';
        if(window.sanitizeMarketQInput) window.sanitizeMarketQInput(el);
    });
    let qVal3 = await window.evaluate(() => document.getElementById('market-filter-q-min').value);
    console.log('Q value after "14":', qVal3); // Expected "1.4"

    await window.evaluate(() => {
        let el = document.getElementById('market-filter-q-min');
        el.value = '1456a';
        if(window.sanitizeMarketQInput) window.sanitizeMarketQInput(el);
    });
    let qVal4 = await window.evaluate(() => document.getElementById('market-filter-q-min').value);
    console.log('Q value after "1456a":', qVal4); // Expected "1.45"

    // Check nowrap style
    let wrapStyle = await window.evaluate(() => document.getElementById('market-pokemon-filters').style.flexWrap);
    console.log('Flex wrap style:', wrapStyle); // Expected "nowrap"

    // Check filter parsing is still working despite texts
    await window.evaluate(() => {
        document.getElementById('market-filter-q-min').value = '1.45';
        window.marketSelectAllPokemonForSale();
    });
    let count = await window.evaluate(() => window.marketSelectedPokemonForSale.size);
    console.log('Selected count after filtering for Q > 1.45 (pokemon has 1.5):', count); // Expected 1

    await window.evaluate(() => {
        document.getElementById('market-filter-q-min').value = '1.6';
        window.marketSelectAllPokemonForSale();
    });
    count = await window.evaluate(() => window.marketSelectedPokemonForSale.size);
    console.log('Selected count after filtering for Q > 1.6 (pokemon has 1.5):', count); // Expected 0

    await app.close();
  } catch (error) {
    console.error('Test failed:', error);
    process.exit(1);
  }
})();
