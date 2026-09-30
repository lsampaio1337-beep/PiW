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

    console.log('Waiting for market cards to render...');
    await window.waitForSelector('.market-item-card', { timeout: 10000 });

    console.log('Evaluating KMBT and Masterball removal...');
    const result = await window.evaluate(() => {
        const cards = document.querySelectorAll('.market-item-card');
        const cardTexts = Array.from(cards).map(c => c.innerText);
        const qtyInput = document.getElementById('market-global-qty').value;
        return {
            hasBase: cardTexts.some(text => text.includes('Base:')),
            hasMasterball: cardTexts.some(text => text.includes('Masterball')),
            qtyInputIsFormatted: qtyInput === "1" || qtyInput === "1,000"
        };
    });

    console.log(result);
    assert.strictEqual(result.hasBase, false, 'Cards should not display "Base:"');
    assert.strictEqual(result.hasMasterball, false, 'Masterball should not be in buy mode');

    console.log('Setting max...');
    await window.evaluate(() => {
        window.buySetMax();
    });

    const maxResult = await window.evaluate(() => {
        return document.getElementById('market-global-qty').value;
    });
    console.log("Max value input:", maxResult);

    console.log('Test passed!');
    await app.close();
})();
