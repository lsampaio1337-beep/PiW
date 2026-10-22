        }

        const contentPanel = document.getElementById(windowId + '-content');
        if (contentPanel && htmlContent !== undefined) {
            // Parse HTML safely in an inactive document to prevent automatic resource fetching (e.g. CSRF via img tags).
            const parser = new DOMParser();
            const doc = parser.parseFromString(htmlContent, 'text/html');
            const body = doc.body;

            // Remove script, iframe, object tags completely to neutralize obvious XSS vectors
            const forbiddenTags = ['script', 'iframe', 'object', 'embed', 'applet', 'base', 'meta', 'link'];
            forbiddenTags.forEach(tag => {
                const elements = body.querySelectorAll(tag);
                elements.forEach(el => el.remove());
            });

            // We must allow inline handlers (onclick, onmouseover) because the app is deeply coupled to them,
            // but we must not blindly use eval/innerHTML. We extract them and parse them to secure event listeners.
            const allElements = body.querySelectorAll('*');
            allElements.forEach(el => {
                // Strip javascript: protocols from known URI attributes
                ['href', 'src', 'formaction', 'action'].forEach(attrName => {
                    if (el.hasAttribute(attrName)) {
                        const val = el.getAttribute(attrName).toLowerCase().replace(/[\s\x00-\x1f\x7f-\x9f]/g, '');
                        if (val.startsWith('javascript:') || val.startsWith('vbscript:') || val.startsWith('data:text/html')) {
                            el.removeAttribute(attrName);
                        }
                    }
                });

                Array.from(el.attributes).forEach(attr => {
                    if (attr.name.toLowerCase().startsWith('on')) {
                        const eventType = attr.name.toLowerCase().substring(2);
                        const rawCode = attr.value;
                        el.removeAttribute(attr.name); // Remove the inline string to prevent arbitrary string execution

                        el.addEventListener(eventType, function(event) {
                            // Extract known window/DOM elements being invoked.
                            // To prevent bypasses via string assignment or eval, we do NOT execute the string.
                            // We dynamically map strict string templates back to function calls if they match.

                            // 1. Check for basic exact parameterless invocations (e.g. `window.showTrainerStats()`)
                            const basicCallMatch = /^(?:if\s*\([^)]*\)\s*)?window\.([a-zA-Z0-9_]+)\s*\(\s*\)\s*;?$/.exec(rawCode.trim());
                            if (basicCallMatch) {
                                const funcName = basicCallMatch[1];
                                if (typeof window[funcName] === 'function') {
                                    window[funcName]();
                                }
                                return;
                            }

                            // 2. Check for basic parameter invocations (e.g. `window.buyItem(1, true)`)
                            // This matches `window.funcName(arg1, arg2)` where args are simple strings/booleans/numbers
                            // It explicitly restricts the allowed characters to prevent JS execution within arguments.
                            const allowedFuncs = [
                                'activateCheat', 'applyPokemonFilters', 'buyBonusCandy', 'buyItem', 'buySetMax',
                                'buyTokenItem', 'buyTokenItemRandom', 'buyTokenUnlock', 'cancelSellMode', 'changeLocation',
                                'cheatAction', 'cheatCompleteDailyChallenge', 'cheatCompleteProfTask', 'cheatProgressChallenge',
                                'claimDailyChallengeToken', 'claimDailyReward', 'claimPendingGift', 'claimProfTaskReward',
                                'clearPokemonFilter', 'clickEmptyBreedSlot', 'close', 'closeBackpackModal', 'closeBackpackPocket',
                                'closeModal', 'completeChallenge', 'concludeProfTutorial', 'confirmTokenItemSelect',
                                'dismissBonusCandyMessage', 'dismissDaycareMessage', 'dragOver', 'dragStart', 'enterSafariZone',
                                'evolvePokemon', 'exportLog', 'forceNextEncounter', 'giveFreeTokens', 'handleDrop',
                                'handleGameSpeedSlider', 'hideMapTooltip', 'initMultiplayerView',
                                'marketDeselectAllPokemonForSale', 'marketSelectAllPokemonForSale', 'marketSellSelectedPokemon',
                                'navigateToLocation', 'openDittoTransformModal', 'openPokeMarketBuy', 'openPokeMarketSell',
                                'proceedProfTutorial', 'promptExitGame', 'renderBackpackTab', 'renderPokeMarketSellTab',
                                'renderPokeMarketTab', 'renderTokenShopHtml', 'rerollIndividualDailyChallenge', 'resetMultiplayerReady',
                                'restartGameClock', 'runTimeLapse', 'sanitizeMarketNumberInput', 'sanitizeMarketQInput',
                                'selectAllForSale', 'selectBattleActiveItem', 'selectDittoTransformTarget', 'selectGlobalSmartCaptureBall',
                                'selectSmartCaptureBall', 'selectStarter', 'sellMarketItem', 'sellSelectedPokemon', 'sellSetMax',
                                'setActiveItem', 'setAutoPotionThreshold', 'setLeader', 'setSmartCaptureGlobalMode',
                                'setSmartCaptureShinyMode', 'showActiveItemSelection', 'showAddPokemonModal', 'showBackpackAndFocus',
                                'showCalendar', 'showChallengesModal', 'showDexEntry', 'showGameAlert', 'showLevelUp',
                                'showMapTooltip', 'showModal', 'showPokemonStats', 'showPokemonStatsByUuid', 'showProfLabModal',
                                'showSmartCaptureBallSelection', 'showSmartCaptureMode', 'showTimeLapseModal', 'showTimeLapseResults',
                                'showTokenItemSelect', 'showTrainerStats', 'showVitaminsModal', 'showZzZConfirmationModal',
                                'skipProfTutorial', 'startCasinoEncounter', 'startGymBattle', 'startNewGame', 'switchMapRegion',
                                'switchMultiplayerTab', 'switchView', 'toggleMarketPokemonFilters', 'toggleMarketPokemonSaleSelection',
                                'toggleSaleSelection', 'trackDailyChallenge', 'transformDitto', 'updateBuyItemPrice',
                                'updateMainControl', 'updatePokemonFilter', 'updateSellItemPrice', 'updateSmartCaptureIcon',
                                'updateUI', 'useVitamin', 'showCatchRateModal'
                            ];

                            // We explicitly match the arguments pattern carefully.
                            const argCallMatch = /^(?:if\s*\([^)]*\)\s*)?window\.([a-zA-Z0-9_]+)\s*\(\s*(['"]?[a-zA-Z0-9_/\-$!*#@\s.{}\[\]]+['"]?(?:\s*,\s*['"]?[a-zA-Z0-9_/\-$!*#@\s.{}\[\]]+['"]?)*)\s*\)\s*;?$/.exec(rawCode.trim());

                            // Nested properties matching (e.g. `window.windowManager.closeDynamicWindow`)
                            const nestedCallMatch = /^(?:if\s*\([^)]*\)\s*)?window\.([a-zA-Z0-9_]+)\.([a-zA-Z0-9_]+)\s*\(\s*(['"]?[a-zA-Z0-9_/\-$!*#@\s.{}\[\]]+['"]?(?:\s*,\s*['"]?[a-zA-Z0-9_/\-$!*#@\s.{}\[\]]+['"]?)*)\s*\)\s*;?$/.exec(rawCode.trim());

                            if (argCallMatch) {
                                const funcName = argCallMatch[1];
                                if (allowedFuncs.includes(funcName) && typeof window[funcName] === 'function') {
                                    // Custom parser to split by comma outside quotes
                                    const argStr = argCallMatch[2].trim();
                                    const rawArgs = [];
                                    let currentArg = '';
                                    let inQuotes = false;
                                    let quoteChar = '';
                                    for (let i = 0; i < argStr.length; i++) {
                                        const char = argStr[i];
                                        if (!inQuotes && (char === "'" || char === '"')) {
                                            inQuotes = true;
                                            quoteChar = char;
                                        } else if (inQuotes && char === quoteChar) {
                                            inQuotes = false;
                                            quoteChar = '';
                                        } else if (!inQuotes && char === ',') {
                                            rawArgs.push(currentArg.trim());
                                            currentArg = '';
                                            continue;
                                        } else {
                                            currentArg += char;
                                        }
                                    }
                                    if (currentArg.trim() !== '') {
                                        rawArgs.push(currentArg.trim());
                                    }

                                    const processedArgs = rawArgs.map(s => {
                                        if (s === 'true') return true;
                                        if (s === 'false') return false;
                                        if (s === 'null') return null;
                                        if (s === 'undefined') return undefined;
                                        if (!isNaN(s) && s !== '') return Number(s);
                                        return s;
                                    });
                                    window[funcName](...processedArgs);
                                }
                                return;
                            }

                            if (nestedCallMatch) {
                                const objName = nestedCallMatch[1];
                                const funcName = nestedCallMatch[2];
                                // We explicitly only allow globals.battleSystem and windowManager methods.
                                if ((objName === 'windowManager' || (objName === 'globals' && funcName === 'battleSystem')) && window[objName] && typeof window[objName][funcName] === 'function') {
                                    const argStr = nestedCallMatch[3].trim();
                                    const rawArgs = [];
                                    let currentArg = '';
                                    let inQuotes = false;
                                    let quoteChar = '';
                                    for (let i = 0; i < argStr.length; i++) {
                                        const char = argStr[i];
                                        if (!inQuotes && (char === "'" || char === '"')) {
                                            inQuotes = true;
                                            quoteChar = char;
                                        } else if (inQuotes && char === quoteChar) {
                                            inQuotes = false;
                                            quoteChar = '';
                                        } else if (!inQuotes && char === ',') {
                                            rawArgs.push(currentArg.trim());
                                            currentArg = '';
                                            continue;
