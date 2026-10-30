const fs = require('fs');
const pokemonData = require('./data/pokemon.json');

const getPokemonId = (name) => {
    let p = pokemonData.find(p => p.name === name);
    if (!p) {
        if (name === 'Wo-Chien' || name === 'Wo Chien') return pokemonData.find(p => p.name === 'Wo-Chien').id;
        if (name === 'Ting-Lu' || name === 'Ting Lu') return pokemonData.find(p => p.name === 'Ting-Lu').id;
        if (name === 'Chi-Yu' || name === 'Chi Yu') return pokemonData.find(p => p.name === 'Chi-Yu').id;
        if (name === 'Chien-Pao' || name === 'Chien Pao') return pokemonData.find(p => p.name === 'Chien-Pao').id;

        console.log('not found: ' + name);
        return null;
    }
    return p.id;
};

// ... Wait, actually I can just use string parsing from request.txt if I save it ...
