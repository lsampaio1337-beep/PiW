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
            expect(mainCtrl.style.height).toBe('110px');

            // Minimize window and add a new icon (width grows to 300)
            mainCtrl.dataset.minimized = 'true';
            mainCtrl.style.display = 'none';
            mockWidth = 300;
            windowManager.autoAdjustWidth('main-control-window');
            expect(mainCtrl.dataset.needsAutoAdjust).toBe('true');
            expect(mainCtrl._originalWidth).toBe(200);

            // Restore window -> autoAdjustWidth runs and updates width/height
            delete mainCtrl.dataset.minimized;
            windowManager.toggleWindow('main-control-window', true);
            expect(mainCtrl.dataset.needsAutoAdjust).toBeUndefined();
            expect(mainCtrl._originalWidth).toBe(300);
            expect(mainCtrl.style.width).toBe('300px');
            expect(mainCtrl.style.height).toBe('110px');
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
});
