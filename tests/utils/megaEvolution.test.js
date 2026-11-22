import fs from 'fs';
import path from 'path';
import {
    MEGA_EVOLUTION_DURATION_MS,
    isMegaRegion,
    isPokemonMegaEvolved,
    getMegaRemainingMs,
    formatMegaCountdown,
    getMegaTargetIdsForPokemon,
    getMegaStoneRequirements,
    applyMegaForm,
    revertMegaPokemon,
    checkMegaEvolutionTimers
} from '../../src/utils/megaEvolution.js';
import { hydratePokemonInfo } from '../../src/utils/pokemonDataLoader.js';

describe('Mega Evolution Utilities', () => {
    const pokemonInfoPath = path.resolve(process.cwd(), 'data/pokemon_info.json');
    const pokemonInfo = JSON.parse(fs.readFileSync(pokemonInfoPath, 'utf8'));
    let state;

    beforeEach(() => {
        const hydrated = hydratePokemonInfo(pokemonInfo, {}, null);
        state = {
            currentRegionName: 'Kalos',
            config: {
                pokemonData: hydrated.pokemonData,
                pokemonMap: hydrated.pokemonMap,
                pokemonInfo,
            },
            backpack: {
                stones: {
                    'Fire Stone': 5,
                    'Dragon Stone': 5,
                    'Flying Stone': 5,
                    'Water Stone': 5,
                    'Psychic Stone': 1,
                }
            },
            party: [],
            storage: [],
            safe: [],
            breeding: [],
            training: [],
            regions: {}
        };
    });

    test('isMegaRegion only enables Kalos (Reg 6) and Alola (Reg 7)', () => {
        expect(isMegaRegion('Kalos')).toBe(true);
        expect(isMegaRegion('Alola')).toBe(true);
        for (const reg of ['Kanto', 'Johto', 'Hoenn', 'Sinnoh', 'Unova', 'Galar', 'Hisui', 'Paldea']) {
            expect(isMegaRegion(reg)).toBe(false);
        }
    });

    test('pokemon_info.json links all 48 sprite-backed classic Megas and excludes non-Mega/sprite-less forms', () => {
        let totalLinked = 0;
        let baseCount = 0;
        for (const [id, entry] of Object.entries(pokemonInfo.pokemon)) {
            if (Array.isArray(entry.megaEvolutions)) {
                baseCount++;
                totalLinked += entry.megaEvolutions.length;
                for (const megaId of entry.megaEvolutions) {
                    const mega = pokemonInfo.pokemon[megaId];
                    expect(mega).toBeDefined();
                    expect(mega.sprite).toBeTruthy();
                    expect(mega.folders.length).toBeGreaterThan(0);
                    expect(mega.name).toMatch(/^Mega /i);
                }
            }
        }
        expect(baseCount).toBe(46);
        expect(totalLinked).toBe(48);
        expect(pokemonInfo.pokemon['0080.1'].megaEvolutions).toBeUndefined();
        expect(pokemonInfo.pokemon['0003'].megaEvolutions).toEqual(['0003.2']);
        expect(pokemonInfo.pokemon['0006'].megaEvolutions).toEqual(['0006.2', '0006.3']);
    });

    test('getMegaStoneRequirements charges 1 stone per type for dual-type Megas and 2 for single-type Megas', () => {
        const charizard = { id: 6, types: ['Fire', 'Flying'] };
        const megaX = state.config.pokemonMap.get('0006.2'); // Fire / Dragon
        const reqX = getMegaStoneRequirements(charizard, megaX, state);
        expect(reqX.stonesReq).toBe(1);
        expect(reqX.stoneTypes).toEqual(['Fire', 'Dragon']);
        expect(reqX.canMega).toBe(true);

        const blastoise = { id: 9, types: ['Water'] };
        const megaBlastoise = state.config.pokemonMap.get('0009.2'); // Water
        const reqBlast = getMegaStoneRequirements(blastoise, megaBlastoise, state);
        expect(reqBlast.stonesReq).toBe(2);
        expect(reqBlast.stoneTypes).toEqual(['Water']);
        expect(reqBlast.canMega).toBe(true);

        const alakazam = { id: 65, types: ['Psychic'] };
        const megaAlakazam = state.config.pokemonMap.get('0065.1'); // Psychic, only 1 Psychic Stone owned
        const reqAlakazam = getMegaStoneRequirements(alakazam, megaAlakazam, state);
        expect(reqAlakazam.stonesReq).toBe(2);
        expect(reqAlakazam.canMega).toBe(false);
    });

    test('applyMegaForm accumulates 5m timers and checkMegaEvolutionTimers reverts cleanly at zero', () => {
        const charizard = {
            uuid: 'char-1',
            id: 6,
            name: 'Charizard',
            types: ['Fire', 'Flying'],
            level: 50,
            quality: 1.4,
            ivs: { hp: 50, atk: 50, def: 50, spa: 50, spd: 50, spe: 50 },
            currentStats: { hp: 150, atk: 100, def: 90, spa: 120, spd: 95, spe: 110 },
            maxHp: 150,
            currentHp: 112,
            vitamins: {}
        };
        state.party.push(charizard);

        const megaX = state.config.pokemonMap.get('0006.2');
        const megaY = state.config.pokemonMap.get('0006.3');
        const t0 = 1_000_000;

        applyMegaForm(charizard, megaX, t0);
        expect(charizard.id).toBe('0006.2');
        expect(charizard.name).toBe('Mega Charizard X');
        expect(charizard.types).toEqual(['Fire', 'Dragon']);
        expect(charizard.megaOriginalId).toBe(6);
        expect(charizard.megaExpiresAt).toBe(t0 + MEGA_EVOLUTION_DURATION_MS);
        expect(charizard.currentHp).toBe(112);
        expect(isPokemonMegaEvolved(charizard, t0 + 1000)).toBe(true);
        expect(formatMegaCountdown(getMegaRemainingMs(charizard, t0))).toBe('05:00');

        // Second consume stacks +5 min
        applyMegaForm(charizard, megaX, t0 + 60_000);
        expect(charizard.megaExpiresAt).toBe(t0 + 2 * MEGA_EVOLUTION_DURATION_MS);
        expect(formatMegaCountdown(getMegaRemainingMs(charizard, t0 + 60_000))).toBe('09:00');

        // Switching to Mega Y preserves megaOriginalId and stacks +5 min
        applyMegaForm(charizard, megaY, t0 + 60_000);
        expect(charizard.id).toBe('0006.3');
        expect(charizard.types).toEqual(['Fire', 'Flying']);
        expect(charizard.megaOriginalId).toBe(6);
        expect(charizard.megaExpiresAt).toBe(t0 + 3 * MEGA_EVOLUTION_DURATION_MS);

        // Simulate leveling up while Mega-evolved
        charizard.level = 55;

        // Before expiry: nothing reverts
        expect(checkMegaEvolutionTimers(state, t0 + 3 * MEGA_EVOLUTION_DURATION_MS - 1)).toEqual([]);
        expect(charizard.id).toBe('0006.3');

        // At expiry: reverts to original Charizard with Lv. 55 base stats
        const reverted = checkMegaEvolutionTimers(state, t0 + 3 * MEGA_EVOLUTION_DURATION_MS);
        expect(reverted).toHaveLength(1);
        expect(charizard.id).toBe(6);
        expect(charizard.name).toBe('Charizard');
        expect(charizard.types).toEqual(['Fire', 'Flying']);
        expect(charizard.megaOriginalId).toBeUndefined();
        expect(charizard.megaExpiresAt).toBeUndefined();
        expect(charizard.currentHp).toBe(112);
        expect(isPokemonMegaEvolved(charizard, t0 + 3 * MEGA_EVOLUTION_DURATION_MS)).toBe(false);
    });

    test('checkMegaEvolutionTimers also reverts expired Mega Pokemon in storage and inactive regions', () => {
        const storedBlast = {
            uuid: 'blast-1',
            id: 9,
            name: 'Blastoise',
            types: ['Water'],
            level: 40,
            quality: 1.0,
            ivs: { hp: 20, atk: 20, def: 20, spa: 20, spd: 20, spe: 20 },
            currentStats: { hp: 100, atk: 80, def: 80, spa: 80, spd: 80, spe: 80 },
            maxHp: 100,
            currentHp: 100,
            vitamins: {}
        };
        const alolaVenusaur = { ...storedBlast, uuid: 'ven-1', id: 3, name: 'Venusaur', types: ['Grass', 'Poison'], ivs: { ...storedBlast.ivs }, currentStats: { ...storedBlast.currentStats } };

        applyMegaForm(storedBlast, state.config.pokemonMap.get('0009.2'), 1000);
        applyMegaForm(alolaVenusaur, state.config.pokemonMap.get('0003.2'), 1000);

        state.storage.push(storedBlast);
        state.regions.Alola = { party: [alolaVenusaur], storage: [], safe: [], breeding: [], training: [] };

        const reverted = checkMegaEvolutionTimers(state, 1000 + MEGA_EVOLUTION_DURATION_MS);
        expect(reverted).toHaveLength(2);
        expect(storedBlast.id).toBe(9);
        expect(alolaVenusaur.id).toBe(3);
    });

    test('getMegaTargetIdsForPokemon returns targets only in Kalos/Alola', () => {
        const venusaurData = state.config.pokemonMap.get('0003');
        const mon = { id: 3 };
        expect(getMegaTargetIdsForPokemon(mon, venusaurData, state)).toEqual(['0003.2']);
        state.currentRegionName = 'Alola';
        expect(getMegaTargetIdsForPokemon(mon, venusaurData, state)).toEqual(['0003.2']);
        state.currentRegionName = 'Hoenn';
        expect(getMegaTargetIdsForPokemon(mon, venusaurData, state)).toEqual([]);
    });
});
