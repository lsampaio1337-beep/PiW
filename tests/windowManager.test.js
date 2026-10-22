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
});
