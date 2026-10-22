import { getLevelFromXP, calculateReqXP, calculateTotalXP } from '../src/mathEngine.js';

describe('mathEngine - getLevelFromXP', () => {
    test('should return level 1 for 0 XP', () => {
        expect(getLevelFromXP(0)).toBe(1);
    });

    test('should return level 1 for negative XP', () => {
        expect(getLevelFromXP(-100)).toBe(1);
    });

    test('should return level 1 when XP is just below the requirement for level 2', () => {
        const xpForLevel2 = calculateTotalXP(2); // total XP needed for level 2
        expect(getLevelFromXP(xpForLevel2 - 1)).toBe(1);
    });

    test('should return level 2 when XP is exactly the requirement for level 2', () => {
        const xpForLevel2 = calculateTotalXP(2);
        expect(getLevelFromXP(xpForLevel2)).toBe(2);
    });

    test('should return level 50 when XP is exactly the requirement for level 50', () => {
        const xpForLevel50 = calculateTotalXP(50);
        expect(getLevelFromXP(xpForLevel50)).toBe(50);
    });

    test('should return level 99 when XP is exactly the requirement for level 99', () => {
        const xpForLevel99 = calculateTotalXP(99);
        expect(getLevelFromXP(xpForLevel99)).toBe(99);
    });

    test('should return level 100 when XP is exactly the requirement for level 100', () => {
        const xpForLevel100 = calculateTotalXP(100);
        expect(getLevelFromXP(xpForLevel100)).toBe(100);
    });

    test('should cap at level 100 for massively high XP', () => {
        const massiveXP = 1_000_000_000;
        expect(getLevelFromXP(massiveXP)).toBe(100);
    });
});
