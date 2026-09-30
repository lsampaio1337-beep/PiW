const { _electron } = require('playwright');
const assert = require('assert');

(async () => {
    console.log('Launching app...');
    const app = await _electron.launch({ args: ['.'], executablePath: '/app/node_modules/electron/dist/electron' });
    const window = await app.firstWindow();

    await window.waitForFunction(() => window.startNewGame !== undefined);

    await window.evaluate(() => {
        window.startNewGame();
        window.selectStarter(1);
    });

    await window.evaluate(() => {
        window.switchView('POKEMON_CENTER_MARKET');
        window.setupMarket(document.getElementById('view-center-market'));
        window.openPokeMarketBuy();
    });

    await window.waitForSelector('.market-item-card');

    await window.evaluate(() => {
        // Let's manually set the state stock to 10000 to bypass max space left constraints which capped us at 100 earlier
        if(!window.state.backpack.pokeballs) window.state.backpack.pokeballs = {};
        window.state.backpack.pokeballs['Pokeball'] = 10000;

        window.openPokeMarketSell();
        window.renderPokeMarketSellTab('pokeballs');
    });

    await window.waitForSelector('.market-item-card[data-category="pokeballs"]');

    const result = await window.evaluate(() => {
        const input = document.getElementById('sell-qty-Pokeball');
        console.log("Found Input:", input);
        if(input) {
            input.value = "12000"; // Try setting more than stock
            window.updateSellItemPrice('Pokeball', 'pokeballs');
            return input.value;
        }
        return "FAILED_TO_FIND_INPUT";
    });

    console.log("Max value input after entering more than stock:", result);
    assert.strictEqual(result.replace(/,/g, ''), "10000", "Input should be capped at stock and formatted");
    assert.strictEqual(result, "10,000", "Input should be comma formatted");

    console.log('Test passed!');
    await app.close();
})();
