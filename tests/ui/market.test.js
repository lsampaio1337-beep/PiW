// Mock things that market.js imports which rely on browser APIs or global state
// First, mock what needs mocking before the import
jest.mock('../../src/ui.js', () => ({
    formatNumber: jest.fn(n => n.toString()),
    playSound: jest.fn(),
    showToast: jest.fn()
}));

jest.mock('../../src/storage.js', () => ({
    saveGame: jest.fn()
}));

jest.mock('../../src/state.js', () => ({
    state: {
        stats: {
            pokeCoins: 0,
            marketPurchases: {}
        },
        settings: { volume: 50 },
        globalStats: {},
        config: {}
    }
}));

import { parseMarketQuantity } from '../../src/ui/market.js';

describe('parseMarketQuantity', () => {
    test('handles empty or null values', () => {
        expect(parseMarketQuantity()).toBe(1);
        expect(parseMarketQuantity('')).toBe(1);
        expect(parseMarketQuantity(null)).toBe(1);
    });

    test('handles basic numbers', () => {
        expect(parseMarketQuantity('5')).toBe(5);
        expect(parseMarketQuantity('42')).toBe(42);
        expect(parseMarketQuantity('100')).toBe(100);
    });

    test('ignores commas', () => {
        expect(parseMarketQuantity('1,000')).toBe(1000);
        expect(parseMarketQuantity('1,000,000')).toBe(1000000);
    });

    test('trims whitespace', () => {
        expect(parseMarketQuantity('  10  ')).toBe(10);
    });

    test('handles K multiplier', () => {
        expect(parseMarketQuantity('5K')).toBe(5000);
        expect(parseMarketQuantity('1.5K')).toBe(1500);
    });

    test('handles M multiplier', () => {
        expect(parseMarketQuantity('2M')).toBe(2000000);
        expect(parseMarketQuantity('2.5M')).toBe(2500000);
    });

    test('handles B multiplier', () => {
        expect(parseMarketQuantity('3B')).toBe(3000000000);
        expect(parseMarketQuantity('1.2B')).toBe(1200000000);
    });

    test('handles T multiplier', () => {
        expect(parseMarketQuantity('4T')).toBe(4000000000000);
        expect(parseMarketQuantity('1.5T')).toBe(1500000000000);
    });

    test('is case insensitive', () => {
        expect(parseMarketQuantity('5k')).toBe(5000);
        expect(parseMarketQuantity('2m')).toBe(2000000);
        expect(parseMarketQuantity('3b')).toBe(3000000000);
        expect(parseMarketQuantity('4t')).toBe(4000000000000);
    });

    test('handles invalid numbers', () => {
        expect(parseMarketQuantity('abc')).toBe(1);
        expect(parseMarketQuantity('0')).toBe(1);
        expect(parseMarketQuantity('-5')).toBe(1);
        expect(parseMarketQuantity('NaN')).toBe(1);
    });

    test('handles floats by flooring the final result', () => {
        expect(parseMarketQuantity('2.5')).toBe(2);
        expect(parseMarketQuantity('1.234K')).toBe(1234);
    });
});
