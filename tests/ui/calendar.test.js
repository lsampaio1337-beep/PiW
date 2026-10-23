import { getRewardForDay } from '../../src/ui/calendar.js';

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

// We test the EXACT output format of the function as it currently exists in the real codebase,
// NOT what is listed in the issue ticket's dummy snippet.
describe('getRewardForDay', () => {
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
    });
});
