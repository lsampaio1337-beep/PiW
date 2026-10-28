import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.join(__dirname, '..');

export const loadJsFile = (filepath) => {
    let content = fs.readFileSync(path.join(rootDir, filepath), 'utf8');
    content = content.replace(/export const/g, 'const ')
                     .replace(/export default/g, 'const defaultExport = ')
                     .replace(/import.*?from.*?;/g, '');
    content = content.replace(/export {.*?};/gs, '');

    content += '\nmodule.exports = { ';
    if (filepath.includes('routes.js')) content += 'routes, unlocks';
    else if (filepath.includes('johtoRoutes.js')) content += 'routes: johtoRoutes, unlocks: johtoUnlocks';
    else if (filepath.includes('hoennRoutes.js')) content += 'routes: hoennRoutes, unlocks: hoennUnlocks';
    else if (filepath.includes('sinnohRoutes.js')) content += 'routes: sinnohRoutes, unlocks: sinnohUnlocks';
    else if (filepath.includes('unovaRoutes.js')) content += 'routes: unovaRoutes, unlocks: unovaUnlocks';
    else if (filepath.includes('pokedexIndexes.js')) content += 'pokedexIndexes';
    else if (filepath.includes('gyms.js')) content += 'gyms';
    else if (filepath.includes('mapCoordinates.js') && !filepath.includes('johto') && !filepath.includes('hoenn') && !filepath.includes('sinnoh') && !filepath.includes('unova')) content += 'mapCoordinates';
    else if (filepath.includes('johtoMapCoordinates.js')) content += 'mapCoordinates: johtoMapCoordinates';
    else if (filepath.includes('hoennMapCoordinates.js')) content += 'mapCoordinates: hoennMapCoordinates';
    else if (filepath.includes('sinnohMapCoordinates.js')) content += 'mapCoordinates: sinnohMapCoordinates';
    else if (filepath.includes('unovaMapCoordinates.js')) content += 'mapCoordinates: unovaMapCoordinates';
    content += ' };';

    const module = { exports: {} };
    try {
        eval(content);
    } catch(e) {
        console.error('Error in', filepath, e.message);
    }
    return module.exports;
};

export const pokemonData = JSON.parse(fs.readFileSync(path.join(rootDir, 'data/pokemon.json'), 'utf8'));

export const regionData = {
    Kanto: {
        routesInfo: loadJsFile('config/routes.js'),
        map: loadJsFile('config/mapCoordinates.js').mapCoordinates,
        pokedex: loadJsFile('config/pokedexIndexes.js').pokedexIndexes.regional.kanto,
        id: 1
    },
    Johto: {
        routesInfo: loadJsFile('config/johtoRoutes.js'),
        map: loadJsFile('config/johtoMapCoordinates.js').mapCoordinates,
        pokedex: loadJsFile('config/pokedexIndexes.js').pokedexIndexes.regional.johto,
        id: 2
    },
    Hoenn: {
        routesInfo: loadJsFile('config/hoennRoutes.js'),
        map: loadJsFile('config/hoennMapCoordinates.js').mapCoordinates,
        pokedex: loadJsFile('config/pokedexIndexes.js').pokedexIndexes.regional.hoenn,
        id: 3
    },
    Sinnoh: {
        routesInfo: loadJsFile('config/sinnohRoutes.js'),
        map: loadJsFile('config/sinnohMapCoordinates.js').mapCoordinates,
        pokedex: loadJsFile('config/pokedexIndexes.js').pokedexIndexes.regional.sinnoh,
        id: 4
    },
    Unova: {
        routesInfo: loadJsFile('config/unovaRoutes.js'),
        map: loadJsFile('config/unovaMapCoordinates.js').mapCoordinates,
        pokedex: loadJsFile('config/pokedexIndexes.js').pokedexIndexes.regional.unova,
        id: 5
    }
};

export const gyms = loadJsFile('config/gyms.js').gyms;
