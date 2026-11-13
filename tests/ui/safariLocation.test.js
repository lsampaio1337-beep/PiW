import { jest } from '@jest/globals';

jest.mock('../../src/ui.js', () => ({
    updateUI: jest.fn(),
    switchView: jest.fn(),
    showModal: jest.fn()
}));

jest.mock('../../src/state.js', () => ({
    state: {},
    globals: {
        battleSystem: null
    },
    swapRegion: jest.fn(),
    checkFinalChallengeCompleted: jest.fn()
}));

import { isSafariLocation } from '../../src/ui/map.js';

describe('isSafariLocation', () => {
    test('identifies safari locations across regions', () => {
        expect(isSafariLocation('Johto Safari Zone')).toBe(true);
        expect(isSafariLocation('Kanto Safari Zone (Johto)')).toBe(true);
        expect(isSafariLocation('Kanto Safari Zone (Kanto)')).toBe(true);
        expect(isSafariLocation('Safari Zone West')).toBe(true);
        expect(isSafariLocation('Safari Zone North')).toBe(true);
        expect(isSafariLocation('Safari Zone East')).toBe(true);
        expect(isSafariLocation('Friend Safari Near Entrance')).toBe(true);
        expect(isSafariLocation('safari')).toBe(true);
    });

    test('returns false for non-safari locations', () => {
        expect(isSafariLocation('Route 1')).toBe(false);
        expect(isSafariLocation('Celadon Casino')).toBe(false);
        expect(isSafariLocation('Pewter Gym')).toBe(false);
        expect(isSafariLocation('')).toBe(false);
        expect(isSafariLocation(null)).toBe(false);
        expect(isSafariLocation(undefined)).toBe(false);
    });
});
