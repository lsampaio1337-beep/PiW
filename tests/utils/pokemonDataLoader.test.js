import fs from 'fs';
import path from 'path';
import { hydratePokemonInfo, getLearnsetForRegion } from '../../src/utils/pokemonDataLoader.js';
import { pokedexIndexes } from '../../config/pokedexIndexes.js';
import { getSpriteUrl } from '../../src/utils/sprites.js';
import { state } from '../../src/state.js';

const REPO_ROOT = path.resolve(__dirname, '../..');
const POKEMON_INFO_PATH = path.join(REPO_ROOT, 'data', 'pokemon_info.json');

jest.mock('../../src/state.js', () => ({
    state: {
        config: {},
        settings: { legacySprites: false },
        currentRegionName: 'Kanto',
    }
}));

describe('pokemonDataLoader & runtime pokemon_info.json integration', () => {
    const pokemonInfo = JSON.parse(fs.readFileSync(POKEMON_INFO_PATH, 'utf8'));
    const { pokemonData, pokemonMap, moves } = hydratePokemonInfo(pokemonInfo, {}, pokedexIndexes);

    beforeAll(() => {
        state.config.pokemonInfo = pokemonInfo;
        state.config.pokemonData = pokemonData;
        state.config.pokemonMap = pokemonMap;
        state.config.moves = moves;
    });

    it('hydrates all 1,554 entries with regional dex IDs, stats, types, and learnsets', () => {
        expect(pokemonData.length).toBe(1554);
        expect(pokemonMap.get(1).name).toBe('Bulbasaur');
        expect(pokemonMap.get(1).kanto_id).toBe(1);
        expect(pokemonMap.get('0003.2').name).toBe('Mega Venusaur');
        expect(pokemonMap.get('0003.2').types).toEqual(['Grass', 'Poison']);
        expect(pokemonMap.get('0003.2').hp).toBe(80);
        expect(pokemonMap.get('0003.2').atk).toBe(100);
        expect(pokemonMap.get('0003.2').learnset.length).toBeGreaterThan(0);

        // .10 vs .1 string-key lookup does not collide
        expect(pokemonMap.get('0025.1').name).toBe('Pikachu (Alola Cap)');
        expect(pokemonMap.get('0025.10').name).toBe('Pikachu (Partner Pikachu)');
    });

    it('resolves distinct Male vs Female stats and regional movesets', () => {
        const meowsticM = pokemonMap.get('0678');
        const meowsticF = pokemonMap.get('0678.1');
        expect(getLearnsetForRegion(meowsticM, 'Kalos', moves)).not.toEqual(
            getLearnsetForRegion(meowsticF, 'Kalos', moves)
        );

        const indeedeeM = pokemonMap.get('0876');
        const indeedeeF = pokemonMap.get('0876.1');
        expect(indeedeeF.hp).toBe(70);
        expect(indeedeeM.hp).toBe(60);
        expect(getLearnsetForRegion(indeedeeM, 'Galar', moves)).not.toEqual(
            getLearnsetForRegion(indeedeeF, 'Galar', moves)
        );
    });

    it('resolves getSpriteUrl via pokemonInfo for Gen 1-9 and variations onto real PNG files', () => {
        state.settings.legacySprites = false;
        const idsToTest = [1, 25, '0003.2', '0656', '0678.1', '0876.1', '0902.1', '0916.1', '1025'];
        for (const id of idsToTest) {
            const url = getSpriteUrl(id, false);
            expect(url).toBeTruthy();
            expect(fs.existsSync(path.join(REPO_ROOT, url))).toBe(true);
        }
    });

    it('resolves Reg5 (Unova) movesets and BW2 sprites for Wormadam, Rotom, Therian Trio, and Kyurem', () => {
        const wormadamPlantMoves = getLearnsetForRegion(pokemonMap.get('0413.1'), 'Unova', moves).map(m => m.move);
        expect(wormadamPlantMoves).toContain('Razor Leaf');
        expect(wormadamPlantMoves).toContain('Leaf Storm');

        const rotomBaseMoves = getLearnsetForRegion(pokemonMap.get('0479'), 'Unova', moves).map(m => m.move);
        expect(rotomBaseMoves).toContain('Discharge');
        expect(getLearnsetForRegion(pokemonMap.get('0479.1'), 'Unova', moves).map(m => m.move)).toContain('Air Slash');
        expect(getLearnsetForRegion(pokemonMap.get('0479.2'), 'Unova', moves).map(m => m.move)).toContain('Blizzard');
        expect(getLearnsetForRegion(pokemonMap.get('0479.3'), 'Unova', moves).map(m => m.move)).toContain('Overheat');
        expect(getLearnsetForRegion(pokemonMap.get('0479.4'), 'Unova', moves).map(m => m.move)).toContain('Leaf Storm');
        expect(getLearnsetForRegion(pokemonMap.get('0479.5'), 'Unova', moves).map(m => m.move)).toContain('Hydro Pump');

        const thundurusTMoves = getLearnsetForRegion(pokemonMap.get('0642.2'), 'Unova', moves).map(m => m.move);
        expect(thundurusTMoves).toContain('Thunder');
        expect(thundurusTMoves).not.toContain('Hurricane');

        const landorusTMoves = getLearnsetForRegion(pokemonMap.get('0645.2'), 'Unova', moves).map(m => m.move);
        expect(landorusTMoves).toContain('Earthquake');
        expect(landorusTMoves).not.toContain('Hurricane');

        const kyuremMoves = getLearnsetForRegion(pokemonMap.get('0646'), 'Unova', moves).map(m => m.move);
        expect(kyuremMoves).toContain('Glaciate');
        expect(kyuremMoves).toContain('Ice Beam');

        state.settings.legacySprites = false;
        state.currentRegionName = 'Unova';
        for (const id of ['0641.2', '0642.2', '0645.2', '0646.1', '0646.2']) {
            for (const shiny of [false, true]) {
                const url = getSpriteUrl(id, shiny);
                expect(url).toContain('Reg5 BW/');
                expect(fs.existsSync(path.join(REPO_ROOT, url))).toBe(true);
            }
        }
    });
});
