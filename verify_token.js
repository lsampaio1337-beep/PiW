const { _electron: electron } = require('playwright');
(async () => {
  const app = await electron.launch({ args: ['.'], executablePath: '/app/node_modules/electron/dist/electron' });
  const window = await app.firstWindow();

  await window.waitForLoadState('domcontentloaded');

  // Skip startup
  await window.evaluate(() => {
    window.startNewGame();
    window.selectStarter(1);

    window.state.trainer.tokens = 15;
    window.showCalendar('shop');
  });

  await window.waitForTimeout(500);

  await window.evaluate(() => {
    window.buyTokenItem('masterball');
  });

  const tokensAfter = await window.evaluate(() => window.state.trainer.tokens);
  const masterballs = await window.evaluate(() => window.state.backpack.pokeballs["Masterball"]);

  console.log('Tokens after:', tokensAfter);
  console.log('Masterballs after:', masterballs);

  await app.close();
})();
