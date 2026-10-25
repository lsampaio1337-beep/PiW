import { getRewardForDay, getRewardListForWeek } from '../../src/ui/calendar.js';

// Mock dependencies
jest.mock('../../src/state.js', () => ({
    state: {}
}));
jest.mock('../../src/ui.js', () => ({
    showModal: jest.fn()
}));
jest.mock('../../src/ui/mainControl.js', () => ({
    updateMainControl: jest.fn()
}));
jest.mock('../../src/ui/dailyChallenges.js', () => ({
    getDailyChallengesHtml: jest.fn()
}));
jest.mock('../../src/mathEngine.js', () => ({
    getCapacity: jest.fn(),
    getCurrentCount: jest.fn()
}));

describe('calendar logic', () => {
    describe('getRewardForDay', () => {

        describe('Edge Cases and Error Conditions', () => {
            test('Throws error for negative input', () => {
                expect(() => getRewardForDay(-1)).toThrow('daysClaimed must be a non-negative integer');
            });
            test('Throws error for undefined input', () => {
                expect(() => getRewardForDay(undefined)).toThrow('daysClaimed must be a non-negative integer');
            });
            test('Throws error for null input', () => {
                expect(() => getRewardForDay(null)).toThrow('daysClaimed must be a non-negative integer');
            });
            test('Throws error for string input', () => {
                expect(() => getRewardForDay('1')).toThrow('daysClaimed must be a non-negative integer');
            });
            test('Throws error for float input', () => {
                expect(() => getRewardForDay(1.5)).toThrow('daysClaimed must be a non-negative integer');
            });
        });

        describe('Week 1 (daysClaimed 0-6)', () => {
            test('Day 1 (daysClaimed 0)', () => {
                const reward = getRewardForDay(0);
                expect(reward).toEqual({
                    items: { "Pokeball": 10 },
                    potions: { "Tiny Potion": 10 },
                    tokens: 1
                });
            });

            test('Day 2 (daysClaimed 1)', () => {
                const reward = getRewardForDay(1);
                expect(reward).toEqual({
                    items: { "Pokeball": 20 },
                    potions: { "Small Potion": 10 },
                    tokens: 1
                });
            });

            test('Day 3 (daysClaimed 2)', () => {
                const reward = getRewardForDay(2);
                expect(reward).toEqual({
                    items: { "Greatball": 10 },
                    potions: { "Regular Potion": 10 },
                    tokens: 1
                });
            });

            test('Day 4 (daysClaimed 3)', () => {
                const reward = getRewardForDay(3);
                expect(reward).toEqual({
                    items: { "Greatball": 20 },
                    potions: { "Regular Potion": 20 },
                    tokens: 1
                });
            });

            test('Day 5 (daysClaimed 4)', () => {
                const reward = getRewardForDay(4);
                expect(reward).toEqual({
                    items: { "Ultraball": 10 },
                    potions: { "Big Potion": 5 },
                    tokens: 1
                });
            });

            test('Day 6 (daysClaimed 5)', () => {
                const reward = getRewardForDay(5);
                expect(reward).toEqual({
                    items: { "Ultraball": 20 },
                    potions: { "Big Potion": 10 },
                    tokens: 1
                });
            });

            test('Day 7 (daysClaimed 6)', () => {
                const reward = getRewardForDay(6);
                expect(reward).toEqual({
                    items: { "Masterball": 1 },
                    potions: { "Ultra Potion": 2 },
                    tokens: 1
                });
            });
        });

        describe('Week 2+ (daysClaimed >= 7)', () => {
            test('Week 2, Day 1 (daysClaimed 7)', () => {
                const reward = getRewardForDay(7);
                expect(reward).toEqual({
                    items: { "Ultraball": 20 },
                    potions: { "Huge Potion": 2 },
                    tokens: 1
                });
            });

            test('Week 2, Day 6 (daysClaimed 12)', () => {
                const reward = getRewardForDay(12);
                expect(reward).toEqual({
                    items: { "Ultraball": 45 },
                    potions: { "Huge Potion": 12 },
                    tokens: 1
                });
            });

            test('Week 2, Day 7 (daysClaimed 13)', () => {
                const reward = getRewardForDay(13);
                expect(reward).toEqual({
                    items: { "Masterball": 2 },
                    potions: { "Ultra Potion": 4 },
                    tokens: 1
                });
            });

            test('Week 10, Day 7 (daysClaimed 69)', () => {
                const reward = getRewardForDay(69);
                expect(reward).toEqual({
                    items: { "Masterball": 10 },
                    potions: { "Ultra Potion": 20 },
                    tokens: 1
                });
            });
        });
    });

    describe('getRewardListForWeek', () => {
        test('Returns correct list for Week 1', () => {
            const list = getRewardListForWeek(1);
            expect(list.length).toBe(7);

            expect(list[0]).toEqual({
                items: { "Pokeball": 10 },
                potions: { "Tiny Potion": 10 },
                tokens: 1
            });
            expect(list[6]).toEqual({
                items: { "Masterball": 1 },
                potions: { "Ultra Potion": 2 },
                tokens: 1
            });
        });

        test('Returns correct list for Week 2', () => {
            const list = getRewardListForWeek(2);
            expect(list.length).toBe(7);

            expect(list[0]).toEqual({
                items: { "Ultraball": 20 },
                potions: { "Huge Potion": 2 },
                tokens: 1
            });
            expect(list[6]).toEqual({
                items: { "Masterball": 2 },
                potions: { "Ultra Potion": 4 },
                tokens: 1
            });
        });
    });
});
