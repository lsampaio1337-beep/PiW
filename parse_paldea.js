const fs = require('fs');

const pokemonData = require('./data/pokemon.json');
const getPokemonId = (name) => {
    let p = pokemonData.find(p => p.name === name);
    if (!p) {
        return null;
    }
    return p.id;
};

// ... Wait, I'll copy the user request from memory ...
