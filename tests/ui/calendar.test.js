import { getRewardListForWeek, getRewardForDay } from '../../src/ui/calendar.js';

jest.mock('../../src/state.js', () => ({
    state: {
        stats: {},
        trainer: {},
        backpack: {
            pokeballs: {},
            potions: {}
        }
    }
}));

jest.mock('../../src/ui.js', () => ({
    showModal: jest.fn()
}));

jest.mock('../../src/ui/mainControl.js', () => ({
    updateMainControl: jest.fn()
}));

jest.mock('../../src/ui/dailyChallenges.js', () => ({
    getDailyChallengesHtml: jest.fn(() => '')
}));

jest.mock('../../src/mathEngine.js', () => ({
    getCapacity: jest.fn(),
    getCurrentCount: jest.fn()
}));

describe('calendar.js getRewardListForWeek', () => {
    it('returns 7 rewards for Week 1', () => {
        const rewards = getRewardListForWeek(1);
        expect(rewards.length).toBe(7);
        expect(rewards[0]).toEqual(getRewardForDay(0));
        expect(rewards[6]).toEqual(getRewardForDay(6));
    });

    it('returns 7 rewards for Week 2', () => {
        const rewards = getRewardListForWeek(2);
        expect(rewards.length).toBe(7);
        expect(rewards[0]).toEqual(getRewardForDay(7));
        expect(rewards[6]).toEqual(getRewardForDay(13));
    });

    it('correctly populates the structure of the rewards', () => {
        const rewards = getRewardListForWeek(1);

        // Day 1
        expect(rewards[0]).toEqual({
            items: { "Pokeball": 10 },
            potions: { "Tiny Potion": 10 },
            tokens: 1
        });

        // Day 7
        expect(rewards[6]).toEqual({
            items: { "Masterball": 1 },
            potions: { "Ultra Potion": 2 },
            tokens: 1
        });
    });

    it('correctly calculates Week 2+ rewards', () => {
        const rewards = getRewardListForWeek(2);

        // Day 8 (Day 1 of Week 2, daysClaimed = 7)
        // ultraballs = 15 + 5 * (8 - 7) = 20
        // hyperPotions = 2 * (8 - 7) = 2
        // Wait, d = daysClaimed + 1. So for daysClaimed = 7, d = 8.
        // ultraballs = 15 + 5 * (8 - 7) = 20
        // hyperPotions = 2 * (8 - 7) = 2
        // Wait, getRewardForDay logic:
        // dayOfWeek = daysClaimed % 7 = 0
        // ultraballs = 15 + 5 * (d - 7) = 15 + 5*(8-7) = 20.
        // let's check getRewardForDay directly
        expect(rewards[0]).toEqual({
            items: { "Ultraball": 20 },
            potions: { "Huge Potion": 2 },
            tokens: 1
        });

        // Day 14 (Day 7 of Week 2, daysClaimed = 13)
        // dayOfWeek = 6
        // w = Math.floor(13 / 7) + 1 = 2
        // masterballs = 2, ultraPotions = 4
        expect(rewards[6]).toEqual({
            items: { "Masterball": 2 },
            potions: { "Ultra Potion": 4 },
            tokens: 1
        });
    });
});
