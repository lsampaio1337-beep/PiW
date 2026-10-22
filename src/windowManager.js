import { state } from "./state.js";
export class WindowManager {
    constructor() {
        this.windows = [];
        this.zIndexCounter = 1000;

        // Ensure there's a container for floating windows to bind boundaries
        this.containerWidth = window.innerWidth;
        this.containerHeight = window.innerHeight;

        window.addEventListener('resize', () => {
            this.containerWidth = window.innerWidth;
            this.containerHeight = window.innerHeight;
            this._constrainAllWindows();
        });
    }

    _parseAndSanitizeToElement(htmlString, targetElement) {
            // Parse HTML safely in an inactive document to prevent automatic resource fetching (e.g. CSRF via img tags).
            const parser = new DOMParser();
            const doc = parser.parseFromString(htmlString, 'text/html');
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
                                    window[objName][funcName](...processedArgs);
                                }
                                return;
                            }

                            // Explicit style setters that the app uses for some modals
                            const styleSetMatch = /^(?:document\.getElementById\(['"]([a-zA-Z0-9_\-]+)['"]\)|this)\.style\.([a-zA-Z0-9_]+)\s*=\s*(['"][a-zA-Z0-9_\-\s.]+['"]|true|false|null|'none'|'block'|'inline'|'flex'|'transparent')\s*;?$/.exec(rawCode.trim());
                            if (styleSetMatch) {
                                const targetId = styleSetMatch[1];
                                const styleProp = styleSetMatch[2];
                                let styleVal = styleSetMatch[3].trim();
                                if (styleVal.startsWith("'") || styleVal.startsWith('"')) styleVal = styleVal.slice(1, -1);

                                if (rawCode.includes('this.style')) {
                                    this.style[styleProp] = styleVal;
                                } else if (targetId) {
                                    const targetEl = document.getElementById(targetId);
                                    if (targetEl) targetEl.style[styleProp] = styleVal;
                                }
                                return;
                            }

                            // Event propagation controls
                            const propagationMatch = /^event\.stopPropagation\(\)$/.exec(rawCode.trim());
                            if (propagationMatch) {
                                event.stopPropagation();
                                return;
                            }
                        });
                    }
                });
            });


            targetElement.innerHTML = '';
            // Move nodes from the parsed body document into the active DOM
            while (body.firstChild) {
                targetElement.appendChild(body.firstChild);
            }
    }


    registerWindow(windowId, headerId, initialLeft = '10%', initialTop = '10%') {
        const winElement = document.getElementById(windowId);
        const headerElement = document.getElementById(headerId);

        if (!winElement || !headerElement) {
            console.error(`WindowManager: Could not find ${windowId} or ${headerId}`);
            return;
        }

        winElement.style.position = 'absolute';
        winElement.style.left = initialLeft;
        winElement.style.top = initialTop;
        winElement.style.zIndex = this.zIndexCounter++;

        this.windows.push(winElement);

        // Focus on mousedown
        winElement.addEventListener('mousedown', () => {
            this.focusWindow(winElement);
        });



        // Setup drag
        this._setupDrag(winElement, headerElement);

        // Setup resize if handles exist
        const resizeHandle = winElement.querySelector('.window-resize-handle');
        const contentScaler = winElement.querySelector('.window-content-scaler');

        if (resizeHandle && contentScaler) {
            this._setupResize(winElement, resizeHandle, contentScaler, headerElement);
        }


    }

    focusWindow(winElement) {
        if (winElement.style.zIndex != this.zIndexCounter - 1) {
            winElement.style.zIndex = this.zIndexCounter++;
        }
    }


    toggleWindow(windowId, forceShow = false) {
        const winElement = document.getElementById(windowId);
        if (winElement) {
            if (forceShow || winElement.style.display === 'none') {
                winElement.style.display = 'flex';
                this.focusWindow(winElement);

                if (!winElement.dataset.settingsLoaded) {
                    winElement.dataset.settingsLoaded = 'true';
                    if (window.state && window.state.settings && window.state.settings.windowSettings && window.state.settings.windowSettings[windowId]) {
                        const savedSettings = window.state.settings.windowSettings[windowId];
                        if (savedSettings.width) winElement.style.width = savedSettings.width;
                        if (savedSettings.height) winElement.style.height = savedSettings.height;
                        if (savedSettings.left) winElement.style.left = savedSettings.left;
                        if (savedSettings.top) winElement.style.top = savedSettings.top;
                    } else if (windowId === 'main-control-window') {
                        winElement.style.width = 'auto';
                        winElement.style.height = 'auto';
                        setTimeout(() => {
                            if (typeof winElement.resetResizeDims === 'function') {
                                winElement.resetResizeDims();
                            }
                            this.autoAdjustWidth(windowId);
                        }, 100);
                    }
                }
            } else {
                winElement.style.display = 'none';
            }
        }
    }




    _setupDrag(winElement, headerElement) {
        let isDragging = false;
        let startX, startY;
        let initialLeft, initialTop;

        let snapLockX = null;
        let snapLockY = null;

        headerElement.style.cursor = 'grab';

        headerElement.addEventListener('mousedown', (e) => {
            isDragging = true;
            startX = e.clientX;
            startY = e.clientY;

            // Focus
            this.focusWindow(winElement);

            const rect = winElement.getBoundingClientRect();
            initialLeft = rect.left;
            initialTop = rect.top;

            winElement.style.left = initialLeft + 'px';
            winElement.style.top = initialTop + 'px';
            winElement.style.transform = 'none';

            headerElement.style.cursor = 'grabbing';
            snapLockX = null;
            snapLockY = null;
            e.preventDefault();
        });

        document.addEventListener('mousemove', (e) => {
            if (!isDragging) return;

            const dx = e.clientX - startX;
            const dy = e.clientY - startY;

            let rawLeft = initialLeft + dx;
            let rawTop = initialTop + dy;

            let finalLeft = rawLeft;
            let finalTop = rawTop;

            const rect = winElement.getBoundingClientRect();

            const snapDistance = 20;
            const breakDistance = 30; // Distance raw mouse can move away from snap before breaking

            // Check X Snap
            if (snapLockX !== null) {
                if (Math.abs(rawLeft - snapLockX.rawAtSnap) > breakDistance) {
                    snapLockX = null; // Break snap
                } else {
                    finalLeft = snapLockX.snappedValue;
                }
            }

            if (snapLockX === null) {
                this.windows.forEach(otherWin => {
                    if (otherWin === winElement || otherWin.style.display === 'none') return;
                    const otherRect = otherWin.getBoundingClientRect();

                    if (Math.abs(rawLeft - otherRect.right) < snapDistance) {
                        snapLockX = { snappedValue: otherRect.right, rawAtSnap: rawLeft };
                    } else if (Math.abs((rawLeft + rect.width) - otherRect.left) < snapDistance) {
                        snapLockX = { snappedValue: otherRect.left - rect.width, rawAtSnap: rawLeft };
                    } else if (Math.abs(rawLeft - otherRect.left) < snapDistance) {
                        snapLockX = { snappedValue: otherRect.left, rawAtSnap: rawLeft };
                    }
                });
            }

            // Check Y Snap
            if (snapLockY !== null) {
                if (Math.abs(rawTop - snapLockY.rawAtSnap) > breakDistance) {
                    snapLockY = null; // Break snap
                } else {
                    finalTop = snapLockY.snappedValue;
                }
            }

            if (snapLockY === null) {
                this.windows.forEach(otherWin => {
                    if (otherWin === winElement || otherWin.style.display === 'none') return;
                    const otherRect = otherWin.getBoundingClientRect();

                    if (Math.abs(rawTop - otherRect.bottom) < snapDistance) {
                        snapLockY = { snappedValue: otherRect.bottom, rawAtSnap: rawTop };
                    } else if (Math.abs((rawTop + rect.height) - otherRect.top) < snapDistance) {
                        snapLockY = { snappedValue: otherRect.top - rect.height, rawAtSnap: rawTop };
                    } else if (Math.abs(rawTop - otherRect.top) < snapDistance) {
                        snapLockY = { snappedValue: otherRect.top, rawAtSnap: rawTop };
                    }
                });
            }

            if (snapLockX !== null) finalLeft = snapLockX.snappedValue;
            if (snapLockY !== null) finalTop = snapLockY.snappedValue;

            // Container Boundary constraints
            if (finalLeft + rect.width > this.containerWidth) finalLeft = Math.max(0, this.containerWidth - rect.width);
            if (finalTop + rect.height > this.containerHeight) finalTop = Math.max(0, this.containerHeight - rect.height);
            if (finalLeft < 0) finalLeft = 0;
            if (finalTop < 0) finalTop = 0;

            winElement.style.left = finalLeft + 'px';
            winElement.style.top = finalTop + 'px';
        });

        document.addEventListener('mouseup', () => {
            if (isDragging) {
                isDragging = false;
                headerElement.style.cursor = 'grab';
                this.saveWindowData(winElement.id);
            }
        });
    }

        _setupResize(winElement, handleElement, scalerElement, headerElement) {
        let isResizing = false;
        let startX, startY;
        let startWidth, startHeight;


        winElement.adjustHeightForNewContent = () => {
            if (winElement.id === 'window-map') {
                if (winElement._mapAspectRatio) {
                    const currentWidth = winElement.offsetWidth || parseInt(winElement.style.width) || 800;
                    const headerH = headerElement ? headerElement.offsetHeight : 0;
                    const targetHeight = (currentWidth / winElement._mapAspectRatio) + headerH;
                    winElement.style.height = targetHeight + 'px';
                }
                return;
            }

            if (!winElement._originalWidth) {
                initDims();
            }
            if (!winElement._originalWidth) return;

            const headerH = headerElement ? headerElement.offsetHeight : 0;

            // To find the unscaled content height without removing scaling which causes flicker/warp,
            // we can temporarily reset width to original, height to auto, and transform to none.
            const currentWidth = winElement.style.width; // Use explicit style width to avoid border/padding accumulation

            let contentContainer = winElement.querySelector('.window-content-container');
            let horizontalPadding = 0;
            let verticalPadding = 0;
            if (contentContainer) {
                const style = window.getComputedStyle(contentContainer);
                horizontalPadding = parseFloat(style.paddingLeft || 0) + parseFloat(style.paddingRight || 0);
                verticalPadding = parseFloat(style.paddingTop || 0) + parseFloat(style.paddingBottom || 0);
            }

            const parsedCurrentWidth = currentWidth && currentWidth.endsWith('px') ? parseFloat(currentWidth) : winElement.offsetWidth;
            const currentScale = (parsedCurrentWidth - horizontalPadding) / winElement._originalWidth;

            // Stop auto-adjusting if user has resized manually, indicated by --original-width being set or manual interaction
            // To be safe, if we are in adjustHeightForNewContent, we only adjust height, not width.

            // Strip scaling temporarily
            winElement.style.width = winElement._originalWidth + 'px';
            winElement.style.height = 'auto';
            scalerElement.style.transform = 'none';
            scalerElement.style.width = 'auto';
            scalerElement.style.height = 'auto';
            scalerElement.style.position = 'relative';

            // Need to let browser reflow
            void winElement.offsetHeight;

            let newOriginalHeight = Math.ceil(scalerElement.getBoundingClientRect().height);
            if (newOriginalHeight <= 0) {
                newOriginalHeight = Math.ceil(winElement.getBoundingClientRect().height) - headerH;
            }

            if (newOriginalHeight > 0) {
                winElement._originalHeight = newOriginalHeight;
                scalerElement.style.setProperty('--original-height', winElement._originalHeight + 'px');
                winElement._originalRatio = winElement._originalWidth / winElement._originalHeight;

                // Re-apply scale
                const newScaledContentHeight = winElement._originalHeight * currentScale;
                let newHeight = headerH + newScaledContentHeight + verticalPadding;

                // Respect maxHeight if it's set via style or dataset
                let maxHeight = 0;
                const maxHeightStr = winElement.style.maxHeight;
                if (maxHeightStr && maxHeightStr.endsWith('px')) {
                    maxHeight = parseInt(maxHeightStr, 10);
                } else if (winElement.dataset.maxHeightRatio) {
                    const ratio = parseFloat(winElement.dataset.maxHeightRatio);
                    if (!isNaN(ratio) && ratio > 0) {
                        maxHeight = winElement._originalWidth * ratio * currentScale;
                    }
                }

                if (maxHeight > 0 && newHeight > maxHeight) {
                    newHeight = maxHeight;
                }

                // Lock dimensions
                scalerElement.style.position = 'absolute';
                scalerElement.style.width = winElement._originalWidth + 'px';
                scalerElement.style.height = winElement._originalHeight + 'px';
                scalerElement.style.transform = `scale(${currentScale})`;

                winElement.style.width = parsedCurrentWidth + 'px';
                winElement.style.height = newHeight + 'px';

                if (this.windows.includes(winElement)) {
                    this.saveWindowData(winElement.id);
                }

            }

        };

        winElement.resetResizeDims = () => {
            startWidth = 0;
            startHeight = 0;
            winElement._originalWidth = 0;
            winElement._originalHeight = 0;
            // Also explicitly clear the CSS custom properties that initDims reads
            if (scalerElement) {
                scalerElement.style.removeProperty('--original-width');
                scalerElement.style.removeProperty('--original-height');
            }
            initDims();
        };

        const initDims = () => {
            if (!winElement._originalWidth) {
                const headerH = headerElement ? headerElement.offsetHeight : 0;

                if (winElement.style.display !== 'none' && winElement.offsetWidth > 0) {
                    let contentContainer = winElement.querySelector('.window-content-container');
                    let horizontalPadding = 0;
                    let verticalPadding = 0;
                    if (contentContainer) {
                        const style = window.getComputedStyle(contentContainer);
                        horizontalPadding = parseFloat(style.paddingLeft || 0) + parseFloat(style.paddingRight || 0);
                        verticalPadding = parseFloat(style.paddingTop || 0) + parseFloat(style.paddingBottom || 0);
                    }
                    winElement._originalWidth = winElement.offsetWidth - horizontalPadding;
                    winElement._originalHeight = winElement.offsetHeight - headerH - verticalPadding;
                    let maxH = parseInt(winElement.style.maxHeight);
                    if (!isNaN(maxH)) {
                         let actualContentHeight = scalerElement ? (scalerElement.scrollHeight || winElement._originalHeight) : winElement._originalHeight;
                         winElement._originalHeight = Math.min(actualContentHeight, maxH - headerH);
                    }
                    if (winElement._originalWidth > 0 && winElement._originalHeight > 0) {
                        scalerElement.style.setProperty('--original-width', winElement._originalWidth + 'px');
                        scalerElement.style.setProperty('--original-height', winElement._originalHeight + 'px');
                        winElement._originalRatio = winElement._originalWidth / winElement._originalHeight;

                        // Lock the window to its exact measured height so it doesn't collapse
                        // when the scaler changes to absolute positioning.
                        winElement.style.height = (headerH + winElement._originalHeight) + 'px';

                        scalerElement.style.width = winElement._originalWidth + 'px';
                        scalerElement.style.position = 'absolute';
                        scalerElement.style.height = winElement._originalHeight + 'px';
                        scalerElement.style.top = '0px';
                    }
                }
            }
        };

        handleElement.addEventListener('mousedown', (e) => {
            isResizing = true;
            startX = e.clientX;
            startY = e.clientY;

            initDims(); // Ensure dimensions are known

            startWidth = winElement.offsetWidth;
            startHeight = winElement.offsetHeight;

            this.focusWindow(winElement);
            e.stopPropagation();
            e.preventDefault();
        });

        document.addEventListener('mousemove', (e) => {
            if (!isResizing) return;

            const dx = e.clientX - startX;
            let newWidth = Math.max(200, startWidth + dx); // minimum width 200px

            if (winElement.id === 'window-map' && winElement._mapAspectRatio) {
                const headerH = headerElement ? headerElement.offsetHeight : 0;
                let maxWFromHeight = (this.containerHeight - headerH) * winElement._mapAspectRatio;
                let maxW = Math.min(this.containerWidth, maxWFromHeight);
                if (newWidth > maxW) newWidth = maxW;

                const targetHeight = (newWidth / winElement._mapAspectRatio) + headerH;
                winElement.style.width = newWidth + 'px';
                winElement.style.height = targetHeight + 'px';
            } else if (winElement._originalWidth && winElement._originalRatio) {
                const headerH = headerElement ? headerElement.offsetHeight : 0;

                let contentContainer = winElement.querySelector('.window-content-container');
                let horizontalPadding = 0;
                let verticalPadding = 0;
                if (contentContainer) {
                    const style = window.getComputedStyle(contentContainer);
                    horizontalPadding = parseFloat(style.paddingLeft || 0) + parseFloat(style.paddingRight || 0);
                    verticalPadding = parseFloat(style.paddingTop || 0) + parseFloat(style.paddingBottom || 0);
                }

                // Enforce max width during resize to prevent it from going out of screen boundaries
                let maxWFromHeight = horizontalPadding + ((this.containerHeight - headerH - verticalPadding) * (winElement._originalWidth / winElement._originalHeight));
                let maxW = Math.min(this.containerWidth, maxWFromHeight);
                if (newWidth > maxW) newWidth = maxW;

                const currentContentWidth = newWidth - horizontalPadding;
                const scale = currentContentWidth / winElement._originalWidth;
                const newContentHeight = winElement._originalHeight * scale;
                let newHeight = headerH + newContentHeight + verticalPadding;

                winElement.style.width = newWidth + 'px';
                winElement.style.height = newHeight + 'px';

                if (winElement.dataset.maxHeightRatio) {
                     delete winElement.dataset.maxHeightRatio;
                }

                scalerElement.style.transform = `scale(${scale})`;
            }
        });

        document.addEventListener('mouseup', () => {
            if (isResizing) {
                isResizing = false;
                this._constrainAllWindows();
                this.saveWindowData(winElement.id);
            }
        });

        const observer = new MutationObserver((mutations) => {
            mutations.forEach((mutation) => {
                if (mutation.attributeName === 'style' && winElement.style.display !== 'none' && !winElement._originalWidth) {
                    setTimeout(initDims, 50);
                }
            });
        });
        observer.observe(winElement, { attributes: true });

        // Let the auto adjust handle its initial dimensions properly on startup
        // to avoid locking in to an empty state and being permanently restricted
        // until a reset is forced.
        if (winElement.id !== 'main-control-window') {
            setTimeout(initDims, 100);
        }
    }

    setWindowProportions(windowId, widthToHeightRatio) {
        const winElement = document.getElementById(windowId);
        if (!winElement) return;

        const headerElement = winElement.querySelector('.window-header');
        const scalerElement = winElement.querySelector('.window-content-scaler');
        if (!scalerElement) return;

        // Force a layout flush to ensure header height is accurate
        const headerH = headerElement ? headerElement.offsetHeight || 30 : 0;

        if (!winElement._originalWidth) {
             winElement._originalWidth = 800;
        }

        // We MUST preserve originalWidth and scale, and only update originalHeight
        const originalWidth = winElement._originalWidth;
        // height = width / (width/height ratio)
        const originalHeight = originalWidth / widthToHeightRatio;

        winElement._originalHeight = originalHeight;
        winElement._originalRatio = widthToHeightRatio;

        scalerElement.style.setProperty('--original-width', originalWidth + 'px');
        scalerElement.style.setProperty('--original-height', originalHeight + 'px');

        // Find current width to keep scale the same
        let currentWidth = winElement.offsetWidth;
        if (currentWidth === 0) currentWidth = parseInt(winElement.style.width) || 800;

        const scale = currentWidth / originalWidth;
        const newContentHeight = originalHeight * scale;
        const newHeight = headerH + newContentHeight;

        // Apply exactly
        winElement.style.height = newHeight + 'px';
        scalerElement.style.height = originalHeight + 'px';
        // Enforce top margin to prevent overlapping the header
        scalerElement.style.top = '0px';

        // DO NOT change transform or scalerElement.style.width, we preserve the existing scale!
        this.saveWindowData(windowId);
    }


    saveWindowData(windowId) {
        if (!state.settings.windowSettings) {
            state.settings.windowSettings = {};
        }
        const winElement = document.getElementById(windowId);
        if (winElement) {
            state.settings.windowSettings[windowId] = {
                left: winElement.style.left,
                top: winElement.style.top,
                width: winElement.style.width,
                height: winElement.style.height
            };
            if (window.storageRef) {
                window.storageRef.save(state);
            }
        }
    }




    autoAdjustWidth(windowId) {
        const winElement = document.getElementById(windowId);
        if (!winElement) return;

        const scalerElement = winElement.querySelector('.window-content-scaler');
        if (!scalerElement) return;

        // Briefly measure natural width of content without constraints
        const oldScale = scalerElement.style.transform;
        const oldWidth = winElement.style.width;
        const oldPosition = scalerElement.style.position;

        // Temporarily clear constraints to let it flow to natural width
        scalerElement.style.position = 'relative';
        scalerElement.style.transform = 'none';
        scalerElement.style.width = 'max-content';

        const newOriginalWidth = Math.ceil(scalerElement.getBoundingClientRect().width);

        // Check if we need to grow original width
        const currentOriginalWidthStr = scalerElement.style.getPropertyValue('--original-width');
        let currentOriginalWidth = parseInt(currentOriginalWidthStr);
        if (isNaN(currentOriginalWidth) || currentOriginalWidth <= 0) {
            currentOriginalWidth = newOriginalWidth;
        }

        let newOriginalHeight = Math.ceil(scalerElement.getBoundingClientRect().height);

        // Calculate a more precise height based on children if necessary
        let actualContentHeight = 0;
        Array.from(scalerElement.children).forEach(child => {
            const rect = child.getBoundingClientRect();
            if (rect.height > actualContentHeight) actualContentHeight = rect.height;
        });
        if (actualContentHeight > newOriginalHeight) {
            newOriginalHeight = actualContentHeight;
        }

        // Force natural layout on uninitialized window
        if (newOriginalWidth > 0 && (!currentOriginalWidthStr || isNaN(parseInt(currentOriginalWidthStr)))) {
            scalerElement.style.setProperty('--original-width', newOriginalWidth + 'px');
            winElement._originalWidth = newOriginalWidth;
            if (newOriginalHeight > 0) winElement._originalHeight = newOriginalHeight;

            if (winElement._originalHeight) {
                winElement._originalRatio = winElement._originalWidth / winElement._originalHeight;
            }

            // If window is uninitialized, assign the calculated max-content width to the actual element width
            // to allow it to wrap properly, avoiding the 80x80 initial bug where the wrapper is small.
            if (!oldWidth || oldWidth === 'auto' || parseInt(oldWidth) < 150) {
                let contentContainer = winElement.querySelector('.window-content-container');
                let horizontalPadding = 0;
                if (contentContainer) {
                    const style = window.getComputedStyle(contentContainer);
                    horizontalPadding = parseFloat(style.paddingLeft || 0) + parseFloat(style.paddingRight || 0);
                }
                winElement.style.width = (newOriginalWidth + horizontalPadding) + 'px';
            }
        } else if (newOriginalWidth !== currentOriginalWidth) {
            // Content needs more or less width, we must adjust
            const growthRatio = newOriginalWidth / currentOriginalWidth;
            scalerElement.style.setProperty('--original-width', newOriginalWidth + 'px');
            if (newOriginalHeight > 0) scalerElement.style.setProperty('--original-height', newOriginalHeight + 'px');

            // Scale up or down the window width by the same ratio
            if (oldWidth && oldWidth.endsWith('px')) {
                const currentWidth = parseInt(oldWidth);
                winElement.style.width = (currentWidth * growthRatio) + 'px';
            } else {
                winElement.style.width = newOriginalWidth + 'px';
            }

            this.saveWindowData(windowId);

            winElement._originalWidth = newOriginalWidth;
            if (newOriginalHeight > 0) winElement._originalHeight = newOriginalHeight;

            if (winElement._originalHeight) {
                winElement._originalRatio = winElement._originalWidth / winElement._originalHeight;
            }
        }

        // Restore positioning
        scalerElement.style.position = oldPosition;
        scalerElement.style.transform = oldScale;
        scalerElement.style.width = scalerElement.style.getPropertyValue('--original-width');
    }

    recalculateWindowSize(windowId) {
        const winElement = document.getElementById(windowId);
        if (!winElement) return;

        if (winElement._originalWidth) {
            return; // Window already sized, do not resize it
        }

        // If the window has already been initialized with scaling, use proportional height adjuster
        if (typeof winElement.adjustHeightForNewContent === 'function') {
            winElement.adjustHeightForNewContent();
            return;
        }

        let currentWidth = winElement.style.width;
        if (!currentWidth || currentWidth === 'auto' || currentWidth === '') {
            if (winElement.offsetWidth > 0) {
                currentWidth = winElement.offsetWidth + 'px';
            } else {
                currentWidth = '800px';
            }
        }

        winElement.style.width = currentWidth;
        winElement.style.height = 'auto';

        const scalerElement = winElement.querySelector('.window-content-scaler');
        if (scalerElement) {
            scalerElement.style.transform = 'none';
            scalerElement.style.width = 'auto';
            scalerElement.style.height = 'auto';
            scalerElement.style.position = 'relative';

            scalerElement.style.removeProperty('--original-width');
            scalerElement.style.removeProperty('--original-height');

            if (typeof winElement.resetResizeDims === 'function') {
                setTimeout(() => {
                    winElement.resetResizeDims();
                }, 50);
            }

            if (state.settings && state.settings.windowSettings && state.settings.windowSettings[windowId]) {
                delete state.settings.windowSettings[windowId];
                if (window.storageRef) {
                    window.storageRef.save(state);
                }
            }
        }
    }



    _shrinkWindow(winElement) {
        if (winElement._originalWidth && winElement._originalHeight) {
            const headerElement = winElement.querySelector('.window-header');
            const scalerElement = winElement.querySelector('.window-content-scaler');
            if (!scalerElement) return;

            const headerH = headerElement ? headerElement.offsetHeight : 0;
            let contentContainer = winElement.querySelector('.window-content-container');
            let horizontalPadding = 0;
            let verticalPadding = 0;
            if (contentContainer) {
                const style = window.getComputedStyle(contentContainer);
                horizontalPadding = parseFloat(style.paddingLeft || 0) + parseFloat(style.paddingRight || 0);
                verticalPadding = parseFloat(style.paddingTop || 0) + parseFloat(style.paddingBottom || 0);
            }

            let targetHeight = 720;
            if (targetHeight > this.containerHeight) {
                targetHeight = this.containerHeight;
            }

            // Respect maxHeight if it's set on shrink logic too
            let maxHeight = 0;
            const maxHeightStr = winElement.style.maxHeight;
            if (maxHeightStr && maxHeightStr.endsWith('px')) {
                maxHeight = parseInt(maxHeightStr, 10);
            } else if (winElement.dataset.maxHeightRatio) {
                const ratio = parseFloat(winElement.dataset.maxHeightRatio);
                if (!isNaN(ratio) && ratio > 0) {
                    let currentW = winElement.offsetWidth;
                    if (!currentW || currentW <= 0) currentW = parseInt(winElement.style.width) || 800;
                    let currentScale = (currentW - horizontalPadding) / winElement._originalWidth;
                    maxHeight = winElement._originalWidth * ratio * currentScale;
                }
            }

            if (maxHeight > 0 && targetHeight > maxHeight) {
                targetHeight = maxHeight;
            }

            let newContentHeight = targetHeight - headerH - verticalPadding;
            if (newContentHeight <= 0) newContentHeight = 100;
            let scale = newContentHeight / winElement._originalHeight;

            let currentContentWidth = scale * winElement._originalWidth;
            let newWidth = currentContentWidth + horizontalPadding;

            if (newWidth > this.containerWidth) {
                newWidth = this.containerWidth;
                currentContentWidth = newWidth - horizontalPadding;
                scale = currentContentWidth / winElement._originalWidth;
                newContentHeight = winElement._originalHeight * scale;
                targetHeight = headerH + newContentHeight + verticalPadding;
            }

            winElement.style.width = newWidth + 'px';
            winElement.style.height = targetHeight + 'px';
            scalerElement.style.transform = `scale(${scale})`;

            // Wait for reflow to let width take effect
            void winElement.offsetWidth;
        } else {
            const rect = winElement.getBoundingClientRect();
            if (rect.width > this.containerWidth) winElement.style.width = this.containerWidth + 'px';
            if (rect.height > this.containerHeight) winElement.style.height = this.containerHeight + 'px';
        }
    }

    _constrainAllWindows() {
        this.windows.forEach(winElement => {
            if (winElement.style.display !== 'none') {
                const rect = winElement.getBoundingClientRect();
                let left = parseInt(winElement.style.left) || 0;
                let top = parseInt(winElement.style.top) || 0;

                let changed = false;

                if (rect.width > this.containerWidth || rect.height > this.containerHeight) {
                    this._shrinkWindow(winElement);
                    changed = true;
                }

                const currentRect = winElement.getBoundingClientRect();

                if (left + currentRect.width > this.containerWidth) {
                    left = Math.max(0, this.containerWidth - currentRect.width);
                    changed = true;
                }
                if (top + currentRect.height > this.containerHeight) {
                    top = Math.max(0, this.containerHeight - currentRect.height);
                    changed = true;
                }
                if (left < 0) {
                    left = 0;
                    changed = true;
                }
                if (top < 0) {
                    top = 0;
                    changed = true;
                }

                if (changed) {
                    winElement.style.left = left + 'px';
                    winElement.style.top = top + 'px';
                }
            }
        });
    }

    createDynamicWindow(windowId, title, htmlContent, width = '800px', height = 'auto') {
        let winElement = document.getElementById(windowId);
        let isNewWindow = false;

        if (!winElement) {
            isNewWindow = true;
            const template = document.getElementById('generic-window-template');
            if (!template) {
                console.error("Template #generic-window-template not found.");
                return null;
            }

            const clone = template.content.cloneNode(true);
            winElement = clone.querySelector('.floating-window');
            winElement.id = windowId;
            winElement.style.width = width;
            winElement.style.height = height;

            const header = winElement.querySelector('.window-header');
            header.id = windowId + '-header';

            const contentPanel = winElement.querySelector('.content-panel');
            contentPanel.id = windowId + '-content';

            document.body.appendChild(winElement);

            // Register it with windowManager
            this.registerWindow(windowId, header.id);
        }

        const header = document.getElementById(windowId + '-header');
        if (header && title) {
            header.style.position = 'relative';
            this._parseAndSanitizeToElement(title, header);

            const closeBtn = document.createElement('span');
            closeBtn.textContent = 'X';
            closeBtn.style.position = 'absolute';
            closeBtn.style.top = '5px';
            closeBtn.style.right = '5px';
            closeBtn.style.fontSize = '12px';
            closeBtn.style.fontWeight = 'bold';
            closeBtn.style.lineHeight = '1';
            closeBtn.style.padding = '0';
            closeBtn.style.cursor = 'pointer';
            closeBtn.style.color = 'white';
            closeBtn.style.zIndex = '10';
            closeBtn.onclick = () => {
                if (window.windowManager) {
                    window.windowManager.closeDynamicWindow(windowId);
                }
            };

            header.appendChild(closeBtn);
        }

        const contentPanel = document.getElementById(windowId + '-content');
        if (contentPanel && htmlContent !== undefined) {
            this._parseAndSanitizeToElement(htmlContent, contentPanel);
        }

        // Spawn logic: under main control if possible
        this.spawnWindow(windowId);

        // Ensure layout is recalculated so it fits inner content with the new paddings
        if (height === 'auto') {
            if (isNewWindow || !winElement._originalWidth) {
                this.recalculateWindowSize(windowId);
                setTimeout(() => {
                    if (typeof winElement.adjustHeightForNewContent === 'function') {
                        winElement.adjustHeightForNewContent();
                    } else {
                        this.recalculateWindowSize(windowId);
                    }
                }, 50);
            }
        }

        return winElement;
    }

    closeDynamicWindow(windowId) {
        const winElement = document.getElementById(windowId);
        if (winElement) {
            winElement.style.display = 'none';
        }
    }

    spawnWindow(windowId) {
        const winElement = document.getElementById(windowId);
        if (!winElement) return;

        winElement.style.display = 'flex';

        // Check if there is saved position/size for this window
        let savedSettings = null;
        if (state.settings && state.settings.windowSettings && state.settings.windowSettings[windowId]) {
            savedSettings = state.settings.windowSettings[windowId];
        }

        if (savedSettings) {
            if (savedSettings.width) winElement.style.width = savedSettings.width;
            if (savedSettings.height) winElement.style.height = savedSettings.height;
            if (savedSettings.left) winElement.style.left = savedSettings.left;
            if (savedSettings.top) winElement.style.top = savedSettings.top;
        } else {
            let left = 50;
            let top = 50;

            const mainView = document.getElementById('top-bar-window');
            if (mainView && mainView.style.display !== 'none') {
                const rect = mainView.getBoundingClientRect();
                left = rect.left;
                top = rect.bottom; // directly below (vertical)
            }

            const winRect = winElement.getBoundingClientRect();
            if (left < 0) left = 0;
            if (top < 0) top = 0;
            if (left + winRect.width > this.containerWidth) left = this.containerWidth - winRect.width;
            if (top + winRect.height > this.containerHeight) top = this.containerHeight - winRect.height;

            winElement.style.left = left + 'px';
            winElement.style.top = top + 'px';
        }

        // above all other windows
        winElement.style.zIndex = this.zIndexCounter++;

        setTimeout(() => {
             // trigger resize initialization if needed
             winElement.style.display = 'flex';
        }, 50);
    }



}
