const fs = require('fs');
let file = fs.readFileSync('src/ui/backpack/pokemon.js', 'utf8');
// Making the storage slightly wider visually doesn't mean flex value since Active/Storage/Safe are Flex items.
// Active: flex: 1.2, Storage: flex: 2, Safe: flex: 2
