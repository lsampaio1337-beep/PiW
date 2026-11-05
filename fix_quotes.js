// Ah! windowManager.js parses onclick inline handlers string with _parseArgs!
// _parseArgs does NOT eval(). It strips arguments.
// So: window.showMedalDetail('${region}', ${caughtCount}, ...)
// Wait, if it uses custom logic, maybe `if(window.showMedalDetail)` breaks it!
