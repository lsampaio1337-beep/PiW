import { formatQuantity } from '../../../src/ui/backpack/utils.js';

describe('formatQuantity', () => {
    test('returns the original number for quantities less than 1000', () => {
        expect(formatQuantity(0)).toBe(0);
        expect(formatQuantity(500)).toBe(500);
        expect(formatQuantity(999)).toBe(999);
    });

    test('formats quantities in thousands with a "k" suffix', () => {
        expect(formatQuantity(1000)).toBe('1k');
        expect(formatQuantity(1500)).toBe('1k');
        expect(formatQuantity(9999)).toBe('9k');
        expect(formatQuantity(999999)).toBe('999k');
    });

    test('formats quantities in millions with an "m" suffix', () => {
        expect(formatQuantity(1000000)).toBe('1m');
        expect(formatQuantity(1500000)).toBe('1m');
        expect(formatQuantity(9999999)).toBe('9m');
        expect(formatQuantity(1000000000)).toBe('1000m');
    });

    test('handles negative numbers correctly', () => {
        expect(formatQuantity(-100)).toBe(-100);
        expect(formatQuantity(-1500)).toBe(-1500);
    });

    test('handles decimal numbers correctly', () => {
        expect(formatQuantity(999.9)).toBe(999.9);
        expect(formatQuantity(1500.5)).toBe('1k');
        expect(formatQuantity(1500000.5)).toBe('1m');
    });

    test('handles string inputs correctly', () => {
        expect(formatQuantity('500')).toBe('500');
        expect(formatQuantity('1500')).toBe('1k');
        expect(formatQuantity('1500000')).toBe('1m');
    });
});
