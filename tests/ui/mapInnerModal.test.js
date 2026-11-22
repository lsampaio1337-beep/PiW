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

describe('Galar DLC Map Inner Modals', () => {
    let showMap;
    let openGalarDlcModal;
    let WindowManager;
    let uiMod;

    beforeAll(async () => {
        const wmMod = await import('../../src/windowManager.js');
        WindowManager = wmMod.WindowManager;
        const mapMod = await import('../../src/ui/map.js');
        showMap = mapMod.showMap;
        openGalarDlcModal = mapMod.openGalarDlcModal;
        uiMod = require('../../src/ui.js');
    });

    let originalGetElementById;

    beforeEach(() => {
        originalGetElementById = document.getElementById;
        document.getElementById = (id) => document.querySelector(`[id="${id}"]`);
        global.state.party = [];
        global.state.storage = [];
        global.state.stats = {};
        global.state.globalStats = {};
        global.state.currentRegionName = 'Galar';
        window.showModal = uiMod.showModal;
        uiMod.showModal.mockClear();

        document.body.innerHTML = `
            <div id="window-map" class="floating-window">
                <div class="window-header">
                    <span class="window-title">Map</span>
                </div>
                <div class="window-content-container">
                    <div class="window-content-scaler">
                        <div class="content-panel">
                            <div id="interactive-map">
                                <div id="map-inner-modal-overlay" style="display: none;">
                                    <div id="map-inner-modal" class="floating-window">
                                        <div class="window-header">
                                            <span id="map-inner-modal-title">Gym</span>
                                            <span id="btn-close-map-inner-modal">X</span>
                                        </div>
                                        <div class="window-content-container">
                                            <div id="map-inner-modal-content"></div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        `;
    });

    test('showMap renders IoA on top-left and tCT on top-right only on Galar map', () => {
        window.currentMapRegion = 'Galar';
        showMap();

        expect(uiMod.showModal).toHaveBeenCalledTimes(1);
        const galarHtml = uiMod.showModal.mock.calls[0][1];
        const doc = new DOMParser().parseFromString(galarHtml, 'text/html');

        const ioaImg = doc.querySelector('img[data-dlc="ioa"]');
        const tctImg = doc.querySelector('img[data-dlc="tct"]');

        expect(ioaImg).not.toBeNull();
        expect(ioaImg.getAttribute('src')).toBe('./Assets/Map/8 Galar Isle of Armor Logo.png');
        expect(ioaImg.style.top).toBe('2%');
        expect(ioaImg.style.left).toBe('2%');
        expect(ioaImg.getAttribute('onclick')).toBe("window.openGalarDlcModal('ioa')");

        expect(tctImg).not.toBeNull();
        expect(tctImg.getAttribute('src')).toBe('./Assets/Map/8 Galar The Crown Tundra Logo.png');
        expect(tctImg.style.top).toBe('2%');
        expect(tctImg.style.right).toBe('2%');
        expect(tctImg.getAttribute('onclick')).toBe("window.openGalarDlcModal('tct')");

        uiMod.showModal.mockClear();
        window.currentMapRegion = 'Kanto';
        showMap();
        const kantoHtml = uiMod.showModal.mock.calls[0][1];
        const kantoDoc = new DOMParser().parseFromString(kantoHtml, 'text/html');
        expect(kantoDoc.querySelector('.galar-dlc-btn')).toBeNull();
    });

    test('WindowManager executes openGalarDlcModal inline handlers for ioa and tct', () => {
        const wm = new WindowManager();
        const spy = jest.spyOn(window, 'openGalarDlcModal');

        wm._executeInlineEvent("window.openGalarDlcModal('ioa')", { stopPropagation: jest.fn() }, document.body);
        expect(spy).toHaveBeenCalledWith('ioa');

        wm._executeInlineEvent("window.openGalarDlcModal('tct')", { stopPropagation: jest.fn() }, document.body);
        expect(spy).toHaveBeenCalledWith('tct');

        spy.mockRestore();
    });

    test('openGalarDlcModal displays Isla of Armor for ioa and Crown Tundra for tct and closes on backdrop click', () => {
        const overlay = document.getElementById('map-inner-modal-overlay');
        const titleEl = document.getElementById('map-inner-modal-title');
        const contentEl = document.getElementById('map-inner-modal-content');

        openGalarDlcModal('ioa');
        expect(overlay.style.display).toBe('flex');
        expect(titleEl.innerText).toBe('The Isle of Armor');
        const ioaModalImg = contentEl.querySelector('img.galar-dlc-modal-img');
        expect(ioaModalImg).not.toBeNull();
        expect(ioaModalImg.getAttribute('src')).toBe('./Assets/Map/8 Galar Isle of Armor.png');

        openGalarDlcModal('tct');
        expect(overlay.style.display).toBe('flex');
        expect(titleEl.innerText).toBe('The Crown Tundra');
        const tctModalImg = contentEl.querySelector('img.galar-dlc-modal-img');
        expect(tctModalImg).not.toBeNull();
        expect(tctModalImg.getAttribute('src')).toBe('./Assets/Map/8 Galar The Crown Tundra.png');

        window.handleMapInnerModalBackdropClick({ target: overlay });
        expect(overlay.style.display).toBe('none');
    });

    afterEach(() => {
        document.getElementById = originalGetElementById;
    });
});
