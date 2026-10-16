import { switchView } from '../src/ui.js';
import { state } from '../src/state.js';

jest.mock('../src/ui/market.js', () => ({
    setupMarket: jest.fn()
}));

describe('switchView', () => {
    let mockElements;
    let originalGetElementById;
    let originalQuerySelectorAll;

    beforeEach(() => {
        // Reset state
        state.currentView = null;
        if (!state.config) state.config = {};
        state.config.pokemonData = [
            { id: 1, name: 'Bulbasaur' },
            { id: 4, name: 'Charmander' },
            { id: 7, name: 'Squirtle' }
        ];

        // Mock window manager and global functions
        window.windowManager = {
            setWindowProportions: jest.fn()
        };

        // Create a map to store our mock elements
        mockElements = {
            'view-generic-lab': { id: 'view-generic-lab', style: {}, classList: { contains: () => true } },
            'view-safari-hub': { id: 'view-safari-hub', style: {}, classList: { contains: () => true } },
            'view-battle-arena': { id: 'view-battle-arena', style: {}, classList: { contains: () => true } },
            'view-center-market': { id: 'view-center-market', style: {}, classList: { contains: () => true } },
            'view-gym': { id: 'view-gym', style: {}, classList: { contains: () => true } },
            'view-casino': { id: 'view-casino', style: {}, classList: { contains: () => true } },
            'view-daycare': { id: 'view-daycare', style: {}, classList: { contains: () => true } },
            'main-view-inner-modal-overlay': { id: 'main-view-inner-modal-overlay', style: {} },
            'inner-modal-money-display': { id: 'inner-modal-money-display', style: {} },
            'daycare-intro-text': { id: 'daycare-intro-text', style: {}, innerHTML: '' },
            'btn-daycare-train': { id: 'btn-daycare-train', style: {} },
            'btn-daycare-breed': { id: 'btn-daycare-breed', style: {} }
        };

        // Mock document.getElementById
        originalGetElementById = document.getElementById;
        document.getElementById = jest.fn((id) => {
            if (!mockElements[id]) {
                mockElements[id] = { style: {} };
                // Add classList for some elements if needed, or addEventListener
                mockElements[id].addEventListener = jest.fn();
            }
            return mockElements[id];
        });

        // Mock document.querySelectorAll to return the same objects
        originalQuerySelectorAll = document.querySelectorAll;
        document.querySelectorAll = jest.fn((selector) => {
            if (selector === '.game-view') {
                return [
                    mockElements['view-generic-lab'],
                    mockElements['view-safari-hub'],
                    mockElements['view-battle-arena'],
                    mockElements['view-center-market'],
                    mockElements['view-gym'],
                    mockElements['view-casino'],
                    mockElements['view-daycare']
                ];
            }
            return [];
        });
    });

    afterEach(() => {
        document.getElementById = originalGetElementById;
        document.querySelectorAll = originalQuerySelectorAll;
        jest.clearAllMocks();
    });

    it('should set currentView and hide all .game-view elements', () => {
        switchView('SOME_VIEW');

        expect(state.currentView).toBe('SOME_VIEW');

        // Verify querySelectorAll was called with '.game-view'
        expect(document.querySelectorAll).toHaveBeenCalledWith('.game-view');

        // Check that all game views have display none
        const gameViews = [
            'view-generic-lab', 'view-safari-hub', 'view-battle-arena',
            'view-center-market', 'view-gym', 'view-casino', 'view-daycare'
        ];

        gameViews.forEach(id => {
            expect(mockElements[id].style.display).toBe('none');
        });

        // Check if modal overlay and money display are hidden
        expect(mockElements['main-view-inner-modal-overlay'].style.display).toBe('none');
        expect(mockElements['inner-modal-money-display'].style.display).toBe('none');
    });

    it('should set BATTLE_MODE_RATIO for BATTLE_ARENA', () => {
        switchView('BATTLE_ARENA');
        expect(window.windowManager.setWindowProportions).toHaveBeenCalledWith('main-view-window', 5.75);
    });

    it('should set HUB_MODE_RATIO for other views', () => {
        switchView('SOME_VIEW');
        expect(window.windowManager.setWindowProportions).toHaveBeenCalledWith('main-view-window', 1.8);
    });

    it('should show view-generic-lab for PROF_OAK_LAB', () => {
        switchView('PROF_OAK_LAB');
        expect(mockElements['view-generic-lab'].style.display).toBe('block');
    });

    it('should show view-generic-lab for JOHTO_OAK_LAB', () => {
        switchView('JOHTO_OAK_LAB');
        expect(mockElements['view-generic-lab'].style.display).toBe('block');
    });

    it('should show view-safari-hub for SAFARI_HUB', () => {
        switchView('SAFARI_HUB');
        expect(mockElements['view-safari-hub'].style.display).toBe('flex');
    });

    it('should show view-battle-arena and set flex direction for BATTLE_ARENA', () => {
        switchView('BATTLE_ARENA');
        expect(mockElements['view-battle-arena'].style.display).toBe('flex');
        expect(mockElements['view-battle-arena'].style.flexDirection).toBe('column');
    });

    it('should show view-center-market for POKEMON_CENTER_MARKET', () => {
        switchView('POKEMON_CENTER_MARKET');
        expect(mockElements['view-center-market'].style.display).toBe('block');
    });

    it('should show view-gym for GYM', () => {
        switchView('GYM');
        expect(mockElements['view-gym'].style.display).toBe('block');
    });

    it('should show view-casino for CASINO_HUB', () => {
        switchView('CASINO_HUB');
        expect(mockElements['view-casino'].style.display).toBe('block');
    });

    it('should show view-daycare for DAYCARE_HUB', () => {
        switchView('DAYCARE_HUB');
        expect(mockElements['view-daycare'].style.display).toBe('block');

        // It populates dynamic texts based on required battles
        expect(mockElements['daycare-intro-text'].innerHTML).toContain('Now you are able to use Daycare!');
    });
});
