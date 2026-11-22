import { jest } from '@jest/globals';

const originalGetElementById = document.getElementById;
document.getElementById = function(id) {
    const el = document.querySelector(`[id="${id}"]`);
    return el;
};

document.body.innerHTML = `
<template id="generic-window-template">
      <div class="modal-content floating-window" style="width: 800px; height: auto; display: flex; flex-direction: column; display: none;">
          <div class="window-header">Window</div>
          <div class="window-content-container">
              <div class="window-content-scaler">
                  <div class="content-panel" style="flex: 1; overflow-y: auto;"></div>
              </div>
          </div>
          <div class="window-resize-handle"></div>
      </div>
  </template>
`;

import { WindowManager } from '../src/windowManager.js';
import { state } from '../src/state.js';
import { setupWindowToggles } from '../src/init/listeners/windowListeners.js';

describe('WindowManager', () => {
    let windowManager;

    beforeEach(() => {
        windowManager = new WindowManager();
        window.windowManager = windowManager;
        windowManager.spawnWindow = jest.fn();
        windowManager.recalculateWindowSize = jest.fn();
        windowManager._constrainAllWindows = jest.fn();
    });

    afterEach(() => {
        document.querySelectorAll('.floating-window').forEach(el => el.remove());
    });

    test('createDynamicWindow correctly escapes HTML in title to prevent XSS', () => {
        const xssTitle = '<img src=x onerror=alert(1)>Malicious Title';
        windowManager.createDynamicWindow('test-win-1', xssTitle, '<p>Content</p>');

        const header = document.getElementById('test-win-1-header');
        expect(header).not.toBeNull();

        expect(header.textContent).toContain("Malicious Title");

        const img = header.querySelector('img');
        expect(img.getAttribute("onerror")).toBeNull();

        const closeBtn = header.querySelector('span');
        expect(closeBtn).not.toBeNull();
        expect(closeBtn.textContent).toBe('X');

        windowManager.closeDynamicWindow = jest.fn();
        closeBtn.click();
        expect(windowManager.closeDynamicWindow).toHaveBeenCalledWith('test-win-1');
    });

    test('_parseAndSanitizeToElement properly evaluates this.value', () => {
        const div = document.createElement('div');
        window.buyItem = jest.fn();
        windowManager._parseAndSanitizeToElement("<button onclick='window.buyItem(this.value)' value='123'></button>", div);

        div.querySelector('button').click();

        expect(window.buyItem).toHaveBeenCalledWith('123');
    });

    test('_parseArgs successfully evaluates an object literal', () => {
        const rawArgs = windowManager._parseArgs("'catch-rate', { showShiny: false }", null);
        expect(rawArgs).toEqual(['catch-rate', { showShiny: false }]);

        const rawArgs2 = windowManager._parseArgs("'catch-rate', { showShiny: true }", null);
        expect(rawArgs2).toEqual(['catch-rate', { showShiny: true }]);
    });

    test('_parseArgs successfully evaluates nested structures', () => {
        const rawArgs = windowManager._parseArgs("'catch-rate', { showShiny: { nested: true } }", null);
        expect(rawArgs).toEqual(['catch-rate', { showShiny: { nested: true } }]);
    });

    test('_parseArgs handles this keyword as element reference', () => {
        const input = document.createElement('input');
        input.value = '42';
        const rawArgs = windowManager._parseArgs("'filter', this, this.value", input.value, null, input);
        expect(rawArgs).toEqual(['filter', input, '42']);
    });

    test('_executeInlineEvent executes multi-statement inline handlers and passes this', () => {
        const div = document.createElement('div');
        window.sanitizeMarketNumberInput = jest.fn();
        window.renderPokeMarketSellTab = jest.fn();
        window.showSmartCaptureMode = jest.fn();

        const popup = document.createElement('div');
        popup.id = 'test-multi-popup';
        popup.style.display = 'block';
        document.body.appendChild(popup);

        try {
            windowManager._parseAndSanitizeToElement(
                `<input type="text" value="10" oninput="if(window.sanitizeMarketNumberInput) window.sanitizeMarketNumberInput(this); if(window.renderPokeMarketSellTab) window.renderPokeMarketSellTab('pokemon')" />` +
                `<button onclick="window.showSmartCaptureMode(); document.getElementById('test-multi-popup').style.display = 'none';">Go</button>`,
                div
            );

            const input = div.querySelector('input');
            input.dispatchEvent(new Event('input'));
            expect(window.sanitizeMarketNumberInput).toHaveBeenCalledWith(input);
            expect(window.renderPokeMarketSellTab).toHaveBeenCalledWith('pokemon');

            const btn = div.querySelector('button');
            btn.click();
            expect(window.showSmartCaptureMode).toHaveBeenCalledTimes(1);
            expect(popup.style.display).toBe('none');
        } finally {
            popup.remove();
        }
    });

    test('_parseArgs and _executeInlineEvent support Unicode string arguments', () => {
        const rawArgs = windowManager._parseArgs("'Flabébé — Pokémon League'", null);
        expect(rawArgs).toEqual(['Flabébé — Pokémon League']);

        const div = document.createElement('div');
        window.changeLocation = jest.fn();
        windowManager._parseAndSanitizeToElement(
            `<button onclick="window.changeLocation('Pokémon League — Mina’s Trial')"></button>`,
            div
        );
        div.querySelector('button').click();
        expect(window.changeLocation).toHaveBeenCalledWith('Pokémon League — Mina’s Trial');
    });

    test('getTopmostVisibleWindow returns visible window with highest zIndex and respects modal-overlay', () => {
        const winA = document.createElement('div');
        winA.id = 'main-control-window';
        winA.className = 'floating-window';
        winA.style.display = 'flex';
        const headerA = document.createElement('div');
        headerA.id = 'main-control-header';
        winA.appendChild(headerA);

        const winB = document.createElement('div');
        winB.id = 'party-window';
        winB.className = 'floating-window';
        winB.style.display = 'flex';
        const headerB = document.createElement('div');
        headerB.id = 'party-header';
        winB.appendChild(headerB);

        const overlay = document.createElement('div');
        overlay.id = 'modal-overlay';
        overlay.style.display = 'none';
        const modalBox = document.createElement('div');
        modalBox.id = 'modal-content-box';
        modalBox.className = 'floating-window';
        modalBox.style.display = 'flex';
        const modalHeader = document.createElement('div');
        modalHeader.id = 'modal-header';
        modalBox.appendChild(modalHeader);
        overlay.appendChild(modalBox);

        document.body.append(winA, winB, overlay);

        try {
            windowManager.registerWindow('main-control-window', 'main-control-header');
            windowManager.registerWindow('party-window', 'party-header');
            windowManager.registerWindow('modal-content-box', 'modal-header');

            // party-window was registered after main-control-window, so it has higher zIndex
            expect(windowManager.getTopmostVisibleWindow()).toBe(winB);

            // Focusing main-control-window brings it to top
            windowManager.focusWindow(winA);
            expect(windowManager.getTopmostVisibleWindow()).toBe(winA);

            // Showing modal-overlay makes modal-content-box topmost
            overlay.style.display = 'flex';
            expect(windowManager.getTopmostVisibleWindow()).toBe(modalBox);

            // Hiding modal-overlay falls back to winA
            overlay.style.display = 'none';
            expect(windowManager.getTopmostVisibleWindow()).toBe(winA);
        } finally {
            winA.remove();
            winB.remove();
            overlay.remove();
        }
    });

    test('Ctrl+W closes topmost window or prompts exit when on main-control-window', () => {
        const mainCtrl = document.createElement('div');
        mainCtrl.id = 'main-control-window';
        mainCtrl.className = 'floating-window';
        mainCtrl.style.display = 'flex';
        const mainCtrlHeader = document.createElement('div');
        mainCtrlHeader.id = 'main-control-header';
        mainCtrl.appendChild(mainCtrlHeader);

        const partyWin = document.createElement('div');
        partyWin.id = 'party-window';
        partyWin.className = 'floating-window';
        partyWin.style.display = 'flex';
        const partyHeader = document.createElement('div');
        partyHeader.id = 'party-header';
        partyWin.appendChild(partyHeader);

        document.body.append(mainCtrl, partyWin);

        const prevPromptExitGame = window.promptExitGame;
        window.promptExitGame = jest.fn();

        try {
            windowManager.registerWindow('main-control-window', 'main-control-header');
            windowManager.registerWindow('party-window', 'party-header');
            setupWindowToggles();

            // party-window is topmost -> Ctrl+W closes party-window only
            const ev1 = new KeyboardEvent('keydown', { key: 'w', ctrlKey: true, cancelable: true });
            window.dispatchEvent(ev1);
            expect(ev1.defaultPrevented).toBe(true);
            expect(partyWin.style.display).toBe('none');
            expect(window.promptExitGame).not.toHaveBeenCalled();

            // Now main-control-window is the only visible window -> Ctrl+W prompts exit game
            const ev2 = new KeyboardEvent('keydown', { key: 'w', ctrlKey: true, cancelable: true });
            window.dispatchEvent(ev2);
            expect(ev2.defaultPrevented).toBe(true);
            expect(window.promptExitGame).toHaveBeenCalledTimes(1);
        } finally {
            window.promptExitGame = prevPromptExitGame;
            mainCtrl.remove();
            partyWin.remove();
        }
    });

    test('autoAdjustWidth updates dimensions on new icons and defers when minimized until restored', () => {
        const mainCtrl = document.createElement('div');
        mainCtrl.id = 'main-control-window';
        mainCtrl.className = 'floating-window';
        mainCtrl.style.display = 'flex';
        mainCtrl.style.width = '200px';

        const header = document.createElement('div');
        header.className = 'window-header';
        Object.defineProperty(header, 'offsetHeight', { value: 30, configurable: true });

        const scaler = document.createElement('div');
        scaler.className = 'window-content-scaler';
        let mockWidth = 200;
        let mockHeight = 80;
        scaler.getBoundingClientRect = () => ({ width: mockWidth, height: mockHeight });

        mainCtrl.append(header, scaler);
        document.body.appendChild(mainCtrl);

        try {
            windowManager.autoAdjustWidth('main-control-window');
            expect(mainCtrl._originalWidth).toBe(200);
            expect(mainCtrl.style.height).toBe('');

            // Minimize window and add a new icon (width grows to 300)
            mainCtrl.dataset.minimized = 'true';
            mainCtrl.style.display = 'none';
            mockWidth = 300;
            windowManager.autoAdjustWidth('main-control-window');
            expect(mainCtrl.dataset.needsAutoAdjust).toBe('true');
            expect(mainCtrl._originalWidth).toBe(200);

            // Restore window -> autoAdjustWidth runs and updates width only (never height)
            delete mainCtrl.dataset.minimized;
            windowManager.toggleWindow('main-control-window', true);
            expect(mainCtrl.dataset.needsAutoAdjust).toBeUndefined();
            expect(mainCtrl._originalWidth).toBe(300);
            expect(mainCtrl.style.width).toBe('300px');
            expect(mainCtrl.style.height).toBe('auto');
        } finally {
            mainCtrl.remove();
        }
    });

    test('toggleWindow adjusts party-window height when opened', () => {
        jest.useFakeTimers();
        const partyWin = document.createElement('div');
        partyWin.id = 'party-window';
        partyWin.className = 'floating-window';
        partyWin.style.display = 'none';
        partyWin.adjustHeightForNewContent = jest.fn();
        document.body.appendChild(partyWin);

        try {
            windowManager.toggleWindow('party-window', true);
            jest.advanceTimersByTime(20);
            expect(partyWin.adjustHeightForNewContent).toHaveBeenCalledTimes(1);
        } finally {
            jest.useRealTimers();
            partyWin.remove();
        }
    });

    test('toggleWindow snaps window inside screen boundaries when opened outside', () => {
        const originalInnerWidth = window.innerWidth;
        const originalInnerHeight = window.innerHeight;
        Object.defineProperty(window, 'innerWidth', { value: 1000, configurable: true });
        Object.defineProperty(window, 'innerHeight', { value: 800, configurable: true });

        const win = document.createElement('div');
        win.id = 'snap-test-window';
        win.className = 'floating-window';
        win.style.display = 'none';
        win.style.left = '900px';
        win.style.top = '-40px';
        win.getBoundingClientRect = () => ({ width: 300, height: 200 });
        document.body.appendChild(win);

        try {
            windowManager.toggleWindow('snap-test-window', true);
            expect(win.style.left).toBe('700px');
            expect(win.style.top).toBe('0px');
        } finally {
            Object.defineProperty(window, 'innerWidth', { value: originalInnerWidth, configurable: true });
            Object.defineProperty(window, 'innerHeight', { value: originalInnerHeight, configurable: true });
            win.remove();
        }
    });

    test('toggleWindow resizes oversized window to original size and snaps it into screen', () => {
        const originalInnerWidth = window.innerWidth;
        const originalInnerHeight = window.innerHeight;
        Object.defineProperty(window, 'innerWidth', { value: 1000, configurable: true });
        Object.defineProperty(window, 'innerHeight', { value: 800, configurable: true });

        const win = document.createElement('div');
        win.id = 'oversized-test-window';
        win.className = 'floating-window';
        win.style.display = 'none';
        win.style.left = '800px';
        win.style.top = '600px';
        win.style.width = '1200px';
        win.style.height = '900px';
        win._originalWidth = 400;
        win._originalHeight = 300;
        win.innerHTML = `
            <div class="window-content-container">
                <div class="window-content-scaler" style="transform: scale(3);"></div>
            </div>
        `;

        win.getBoundingClientRect = () => {
            const w = parseFloat(win.style.width) || 1200;
            const h = win.style.height === 'auto' ? 300 : (parseFloat(win.style.height) || 900);
            return { width: w, height: h };
        };
        document.body.appendChild(win);

        try {
            windowManager.toggleWindow('oversized-test-window', true);
            const scaler = win.querySelector('.window-content-scaler');
            expect(scaler.style.transform).toBe('none');
            expect(win.style.width).toBe('400px');
            expect(win.style.height).toBe('auto');
            expect(win.style.left).toBe('600px');
            expect(win.style.top).toBe('500px');
        } finally {
            Object.defineProperty(window, 'innerWidth', { value: originalInnerWidth, configurable: true });
            Object.defineProperty(window, 'innerHeight', { value: originalInnerHeight, configurable: true });
            win.remove();
        }
    });

    test('toggleWindow resets window with distorted aspect ratio to original size and snaps it', () => {
        const originalInnerWidth = window.innerWidth;
        const originalInnerHeight = window.innerHeight;
        Object.defineProperty(window, 'innerWidth', { value: 1000, configurable: true });
        Object.defineProperty(window, 'innerHeight', { value: 800, configurable: true });

        const win = document.createElement('div');
        win.id = 'weird-ratio-window';
        win.className = 'floating-window';
        win.style.display = 'none';
        win.style.left = '100px';
        win.style.top = '50px';
        win.style.width = '400px';
        win.style.height = '750px';
        win._originalWidth = 400;
        win._originalHeight = 300;
        win._originalRatio = 400 / 300;
        win.innerHTML = `
            <div class="window-content-container">
                <div class="window-content-scaler" style="transform: scale(1);"></div>
            </div>
        `;

        win.getBoundingClientRect = () => {
            const w = parseFloat(win.style.width) || 400;
            const h = win.style.height === 'auto' ? 300 : (parseFloat(win.style.height) || 750);
            return { width: w, height: h };
        };
        document.body.appendChild(win);

        try {
            windowManager.toggleWindow('weird-ratio-window', true);
            expect(win.style.width).toBe('400px');
            expect(win.style.height).toBe('auto');
            expect(win.style.left).toBe('100px');
            expect(win.style.top).toBe('50px');
        } finally {
            Object.defineProperty(window, 'innerWidth', { value: originalInnerWidth, configurable: true });
            Object.defineProperty(window, 'innerHeight', { value: originalInnerHeight, configurable: true });
            win.remove();
        }
    });

    test('main-control-window keeps scaler in flow when height is auto and does not falsely trigger weird proportions due to header height', () => {
        const originalInnerWidth = window.innerWidth;
        const originalInnerHeight = window.innerHeight;
        Object.defineProperty(window, 'innerWidth', { value: 1200, configurable: true });
        Object.defineProperty(window, 'innerHeight', { value: 800, configurable: true });

        const win = document.createElement('div');
        win.id = 'main-control-window';
        win.className = 'floating-window';
        win.style.display = 'none';
        win.style.width = 'auto';
        win.style.height = 'auto';
        win.style.left = '100px';
        win.style.top = '20px';
        win.innerHTML = `
            <div id="main-control-header" class="window-header">Main Control</div>
            <div class="window-content-container">
                <div class="window-content-scaler" style="position: relative;">
                    <div id="main-control">Icons</div>
                </div>
            </div>
        `;
        const header = win.querySelector('.window-header');
        Object.defineProperty(header, 'offsetHeight', { value: 34, configurable: true });

        const scaler = win.querySelector('.window-content-scaler');
        scaler.getBoundingClientRect = () => ({ width: 520, height: 56 });
        win.getBoundingClientRect = () => ({
            width: parseFloat(win.style.width) || 520,
            height: scaler.style.position === 'absolute' && win.style.height === 'auto' ? 34 : 90
        });
        document.body.appendChild(win);

        try {
            windowManager.toggleWindow('main-control-window', true);
            expect(scaler.style.position).toBe('relative');
            expect(win.style.width).toBe('520px');

            // Even after explicit height is locked and constrainWindow runs, header height must not trigger reset
            win.style.height = '90px';
            scaler.style.position = 'absolute';
            windowManager.constrainWindow(win);
            expect(win.style.height).toBe('90px');
            expect(scaler.style.position).toBe('absolute');
        } finally {
            Object.defineProperty(window, 'innerWidth', { value: originalInnerWidth, configurable: true });
            Object.defineProperty(window, 'innerHeight', { value: originalInnerHeight, configurable: true });
            win.remove();
        }
    });

    test('_resetToOriginalSize resets scaler position to relative when setting window height to auto', () => {
        const win = document.createElement('div');
        win.id = 'reset-pos-window';
        win.className = 'floating-window';
        win.style.width = '800px';
        win.style.height = '600px';
        win._originalWidth = 400;
        win._originalHeight = 300;
        win.innerHTML = `
            <div class="window-content-container">
                <div class="window-content-scaler" style="position: absolute; top: 0px; left: 0px; transform: scale(2);"></div>
            </div>
        `;
        document.body.appendChild(win);

        try {
            windowManager._resetToOriginalSize(win);
            const scaler = win.querySelector('.window-content-scaler');
            expect(scaler.style.position).toBe('relative');
            expect(scaler.style.transform).toBe('none');
            expect(win.style.height).toBe('auto');
        } finally {
            win.remove();
        }
    });

    test('adjustHeightForNewContent grows height up to maxHeightRatio (1.5 * width) and keeps proportions valid for constrainWindow', () => {
        const originalInnerWidth = window.innerWidth;
        const originalInnerHeight = window.innerHeight;
        Object.defineProperty(window, 'innerWidth', { value: 1920, configurable: true });
        Object.defineProperty(window, 'innerHeight', { value: 1440, configurable: true });
        windowManager.containerWidth = 1920;
        windowManager.containerHeight = 1440;

        const win = document.createElement('div');
        win.id = 'window-challenges';
        win.className = 'floating-window';
        win.style.display = 'flex';
        win.style.width = '800px';
        win.style.height = '400px';
        win.dataset.maxHeightRatio = '1.5';
        win.innerHTML = `
            <div id="window-challenges-header" class="window-header">Progress Challenges</div>
            <div class="window-content-container">
                <div class="window-content-scaler"></div>
            </div>
            <div class="window-resize-handle"></div>
        `;
        document.body.appendChild(win);

        const header = win.querySelector('.window-header');
        const scaler = win.querySelector('.window-content-scaler');
        Object.defineProperty(header, 'offsetHeight', { value: 30, configurable: true });
        Object.defineProperty(win, 'offsetWidth', { value: 800, configurable: true });
        Object.defineProperty(win, 'offsetHeight', { value: 400, configurable: true });

        scaler.getBoundingClientRect = jest.fn(() => ({ width: 800, height: 1500 }));
        win.getBoundingClientRect = jest.fn(() => ({
            width: parseFloat(win.style.width) || 800,
            height: parseFloat(win.style.height) || 1200,
            left: 0,
            top: 0
        }));

        try {
            windowManager.registerWindow('window-challenges', 'window-challenges-header');
            win._originalWidth = 800;
            win._originalHeight = 370;
            win._originalRatio = 800 / 370;

            win.adjustHeightForNewContent();

            expect(win.style.height).toBe('1200px');
            expect(win._originalRatio).toBeCloseTo(800 / 1170, 3);

            // constrainWindow should not reset or shrink the capped window
            windowManager.constrainWindow(win);
            expect(win.style.height).toBe('1200px');
            expect(win.style.width).toBe('800px');
        } finally {
            Object.defineProperty(window, 'innerWidth', { value: originalInnerWidth, configurable: true });
            Object.defineProperty(window, 'innerHeight', { value: originalInnerHeight, configurable: true });
            win.remove();
        }
    });

    test('constrainWindow ignores transient 0x0 viewport without collapsing main-control-window to 0', () => {
        const originalInnerWidth = window.innerWidth;
        const originalInnerHeight = window.innerHeight;
        Object.defineProperty(window, 'innerWidth', { value: 0, configurable: true });
        Object.defineProperty(window, 'innerHeight', { value: 0, configurable: true });

        const win = document.createElement('div');
        win.id = 'main-control-window';
        win.className = 'floating-window';
        win.style.display = 'flex';
        win.style.width = '520px';
        win.style.height = '90px';
        win._originalWidth = 520;
        win._originalHeight = 56;
        win._originalRatio = 520 / 56;
        win.innerHTML = `
            <div id="main-control-header" class="window-header">Main Control</div>
            <div class="window-content-container">
                <div class="window-content-scaler" style="position: absolute; transform: scale(1);"></div>
            </div>
        `;
        win.getBoundingClientRect = () => ({ width: 520, height: 90 });
        document.body.appendChild(win);

        try {
            windowManager.constrainWindow(win);
            const scaler = win.querySelector('.window-content-scaler');
            expect(win.style.width).toBe('520px');
            expect(win.style.height).toBe('90px');
            expect(scaler.style.transform).toBe('scale(1)');
        } finally {
            Object.defineProperty(window, 'innerWidth', { value: originalInnerWidth, configurable: true });
            Object.defineProperty(window, 'innerHeight', { value: originalInnerHeight, configurable: true });
            win.remove();
        }
    });

    test('constrainWindow heals collapsed main-control-window (absolute scaler with auto/0 height)', () => {
        const originalInnerWidth = window.innerWidth;
        const originalInnerHeight = window.innerHeight;
        Object.defineProperty(window, 'innerWidth', { value: 1200, configurable: true });
        Object.defineProperty(window, 'innerHeight', { value: 800, configurable: true });

        const win = document.createElement('div');
        win.id = 'main-control-window';
        win.className = 'floating-window';
        win.style.display = 'flex';
        win.style.width = '520px';
        win.style.height = 'auto';
        win._originalWidth = 520;
        win._originalHeight = 56;
        win._originalRatio = 520 / 56;
        win.innerHTML = `
            <div id="main-control-header" class="window-header">Main Control</div>
            <div class="window-content-container">
                <div class="window-content-scaler" style="position: absolute; top: 0px; left: 0px; transform: scale(1);"></div>
            </div>
        `;
        const header = win.querySelector('.window-header');
        Object.defineProperty(header, 'offsetHeight', { value: 34, configurable: true });
        win.getBoundingClientRect = () => ({
            width: 520,
            height: win.querySelector('.window-content-scaler').style.position === 'absolute' && win.style.height === 'auto' ? 34 : 90
        });
        document.body.appendChild(win);

        try {
            windowManager.constrainWindow(win);
            const scaler = win.querySelector('.window-content-scaler');
            expect(scaler.style.position).toBe('relative');
            expect(scaler.style.transform).toBe('none');
            expect(win.style.height).toBe('auto');
        } finally {
            Object.defineProperty(window, 'innerWidth', { value: originalInnerWidth, configurable: true });
            Object.defineProperty(window, 'innerHeight', { value: originalInnerHeight, configurable: true });
            win.remove();
        }
    });

    test('autoAdjustWidth sets explicit height when scaled and heals collapsed explicit height', () => {
        const win = document.createElement('div');
        win.id = 'main-control-window';
        win.className = 'floating-window';
        win.style.display = 'flex';
        win.style.width = '260px'; // 0.5x scale of 520px
        win.style.height = 'auto';
        win.innerHTML = `
            <div id="main-control-header" class="window-header">Main Control</div>
            <div class="window-content-container">
                <div class="window-content-scaler" style="position: relative;"></div>
            </div>
        `;
        const header = win.querySelector('.window-header');
        Object.defineProperty(header, 'offsetHeight', { value: 34, configurable: true });
        const scaler = win.querySelector('.window-content-scaler');
        scaler.getBoundingClientRect = () => ({ width: 520, height: 56 });
        document.body.appendChild(win);

        try {
            windowManager.autoAdjustWidth('main-control-window');
            expect(scaler.style.position).toBe('absolute');
            expect(scaler.style.transform).toBe('scale(0.5)');
            // headerH (34) + 56 * 0.5 (28) = 62px (not left as 'auto')
            expect(win.style.height).toBe('62px');

            // If height ever gets collapsed to header-only (34px), autoAdjustWidth heals it
            win.style.height = '34px';
            windowManager.autoAdjustWidth('main-control-window');
            expect(win.style.height).toBe('62px');
        } finally {
            win.remove();
        }
    });

    test('adjustHeightForNewContent is a no-op when window is hidden (display: none)', () => {
        const win = document.createElement('div');
        win.id = 'main-control-window';
        win.className = 'floating-window';
        win.style.display = 'none';
        win.style.width = '300px';
        win.style.height = '70px';
        win.innerHTML = `
            <div id="main-control-header" class="window-header">Main Control</div>
            <div class="window-content-container">
                <div class="window-content-scaler" style="position: absolute; transform: scale(0.5);"></div>
            </div>
            <div class="window-resize-handle"></div>
        `;
        document.body.appendChild(win);

        try {
            windowManager.registerWindow('main-control-window', 'main-control-header');
            win._originalWidth = 600;
            win._originalHeight = 80;
            win.adjustHeightForNewContent();

            expect(win.style.width).toBe('300px');
            expect(win.style.height).toBe('70px');
        } finally {
            win.remove();
        }
    });

    test('saveWindowData never persists 0px width or height', () => {
        const win = document.createElement('div');
        win.id = 'main-control-window';
        win.style.width = '0px';
        win.style.height = '0px';
        win.style.left = '10px';
        win.style.top = '20px';
        document.body.appendChild(win);

        try {
            windowManager.saveWindowData('main-control-window');
            expect(window.state?.settings?.windowSettings?.['main-control-window']?.width ?? 'auto').not.toBe('0px');
        } finally {
            win.remove();
        }
    });

    test('toggleWindow ignores corrupted 0px saved width for main-control-window and skips deferred timer when minimized', () => {
        jest.useFakeTimers();
        const prevState = window.state;
        window.state = {
            settings: {
                windowSettings: {
                    'main-control-window': { left: '10px', top: '20px', width: '0px', height: '0px' }
                }
            }
        };

        const win = document.createElement('div');
        win.id = 'main-control-window';
        win.className = 'floating-window';
        win.style.display = 'none';
        win.innerHTML = `
            <div id="main-control-header" class="window-header">Main Control</div>
            <div class="window-content-container">
                <div class="window-content-scaler" style="position: relative;"></div>
            </div>
            <div class="window-resize-handle"></div>
        `;
        const scaler = win.querySelector('.window-content-scaler');
        scaler.getBoundingClientRect = () => ({ width: 520, height: 56 });
        document.body.appendChild(win);

        try {
            windowManager.registerWindow('main-control-window', 'main-control-header');
            win.adjustHeightForNewContent = jest.fn();

            windowManager.toggleWindow('main-control-window', true);
            expect(win.style.width).toBe('520px');
            expect(win.style.height).toBe('auto');

            // Minimize before the 100ms timer fires
            win.style.display = 'none';
            win.dataset.minimized = 'true';
            jest.advanceTimersByTime(150);
            expect(win.adjustHeightForNewContent).not.toHaveBeenCalled();
        } finally {
            jest.useRealTimers();
            window.state = prevState;
            win.remove();
        }
    });

    test('setWindowProportions halves main-view-window width in battle mode while preserving scale, height, and normalized saved width', () => {
        const prevWindowSettings = state.settings.windowSettings;
        state.settings.windowSettings = {};

        const win = document.createElement('div');
        win.id = 'main-view-window';
        win.className = 'floating-window';
        win.style.display = 'flex';
        win.style.width = '640px'; // 0.8x user scale of 800px Hub Mode
        win.innerHTML = `
            <div id="main-view-header" class="window-header">Main View</div>
            <div class="window-content-container">
                <div class="window-content-scaler"></div>
            </div>
        `;
        const header = win.querySelector('.window-header');
        Object.defineProperty(header, 'offsetHeight', { value: 30, configurable: true });
        Object.defineProperty(win, 'offsetWidth', { value: 640, configurable: true });
        document.body.appendChild(win);

        try {
            const scaler = win.querySelector('.window-content-scaler');
            // Enter Hub Mode first at 0.8x scale
            windowManager.setWindowProportions('main-view-window', 1.8, 1);
            expect(win.style.width).toBe('640px');
            expect(scaler.style.transform).toBe('scale(0.8)');

            // Enter Battle Mode: width halves (400 * 0.8 = 320px), scale stays 0.8, height matches (800/5.75)*0.8 + 30
            Object.defineProperty(win, 'offsetWidth', { value: 640, configurable: true });
            windowManager.setWindowProportions('main-view-window', 2.875, 0.5);
            expect(win.style.width).toBe('320px');
            expect(scaler.style.width).toBe('400px');
            expect(scaler.style.transform).toBe('scale(0.8)');
            expect(parseFloat(win.style.height)).toBeCloseTo(30 + (800 / 5.75) * 0.8, 1);
            // Saved width stays normalized to 1x Hub width so reloading restores full Hub Mode
            expect(state.settings.windowSettings['main-view-window'].width).toBe('640px');

            // Return to Hub Mode from Battle Mode
            Object.defineProperty(win, 'offsetWidth', { value: 320, configurable: true });
            windowManager.setWindowProportions('main-view-window', 1.8, 1);
            expect(win.style.width).toBe('640px');
            expect(scaler.style.width).toBe('800px');
            expect(scaler.style.transform).toBe('scale(0.8)');
        } finally {
            state.settings.windowSettings = prevWindowSettings;
            win.remove();
        }
    });
});
