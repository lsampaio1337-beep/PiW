import fs from 'fs';
import path from 'path';
import { getSpriteUrl } from '../src/utils/sprites.js';
import { state } from '../src/state.js';
import { pokedexIndexes } from '../config/pokedexIndexes.js';

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

    const folderById = new Map(pokemonInfo.folders.map(f => [f.id, f]));
    const folderByName = new Map(pokemonInfo.folders.map(f => [f.folder, f]));

    function resolvePokemonEntry(id) {
        const entry = pokemonInfo.pokemon[id];
        if (!entry) return null;
        const baseId = id.split('.')[0];
        const base = id.includes('.') ? pokemonInfo.pokemon[baseId] : null;
        return {
            id,
            name: entry.name,
            types: entry.types ?? base?.types,
            stats: entry.stats ?? base?.stats,
            sprite: entry.sprite,
            folders: entry.folders,
            moveset: entry.moveset ?? base?.moveset ?? {},
        };
    }

    beforeAll(() => {
        state.config.pokemonData = pokemonJson;
    });

    it('verifies all sprite PNG headers, uniform folder prefixes, naming conventions, shiny pairing, and canonical variation IDs', () => {
        const varFormIds = new Map();
        const headerBuf = Buffer.alloc(8);
        let totalPngs = 0;

        for (const folder of folders) {
            const folderMeta = folderByName.get(folder);
            expect(folderMeta).toBeDefined();

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

                const [, prefix, idStr, rest] = m;
                expect(prefix).toBe(folderMeta.prefix);

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
                    expect(folderMeta.hasShiny).toBe(true);
                    expect(fileSet.has(`${stem}.png`)).toBe(true);
                } else if (folderMeta.hasShiny) {
                    expect(fileSet.has(`${stem}_shiny.png`)).toBe(true);
                }
            }
        }

        expect(totalPngs).toBe(13068);

        const conflicts = Array.from(varFormIds.entries()).filter(([, ids]) => ids.size > 1);
        expect(conflicts).toEqual([]);
    });

    it('verifies normalized pokemon_info.json completeness, move references, and 1-to-1 sprite reconstruction', () => {
        expect(Array.isArray(pokemonInfo.folders)).toBe(true);
        expect(pokemonInfo.folders.length).toBe(11);
        expect(pokemonInfo.moves && typeof pokemonInfo.moves).toBe('object');
        expect(Object.keys(pokemonInfo.moves).length).toBe(619);

        const entries = Object.entries(pokemonInfo.pokemon);
        expect(entries.length).toBe(1552);

        const linkedRelPaths = new Set();
        const seenNames = new Set();

        for (const [id, rawEntry] of entries) {
            expect(/^\d{4}(?:\.\d+)?$/.test(id)).toBe(true);
            expect(seenNames.has(rawEntry.name)).toBe(false);
            seenNames.add(rawEntry.name);

            const resolved = resolvePokemonEntry(id);
            expect(Array.isArray(resolved.types)).toBe(true);
            expect(resolved.types.length).toBeGreaterThanOrEqual(1);
            expect(resolved.types.length).toBeLessThanOrEqual(2);
            for (const t of resolved.types) {
                expect(VALID_TYPES.has(t)).toBe(true);
            }

            expect(Array.isArray(resolved.stats)).toBe(true);
            expect(resolved.stats.length).toBe(7);
            const [hp, atk, def, spa, spd, spe, bst] = resolved.stats;
            expect(bst).toBe(hp + atk + def + spa + spd + spe);

            if (id !== '0000') {
                expect(bst).toBeGreaterThan(0);
                expect(Object.keys(resolved.moveset).length).toBeGreaterThan(0);
                for (const regArr of Object.values(resolved.moveset)) {
                    expect(Array.isArray(regArr)).toBe(true);
                    for (const tuple of regArr) {
                        expect(Array.isArray(tuple)).toBe(true);
                        expect(tuple.length).toBe(2);
                        expect(pokemonInfo.moves[tuple[1]]).toBeDefined();
                    }
                }
            }

            expect(Array.isArray(resolved.folders)).toBe(true);
            if (resolved.sprite) {
                expect(resolved.folders.length).toBeGreaterThan(0);
                for (const fId of resolved.folders) {
                    const fm = folderById.get(fId);
                    expect(fm).toBeDefined();
                    const normalFile = `${fm.prefix}_${id}_${resolved.sprite}.png`;
                    const normalRel = `${fm.folder}/${normalFile}`;
                    expect(fs.existsSync(path.join(SPRITES_DIR, fm.folder, normalFile))).toBe(true);
                    linkedRelPaths.add(normalRel);

                    if (fm.hasShiny) {
                        const shinyFile = `${fm.prefix}_${id}_${resolved.sprite}_shiny.png`;
                        const shinyRel = `${fm.folder}/${shinyFile}`;
                        expect(fs.existsSync(path.join(SPRITES_DIR, fm.folder, shinyFile))).toBe(true);
                        linkedRelPaths.add(shinyRel);
                    }
                }
            } else {
                expect(resolved.folders).toEqual([]);
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

    it('verifies data/pokemon.json aligns with resolved pokemon_info.json and getSpriteUrl resolves every Reg1-Reg5 sprite', () => {
        const infoByName = new Map();
        const infoByNumId = new Map();
        for (const id of Object.keys(pokemonInfo.pokemon)) {
            const resolved = resolvePokemonEntry(id);
            infoByName.set(resolved.name, resolved);
            const num = Number(id);
            if (!infoByNumId.has(num)) infoByNumId.set(num, resolved);
        }

        for (const p of pokemonJson) {
            const match = infoByName.get(p.name) || infoByNumId.get(p.id);
            expect(match).toBeDefined();
            expect(Number(match.id)).toBe(p.id);
            expect(p.types).toEqual(match.types);
            expect([p.hp, p.atk, p.def, p.spa, p.spd, p.spe]).toEqual(match.stats.slice(0, 6));
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
        const pkm = pokemonInfo.pokemon;
        expect(pkm['0678'].name).toBe('Meowstic');
        expect(pkm['0678.1'].name).toBe('Meowstic (Female)');
        expect(pkm['0678.2'].name).toBe('Meowstic (Mega Meowstic)');
        expect(pkm['0678.1'].moveset).toBeDefined();
        expect(pkm['0678.1'].moveset).not.toEqual(pkm['0678'].moveset);
        expect(pkm['0678.1'].sprite).toBe('Meowstic_Female');
        expect(pkm['0678.1'].folders).toEqual([5, 7, 10]);

        expect(pkm['0876'].name).toBe('Indeedee');
        expect(pkm['0876.1'].name).toBe('Indeedee (Female)');
        expect(pkm['0876.1'].stats).toEqual([70, 55, 65, 95, 105, 85, 475]);
        expect(pkm['0876.1'].stats).not.toEqual(pkm['0876'].stats);
        expect(pkm['0876.1'].moveset).not.toEqual(pkm['0876'].moveset);
        expect(pkm['0876.1'].sprite).toBe('Indeedee_Female');
        expect(pkm['0876.1'].folders).toEqual([7, 10]);

        expect(pkm['0902'].name).toBe('Basculegion');
        expect(pkm['0902.1'].name).toBe('Basculegion (Female)');
        expect(pkm['0902.1'].stats).toEqual([120, 92, 65, 100, 75, 78, 530]);
        expect(pkm['0902.1'].sprite).toBe('Basculegion_Female');
        expect(pkm['0902.1'].folders).toEqual([7, 8, 10]);

        expect(pkm['0916'].name).toBe('Oinkologne');
        expect(pkm['0916.1'].name).toBe('Oinkologne (Female)');
        expect(pkm['0916.1'].stats).toEqual([115, 90, 70, 59, 90, 65, 489]);
        expect(pkm['0916.1'].sprite).toBe('Oinkologne_Female');
        expect(pkm['0916.1'].folders).toEqual([7, 10]);
    });

    it('verifies moves metadata, evolution targets, sorted folder indices, pokedexIndexes coverage, and PNG IHDR dimensions', () => {
        const VALID_CATS = new Set(['Physical', 'Special', 'Status']);
        for (const [moveName, m] of Object.entries(pokemonInfo.moves)) {
            expect(moveName.length).toBeGreaterThan(0);
            expect(VALID_TYPES.has(m.type)).toBe(true);
            expect(VALID_CATS.has(m.cat)).toBe(true);
            expect(typeof m.power).toBe('number');
            expect(m.power).toBeGreaterThanOrEqual(0);
        }

        const pkm = pokemonInfo.pokemon;
        for (const [id, entry] of Object.entries(pkm)) {
            for (let i = 1; i < entry.folders.length; i++) {
                expect(entry.folders[i]).toBeGreaterThan(entry.folders[i - 1]);
            }
            if (entry.evolutions) {
                for (const evo of entry.evolutions) {
                    const targetKey = String(evo.to).padStart(4, '0');
                    expect(pkm[targetKey]).toBeDefined();
                }
            }
        }

        for (const numId of pokedexIndexes.national) {
            expect(pkm[String(numId).padStart(4, '0')]).toBeDefined();
        }
        for (const regList of Object.values(pokedexIndexes.regional)) {
            for (const numId of regList) {
                expect(pkm[String(numId).padStart(4, '0')]).toBeDefined();
            }
        }

        const ihdrBuf = Buffer.alloc(24);
        for (const folder of folders) {
            const dirPath = path.join(SPRITES_DIR, folder);
            for (const file of fs.readdirSync(dirPath)) {
                if (!file.endsWith('.png')) continue;
                const fd = fs.openSync(path.join(dirPath, file), 'r');
                const bytesRead = fs.readSync(fd, ihdrBuf, 0, 24, 0);
                fs.closeSync(fd);
                expect(bytesRead).toBe(24);
                expect(ihdrBuf.subarray(12, 16).toString('ascii')).toBe('IHDR');
                const width = ihdrBuf.readUInt32BE(16);
                const height = ihdrBuf.readUInt32BE(20);
                expect(width).toBeGreaterThan(0);
                expect(height).toBeGreaterThan(0);
            }
        }
    });
});
