const { _electron } = require('playwright');
const assert = require('assert');

(async () => {
    console.log('Launching app...');
    const app = await _electron.launch({ args: ['.'], executablePath: '/app/node_modules/electron/dist/electron', recordVideo: { dir: '/app/videos2/' } });
    const window = await app.firstWindow();

    await window.waitForFunction(() => window.startNewGame !== undefined);

    console.log('Starting game...');
    await window.evaluate(() => {
        window.startNewGame();
        window.selectStarter(1);
    });

    await window.waitForTimeout(500);

    console.log('Opening market sell...');
    await window.evaluate(() => {
        window.switchView('POKEMON_CENTER_MARKET');
        window.setupMarket(document.getElementById('view-center-market'));
        window.openPokeMarketBuy();
    });
    await window.waitForTimeout(500);

    await window.evaluate(() => {
        if(!window.state.backpack.pokeballs) window.state.backpack.pokeballs = {};
        window.state.backpack.pokeballs['Pokeball'] = 25000;

        window.openPokeMarketSell();
        window.renderPokeMarketSellTab('pokeballs');
    });

    await window.waitForTimeout(500);

    await window.waitForSelector('.market-item-card[data-category="pokeballs"]', { timeout: 10000 });

    console.log('Testing sell quantity cap and format...');
    await window.evaluate(() => {
        const input = document.getElementById('sell-qty-Pokeball');
        input.focus();
        input.value = "30000";
        window.updateSellItemPrice('Pokeball', 'pokeballs');
    });

    await window.waitForTimeout(1000);

    console.log('Taking screenshot...');
    await window.screenshot({ path: '/app/videos2/verification2.png' });

    console.log('Closing app...');
    await app.close();
})();
