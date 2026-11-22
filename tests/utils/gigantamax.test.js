import fs from 'fs';
import path from 'path';
import {
    GIGANTAMAX_DURATION_MS,
    GIGANTAMAX_HP_MULTIPLIER,
    GIGANTAMAX_EFFECTS,
    isGigantamaxRegion,
    isPokemonGigantamaxed,
    getGigantamaxRemainingMs,
    getGigantamaxHpMultiplier,
    getGigantamaxEffect,
    getGigantamaxTargetIdsForPokemon,
    getGigantamaxStoneRequirements,
    applyGigantamaxForm,
    revertGigantamaxPokemon,
    checkGigantamaxTimers,
} from '../../src/utils/gigantamax.js';
import { hydratePokemonInfo } from '../../src/utils/pokemonDataLoader.js';

describe('Gigantamax Utilities', () => {
    const pokemonInfoPath = path.resolve(process.cwd(), 'data/pokemon_info.json');
    const pokemonInfo = JSON.parse(fs.readFileSync(pokemonInfoPath, 'utf8'));
    let state;

    beforeEach(() => {
        const hydrated = hydratePokemonInfo(pokemonInfo, {}, null);
        state = {
            currentRegionName: 'Galar',
            config: {
                pokemonData: hydrated.pokemonData,
                pokemonMap: hydrated.pokemonMap,
                pokemonInfo,
            },
            backpack: {
                stones: {
                    'Fire Stone': 5,
                    'Flying Stone': 5,
                    'Electric Stone': 5,
                    'Fighting Stone': 5,
                    'Water Stone': 1,
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

    test('isGigantamaxRegion only enables Galar (Reg 8)', () => {
        expect(isGigantamaxRegion('Galar')).toBe(true);
        for (const reg of ['Kanto', 'Johto', 'Hoenn', 'Sinnoh', 'Unova', 'Kalos', 'Alola', 'Hisui', 'Paldea']) {
            expect(isGigantamaxRegion(reg)).toBe(false);
        }
    });

    test('pokemon_info.json links all 33 Gigantamax forms accurately and fixes Urshifu Rapid Strike types', () => {
        const linkedTargets = new Set();
        for (const entry of Object.values(pokemonInfo.pokemon)) {
            if (Array.isArray(entry.gigantamaxForms)) {
                for (const gId of entry.gigantamaxForms) {
                    const gmax = pokemonInfo.pokemon[gId];
                    expect(gmax).toBeDefined();
                    expect(gmax.sprite).toBeTruthy();
                    expect(gmax.folders.length).toBeGreaterThan(0);
                    expect(gmax.name).toMatch(/Gigantamax/i);
                    linkedTargets.add(gId);
                }
            }
        }
        expect(linkedTargets.size).toBe(33);

        // Kantonian Meowth can Gigantamax, Alolan/Galarian cannot
        expect(pokemonInfo.pokemon['0052'].gigantamaxForms).toEqual(['0052.3']);
        expect(pokemonInfo.pokemon['0052.1'].gigantamaxForms).toBeUndefined();
        expect(pokemonInfo.pokemon['0052.2'].gigantamaxForms).toBeUndefined();

        // Standard Pikachu/Eevee can Gigantamax, Partner/Cap forms cannot
        expect(pokemonInfo.pokemon['0025'].gigantamaxForms).toEqual(['0025.2']);
        expect(pokemonInfo.pokemon['0025.10'].gigantamaxForms).toBeUndefined();
        expect(pokemonInfo.pokemon['0133'].gigantamaxForms).toEqual(['0133.1']);
        expect(pokemonInfo.pokemon['0133.2'].gigantamaxForms).toBeUndefined();

        // Urshifu Single Strike vs Rapid Strike types and links
        expect(pokemonInfo.pokemon['0892'].gigantamaxForms).toEqual(['0892.4']);
        expect(pokemonInfo.pokemon['0892.3'].gigantamaxForms).toEqual(['0892.4']);
        expect(pokemonInfo.pokemon['0892.1'].gigantamaxForms).toEqual(['0892.2']);
        expect(pokemonInfo.pokemon['0892.2'].types).toEqual(['Fighting', 'Water']);
        expect(state.config.pokemonMap.get('0892.2').types).toEqual(['Fighting', 'Water']);

        // Missing Galar/Paldea learnsets populated
        expect(pokemonInfo.pokemon['0052'].moveset.Reg8.length).toBeGreaterThanOrEqual(9);
        expect(pokemonInfo.pokemon['0849'].moveset.Reg8.length).toBeGreaterThanOrEqual(12);
        expect(pokemonInfo.pokemon['0892'].moveset.Reg8.some(([, m]) => m === 'Wicked Blow')).toBe(true);
        expect(pokemonInfo.pokemon['0892.1'].moveset.Reg8.some(([, m]) => m === 'Surging Strikes')).toBe(true);
        expect(pokemonInfo.pokemon['0892.2'].moveset.Reg8.some(([, m]) => m === 'Surging Strikes')).toBe(true);
    });

    test('getGigantamaxStoneRequirements charges 1 stone per type for dual-type and 2 for single-type', () => {
        const charizard = { id: 6, types: ['Fire', 'Flying'] };
        const gmaxCharizard = state.config.pokemonMap.get('0006.1');
        const reqChar = getGigantamaxStoneRequirements(charizard, gmaxCharizard, state);
        expect(reqChar.stonesReq).toBe(1);
        expect(reqChar.stoneTypes).toEqual(['Fire', 'Flying']);
        expect(reqChar.canGigantamax).toBe(true);

        const pikachu = { id: 25, types: ['Electric'] };
        const gmaxPikachu = state.config.pokemonMap.get('0025.2');
        const reqPika = getGigantamaxStoneRequirements(pikachu, gmaxPikachu, state);
        expect(reqPika.stonesReq).toBe(2);
        expect(reqPika.stoneTypes).toEqual(['Electric']);
        expect(reqPika.canGigantamax).toBe(true);

        // Urshifu Rapid Strike requires 1 Fighting + 1 Water Stone
        const urshifuRapid = { id: '0892.1', types: ['Fighting', 'Water'] };
        const gmaxUrshifuRapid = state.config.pokemonMap.get('0892.2');
        const reqUrshifu = getGigantamaxStoneRequirements(urshifuRapid, gmaxUrshifuRapid, state);
        expect(reqUrshifu.stonesReq).toBe(1);
        expect(reqUrshifu.stoneTypes).toEqual(['Fighting', 'Water']);
        expect(reqUrshifu.canGigantamax).toBe(true);
    });

    test('applyGigantamaxForm doubles maxHp and currentHp, keeps other stats identical, stacks 5m timer, and reverts cleanly', () => {
        const charizard = {
            uuid: 'gmax-char-1',
            id: 6,
            name: 'Charizard',
            types: ['Fire', 'Flying'],
            level: 50,
            quality: 1.4,
            ivs: { hp: 50, atk: 50, def: 50, spa: 50, spd: 50, spe: 50 },
            currentStats: { hp: 0, atk: 0, def: 0, spa: 0, spd: 0, spe: 0 },
            maxHp: 0,
            currentHp: 0,
            vitamins: {}
        };
        const baseCharizard = state.config.pokemonMap.get('0006');
        // Initialize exact base stats via calculateHP-backed helper
        const { applyPokemonBaseData } = require('../../src/utils/megaEvolution.js');
        applyPokemonBaseData(charizard, baseCharizard, { healToMax: true });
        const baseMaxHp = charizard.maxHp;
        const baseAtk = charizard.currentStats.atk;
        const baseSpe = charizard.currentStats.spe;
        charizard.currentHp = Math.floor(baseMaxHp * 0.75);
        const startCurrentHp = charizard.currentHp;
        state.party.push(charizard);

        const gmaxCharizard = state.config.pokemonMap.get('0006.1');
        const t0 = 2_000_000;

        applyGigantamaxForm(charizard, gmaxCharizard, t0);
        expect(charizard.id).toBe('0006.1');
        expect(charizard.name).toBe('Charizard (Gigantamax)');
        expect(charizard.gmaxOriginalId).toBe(6);
        expect(charizard.gmaxExpiresAt).toBe(t0 + GIGANTAMAX_DURATION_MS);
        expect(charizard.maxHp).toBe(baseMaxHp * GIGANTAMAX_HP_MULTIPLIER);
        expect(charizard.currentStats.hp).toBe(baseMaxHp * GIGANTAMAX_HP_MULTIPLIER);
        expect(charizard.currentHp).toBe(startCurrentHp * GIGANTAMAX_HP_MULTIPLIER);
        expect(charizard.currentStats.atk).toBe(baseAtk);
        expect(charizard.currentStats.spe).toBe(baseSpe);
        expect(isPokemonGigantamaxed(charizard, t0 + 1000)).toBe(true);
        expect(getGigantamaxHpMultiplier(charizard, t0 + 1000)).toBe(2);

        // Second consume stacks +5 min without double-scaling currentHp
        applyGigantamaxForm(charizard, gmaxCharizard, t0 + 60_000);
        expect(charizard.gmaxExpiresAt).toBe(t0 + 2 * GIGANTAMAX_DURATION_MS);
        expect(charizard.maxHp).toBe(baseMaxHp * 2);
        expect(charizard.currentHp).toBe(startCurrentHp * 2);

        // Before expiry: nothing reverts
        expect(checkGigantamaxTimers(state, t0 + 2 * GIGANTAMAX_DURATION_MS - 1)).toEqual([]);

        // At expiry: reverts to base Charizard with original maxHp and halved currentHp
        const reverted = checkGigantamaxTimers(state, t0 + 2 * GIGANTAMAX_DURATION_MS);
        expect(reverted).toHaveLength(1);
        expect(charizard.id).toBe(6);
        expect(charizard.name).toBe('Charizard');
        expect(charizard.gmaxOriginalId).toBeUndefined();
        expect(charizard.gmaxExpiresAt).toBeUndefined();
        expect(charizard.maxHp).toBe(baseMaxHp);
        expect(charizard.currentStats.hp).toBe(baseMaxHp);
        expect(charizard.currentHp).toBe(startCurrentHp);
        expect(isPokemonGigantamaxed(charizard, t0 + 2 * GIGANTAMAX_DURATION_MS)).toBe(false);
        expect(getGigantamaxHpMultiplier(charizard, t0 + 2 * GIGANTAMAX_DURATION_MS)).toBe(1);
    });

    test('revertGigantamaxPokemon keeps 1 HP minimum for living pokemon and 0 for fainted pokemon', () => {
        const p = {
            uuid: 'gmax-edge-1',
            id: 25,
            name: 'Pikachu',
            types: ['Electric'],
            level: 30,
            quality: 1.0,
            ivs: { hp: 20, atk: 20, def: 20, spa: 20, spd: 20, spe: 20 },
            currentStats: { hp: 80, atk: 50, def: 40, spa: 50, spd: 50, spe: 80 },
            maxHp: 80,
            currentHp: 80,
            vitamins: {}
        };
        const gmaxPika = state.config.pokemonMap.get('0025.2');
        applyGigantamaxForm(p, gmaxPika, 1000);
        p.currentHp = 1;
        expect(revertGigantamaxPokemon(p, state)).toBe(true);
        expect(p.currentHp).toBe(1);

        applyGigantamaxForm(p, gmaxPika, 2000);
        p.currentHp = 0;
        expect(revertGigantamaxPokemon(p, state)).toBe(true);
        expect(p.currentHp).toBe(0);
    });

    test('getGigantamaxTargetIdsForPokemon returns targets only in Galar', () => {
        const venusaurData = state.config.pokemonMap.get('0003');
        const mon = { id: 3 };
        expect(getGigantamaxTargetIdsForPokemon(mon, venusaurData, state)).toEqual(['0003.1']);
        state.currentRegionName = 'Kalos';
        expect(getGigantamaxTargetIdsForPokemon(mon, venusaurData, state)).toEqual([]);
    });

    test('GIGANTAMAX_EFFECTS covers all 33 Gigantamax IDs cleanly and activates only while Gigantamaxed', () => {
        const linkedIds = new Set();
        for (const entry of Object.values(pokemonInfo.pokemon)) {
            if (Array.isArray(entry.gigantamaxForms)) {
                entry.gigantamaxForms.forEach(id => linkedIds.add(id));
            }
        }
        expect(Object.keys(GIGANTAMAX_EFFECTS).length).toBe(33);
        for (const id of linkedIds) {
            expect(GIGANTAMAX_EFFECTS[id]).toBeDefined();
            expect(GIGANTAMAX_EFFECTS[id].description).toBeTruthy();
            expect(GIGANTAMAX_EFFECTS[id].description).not.toMatch(/G-Max/i);
        }

        const now = 5_000_000;
        const activeCharizard = { id: '0006.1', gmaxOriginalId: 6, gmaxExpiresAt: now + 60_000 };
        expect(getGigantamaxEffect(activeCharizard, now)).toEqual(GIGANTAMAX_EFFECTS['0006.1']);
        expect(getGigantamaxEffect({ id: '0006.1' }, now)).toBeNull();
        expect(getGigantamaxEffect({ id: '0006.1', gmaxOriginalId: 6, gmaxExpiresAt: now - 1 }, now)).toBeNull();
    });
});
