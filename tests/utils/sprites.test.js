import { getSpriteUrl } from '../../src/utils/sprites.js';
import { state } from '../../src/state.js';

// Mock state module
jest.mock('../../src/state.js', () => ({
    state: {
        config: {
            pokemonData: [
                { id: 1, name: 'bulbasaur' },
                { id: 25, name: 'pikachu' },
                { id: 29, name: 'Nidoran♀' },
                { id: 32, name: 'Nidoran♂' },
                { id: 83, name: "Farfetch'd" },
                { id: 122, name: 'Mr. Mime' },
                { id: 439, name: 'Mime Jr.' },
                { id: 474, name: 'Porygon-Z' },
                { id: 201, name: 'Unown' },
                { id: 386, name: 'Deoxys' },
                { id: 585, name: 'Deerling' },
            ]
        }
    }
}));

describe('getSpriteUrl', () => {
    it('should return correct URL for normal pokemon', () => {
        expect(getSpriteUrl(1)).toBe('Assets/Pokemon Sprites/Reg5 BW/Gen5BW_0001_bulbasaur.png');
        expect(getSpriteUrl(25)).toBe('Assets/Pokemon Sprites/Reg5 BW/Gen5BW_0025_pikachu.png');
    });

    it('should return correct URL for shiny pokemon', () => {
        expect(getSpriteUrl(1, true)).toBe('Assets/Pokemon Sprites/Reg5 BW/Gen5BW_0001_bulbasaur_shiny.png');
        expect(getSpriteUrl(25, true)).toBe('Assets/Pokemon Sprites/Reg5 BW/Gen5BW_0025_pikachu_shiny.png');
    });

    it('should sanitize special characters in pokemon names', () => {
        expect(getSpriteUrl(29)).toBe('Assets/Pokemon Sprites/Reg5 BW/Gen5BW_0029_NidoranF.png');
        expect(getSpriteUrl(32)).toBe('Assets/Pokemon Sprites/Reg5 BW/Gen5BW_0032_NidoranM.png');
        expect(getSpriteUrl(83)).toBe('Assets/Pokemon Sprites/Reg5 BW/Gen5BW_0083_Farfetchd.png');
        expect(getSpriteUrl(122)).toBe('Assets/Pokemon Sprites/Reg5 BW/Gen5BW_0122_MrMime.png');
        expect(getSpriteUrl(439)).toBe('Assets/Pokemon Sprites/Reg5 BW/Gen5BW_0439_MimeJr.png');
        expect(getSpriteUrl(474)).toBe('Assets/Pokemon Sprites/Reg5 BW/Gen5BW_0474_PorygonZ.png');
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

    it('should return Reg1-Reg4 URLs when legacySprites is enabled for regions 1-4', () => {
        state.settings = { legacySprites: true };

        state.currentRegionName = 'Kanto';
        expect(getSpriteUrl(1)).toBe('Assets/Pokemon Sprites/Reg1 RBY/Gen1RBY_0001_bulbasaur.png');

        state.currentRegionName = 'Johto';
        expect(getSpriteUrl(1)).toBe('Assets/Pokemon Sprites/Reg2 C/Gen2C_0001_bulbasaur.png');

        state.currentRegionName = 'Hoenn';
        expect(getSpriteUrl(1)).toBe('Assets/Pokemon Sprites/Reg3 E/Gen3E_0001_bulbasaur.png');

        state.currentRegionName = 'Sinnoh';
        expect(getSpriteUrl(1, true)).toBe('Assets/Pokemon Sprites/Reg4 P/Gen4P_0001_bulbasaur_shiny.png');

        state.currentRegionName = 'Unova';
        expect(getSpriteUrl(1)).toBe('Assets/Pokemon Sprites/Reg5 BW/Gen5BW_0001_bulbasaur.png');

        state.settings.legacySprites = false;
        state.currentRegionName = 'Kanto';
        expect(getSpriteUrl(1)).toBe('Assets/Pokemon Sprites/Reg5 BW/Gen5BW_0001_bulbasaur.png');
    });

    it('should use first variation as standard when a pokemon has variations and no standard form', () => {
        expect(getSpriteUrl(201)).toBe('Assets/Pokemon Sprites/Reg5 BW/Gen5BW_0201.1_Unown_A.png');
        expect(getSpriteUrl(201, true)).toBe('Assets/Pokemon Sprites/Reg5 BW/Gen5BW_0201.1_Unown_A_shiny.png');
        expect(getSpriteUrl(386)).toBe('Assets/Pokemon Sprites/Reg5 BW/Gen5BW_0386.1_Deoxys_Attack.png');
        expect(getSpriteUrl(585)).toBe('Assets/Pokemon Sprites/Reg5 BW/Gen5BW_0585.1_Deerling_Autumn.png');

        state.settings = { legacySprites: true };
        state.currentRegionName = 'Hoenn';
        expect(getSpriteUrl(386)).toBe('Assets/Pokemon Sprites/Reg3 E/Gen3E_0386.4_Deoxys_Speed.png');
        state.settings.legacySprites = false;
    });
});
