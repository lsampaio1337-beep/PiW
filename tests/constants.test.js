import {
    WHITE_CANDY_DEFEAT_REQUIREMENT,
    VITAMINS,
    getRegionNumber,
    getRegionLevelCap,
    getRegionBonusXP,
    scaleLevelForRegion,
} from '../src/constants.js';

describe('Constants', () => {
    describe('WHITE_CANDY_DEFEAT_REQUIREMENT', () => {
        it('should be exactly 100', () => {
            expect(WHITE_CANDY_DEFEAT_REQUIREMENT).toBe(100);
        });
    });

    describe('VITAMINS', () => {
        it('should be an array of strings', () => {
            expect(Array.isArray(VITAMINS)).toBe(true);
            VITAMINS.forEach(vitamin => {
                expect(typeof vitamin).toBe('string');
            });
        });

        it('should contain all required vitamins with correct spellings', () => {
            const expectedVitamins = [
                "HP Up",
                "Carbo Speed",
                "Protein Atk",
                "Calcium SpAtk",
                "Iron Def",
                "Zinc SpDef"
            ];

            expect(VITAMINS).toEqual(expectedVitamins);
            expect(VITAMINS).toHaveLength(expectedVitamins.length);
        });
    });

    describe('Region Prestige Helpers', () => {
        it('returns 1-based region numbers and defaults unknown/undefined to 1', () => {
            expect(getRegionNumber('Kanto')).toBe(1);
            expect(getRegionNumber('Johto')).toBe(2);
            expect(getRegionNumber('Hoenn')).toBe(3);
            expect(getRegionNumber('Paldea')).toBe(10);
            expect(getRegionNumber(undefined)).toBe(1);
        });

        it('scales region level caps and +100% XP bonuses per region', () => {
            expect(getRegionLevelCap('Kanto')).toBe(100);
            expect(getRegionLevelCap('Johto')).toBe(200);
            expect(getRegionLevelCap('Paldea')).toBe(1000);

            expect(getRegionBonusXP('Kanto')).toBe(1);
            expect(getRegionBonusXP('Johto')).toBe(2);
            expect(getRegionBonusXP('Hoenn')).toBe(3);
            expect(getRegionBonusXP('Paldea')).toBe(10);
        });

        it('linearly scales enemy levels by region number', () => {
            expect(scaleLevelForRegion(50, 'Kanto')).toBe(50);
            expect(scaleLevelForRegion(50, 'Johto')).toBe(100);
            expect(scaleLevelForRegion(100, 'Johto')).toBe(200);
            expect(scaleLevelForRegion(15, 'Hoenn')).toBe(45);
        });
    });
});
