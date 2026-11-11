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

import { parseMarketQuantity, formatMarketNumber, formatMarketNumberDown } from '../../src/ui/market.js';

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

    test('handles invalid numbers', () => {
        expect(parseMarketQuantity('abc')).toBe(1);
        expect(parseMarketQuantity('0')).toBe(1);
        expect(parseMarketQuantity('-5')).toBe(1);
        expect(parseMarketQuantity('NaN')).toBe(1);
    });

    test('handles floats by flooring the final result', () => {
        expect(parseMarketQuantity('2.5')).toBe(2);
    });
});

describe('formatMarketNumber', () => {
    test('handles zero', () => {
        expect(formatMarketNumber(0)).toBe('0');
    });

    test('handles small numbers', () => {
        expect(formatMarketNumber(42)).toBe('42');
        expect(formatMarketNumber(999)).toBe('999');
    });

    test('handles large numbers with commas', () => {
        expect(formatMarketNumber(1000)).toBe('1,000');
        expect(formatMarketNumber(1000000)).toBe('1,000,000');
        expect(formatMarketNumber(1234567890)).toBe('1,234,567,890');
    });

    test('handles negative numbers', () => {
        expect(formatMarketNumber(-1000)).toBe('-1,000');
        expect(formatMarketNumber(-50)).toBe('-50');
    });

    test('handles floats', () => {
        expect(formatMarketNumber(1000.5)).toBe('1,000.5');
    });
});

describe('formatMarketNumberDown', () => {
    test('handles zero', () => {
        expect(formatMarketNumberDown(0)).toBe('0');
    });

    test('handles small numbers', () => {
        expect(formatMarketNumberDown(42)).toBe('42');
        expect(formatMarketNumberDown(999)).toBe('999');
    });

    test('handles large numbers with commas', () => {
        expect(formatMarketNumberDown(1000)).toBe('1,000');
        expect(formatMarketNumberDown(1000000)).toBe('1,000,000');
        expect(formatMarketNumberDown(1234567890)).toBe('1,234,567,890');
    });

    test('handles negative numbers', () => {
        expect(formatMarketNumberDown(-1000)).toBe('-1,000');
        expect(formatMarketNumberDown(-50)).toBe('-50');
    });

    test('handles floats', () => {
        expect(formatMarketNumberDown(1000.5)).toBe('1,000.5');
    });
});
