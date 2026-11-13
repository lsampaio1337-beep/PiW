import { jest } from '@jest/globals';

global.state = {
    config: {
        gyms: [
            { name: 'Pewter Gym', leader: 'Brock', trainers: [] }
        ]
    },
    globalStats: {},
    stats: {}
};
window.state = global.state;

const mockBattleSystem = {
    gymState: {
        isActive: false
    },
    stopGymBattle: jest.fn(), stop: jest.fn()
};

global.globals = {
    battleSystem: mockBattleSystem
};
window.globals = global.globals;

jest.mock('../../src/state.js', () => ({
    state: global.state,
    globals: global.globals,
    swapRegion: jest.fn(),
    checkFinalChallengeCompleted: jest.fn()
}));

jest.mock('../../src/ui.js', () => ({
    updateUI: jest.fn(),
    switchView: jest.fn(),
    showModal: jest.fn()
}));

jest.mock('../../src/ui/market.js', () => ({
    setupMarket: jest.fn()
}));

describe('Map Inner Modal Outside Click Behavior', () => {
    let overlay;
    let modal;
    let contentArea;
    let enterBtn;
    let WindowManager;
    let navigateToLocation;

    beforeAll(async () => {
        const wmMod = await import('../../src/windowManager.js');
        WindowManager = wmMod.WindowManager;
        const mapMod = await import('../../src/ui/map.js');
        navigateToLocation = mapMod.navigateToLocation;
    });

    beforeEach(() => {
        document.body.innerHTML = `
            <div id="window-map" class="floating-window">
                <div class="window-header">
                    <span class="window-title">Map</span>
                </div>
                <div class="window-content-container">
                    <div class="window-content-scaler">
                        <div class="content-panel">
                            <div id="interactive-map">
                                <div id="map-marker-pewter-gym" class="map-marker"></div>
                                <div id="map-inner-modal-overlay" style="display: flex;">
                                    <div id="map-inner-modal" class="floating-window">
                                        <div class="window-header">
                                            <span id="map-inner-modal-title">Pewter Gym</span>
                                            <span id="btn-close-map-inner-modal">X</span>
                                        </div>
                                        <div class="window-content-container">
                                            <div id="map-inner-modal-content">
                                                <div id="gym-content-area">
                                                    <button id="btn-enter-gym" class="action-btn action-btn-primary">Enter</button>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        `;

        overlay = document.getElementById('map-inner-modal-overlay');
        modal = document.getElementById('map-inner-modal');
        contentArea = document.getElementById('gym-content-area');
        enterBtn = document.getElementById('btn-enter-gym');

        global.globals.battleSystem.gymState = {
            isActive: false,
            inCombat: false
        };
    });

    test('Closes inner modal when clicking outside inner window (on overlay backdrop) during first phase', () => {
        expect(overlay.style.display).toBe('flex');

        window.handleMapInnerModalBackdropClick({ target: overlay });

        expect(overlay.style.display).toBe('none');
    });

    test('Does NOT close inner modal when clicking inside inner window', () => {
        expect(overlay.style.display).toBe('flex');

        window.handleMapInnerModalBackdropClick({ target: enterBtn });

        expect(overlay.style.display).toBe('flex');
    });

    test('Does NOT close inner modal if gym battle has started (gymState.isActive is true)', () => {
        global.globals.battleSystem.gymState.isActive = true;

        window.handleMapInnerModalBackdropClick({ target: overlay });

        expect(overlay.style.display).toBe('flex');
    });

    test('Does NOT close inner modal if Enter button is no longer displayed (subsequent phases)', () => {
        enterBtn.remove();

        window.handleMapInnerModalBackdropClick({ target: overlay });

        expect(overlay.style.display).toBe('flex');
    });

    test('Clicking a map spot / marker opens gym modal and does NOT close it via bubbling', () => {
        overlay.style.display = 'none';

        // Simulate navigating to location as happens on marker click
        navigateToLocation('Pewter Gym');

        // Modal should now be open
        expect(overlay.style.display).toBe('flex');

        // Clicking the marker itself should NOT trigger handleMapInnerModalBackdropClick to close
        const marker = document.getElementById('map-marker-pewter-gym');
        window.handleMapInnerModalBackdropClick({ target: marker });

        expect(overlay.style.display).toBe('flex');
    });

    test('WindowManager executes handleMapInnerModalBackdropClick without rejection', () => {
        const wm = new WindowManager();
        const dummyEvent = {
            stopPropagation: jest.fn(),
            target: overlay
        };
        const spy = jest.spyOn(window, 'handleMapInnerModalBackdropClick');

        wm._executeInlineEvent('window.handleMapInnerModalBackdropClick(event)', dummyEvent, overlay);

        expect(spy).toHaveBeenCalledWith(dummyEvent);
        spy.mockRestore();
    });

    test('Navigating to a gym does NOT toggle main-view-window, does NOT call updateUI, and keeps focus on map', () => {
        const toggleSpy = jest.fn();
        const focusSpy = jest.fn();
        window.windowManager = {
            toggleWindow: toggleSpy,
            focusWindow: focusSpy
        };

        const uiMod = require('../../src/ui.js');
        uiMod.updateUI.mockClear();

        navigateToLocation('Pewter Gym');

        // main-view-window must NOT be toggled
        expect(toggleSpy).not.toHaveBeenCalledWith('main-view-window', true);
        // updateUI must NOT be called for gym navigation
        expect(uiMod.updateUI).not.toHaveBeenCalled();
        // focusWindow should be called with the map window
        const mapWin = document.getElementById('window-map');
        expect(focusSpy).toHaveBeenCalledWith(mapWin);
    });

    test('Gym modal UI container has responsive gym-ui-container class', () => {
        navigateToLocation('Pewter Gym');

        const uiContainer = document.getElementById('gym-ui-container');
        expect(uiContainer).not.toBeNull();
        expect(uiContainer.classList.contains('gym-ui-container')).toBe(true);
    });
});
