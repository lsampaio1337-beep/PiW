import fs from 'fs';
import path from 'path';
import { getSpriteUrl } from '../src/utils/sprites.js';
import { state } from '../src/state.js';

const REPO_ROOT = path.resolve(__dirname, '..');
const SPRITES_DIR = path.join(REPO_ROOT, 'Assets', 'Pokemon Sprites');
const POKEMON_JSON_PATH = path.join(REPO_ROOT, 'data', 'pokemon.json');
const POKEMON_INFO_PATH = path.resolve(REPO_ROOT, '..', 'Moveset', 'pokemon_info.json');

const VALID_TYPES = new Set([
    'Normal', 'Fire', 'Water', 'Electric', 'Grass', 'Ice', 'Fighting', 'Poison',
    'Ground', 'Flying', 'Psychic', 'Bug', 'Rock', 'Ghost', 'Dragon', 'Dark', 'Steel', 'Fairy'
]);

const PNG_MAGIC = Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]);

jest.mock('../src/state.js', () => ({
    state: {
        config: { pokemonData: [] },
        settings: { legacySprites: false },
        currentRegionName: 'Kanto',
    }
}));

describe('Pokemon Data & Sprite Sync Integrity', () => {
    const folders = fs.readdirSync(SPRITES_DIR)
        .filter(d => d !== 'Extra' && fs.statSync(path.join(SPRITES_DIR, d)).isDirectory())
        .sort();

    const pokemonInfo = JSON.parse(fs.readFileSync(POKEMON_INFO_PATH, 'utf8'));
    const pokemonJson = JSON.parse(fs.readFileSync(POKEMON_JSON_PATH, 'utf8'));

    beforeAll(() => {
        state.config.pokemonData = pokemonJson;
    });

    it('verifies all sprite PNG headers, naming conventions, shiny pairing, and canonical variation IDs', () => {
        const varFormIds = new Map();
        const headerBuf = Buffer.alloc(8);
        let totalPngs = 0;

        for (const folder of folders) {
            const dirPath = path.join(SPRITES_DIR, folder);
            const fileSet = new Set(fs.readdirSync(dirPath));

            for (const file of fileSet) {
                if (!file.endsWith('.png')) continue;
                totalPngs++;

                const fullPath = path.join(dirPath, file);
                const fd = fs.openSync(fullPath, 'r');
                const bytesRead = fs.readSync(fd, headerBuf, 0, 8, 0);
                fs.closeSync(fd);
                expect(bytesRead).toBe(8);
                expect(headerBuf.equals(PNG_MAGIC)).toBe(true);

                const isShiny = file.endsWith('_shiny.png');
                const stem = isShiny ? file.slice(0, -10) : file.slice(0, -4);
                const m = stem.match(/^([^_]+)_(\d{4}(?:\.\d+)?)_(.+)$/);
                expect(m).not.toBeNull();

                const [, , idStr, rest] = m;
                const isVar = idStr.includes('.');

                if (isVar) {
                    expect(rest.includes('_')).toBe(true);
                    const key = `${idStr.split('.')[0]}|${rest}`;
                    if (!varFormIds.has(key)) varFormIds.set(key, new Set());
                    varFormIds.get(key).add(idStr);
                } else {
                    expect(rest.includes('_')).toBe(false);
                }

                if (isShiny) {
                    expect(fileSet.has(`${stem}.png`)).toBe(true);
                } else if (folder !== 'Gen9') {
                    expect(fileSet.has(`${stem}_shiny.png`)).toBe(true);
                }
            }
        }

        expect(totalPngs).toBe(13044);

        const conflicts = Array.from(varFormIds.entries()).filter(([, ids]) => ids.size > 1);
        expect(conflicts).toEqual([]);
    });

    it('verifies pokemon_info.json completeness, uniqueness, and 1-to-1 sprite linkage', () => {
        const entries = Object.entries(pokemonInfo);
        expect(entries.length).toBe(1552);

        const seenIds = new Set();
        const linkedRelPaths = new Set();

        for (const [name, entry] of entries) {
            expect(typeof entry.PokedexNationalID).toBe('string');
            expect(seenIds.has(entry.PokedexNationalID)).toBe(false);
            seenIds.add(entry.PokedexNationalID);

            expect(Array.isArray(entry.PokemonType)).toBe(true);
            expect(entry.PokemonType.length).toBeGreaterThanOrEqual(1);
            expect(entry.PokemonType.length).toBeLessThanOrEqual(2);
            for (const t of entry.PokemonType) {
                expect(VALID_TYPES.has(t)).toBe(true);
            }

            const s = entry.Stats;
            expect(s).toBeDefined();
            const sum = s.hp + s.atk + s.def + s.spa + s.spd + s.spe;
            expect(s.bst).toBe(sum);
            if (name !== 'MissingNo') {
                expect(s.bst).toBeGreaterThan(0);
                expect(entry.Moveset && Object.keys(entry.Moveset).length).toBeGreaterThan(0);
            }

            expect(entry.Sprites).toBeDefined();
            for (const [folder, pair] of Object.entries(entry.Sprites)) {
                for (const kind of ['normal', 'shiny']) {
                    const f = pair[kind];
                    if (!f) continue;
                    const rel = `${folder}/${f}`;
                    expect(fs.existsSync(path.join(SPRITES_DIR, folder, f))).toBe(true);
                    const m = f.match(/^[^_]+_(\d{4}(?:\.\d+)?)_.+\.png$/);
                    expect(m).not.toBeNull();
                    expect(m[1]).toBe(entry.PokedexNationalID);
                    linkedRelPaths.add(rel);
                }
            }
        }

        const diskRelPaths = new Set();
        for (const folder of folders) {
            for (const f of fs.readdirSync(path.join(SPRITES_DIR, folder))) {
                if (f.endsWith('.png')) diskRelPaths.add(`${folder}/${f}`);
            }
        }

        expect(linkedRelPaths.size).toBe(diskRelPaths.size);
        for (const rel of diskRelPaths) {
            expect(linkedRelPaths.has(rel)).toBe(true);
        }
    });

    it('verifies data/pokemon.json aligns with pokemon_info.json and getSpriteUrl resolves every Reg1-Reg5 sprite', () => {
        const infoByName = new Map(Object.entries(pokemonInfo));
        const infoByNumId = new Map();
        for (const [name, entry] of Object.entries(pokemonInfo)) {
            const num = Number(entry.PokedexNationalID);
            if (!infoByNumId.has(num)) infoByNumId.set(num, { name, entry });
        }

        for (const p of pokemonJson) {
            const match = infoByName.has(p.name)
                ? { name: p.name, entry: infoByName.get(p.name) }
                : infoByNumId.get(p.id);
            expect(match).toBeDefined();
            expect(Number(match.entry.PokedexNationalID)).toBe(p.id);
            expect(p.types).toEqual(match.entry.PokemonType);
            expect(p.hp).toBe(match.entry.Stats.hp);
            expect(p.atk).toBe(match.entry.Stats.atk);
            expect(p.def).toBe(match.entry.Stats.def);
            expect(p.spa).toBe(match.entry.Stats.spa);
            expect(p.spd).toBe(match.entry.Stats.spd);
            expect(p.spe).toBe(match.entry.Stats.spe);
        }

        const regionChecks = [
            { region: 'Kanto', legacy: true, maxId: 151 },
            { region: 'Johto', legacy: true, maxId: 251 },
            { region: 'Hoenn', legacy: true, maxId: 386 },
            { region: 'Sinnoh', legacy: true, maxId: 493 },
            { region: 'Unova', legacy: false, maxId: 649 },
        ];

        for (const { region, legacy, maxId } of regionChecks) {
            state.settings = { legacySprites: legacy };
            state.currentRegionName = region;
            for (let id = 1; id <= maxId; id++) {
                for (const shiny of [false, true]) {
                    const url = getSpriteUrl(id, shiny);
                    expect(url).toBeTruthy();
                    expect(fs.existsSync(path.join(REPO_ROOT, url))).toBe(true);
                }
            }
        }
    });

    it('verifies Male vs Female differences in Moveset, Stats, and Sprites for Meowstic, Indeedee, Basculegion, and Oinkologne', () => {
        expect(pokemonInfo['Meowstic'].PokedexNationalID).toBe('0678');
        expect(pokemonInfo['Meowstic (Female)'].PokedexNationalID).toBe('0678.1');
        expect(pokemonInfo['Meowstic (Mega Meowstic)'].PokedexNationalID).toBe('0678.2');
        expect(pokemonInfo['Meowstic (Female)'].Moveset).not.toEqual(pokemonInfo['Meowstic'].Moveset);
        expect(pokemonInfo['Meowstic (Female)'].Sprites['Reg6 XY'].normal).toBe('Gen6XY_0678.1_Meowstic_Female.png');
        expect(pokemonInfo['Meowstic (Female)'].Sprites['Reg8 SS'].normal).toBe('Gen8H_0678.1_Meowstic_Female.png');

        expect(pokemonInfo['Indeedee'].PokedexNationalID).toBe('0876');
        expect(pokemonInfo['Indeedee (Female)'].PokedexNationalID).toBe('0876.1');
        expect(pokemonInfo['Indeedee (Female)'].Stats).toEqual({
            hp: 70, atk: 55, def: 65, spa: 95, spd: 105, spe: 85, bst: 475
        });
        expect(pokemonInfo['Indeedee (Female)'].Stats).not.toEqual(pokemonInfo['Indeedee'].Stats);
        expect(pokemonInfo['Indeedee (Female)'].Moveset).not.toEqual(pokemonInfo['Indeedee'].Moveset);
        expect(pokemonInfo['Indeedee (Female)'].Sprites['Reg8 SS'].normal).toBe('Gen8H_0876.1_Indeedee_Female.png');

        expect(pokemonInfo['Basculegion'].PokedexNationalID).toBe('0902');
        expect(pokemonInfo['Basculegion (Female)'].PokedexNationalID).toBe('0902.1');
        expect(pokemonInfo['Basculegion (Female)'].Stats).toEqual({
            hp: 120, atk: 92, def: 65, spa: 100, spd: 75, spe: 78, bst: 530
        });
        expect(pokemonInfo['Basculegion (Female)'].Sprites['Reg9 LA'].normal).toBe('Gen8LA_0902.1_Basculegion_Female.png');

        expect(pokemonInfo['Oinkologne'].PokedexNationalID).toBe('0916');
        expect(pokemonInfo['Oinkologne (Female)'].PokedexNationalID).toBe('0916.1');
        expect(pokemonInfo['Oinkologne (Female)'].Stats).toEqual({
            hp: 115, atk: 90, def: 70, spa: 59, spd: 90, spe: 65, bst: 489
        });
        expect(pokemonInfo['Oinkologne (Female)'].Sprites['Reg8 SS'].normal).toBe('Gen8H_0916.1_Oinkologne_Female.png');
    });
});
