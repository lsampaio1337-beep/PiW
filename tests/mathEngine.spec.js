import { test, expect } from '@playwright/test';
import { calculateHP } from '../src/mathEngine.js';

test.describe('calculateHP', () => {
    test('should calculate correct HP for normal inputs', () => {
        // Base case, e.g. baseHp=80, ivHp=15, level=10, quality=1.0, vitamins=0
        // (2*80 + 15)*10/100 + 10 + 10 = 17.5 + 20 = 37.5 * 1.0 => floor(37.5) = 37
        const hp = calculateHP(80, 15, 10, 1.0);
        expect(hp).toBe(37);
    });

    test('should factor in quality correctly', () => {
        // baseHp=80, ivHp=15, level=10, quality=1.5
        // 37.5 * 1.5 = 56.25 => floor(56.25) = 56
        const hp = calculateHP(80, 15, 10, 1.5);
        expect(hp).toBe(56);
    });

    test('should factor in vitamins correctly', () => {
        // baseHp=80, ivHp=15, level=10, quality=1.0 => baseFinal = 37
        // vitamins=20 => 37 + floor(37 * 0.20) = 37 + 7 = 44
        const hp = calculateHP(80, 15, 10, 1.0, 20);
        expect(hp).toBe(44);
    });

    test('should handle extremely high inputs without throwing errors', () => {
        // baseHp=255 (Blissey max base HP), ivHp=100 (hypothetical max IV limit), level=100, quality=2.0 (shiny)
        // (2*255 + 100)*100/100 + 100 + 10 = 610 + 110 = 720 * 2.0 = 1440
        const hp = calculateHP(255, 100, 100, 2.0);
        expect(hp).toBe(1440);
    });

    test('should ensure HP does not fall below 1 (boundary minimum)', () => {
        // Even if we provide 0 or negative inputs, HP should be at least 1.
        // baseHp=0, ivHp=0, level=0, quality=0 => baseFinal=0 => returns 1
        expect(calculateHP(0, 0, 0, 0)).toBe(1);

        // Very large negative values to force the formula below 1 before Math.max(1, ...)
        expect(calculateHP(-5000, -100, 100, 1.0)).toBe(1);

        // Zero quality multiplier
        expect(calculateHP(100, 31, 50, 0)).toBe(1);
    });

    test('should calculate correct HP at level 1 with lowest stats', () => {
        // baseHp=1 (Shedinja), ivHp=0, level=1, quality=0.80 (weak)
        // ((2*1 + 0)*1/100 + 1 + 10) * 0.8 = (0.02 + 11) * 0.8 = 11.02 * 0.8 = 8.816 => 8
        const hp = calculateHP(1, 0, 1, 0.80);
        expect(hp).toBe(8);
    });
});
