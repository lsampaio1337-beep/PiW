import { jest } from '@jest/globals';

jest.mock('../../src/state.js', () => ({
    state: {
        settings: {
            windowSettings: {
                'main-control-window': { left: '50px', top: '50px', width: '300px', height: '65px' }
            }
        },
        storageRef: { save: jest.fn() }
    },
    globals: {}
}));

jest.mock('../../src/ui.js', () => ({
    showModal: jest.fn()
}));

jest.mock('../../src/ui/cheatControl.js', () => ({
    showCheatControlModal: jest.fn()
}));

jest.mock('../../src/utils/sprites.js', () => ({
    clearAllSpriteCaches: jest.fn()
}));

jest.mock('../../src/utils/saveCrypto.js', () => ({
    encryptSaveText: jest.fn(),
    decryptSaveText: jest.fn()
}));

import { state } from '../../src/state.js';
import { resetWindowLayout } from '../../src/ui/settings.js';

describe('resetWindowLayout', () => {
    let origGetElementById;

    beforeEach(() => {
        origGetElementById = document.getElementById;
        document.getElementById = (id) => document.querySelector(`[id="${id}"]`);
        document.body.innerHTML = `
            <div id="main-control-window" class="floating-window" style="display: flex; width: 300px; height: 65px; left: 50px; top: 50px;">
                <div id="main-control-header" class="window-header">Main Control</div>
                <div class="window-content-container">
                    <div class="window-content-scaler" style="position: absolute; top: 0px; left: 0px; transform: scale(0.5); width: 600px; height: 56px; --original-width: 600px; --original-height: 56px;"></div>
                </div>
            </div>
        `;
        window.windowManager = {
            autoAdjustWidth: jest.fn()
        };
        window.showGameAlert = jest.fn();
    });

    afterEach(() => {
        document.getElementById = origGetElementById;
        delete window.windowManager;
        delete window.showGameAlert;
        document.body.innerHTML = '';
    });

    test('resets scaler positioning back to in-flow relative so main-control-window does not collapse to 0 height', () => {
        const win = document.getElementById('main-control-window');
        const scaler = win.querySelector('.window-content-scaler');
        win._originalWidth = 600;
        win._originalHeight = 56;
        win._originalRatio = 600 / 56;

        resetWindowLayout();

        expect(state.settings.windowSettings).toEqual({});
        expect(win.style.height).toBe('');
        expect(win.style.left).toBe('10%');
        expect(win.style.top).toBe('3%');
        expect(win._originalWidth).toBeUndefined();
        expect(win._originalHeight).toBeUndefined();
        expect(scaler.style.position).toBe('relative');
        expect(scaler.style.transform).toBe('none');
        expect(scaler.style.height).toBe('auto');
        expect(window.windowManager.autoAdjustWidth).toHaveBeenCalledWith('main-control-window');
    });
});
