import { getBadgeFileName, badgeMapping } from '../../src/utils/badges.js';

describe('getBadgeFileName', () => {
    it('returns the correct filename for a standard region and badge number', () => {
        expect(getBadgeFileName('Kanto', 1)).toBe('Badge_Kanto_1_Boulder_Rock.png');
        expect(getBadgeFileName('Galar', 8)).toBe('Badge_Galar_8_Dragon Badge_Dragon.png');
    });

    it('redirects Unova to Unova2', () => {
        expect(getBadgeFileName('Unova', 1)).toBe('Badge_Unova2_1_BasicBadge_Normal.png');
    });

    it('handles the Johto edge case where badge number is > 8 by mapping to Kanto', () => {
        // Johto 9 should map to Kanto 1
        expect(getBadgeFileName('Johto', 9)).toBe('Badge_Kanto_1_Boulder_Rock.png');
        // Johto 16 should map to Kanto 8
        expect(getBadgeFileName('Johto', 16)).toBe('Badge_Kanto_8_Earth_Ground.png');
    });

    it('returns the fallback format for an unknown region', () => {
        expect(getBadgeFileName('UnknownRegion', 1)).toBe('Badge_UnknownRegion_1.png');
    });

    it('returns the fallback format for an unknown badge number in a known region', () => {
        expect(getBadgeFileName('Kanto', 99)).toBe('Badge_Kanto_99.png');
    });

    it('uses customBadgeMapping if provided', () => {
        const customMapping = {
            'CustomRegion': {
                '1': 'Custom_Badge.png'
            }
        };
        expect(getBadgeFileName('CustomRegion', 1, customMapping)).toBe('Custom_Badge.png');
    });
});
