import { state } from '../../src/state.js';
import { showModal, updateUI } from '../../src/ui.js';
import { showBonusCandyModal } from '../../src/ui/bonusCandy.js';

jest.mock('../../src/state.js', () => ({
    state: {
        stats: {
            bonusCandyDefeats: 0,
            whiteCandies: 0,
            greenCandies: 0,
            purpleCandies: 0,
            blackYellowCandies: 0,
            rainbowCandies: 0,
            candyPurchaseHistory: []
        },
        globalStats: {
            hasSeenBonusCandyModal: true
        }
    }
}));

jest.mock('../../src/ui.js', () => ({
    showModal: jest.fn(),
    updateUI: jest.fn()
}));

describe('Bonus Candy Modal', () => {
    beforeEach(() => {
        jest.clearAllMocks();
        state.stats = {
            bonusCandyDefeats: 42,
            whiteCandies: 2,
            greenCandies: 0,
            purpleCandies: 1,
            blackYellowCandies: 0,
            rainbowCandies: 0,
            candyPurchaseHistory: ['Purple Candy']
        };
        state.globalStats = { hasSeenBonusCandyModal: true };
        window.showGameAlert = jest.fn();
        document.querySelector = jest.fn().mockReturnValue(null);
    });

    test('renders hero header, progress, candy cards with affordability states, and candy bank', () => {
        showBonusCandyModal();

        expect(showModal).toHaveBeenCalledTimes(1);
        const [title, html, windowId, width, height] = showModal.mock.calls[0];
        expect(title).toBe('Bonus Candy');
        expect(windowId).toBe('window-bonus-candy');
        expect(width).toBe('800px');
        expect(height).toBe('auto');

        expect(html).toContain('bc-hero-header');
        expect(html).toContain('42 / 100');
        expect(html).toContain('(58 left)');
        expect(html).toContain('Green Candy');
        expect(html).toContain('Purple Candy');
        expect(html).toContain('Black Yellow Candy');
        expect(html).toContain('Rainbow Candy');
        expect(html).toContain('Trade for 1');
        expect(html).toContain('(Need 1 more)');
        expect(html).toContain('Traded: 1');
        expect(html).toContain('Unspent: 2');
    });

    test('renders empty state in Candy Bank when no candies are owned or traded', () => {
        state.stats.whiteCandies = 0;
        state.stats.candyPurchaseHistory = [];

        showBonusCandyModal();

        const html = showModal.mock.calls[0][1];
        expect(html).toContain('bc-bank-empty');
    });

    test('renders MAXED OUT state when Rainbow Candy reaches cap of 7', () => {
        state.stats.rainbowCandies = 7;

        showBonusCandyModal();

        const html = showModal.mock.calls[0][1];
        expect(html).toContain('MAXED OUT');
        expect(html).toContain('MAXED (7 / 7)');
    });

    test('buyBonusCandy purchases affordable candy and refreshes modal', () => {
        window.buyBonusCandy('Green Candy');

        expect(state.stats.whiteCandies).toBe(1);
        expect(state.stats.greenCandies).toBe(1);
        expect(state.stats.candyPurchaseHistory).toEqual(['Purple Candy', 'Green Candy']);
        expect(updateUI).toHaveBeenCalledTimes(1);
        expect(showModal).toHaveBeenCalledTimes(1);
    });

    test('buyBonusCandy alerts when White Candies are insufficient', () => {
        window.buyBonusCandy('Black Yellow Candy');

        expect(state.stats.blackYellowCandies).toBe(0);
        expect(window.showGameAlert).toHaveBeenCalledWith('Not enough White Candies!', 'window-bonus-candy');
    });
});
