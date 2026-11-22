import fs from 'fs';
import path from 'path';
import { jest } from '@jest/globals';

const mockShowModal = jest.fn();
const mockUpdateUI = jest.fn();

jest.mock('../../src/state.js', () => ({
    state: {
        currentRegionName: 'Sinnoh',
        party: [],
        storage: [],
        safe: [],
        breeding: [],
        training: [],
        daycare: [],
        backpack: { stones: {} },
        stats: {
            seenSpecies: {},
            caughtSpecies: {},
            caughtSpeciesCount: 0,
            caught: 0,
            caughtShiniesSpecies: {},
            caughtShiniesSpeciesCount: 0
        },
        config: {}
    }
}));

jest.mock('../../src/ui.js', () => ({
    TYPE_COLORS: {
        Normal: '#A8A77A',
        Ghost: '#735797',
        Bug: '#A6B91A'
    },
    showModal: (...args) => mockShowModal(...args),
    updateUI: (...args) => mockUpdateUI(...args)
}));

import { state } from '../../src/state.js';
import { hydratePokemonInfo } from '../../src/utils/pokemonDataLoader.js';
import { evolvePokemon, showPokemonStats } from '../../src/ui/pokemonStats.js';
import { buildEvolutionLineHtml } from '../../src/ui/pokedex.js';

describe('Arceus Variation Evolutions', () => {
    const pokemonInfoPath = path.resolve(process.cwd(), 'data/pokemon_info.json');
    const pokemonInfo = JSON.parse(fs.readFileSync(pokemonInfoPath, 'utf8'));

    beforeEach(() => {
        jest.clearAllMocks();
        const hydrated = hydratePokemonInfo(pokemonInfo, {}, null);
        state.config.pokemonData = hydrated.pokemonData;
        state.config.pokemonMap = hydrated.pokemonMap;
        state.config.pokemonInfo = pokemonInfo;
        state.config.moves = hydrated.moves;
        state.config.types = {};
        state.config.evolutionParents = {};
        state.currentRegionName = 'Sinnoh';
        state.backpack = {
            stones: {
                'Fire Stone': 50,
                'Ghost Stone': 50,
                'Bug Stone': 50,
                'Normal Stone': 50
            }
        };
        state.stats = {
            seenSpecies: {},
            caughtSpecies: {},
            caughtSpeciesCount: 0,
            caught: 0,
            caughtShiniesSpecies: {},
            caughtShiniesSpeciesCount: 0
        };
        global.window.getSpriteUrl = (id) => `sprite_${id}.png`;
        global.window.showGameAlert = jest.fn();
        global.window.closeModal = jest.fn();
        global.window.trackDailyChallenge = jest.fn();
        document.getElementById = jest.fn(() => null);
    });

    test('pokemon_info.json configures Lv. 50 evolutions for Arceus and excludes Arceus (Curse)', () => {
        const baseEvos = pokemonInfo.pokemon['0493'].evolutions;
        expect(Array.isArray(baseEvos)).toBe(true);
        expect(baseEvos).toHaveLength(17);
        expect(baseEvos.every(e => e.level === 50)).toBe(true);
        expect(baseEvos.some(e => e.to === '0493.2')).toBe(false);
        expect(baseEvos.some(e => e.to === '0493.14')).toBe(false);

        expect(pokemonInfo.pokemon['0493.2'].evolutions).toBeUndefined();

        const activeVars = Object.keys(pokemonInfo.pokemon).filter(k => k.startsWith('0493.') && k !== '0493.2');
        expect(activeVars).toHaveLength(18);
        for (const k of activeVars) {
            const evos = pokemonInfo.pokemon[k].evolutions;
            expect(evos).toHaveLength(17);
            expect(evos.every(e => e.level === 50)).toBe(true);
            expect(evos.some(e => e.to === k)).toBe(false);
            expect(evos.some(e => e.to === '0493.2')).toBe(false);
        }
    });

    test('base Arceus shows Multiple Evolutions at Lv. 50 and evolves into Arceus (Ghost) without .1/.10 collision', () => {
        const arceus = {
            uuid: 'arceus-1',
            id: 493,
            name: 'Arceus',
            types: ['Normal'],
            level: 50,
            quality: 0,
            ivs: { hp: 10, atk: 10, def: 10, spa: 10, spd: 10, spe: 10 },
            currentStats: { hp: 100, atk: 100, def: 100, spa: 100, spd: 100, spe: 100 },
            vitamins: {}
        };
        state.party = [arceus];

        showPokemonStats(0, 'party');
        expect(mockShowModal).toHaveBeenCalledTimes(1);
        const modalHtml = mockShowModal.mock.calls[0][1];
        expect(modalHtml).toContain('Multiple Evolutions');
        expect(modalHtml).not.toContain('disabled');

        // Evolve base Arceus -> Arceus (Ghost) ('0493.10')
        evolvePokemon('party', 0, '0493.10');
        expect(arceus.id).toBe('0493.10');
        expect(arceus.name).toBe('Arceus (Ghost)');
        expect(arceus.types).toEqual(['Ghost']);
        expect(state.backpack.stones['Ghost Stone']).toBe(40);
    });

    test('evolved Arceus variation can evolve into any other variation including Arceus (Normal)', () => {
        const arceusGhost = {
            uuid: 'arceus-2',
            id: '0493.10',
            name: 'Arceus (Ghost)',
            types: ['Ghost'],
            level: 50,
            quality: 0,
            ivs: { hp: 10, atk: 10, def: 10, spa: 10, spd: 10, spe: 10 },
            currentStats: { hp: 100, atk: 100, def: 100, spa: 100, spd: 100, spe: 100 },
            vitamins: {}
        };
        state.party = [arceusGhost];

        // Evolve Ghost -> Bug ('0493.1')
        evolvePokemon('party', 0, '0493.1');
        expect(arceusGhost.id).toBe('0493.1');
        expect(arceusGhost.name).toBe('Arceus (Bug)');
        expect(arceusGhost.types).toEqual(['Bug']);
        expect(state.backpack.stones['Bug Stone']).toBe(40);

        // Evolve Bug -> Normal ('0493.14')
        evolvePokemon('party', 0, '0493.14');
        expect(arceusGhost.id).toBe('0493.14');
        expect(arceusGhost.name).toBe('Arceus (Normal)');
        expect(arceusGhost.types).toEqual(['Normal']);
        expect(state.backpack.stones['Normal Stone']).toBe(40);
    });

    test('buildEvolutionLineHtml handles Arceus cyclic evolutions without infinite recursion', () => {
        const arceusData = state.config.pokemonMap.get('0493');
        const html = buildEvolutionLineHtml(arceusData, state);
        expect(html).toContain('Evolution Line');
        expect(html).toContain('Lv.50');
    });
});
