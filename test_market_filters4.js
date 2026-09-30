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
      window.startNewGame();
      window.selectStarter(1);
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

    // Wait for the filters to render (hidden or visible)
    await window.waitForSelector('#market-pokemon-filters', { state: 'attached' });

    // Check filter parsing is still working despite texts
    await window.evaluate(() => {
        document.getElementById('market-filter-q-min').value = '1.45';
        window.marketSelectAllPokemonForSale();
    });

    // Oh wait, if Q is exactly 1.5, and min is 1.45, it should be selected, right? Let's trace why it was 0.
    // wait, I filtered for `filterQMin` which means `if (p.quality < filterQMin) return;`.
    // Wait! Ah, I see: `if (!isNaN(filterQMin) && p.quality < filterQMin) return;`
    // Let me log the size... wait, I overrode state.storage in my mock. Did `marketSelectAllPokemonForSale` run correctly?
    // Let's check state.storage inside page

    let storageLen = await window.evaluate(() => window.state.storage.length);
    console.log('Storage Length:', storageLen);

    await window.evaluate(() => {
        window.marketSelectedPokemonForSale = new Set(); // reset
        document.getElementById('market-filter-q-min').value = '1.45';
        window.marketSelectAllPokemonForSale();
    });
    let count1 = await window.evaluate(() => window.marketSelectedPokemonForSale.size);
    console.log('Selected count after filtering for Q > 1.45 (pokemon has 1.5):', count1);

    await app.close();
  } catch (error) {
    console.error('Test failed:', error);
    process.exit(1);
  }
})();
