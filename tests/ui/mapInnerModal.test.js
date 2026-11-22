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

describe('Region Submap / DLC Map Inner Modals (Galar & Paldea)', () => {
    let showMap;
    let openGalarDlcModal;
    let openRegionSubmapModal;
    let WindowManager;
    let uiMod;

    beforeAll(async () => {
        const wmMod = await import('../../src/windowManager.js');
        WindowManager = wmMod.WindowManager;
        const mapMod = await import('../../src/ui/map.js');
        showMap = mapMod.showMap;
        openGalarDlcModal = mapMod.openGalarDlcModal;
        openRegionSubmapModal = mapMod.openRegionSubmapModal;
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

        const ioaImg = doc.querySelector('img[data-submap="ioa"]');
        const tctImg = doc.querySelector('img[data-submap="tct"]');

        expect(ioaImg).not.toBeNull();
        expect(ioaImg.getAttribute('src')).toBe('./Assets/Map/8 Galar Isle of Armor Logo.png');
        expect(ioaImg.style.top).toBe('2%');
        expect(ioaImg.style.left).toBe('2%');
        expect(ioaImg.getAttribute('onclick')).toBe("window.openRegionSubmapModal('Galar', 'ioa')");

        expect(tctImg).not.toBeNull();
        expect(tctImg.getAttribute('src')).toBe('./Assets/Map/8 Galar The Crown Tundra Logo.png');
        expect(tctImg.style.top).toBe('2%');
        expect(tctImg.style.right).toBe('2%');
        expect(tctImg.getAttribute('onclick')).toBe("window.openRegionSubmapModal('Galar', 'tct')");

        uiMod.showModal.mockClear();
        window.currentMapRegion = 'Kanto';
        showMap();
        const kantoHtml = uiMod.showModal.mock.calls[0][1];
        const kantoDoc = new DOMParser().parseFromString(kantoHtml, 'text/html');
        expect(kantoDoc.querySelector('.region-submap-btn')).toBeNull();
    });

    test('showMap renders Indigo Disk (top-left), Teal Mask (top-right), and Area Zero (center) on Paldea map', () => {
        window.currentMapRegion = 'Paldea';
        showMap();

        expect(uiMod.showModal).toHaveBeenCalledTimes(1);
        const paldeaHtml = uiMod.showModal.mock.calls[0][1];
        const doc = new DOMParser().parseFromString(paldeaHtml, 'text/html');

        const indigoImg = doc.querySelector('img[data-submap="indigo_disk"]');
        const tealImg = doc.querySelector('img[data-submap="teal_mask"]');
        const areaZeroImg = doc.querySelector('img[data-submap="area_zero"]');

        expect(indigoImg).not.toBeNull();
        expect(indigoImg.getAttribute('src')).toBe('./Assets/Map/10 Paldea The Indigo Disk Logo.png');
        expect(indigoImg.style.top).toBe('2%');
        expect(indigoImg.style.left).toBe('2%');
        expect(indigoImg.style.width).toBe('21.6%');
        expect(indigoImg.getAttribute('onclick')).toBe("window.openRegionSubmapModal('Paldea', 'indigo_disk')");

        expect(tealImg).not.toBeNull();
        expect(tealImg.getAttribute('src')).toBe('./Assets/Map/10 Paldea The Teal Mask Logo.png');
        expect(tealImg.style.top).toBe('2%');
        expect(tealImg.style.right).toBe('2%');
        expect(tealImg.style.width).toBe('21.6%');
        expect(tealImg.getAttribute('onclick')).toBe("window.openRegionSubmapModal('Paldea', 'teal_mask')");

        expect(areaZeroImg).not.toBeNull();
        expect(areaZeroImg.getAttribute('src')).toBe('./Assets/Map/10 Paldea The Hidden Treasures of Area Zero Logo.png');
        expect(areaZeroImg.style.top).toBe('40%');
        expect(areaZeroImg.style.left).toBe('50%');
        expect(areaZeroImg.style.width).toBe('18%');
        expect(areaZeroImg.getAttribute('onclick')).toBe("window.openRegionSubmapModal('Paldea', 'area_zero')");
    });

    test('WindowManager executes openRegionSubmapModal and openGalarDlcModal inline handlers', () => {
        const wm = new WindowManager();
        const galarSpy = jest.spyOn(window, 'openGalarDlcModal');
        const submapSpy = jest.spyOn(window, 'openRegionSubmapModal');

        wm._executeInlineEvent("window.openGalarDlcModal('ioa')", { stopPropagation: jest.fn() }, document.body);
        expect(galarSpy).toHaveBeenCalledWith('ioa');

        wm._executeInlineEvent("window.openRegionSubmapModal('Paldea', 'indigo_disk')", { stopPropagation: jest.fn() }, document.body);
        expect(submapSpy).toHaveBeenCalledWith('Paldea', 'indigo_disk');

        wm._executeInlineEvent("window.openRegionSubmapModal('Paldea', 'teal_mask')", { stopPropagation: jest.fn() }, document.body);
        expect(submapSpy).toHaveBeenCalledWith('Paldea', 'teal_mask');

        wm._executeInlineEvent("window.openRegionSubmapModal('Paldea', 'area_zero')", { stopPropagation: jest.fn() }, document.body);
        expect(submapSpy).toHaveBeenCalledWith('Paldea', 'area_zero');

        galarSpy.mockRestore();
        submapSpy.mockRestore();
    });

    test('openRegionSubmapModal displays Galar and Paldea inner modal images and closes on backdrop click', () => {
        const overlay = document.getElementById('map-inner-modal-overlay');
        const titleEl = document.getElementById('map-inner-modal-title');
        const contentEl = document.getElementById('map-inner-modal-content');

        openGalarDlcModal('ioa');
        expect(overlay.style.display).toBe('flex');
        expect(titleEl.innerText).toBe('The Isle of Armor');
        expect(contentEl.querySelector('img.region-submap-modal-img')?.getAttribute('src')).toBe('./Assets/Map/8 Galar Isle of Armor.png');

        openGalarDlcModal('tct');
        expect(titleEl.innerText).toBe('The Crown Tundra');
        expect(contentEl.querySelector('img.region-submap-modal-img')?.getAttribute('src')).toBe('./Assets/Map/8 Galar The Crown Tundra.png');

        openRegionSubmapModal('Paldea', 'indigo_disk');
        expect(overlay.style.display).toBe('flex');
        expect(titleEl.innerText).toBe('The Indigo Disk');
        expect(contentEl.querySelector('img.region-submap-modal-img')?.getAttribute('src')).toBe('./Assets/Map/10 Paldea The Indigo Disk.jpg');

        openRegionSubmapModal('Paldea', 'teal_mask');
        expect(titleEl.innerText).toBe('The Teal Mask');
        expect(contentEl.querySelector('img.region-submap-modal-img')?.getAttribute('src')).toBe('./Assets/Map/10 Paldea The Teal Mask.jpg');

        openRegionSubmapModal('Paldea', 'area_zero');
        expect(titleEl.innerText).toBe('The Hidden Treasures of Area Zero');
        expect(contentEl.querySelector('img.region-submap-modal-img')?.getAttribute('src')).toBe('./Assets/Map/10 Paldea The Hidden Treasures of Area Zero.jpg');

        window.handleMapInnerModalBackdropClick({ target: overlay });
        expect(overlay.style.display).toBe('none');
    });

    afterEach(() => {
        document.getElementById = originalGetElementById;
    });
});
