import { getSpriteUrl } from '../../src/utils/sprites.js';
import { state } from '../../src/state.js';

// Mock state module
jest.mock('../../src/state.js', () => ({
    state: {
        config: {
            pokemonData: [
                { id: 1, name: 'bulbasaur' },
                { id: 25, name: 'pikachu' },
            ]
        }
    }
}));

describe('getSpriteUrl', () => {
    it('should return correct URL for normal pokemon', () => {
        expect(getSpriteUrl(1)).toBe('Assets/Pokemon Sprites/Natural/Gen5/0001_bulbasaur.png');
        expect(getSpriteUrl(25)).toBe('Assets/Pokemon Sprites/Natural/Gen5/0025_pikachu.png');
    });

    it('should return correct URL for shiny pokemon', () => {
        expect(getSpriteUrl(1, true)).toBe('Assets/Pokemon Sprites/Natural/Gen5/0001_bulbasaur_shiny.png');
        expect(getSpriteUrl(25, true)).toBe('Assets/Pokemon Sprites/Natural/Gen5/0025_pikachu_shiny.png');
    });

    it('should return empty string if pokemon id does not exist', () => {
        expect(getSpriteUrl(999)).toBe('');
    });

    it('should return empty string if pokemonData is not set', () => {
        const originalData = state.config.pokemonData;
        state.config.pokemonData = undefined;
        expect(getSpriteUrl(1)).toBe('');
        state.config.pokemonData = originalData; // Restore
    });

    it('should return empty string if config is not set', () => {
        const originalConfig = state.config;
        state.config = undefined;
        expect(getSpriteUrl(1)).toBe('');
        state.config = originalConfig; // Restore
    });
});
