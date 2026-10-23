import { WHITE_CANDY_DEFEAT_REQUIREMENT, VITAMINS } from '../src/constants.js';

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
});
