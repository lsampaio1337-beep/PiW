import { normalizeSpawnChances, normalizeRoutesData } from '../../src/utils/chanceUtils.js';

describe('chanceUtils', () => {
    describe('normalizeSpawnChances', () => {
        test('handles single spawn', () => {
            const spawns = [{ pokemonId: 1, chance: 0.5 }];
            normalizeSpawnChances(spawns);
            expect(spawns[0].chance).toBe(1.0);
        });

        test('auto-fixes 3 spawns with 33% each to exact 1/3', () => {
            const spawns = [
                { pokemonId: 1, chance: 0.33 },
                { pokemonId: 4, chance: 0.33 },
                { pokemonId: 7, chance: 0.33 }
            ];
            normalizeSpawnChances(spawns);
            expect(spawns[0].chance).toBeCloseTo(1 / 3, 6);
            expect(spawns[1].chance).toBeCloseTo(1 / 3, 6);
            expect(spawns[2].chance).toBeCloseTo(1 / 3, 6);
            expect(spawns[0].chance + spawns[1].chance + spawns[2].chance).toBeCloseTo(1.0, 6);
        });

        test('auto-fixes 3 spawns with 33%, 33%, 34% equal pattern to exact 1/3', () => {
            const spawns = [
                { pokemonId: 1, chance: 0.33 },
                { pokemonId: 2, chance: 0.33 },
                { pokemonId: 3, chance: 0.34 }
            ];
            normalizeSpawnChances(spawns);
            expect(spawns[0].chance).toBeCloseTo(1 / 3, 6);
            expect(spawns[1].chance).toBeCloseTo(1 / 3, 6);
            expect(spawns[2].chance).toBeCloseTo(1 / 3, 6);
            expect(spawns[0].chance + spawns[1].chance + spawns[2].chance).toBeCloseTo(1.0, 6);
        });

        test('auto-fixes 6 spawns with 17% each to exact 1/6', () => {
            const spawns = [
                { pokemonId: 1, chance: 0.17 },
                { pokemonId: 2, chance: 0.17 },
                { pokemonId: 3, chance: 0.17 },
                { pokemonId: 4, chance: 0.17 },
                { pokemonId: 5, chance: 0.17 },
                { pokemonId: 6, chance: 0.17 }
            ];
            normalizeSpawnChances(spawns);
            for (let i = 0; i < 6; i++) {
                expect(spawns[i].chance).toBeCloseTo(1 / 6, 6);
            }
            const sum = spawns.reduce((a, b) => a + b.chance, 0);
            expect(sum).toBeCloseTo(1.0, 6);
        });

        test('auto-fixes 7 spawns with 14% each to exact 1/7', () => {
            const spawns = Array.from({ length: 7 }, (_, i) => ({ pokemonId: i + 1, chance: 0.14 }));
            normalizeSpawnChances(spawns);
            for (let i = 0; i < 7; i++) {
                expect(spawns[i].chance).toBeCloseTo(1 / 7, 6);
            }
            const sum = spawns.reduce((a, b) => a + b.chance, 0);
            expect(sum).toBeCloseTo(1.0, 6);
        });

        test('auto-fixes 9 spawns with 11% each to exact 1/9', () => {
            const spawns = Array.from({ length: 9 }, (_, i) => ({ pokemonId: i + 1, chance: 0.11 }));
            normalizeSpawnChances(spawns);
            for (let i = 0; i < 9; i++) {
                expect(spawns[i].chance).toBeCloseTo(1 / 9, 6);
            }
            const sum = spawns.reduce((a, b) => a + b.chance, 0);
            expect(sum).toBeCloseTo(1.0, 6);
        });

        test('auto-fixes 8 spawns with 13% each to exact 1/8 (0.125)', () => {
            const spawns = Array.from({ length: 8 }, (_, i) => ({ pokemonId: i + 1, chance: 0.13 }));
            normalizeSpawnChances(spawns);
            for (let i = 0; i < 8; i++) {
                expect(spawns[i].chance).toBeCloseTo(0.125, 6);
            }
            const sum = spawns.reduce((a, b) => a + b.chance, 0);
            expect(sum).toBeCloseTo(1.0, 6);
        });

        test('normalizes uneven route sums to 1.0 while preserving fractions', () => {
            const spawns = [
                { pokemonId: 1, chance: 0.25 },
                { pokemonId: 2, chance: 0.20 },
                { pokemonId: 3, chance: 0.25 },
                { pokemonId: 4, chance: 0.10 },
                { pokemonId: 5, chance: 0.10 }
            ];
            normalizeSpawnChances(spawns);
            const sum = spawns.reduce((a, b) => a + b.chance, 0);
            expect(sum).toBeCloseTo(1.0, 6);
            expect(spawns[0].chance).toBeCloseTo(0.277777, 4);
        });

        test('handles Hisui probability property correctly', () => {
            const pokes = [
                { id: 1, probability: 0.33 },
                { id: 2, probability: 0.33 },
                { id: 3, probability: 0.34 }
            ];
            normalizeSpawnChances(pokes);
            expect(pokes[0].probability).toBeCloseTo(1 / 3, 6);
            expect(pokes[1].probability).toBeCloseTo(1 / 3, 6);
            expect(pokes[2].probability).toBeCloseTo(1 / 3, 6);
        });
    });

    describe('normalizeRoutesData', () => {
        test('normalizes array of routes', () => {
            const routes = [
                {
                    name: 'Test Route',
                    spawns: [
                        { pokemonId: 1, chance: 0.33 },
                        { pokemonId: 2, chance: 0.33 },
                        { pokemonId: 3, chance: 0.33 }
                    ]
                }
            ];
            normalizeRoutesData(routes);
            expect(routes[0].spawns[0].chance).toBeCloseTo(1 / 3, 6);
        });

        test('normalizes object map of routes', () => {
            const routes = {
                'Area 1': {
                    pokes: [
                        { id: 1, probability: 0.5 },
                        { id: 2, probability: 0.6 }
                    ]
                }
            };
            normalizeRoutesData(routes);
            expect(routes['Area 1'].pokes[0].probability + routes['Area 1'].pokes[1].probability).toBeCloseTo(1.0, 6);
        });
    });
});
