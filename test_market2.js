const { _electron } = require('playwright');
const assert = require('assert');

(async () => {
    console.log('Launching app...');
    const app = await _electron.launch({ args: ['.'], executablePath: '/app/node_modules/electron/dist/electron' });
    const window = await app.firstWindow();

    console.log('Waiting for startNewGame...');
    await window.waitForFunction(() => window.startNewGame !== undefined);

    console.log('Starting game...');
    await window.evaluate(() => {
        window.startNewGame();
        window.selectStarter(1);
    });

    console.log('Opening market...');
    await window.evaluate(() => {
        window.switchView('POKEMON_CENTER_MARKET');
        window.setupMarket(document.getElementById('view-center-market'));
        window.openPokeMarketBuy();
    });

    await window.waitForSelector('.market-item-card', { timeout: 10000 });

    console.log('Adding money and setting max...');
    await window.evaluate(() => {
        window.cheatAction('Money');
        window.buySetMax();
    });

    const maxResult = await window.evaluate(() => {
        return document.getElementById('market-global-qty').value;
    });
    console.log("Max value input after money:", maxResult);

    await app.close();
})();
