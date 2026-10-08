const fs = require('fs');

const naturalDir = 'Assets/Pokemon Sprites/Natural';
const newNaturalDir = 'Assets/Pokemon Sprites/New Natural';
const cleanDir = 'Assets/Pokemon Sprites/Clean';
const newCleanDir = 'Assets/Pokemon Sprites/New Clean/Gen6';

let newNaturalFiles = fs.readdirSync(newNaturalDir);
const toRenameNatural = [];
for (let file of newNaturalFiles) {
  if (file.startsWith('Gen6_')) {
    const parts = file.replace('Gen6_', '').split('_');
    const id = parseInt(parts[0], 10);
    const isShiny = file.includes('_shiny');
    const newName = isShiny ? `${id}_shiny.png` : `${id}.png`;
    toRenameNatural.push({
      oldPath: `${newNaturalDir}/${file}`,
      newPath: `${naturalDir}/${newName}`
    });
  }
}

let newCleanFiles = fs.readdirSync(newCleanDir);
const toRenameClean = [];
for (let file of newCleanFiles) {
  const parts = file.split('_');
  const id = parseInt(parts[0], 10);
  const isShiny = file.includes('_shiny');
  const newName = isShiny ? `${id}_shiny_Clean.png` : `${id}_Clean.png`;
  toRenameClean.push({
    oldPath: `${newCleanDir}/${file}`,
    newPath: `${cleanDir}/${newName}`
  });
}

const naturalMissing = [];
for (let i = 1; i <= 151; i++) {
   if (!toRenameNatural.find(f => f.newPath === `${naturalDir}/${i}.png`)) naturalMissing.push(i);
   if (!toRenameNatural.find(f => f.newPath === `${naturalDir}/${i}_shiny.png`)) naturalMissing.push(`${i}_shiny`);
}

const cleanMissing = [];
for (let i = 1; i <= 151; i++) {
   if (!toRenameClean.find(f => f.newPath === `${cleanDir}/${i}_Clean.png`)) cleanMissing.push(i);
   if (!toRenameClean.find(f => f.newPath === `${cleanDir}/${i}_shiny_Clean.png`)) cleanMissing.push(`${i}_shiny`);
}

console.log("Natural missing for 1-151:", naturalMissing);
console.log("Clean missing for 1-151:", cleanMissing);
