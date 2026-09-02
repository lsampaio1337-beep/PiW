const fs = require('fs');
let battleJs = fs.readFileSync('src/ui/battle.js', 'utf8');

// I will manually fix TYPE_COLORS reference by removing it from the global window object in shootProjectile,
// and instead using the locally imported TYPE_COLORS map which I'm certain is in battle.js, but since ES modules are weird with window scope,
// wait, `shootProjectile` is exported, and it's called via `window.shootProjectile`. The `TYPE_COLORS` map is imported in battle.js, so `shootProjectile` has access to it via closure.
// Oh, the reviewer said it's never imported. Let's make sure it really is.
console.log(battleJs.includes("import { TYPE_COLORS }"));

// Let's redefine it inside shootProjectile to be safe
const typeColorsMap = `const localTypeColors = {
    "Bug": "#aead56", "Dark": "#636066", "Dragon": "#648abd", "Electric": "#ebc74a",
    "Fairy": "#e09bd4", "Fighting": "#d98251", "Fire": "#da6149", "Flying": "#92add3",
    "Ghost": "#8c769f", "Grass": "#6da862", "Ground": "#b0845f", "Ice": "#76c4c5",
    "Normal": "#a69b93", "Poison": "#af56a7", "Psychic": "#e48194", "Rock": "#a7a7a7",
    "Steel": "#869ba7", "Water": "#6391c7",
};`;

battleJs = battleJs.replace(
    /export function shootProjectile\(attackerSide, moveType, onImpactCallback\) \{[\s\S]*?const color = TYPE_COLORS\[moveType\] \|\| '#ffffff';/g,
    `export function shootProjectile(attackerSide, moveType, onImpactCallback) {
    ${typeColorsMap}
    const color = localTypeColors[moveType] || '#ffffff';`
);

fs.writeFileSync('src/ui/battle.js', battleJs);
console.log('Fixed TYPE_COLORS reference in shootProjectile');
