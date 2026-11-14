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
});
