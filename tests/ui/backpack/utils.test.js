import { formatQuantity } from '../../../src/ui/backpack/utils.js';

describe('formatQuantity', () => {
    test('returns the original number as string for quantities less than 1000', () => {
        expect(formatQuantity(0)).toBe('0');
        expect(formatQuantity(500)).toBe('500');
        expect(formatQuantity(999)).toBe('999');
    });

    test('formats quantities in thousands with a "k" suffix and 1 decimal place', () => {
        expect(formatQuantity(1000)).toBe('1.0k');
        expect(formatQuantity(1500)).toBe('1.5k');
        expect(formatQuantity(9999)).toBe('10.0k');
        expect(formatQuantity(999999)).toBe('1000.0k');
    });

    test('formats quantities in millions with an "m" suffix and 1 decimal place', () => {
        expect(formatQuantity(1000000)).toBe('1.0m');
        expect(formatQuantity(1500000)).toBe('1.5m');
        expect(formatQuantity(9999000)).toBe('10.0m');
        expect(formatQuantity(999999999)).toBe('1000.0m');
    });

    test('formats quantities in billions with a "b" suffix and 1 decimal place', () => {
        expect(formatQuantity(1000000000)).toBe('1.0b');
        expect(formatQuantity(1500000000)).toBe('1.5b');
        expect(formatQuantity(12300000000)).toBe('12.3b');
    });

    test('handles negative numbers correctly', () => {
        expect(formatQuantity(-100)).toBe('-100');
        expect(formatQuantity(-1500)).toBe('-1500');
        expect(formatQuantity(-1000000)).toBe('-1000000');
    });

    test('handles decimal numbers correctly', () => {
        expect(formatQuantity(999.9)).toBe('999.9');
        expect(formatQuantity(1500.5)).toBe('1.5k');
        expect(formatQuantity(1550000.5)).toBe('1.6m');
    });

    test('handles string inputs correctly', () => {
        expect(formatQuantity('500')).toBe('500');
        expect(formatQuantity('1500')).toBe('1.5k');
        expect(formatQuantity('1500000')).toBe('1.5m');
    });
});
